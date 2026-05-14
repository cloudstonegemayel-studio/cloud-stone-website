"use client";

import {
  useEffect, useRef, useState, useLayoutEffect,
  useCallback, useMemo, Fragment, type CSSProperties,
} from "react";
import Image from "next/image";
import Link  from "next/link";
import { drawFrame, TrailPoint, TRAIL_MS } from "@/lib/circleGrid";
import { PixelButton } from "@/components/ui/PixelButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";

// ─── Constants ────────────────────────────────────────────────────────────────
const TAGLINE = "We think like craftsmen and design like storytellers";

const NAV_ITEMS = [
  { label: "Cloud Stone", href: "/" },
  { label: "Design",      href: "/design" },
  { label: "Bathrooms",   href: "/bathrooms" },
  { label: "Objects",     href: "/shop" },
  { label: "About",       href: "/about" },
  { label: "Contact",     href: "/contacts" },
] as const;

const OVERLAY_LINKS = NAV_ITEMS.filter((n) => n.label !== "Cloud Stone");

const CARD_DEFS = [
  {
    id:       "design",
    label:    "Design",
    href:     "/design",
    img:      "/images/Design.png",
    subtitle: "Spaces shaped through material, craft, and construction",
    vwLeft:   0.128,
    vhTop:    0.176,
  },
  {
    id:       "bathrooms",
    label:    "Bathrooms",
    href:     "/bathrooms",
    img:      "/images/Bathrooms.png",
    subtitle: "Sculptural bathrooms - designed, fabricated, and installed",
    vwRight:  0.235,
    vhTop:    0.167,
  },
  {
    id:       "shop",
    label:    "Objects",
    href:     "/shop",
    img:      "/images/Shop.png",
    subtitle: "Designed objects and made-to-order pieces from our atelier",
    vwLeft:   0.25,
    vhBot:    0.093,
  },
  {
    id:       "about",
    label:    "About",
    href:     "/about",
    img:      "/images/About.png",
    subtitle: "Antonio Gemayel - designer, fabricator, founder. Lebanon-rooted, New York-based",
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

// Contact links shown in the mobile overlay
const OVERLAY_CONTACTS = [
  { href: "tel:+16462728208",                       label: "Call",      vb: "0 0 48 48",
    paths: [{ d: "M44.0008 33.8402V39.8402C44.0031 40.3972 43.889 40.9485 43.6659 41.4589C43.4427 41.9692 43.1154 42.4274 42.705 42.8039C42.2946 43.1805 41.81 43.4672 41.2823 43.6456C40.7547 43.8241 40.1956 43.8903 39.6408 43.8402C33.4865 43.1715 27.5748 41.0685 22.3808 37.7002C17.5485 34.6295 13.4515 30.5325 10.3808 25.7002C7.0008 20.4826 4.89733 14.5422 4.24084 8.36019C4.19086 7.80713 4.25659 7.24971 4.43384 6.72344C4.61109 6.19717 4.89598 5.71357 5.27037 5.30344C5.64477 4.8933 6.10045 4.56561 6.60842 4.34124C7.1164 4.11686 7.66552 4.00072 8.22084 4.00019H14.2208C15.1915 3.99064 16.1324 4.33435 16.8684 4.96726C17.6043 5.60017 18.085 6.47909 18.2208 7.44019C18.4741 9.36033 18.9437 11.2456 19.6208 13.0602C19.8899 13.776 19.9482 14.554 19.7887 15.302C19.6291 16.0499 19.2586 16.7364 18.7208 17.2802L16.1808 19.8202C19.028 24.8273 23.1738 28.9731 28.1808 31.8202L30.7208 29.2802C31.2646 28.7425 31.9512 28.3719 32.6991 28.2124C33.447 28.0529 34.225 28.1111 34.9408 28.3802C36.7554 29.0573 38.6407 29.5269 40.5608 29.7802C41.5324 29.9173 42.4196 30.4066 43.0539 31.1552C43.6882 31.9038 44.0252 32.8593 44.0008 33.8402Z" }] },
  { href: "mailto:antonio@cloudstonestudio.com",    label: "Email",     vb: "0 0 48 48",
    paths: [{ d: "M44 12C44 9.8 42.2 8 40 8H8C5.8 8 4 9.8 4 12M44 12V36C44 38.2 42.2 40 40 40H8C5.8 40 4 38.2 4 36V12M44 12L24 26L4 12" }] },
  { href: "https://instagram.com/cloudstonestudio", label: "Instagram", vb: "0 0 48 48",
    paths: [{ d: "M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z" }] },
  { href: "https://wa.me/16462728208",              label: "WhatsApp",  vb: "0 0 44 44",
    paths: [
      { d: "M21.9775 2H21.9844C24.5857 1.99138 27.1629 2.50073 29.5654 3.49805C31.968 4.49541 34.148 5.96122 35.9785 7.80957L35.9854 7.81641C39.7233 11.5544 41.7803 16.5234 41.7803 21.8242C41.7802 32.7315 32.8849 41.626 21.9775 41.626C18.663 41.6259 15.4057 40.7874 12.5068 39.208L11.8096 38.8281L11.042 39.0293L2.83887 41.1846L5.00977 33.2178L5.22754 32.417L4.81543 31.6973C3.09532 28.6971 2.17578 25.2993 2.17578 21.8018C2.17595 10.8946 11.0704 2.00022 21.9775 2Z" },
      { d: "M31.9221 26.3785C31.3721 26.1145 28.6881 24.7945 28.2041 24.5965C27.6981 24.4205 27.3461 24.3325 26.9721 24.8605C26.5981 25.4105 25.5641 26.6425 25.2561 26.9945C24.9481 27.3685 24.6181 27.4125 24.0681 27.1265C23.5181 26.8625 21.7581 26.2685 19.6901 24.4205C18.0621 22.9685 16.9841 21.1865 16.6541 20.6365C16.3461 20.0865 16.6101 19.8005 16.8961 19.5145C17.1381 19.2725 17.4461 18.8765 17.7101 18.5685C17.9741 18.2605 18.0841 18.0185 18.2601 17.6665C18.4361 17.2925 18.3481 16.9845 18.2161 16.7205C18.0841 16.4566 16.9841 13.7726 16.5441 12.6726C16.1041 11.6166 15.6421 11.7486 15.3121 11.7266H14.2561C13.8821 11.7266 13.3101 11.8586 12.8041 12.4086C12.3201 12.9586 10.9121 14.2786 10.9121 16.9625C10.9121 19.6465 12.8701 22.2425 13.1341 22.5945C13.3981 22.9685 16.9841 28.4685 22.4401 30.8225C23.7381 31.3945 24.7501 31.7245 25.5421 31.9665C26.8401 32.3845 28.0281 32.3185 28.9741 32.1865C30.0301 32.0325 32.2081 30.8665 32.6481 29.5905C33.1101 28.3145 33.1101 27.2365 32.9561 26.9945C32.8021 26.7525 32.4721 26.6425 31.9221 26.3785Z", fill: true },
    ] },
] as const;

type CardId = typeof CARD_DEFS[number]["id"];
type Pos    = { x: number; y: number };

function cardScale(vw: number): number {
  if (vw < 480) return 0.52;
  if (vw < 768) return 0.65;
  if (vw < 980) return 0.78;
  return 1;
}

function calcInitialPos(): Record<CardId, Pos> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const s  = cardScale(vw);
  const cw = CARD_W * s;
  const ch = CARD_H * s;

  if (vw < 768) {
    // Mobile: staggered diagonal — left·right·left·right going down the screen.
    // transform-origin: center → CSS positions are offset so the VISUAL edges land at pad/vw-pad.
    // visual_left  = CSS_left + CARD_W*(1-s)/2  →  CSS_left = pad - CARD_W*(1-s)/2
    // visual_right = CSS_left + CARD_W*(1+s)/2  →  CSS_left = (vw-pad) - CARD_W*(1+s)/2
    // safeH: bottom card's visual_bottom ≤ vh-FOOTER → safeH = vh-HEADER-FOOTER-CARD_H*(1+s)/2
    const pad    = 16;
    const HEADER = 86;
    const FOOTER = 64;
    const safeH  = vh - HEADER - FOOTER - CARD_H * (1 + s) / 2;
    const leftX  = pad - CARD_W * (1 - s) / 2;
    const rightX = (vw - pad) - CARD_W * (1 + s) / 2;
    // On small-height portrait screens raise the top two cards
    const designY    = vh < 750 ? 40  : HEADER + safeH * 0.04;
    const bathroomsY = vh < 750 ? 100 : HEADER + safeH * 0.33;
    return {
      design:    { x: leftX,  y: designY },
      bathrooms: { x: rightX, y: bathroomsY },
      shop:      { x: leftX,  y: HEADER + safeH * 0.58 },
      about:     { x: rightX, y: HEADER + safeH * 0.88 },
    };
  }

  // Landscape mobile: vw ≥ 768 but small height → 2×2 grid over 2 screen heights
  if (vh < 500) {
    const pad    = 16;
    const leftX  = pad - CARD_W * (1 - s) / 2;
    const rightX = (vw - pad) - CARD_W * (1 + s) / 2;
    return {
      design:    { x: leftX,  y: 70 },
      bathrooms: { x: rightX, y: 70 },
      shop:      { x: leftX,  y: vh + 70 },
      about:     { x: rightX, y: vh + 70 },
    };
  }

  return {
    design:    { x: (145 / 1920) * vw,           y: (190 / 1080) * vh },
    bathrooms: { x: vw - (537 / 1920) * vw - cw, y: (180 / 1080) * vh },
    shop:      { x: (480 / 1920) * vw,           y: vh - (100 / 1080) * vh - ch },
    about:     { x: vw - (217 / 1920) * vw - cw, y: vh - (110 / 1080) * vh - ch },
  };
}

function calcCenterPos(): Record<CardId, Pos> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // transform-origin: center — scale doesn't shift the visual center,
  // so CSS center = vw/2, vh/2 regardless of scale
  const cx = vw / 2 - CARD_W / 2;
  const cy = vh / 2 - CARD_H / 2;
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
  scale:      number;
}

