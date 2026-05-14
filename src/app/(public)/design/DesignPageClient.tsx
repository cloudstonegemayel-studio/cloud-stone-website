"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { drawFrame, TrailPoint, TRAIL_MS } from "@/lib/circleGrid";
import { PixelButton } from "@/components/ui/PixelButton";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  slug: string;
  number: string;
  title: string;
  status: string;
  year: string;
  sketch: string;
  thumbnail: string;
  lightText: boolean;
}

type ViewMode = "canvas" | "grid";

// ── Card constants ─────────────────────────────────────────────────────────────
const CARD_W  = 215;
const IMG_H   = 267;
const INFO_H  = 57;
const CARD_H  = IMG_H + INFO_H;

// ── Column Y-position patterns ─────────────────────────────────────────────────
const COL_Y_PATS: number[][] = [
  [0.08],
  [0.55],
  [0.12, 0.65],
  [0.35],
  [0.05, 0.60],
  [0.48],
  [0.18, 0.68],
  [0.60],
  [0.28],
  [0.04, 0.57],
];

// ── Shared card inner ─────────────────────────────────────────────────────────
function CardInner({
  project, hovered, onEnter, onLeave, isLink,
}: {
  project: Project; hovered: boolean;
  onEnter: () => void; onLeave: () => void;
  isLink?: boolean;
}) {
  const textColor = project.lightText ? "#F0EEE9" : "#392D2B";

  const inner = (
    <div
      style={{ width: CARD_W, height: CARD_H, position: "relative", overflow: "visible", cursor: "pointer" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Sketch */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: IMG_H,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.35s ease",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.sketch || "/images/design/project-draft.svg"}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>

      {/* Photo overlay */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }}>
        {project.thumbnail && (
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            sizes={`${CARD_W}px`}
            style={{
              objectFit: "cover", objectPosition: "center",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        )}
      </div>

      {/* Info row */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: INFO_H,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingLeft: 14, paddingRight: 14, zIndex: 4,
      }}>
        <span style={{
          fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
          fontWeight: 500, fontSize: 14,
          letterSpacing: "-0.295px", textTransform: "uppercase", lineHeight: "75%",
          color: hovered ? textColor : "#392D2B",
          transition: "color 0.3s ease", whiteSpace: "nowrap",
        }}>
          [{project.number}]
        </span>
        <span style={{
          fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
          fontWeight: 400, fontSize: 12, lineHeight: "120%",
          textTransform: "uppercase",
          color: hovered ? textColor : "#392D2B",
          transition: "color 0.3s ease",
          textAlign: "right", maxWidth: "75%",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {project.title}
        </span>
      </div>

    </div>
  );

  if (isLink) {
    return (
      <Link href={`/design/${project.slug}`} style={{ textDecoration: "none", display: "block" }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

// ── Canvas card ────────────────────────────────────────────────────────────────
function CanvasCard({ project, x, y, hovered, onEnter, onLeave }: {
  project: Project; x: number; y: number;
  hovered: boolean; onEnter: () => void; onLeave: () => void;
}) {
  return (
    <div className="design-canvas-card" style={{ position: "absolute", left: x, top: y, userSelect: "none" }}>
      <CardInner project={project} hovered={hovered} onEnter={onEnter} onLeave={onLeave} />
    </div>
  );
}

// ── Grid card ──────────────────────────────────────────────────────────────────
function GridCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  return (
    <CardInner
      project={project}
      hovered={hovered}
      onEnter={() => setHovered(true)}
      onLeave={() => setHovered(false)}
      isLink
    />
  );
}

// ── Canvas view ────────────────────────────────────────────────────────────────
function CanvasView({ projects }: { projects: Project[] }) {
  const router    = useRouter();
  const innerRef  = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const dragRef        = useRef<{ x0: number; y0: number; s0: number } | null>(null);
  const edgeSpdRef     = useRef(0);
  const rafRef         = useRef(0);
  const clickTargetRef = useRef<Project | null>(null);
  const [vw, setVw]   = useState(1920);
  const [vpH, setVpH] = useState(900);
  const [hovKey, setHovKey] = useState<string | null>(null);
  const [hovProject, setHovProject] = useState<Project | null>(null);

  useEffect(() => {
    const update = () => { setVw(window.innerWidth); setVpH(window.innerHeight); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    scrollRef.current = vw;
    if (innerRef.current) innerRef.current.style.transform = `translateX(${-vw}px)`;
  }, [vw]);

  useEffect(() => {
    const tick = () => {
      const SEG = vw;
      if (!dragRef.current) scrollRef.current += edgeSpdRef.current;
      if (scrollRef.current < SEG * 0.5)  scrollRef.current += SEG;
      if (scrollRef.current > SEG * 1.5)  scrollRef.current -= SEG;
      if (innerRef.current) innerRef.current.style.transform = `translateX(${-scrollRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [vw]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) return;
      const zone = 120;
      if      (e.clientX < zone)       edgeSpdRef.current = -((zone - e.clientX) / zone) * 4;
      else if (e.clientX > vw - zone)  edgeSpdRef.current = ((e.clientX - (vw - zone)) / zone) * 4;
      else                             edgeSpdRef.current = 0;
    };
    const onLeave = () => { edgeSpdRef.current = 0; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, [vw]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Snapshot hover target NOW — setPointerCapture below triggers mouseleave
    // on children, which would set hovProject → null before pointerup fires.
    clickTargetRef.current = hovProject;
    dragRef.current = { x0: e.clientX, y0: e.clientY, s0: scrollRef.current };
    edgeSpdRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const SEG = vw;
    scrollRef.current = dragRef.current.s0 - (e.clientX - dragRef.current.x0);
    if (scrollRef.current < SEG * 0.05) scrollRef.current += SEG;
    if (scrollRef.current > SEG * 2.95) scrollRef.current -= SEG;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      const dist = Math.hypot(e.clientX - dragRef.current.x0, e.clientY - dragRef.current.y0);
      if (dist < 8 && clickTargetRef.current) {
        router.push(`/design/${clickTargetRef.current.slug}`);
      }
    }
    dragRef.current = null;
    clickTargetRef.current = null;
  };

  const isLandscapeMobile = vpH < 500 && vw >= 768;
  const numCols   = Math.min(5, Math.max(2, Math.floor(vw / CARD_W)));
  const colW      = vw / numCols;
  const margin    = Math.max(2, (colW - CARD_W) / 2);
  const available = isLandscapeMobile
    ? vpH * 2 - CARD_H + 80
    : vpH - CARD_H + 80;

  const displayProjects = projects.length ? projects : [];

  const slots: { col: number; yFrac: number; projIdx: number }[] = [];
  let projIdx = 0;
  for (let c = 0; c < numCols; c++) {
    const pat = COL_Y_PATS[c % COL_Y_PATS.length];
    for (const yFrac of pat) {
      slots.push({ col: c, yFrac, projIdx: projIdx++ });
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: isLandscapeMobile ? "200vh" : "100%",
        overflow: "hidden",
        cursor: "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={innerRef}
        style={{ position: "absolute", top: 20, left: 0, width: vw * 3, height: isLandscapeMobile ? "200vh" : "100%", willChange: "transform" }}
      >
        {[0, 1, 2].flatMap(copy =>
          slots.map(({ col, yFrac, projIdx: pi }) => {
            const x   = copy * vw + col * colW + margin;
            const y   = 40 + yFrac * available;
            const key = `${copy}-${col}-${yFrac}`;
            const project = displayProjects[pi % (displayProjects.length || 1)];
            if (!project) return null;
            return (
              <CanvasCard
                key={key}
                project={project}
                x={x} y={y}
                hovered={hovKey === key}
                onEnter={() => { setHovKey(key); setHovProject(project); edgeSpdRef.current = 0; }}
                onLeave={() => { setHovKey(null); setHovProject(null); }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Grid view ──────────────────────────────────────────────────────────────────
function GridView({ projects }: { projects: Project[] }) {
  return (
    <div className="design-grid-view">
      {projects.map(p => <GridCard key={p.id} project={p} />)}
    </div>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────────
function FilterBar({ mode, onMode }: {
  mode: ViewMode; onMode: (m: ViewMode) => void;
}) {
  return (
    <div className="nav-pixel filter-nav-pixel" style={{ paddingRight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, background: "#392D2B", height: 26, paddingLeft: 16, paddingRight: 16, flexShrink: 0 }}>
        <div className="design-view-toggle" style={{ display: "contents" }}>
          <span style={{
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontWeight: 600,
            fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
            color: mode === "canvas" ? "#F0EEE9" : "rgba(240,238,233,0.38)",
            transition: "color 0.2s ease", flexShrink: 0, userSelect: "none",
          }}>Canvas</span>
          <button
            onClick={() => onMode(mode === "canvas" ? "grid" : "canvas")}
            aria-label={mode === "canvas" ? "Switch to grid view" : "Switch to canvas view"}
            style={{
              position: "relative", width: 30, height: 11,
              background: "rgba(240,238,233,0.18)", borderRadius: 99,
              border: "none", cursor: "pointer", flexShrink: 0, padding: 0, margin: "0 4px",
            }}
          >
            <div style={{
              position: "absolute", top: 1, left: mode === "canvas" ? 1 : 12,
              width: 17, height: 9, background: "#F0EEE9", borderRadius: 99,
              transition: "left 0.25s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </button>
          <span style={{
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontWeight: 600,
            fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
            color: mode === "grid" ? "#F0EEE9" : "rgba(240,238,233,0.38)",
            transition: "color 0.2s ease", flexShrink: 0, userSelect: "none",
          }}>Grid</span>
        </div>
      </div>
    </div>
  );
}

// ── CTA Section ────────────────────────────────────────────────────────────────
function CTASection() {
  const [entered, setEntered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setEntered(true); },
      { threshold: 0.5 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const titleLines = ["Start" , " your project"];
  const DELAY = 0.15;

  return (
    <section ref={sectionRef} className="flex flex-col md:flex-row min-h-screen md:h-screen overflow-hidden relative">
      <div className="w-full md:w-1/2 h-[45vh] md:h-full relative overflow-hidden">
        <div style={{
          position: "absolute", inset: 0, minHeight: "50vh",
          transform: entered ? "translateY(0)" : "translateY(100vh)",
          transition: "transform 1.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <Image
            src="/images/design/yayay.png"
            alt="CTA background"
            fill
            sizes="50vw"
            style={{ objectFit: "cover", objectPosition: "center bottom" }}
            priority
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-between items-center px-[15px] md:px-[30px]">
        <h2 style={{
          fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
          fontWeight: 400, fontSize: "clamp(40px, 3.6vw, 70px)", lineHeight: "90%", textAlign: "right", width: "100%",
          letterSpacing: "-0.7px", color: "#392D2B", margin: "80px 0 60px",
        }}>
          {titleLines.map((line, i) => (
            <span key={i} style={{ display: "inline-block" }}>
              <span style={{
                display: "inline-block",
                color: i === 0 ? "#C86733" : "#392D2B",
                opacity: entered ? 1 : 0,
                filter: entered ? "blur(0px)" : "blur(10px)",
                transform: entered ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${DELAY + i * 0.12}s, filter 0.7s cubic-bezier(0.16,1,0.3,1) ${DELAY + i * 0.12}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${DELAY + i * 0.12}s`,
              }}>
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(16px)",
          transition: `opacity 0.7s ease ${DELAY + 0.3}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${DELAY + 0.3}s`,
          maxWidth: 500, minWidth: "40%",
        }}>
          <p style={{ fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontSize: 20, lineHeight: 1.2, color: "#392D2B", margin: "0 0 24px" }}>
            Tell us what <span style={{ color: "#C86733" }}>you&apos;re building</span>.<br />
            We&apos;ll take it from concept <span style={{ color: "#C86733" }}>to reality</span>.
          </p>
          <CTAForm />
        </div>
      </div>
    </section>
  );
}

function CTAForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) as never });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source_page: "Design — CTA" }),
      });
      if (res.ok) { setStatus("success"); reset(); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#DEDBD6", border: "none", outline: "none",
    padding: "8px 10px",
    fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
    fontWeight: 500, fontSize: 12, lineHeight: 1.2, color: "#392D2B", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
    fontWeight: 500, fontSize: 12, lineHeight: 1.2,
    color: "#392D2B", display: "block", marginBottom: 8, textTransform: "uppercase",
  };
  const errStyle: React.CSSProperties = { fontSize: 10, color: "#C86733", marginTop: 4, display: "block" };

  if (status === "success") {
    return (
      <p style={{ fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontSize: 14, color: "#392D2B", lineHeight: 1.5 }}>
        Thank you! We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label htmlFor="cta-name" style={labelStyle}>Name</label>
        <input id="cta-name" {...register("name")} placeholder="Your full name"
          style={{ ...inputStyle, color: errors.name ? "#C86733" : "#392D2B" }} />
        {errors.name && <span style={errStyle}>{errors.name.message}</span>}
      </div>
      <div>
        <label htmlFor="cta-email" style={labelStyle}>Email</label>
        <input id="cta-email" type="email" {...register("email")} placeholder="your@email.com"
          style={{ ...inputStyle, color: errors.email ? "#C86733" : "#392D2B" }} />
        {errors.email && <span style={errStyle}>{errors.email.message}</span>}
      </div>
      <div>
        <label htmlFor="cta-phone" style={labelStyle}>Phone (optional)</label>
        <input id="cta-phone" type="tel" {...register("phone")} placeholder="+1 XXX XXX-XXX" style={inputStyle} />
      </div>
      <div>
        <label htmlFor="cta-subject" style={labelStyle}>Subject (optional)</label>
        <input id="cta-subject" {...register("subject")} placeholder="Project type, scope ..." style={inputStyle} />
      </div>
      <div>
        <label htmlFor="cta-message" style={labelStyle}>Message</label>
        <textarea id="cta-message" {...register("message")} placeholder="Tell us about your project, timeline, and vision ..."
          rows={4} style={{ ...inputStyle, resize: "none", display: "block", paddingBottom: 50,
            color: errors.message ? "#C86733" : "#392D2B" }} />
        {errors.message && <span style={errStyle}>{errors.message.message}</span>}
      </div>
      <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <PixelButton label={status === "loading" ? "Sending..." : "Send Request"} type="submit" />
        {status === "error" && (
          <p style={{ marginTop: 8, fontSize: 11, color: "#C86733",
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)" }}>
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}

// ── FAQ Section ────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "How long does a project take?", a: "Project timelines vary by scope and complexity — typically 3–12 months for residential and 6–18 months for commercial work. We provide a detailed schedule during the initial consultation." },
  { q: "Do you work internationally?",  a: "Yes, we collaborate with clients worldwide. Our team has experience delivering projects across North America, Europe, and the Middle East." },
  { q: "What is your design process?",  a: "We begin with a discovery session to understand your vision, then move through concept, design development, documentation, and implementation phases — keeping you involved at every step." },
  { q: "Can you work with a fixed budget?", a: "Absolutely. We are transparent about costs from the start and design to the best of our ability within your budget constraints." },
  { q: "Do you handle construction management?", a: "Yes, we offer full construction administration services, coordinating directly with contractors to ensure the design is built as intended." },
] as const;

function CloudPlusIcon({ minus, color }: { minus: boolean; color: string }) {
  return (
    <div style={{ position: "relative", width: 56, height: 38 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 39" fill="#F6F5F2" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d="M40.6769 28.3965C40.6769 28.3965 36.9445 38.1942 27.6133 38.1942C18.7486 38.6608 14.5496 29.3296 14.5496 29.3296C14.5496 29.3296 4.75181 33.5286 1.0193 24.1974C-1.40682 18.1321 4.97063 12.0668 8.01768 12.0668C8.01768 12.0668 9.15931 6.46812 14.5496 5.06845C19.9398 3.66877 24.5303 6.38562 24.3473 6.93469C24.1646 7.48281 27.6132 -1.46339 36.0113 0.869396C43.4763 2.94301 43.4763 11.1337 43.4763 11.1337C43.4763 11.1337 57.9396 8.80092 56.5399 22.3312C53.7406 34.9283 40.6769 28.3965 40.6769 28.3965Z"
          fill="#F6F5F2" stroke={color} strokeWidth="1" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 300, fontSize: 28, lineHeight: 1, color, marginTop: -2, zIndex: 999 }}>
          {minus ? "−" : "+"}
        </span>
      </div>
    </div>
  );
}

function FAQItem({ item, index, entered }: {
  item: typeof FAQ_ITEMS[number]; index: number; entered: boolean;
}) {
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(false);
  const active = hovered || open;
  const delay  = 0.05 + index * 0.08;

  return (
    <div style={{
      position: "relative",
      opacity: entered ? 1 : 0,
      transform: entered ? "translateY(0)" : "translateY(8px)",
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 1, overflow: "visible", pointerEvents: "none", zIndex: 1 }} preserveAspectRatio="none">
        <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#392D2B" strokeWidth="1"
          pathLength={1} strokeDasharray={1}
          strokeDashoffset={entered ? 0 : 1}
          style={{ transition: `stroke-dashoffset 0.8s ease ${delay + 0.1}s` }}
        />
      </svg>

      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingLeft: 10, height: 80, width: "100%",
          background: "transparent", border: "none", cursor: "pointer",
          textAlign: "left", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "#392D2B",
          clipPath: `inset(0 ${active ? "0%" : "100%"} 0 0)`,
          transition: "clip-path 0.5s cubic-bezier(0.16,1,0.3,1)",
        }} />

        <div style={{
          display: "flex", gap: 30, alignItems: "center",
          position: "relative", zIndex: 1,
          color: active ? "#F0EEE9" : "#392D2B",
          transition: "color 0.15s ease",
        }}>
          <span style={{ fontFamily: "var(--font-rader,'PP Rader',sans-serif)", fontWeight: 400, fontSize: 70, lineHeight: "80px", letterSpacing: "-0.7px", width: 80, flexShrink: 0 }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontWeight: 400, fontSize: 20, lineHeight: 1.2, whiteSpace: "pre-wrap" }}>
            {item.q}
          </span>
        </div>
        <div style={{ paddingRight: 20, flexShrink: 0, position: "relative", zIndex: 999 }}>
          <CloudPlusIcon minus={open} color={active ? "#392D2B" : "#392D2B"} />
        </div>
      </button>

      <div style={{ overflow: "hidden", maxHeight: open ? 200 : 0, transition: "max-height 0.45s cubic-bezier(0.16,1,0.3,1)", background: "#F0EEE9", outline: "1px solid #392D2B", outlineOffset: "-1px" }}>
        <p style={{ fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontWeight: 400, fontSize: 20, lineHeight: 1.2, color: "#392D2B", padding: "20px 14px", margin: 0 }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [entered, setBoth] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBoth(true); },
      { threshold: 0.5 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: "150px 30px", position: "relative" }}>
      <h2 style={{
        fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
        fontWeight: 400, fontSize: 70, lineHeight: "90%",
        letterSpacing: "-0.7px", color: "#392D2B", margin: "0 0 30px",
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}>
        FAQ
      </h2>

      <div style={{ position: "relative" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} preserveAspectRatio="none">
          <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)"
            fill="none" stroke="#392D2B" strokeWidth="1"
            pathLength={1} strokeDasharray={1}
            strokeDashoffset={entered ? 0 : 1}
            style={{ transition: "stroke-dashoffset 1.2s ease 0.2s" }}
          />
        </svg>
        {FAQ_ITEMS.map((item, i) => (
          <FAQItem key={i} item={item} index={i} entered={entered} />
        ))}
      </div>
    </section>
  );
}

