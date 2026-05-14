"use client";

import Link from "next/link";

interface PixelButtonProps {
  label:         string;
  onClick?:      () => void;
  href?:         string;
  style?:        React.CSSProperties;
  "aria-label"?: string;
  type?:         "button" | "submit" | "reset";
  light?:        boolean;
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
  light = false,
}: PixelButtonProps) {
  const bodyBg    = light ? "#F0EEE9" : "#392D2B";
  const textColor = light ? "#392D2B" : "#F0EEE9";

  const { transition: extTrans, ...restStyle } = style ?? {};

  const wrapperStyle: React.CSSProperties = {
    position:      "relative",
    display:       "inline-flex",
    flexDirection: "column",
    alignItems:    "flex-start",
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

  const inner = (
    <>
      {/* Body rect */}
      <div style={{
        position:   "relative",
        background: bodyBg,
        display:    "flex",
        alignItems: "center",
        gap:        "max(10px,0.729vw)",
        height:     26,
        padding:    "0 max(14px,1.042vw)",
        width:      "100%",
        whiteSpace: "nowrap",
      }}>
        <span style={{
          fontFamily:    "var(--font-inter-tight,'Inter Tight','DM Sans',sans-serif)",
          fontWeight:    600,
          fontSize:      9,
          letterSpacing: "1.17px",
          textTransform: "uppercase",
          color:         textColor,
          lineHeight:    "normal",
        }}>
          {label}
        </span>

        {/* Arrow */}
        <svg
          viewBox="0 0 13.3795 8.97882"
          fill="none"
          aria-hidden="true"
          style={{
            width:    "max(10px,0.667vw)",
            height:   "max(7px,0.438vw)",
            flexShrink: 0,
            overflow: "visible",
          }}
        >
          <path
            d="M0 4.29598H12.8M12.8 4.29598L8.4 0.295976M12.8 4.29598L8.4 8.69598"
            stroke={textColor}
            strokeWidth="0.8"
          />
        </svg>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} style={wrapperStyle}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} style={wrapperStyle}>
      {inner}
    </button>
  );
}
