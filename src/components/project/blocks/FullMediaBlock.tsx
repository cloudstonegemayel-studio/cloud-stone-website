"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { FullMediaBlock } from "@/types/blocks";

export function FullMediaBlockView({ block }: { block: FullMediaBlock }) {
  const ref    = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.intersectionRatio >= 0.2) setInView(true); },
      { threshold: [0, 0.2] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {block.media_type === "video" ? (
        <video
          src={block.url}
          poster={block.poster}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: inView ? 1 : 0,
            transition: "opacity 1.2s ease",
          }}
        />
      ) : (
        block.url && (
          <Image
            src={block.url}
            alt={block.alt ?? ""}
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              opacity: inView ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          />
        )
      )}
      {block.overlay && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 1,
        }} />
      )}
    </section>
  );
}
