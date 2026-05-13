"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  drawPreloaderFrame,
  computeEdgeVariation,
  type EdgeVariation,
} from "@/lib/circleGrid";
import { PixelButton } from "@/components/ui/PixelButton";

const MSGS = [
  "Crafting atmosphere...",
  "Shaping space...",
  "Revealing form...",
];
const MSG_H = 27;

type Phase = "loading" | "logo" | "exit";

export function Preloader() {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const rafRef          = useRef<number>(0);
  const t0Ref           = useRef<number>(0);
  const progressRef     = useRef<number>(0);
  const logoHoleRef     = useRef<number>(0);
  const logoHoleRafRef  = useRef<number>(0);
  const edgeVarRef      = useRef<EdgeVariation | null>(null);

  const [visible,            setVisible]          = useState(true);
  const [ready,              setReady]            = useState(false);
  const [progress,           setProgress]         = useState(0);
  const [displayPct,         setDisplayPct]       = useState(0);
  const displayPctRef                             = useRef(0);
  const [msgIdx,             setMsgIdx]           = useState(0);
  const [phase,              setPhase]            = useState<Phase>("loading");
  const [logoExitTransform,  setLogoExitTransform] = useState("");
  const logoWrapRef                               = useRef<HTMLDivElement>(null);

  // ── Skip check: synchronous before first paint ────────────────────────────
  // Initial state is false → SSR renders nothing → no flash on reload.
  // On first visit, setVisible(true) fires before browser paint (useLayoutEffect).
  useLayoutEffect(() => {
    if (
      sessionStorage.getItem("cs-preloader") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // Returning visitor or reduced-motion — hide before paint, fire done event
      setVisible(false);
      window.dispatchEvent(new CustomEvent("cs-preloader-done"));
    }
    // else: first visit — stay visible (initial state is already true)
  }, []);

  // ── Exit ─────────────────────────────────────────────────────────────────
  const exit = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(logoHoleRafRef.current);

    if (logoWrapRef.current) {
      const rect    = logoWrapRef.current.getBoundingClientRect();
      const targetW = Math.min(80, Math.max(58, window.innerWidth * 0.042));
      const scale   = targetW / rect.width;
      const targetH = rect.height * scale;
      const tx = (30 + targetW / 2) - (rect.left + rect.width  / 2);
      const ty = (30 + targetH / 2) - (rect.top  + rect.height / 2);
      setLogoExitTransform(`translate(${tx}px,${ty}px) scale(${scale})`);
    }

    setPhase("exit");
    window.dispatchEvent(new CustomEvent("cs-preloader-done"));
    setTimeout(() => setVisible(false), 1000);
  }, []);

  // ── Hydration guard (canvas needs the DOM) ────────────────────────────────
  useEffect(() => { setReady(true); }, []);

  // ── Smooth monotonic progress counter ────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    let raf: number;
    let cur = displayPctRef.current;
    function loop() {
      const diff = progress - cur;
      cur += diff * 0.10;
      if (cur < displayPctRef.current) cur = displayPctRef.current;
      displayPctRef.current = cur;
      setDisplayPct(cur);
      if (Math.abs(diff) > 0.04) raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progress, visible]);

  // ── Main effect — canvas animation + progress simulation ─────────────────
  useEffect(() => {
    if (!ready || !visible) return;

    sessionStorage.setItem("cs-preloader", "1");

    const canvas  = canvasRef.current!;
    const W       = window.innerWidth;
    const H       = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    t0Ref.current = performance.now();

    edgeVarRef.current = computeEdgeVariation(W, H);

    // ── rAF draw loop ─────────────────────────────────────────────────────
    function frame(now: number) {
      const c  = canvasRef.current;
      const ev = edgeVarRef.current;
      if (!c || !ev) return;

      const ctx  = c.getContext("2d")!;
      const t    = now - t0Ref.current;
      const p    = progressRef.current / 100;

      const offsetX = t * 0.000012;
      const offsetY = -t * 0.000005;

      drawPreloaderFrame(
        ctx, c.width, c.height,
        offsetX, offsetY,
        p,
        c.width / 2, c.height / 2,
        logoHoleRef.current,
        ev,
      );

      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    // ── Progress simulation ───────────────────────────────────────────────
    let pct = 0, done = false;
    function tick() {
      if (done) return;
      const step = pct < 60
        ? Math.random() * 6 + 2
        : pct < 85
        ? Math.random() * 3.5 + 1
        : Math.random() * 1.2 + 0.3;
      pct = Math.min(100, pct + step);
      progressRef.current = pct;
      setProgress(Math.floor(pct));

      if (pct >= 100) {
        done = true;
        setTimeout(() => {
          setPhase("logo");
          const holeStart = performance.now();
          const holeDur   = 700;
          function holeFrame(now: number) {
            const t = Math.min(1, (now - holeStart) / holeDur);
            logoHoleRef.current = 1 - Math.pow(1 - t, 3);
            if (t < 1) logoHoleRafRef.current = requestAnimationFrame(holeFrame);
          }
          logoHoleRafRef.current = requestAnimationFrame(holeFrame);
        }, 300);
        setTimeout(exit, 1900);
      } else {
        setTimeout(tick, 38 + Math.random() * 35);
      }
    }
    setTimeout(tick, 120);

    // ── Message cycling ───────────────────────────────────────────────────
    let mi = 0;
    const msgTimer = setInterval(() => {
      mi = (mi + 1) % MSGS.length;
      setMsgIdx(mi);
    }, 900);

    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(logoHoleRafRef.current);
      clearInterval(msgTimer);
    };
  }, [ready, visible, exit]);

  // null (SSR / pre-layout-effect) and false both hide the component
  if (!visible) return null;

  const isExiting = phase === "exit";
  const isLoading = phase === "loading";
  const isLogo    = phase === "logo";
  const pctStr    = Math.min(100, Math.round(displayPct));

  return (
    <div style={{
      position:      "fixed",
      inset:         0,
      zIndex:        9999,
      overflow:      "hidden",
      maxWidth:      "100vw",
      userSelect:    "none",
      background:    "#F6F5F2",
      opacity:       isExiting ? 0 : 1,
      transition:    isExiting
        ? "opacity 0.55s cubic-bezier(0.77,0,0.175,1) 0.25s"
        : undefined,
      pointerEvents: isExiting ? "none" : "auto",
      willChange:    "opacity",
    }}>
      {/* ── Dot canvas — only after hydration (needs DOM ref) ────────────── */}
      {ready && (
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, display: "block" }}
        />
      )}

      {/* ── Logo — appears in the transparent hole ───────────────────────── */}
      <div style={{
        position:       "absolute",
        inset:          0,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        pointerEvents:  "none",
      }}>
        <div
          ref={logoWrapRef}
          style={{
            display:         "inline-block",
            transformOrigin: "center center",
            willChange:      "transform, opacity",
            opacity:         isExiting ? 0 : isLogo ? 1 : 0,
            filter:          isExiting ? "none" : isLogo ? "blur(0px)" : "blur(18px)",
            transform:       isExiting ? logoExitTransform
              : isLogo ? "scale(1)" : "scale(0.87)",
            transition:      isExiting
              ? "transform 0.85s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease 0.58s, filter 0.3s ease"
              : isLogo
              ? "opacity 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.9s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)"
              : "none",
          }}
        >
          <Image
            src="/LOGO.svg"
            alt="Cloud Stone Studio"
            width={320}
            height={279}
            priority
            style={{ width: "clamp(180px, 16.7vw, 320px)", height: "auto", display: "block" }}
          />
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div style={{
        position:   "absolute",
        top:        30,
        left:       30,
        right:      30,
        height:     10,
        opacity:    isLoading ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: 10, background: "rgba(57,45,43,0.15)",
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0,
          height: "100%", width: `${progress}%`,
          borderRadius: 10, background: "#392D2B",
          transition: "width 0.18s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>

      {/* ── Loading text row ─────────────────────────────────────────────── */}
      <div style={{
        position:       "absolute",
        top:            62,
        left:           30,
        right:          30,
        display:        "flex",
        alignItems:     "flex-end",
        justifyContent: "space-between",
        opacity:        isLoading ? 1 : 0,
        transition:     "opacity 0.3s ease",
      }}>
        <span style={{
          fontFamily: "var(--font-rader)", fontWeight: 700,
          fontSize: "clamp(14px,1.2vw,22px)", lineHeight: 1.2, letterSpacing: "-0.03em",
          textTransform: "uppercase", color: "#392D2B", whiteSpace: "nowrap",
        }}>
          Loading
        </span>

        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", width: "clamp(200px,26vw,500px)", flexShrink: 0,
        }}>
          <div style={{ overflow: "hidden", height: MSG_H, width: "clamp(100px,15vw,260px)", flexShrink: 0 }}>
            <div style={{
              transform:  `translateY(${-msgIdx * MSG_H}px)`,
              transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {MSGS.map((msg) => (
                <div key={msg} style={{
                  height: MSG_H, fontFamily: "var(--font-rader)", fontWeight: 700,
                  fontSize: "clamp(12px,1vw,20px)", lineHeight: `${MSG_H}px`, letterSpacing: "-0.03em",
                  textTransform: "uppercase", color: "#392D2B", whiteSpace: "nowrap",
                }}>
                  {msg}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            flexShrink: 0, width: "clamp(80px,11vw,200px)", height: 26,
            overflow: "visible", display: "flex",
            alignItems: "flex-start", justifyContent: "flex-end",
          }}>
            <span style={{
              fontFamily: "var(--font-rader)", fontWeight: 400,
              fontSize: "clamp(40px,3.6vw,70px)", lineHeight: "90%", letterSpacing: "-0.01em",
              color: "#392D2B", whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
              verticalAlign: "top", display: "block", marginTop: -4,
            }}>
              {pctStr}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Studio name ──────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 42, left: 30,
        opacity: isLoading ? 1 : 0, transition: "opacity 0.3s ease",
      }}>
        <span style={{
          fontFamily: "var(--font-rader)", fontWeight: 700,
          fontSize: 10, letterSpacing: "-0.03em",
          textTransform: "uppercase", color: "#392D2B",
        }}>
          cloud stone studio
        </span>
      </div>

      {/* ── Skip button ──────────────────────────────────────────────────── */}
      <PixelButton
        label="Skip"
        onClick={exit}
        aria-label="Skip intro"
        style={{ position: "absolute", bottom: 30, right: 30 }}
      />
    </div>
  );
}