const ANIM_DUR = 1200; // ms — keyframe animation duration

function ServiceCard({ def, pos, onDragMove, entered, enterDelay, animKf, spread, scale }: ServiceCardProps) {
  const [hover,    setHover]    = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cardTitle, setCardTitle] = useState(def.label.toUpperCase());
  const [visible,  setVisible]  = useState(false); // animation running
  const [settled,  setSettled]  = useState(false); // animation done
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  // Staggered entrance: start animation, then mark settled after it completes
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), enterDelay);
    const t2 = setTimeout(() => setSettled(true), enterDelay + ANIM_DUR + 50);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      className="cs-service-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ["--cs-scale" as string]: scale,
        position:   "absolute",
        left:       pos.x,
        top:        pos.y,
        width:      CARD_W,
        height:     CARD_H,
        border:     "0.96px solid #392D2B",
        background: "#F6F5F2",
        overflow:   "visible",
        zIndex:     dragging ? 20 : 1,
        cursor:     dragging ? "grabbing" : "default",
        userSelect: "none",
        // settled: inline styles take over; animating: keyframe runs; pre: invisible
        // scale prop drives responsive sizing so CSS zoom isn't needed (zoom scales left/top visually)
        opacity:                 settled ? 1 : (visible ? undefined : 0),
        transform:               settled ? `scale(${scale})` : (visible ? undefined : `scale(${scale * 0.88})`),
        animationName:           visible && !settled ? animKf : "none",
        animationDuration:       `${ANIM_DUR}ms`,
        animationTimingFunction: "ease",
        animationFillMode:       "both" as const,
        transition: dragging
          ? "none"
          : "left 0.85s cubic-bezier(0.16,1,0.3,1), top 0.85s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease, transform 0.6s ease",
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
        <svg
          viewBox="0 0 16 16"
          fill="none"
          width="20"
          height="20"
          style={{ position: "relative", zIndex: 1 }}
          aria-hidden
        >
          <path d="M8 2L6 4.5H10L8 2ZM8 14L6 11.5H10L8 14ZM2 8L4.5 6V10L2 8ZM14 8L11.5 6V10L14 8Z" fill="#392D2B"/>
          <path d="M8 4.5V11.5M4.5 8H11.5" stroke="#392D2B" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
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

