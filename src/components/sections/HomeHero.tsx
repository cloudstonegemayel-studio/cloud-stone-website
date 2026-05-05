"use client";

import {
  useEffect, useRef, useState, useLayoutEffect,
  useCallback, useMemo, Fragment,
} from "react";
import Image from "next/image";
import Link  from "next/link";
import { drawFrame, TrailPoint, TRAIL_MS } from "@/lib/circleGrid";
import { PixelButton } from "@/components/ui/PixelButton";

// ─── Constants ────────────────────────────────────────────────────────────────
const TAGLINE = "We think like craftsmen and design like storytellers";

const NAV_ITEMS = [
  { label: "Cloud Stone", href: "/" },
  { label: "Design",      href: "/design" },
  { label: "Bathrooms",   href: "/bathrooms" },
  { label: "Shop",        href: "/shop" },
  { label: "About",       href: "/about" },
] as const;

const OVERLAY_LINKS = NAV_ITEMS.filter((n) => n.label !== "Cloud Stone");

const CARD_DEFS = [
  {
    id:       "design",
    label:    "Design",
    href:     "/design",
    img:      "/images/Design.png",
    subtitle: "Custom spaces. Architecture shaped through material and making.",
    vwLeft:   0.128,
    vhTop:    0.176,
  },
  {
    id:       "bathrooms",
    label:    "Bathrooms",
    href:     "/bathrooms",
    img:      "/images/Bathrooms.png",
    subtitle: "Sculpted bathing retreats — stone, light and calm.",
    vwRight:  0.235,
    vhTop:    0.167,
  },
  {
    id:       "shop",
    label:    "Shop",
    href:     "/shop",
    img:      "/images/Shop.png",
    subtitle: "Signed objects and made-to-order pieces from our atelier.",
    vwLeft:   0.25,
    vhBot:    0.093,
  },
  {
    id:       "about",
    label:    "About",
    href:     "/about",
    img:      "/images/About.png",
    subtitle: "A small studio shaping buildings, rooms and objects with care.",
    vwRight:  0.113,
    vhBot:    0.102,
  },
] as const;

const CARD_W      = 284;
const CARD_H      = 311;
const IMG_OVF_TOP = 46;   // image overflows this many px above card top border
const IMG_LEFT    = 22;
const IMG_W       = 240;
const IMG_H       = 313;

type CardId = typeof CARD_DEFS[number]["id"];
type Pos    = { x: number; y: number };

function calcInitialPos(): Record<CardId, Pos> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    design:    { x: (145 / 1920) * vw,                y: (190 / 1080) * vh },
    bathrooms: { x: vw - (451 / 1920) * vw - CARD_W,  y: (180 / 1080) * vh },
    shop:      { x: (480 / 1920) * vw,                y: vh - (100 / 1080) * vh - CARD_H },
    about:     { x: vw - (217 / 1920) * vw - CARD_W,  y: vh - (110 / 1080) * vh - CARD_H },
  };
}

function calcCenterPos(): Record<CardId, Pos> {
  const cx = window.innerWidth  / 2 - CARD_W / 2;
  const cy = window.innerHeight / 2 - CARD_H / 2;
  return { design: { x: cx, y: cy }, bathrooms: { x: cx, y: cy },
           shop:   { x: cx, y: cy }, about:     { x: cx, y: cy } };
}

// ─── NavPill (Figma MWPixel pill) ─────────────────────────────────────────────
interface NavPillProps {
  entered:    boolean;
  navOpen:    boolean;
  onMenuOpen: () => void;
}

