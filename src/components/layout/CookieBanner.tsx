"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "css_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#392D2B",
        color: "#F0EEE9",
        fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "14px 20px",
        maxWidth: "calc(100vw - 32px)",
        width: "max-content",
        animation: "cookie-in 0.4s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <style>{`
        @keyframes cookie-in {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 600px) {
          .css-cookie-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }
          .css-cookie-actions {
            width: 100%;
            justify-content: flex-end !important;
          }
        }
      `}</style>

      <div className="css-cookie-inner" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "nowrap" }}>
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, letterSpacing: "0.02em", opacity: 0.85, maxWidth: 480 }}>
          We use cookies to improve your experience and analyze site traffic.{" "}
          <Link href="/privacy-policy" style={{ color: "#F0EEE9", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Privacy Policy
          </Link>
        </p>

        <div className="css-cookie-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              background: "transparent",
              border: "1px solid rgba(240,238,233,0.28)",
              color: "rgba(240,238,233,0.65)",
              fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
              fontWeight: 600, fontSize: 9,
              letterSpacing: "1.1px",
              textTransform: "uppercase",
              padding: "6px 14px",
              cursor: "pointer",
              height: 26,
              whiteSpace: "nowrap",
            }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            style={{
              background: "#F0EEE9",
              border: "none",
              color: "#392D2B",
              fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
              fontWeight: 600, fontSize: 9,
              letterSpacing: "1.1px",
              textTransform: "uppercase",
              padding: "6px 14px",
              cursor: "pointer",
              height: 26,
              whiteSpace: "nowrap",
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
