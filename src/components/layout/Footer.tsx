"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { STRIDE, DOT_R, fbm, gridCols, gridRows, type TrailPoint, TRAIL_MS } from "@/lib/circleGrid";

// ── Phrases ────────────────────────────────────────────────────────────────────
const PHRASES = [
  "Create Wonder",
  "Design with Soul",
  "Beauty in Detail",
  "We Shape Emotion",
  "Crafted with Care",
  "Beyond the Expected",
];

// ── Nav ────────────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/",          label: "Cloud Stone" },
  { href: "/design",    label: "Design"       },
  { href: "/bathrooms", label: "Bathrooms"    },
  { href: "/shop",      label: "Shop"         },
  { href: "/contact",   label: "Contact"      },
] as const;

// ── Icon paths ─────────────────────────────────────────────────────────────────
const MAP_PIN = [
  "M42 20C42 34 24 46 24 46C24 46 6 34 6 20C6 15.2261 7.89642 10.6477 11.2721 7.27208C14.6477 3.89642 19.2261 2 24 2C28.7739 2 33.3523 3.89642 36.7279 7.27208C40.1036 10.6477 42 15.2261 42 20Z",
  "M24 26C27.3137 26 30 23.3137 30 20C30 16.6863 27.3137 14 24 14C20.6863 14 18 16.6863 18 20C18 23.3137 20.6863 26 24 26Z",
];
const PHONE = [
  "M44.0008 33.8402V39.8402C44.0031 40.3972 43.889 40.9485 43.6659 41.4589C43.4427 41.9692 43.1154 42.4274 42.705 42.8039C42.2946 43.1805 41.81 43.4672 41.2823 43.6456C40.7547 43.8241 40.1956 43.8903 39.6408 43.8402C33.4865 43.1715 27.5748 41.0685 22.3808 37.7002C17.5485 34.6295 13.4515 30.5325 10.3808 25.7002C7.0008 20.4826 4.89733 14.5422 4.24084 8.36019C4.19086 7.80713 4.25659 7.24971 4.43384 6.72344C4.61109 6.19717 4.89598 5.71357 5.27037 5.30344C5.64477 4.8933 6.10045 4.56561 6.60842 4.34124C7.1164 4.11686 7.66552 4.00072 8.22084 4.00019H14.2208C15.1915 3.99064 16.1324 4.33435 16.8684 4.96726C17.6043 5.60017 18.085 6.47909 18.2208 7.44019C18.4741 9.36033 18.9437 11.2456 19.6208 13.0602C19.8899 13.776 19.9482 14.554 19.7887 15.302C19.6291 16.0499 19.2586 16.7364 18.7208 17.2802L16.1808 19.8202C19.028 24.8273 23.1738 28.9731 28.1808 31.8202L30.7208 29.2802C31.2646 28.7425 31.9512 28.3719 32.6991 28.2124C33.447 28.0529 34.225 28.1111 34.9408 28.3802C36.7554 29.0573 38.6407 29.5269 40.5608 29.7802C41.5324 29.9173 42.4196 30.4066 43.0539 31.1552C43.6882 31.9038 44.0252 32.8593 44.0008 33.8402Z",
];
const MAIL = [
  "M44 12C44 9.8 42.2 8 40 8H8C5.8 8 4 9.8 4 12M44 12V36C44 38.2 42.2 40 40 40H8C5.8 40 4 38.2 4 36V12M44 12L24 26L4 12",
];
const INSTAGRAM = [
  "M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z",
];
const WHATSAPP = [
  "M21.9775 2H21.9844C24.5857 1.99138 27.1629 2.50073 29.5654 3.49805C31.968 4.49541 34.148 5.96122 35.9785 7.80957L35.9854 7.81641C39.7233 11.5544 41.7803 16.5234 41.7803 21.8242C41.7802 32.7315 32.8849 41.626 21.9775 41.626C18.663 41.6259 15.4057 40.7874 12.5068 39.208L11.8096 38.8281L11.042 39.0293L2.83887 41.1846L5.00977 33.2178L5.22754 32.417L4.81543 31.6973C3.09532 28.6971 2.17578 25.2993 2.17578 21.8018C2.17595 10.8946 11.0704 2.00022 21.9775 2Z",
  "M31.9221 26.3785C31.3721 26.1145 28.6881 24.7945 28.2041 24.5965C27.6981 24.4205 27.3461 24.3325 26.9721 24.8605C26.5981 25.4105 25.5641 26.6425 25.2561 26.9945C24.9481 27.3685 24.6181 27.4125 24.0681 27.1265C23.5181 26.8625 21.7581 26.2685 19.6901 24.4205C18.0621 22.9685 16.9841 21.1865 16.6541 20.6365C16.3461 20.0865 16.6101 19.8005 16.8961 19.5145C17.1381 19.2725 17.4461 18.8765 17.7101 18.5685C17.9741 18.2605 18.0841 18.0185 18.2601 17.6665C18.4361 17.2925 18.3481 16.9845 18.2161 16.7205C18.0841 16.4566 16.9841 13.7726 16.5441 12.6726C16.1041 11.6166 15.6421 11.7486 15.3121 11.7266H14.2561C13.8821 11.7266 13.3101 11.8586 12.8041 12.4086C12.3201 12.9586 10.9121 14.2786 10.9121 16.9625C10.9121 19.6465 12.8701 22.2425 13.1341 22.5945C13.3981 22.9685 16.9841 28.4685 22.4401 30.8225C23.7381 31.3945 24.7501 31.7245 25.5421 31.9665C26.8401 32.3845 28.0281 32.3185 28.9741 32.1865C30.0301 32.0325 32.2081 30.8665 32.6481 29.5905C33.1101 28.3145 33.1101 27.2365 32.9561 26.9945C32.8021 26.7525 32.4721 26.6425 31.9221 26.3785Z",
];

