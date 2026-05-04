"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type PanelSide = "left" | "right";

type InfoCopy = {
  side: PanelSide;
  title: string;
  description: ReactNode;
  href: string;
};

const infoCopy: Record<PanelSide, InfoCopy> = {
  left: {
    side: "left",
    title: "Gemayel Group",
    href: "/gemayel-group",
    description:
"Gemayel Group — a third-generation stone factory founded in Lebanon over 50 years ago, now supporting architectural projects in New York.",

      
  },
  right: {
    side: "right",
    title: "CloudStone_Bathrooms",
    href: "/cloudstone-bathrooms",
    description: (
      <>
        Cloud Stone Studio is the design arm of Gemayel Group.
        <br />
        Stone Bathrooms Designed, Fabricated, and Installed — from our factory to your space.
      </>
    ),
  },
};

function RevealedTitle({ text, active }: { text: string; active: boolean }) {
  let offset = 0;
  return (
    <span aria-label={text} className="s5-reveal-title">
      {text.split(" ").map((word, wordIndex) => {
        const start = offset;
        offset += word.length;
        return (
          <span className="s5-word" key={`${word}-${wordIndex}`}>
            {word.split("").map((char, charIndex) => (
              <span
                aria-hidden
                className={`s5-char ${active ? "visible" : ""}`}
                key={`${char}-${wordIndex}-${charIndex}`}
                style={{ transitionDelay: `${(start + charIndex) * 22}ms` }}
              >
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

function InfoPanel({ copy, active, titleRevealed }: {
  copy: InfoCopy; active: boolean; titleRevealed: boolean;
}) {
  return (
    <div className={`s5-info-panel ${active ? "active" : ""}`} aria-hidden={!active}>
      <div className="s5-info-texture" />
      <div className="s5-info-content">
        <div className="s5-info-text">
          <h2 className="s5-info-title">
            <RevealedTitle text={copy.title} active={titleRevealed} />
          </h2>
          <p className="s5-info-desc">{copy.description}</p>
        </div>
        {active && (
          <div className="s5-open-hint">
            <span>Click to open presentation</span>
            <span className="s5-hint-arrow">→</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BathroomsPage() {
  const router      = useRouter();
  const sectionRef  = useRef<HTMLElement | null>(null);
  const cursorRef   = useRef<HTMLDivElement | null>(null);
  const [revealed,      setRevealed]      = useState(false);
  const [hoveredPanel,  setHoveredPanel]  = useState<PanelSide | null>(null);
  const [activeInfo,    setActiveInfo]    = useState<PanelSide | null>(null);
  const [revealedTitles, setRevealedTitles] = useState<Record<PanelSide, boolean>>({ left: false, right: false });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [firstTap,      setFirstTap]      = useState<PanelSide | null>(null);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.intersectionRatio >= 0.8) { setRevealed(true); observer.disconnect(); } },
      { threshold: [0, 0.5, 0.8, 1] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const cursor  = cursorRef.current;
    if (!section || !cursor) return;
    const handleMove  = (e: MouseEvent) => { cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`; };
    const handleLeave = () => cursor.classList.remove("visible");
    section.addEventListener("mousemove", handleMove);
    section.addEventListener("mouseleave", handleLeave);
    return () => { section.removeEventListener("mousemove", handleMove); section.removeEventListener("mouseleave", handleLeave); };
  }, []);

  const showInfo = (panel: PanelSide) => {
    const target: PanelSide = panel === "left" ? "right" : "left";
    setHoveredPanel(panel);
    setActiveInfo(target);
    setRevealedTitles(c => ({ ...c, [target]: true }));
    cursorRef.current?.classList.add("visible");
  };

  const hideInfo = () => { setHoveredPanel(null); setActiveInfo(null); };

  const handlePanelClick = (physicalPanel: PanelSide, href: string) => {
    if (!isTouchDevice) {
      router.push(href);
      return;
    }
    if (firstTap !== physicalPanel) {
      setFirstTap(physicalPanel);
      showInfo(physicalPanel);
    } else {
      setFirstTap(null);
      hideInfo();
      router.push(href);
    }
  };

  return (
    <section ref={sectionRef} id="section5" className="s5-section" aria-label="Bathroom collections">
      {/* Left panel — CloudStone_Bathrooms */}
      <div
        className={`s5-panel ${hoveredPanel === "left" ? "info-showing" : ""}`}
        id="s5-left"
        onMouseEnter={() => showInfo("left")}
        onMouseLeave={hideInfo}
        onClick={() => handlePanelClick("left", infoCopy.right.href)}
        onFocus={() => showInfo("left")}
        onBlur={hideInfo}
        tabIndex={0}
        role="link"
        aria-label={`Open ${infoCopy.right.title} presentation`}
      >
        <div className={`s5-photo ${revealed ? "slide-in" : ""}`}>
          <Image src="/images/bath-left.png" alt="CloudStone bathroom interior" fill priority sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover", objectPosition: "center" }} />
        </div>
        <div className="s5-photo-overlay" />
        <h1 className="s5-photo-title">CloudStone_Bathrooms</h1>
        <InfoPanel copy={infoCopy.left} active={activeInfo === "left"} titleRevealed={revealedTitles.left} />
      </div>

      {/* Right panel — Gemayel Group */}
      <div
        className={`s5-panel ${hoveredPanel === "right" ? "info-showing" : ""}`}
        id="s5-right"
        onMouseEnter={() => showInfo("right")}
        onMouseLeave={hideInfo}
        onClick={() => handlePanelClick("right", infoCopy.left.href)}
        onFocus={() => showInfo("right")}
        onBlur={hideInfo}
        tabIndex={0}
        role="link"
        aria-label={`Open ${infoCopy.left.title} presentation`}
      >
        <div className={`s5-photo s5-photo-right ${revealed ? "slide-in" : ""}`}>
          <Image src="/images/bath-right.png" alt="Gemayel Group stone bathroom detail" fill priority sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover", objectPosition: "center" }} />
        </div>
        <div className="s5-photo-overlay" />
        <h2 className="s5-photo-title s5-photo-title-right">Gemayel Group</h2>
        <InfoPanel copy={infoCopy.right} active={activeInfo === "right"} titleRevealed={revealedTitles.right} />
      </div>

      <div ref={cursorRef} id="s5-cursor" aria-hidden>
        <div id="s5-cursor-icon">→</div>
        <span id="s5-cursor-label">Click to open<br />presentation</span>
      </div>

      <style jsx global>{`
        .s5-section {
          width: 100%; max-width: 100vw; height: 100vh; min-height: 600px;
          display: grid; grid-template-columns: 1fr 1fr;
          overflow: hidden; position: relative;
          background: var(--color-surface,#f0eee9); contain: layout;
        }
        .s5-panel {
          position: relative; overflow: hidden;
          cursor: none; outline: none;
        }
        .s5-photo {
          position: absolute; inset: 0;
          transform: translateY(100%); opacity: 0;
          transition: transform 1.1s cubic-bezier(0.16,1,0.3,1), opacity 1.1s cubic-bezier(0.16,1,0.3,1);
          z-index: 1;
        }
        .s5-photo-right { transition-delay: 0.12s; }
        .s5-photo.slide-in { transform: translateY(0); opacity: 1; }
        .s5-photo-overlay { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
        #s5-left .s5-photo-overlay  { background: rgba(0,0,0,0.22); }
        #s5-right .s5-photo-overlay { background: rgba(0,0,0,0.12); }
        .s5-photo-title {
          position: absolute; left: clamp(16px,1.56vw,30px); bottom: clamp(16px,1.56vw,30px);
          margin: 0; font-family: var(--font-rader,"PP Rader",sans-serif);
          font-weight: 400; font-size: clamp(22px,3.65vw,70px);
          line-height: 0.9; color: var(--color-surface,#f0eee9);
          z-index: 3; pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .s5-photo-title-right { left: auto; right: clamp(16px,1.56vw,30px); text-align: right; }
        .s5-panel.info-showing .s5-photo-title { opacity: 0; }
        .s5-info-panel {
          position: absolute; inset: 0;
          background: var(--color-surface,#f5f1ec); z-index: 5;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(20px,1.56vw,30px); opacity: 0;
          transition: opacity 0.55s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden; pointer-events: none;
        }
        .s5-info-panel.active { opacity: 1; pointer-events: auto; }
        .s5-info-texture {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
        }
        .s5-info-texture::before {
          content: ""; position: absolute; inset: 0;
          background: var(--color-surface,#f0eee9); opacity: 0.25;
        }
        .s5-info-texture::after {
          content: ""; position: absolute; inset: 0;
          background: url("/images/MWPixel.svg") center/cover no-repeat; opacity: 1;
        }
        .s5-info-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: row;
          justify-content: space-between; align-items: flex-end;
        }
        .s5-info-text { max-width: 65%; }
        .s5-info-title {
          margin: 0 0 16px;
          font-family: var(--font-rader,"PP Rader",sans-serif);
          font-weight: 400; font-size: clamp(22px,3.65vw,70px);
          line-height: 0.9; color: var(--color-dark,#392d2b);
        }
        .s5-info-desc {
          margin: 0; font-family: var(--font-inter-tight,"Inter Tight",sans-serif);
          font-size: clamp(11px,1.04vw,20px); line-height: 1.2; color: var(--color-dark,#392d2b);
        }
        .s5-open-hint {
          display: flex; align-items: center; gap: 8;
          font-family: var(--font-inter-tight,"Inter Tight",sans-serif);
          font-size: 9px; font-weight: 600; textTransform: uppercase;
          letter-spacing: 1.17px; color: rgba(57,45,43,0.5);
          padding: 8px 12px; background: rgba(57,45,43,0.08);
          animation: s5-hint-in 0.4s ease both;
        }
        .s5-hint-arrow { font-size: 14px; }
        .s5-word { display: inline-block; margin-right: 0.28em; white-space: nowrap; }
        .s5-char {
          display: inline-block; opacity: 0; filter: blur(8px); transform: translateY(6px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .s5-char.visible { opacity: 1; filter: blur(0); transform: translateY(0); }
        #s5-cursor {
          position: fixed; pointer-events: none; z-index: 9999;
          display: none; flex-direction: column; align-items: center; gap: 6px;
          transform: translate(-50%,-50%);
        }
        #s5-cursor.visible { display: flex; }
        #s5-cursor-icon {
          width: 36px; height: 36px;
          background: #392D2B; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #F0EEE9; font-size: 16px;
        }
        #s5-cursor-label {
          font-family: var(--font-inter-tight,"Inter Tight",sans-serif);
          font-weight: 700; font-size: 9px; letter-spacing: 1.17px;
          color: var(--color-surface,#f0eee9);
          text-transform: uppercase; white-space: nowrap;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5); text-align: center;
        }
        @keyframes s5-hint-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .s5-section { grid-template-columns: 1fr; height: auto; min-height: unset; }
          .s5-panel { height: 50vw; min-height: 220px; cursor: pointer; }
          .s5-info-text { max-width: min(82%,520px); }
          #s5-cursor { display: none !important; }
        }
      `}</style>
    </section>
  );
}
