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
  { label: "Objects",     href: "/shop" },
  { label: "About",       href: "/about" },
  { label: "Contact",     href: "/contacts" },
] as const;

const OVERLAY_LINKS = NAV_LINKS.filter(l => l.href !== "/");

const HEADER_H = 60; // px — detection zone height for dark-section sensing

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
    marginRight:     0,
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
        paddingLeft: 0,
        height:      26,
        transition:  "max-width 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease, background-color 350ms ease",
        display:     "flex",
      }}
    >
      <div style={{ display: "flex", gap: 2, paddingRight: 0 }}>
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
          width={178}
          height={15}
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

        <div style={{ width: 90 }} />
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
                aria-label=""
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#F0EEE9", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "var(--font-inter-tight)", fontWeight: 600,
                  fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
                }}
              >
                
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M1 1L15 15M15 1L1 15" stroke="#F0EEE9" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px 16px", gap: 4 }}>
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

            {/* Contact icons */}
            <div style={{ display: "flex", gap: 28, padding: "0 16px 16px", alignItems: "center" }}>
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
              padding:       "16px",
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
