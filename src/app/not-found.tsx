"use client";

import { useState, useEffect } from "react";
import { PixelButton } from "@/components/ui/PixelButton";

const LINE1 = "Oops! We can't find";
const LINE2 = "this page";

export default function NotFound() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 150);
    return () => clearTimeout(t);
  }, []);

  const chars1  = LINE1.split("");
  const chars2  = LINE2.split("");
  const n1      = chars1.length;

  return (
    <section
      aria-label="Page not found"
      style={{
        minHeight:      "100vh",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        background:     "#F6F5F2",
        padding:        "40px 30px",
        textAlign:      "center",
        position:       "relative",
        overflow:       "hidden",
      }}
    >
      {/* ── "404" with animated stone-texture mask ──────────────────── */}
      <div
        aria-hidden
        style={{
          position:             "absolute",
          right:                0,
          bottom:               0,
          fontFamily:           "var(--font-rader)",
          fontWeight:           500,
          fontSize:             "clamp(120px,22vw,360px)",
          lineHeight:           0.9,
          paddingTop:           50,
          letterSpacing:        "-0.04em",
          backgroundImage:      "url('/images/stone.png')",
          backgroundClip:       "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          color:                "transparent",
          backgroundSize:       "260% 300%",
          animation:            on ? "stone-drift 12s ease-in-out 0s infinite alternate" : "none",
          userSelect:           "none",
          opacity:              on ? 1 : 0,
          transition:           "opacity 0.9s",
          marginBottom:         0,
        }}
      >
        404
      </div>

      {/* ── Char-blur reveal headline ────────────────────────────────── */}
      <div
        style={{
          fontFamily:    "var(--font-rader)",
          fontSize:      "clamp(22px,3.2vw,52px)",
          lineHeight:    0.95,
          letterSpacing: "-0.025em",
          marginBottom:  20,
        }}
      >
        {/* Line 1 — mole */}
        <div style={{ color: "#392D2B" }}>
          {chars1.map((ch, i) => (
            <span
              key={i}
              style={{
                display:    "inline-block",
                whiteSpace: "pre",
                opacity:    on ? 1 : 0,
                filter:     on ? "blur(0px)" : "blur(6px)",
                transform:  on ? "translateY(0)" : "translateY(5px)",
                transition: `
                  opacity   .6s cubic-bezier(.16,1,.3,1) ${i * 20}ms,
                  filter    .6s cubic-bezier(.16,1,.3,1) ${i * 20}ms,
                  transform .6s cubic-bezier(.16,1,.3,1) ${i * 20}ms
                `,
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Line 2 — burnt orange */}
        <div style={{ color: "#C86733" }}>
          {chars2.map((ch, i) => (
            <span
              key={i}
              style={{
                display:    "inline-block",
                whiteSpace: "pre",
                opacity:    on ? 1 : 0,
                filter:     on ? "blur(0px)" : "blur(6px)",
                transform:  on ? "translateY(0)" : "translateY(5px)",
                transition: `
                  opacity   .6s cubic-bezier(.16,1,.3,1) ${(n1 + i) * 20 + 80}ms,
                  filter    .6s cubic-bezier(.16,1,.3,1) ${(n1 + i) * 20 + 80}ms,
                  transform .6s cubic-bezier(.16,1,.3,1) ${(n1 + i) * 20 + 80}ms
                `,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────────── */}
      <p
        style={{
          fontFamily:  "var(--font-sans)",
          fontSize:    14,
          color:       "rgba(57,45,43,0.5)",
          lineHeight:  1.7,
          maxWidth:    360,
          marginBottom: 36,
          opacity:     on ? 1 : 0,
          transition:  "opacity 0.8s ease 0.8s",
        }}
      >
        The page you&apos;re looking for may have been moved, renamed, or doesn&apos;t exist.
      </p>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div style={{ opacity: on ? 1 : 0, transition: "opacity 0.8s ease 1s" }}>
        <PixelButton label="Back to home" href="/" />
      </div>
    </section>
  );
}
