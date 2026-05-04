"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

export type TransitionPhase = "idle" | "expand" | "hold" | "contract";

interface TransitionCtx {
  phase: TransitionPhase;
}

const Ctx = createContext<TransitionCtx>({ phase: "idle" });

export const EXPAND_MS = 820;
export const HOLD_MS = 120;
export const CONTRACT_MS = 320;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router      = useRouter();
  const currentPath = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const inFlight    = useRef(false);
  const targetRef   = useRef<string | null>(null);
  const safetyRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When Next.js actually finishes navigation (pathname changes),
  // start contracting — eliminates the "old page briefly visible" bug.
  useEffect(() => {
    if (!inFlight.current || !targetRef.current) return;
    if (currentPath === targetRef.current) {
      targetRef.current = null;
      if (safetyRef.current) clearTimeout(safetyRef.current);
      setPhase("contract");
      setTimeout(() => {
        setPhase("idle");
        inFlight.current = false;
      }, CONTRACT_MS);
    }
  }, [currentPath]);

  const navigateTo = useCallback(
    (href: string) => {
      if (inFlight.current) return;
      const targetPath = href.split(/[?#]/)[0];
      if (targetPath === currentPath) return;

      inFlight.current = true;
      targetRef.current = targetPath;

      setPhase("expand");
      setTimeout(() => {
        router.push(href);
        setPhase("hold");
      }, EXPAND_MS);

      // Safety fallback: if navigation stalls (e.g. network error), clear overlay
      safetyRef.current = setTimeout(() => {
        if (!inFlight.current) return;
        targetRef.current = null;
        setPhase("contract");
        setTimeout(() => {
          setPhase("idle");
          inFlight.current = false;
        }, CONTRACT_MS);
      }, EXPAND_MS + 4000);
    },
    [currentPath, router],
  );

  // Global click interceptor — fires before Next.js Link handler.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href?.startsWith("/")) return;
      if (href.split(/[?#]/)[0] === window.location.pathname) return;
      e.preventDefault();
      navigateTo(href);
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [navigateTo]);

  return <Ctx.Provider value={{ phase }}>{children}</Ctx.Provider>;
}

export function usePageTransition() {
  return useContext(Ctx);
}
