"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Phrases for dot animation ─────────────────────────────────────────────────
const PHRASES = [
  "Create Wonder",
  "Design with Soul",
  "Beauty in Detail",
  "We Shape Emotion",
  "Crafted with Care",
  "Beyond the Expected",
];

// ── Nav links ─────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/",          label: "Cloud Stone" },
  { href: "/design",    label: "Design"       },
  { href: "/bathrooms", label: "Bathrooms"    },
  { href: "/shop",      label: "Shop"         },
  { href: "/contact",   label: "Contact"      },
] as const;

// ── Icon SVG paths ────────────────────────────────────────────────────────────
const MAP_PIN_PATHS = [
  "M42 20C42 34 24 46 24 46C24 46 6 34 6 20C6 15.2261 7.89642 10.6477 11.2721 7.27208C14.6477 3.89642 19.2261 2 24 2C28.7739 2 33.3523 3.89642 36.7279 7.27208C40.1036 10.6477 42 15.2261 42 20Z",
  "M24 26C27.3137 26 30 23.3137 30 20C30 16.6863 27.3137 14 24 14C20.6863 14 18 16.6863 18 20C18 23.3137 20.6863 26 24 26Z",
];
const PHONE_PATHS = [
  "M44.0008 33.8402V39.8402C44.0031 40.3972 43.889 40.9485 43.6659 41.4589C43.4427 41.9692 43.1154 42.4274 42.705 42.8039C42.2946 43.1805 41.81 43.4672 41.2823 43.6456C40.7547 43.8241 40.1956 43.8903 39.6408 43.8402C33.4865 43.1715 27.5748 41.0685 22.3808 37.7002C17.5485 34.6295 13.4515 30.5325 10.3808 25.7002C7.0008 20.4826 4.89733 14.5422 4.24084 8.36019C4.19086 7.80713 4.25659 7.24971 4.43384 6.72344C4.61109 6.19717 4.89598 5.71357 5.27037 5.30344C5.64477 4.8933 6.10045 4.56561 6.60842 4.34124C7.1164 4.11686 7.66552 4.00072 8.22084 4.00019H14.2208C15.1915 3.99064 16.1324 4.33435 16.8684 4.96726C17.6043 5.60017 18.085 6.47909 18.2208 7.44019C18.4741 9.36033 18.9437 11.2456 19.6208 13.0602C19.8899 13.776 19.9482 14.554 19.7887 15.302C19.6291 16.0499 19.2586 16.7364 18.7208 17.2802L16.1808 19.8202C19.028 24.8273 23.1738 28.9731 28.1808 31.8202L30.7208 29.2802C31.2646 28.7425 31.9512 28.3719 32.6991 28.2124C33.447 28.0529 34.225 28.1111 34.9408 28.3802C36.7554 29.0573 38.6407 29.5269 40.5608 29.7802C41.5324 29.9173 42.4196 30.4066 43.0539 31.1552C43.6882 31.9038 44.0252 32.8593 44.0008 33.8402Z",
];
const MAIL_PATHS = [
  "M44 12C44 9.8 42.2 8 40 8H8C5.8 8 4 9.8 4 12M44 12V36C44 38.2 42.2 40 40 40H8C5.8 40 4 38.2 4 36V12M44 12L24 26L4 12",
];
const INSTAGRAM_PATHS = [
  "M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z",
];
const WHATSAPP_PATHS = [
  "M21.9775 2H21.9844C24.5857 1.99138 27.1629 2.50073 29.5654 3.49805C31.968 4.49541 34.148 5.96122 35.9785 7.80957L35.9854 7.81641C39.7233 11.5544 41.7803 16.5234 41.7803 21.8242C41.7802 32.7315 32.8849 41.626 21.9775 41.626C18.663 41.6259 15.4057 40.7874 12.5068 39.208L11.8096 38.8281L11.042 39.0293L2.83887 41.1846L5.00977 33.2178L5.22754 32.417L4.81543 31.6973C3.09532 28.6971 2.17578 25.2993 2.17578 21.8018C2.17595 10.8946 11.0704 2.00022 21.9775 2Z",
  "M31.9221 26.3785C31.3721 26.1145 28.6881 24.7945 28.2041 24.5965C27.6981 24.4205 27.3461 24.3325 26.9721 24.8605C26.5981 25.4105 25.5641 26.6425 25.2561 26.9945C24.9481 27.3685 24.6181 27.4125 24.0681 27.1265C23.5181 26.8625 21.7581 26.2685 19.6901 24.4205C18.0621 22.9685 16.9841 21.1865 16.6541 20.6365C16.3461 20.0865 16.6101 19.8005 16.8961 19.5145C17.1381 19.2725 17.4461 18.8765 17.7101 18.5685C17.9741 18.2605 18.0841 18.0185 18.2601 17.6665C18.4361 17.2925 18.3481 16.9845 18.2161 16.7205C18.0841 16.4566 16.9841 13.7726 16.5441 12.6726C16.1041 11.6166 15.6421 11.7486 15.3121 11.7266H14.2561C13.8821 11.7266 13.3101 11.8586 12.8041 12.4086C12.3201 12.9586 10.9121 14.2786 10.9121 16.9625C10.9121 19.6465 12.8701 22.2425 13.1341 22.5945C13.3981 22.9685 16.9841 28.4685 22.4401 30.8225C23.7381 31.3945 24.7501 31.7245 25.5421 31.9665C26.8401 32.3845 28.0281 32.3185 28.9741 32.1865C30.0301 32.0325 32.2081 30.8665 32.6481 29.5905C33.1101 28.3145 33.1101 27.2365 32.9561 26.9945C32.8021 26.7525 32.4721 26.6425 31.9221 26.3785Z",
];