// ── Dot background ────────────────────────────────────────────────────────────
function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const t0Ref     = useRef<number>(0);
  const trailRef  = useRef<TrailPoint[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    t0Ref.current = performance.now();

    const frame = (now: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const t   = now - t0Ref.current;
      trailRef.current = trailRef.current.filter(p => now - p.t < TRAIL_MS);
      drawFrame(ctx, c.width, c.height, t * 0.000018, -t * 0.000006, trailRef.current, now);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    const onResize = () => {
      if (canvas) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    const onMove   = (e: MouseEvent) => {
      const now = performance.now();
      const trail = trailRef.current;
      const last  = trail[0];
      if (!last || (e.clientX - last.x) ** 2 + (e.clientY - last.y) ** 2 > 49) {
        trail.unshift({ x: e.clientX, y: e.clientY, t: now });
        if (trail.length > 40) trail.length = 40;
      }
    };
    const onLeave = () => { trailRef.current = []; };

    window.addEventListener("resize",     onResize);
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",     onResize);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none", display: "block" }}
    />
  );
}

// ── Page client ───────────────────────────────────────────────────────────────
export function DesignPageClient({ projects }: { projects: Project[] }) {
  const [mode, setMode] = useState<ViewMode>("canvas");
  const [isLandscapeMobileSec, setIsLandscapeMobileSec] = useState(false);

  const displayProjects = projects;
  const isCanvas = mode === "canvas";

  const handleMode = useCallback((m: ViewMode) => setMode(m), []);

  // Force grid view on small screens; detect landscape mobile for section height
  useEffect(() => {
    const check = () => {
      const lm = window.innerWidth >= 768 && window.innerHeight < 500;
      setIsLandscapeMobileSec(lm);
      if (window.innerWidth < 768) setMode("grid");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {/* Fixed dot background — sits behind all sections (z:0) */}
     {/*<DotBackground />*/}

      <div style={{ position: "relative", overflowX: "hidden" }}>
      {/* Section 1: opaque background covers the dot canvas */}
      <section
        style={{
          position: "relative",
          height: isCanvas ? (isLandscapeMobileSec ? "200vh" : "100vh") : "auto",
          minHeight: "100vh",
          overflow: isCanvas && isLandscapeMobileSec ? "visible" : "hidden",
          background: "#F0EEE9",
          zIndex: 1,
        }}
      >
        {isCanvas
          ? <CanvasView projects={displayProjects} />
          : <GridView  projects={displayProjects} />
        }

        {/* Filter bar */}
        <div className="design-filter-wrap">
          <FilterBar mode={mode} onMode={handleMode} />
        </div>
      </section>

    </div>
    </>
  );
}