function NavPill({ entered, navOpen, onMenuOpen }: NavPillProps) {
  const [expanded, setExpanded] = useState(false);

  const handleHamburger = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setExpanded(v => !v);
    } else {
      onMenuOpen();
    }
  };

  const isOpen = expanded || navOpen;

  return (
    <div
      className="nav-pixel"
      style={{
        opacity:    entered ? 1 : 0,
        transform:  entered ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 0.7s ease 1.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 1.2s",
        paddingRight: 0,
      }}
    >
      {/* Inline links — expand on desktop click */}
      <div style={{
        overflow:    "hidden",
        maxWidth:    expanded ? 600 : 0,
        background:  "#392D2B",
        opacity:     expanded ? 1 : 0,
        paddingLeft: 10,
        height:      26,
        transition:  "max-width 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease",
        display:     "flex",
      }}>
        <div style={{ display: "flex", gap: 2, paddingRight: 4 }}>
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = label === "Cloud Stone";
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setExpanded(false)}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  padding:        "6px 8px",
                  background:     isActive ? "#F0EEE9" : "transparent",
                  textDecoration: "none",
                  whiteSpace:     "nowrap",
                  flexShrink:     0,
                  fontFamily:     "var(--font-inter-tight,'Inter Tight','DM Sans',sans-serif)",
                  fontWeight:     600,
                  fontSize:       9,
                  letterSpacing:  "1.17px",
                  textTransform:  "uppercase" as const,
                  color:          isActive ? "#392D2B" : "#F0EEE9",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Hamburger / close button */}
      <button
        onClick={handleHamburger}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        style={{
          background:     "#392d2b",
          border:         "none",
          cursor:         "pointer",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            5,
          padding:        "0px 40px",
          height:         26,
          marginRight:    29,
          flexShrink:     0,
        }}
      >
        {isOpen ? (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <line x1="0.5"  y1="0.5"  x2="12.5" y2="12.5" stroke="#F0EEE9" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="12.5" y1="0.5"  x2="0.5"  y2="12.5" stroke="#F0EEE9" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        ) : (
          <>
            <div style={{ width: 30, height: 1.5, background: "#F0EEE9" }} />
            <div style={{ width: 23, height: 1.5, background: "#F0EEE9" }} />
            <div style={{ width: 15, height: 1.5, background: "#F0EEE9" }} />
          </>
        )}
      </button>
    </div>
  );
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────
interface ServiceCardProps {
  def:        typeof CARD_DEFS[number];
  pos:        Pos;
  onDragMove: (id: CardId, x: number, y: number) => void;
  entered:    boolean;
  enterDelay: number;
  animKf:     string;
  spread:     boolean;
}

const ANIM_DUR = 1200; // ms — keyframe animation duration

