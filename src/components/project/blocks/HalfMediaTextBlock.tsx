"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { HalfMediaTextBlock } from "@/types/blocks";

export function HalfMediaTextBlockView({ block }: { block: HalfMediaTextBlock }) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.intersectionRatio >= 0.4) setInView(true); },
      { threshold: [0, 0.4] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setTextVisible(true), 800);
    return () => clearTimeout(t);
  }, [inView]);

  const isDark  = block.bg === "dark";
  const bg      = isDark ? "#392D2B" : "#F0EEE9";
  const textCol = isDark ? "#F0EEE9" : "#392D2B";

  const mediaSide = (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {block.media_type === "video" ? (
        <video
          src={block.url}
          poster={block.poster}
          autoPlay muted loop playsInline
          style={{
            position: "absolute", inset: "-10%",
            width: "120%", height: "120%",
            objectFit: "cover",
            transform: inView ? "translateY(0)" : "translateY(60px)",
            opacity: inView ? 1 : 0,
            transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 1.2s ease",
          }}
        />
      ) : (
        block.url && (
          <div style={{
            position: "absolute", inset: "-10%",
            transform: inView ? "translateY(0)" : "translateY(60px)",
            opacity: inView ? 1 : 0,
            transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 1.2s ease",
          }}>
            <Image
              src={block.url}
              alt={block.alt ?? ""}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
        )
      )}
    </div>
  );

  const textSide = (
    <div style={{
      background: bg,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: "clamp(30px,3.5vw,60px) clamp(20px,1.56vw,30px)",
    }}>
      {block.heading && (
        <h3 style={{
          margin: "0 0 16px",
          fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
          fontWeight: 400,
          fontSize: "clamp(22px,2.5vw,48px)",
          lineHeight: 0.95,
          color: textCol,
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.9s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {block.heading}
        </h3>
      )}
      {block.body && (
        <p style={{
          margin: 0,
          fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
          fontSize: "clamp(11px,1.04vw,20px)",
          lineHeight: 1.5,
          color: textCol,
          maxWidth: 420,
          opacity: textVisible ? 1 : 0,
          transition: "opacity 0.9s ease 0.2s",
        }}>
          {block.body}
        </p>
      )}
    </div>
  );

  const mediaLeft = block.media_side === "left";

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: 600,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        overflow: "hidden",
        contain: "layout",
      }}
    >
      {mediaLeft ? mediaSide : textSide}
      {mediaLeft ? textSide  : mediaSide}
    </section>
  );
}
