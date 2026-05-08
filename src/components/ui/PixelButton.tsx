"use client";

import { useState } from "react";
import Link from "next/link";

interface PixelButtonProps {
  label:         string;
  onClick?:      () => void;
  href?:         string;
  style?:        React.CSSProperties;
  "aria-label"?: string;
  type?:         "button" | "submit" | "reset";
}

/**
 * MWPixel-textured button — Figma node 14348:45268.
 * Base spec at 1920 px: 9 px font, 7.5/20 px padding, 30/17 px wing padding.
 * All sizes scale proportionally via CSS max(min, vw).
 *
 * States:  default pl 30/pr 17 · hover pl 37/pr 24 · active pl 29.4/pr 16.66
 * Renders <Link> when href provided, <button> otherwise.
 */
export function PixelButton({
  label,
  onClick,
  href,
  style,
  "aria-label": ariaLabel,
  type = "button",
}: PixelButtonProps) {
  const [hover,  setHover]  = useState(false);
  const [active, setActive] = useState(false);

  // Wing offset — wings slide outward on hover, snap back on press
  const wingShift = active ? 0 : hover ? 8 : 0;
  const wingTrans = "transform 0.22s cubic-bezier(0.16,1,0.3,1)";

  const { transition: extTrans, ...restStyle } = style ?? {};

  const wrapperStyle: React.CSSProperties = {
    position:      "relative",
    display:       "inline-flex",
    flexDirection: "column",
    alignItems:    "flex-start",
    paddingLeft:   "max(20px,1.563vw)",
    paddingRight:  "max(12px,0.885vw)",
    background:    "none",
    border:        "none",
    cursor:        "pointer",
    outline:       "none",
    userSelect:    "none",
    textDecoration: "none",
    WebkitTapHighlightColor: "transparent",
    transition:    extTrans,
    ...restStyle,
  };

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => { setHover(false); setActive(false); },
    onMouseDown:  () => setActive(true),
    onMouseUp:    () => setActive(false),
  };

  const inner = (
    <>
      {/* Left pixel-dot wing — slides left on hover */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/btn-left.svg" alt="" aria-hidden="true" draggable={false} style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: "max(65px,5.26vw)", height: "100%",
        pointerEvents: "none", display: "block",
        transform: `translateX(${-wingShift}px)`,
        transition: wingTrans,
      }} />

      {/* Right pixel-dot wing — slides right on hover */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/btn-right.svg" alt="" aria-hidden="true" draggable={false} style={{
        position: "absolute", right: 0, top: 0,
        width: "max(65px,5.21vw)", height: "100%",
        pointerEvents: "none", display: "block",
        transform: `translateX(${wingShift}px)`,
        transition: wingTrans,
      }} />

      {/* Dark body rect */}
      <div style={{
        position:   "relative",
        background: "#392D2B",
        display:    "flex",
        alignItems: "center",
        gap:        "max(10px,0.729vw)",              // 14 px @ 1920
        padding:    "max(5.5px,0.391vw) max(14px,1.042vw)", // 7.5/20 px @ 1920
        width:      "100%",
        whiteSpace: "nowrap",
      }}>
        <span style={{
          fontFamily:    "var(--font-inter-tight,'Inter Tight','DM Sans',sans-serif)",
          fontWeight:    600,
          fontSize:      "max(7px,0.469vw)",          // 9 px @ 1920
          letterSpacing: "max(0.9px,0.061vw)",        // 1.17 px @ 1920
          textTransform: "uppercase",
          color:         "#F0EEE9",
          lineHeight:    "normal",
        }}>
          {label}
        </span>

        {/* Arrow — Figma node 14449:2707 */}
        <svg
          viewBox="0 0 13.3795 8.97882"
          fill="none"
          aria-hidden="true"
          style={{
            width:    "max(10px,0.667vw)",            // 12.8 px @ 1920
            height:   "max(7px,0.438vw)",             // 8.4 px @ 1920
            flexShrink: 0,
            overflow: "visible",
          }}
        >
          <path
            d="M0 4.29598H12.8M12.8 4.29598L8.4 0.295976M12.8 4.29598L8.4 8.69598"
            stroke="#F0EEE9"
            strokeWidth="0.8"
          />
        </svg>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} style={wrapperStyle} {...handlers}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} style={wrapperStyle} {...handlers}>
      {inner}
    </button>
  );
}
