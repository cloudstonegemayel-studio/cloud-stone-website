"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top  = `${e.clientY}px`;
      el.classList.add("cs-cur--on");
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      // Hide on elements that have their own custom cursor (e.g. bathrooms section)
      const hide = !!t.closest("[data-custom-cursor]");
      el.classList.toggle("cs-cur--hide",  hide);
      const hover = !hide && !!t.closest(
        "a, button, [role='button'], [role='link'], input, select, textarea, label, [tabindex]:not([tabindex='-1'])"
      );
      el.classList.toggle("cs-cur--hover", hover);
    };

    const onDown  = () => el.classList.add("cs-cur--press");
    const onUp    = () => el.classList.remove("cs-cur--press");
    const onLeave = () => el.classList.remove("cs-cur--on");

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mouseover",  onOver,  { passive: true });
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Outer div: zero-size positioning anchor (left/top updated via JS)
  // Inner span: the visible circle with blend-mode and pulse
  return (
    <div ref={ref} aria-hidden className="cs-cur">
      <span className="cs-cur-dot" />
    </div>
  );
}
