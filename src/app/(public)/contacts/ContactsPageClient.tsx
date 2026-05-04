"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { drawFrame, type TrailPoint, TRAIL_MS } from "@/lib/circleGrid";

export function ContactsPageClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef  = useRef<TrailPoint[]>([]);
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      trailRef.current = trailRef.current.filter(p => now - p.t < TRAIL_MS);
      drawFrame(ctx, W, H, now * 0.000035, now * 0.000025, trailRef.current, now);
      rafRef.current = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      trailRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });
      if (trailRef.current.length > 24) trailRef.current.shift();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      aria-label="Contacts"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F6F5F2",
        overflow: "hidden",
      }}
    >
      {/* Dot canvas background */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          width: "100%", height: "100%", pointerEvents: "none",
        }}
      />

      {/* Logo centered */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: 1,
        paddingTop: 80,
        paddingBottom: 40,
      }}>
        <Image
          src="/LOGO.svg"
          alt="Cloud Stone Studio"
          width={280}
          height={244}
          priority
          style={{ width: "clamp(160px, 14.6vw, 280px)", height: "auto" }}
        />
      </div>
    </section>
  );
}
