"use client";

import { usePageTransition } from "@/lib/transitionContext";

const CLOUD_PATH =
  "M122.019 76.4797C122.019 76.4797 110.689 103.322 82.3635 103.322C55.4543 104.6 42.7078 79.0361 42.7078 79.0361C42.7078 79.0361 12.966 90.54 1.63565 64.9758C-5.72901 48.3591 13.6302 31.7425 22.8798 31.7425C22.8798 31.7425 26.3453 16.404 42.7078 12.5694C59.0703 8.7348 73.0052 16.178 72.4496 17.6822C71.895 19.1839 82.3635 -5.32548 107.856 1.06552C130.517 6.74647 130.517 29.1861 130.517 29.1861C130.517 29.1861 174.421 22.795 170.173 59.863C161.675 94.3745 122.019 76.4797 122.019 76.4797Z";

const CLOUD_LAYERS = [
  { color: "#B7D1EA", delay: "0ms" },
  { color: "#DDE7EF", delay: "240ms" },
  { color: "#F6F5F2", delay: "480ms" },
] as const;

export function PageTransitionOverlay() {
  const { phase } = usePageTransition();
  const active = phase !== "idle";
  const filled = phase === "expand" || phase === "hold" || phase === "contract";

  return (
    <div
      className="page-transition-clouds"
      aria-hidden="true"
      data-phase={phase}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: active ? "auto" : "none",
        overflow: "hidden",
        opacity: active ? 1 : 0,
        transition: "opacity 260ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {CLOUD_LAYERS.map((layer) => (
        <svg
          className="page-transition-cloud"
          key={layer.color}
          viewBox="0 0 171 104"
          fill="none"
          style={{
            color: layer.color,
            transitionDelay: filled ? layer.delay : "0ms",
            transform: filled ? "translate(-50%, -50%) scale(35)" : "translate(-50%, -50%) scale(0.08)",
          }}
        >
          <path d={CLOUD_PATH} fill="currentColor" />
        </svg>
      ))}

      <style jsx global>{`
        .page-transition-cloud {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 171px;
          height: 104px;
          transform-origin: 50% 50%;
          will-change: transform;
          transition-property: transform;
          transition-duration: 920ms;
          transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
        }

        .page-transition-clouds[data-phase="contract"] .page-transition-cloud {
          transition-duration: 560ms;
          transition-delay: 0ms !important;
        }
      `}</style>
    </div>
  );
}