// ── TrimIcon (light variant for dark bg) ──────────────────────────────────────
function TrimIcon({
  paths, href, label, size = 36, viewBox = "0 0 48 48", pathTypes,
}: {
  paths: string[];
  href?: string;
  label?: string;
  size?: number;
  viewBox?: string;
  pathTypes?: ("stroke" | "fill")[];
}) {
  const [hov, setHov] = useState(false);
  const wrap: React.CSSProperties = {
    display: "inline-flex", width: size, height: size,
    position: "relative", flexShrink: 0, cursor: href ? "pointer" : "default",
  };
  const handlers = { onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) };
  const svgs = (
    <>
      <svg width={size} height={size} viewBox={viewBox} fill="none"
        style={{ position: "absolute", inset: 0, opacity: hov ? 0 : 1, transition: "opacity 0.4s ease" }}>
        {paths.map((d, i) =>
          (pathTypes?.[i] ?? "stroke") === "fill"
            ? <path key={i} d={d} fill="#F0EEE9" />
            : <path key={i} d={d} stroke="#F0EEE9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <svg width={size} height={size} viewBox={viewBox} fill="none" style={{ position: "relative" }}>
        {paths.map((d, i) => {
          const type = pathTypes?.[i] ?? "stroke";
          return type === "fill" ? (
            <path key={i} d={d} fill="#C86733"
              style={{ opacity: hov ? 1 : 0, transition: hov ? `opacity 0.85s ease ${i * 0.12}s` : "opacity 0.45s ease-in" }} />
          ) : (
            <path key={i} d={d} stroke="#C86733" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              pathLength="1" strokeDasharray="1" strokeDashoffset={hov ? 0 : 1}
              style={{ transition: hov ? `stroke-dashoffset 0.85s ease ${i * 0.12}s` : "stroke-dashoffset 0.45s ease-in" }} />
          );
        })}
      </svg>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={wrap} {...handlers}>{svgs}</a>;
  return <div style={wrap} {...handlers}>{svgs}</div>;
}

// ── Text mask — which grid cells are inside the phrase text ───────────────────
function buildTextMask(phrase: string, W: number, H: number, COLS: number, ROWS: number): Uint8Array {
  const off = document.createElement("canvas");
  off.width  = Math.max(1, Math.floor(W));
  off.height = Math.max(1, Math.floor(H));
  const ctx = off.getContext("2d");
  if (!ctx) return new Uint8Array(COLS * ROWS);

  // Fit font to ~75% of canvas width
  let fs = H * 0.40;
  ctx.font = `700 ${fs}px "Inter Tight", Arial, sans-serif`;
  const tw = ctx.measureText(phrase).width;
  if (tw > W * 0.78) fs *= (W * 0.78) / tw;
  fs = Math.max(16, Math.min(fs, H * 0.55));

  ctx.font = `700 ${fs}px "Inter Tight", Arial, sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(phrase, W / 2, H / 2);

  const imgData = ctx.getImageData(0, 0, Math.floor(W), Math.floor(H)).data;
  const mask    = new Uint8Array(COLS * ROWS);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cx = Math.round((col + 0.5) * STRIDE);
      const cy = Math.round((row + 0.5) * STRIDE);
      if (cx < W && cy < H) {
        const i = (cy * Math.floor(W) + cx) * 4;
        if (imgData[i + 3] > 60) mask[row * COLS + col] = 1;
      }
    }
  }
  return mask;
}

// ── Footer dot canvas ─────────────────────────────────────────────────────────
// Same dense grid as shop (STRIDE=7.7, DOT_R=3.5), cream colour on dark bg.
// Click → dots inside phrase text light up → auto-dissolve after 3 s → next phrase.
function FooterDotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef  = useRef<TrailPoint[]>([]);
  const rafRef    = useRef<number>(0);

  // Mutable state in a single ref (no re-renders)
  const S = useRef({
    W: 0, H: 0,
    COLS: 0, ROWS: 0,
    mode:      "idle" as "idle" | "forming" | "formed" | "dissolving",
    t:         0,        // 0 = idle, 1 = fully formed
    phraseIdx: 0,
    mask:      null as Uint8Array | null,
    holdTimer: null as ReturnType<typeof setTimeout> | null,
    pausedOffX: 0, pausedOffY: 0,
    prevNow: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s   = S.current;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      s.W = Math.max(1, rect.width);
      s.H = Math.max(1, rect.height);
      s.COLS = gridCols(s.W);
      s.ROWS = gridRows(s.H);
      canvas.width  = Math.floor(s.W * dpr);
      canvas.height = Math.floor(s.H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Rebuild mask if in phrase mode
      if (s.mask) {
        s.mask = buildTextMask(PHRASES[s.phraseIdx], s.W, s.H, s.COLS, s.ROWS);
      }
    };

    // nx/ny helpers (same normalisation as circleGrid)
    const nx = (col: number, offX: number) => col * STRIDE / 1920 * 4.5 + offX;
    const ny = (row: number, offY: number) => row * STRIDE / 1080 * 3.2 + offY;

    const SIGMA  = 90;
    const SIGMA2 = SIGMA * SIGMA;
    const MAX_R2 = SIGMA2 * 12;

    const draw = (now: number) => {
      const dt = Math.min((now - s.prevNow) / 1000, 0.05);
      s.prevNow = now;

      // Advance transition
      if (s.mode === "forming") {
        s.t = Math.min(1, s.t + dt * 1.6);
        if (s.t >= 1) s.mode = "formed";
      } else if (s.mode === "dissolving") {
        s.t = Math.max(0, s.t - dt * 1.3);
        if (s.t <= 0) { s.mode = "idle"; s.mask = null; }
      }

      // Offset: move only in idle/dissolving
      const offX = (s.mode === "idle" || s.mode === "dissolving")
        ? now * 0.000035
        : s.pausedOffX;
      const offY = (s.mode === "idle" || s.mode === "dissolving")
        ? now * 0.000025
        : s.pausedOffY;

      ctx.clearRect(0, 0, s.W, s.H);
      ctx.fillStyle = "#F0EEE9";

      // Alpha tiers for batch draw
      const t008: { cx: number; cy: number }[] = [];
      const t016: { cx: number; cy: number }[] = [];
      const t030: { cx: number; cy: number }[] = [];
      const t055: { cx: number; cy: number }[] = [];
      const t088: { cx: number; cy: number }[] = [];

      const trail  = trailRef.current;
      const tVal   = s.t;
      const mask   = s.mask;

      for (let row = 0; row < s.ROWS; row++) {
        const cy = (row + 0.5) * STRIDE;
        if (cy > s.H + DOT_R) break;

        for (let col = 0; col < s.COLS; col++) {
          const cx = (col + 0.5) * STRIDE;
          if (cx > s.W + DOT_R) break;

          // Noise alpha for idle background (dimmed ×0.40 for dark bg)
          const n        = fbm(nx(col, offX), ny(row, offY));
          const noiseA   = cellAlpha(n) * 0.40;

          // Phrase alpha
          const inText   = mask ? mask[row * s.COLS + col] === 1 : false;
          const phraseA  = inText ? 0.88 : 0.04;

          // Blend
          let a = noiseA + (phraseA - noiseA) * tVal;

          // Cursor dispersion (same as shop)
          for (const tp of trail) {
            const age = (now - tp.t) / TRAIL_MS;
            if (age >= 1) continue;
            const dx = cx - tp.x, dy = cy - tp.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > MAX_R2) continue;
            const disp = Math.exp(-d2 / SIGMA2) * Math.pow(1 - age, 1.5);
            a = Math.max(0, a - disp * a);
          }

          if (a < 0.01) continue;

          if      (a < 0.12) t008.push({ cx, cy });
          else if (a < 0.22) t016.push({ cx, cy });
          else if (a < 0.42) t030.push({ cx, cy });
          else if (a < 0.70) t055.push({ cx, cy });
          else               t088.push({ cx, cy });
        }
      }

      // Batch draw
      const tiers: [number, { cx: number; cy: number }[]][] = [
        [0.08, t008], [0.16, t016], [0.30, t030], [0.55, t055], [0.88, t088],
      ];
      for (const [alpha, batch] of tiers) {
        if (!batch.length) continue;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (const { cx, cy } of batch) {
          ctx.moveTo(cx + DOT_R, cy);
          ctx.arc(cx, cy, DOT_R, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      trailRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });
      if (trailRef.current.length > 24) trailRef.current.shift();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      if (S.current.holdTimer) clearTimeout(S.current.holdTimer);
    };
  }, []);

  const handleClick = () => {
    const s = S.current;
    if (s.holdTimer) { clearTimeout(s.holdTimer); s.holdTimer = null; }

    if (s.mode === "forming" || s.mode === "formed") {
      // Dissolve → advance
      s.mode = "dissolving";
      s.phraseIdx = (s.phraseIdx + 1) % PHRASES.length;
      return;
    }

    // Build mask and start forming
    s.pausedOffX = s.prevNow * 0.000035;
    s.pausedOffY = s.prevNow * 0.000025;
    s.mask = buildTextMask(PHRASES[s.phraseIdx], s.W, s.H, s.COLS, s.ROWS);
    s.mode = "forming";
    s.t    = 0;

    // Auto-dissolve after 3 s
    s.holdTimer = setTimeout(() => {
      s.mode = "dissolving";
      s.phraseIdx = (s.phraseIdx + 1) % PHRASES.length;
      s.holdTimer = null;
    }, 3000);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      aria-hidden
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: "70%",
        cursor: "pointer",
        zIndex: 1,
        display: "block",
      }}
    />
  );
}

// Reuse circleGrid cellAlpha logic (inlined for footer's own alpha tiers)
function cellAlpha(n: number): number {
  if (n < 0.50) return 0;
  if (n < 0.52) return 0.20;
  if (n < 0.54) return 0.40;
  if (n < 0.56) return 0.60;
  if (n < 0.58) return 0.80;
  return 1.00;
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <footer
      id="footer"
      ref={ref}
      style={{
        position: "relative",
        background: "#392D2B",
        height: "min(840px, 100vh)",
        maxHeight: "min(840px, 100vh)",
        borderRadius: "20px 20px 0 0",
        marginTop: -28,
        overflow: "hidden",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.22)",
      }}
    >
      {/* ── Animated dot canvas (top 70%) ─────────────────────────────────── */}
      <FooterDotCanvas />

      {/* ── "click to create" hint ────────────────────────────────────────── */}
      <p style={{
        position: "absolute",
        bottom: "calc(30% + 10px)",
        left: "50%",
        transform: "translateX(-50%)",
        margin: 0,
        fontSize: 8,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(240,238,233,0.18)",
        pointerEvents: "none",
        zIndex: 3,
        whiteSpace: "nowrap",
      }}>
        click to create
      </p>

      {/* ── Nav links (top-left, z above canvas) ─────────────────────────── */}
      <nav
        aria-label="Footer navigation"
        style={{
          position: "absolute",
          top: 30, left: 30,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV.map(({ href, label }, i) => (
          <Link key={href} href={href} style={{
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
            fontWeight: 600, fontSize: 9,
            letterSpacing: "1.17px",
            textTransform: "uppercase",
            color: "#F0EEE9",
            textDecoration: "none",
            padding: "5px 0",
            display: "block",
            whiteSpace: "nowrap",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: `opacity 0.6s ease ${i * 60}ms, transform 0.6s ease ${i * 60}ms`,
          }}>
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Contact info (top-right) ──────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: 30, right: 30,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        alignItems: "flex-end",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
            fontWeight: 400, fontSize: 16, lineHeight: 1.2, color: "#F0EEE9", whiteSpace: "nowrap",
          }}>Brooklyn, NY 11249</span>
          <TrimIcon paths={MAP_PIN} label="Location" size={32} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-end" }}>
          <TrimIcon href="tel:+16462728208"                        label="Phone"     paths={PHONE}     />
          <TrimIcon href="mailto:antonio@cloudstonestudio.com"    label="Email"     paths={MAIL}      />
          <TrimIcon href="https://instagram.com/cloudstonestudio" label="Instagram" paths={INSTAGRAM} />
          <TrimIcon href="https://wa.me/16462728208"               label="WhatsApp"  paths={WHATSAPP}
            pathTypes={["stroke", "fill"]} viewBox="0 0 44 44" />
        </div>
      </div>

      {/* ── Giant "Cloud Stone Studio" ────────────────────────────────────── */}
      <p style={{
        position: "absolute",
        bottom: 52,
        left: "50%",
        transform: "translateX(-50%)",
        margin: 0,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-rader,'PP Rader',serif)",
        fontWeight: 500,
        fontSize: "clamp(38px, 11.35vw, 218px)",
        letterSpacing: "-0.03em",
        lineHeight: 0.75,
        textTransform: "uppercase",
        color: "#F0EEE9",
        zIndex: 5,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.9s ease 0.4s",
      }}>
        Cloud Stone Studio
      </p>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 50,
        padding: "0 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(240,238,233,0.10)",
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: "var(--font-rader,'PP Rader',serif)",
          fontWeight: 700, fontSize: 10, letterSpacing: "-0.3px",
          textTransform: "uppercase", color: "#F0EEE9",
        }}>
          © cloudstonestudio.com 2026
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {([
            { href: "/privacy-policy", label: "Privacy Policy"   },
            { href: "/terms",          label: "Terms of Service" },
          ] as const).map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontFamily: "var(--font-rader,'PP Rader',serif)",
              fontWeight: 700, fontSize: 10, letterSpacing: "-0.3px",
              textTransform: "uppercase", color: "rgba(240,238,233,0.5)",
              textDecoration: "none",
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
