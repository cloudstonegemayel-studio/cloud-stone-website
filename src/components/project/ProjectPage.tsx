"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ContentBlock, SliderItem } from "@/types/blocks";
import { ProjectRenderer } from "./ProjectRenderer";
import { PixelButton } from "@/components/ui/PixelButton";
import { Footer } from "@/components/layout/Footer";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ProjectData {
  id:               string;
  slug:             string;
  title:            string;
  short_description: string | null;
  description:      string | null;
  cover_image:      string | null;
  slider_items:     SliderItem[];
  project_year:     number | null;
  project_type:     string | null;
  project_status:   string | null;
  location:         string | null;
  client:           string | null;
  site_area:        string | null;
  content_blocks:   ContentBlock[];
  section2_image:   string | null;
  section2_image_alt: string | null;
  section4_image:   string | null;
  section4_image_alt: string | null;
}

export interface AdjacentProject { slug: string; title: string }

interface Props {
  project:     ProjectData;
  prevProject: AdjacentProject | null;
  nextProject: AdjacentProject | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
type RevealTitleProps = { text: string; active: boolean; className?: string };

function RevealTitle({ text, active, className = "" }: RevealTitleProps) {
  let offset = 0;
  return (
    <span aria-label={text} className={className}>
      {text.split(" ").map((word, wi) => {
        const start = offset;
        offset += word.length;
        return (
          <span className="project-word" key={`${word}-${wi}`}>
            {word.split("").map((char, ci) => (
              <span
                aria-hidden="true"
                className={`project-char ${active ? "visible" : ""}`}
                key={`${wi}-${ci}-${char}`}
                style={{ transitionDelay: `${(start + ci) * 22}ms` }}
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

function ArrowLeft() {
  return (
    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden="true">
      <path d="M12 4.5H1M1 4.5L5 1M1 4.5L5 8" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden="true">
      <path d="M1 4.5H12M12 4.5L8 1M12 4.5L8 8" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

// ── Video embed helper ────────────────────────────────────────────────────────
function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1`;
  }
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  return null;
}

function SlideMedia({ slide }: { slide: SliderItem }) {
  if (slide.type === "video") {
    const embedUrl = getEmbedUrl(slide.url);
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          title="Project video"
        />
      );
    }
    // Fallback for direct video files
    return (
      <video
        src={slide.url}
        poster={slide.thumbnail}
        autoPlay muted loop playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <Image
      src={slide.url}
      alt={slide.alt ?? ""}
      fill
      sizes="50vw"
      style={{ objectFit: "cover", objectPosition: "center" }}
    />
  );
}

// ── Horizontal slider — controlled by forcedIndex (page scroll) ──────────────
function HorizontalSlider({ slides, forcedIndex = 0 }: { slides: SliderItem[]; forcedIndex?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Drive slide from page-scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: forcedIndex * el.offsetWidth, behavior: "smooth" });
    setActiveIdx(forcedIndex);
  }, [forcedIndex]);

  // Also sync dot when user manually swipes on touch devices
  useEffect(() => {
    const el = containerRef.current;
    if (!el || slides.length <= 1) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveIdx(Math.min(idx, slides.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  const goTo = (i: number) => {
    containerRef.current?.scrollTo({ left: i * (containerRef.current?.offsetWidth ?? 0), behavior: "smooth" });
  };

  return (
    <div className="proj-slider-wrap">
      <div ref={containerRef} className="proj-slider-track">
        {slides.map((slide, i) => (
          <div className="proj-slider-slide" key={`${slide.url}-${i}`}>
            <SlideMedia slide={slide} />
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="proj-slider-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`proj-slider-dot${i === activeIdx ? " active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ProjectPage({ project, prevProject, nextProject }: Props) {
  const section2Ref    = useRef<HTMLElement | null>(null);
  const outroRef       = useRef<HTMLElement | null>(null);
  const parallaxBgRef  = useRef<HTMLDivElement | null>(null);
  const sliderWrapRef  = useRef<HTMLDivElement | null>(null);

  const slides = project.slider_items.length > 0
    ? project.slider_items
    : project.cover_image
      ? [{ type: "image" as const, url: project.cover_image, alt: project.title }]
      : [];

  const [s2TitleVisible,    setS2TitleVisible]    = useState(false);
  const [s2TextVisible,     setS2TextVisible]     = useState(false);
  const [outroTitleVisible, setOutroTitleVisible] = useState(false);
  const [gyroPermission,    setGyroPermission]    = useState<"idle" | "pending" | "granted" | "denied">("idle");
  const [currentSlide,      setCurrentSlide]      = useState(0);

  // Section 2 & outro intersection observer
  useEffect(() => {
    const s2    = section2Ref.current;
    const outro = outroRef.current;
    if (!s2 || !outro) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.intersectionRatio < 0.5) return;
          if (e.target === s2) {
            setS2TitleVisible(true);
            window.setTimeout(() => setS2TextVisible(true), 800);
          }
          if (e.target === outro) {
            setOutroTitleVisible(true);
            if (window.matchMedia("(hover: none)").matches && gyroPermission === "idle") {
              type DOE = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
              if (typeof (DeviceOrientationEvent as DOE).requestPermission === "function") {
                setGyroPermission("pending");
              } else {
                setGyroPermission("granted");
              }
            }
          }
        });
      },
      { threshold: [0, 0.5, 0.8] }
    );
    obs.observe(s2); obs.observe(outro);
    return () => obs.disconnect();
  }, [gyroPermission]);

  // Parallax on outro: cursor on desktop
  useEffect(() => {
    const section = outroRef.current;
    const bg      = parallaxBgRef.current;
    if (!section || !bg) return;
    if (window.matchMedia("(hover: none)").matches) return;
    let tx = 0, ty = 0, cx2 = 0, cy2 = 0, frame = 0;
    const strength = 18;
    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      tx = (e.clientX / window.innerWidth  - 0.5) * strength;
      ty = (e.clientY / window.innerHeight - 0.5) * strength;
    };
    const animate = () => {
      cx2 += (tx - cx2) * 0.07; cy2 += (ty - cy2) * 0.07;
      bg.style.transform = `translate(${cx2}px,${cy2}px) scale(1.12)`;
      frame = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove);
    frame = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(frame); };
  }, []);

  // Gyroscope parallax on mobile
  useEffect(() => {
    if (gyroPermission !== "granted") return;
    const bg = parallaxBgRef.current;
    if (!bg) return;
    let tx = 0, ty = 0, cx2 = 0, cy2 = 0, frame = 0;
    const onOrientation = (e: DeviceOrientationEvent) => {
      tx = Math.max(-15, Math.min(15, (e.gamma ?? 0) / 3));
      ty = Math.max(-10, Math.min(10, ((e.beta  ?? 45) - 45) / 4.5));
    };
    const animate = () => {
      cx2 += (tx - cx2) * 0.06; cy2 += (ty - cy2) * 0.06;
      bg.style.transform = `translate(${cx2}px,${cy2}px) scale(1.12)`;
      frame = requestAnimationFrame(animate);
    };
    window.addEventListener("deviceorientation", onOrientation, true);
    frame = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation, true);
      cancelAnimationFrame(frame);
    };
  }, [gyroPermission]);

  // Drive slider via page scroll (sticky section technique)
  useEffect(() => {
    if (slides.length <= 1) return;
    const onScroll = () => {
      const wrapper = sliderWrapRef.current;
      if (!wrapper) return;
      const rect     = wrapper.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = wrapper.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const idx = Math.min(slides.length - 1, Math.round((scrolled / maxScroll) * (slides.length - 1)));
      setCurrentSlide(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  const requestGyroPermission = async () => {
    type DOE = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    try {
      const result = await (DeviceOrientationEvent as DOE).requestPermission!();
      setGyroPermission(result === "granted" ? "granted" : "denied");
    } catch { setGyroPermission("denied"); }
  };

  const detailRows = [
    project.project_status && `Project Status: ${project.project_status}`,
    project.project_year   && `Project Year: ${project.project_year}`,
    project.client         && `Client: ${project.client}`,
    project.site_area      && `Site Area: ${project.site_area}`,
    project.location       && `Location: ${project.location}`,
    project.project_type   && `Project Type: ${project.project_type}`,
  ].filter(Boolean) as string[];

  return (
    <article className="project-page">
      {/* ── Section 2: Sticky scroll wrapper + Slider + Info ─────── */}
      <div
        ref={sliderWrapRef}
        className="proj-sticky-wrapper"
        style={{ "--slide-count": slides.length } as React.CSSProperties}
      >
      <section ref={section2Ref} id="section2" className="project-section-2">
        <div className="project-s2-photo-wrap">
          <HorizontalSlider slides={slides} forcedIndex={currentSlide} />
        </div>
        <div className="project-s2-info">
          <h2 className="project-s2-title">
            <RevealTitle text={project.title} active={s2TitleVisible} />
          </h2>
          <div className="project-s2-bottom">
            {detailRows.length > 0 && (
              <div className={`project-s2-details ${s2TextVisible ? "text-visible" : ""}`}>
                {detailRows.map((row, i) => (
                  <span key={i}>{row}<br /></span>
                ))}
              </div>
            )}
            {project.description && (
              <p className={`project-s2-desc ${s2TextVisible ? "text-visible" : ""}`}>
                {project.description}
              </p>
            )}
          </div>
        </div>
      </section>
      </div>{/* end proj-sticky-wrapper */}

      {/* ── Sections 3+: Dynamic content blocks ──────────────────── */}
      {project.content_blocks.length > 0 && (
        <ProjectRenderer blocks={project.content_blocks} />
      )}

      {/* ── Outro ─────────────────────────────────────────────────── */}
      <section ref={outroRef} id="outro" className="project-section-4">
        <div ref={parallaxBgRef} className="project-s4-bg">
          {(project.section4_image || project.cover_image) && (
            <Image
              src={project.section4_image ?? project.cover_image!}
              alt={project.section4_image_alt ?? ""}
              fill
              sizes="112vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          )}
        </div>
        <div className="project-s4-overlay" />
        <div className="project-s4-content">
          <div className="project-s4-nav">
            {prevProject ? (
              <Link className="project-nav-btn" href={`/design/${prevProject.slug}`}>
                <ArrowLeft />prev project
              </Link>
            ) : <span />}
            <h2 className="project-s4-title">
              <RevealTitle text={project.title} active={outroTitleVisible} />
            </h2>
            {nextProject ? (
              <Link className="project-nav-btn" href={`/design/${nextProject.slug}`}>
                next project<ArrowRight />
              </Link>
            ) : <span />}
          </div>
        </div>
        {gyroPermission === "pending" && (
          <button
            type="button"
            onClick={requestGyroPermission}
            className="project-s4-gyro-btn"
          >
            Enable motion
          </button>
        )}
        <div style={{ position: "absolute", bottom: "clamp(40px,8.6vh,93px)", left: "50%", transform: "translateX(-50%)", zIndex: 3 }}>
          <PixelButton href="/contacts" label="Inquire" light />
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .project-page { background:var(--color-dark,#392d2b); color:var(--color-dark,#392d2b); overflow-x:hidden; }

        /* ── Sticky scroll wrapper (desktop landscape only) ───────── */
        .proj-sticky-wrapper { height: calc(var(--slide-count, 1) * 100vh); }
        .proj-sticky-wrapper .project-section-2 { position:sticky; top:0; height:100vh; min-height:unset; }
        @media (max-width:767px),(orientation:portrait) {
          .proj-sticky-wrapper { height:auto !important; }
          .proj-sticky-wrapper .project-section-2 { position:static; height:auto; min-height:auto; }
        }

        /* ── Section 2: Slider + Info ─────────────── */
        .project-section-2 { width:100vw; min-height:100vh; display:grid; grid-template-columns:1fr 1fr; overflow:hidden; background:var(--color-grey-light,#e7e6e4); }
        .project-s2-photo-wrap { overflow:hidden; position:relative; min-height:100vh; }
        .project-s2-info { background:var(--color-surface,#f0eee9); display:flex; flex-direction:column; padding:clamp(40px,5.2vh,100px) clamp(20px,1.56vw,30px) clamp(20px,2.8vh,30px); justify-content:space-between; }
        .project-s2-title { margin:0; font-family:var(--font-rader,"PP Rader",sans-serif); font-weight:400; font-size:clamp(28px,3.65vw,70px); line-height:0.9; color:var(--color-dark,#392d2b); text-align:right; }
        .project-s2-bottom { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; }
        .project-s2-details,.project-s2-desc { font-family:var(--font-inter-tight,"Inter Tight",sans-serif); font-size:clamp(11px,1.04vw,20px); line-height:1.2; color:var(--color-dark,#392d2b); flex:1; opacity:0; transition:opacity 0.9s ease; }
        .project-s2-details.text-visible,.project-s2-desc.text-visible { opacity:1; }
        .project-s2-desc { margin:0; padding-top:clamp(10px,2.5vh,24px); }

        /* ── Horizontal slider ─────────────────────── */
        .proj-slider-wrap { position:relative; width:100%; height:100%; min-height:100vh; }
        .proj-slider-track {
          display:flex; width:100%; height:100%; min-height:100vh;
          overflow-x:scroll; scroll-snap-type:x mandatory;
          scrollbar-width:none; -ms-overflow-style:none;
        }
        .proj-slider-track::-webkit-scrollbar { display:none; }
        .proj-slider-slide {
          flex:0 0 100%; width:100%; height:100%; min-height:100vh;
          scroll-snap-align:start; position:relative;
          overflow:hidden;
        }
        .proj-slider-dots {
          position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
          display:flex; gap:6px; z-index:4;
        }
        .proj-slider-dot {
          width:5px; height:5px; border-radius:50%; border:0; padding:0;
          background:rgba(240,238,233,0.4); cursor:pointer;
          transition:background 0.3s ease, transform 0.3s ease;
        }
        .proj-slider-dot.active,.proj-slider-dot:hover {
          background:rgba(240,238,233,0.95); transform:scale(1.2);
        }

        /* ── Outro ─────────────────────────────────── */
        .project-section-4 { width:100vw; height:100vh; min-height:600px; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; }
        .project-s4-bg { position:absolute; inset:-6%; will-change:transform; transition:transform 0.12s ease-out; }
        .project-s4-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.22); z-index:1; }
        .project-s4-content { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:clamp(16px,2vh,28px); }
        .project-s4-nav { display:flex; gap:clamp(60px,8vw,160px); align-items:center; }
        .project-s4-title { margin:0; font-family:var(--font-rader,"PP Rader",sans-serif); font-weight:400; font-size:clamp(28px,3.65vw,70px); line-height:0.9; color:var(--color-surface,#f0eee9); text-align:center; }
        .project-s4-gyro-btn {
          position:absolute; bottom:clamp(180px,23vh,230px);
          background:rgba(240,238,233,0.15); border:1px solid rgba(240,238,233,0.4);
          color:var(--color-surface,#f0eee9); cursor:pointer;
          font-family:var(--font-inter-tight,"Inter Tight",sans-serif);
          font-weight:700; font-size:9px; letter-spacing:1.17px; text-transform:uppercase;
          padding:8px 16px; z-index:3;
          transition:background 250ms ease;
        }
        .project-s4-gyro-btn:hover { background:rgba(240,238,233,0.25); }

        /* ── Shared ─────────────────────────────────── */
        .project-nav-btn { display:flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer; font-family:var(--font-inter-tight,"Inter Tight",sans-serif); font-weight:700; font-size:clamp(7px,0.47vw,9px); letter-spacing:1.17px; color:var(--color-surface,#f0eee9); text-transform:uppercase; text-decoration:none; transition:opacity 250ms ease,transform 250ms ease; }
        .project-nav-btn:hover { opacity:0.72; transform:translateY(-1px); }
        .project-word { display:inline-block; margin-right:0.28em; white-space:nowrap; }
        .project-char { display:inline-block; opacity:0; filter:blur(8px); transform:translateY(6px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),filter 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .project-char.visible { opacity:1; filter:blur(0); transform:translateY(0); }

        @media (max-width:767px),(orientation:portrait) {
          .project-section-2 { grid-template-columns:1fr; min-height:auto; }
          .project-s2-photo-wrap { min-height:50vh; height:50vh; }
          .proj-slider-wrap,.proj-slider-track,.proj-slider-slide { min-height:50vh; height:50vh; }
          .project-s2-info { min-height:50vh; }
          .project-s2-bottom { flex-direction:column; align-items:stretch; }
          .project-s4-nav { gap:clamp(18px,5vw,40px); }
        }
      `}</style>
    </article>
  );
}