// ─── Contact popup (Footer right-panel replica) ───────────────────────────────
const POPUP_FIELD: CSSProperties = {
  background: "#DEDBD6",
  padding: "8px 10px",
  width: "100%",
  fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.2,
  color: "#392D2B",
  border: "none",
  outline: "none",
  boxSizing: "border-box",
};

const POPUP_LABEL: CSSProperties = {
  fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.2,
  color: "#392D2B",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

function ContactPopup({ onClose }: { onClose: () => void }) {
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSubmit = async (data: ContactFormData) => {
    setFormStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source_page: "HomeHero" }),
      });
      if (res.ok) { setFormStatus("success"); reset(); }
      else setFormStatus("error");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(183,209,234,0.38)", backdropFilter: "blur(2px)",
        animation: "sc-fadein 240ms ease both",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#B7D1EA",
        width: "min(485px, calc(100vw - 40px))",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "30px 29px",
        display: "flex",
        flexDirection: "column",
        gap: 23,
        alignItems: "center",
        position: "relative",
        animation: "sc-popup-in 520ms cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* "Contact form" label + close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 30, right: 30,
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontSize: 22, lineHeight: 1, color: "#392D2B",
          }}
        >
          ×
        </button>

        {/* Logo */}
        <div style={{ width: 170, height: 103, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/footer-logo.svg" alt="Cloud Stone Studio" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
          fontWeight: 400, fontSize: 20, lineHeight: 1.2,
          color: "#392D2B", textAlign: "center", width: "100%", margin: 0,
        }}>
          Tell us what{" "}
          <span style={{ color: "#C86733" }}>you&apos;re building</span>.
          <br />
          We&apos;ll take it from concept{" "}
          <span style={{ color: "#C86733" }}>to reality</span>.
        </p>

        {/* Form */}
        {formStatus === "success" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontFamily: "var(--font-rader,'PP Rader',sans-serif)", fontWeight: 700, fontSize: 24, textTransform: "uppercase", letterSpacing: "-0.5px", color: "#392D2B", margin: 0 }}>
              Thank you!
            </p>
            <p style={{ fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontSize: 14, color: "#392D2B", lineHeight: 1.5, margin: 0 }}>
              We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={POPUP_LABEL}>Name</label>
              <input {...register("name")} placeholder="Your full name" style={{ ...POPUP_FIELD, color: errors.name ? "#C86733" : "#392D2B" }} />
              {errors.name && <span style={{ fontSize: 10, color: "#C86733" }}>{errors.name.message}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={POPUP_LABEL}>Email</label>
              <input {...register("email")} type="email" placeholder="your@email.com" style={{ ...POPUP_FIELD, color: errors.email ? "#C86733" : "#392D2B" }} />
              {errors.email && <span style={{ fontSize: 10, color: "#C86733" }}>{errors.email.message}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={POPUP_LABEL}>Phone (optional)</label>
              <input {...register("phone")} type="tel" placeholder="+1 XXX XXX-XXX" style={POPUP_FIELD} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={POPUP_LABEL}>Subject (optional)</label>
              <input {...register("subject")} placeholder="Project type, scope ..." style={POPUP_FIELD} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={POPUP_LABEL}>Message</label>
              <textarea
                {...register("message")}
                placeholder="Tell us about your project, timeline, and vision ..."
                rows={4}
                style={{ ...POPUP_FIELD, paddingBottom: 50, resize: "none", color: errors.message ? "#C86733" : "#392D2B" }}
              />
              {errors.message && <span style={{ fontSize: 10, color: "#C86733" }}>{errors.message.message}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 }}>
              <PixelButton label={formStatus === "loading" ? "Sending..." : "Send Request"} type="submit" />
              {formStatus === "error" && (
                <p style={{ marginTop: 8, fontSize: 11, color: "#C86733", fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)" }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
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

  const [entered,          setEntered]         = useState(false);
  const [tagOn,            setTagOn]           = useState(false);
  const [navOpen,          setNavOpen]         = useState(false);
  const [cardPos,          setCardPos]         = useState<Record<CardId, Pos> | null>(null);
  const [cardsSpread,      setCardsSpread]     = useState(false);
  const [cardScaleVal,     setCardScaleVal]    = useState(1);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

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

  // ── Landscape mobile detection ────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsLandscapeMobile(window.innerWidth >= 768 && window.innerHeight < 500);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Card positions: start at center, spread to final on enter ────────────
  useLayoutEffect(() => {
    setCardScaleVal(cardScale(window.innerWidth));
    setCardPos(calcCenterPos());
    const onResize = () => {
      setCardScaleVal(cardScale(window.innerWidth));
      setCardPos(spreadRef.current ? calcInitialPos() : calcCenterPos());
    };
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
      height:     isLandscapeMobile ? "200vh" : "100vh",
      overflowX:  "hidden",
      overflowY:  isLandscapeMobile ? "auto" : "hidden",
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
          opacity:         entered ? 0.24 : 0,
          filter:          "brightness(0)",
          transition:      "opacity 0.9s ease 1.0s",
        }}
      >
        <Image src="/thumb-sketch.svg" alt="" width={306} height={257}
          style={{ width: "max(159px,15.94vw)", height: "auto", display: "block" }}
        />
      </div>

      {/* bathroom-sketch — Figma: top 222 right 693 */}
      <Image src="/bathroom-sketch.svg" alt="" aria-hidden width={172} height={213}
        className="hero-bathroom-sketch"
        style={{
          position:      "absolute",
          top:           "11.56vw",
          right:         "36.09vw",
          width:         "max(89px,8.93vw)",
          height:        "auto",
          opacity:       entered ? 0.4 : 0,
          filter:        "brightness(0)",
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
          opacity:         entered ? 0.24 : 0,
          filter:          "brightness(0)",
          transition:      "opacity 0.9s ease 1.2s",
        }}
      >
        <Image src="/chair-sketch.svg" alt="" width={136} height={210}
          style={{ width: "max(71px,7.08vw)", height: "auto", display: "block" }}
        />
      </div>

      {/* scene-sketch — Figma: bottom 171 left -42 */}
      <Image src="/scene-sketch.svg" alt="" aria-hidden width={310} height={216}
        style={{
          position:      "absolute",
          bottom:        "8.91vw",
          left:          "-2.19vw",
          width:         "max(182px,18.28vw)",
          height:        "auto",
          opacity:       entered ? 0.4 : 0,
          filter:        "brightness(0)",
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
          opacity:         entered ? 0.24 : 0,
          filter:          "brightness(0)",
          transition:      "opacity 0.9s ease 1.3s",
        }}
      >
        <Image src="/wardrobe-sketch.svg" alt="" width={168} height={274}
          style={{ width: "max(87px,8.75vw)", height: "auto", display: "block" }}
        />
      </div>

      {/* ── Navbar (top: 30px per Figma) ───────────────────────────────────── */}
      <header
        className="hero-header-inner"
        style={{
          position:       "absolute",
          top:            0,
          left:           0,
          right:          0,
          height:         86,
          display:        "flex",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          zIndex:         10,
        }}
      >

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

        {/* NavPill — centered on desktop, right on mobile */}
        <div className="hero-navpill-wrap">
          <NavPill entered={entered} navOpen={navOpen} onMenuOpen={() => setNavOpen((v) => !v)} />
        </div>

        {/* Elfsight weather widget */}
        <div
          className="hero-weather"
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
          scale={cardScaleVal}
        />
      ))}

      {/* ── Tagline — char blur reveal ──────────────────────────────────────── */}
      <div
        className="hero-tagline"
        style={{
          position:      "absolute",
          fontFamily:    "var(--font-rader)",
          fontWeight:    400,
          fontSize:      "clamp(28px,3.1vw,60px)",
          lineHeight:    0.92,
          letterSpacing: "-0.01em",
          color:         "#392D2B",
          pointerEvents: "none",
        }}
      >
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
      <div
        className="hero-footer-row"
        style={{
          position:      "absolute",
          left:          "50%",
          transform:     "translateX(-50%)",
          display:       "flex",
          gap:           24,
          fontFamily:    "var(--font-rader)",
          fontSize:      10,
          letterSpacing: "-0.03em",
          color:         "rgba(57,45,43,1)",
          whiteSpace:    "nowrap",
          opacity:       entered ? 1 : 0,
          transition:    "opacity 0.7s ease 1.5s",
        }}
      >
        <span>© CLOUDSTONESTUDIO.COM 2026</span>
        <Link href="/privacy-policy" style={{ color: "inherit", textDecoration: "none" }}>PRIVACY POLICY</Link>
        <Link href="/terms"   style={{ color: "inherit", textDecoration: "none" }}>TERMS OF SERVICE</Link>
      </div>

      {/* ── CTA button — bottom-right ───────────────────────────────────────── */}
      <div
        className="hero-cta"
        style={{
          position:   "absolute",
          opacity:    entered ? 1 : 0,
          transition: "opacity 0.7s ease 1.4s",
          zIndex:     1,
        }}
      >
        <PixelButton label="Contact" href="/contacts" />
      </div>

      {/* ── Full-screen nav overlay ─────────────────────────────────────────── */}
      <div
        aria-hidden={!navOpen}
        style={{
          position:    "fixed",
          inset:       0,
          zIndex:      50,
          background:  "#392D2B",
          opacity:     navOpen ? 1 : 0,
          visibility:  navOpen ? "visible" : "hidden",
          pointerEvents: navOpen ? "auto" : "none",
          transition:  navOpen
            ? "opacity 0.45s cubic-bezier(0.16,1,0.3,1)"
            : "opacity 0.45s cubic-bezier(0.16,1,0.3,1), visibility 0s linear 0.45s",
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

        {/* Contact icons */}
        <div style={{ display: "flex", gap: 28, padding: "0 15px 24px", alignItems: "center" }}>
          {OVERLAY_CONTACTS.map(({ href, label, paths, vb }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={label}
              style={{ display: "inline-flex", opacity: 0.75 }}
            >
              <svg width="24" height="24" viewBox={vb} fill="none">
                {paths.map((p, i) =>
                  "fill" in p && p.fill
                    ? <path key={i} d={p.d} fill="#F0EEE9" />
                    : <path key={i} d={p.d} stroke="#F0EEE9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </a>
          ))}
        </div>

        <div style={{
          padding:        "24px 15px",
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
