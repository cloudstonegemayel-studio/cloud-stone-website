"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SplitDetailBlock } from "@/types/blocks";

const DARK  = "#392D2B";
const LIGHT = "#F0EEE9";
const SURFACE = "#F0EEE9";

function useBlockInView() {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.intersectionRatio >= 0.4) setInView(true); },
      { threshold: [0, 0.4, 0.8] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

export function SplitDetailBlockView({ block }: { block: SplitDetailBlock }) {
  const [sectionRef, inView] = useBlockInView();
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setTextVisible(true), 1300);
    return () => clearTimeout(t);
  }, [inView]);

  const isDark   = block.bg === "dark";
  const imgRight = block.layout === "image_right";
  const bg       = isDark ? DARK : LIGHT;
  const textCol  = isDark ? SURFACE : DARK;

  const leftPanel = (
    <div style={{
      background: bg,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "clamp(20px,1.56vw,30px)",
      position: "relative",
      minHeight: "50vh",
      overflow: "hidden",
    }}>
      {/* Small photo */}
      {block.small_image && (
        <div style={{ overflow: "hidden" }}>
          <div style={{
            position: "relative",
            width: "18.5vw",
            height: "clamp(200px,41vh,445px)",
            transform: inView ? "translateY(0)" : "translateY(80px)",
            opacity: inView ? 1 : 0,
            transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 1.2s cubic-bezier(0.16,1,0.3,1)",
          }}>
            <Image
              src={block.small_image}
              alt=""
              fill
              sizes="(max-width:768px) 55vw, 19vw"
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        </div>
      )}
      {/* Captions */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginTop: "auto" }}>
        {[block.caption1, block.caption2].map((cap, i) => (
          <p key={i} style={{
            margin: 0,
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
            fontSize: "clamp(10px,1.04vw,20px)",
            lineHeight: 1.2,
            color: textCol,
            flex: 1,
            opacity: textVisible ? 1 : 0,
            transition: "opacity 0.9s ease",
          }}>
            {cap}
          </p>
        ))}
      </div>
    </div>
  );

  const rightPanel = (
    <div style={{ overflow: "hidden", position: "relative", minHeight: "50vh" }}>
      {block.big_image && (
        <div style={{
          position: "absolute",
          inset: "-10%",
	minHeight: "50vh",
          transform: inView ? "translateY(0)" : "translateY(80px)",
          opacity: inView ? 1 : 0,
          transition: "transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}>
          <Image
            src={block.big_image}
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        </div>
      )}
    </div>
  );

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] h-screen overflow-hidden relative w-full"
      {...(isDark ? { "data-nav-dark": "" } : {})}
    >
      {imgRight ? leftPanel : rightPanel}
      {imgRight ? rightPanel : leftPanel}

      <style jsx global>{`
        @media (max-width: 768px) {
          .block-split-section {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: unset !important;
          }
        }
      `}</style>
    </section>
  );
}