// ── TrimIcon — light variant for dark background ───────────────────────────────
function TrimIcon({
  paths, href, label, size = 48, viewBox = "0 0 48 48",
  pathTypes,
}: {
  paths: string[];
  href?: string;
  label?: string;
  size?: number;
  viewBox?: string;
  pathTypes?: ("stroke" | "fill")[];
}) {
  const [hov, setHov] = useState(false);
  const wrapStyle: React.CSSProperties = {
    display: "inline-flex", width: size, height: size,
    position: "relative", flexShrink: 0, cursor: href ? "pointer" : "default",
  };
  const handlers = {
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
  };
  const svgs = (
    <>
      {/* Static layer — default cloud-dancer color */}
      <svg width={size} height={size} viewBox={viewBox} fill="none"
        style={{ position: "absolute", inset: 0, opacity: hov ? 0 : 1, transition: "opacity 0.4s ease" }}>
        {paths.map((d, i) =>
          (pathTypes?.[i] ?? "stroke") === "fill"
            ? <path key={i} d={d} fill="#F0EEE9" />
            : <path key={i} d={d} stroke="#F0EEE9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {/* Animated layer — orange on hover with trim-path */}
      <svg width={size} height={size} viewBox={viewBox} fill="none" style={{ position: "relative" }}>
        {paths.map((d, i) => {
          const type = pathTypes?.[i] ?? "stroke";
          return type === "fill" ? (
            <path key={i} d={d} fill="#C86733"
              style={{
                opacity: hov ? 1 : 0,
                transition: hov ? `opacity 0.85s ease ${i * 0.12}s` : "opacity 0.45s ease-in",
              }} />
          ) : (
            <path key={i} d={d} stroke="#C86733" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              pathLength="1" strokeDasharray="1"
              strokeDashoffset={hov ? 0 : 1}
              style={{
                transition: hov
                  ? `stroke-dashoffset 0.85s ease ${i * 0.12}s`
                  : "stroke-dashoffset 0.45s ease-in",
              }} />
          );
        })}
      </svg>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
        style={wrapStyle} {...handlers}>{svgs}</a>
    );
  }
  return <div style={wrapStyle} {...handlers}>{svgs}</div>;
}

// ── Particle type ─────────────────────────────────────────────────────────────
interface Dot {
  x: number; y: number;
  vx: number; vy: number;
  tx: number | null;
  ty: number | null;
  r: number;
  phase: number;
}

// ── Sample text pixels from offscreen canvas ──────────────────────────────────
function sampleTextPixels(
  phrase: string, w: number, h: number, n: number,
): Array<{ x: number; y: number }> {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(w));
  off.height = Math.max(1, Math.floor(h));
  const ctx = off.getContext("2d");
  if (!ctx) return [];

  let fs = h * 0.38;
  ctx.font = `600 ${fs}px "Inter Tight", Arial, sans-serif`;
  let tw = ctx.measureText(phrase).width;
  if (tw > w * 0.78) fs *= (w * 0.78) / tw;
  fs = Math.max(24, fs);

  ctx.font = `600 ${fs}px "Inter Tight", Arial, sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(phrase, w / 2, h / 2);

  const data = ctx.getImageData(0, 0, Math.floor(w), Math.floor(h)).data;
  const pts: Array<{ x: number; y: number }> = [];
  const step = Math.max(4, Math.floor(Math.sqrt((w * h) / (n * 1.5))));

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (Math.floor(y) * Math.floor(w) + Math.floor(x)) * 4;
      if (data[i + 3] > 100) pts.push({ x: x + Math.random() * step * 0.5, y: y + Math.random() * step * 0.5 });
    }
  }

  // Shuffle and trim to n
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts.slice(0, n);
}

// ── FooterDotCanvas ───────────────────────────────────────────────────────────
function FooterDotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef   = useRef<Dot[]>([]);
  const modeRef   = useRef<{
    mode: "idle" | "gather" | "scatter";
    phraseIdx: number;
    timer: ReturnType<typeof setTimeout> | null;
    w: number; h: number;
  }>({ mode: "idle", phraseIdx: 0, timer: null, w: 0, h: 0 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const m = modeRef.current;

    const initDots = () => {
      const n = Math.min(480, Math.max(80, Math.floor(m.w * m.h / 2400)));
      dotsRef.current = Array.from({ length: n }, () => ({
        x: Math.random() * m.w, y: Math.random() * m.h,
        vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
        tx: null, ty: null,
        r: 1.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      m.w = Math.max(1, rect.width);
      m.h = Math.max(1, rect.height);
      canvas.width  = Math.floor(m.w * dpr);
      canvas.height = Math.floor(m.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (dotsRef.current.length === 0) initDots();
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, m.w, m.h);
      ctx.fillStyle = "#F0EEE9";

      for (const p of dotsRef.current) {
        let alpha: number;

        if (p.tx !== null) {
          const dx = p.tx - p.x, dy = p.ty! - p.y;
          p.vx = p.vx * 0.78 + dx * 0.11;
          p.vy = p.vy * 0.78 + dy * 0.11;
          p.x += p.vx;
          p.y += p.vy;
          const dist = Math.hypot(dx, dy);
          alpha = 0.18 + 0.82 * Math.max(0, 1 - dist / 90);
        } else {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
          p.vx *= 0.975;
          p.vy *= 0.975;
          p.x  += p.vx;
          p.y  += p.vy;
          if (p.x < 0) p.x += m.w; else if (p.x > m.w) p.x -= m.w;
          if (p.y < 0) p.y += m.h; else if (p.y > m.h) p.y -= m.h;
          alpha = 0.07 + 0.06 * Math.sin(now * 0.0008 + p.phase);
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      if (modeRef.current.timer) clearTimeout(modeRef.current.timer);
    };
  }, []);

  const handleClick = () => {
    const m = modeRef.current;
    const dots = dotsRef.current;
    if (!dots.length) return;

    if (m.timer) { clearTimeout(m.timer); m.timer = null; }

    if (m.mode === "gather") {
      // Scatter → next phrase
      for (const p of dots) {
        p.tx = null; p.ty = null;
        p.vx = (Math.random() - 0.5) * 5;
        p.vy = (Math.random() - 0.5) * 5;
      }
      m.mode = "scatter";
      m.phraseIdx = (m.phraseIdx + 1) % PHRASES.length;
      m.timer = setTimeout(() => { m.mode = "idle"; m.timer = null; }, 900);
    } else {
      // Gather current phrase
      const targets = sampleTextPixels(PHRASES[m.phraseIdx], m.w, m.h, dots.length);
      if (!targets.length) return;

      // Shuffle dots for random assignment
      for (let i = dots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dots[i], dots[j]] = [dots[j], dots[i]];
      }
      dots.forEach((p, i) => {
        if (i < targets.length) { p.tx = targets[i].x; p.ty = targets[i].y; }
        else { p.tx = null; p.ty = null; }
      });
      m.mode = "gather";

      // Auto-scatter after 3s
      m.timer = setTimeout(() => {
        for (const p of dots) {
          p.tx = null; p.ty = null;
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = (Math.random() - 0.5) * 4;
        }
        m.mode = "scatter";
        m.phraseIdx = (m.phraseIdx + 1) % PHRASES.length;
        m.timer = setTimeout(() => { m.mode = "idle"; m.timer = null; }, 900);
      }, 3000);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      aria-hidden
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%",
        height: "70%",
        cursor: "pointer",
        zIndex: 1,
        display: "block",
      }}
    />
  );
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

  const navStyle: React.CSSProperties = {
    fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
    fontWeight: 600,
    fontSize: 9,
    letterSpacing: "1.17px",
    textTransform: "uppercase",
    color: "#F0EEE9",
    textDecoration: "none",
    padding: "5px 0",
    display: "block",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(10px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
    whiteSpace: "nowrap",
  };

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
        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
      }}
    >
      {/* ── Animated dot canvas (top 70%) ──────────────────────────────────── */}
      <FooterDotCanvas />

      {/* ── Click hint (fades after first interaction) ─────────────────────── */}
      <div style={{
        position: "absolute",
        bottom: "calc(30% + 14px)",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 8,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "rgba(240,238,233,0.22)",
        pointerEvents: "none",
        zIndex: 3,
        whiteSpace: "nowrap",
      }}>
        click to create
      </div>

      {/* ── Nav links (top-left) ───────────────────────────────────────────── */}
      <nav
        aria-label="Footer navigation"
        style={{
          position: "absolute",
          top: 30, left: 30,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pointerEvents: "all",
        }}
      >
        {NAV.map(({ href, label }, i) => (
          <Link
            key={href}
            href={href}
            style={{
              ...navStyle,
              transitionDelay: `${i * 60}ms`,
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Contact icons (top-right) ──────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: 30, right: 30,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 30,
        alignItems: "flex-end",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
      }}>
        {/* Address row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
            fontWeight: 400, fontSize: 16, lineHeight: 1.2, color: "#F0EEE9",
            whiteSpace: "nowrap",
          }}>
            Brooklyn, NY 11249
          </span>
          <TrimIcon paths={MAP_PIN_PATHS} label="Location" size={36} />
        </div>

        {/* Icons column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "flex-end" }}>
          <TrimIcon href="tel:+16462728208"            label="Phone"     paths={PHONE_PATHS}     size={36} />
          <TrimIcon href="mailto:antonio@cloudstonestudio.com" label="Email" paths={MAIL_PATHS} size={36} />
          <TrimIcon href="https://instagram.com/cloudstonestudio" label="Instagram" paths={INSTAGRAM_PATHS} size={36} />
          <TrimIcon href="https://wa.me/16462728208"   label="WhatsApp"  paths={WHATSAPP_PATHS}  size={36}
            pathTypes={["stroke", "fill"]} viewBox="0 0 44 44" />
        </div>
      </div>

      {/* ── Giant display text ─────────────────────────────────────────────── */}
      <p style={{
        position: "absolute",
        bottom: 52,
        left: "50%",
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-rader,'PP Rader',serif)",
        fontWeight: 500,
        fontSize: "clamp(40px, 11.35vw, 218px)",
        letterSpacing: "-0.03em",
        lineHeight: 0.75,
        textTransform: "uppercase",
        color: "#F0EEE9",
        margin: 0,
        zIndex: 5,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.9s ease 0.35s",
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
        borderTop: "1px solid rgba(240,238,233,0.12)",
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
          {[
            { href: "/privacy-policy", label: "Privacy Policy"    },
            { href: "/terms",          label: "Terms of Service"  },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontFamily: "var(--font-rader,'PP Rader',serif)",
              fontWeight: 700, fontSize: 10, letterSpacing: "-0.3px",
              textTransform: "uppercase", color: "rgba(240,238,233,0.55)",
              textDecoration: "none",
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Responsive ────────────────────────────────────────────────────── */}
      <style jsx global>{`
        @media (max-width: 640px) {
          #footer nav { top: 20px !important; left: 20px !important; }
          #footer [style*="top: 30px"][style*="right: 30px"] {
            top: 20px !important; right: 20px !important; gap: 16px !important;
          }
        }
      `}</style>
    </footer>
  );
}