function ServiceCard({ def, pos, onDragMove, entered, enterDelay, animKf, spread }: ServiceCardProps) {
  const [hover,        setHover]        = useState(false);
  const [dragging,     setDragging]     = useState(false);
  const [cardTitle,    setCardTitle]    = useState(def.label.toUpperCase());
  const [displayHover, setDisplayHover] = useState(false);
  const [visible,      setVisible]      = useState(false); // animation running
  const [settled,      setSettled]      = useState(false); // animation done
  const dragStart    = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const cloudFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Staggered entrance: start animation, then mark settled after it completes
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), enterDelay);
    const t2 = setTimeout(() => setSettled(true), enterDelay + ANIM_DUR + 50);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cloud text: fade out → swap content/size → fade in
  useEffect(() => {
    if (cloudFadeRef.current) clearTimeout(cloudFadeRef.current);
    cloudFadeRef.current = setTimeout(() => setDisplayHover(hover), 130);
    return () => { if (cloudFadeRef.current) clearTimeout(cloudFadeRef.current); };
  }, [hover]);

  // Letter scramble on hover
  useEffect(() => {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const title = def.label.toUpperCase();
    if (!hover) { setCardTitle(title); return; }

    const order    = [...Array(title.length).keys()].sort(() => Math.random() - 0.5);
    const revealed = new Array(title.length).fill(false);
    let step = 0;
    const id = setInterval(() => {
      if (step < order.length) { revealed[order[step]] = true; step++; }
      const out = title.split("").map((ch, i) =>
        ch === " " ? " " : revealed[i] ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join("");
      setCardTitle(out);
      if (step >= order.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, [hover, def.label]);

  // Pointer drag
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
    function onMove(ev: PointerEvent) {
      if (!dragStart.current) return;
      onDragMove(
        def.id,
        dragStart.current.px + (ev.clientX - dragStart.current.mx),
        dragStart.current.py + (ev.clientY - dragStart.current.my),
      );
    }
    function onUp() {
      dragStart.current = null;
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  }, [def.id, pos, onDragMove]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:   "absolute",
        left:       pos.x,
        top:        pos.y,
        width:      CARD_W,
        height:     CARD_H,
        border:     "0.96px solid #392D2B",
        background: spread ? "transparent" : "#F6F5F2",
        overflow:   "visible",
        zIndex:     dragging ? 20 : 1,
        cursor:     dragging ? "grabbing" : "default",
        userSelect: "none",
        // settled: inline styles take over; animating: keyframe runs; pre: invisible
        opacity:                 settled ? 1 : (visible ? undefined : 0),
        transform:               settled ? "scale(1)" : (visible ? undefined : "scale(0.88)"),
        animationName:           visible && !settled ? animKf : "none",
        animationDuration:       `${ANIM_DUR}ms`,
        animationTimingFunction: "ease",
        animationFillMode:       "both" as const,
        transition: dragging
          ? "none"
          : "left 0.85s cubic-bezier(0.16,1,0.3,1), top 0.85s cubic-bezier(0.16,1,0.3,1), background 0.5s ease 1s, box-shadow 0.4s ease",
        boxShadow: hover || dragging
          ? "0 18px 50px rgba(57,45,43,0.14)"
          : "none",
      }}
    >
      {/* Image area — overflows IMG_OVF_TOP px above card top border */}
      <div style={{
        position: "absolute",
        left:     IMG_LEFT,
        top:      -IMG_OVF_TOP,
        width:    IMG_W,
        height:   IMG_H,
        overflow: "hidden",
      }}>
        <Image
          src={def.img}
          alt={def.label}
          fill
          sizes={`${IMG_W}px`}
          style={{
            objectFit:      "cover",
            objectPosition: "center top",
            transform:      hover ? "scale(1.04)" : "scale(1)",
            transition:     "transform 1s cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Dark overlay — dims image on hover */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: "rgba(57,45,43,0.45)",
          opacity:    hover ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
        }} />

        {/* MWPixel card bg texture on hover */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/MWPixel_card_bg.svg"
          alt=""
          aria-hidden
          style={{
            position:  "absolute",
            inset:     0,
            width:     "100%",
            height:    "100%",
            objectFit: "cover",
            opacity:   hover ? 0.85 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
            mixBlendMode: "screen" as const,
          }}
        />

        {/* Subtitle */}
        {def.subtitle && (
          <div style={{
            position:      "absolute",
            left: 12, top: 14, right: 12,
            fontFamily:    "var(--font-inter-tight,'Inter Tight','DM Sans',sans-serif)",
            fontWeight:    500,
            fontSize:      20,
            lineHeight:    0.95,
            letterSpacing: "-0.02em",
            color:         "#FAF5E6",
            opacity:       hover ? 1 : 0,
            transform:     hover ? "translateY(0)" : "translateY(6px)",
            transition:    "opacity 0.5s ease 0.1s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s",
            pointerEvents: "none",
          }}>
            {def.subtitle}
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{
        position:           "absolute",
        left:               22,
        bottom:             18,
        fontFamily:         "var(--font-rader)",
        fontWeight:         500,
        fontSize:           24,
        lineHeight:         0.75,
        letterSpacing:      "-0.03em",
        color:              "#392D2B",
        textTransform:      "uppercase",
        fontVariantNumeric: "tabular-nums",
        pointerEvents:      "none",
      }}>
        {cardTitle}
      </div>

      {/* Cloud drag handle — bottom-right */}
      <div
        onPointerDown={onPointerDown}
        style={{
          position:        "absolute",
          right:           -18,
          bottom:          -14,
          width:           56.155,
          height:          37.731,
          cursor:          dragging ? "grabbing" : "grab",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          transform:       hover && !dragging ? "scale(1.22)" : "scale(1)",
          transition:      "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          transformOrigin: "center center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 58 39"
          fill="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <path
            d="M40.6769 28.3965C40.6769 28.3965 36.9445 38.1942 27.6133 38.1942C18.7486 38.6608 14.5496 29.3296 14.5496 29.3296C14.5496 29.3296 4.75181 33.5286 1.0193 24.1974C-1.40682 18.1321 4.97063 12.0668 8.01768 12.0668C8.01768 12.0668 9.15931 6.46812 14.5496 5.06845C19.9398 3.66877 24.5303 6.38562 24.3473 6.93469C24.1646 7.48281 27.6132 -1.46339 36.0113 0.869396C43.4763 2.94301 43.4763 11.1337 43.4763 11.1337C43.4763 11.1337 57.9396 8.80092 56.5399 22.3312C53.7406 34.9283 40.6769 28.3965 40.6769 28.3965Z"
            fill="#F6F5F2"
            stroke="#392D2B"
            strokeWidth="0.96"
          />
        </svg>
        <span style={{
          position:      "relative",
          zIndex:        1,
          fontFamily:    "var(--font-inter-tight,'Inter Tight','DM Sans',sans-serif)",
          fontSize:      displayHover || dragging ? 8 : 22,
          fontWeight:    displayHover || dragging ? 700 : 300,
          letterSpacing: displayHover || dragging ? "0.12em" : "0",
          textTransform: "uppercase" as const,
          color:         "#392D2B",
          lineHeight:    1,
          marginTop:     displayHover || dragging ? 0 : -2,
          opacity:       dragging || hover === displayHover ? 1 : 0,
          transition:    "opacity 0.13s ease",
        }}>
          {dragging ? "Dragging" : displayHover ? "Drag me" : "+"}
        </span>
      </div>

      {/* Transparent link overlay on image */}
      <Link
        href={def.href}
        aria-label={`Go to ${def.label}`}
        style={{
          position: "absolute",
          top:      -IMG_OVF_TOP,
          left:     IMG_LEFT,
          width:    IMG_W,
          height:   IMG_H,
          zIndex:   2,
          display:  dragging ? "none" : "block",
        }}
        tabIndex={-1}
      />
    </div>
  );
}

// ─── HomeHero ─────────────────────────────────────────────────────────────────
export function HomeHero() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const t0Ref      = useRef<number>(0);
  const trailRef   = useRef<TrailPoint[]>([]);
  const spreadRef  = useRef(false); // true once cards have flown to final positions

  const [entered,      setEntered]      = useState(false);
  const [tagOn,        setTagOn]        = useState(false);
  const [navOpen,      setNavOpen]      = useState(false);
  const [cardPos,      setCardPos]      = useState<Record<CardId, Pos> | null>(null);
  const [cardsSpread,  setCardsSpread]  = useState(false);

  // ── Wait for preloader ────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem("cs-preloader")) {
      const t = setTimeout(() => {
        setEntered(true);
        setTimeout(() => setTagOn(true), 1200);
      }, 80);
      return () => clearTimeout(t);
    }
    const handle = () => {
      setEntered(true);
      setTimeout(() => setTagOn(true), 1200);
    };
    window.addEventListener("cs-preloader-done", handle, { once: true });
    return () => window.removeEventListener("cs-preloader-done", handle);
  }, []);

  // ── Card positions: start at center, spread to final on enter ────────────
  useLayoutEffect(() => {
    setCardPos(calcCenterPos());
    const onResize = () =>
      setCardPos(spreadRef.current ? calcInitialPos() : calcCenterPos());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!entered) return;
    // last card settles at 900+3×250+1250≈2900ms; spread 400ms after that
    const t = setTimeout(() => {
      spreadRef.current = true;
      setCardPos(calcInitialPos());
      setCardsSpread(true);
    }, 3400);
    return () => clearTimeout(t);
  }, [entered]);

  // ── Animated canvas ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    t0Ref.current = performance.now();

    function frame(now: number) {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const t   = now - t0Ref.current;
      // Prune stale trail points each frame
      trailRef.current = trailRef.current.filter(p => now - p.t < TRAIL_MS);
      // At t=0: offsets are 0,0 → identical to buildOffscreen() pattern
      drawFrame(ctx, c.width, c.height,
        t * 0.000018,   // slow rightward drift
        -t * 0.000006,  // very gentle upward drift
        trailRef.current,
        now,
      );
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    const onResize = () => {
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    };
    // ── Shared trail-push helper ────────────────────────────────────────────
    function pushTrail(x: number, y: number) {
      const t     = performance.now();
      const trail = trailRef.current;
      const last  = trail[0];
      // Min 7 px between points — keeps trail sparse so forces stay smooth
      if (!last || (x - last.x) ** 2 + (y - last.y) ** 2 > 49) {
        trail.unshift({ x, y, t });
        if (trail.length > 40) trail.length = 40;
      }
    }

    const onMove      = (e: MouseEvent)  => pushTrail(e.clientX, e.clientY);
    const onLeave     = ()               => { trailRef.current = []; };
    const onTouchMove = (e: TouchEvent)  => {
      const touch = e.touches[0];
      if (touch) pushTrail(touch.clientX, touch.clientY);
    };
    const onTouchEnd  = ()               => { trailRef.current = []; };

    window.addEventListener("resize",      onResize);
    window.addEventListener("mousemove",   onMove);
    window.addEventListener("mouseleave",  onLeave);
    window.addEventListener("touchmove",   onTouchMove, { passive: true });
    window.addEventListener("touchend",    onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",      onResize);
      window.removeEventListener("mousemove",   onMove);
      window.removeEventListener("mouseleave",  onLeave);
      window.removeEventListener("touchmove",   onTouchMove);
      window.removeEventListener("touchend",    onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);

  const handleDragMove = useCallback((id: CardId, x: number, y: number) => {
    setCardPos((p) => p ? { ...p, [id]: { x, y } } : p);
  }, []);

  // Tagline word array
  const tagWords = useMemo(() =>
    TAGLINE.split(" ").map((word, wi, arr) => ({
      word,
      isAccent: word === "craftsmen" || word === "storytellers",
      charOffset: arr.slice(0, wi).join(" ").length + (wi > 0 ? 1 : 0),
    })),
  []);

  return (
    <div style={{
      position:   "relative",
      width:      "100vw",
      height:     "100vh",
      overflow:   "hidden",
      background: "#F6F5F2",
      userSelect: "none",
    }}>

      {/* ── Animated circle-grid canvas ────────────────────────────────────── */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />

      {/* ── Sketch decorations ─────────────────────────────────────────────── */}

      {/* Thumb-sketch — flex container + rotate(-90deg), Figma: top 169 left 354 */}
      <div
        aria-hidden
        style={{
          position:        "absolute",
          top:             "8.80vw",
          left:            "18.44vw",
          display:         "inline-flex",
          flexDirection:   "column",
          justifyContent:  "flex-end",
          alignItems:      "center",
          padding:         "3.58vw 2.16vw 0.45vw 1.88vw",
          pointerEvents:   "none",
          opacity:         entered ? 0.82 : 0,
          transition:      "opacity 0.9s ease 1.0s",
        }}
      >
        <Image src="/thumb-sketch.svg" alt="" width={306} height={257}
          style={{ width: "15.94vw", height: "auto", display: "block" }}
        />
      </div>

      {/* bathroom-sketch — Figma: top 222 right 693 */}
      <Image src="/bathroom-sketch.svg" alt="" aria-hidden width={172} height={213}
        style={{
          position:      "absolute",
          top:           "11.56vw",
          right:         "36.09vw",
          width:         "8.93vw",
          height:        "auto",
          opacity:       entered ? 0.82 : 0,
          transition:    "opacity 0.9s ease 1.1s",
          pointerEvents: "none",
        }}
      />

      {/* chair-sketch — Figma: top 168 right 30 (dims 209×135 suggest 90° rotation) */}
      <div
        aria-hidden
        style={{
          position:        "absolute",
          top:             "8.75vw",
          right:           "1.56vw",
          pointerEvents:   "none",
          opacity:         entered ? 0.78 : 0,
          transition:      "opacity 0.9s ease 1.2s",
        }}
      >
        <Image src="/chair-sketch.svg" alt="" width={136} height={210}
          style={{ width: "7.08vw", height: "auto", display: "block" }}
        />
      </div>

      {/* scene-sketch — Figma: bottom 171 left -42 */}
      <Image src="/scene-sketch.svg" alt="" aria-hidden width={310} height={216}
        style={{
          position:      "absolute",
          bottom:        "8.91vw",
          left:          "-2.19vw",
          width:         "18.28vw",
          height:        "auto",
          opacity:       entered ? 0.72 : 0,
          transition:    "opacity 0.9s ease 1.4s",
          pointerEvents: "none",
        }}
      />

      {/* wardrobe-sketch — rotate(-90deg), Figma: bottom -8.5 right 525 */}
      <div
        aria-hidden
        style={{
          position:        "absolute",
          bottom:          "-0.44vw",
          right:           "27.34vw",
          pointerEvents:   "none",
          opacity:         entered ? 0.78 : 0,
          transition:      "opacity 0.9s ease 1.3s",
        }}
      >
        <Image src="/wardrobe-sketch.svg" alt="" width={168} height={274}
          style={{ width: "8.75vw", height: "auto", display: "block" }}
        />
      </div>

      {/* ── Navbar (top: 30px per Figma) ───────────────────────────────────── */}
      <header style={{
        position:       "absolute",
        top:            0,
        left:           0,
        right:          0,
        height:         86, // 30 top + 26 nav + buffer
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        padding:        "30px 30px 0",
        zIndex:         10,
      }}>

        {/* Logo */}
        <Link href="/" aria-label="Cloud Stone Studio home">
          <Image
            src="/LOGO.svg"
            alt="Cloud Stone Studio"
            width={80} height={70}
            style={{
              width:      "clamp(58px,4.2vw,80px)",
              height:     "auto",
              opacity:    entered ? 1 : 0,
              transition: "opacity 0.8s ease 0.8s",
            }}
            priority
          />
        </Link>

        {/* NavPill — centered */}
        <div style={{
          position:  "absolute",
          left:      "50%",
          top:       30,
          transform: "translateX(-50%)",
        }}>
          <NavPill entered={entered} navOpen={navOpen} onMenuOpen={() => setNavOpen((v) => !v)} />
        </div>

        {/* Elfsight weather widget */}
        <div
          style={{
            opacity:    entered ? 1 : 0,
            transition: "opacity 0.7s ease 1.3s",
            marginTop:  -4,
            overflow:   "hidden",
          }}
        >
          <div style={{ marginBottom: -44 }}>
            <div
              className="elfsight-app-8294ddb1-6460-4546-8caf-0266985ad33c"
              data-elfsight-app-lazy
              style={{ width: 111 }}
            />
          </div>
        </div>
      </header>

      {/* ── Service cards — only mount once entered, so visible-timer starts correctly */}
      {entered && cardPos && CARD_DEFS.map((def, i) => (
        <ServiceCard
          key={def.id}
          def={def}
          pos={cardPos[def.id]}
          onDragMove={handleDragMove}
          entered={entered}
          enterDelay={900 + i * 250}
          animKf={`cs-card-enter-kf-${i + 1}`}
          spread={cardsSpread}
        />
      ))}

      {/* ── Tagline — char blur reveal ──────────────────────────────────────── */}
      <div style={{
        position:   "absolute",
        left:       30,
        bottom:     30,
        width:      "clamp(460px,48vw,900px)",
        fontFamily: "var(--font-rader)",
        fontWeight: 400,
        fontSize:   "clamp(28px,3.1vw,60px)",
        lineHeight: 0.92,
        letterSpacing: "-0.01em",
        color:      "#392D2B",
        pointerEvents: "none",
      }}>
        {tagWords.map(({ word, isAccent, charOffset }, wi) => (
          <Fragment key={wi}>
            <span style={{
              display:     "inline-block",
              whiteSpace:  "nowrap",
              marginRight: "0.28em",
              color:       isAccent ? "#C86733" : "inherit",
              fontStyle:   "normal",
            }}>
              {word.split("").map((ch, ci) => {
                const delay = (charOffset + ci) * 22;
                return (
                  <span key={ci} style={{
                    display:   "inline-block",
                    opacity:   tagOn ? 1 : 0,
                    filter:    tagOn ? "blur(0px)" : "blur(8px)",
                    transform: tagOn ? "translateY(0)" : "translateY(6px)",
                    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                  }}>
                    {ch}
                  </span>
                );
              })}
            </span>
            {wi === 2 && <br />}
            {word === "and" && <br />}
          </Fragment>
        ))}
      </div>

      {/* ── Footer row ─────────────────────────────────────────────────────── */}
      <div style={{
        position:   "absolute",
        bottom:     30,
        left:       "50%",
        transform:  "translateX(-50%)",
        display:    "flex",
        gap:        24,
        fontFamily:    "var(--font-rader)",
        fontSize:      10,
        letterSpacing: "-0.03em",
        color:      "rgba(57,45,43,1)",
        whiteSpace: "nowrap",
        opacity:    entered ? 1 : 0,
        transition: "opacity 0.7s ease 1.5s",
      }}>
        <span>© CLOUDSTONESTUDIO.COM 2026</span>
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>PRIVACY POLICY</Link>
        <Link href="/terms"   style={{ color: "inherit", textDecoration: "none" }}>TERMS OF SERVICE</Link>
      </div>

      {/* ── CTA button — bottom-right ───────────────────────────────────────── */}
      <PixelButton
        label="Contact"
        href="/about"
        style={{
          position:   "absolute",
          right:      30,
          bottom:     30,
          opacity:    entered ? 1 : 0,
          transition: "opacity 0.7s ease 1.4s",
        }}
      />

      {/* ── Full-screen nav overlay ─────────────────────────────────────────── */}
      <div
        aria-hidden={!navOpen}
        style={{
          position:    "fixed",
          inset:       0,
          zIndex:      50,
          background:  "#392D2B",
          opacity:     navOpen ? 1 : 0,
          pointerEvents: navOpen ? "auto" : "none",
          transition:  "opacity 0.45s cubic-bezier(0.16,1,0.3,1)",
          display:     "flex",
          flexDirection: "column",
        }}
      >
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          padding:        "30px 30px 0",
        }}>
          <Link href="/" onClick={() => setNavOpen(false)} aria-label="Home">
            <Image
              src="/LOGO.svg"
              alt="Cloud Stone Studio"
              width={80} height={70}
              style={{ width: "clamp(58px,4.2vw,80px)", height: "auto", filter: "brightness(10)" }}
            />
          </Link>
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Close navigation"
            style={{
              background: "none",
              border:     "none",
              cursor:     "pointer",
              color:      "#F0EEE9",
              display:    "flex",
              alignItems: "center",
              gap:        10,
              padding:    0,
              fontFamily: "var(--font-inter-tight,'Inter Tight','DM Sans',sans-serif)",
              fontWeight: 600,
              fontSize:   9,
              letterSpacing: "1.17px",
              textTransform: "uppercase",
            }}
          >
            Close
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M1 1L15 15M15 1L1 15" stroke="#F0EEE9" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav style={{
          flex:           1,
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "center",
          padding:        "0 30px",
          gap:            4,
        }}>
          {OVERLAY_LINKS.map(({ label, href }, i) => (
            <Link
              key={label}
              href={href}
              onClick={() => setNavOpen(false)}
              style={{
                fontFamily:    "var(--font-rader)",
                fontWeight:    700,
                fontSize:      "clamp(48px,6.3vw,120px)",
                lineHeight:    0.95,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                color:         "#F0EEE9",
                textDecoration: "none",
                display:       "block",
                opacity:       navOpen ? 1 : 0,
                transform:     navOpen ? "translateY(0)" : "translateY(24px)",
                transition:    `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{
          padding:        "24px 30px",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          fontFamily:     "var(--font-rader)",
          fontWeight:     700,
          fontSize:       10,
          letterSpacing:  "-0.03em",
          textTransform:  "uppercase",
          color:          "#F0EEE9",
          opacity:        0.5,
        }}>
          <span>cloud stone studio</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
}
