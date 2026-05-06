"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    eapps?: { AppsManager?: { reload?: () => void } };
  }
}

const NAV_LINKS = [
  { label: "Cloud Stone", href: "/" },
  { label: "Design",      href: "/design" },
  { label: "Bathrooms",   href: "/bathrooms" },
  { label: "Shop",        href: "/shop" },
  { label: "About",       href: "/about" },
] as const;

const OVERLAY_LINKS = NAV_LINKS.filter(l => l.href !== "/");

const HEADER_H = 60; // px — detection zone height for dark-section sensing

function HamburgerLines({ color }: { color: string }) {
  return (
    <>
      <div style={{ width: 30, height: 1.5, background: color, borderRadius: 1, transition: "background 350ms ease" }} />
      <div style={{ width: 23, height: 1.5, background: color, borderRadius: 1, transition: "background 350ms ease" }} />
      <div style={{ width: 15, height: 1.5, background: color, borderRadius: 1, transition: "background 350ms ease" }} />
    </>
  );
}

export function Navbar() {
  const pathname    = usePathname();
  const [expanded,   setExpanded]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [nearTop,    setNearTop]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navOnDark,  setNavOnDark]  = useState(false);
  const darkSectionsRef = useRef<Element[]>([]);

  // ── Detect [data-nav-dark] sections under the header ──────────────────
  useEffect(() => {
    const refresh = () => {
      darkSectionsRef.current = Array.from(document.querySelectorAll("[data-nav-dark]"));
    };

    const check = () => {
      let onDark = false;
      for (const el of darkSectionsRef.current) {
        const r = el.getBoundingClientRect();
        if (r.top < HEADER_H && r.bottom > 0) { onDark = true; break; }
      }
      setNavOnDark(onDark);
    };

    refresh();
    check();

    // Re-scan after hydration delay (dynamic sections may render late)
    const t = window.setTimeout(() => { refresh(); check(); }, 150);

    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.clearTimeout(t);
    };
  }, [pathname]);

  // ── Scroll / mouse proximity ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY > 30;
      setScrolled(s);
      if (s) setExpanded(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setNearTop(e.clientY < 60);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    setExpanded(false);
    setMobileOpen(false);
    window.eapps?.AppsManager?.reload?.();
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Home page has its own embedded nav
  if (pathname === "/") return null;

  // ── Color tokens — derived from navOnDark ─────────────────────────────
  // navOnDark = true  → header is over a dark section → use LIGHT pill
  // navOnDark = false → header is over a light section → use DARK pill
  const pillBg      = navOnDark ? "#F0EEE9" : "#392D2B";
  const lineColor   = navOnDark ? "#392D2B" : "#F0EEE9";
  const activeBg    = navOnDark ? "#392D2B" : "#F0EEE9";
  const activeText  = navOnDark ? "#F0EEE9" : "#392D2B";
  const inactiveText = navOnDark ? "#392D2B" : "#F0EEE9";

  const navPixelClass = `nav-pixel${navOnDark ? " nav-pixel--light" : ""}`;

  const hamburgerBtnStyle: React.CSSProperties = {
    border:          "none",
    cursor:          "pointer",
    display:         "flex",
    flexDirection:   "column",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             5,
    padding:         "0px 40px",
    height:          26,
    marginRight:     29,
    flexShrink:      0,
    background:      pillBg,
    transition:      "background-color 350ms ease",
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const hidden = scrolled && !nearTop && !expanded;

  const linkPanel = (
    <div
      style={{
        overflow:    "hidden",
        maxWidth:    expanded ? 600 : 0,
        background:  pillBg,
        opacity:     expanded ? 1 : 0,
        paddingLeft: 10,
        height:      26,
        transition:  "max-width 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease, background-color 350ms ease",
        display:     "flex",
      }}
    >
      <div style={{ display: "flex", gap: 2, paddingRight: 4 }}>
        {NAV_LINKS.map(({ label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setExpanded(false)}
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                padding:        "6px 8px",
                background:     active ? activeBg : "transparent",
                textDecoration: "none",
                whiteSpace:     "nowrap",
                flexShrink:     0,
                fontFamily:     "var(--font-inter-tight,'Inter Tight','DM Sans',sans-serif)",
                fontWeight:     600,
                fontSize:       9,
                letterSpacing:  "1.17px",
                textTransform:  "uppercase" as const,
                color:          active ? activeText : inactiveText,
                transition:     "color 350ms ease, background-color 350ms ease",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* nav_hiden.svg — appears when desktop nav slides off-screen */}
      <div
        className="hidden lg:block"
        style={{
          position:      "fixed",
          top:           0,
          left:          "50%",
          transform:     "translateX(-50%)",
          zIndex:        50,
          opacity:       hidden ? 1 : 0,
          transition:    "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/design/nav_hiden.svg"
          alt=""
          width={224}
          height={20}
          style={{ filter: navOnDark ? "brightness(10)" : "none", transition: "filter 350ms ease" }}
        />
      </div>

      {/* ── Desktop full header row ──────────────────────────────────── */}
      <header
        className="hidden lg:flex"
        style={{
          position:       "fixed",
          left:           0,
          right:          0,
          top:            hidden ? -100 : 0,
          height:         86,
          padding:        "30px 30px 0",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          zIndex:         50,
          transition:     "top 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Logo — crossfade between dark and light versions */}
        <Link href="/" aria-label="Cloud Stone Studio home">
          <div style={{ position: "relative", width: "clamp(58px,4.2vw,80px)", height: "clamp(50px,3.6vw,70px)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/LOGO.svg"
              alt="Cloud Stone Studio"
              style={{
                position:   "absolute",
                inset:      0,
                width:      "100%",
                height:     "100%",
                objectFit:  "contain",
                opacity:    navOnDark ? 0 : 1,
                transition: "opacity 350ms ease",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo-light.svg"
              alt=""
              aria-hidden
              style={{
                position:   "absolute",
                inset:      0,
                width:      "100%",
                height:     "100%",
                objectFit:  "contain",
                opacity:    navOnDark ? 1 : 0,
                transition: "opacity 350ms ease",
              }}
            />
          </div>
        </Link>

        {/* Nav pill — absolute center */}
        <div style={{ position: "absolute", left: "50%", top: 30, transform: "translateX(-50%)" }}>
          <div className={navPixelClass} style={{ paddingRight: 0 }}>
            {linkPanel}
            <button
              onClick={() => setExpanded(v => !v)}
              aria-label={expanded ? "Close navigation" : "Open navigation"}
              aria-expanded={expanded}
              style={hamburgerBtnStyle}
            >
              {expanded ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <line x1="0.5"  y1="0.5"  x2="12.5" y2="12.5" stroke={lineColor} strokeWidth="1.3" strokeLinecap="round"/>
                  <line x1="12.5" y1="0.5"  x2="0.5"  y2="12.5" stroke={lineColor} strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              ) : (
                <HamburgerLines color={lineColor} />
              )}
            </button>
          </div>
        </div>

        {/* Weather widget — overflow:hidden clips Elfsight branding at bottom */}
        <div style={{ marginTop: -4, overflow: "hidden" }}>
          <div style={{ marginBottom: -44 }}>
            <div
              className="elfsight-app-8294ddb1-6460-4546-8caf-0266985ad33c"
              data-elfsight-app-lazy
              style={{ width: 90 }}
            />
          </div>
        </div>
      </header>

      {/* ── Mobile header ────────────────────────────────────────────── */}
      <header
        className="flex lg:hidden"
        style={{
          position:       "fixed",
          top:            0,
          left:           0,
          right:          0,
          height:         70,
          padding:        "16px 16px 0",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          zIndex:         50,
        }}
      >
        <Link href="/" aria-label="Cloud Stone Studio home">
          <div style={{ position: "relative", width: 58, height: 50 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/LOGO.svg"
              alt="Cloud Stone Studio"
              style={{
                position:   "absolute",
                inset:      0,
                width:      "100%",
                height:     "100%",
                objectFit:  "contain",
                opacity:    navOnDark ? 0 : 1,
                transition: "opacity 350ms ease",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo-light.svg"
              alt=""
              aria-hidden
              style={{
                position:   "absolute",
                inset:      0,
                width:      "100%",
                height:     "100%",
                objectFit:  "contain",
                opacity:    navOnDark ? 1 : 0,
                transition: "opacity 350ms ease",
              }}
            />
          </div>
        </Link>

        <div className={navPixelClass} style={{ paddingRight: 0 }}>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={hamburgerBtnStyle}
          >
            <HamburgerLines color={lineColor} />
          </button>
        </div>
      </header>

      {/* ── Mobile fullscreen overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position:      "fixed",
              inset:         0,
              zIndex:        60,
              background:    "#392D2B",
              display:       "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px 0" }}>
              <Link href="/" onClick={() => setMobileOpen(false)} aria-label="Home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Logo-light.svg"
                  alt="Cloud Stone Studio"
                  style={{ width: 58, height: "auto" }}
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#F0EEE9", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "var(--font-inter-tight)", fontWeight: 600,
                  fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
                }}
              >
                Close
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M1 1L15 15M15 1L1 15" stroke="#F0EEE9" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px", gap: 4 }}>
              {OVERLAY_LINKS.map(({ label, href }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontFamily:     "var(--font-rader)",
                      fontWeight:     700,
                      fontSize:       "clamp(48px,6.3vw,120px)",
                      lineHeight:     0.95,
                      letterSpacing:  "-0.03em",
                      textTransform:  "uppercase",
                      color:          "#F0EEE9",
                      textDecoration: "none",
                      display:        "block",
                    }}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div style={{
              padding:       "24px 30px",
              display:       "flex",
              justifyContent: "space-between",
              fontFamily:    "var(--font-rader)",
              fontWeight:    700,
              fontSize:      10,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color:         "#F0EEE9",
              opacity:       0.5,
            }}>
              <span>cloud stone studio</span>
              <span>© 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
