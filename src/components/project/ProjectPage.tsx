"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ContentBlock, SliderItem } from "@/types/blocks";
import { ProjectRenderer } from "./ProjectRenderer";

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

// ── Component ─────────────────────────────────────────────────────────────────
export function ProjectPage({ project, prevProject, nextProject }: Props) {
  const maskCanvasRef  = useRef<HTMLCanvasElement | null>(null);
  const dotGridRef     = useRef<HTMLDivElement | null>(null);
  const section2Ref    = useRef<HTMLElement | null>(null);
  const outroRef       = useRef<HTMLElement | null>(null);
  const parallaxBgRef  = useRef<HTMLDivElement | null>(null);

  const slides = project.slider_items.length > 0
    ? project.slider_items
    : project.cover_image
      ? [{ type: "image" as const, url: project.cover_image, alt: project.title }]
      : [];

  const [currentSlide,      setCurrentSlide]      = useState(0);
  const [heroTitleVisible,  setHeroTitleVisible]  = useState(false);
  const [heroTextVisible,   setHeroTextVisible]   = useState(false);
  const [s2PhotoVisible,    setS2PhotoVisible]    = useState(false);
  const [s2TitleVisible,    setS2TitleVisible]    = useState(false);
  const [s2TextVisible,     setS2TextVisible]     = useState(false);
  const [outroTitleVisible, setOutroTitleVisible] = useState(false);

  // Hero title / text entrance
  useEffect(() => {
    const t1 = window.setTimeout(() => setHeroTitleVisible(true), 200);
    const t2 = window.setTimeout(() => setHeroTextVisible(true), 1750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Auto-advance slider
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  // Dot mask canvas (hero overlay)
  useEffect(() => {
    const canvas        = maskCanvasRef.current;
    const dotGridElement = dotGridRef.current!;
    if (!canvas || !dotGridRef.current) return;

    const dotRadius  = 30;
    const dotDiameter = dotRadius * 2;
    const step       = dotDiameter + 1;
    let cols = 0, rows = 0;
    let holes        = new Set<string>();
    let removedHoles = new Set<string>();

    const drawMask = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgb(57,45,43)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "destination-out";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (!holes.has(`${col},${row}`)) continue;
          ctx.beginPath();
          ctx.arc(col * step + dotRadius, row * step + dotRadius, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const spawnNewHole = () => {
      for (let attempt = 0; attempt < 30; attempt++) {
        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);
        const key = `${col},${row}`;
        if (holes.has(key) || removedHoles.has(key)) continue;
        holes.add(key);
        const cx = col * step + dotRadius, cy = row * step + dotRadius;
        let progress = 0;
        const animate = () => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          progress += 0.1;
          if (progress >= 1) { drawMask(); addClickTarget(key, col, row, cx, cy); return; }
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = `rgba(0,0,0,${progress})`;
          ctx.beginPath();
          ctx.arc(cx, cy, dotRadius * progress, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
          requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        break;
      }
    };

    const removeHole = (key: string, cx: number, cy: number, target: HTMLDivElement) => {
      if (!holes.has(key)) return;
      holes.delete(key); removedHoles.add(key); target.remove();
      let progress = 1;
      const animate = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        progress -= 0.12;
        if (progress <= 0) { drawMask(); spawnNewHole(); return; }
        ctx.fillStyle = "rgb(57,45,43)";
        ctx.beginPath();
        ctx.arc(cx, cy, dotRadius * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    function addClickTarget(key: string, _col: number, _row: number, cx: number, cy: number) {
      const target = document.createElement("div");
      target.style.cssText = `position:absolute;left:${cx-dotRadius}px;top:${cy-dotRadius}px;width:${dotDiameter}px;height:${dotDiameter}px;border-radius:50%;cursor:pointer;pointer-events:auto;`;
      target.dataset.key = key;
      target.addEventListener("click", () => removeHole(key, cx, cy, target));
      dotGridElement.appendChild(target);
    }

    const setup = () => {
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      cols = Math.ceil(w / step) + 1; rows = Math.ceil(h / step) + 1;
      holes = new Set<string>(); removedHoles = new Set<string>();
      dotGridElement.innerHTML = "";
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++)
          if (Math.random() < 0.9) holes.add(`${col},${row}`);
      drawMask();
      holes.forEach(key => {
        const [col, row] = key.split(",").map(Number);
        addClickTarget(key, col, row, col * step + dotRadius, row * step + dotRadius);
      });
    };

    setup();
    window.addEventListener("resize", setup);
    return () => { window.removeEventListener("resize", setup); dotGridElement.innerHTML = ""; };
  }, []);

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
            setS2PhotoVisible(true); setS2TitleVisible(true);
            window.setTimeout(() => setS2TextVisible(true), 1350);
          }
          if (e.target === outro) setOutroTitleVisible(true);
        });
      },
      { threshold: [0, 0.5, 0.8] }
    );
    obs.observe(s2); obs.observe(outro);
    return () => obs.disconnect();
  }, []);

  // Parallax mouse on outro
  useEffect(() => {
    const section = outroRef.current;
    const bg      = parallaxBgRef.current;
    if (!section || !bg) return;
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

  const goToSlide = (i: number) => setCurrentSlide((i + slides.length) % slides.length);

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
      {/* ── Section 1: Hero ───────────────────────────────────────────── */}
      <section id="hero" className="project-hero" data-nav-dark>
        {project.cover_image && (
          <Image
            className="project-hero-bg-photo"
            src={project.cover_image}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "bottom" }}
          />
        )}
        <div className="project-hero-bg-overlay" />
        <canvas ref={maskCanvasRef} className="project-dot-mask-canvas" aria-hidden="true" />
        <div ref={dotGridRef} className="project-dot-grid" aria-hidden="true" />

        <div className="project-hero-slider" aria-label="Project image slider">
          {slides.map((slide, index) => (
            <div className={`project-hero-slide ${index === currentSlide ? "active" : ""}`} key={`${slide.url}-${index}`}>
              {slide.type === "video" ? (
                <video
                  src={slide.url}
                  poster={slide.thumbnail}
                  autoPlay muted loop playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Image
                  src={slide.url}
                  alt={slide.alt ?? ""}
                  fill
                  priority={index === 0}
                  sizes="(max-width:768px) 70vw, 33vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              )}
            </div>
          ))}

          {slides.length > 1 && (
            <>
              <button className="project-slider-arrow left" type="button" aria-label="Previous slide" onClick={() => goToSlide(currentSlide - 1)}>
                <svg viewBox="0 0 9 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="6,1 1,8.5 6,16" /></svg>
              </button>
              <button className="project-slider-arrow right" type="button" aria-label="Next slide" onClick={() => goToSlide(currentSlide + 1)}>
                <svg viewBox="0 0 9 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="3,1 8,8.5 3,16" /></svg>
              </button>
              <div className="project-slider-dots" aria-label="Choose project image">
                {slides.map((s, i) => (
                  <button
                    className={`project-slider-dot ${i === currentSlide ? "active" : ""}`}
                    key={`dot-${i}`}
                    type="button"
                    aria-label={`Show slide ${i + 1}`}
                    aria-current={i === currentSlide}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <h1 className="project-hero-title">
          <RevealTitle text={project.title} active={heroTitleVisible} />
        </h1>
        {project.short_description && (
          <p className={`project-hero-desc ${heroTextVisible ? "text-visible" : ""}`}>
            {project.short_description}
          </p>
        )}

        <div className="project-hero-nav">
          {prevProject ? (
            <Link className="project-nav-btn" href={`/design/${prevProject.slug}`}>
              <ArrowLeft />prev project
            </Link>
          ) : <span />}
          {nextProject ? (
            <Link className="project-nav-btn" href={`/design/${nextProject.slug}`}>
              next project<ArrowRight />
            </Link>
          ) : <span />}
        </div>
      </section>

      {/* ── Section 2: Info ───────────────────────────────────────────── */}
      <section ref={section2Ref} id="section2" className="project-section-2">
        <div className="project-s2-photo-wrap">
          <div className={`project-s2-photo ${s2PhotoVisible ? "in-view" : ""}`}>
            {project.cover_image && (
              <Image
                src={project.cover_image}
                alt={project.title}
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            )}
          </div>
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

      {/* ── Sections 3+: Dynamic content blocks ──────────────────────── */}
      {project.content_blocks.length > 0 && (
        <ProjectRenderer blocks={project.content_blocks} />
      )}

      {/* ── Outro ─────────────────────────────────────────────────────── */}
      <section ref={outroRef} id="outro" className="project-section-4">
        <div ref={parallaxBgRef} className="project-s4-bg">
          {project.cover_image && (
            <Image
              src={project.cover_image}
              alt=""
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
        <Link className="project-s4-start-btn" href="/contacts">
          Start your project
        </Link>
      </section>

      {/* ── CSS (preserved exactly from original) ────────────────────── */}
      <style jsx global>{`
        .project-page { background:var(--color-dark,#392d2b); color:var(--color-dark,#392d2b); overflow-x:hidden; }
        .project-hero { position:relative; width:100vw; height:100vh; min-height:600px; overflow:hidden; background:var(--color-dark,#392d2b); contain:strict; }
        .project-hero-bg-photo,.project-hero-bg-overlay,.project-dot-mask-canvas,.project-dot-grid { position:absolute; inset:0; }
        .project-hero-bg-photo { z-index:0; transform:scaleX(-1); }
        .project-hero-bg-overlay { background:rgba(0,0,0,0.5); z-index:1; pointer-events:none; }
        .project-dot-mask-canvas { z-index:2; pointer-events:none; width:100%; height:100%; max-width:100vw; max-height:100vh; }
        .project-dot-grid { z-index:4; pointer-events:auto; overflow:hidden; width:100%; height:100%; max-width:100vw; max-height:100vh; }
        .project-hero-title { position:relative; left:clamp(16px,1.56vw,30px); top:clamp(50px,12.4vh,150px); margin:0; font-family:var(--font-rader,"PP Rader",sans-serif); font-weight:400; font-size:clamp(36px,3.65vw,70px); line-height:0.9; color:var(--color-surface,#f0eee9); z-index:10; pointer-events:none; }
        .project-hero-desc { position:relative; left:clamp(16px,1.56vw,30px); top:clamp(110px,15.5vh,140px); width:clamp(200px,20vw,360px); margin:0; font-family:var(--font-inter-tight,"Inter Tight",sans-serif); font-size:clamp(11px,1.04vw,20px); line-height:1.2; color:var(--color-surface,#f0eee9); z-index:10; opacity:0; transition:opacity 0.8s ease; }
        .project-hero-desc.text-visible { opacity:1; }
        .project-hero-slider { position:absolute; right:5%; top:50%; transform:translateY(-50%); width:33%; height:75vh; z-index:9; overflow:hidden; }
        .project-hero-slide { position:absolute; inset:0; opacity:0; transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1); pointer-events:none; }
        .project-hero-slide.active { opacity:1; pointer-events:auto; }
        .project-slider-arrow { position:absolute; top:50%; transform:translateY(-50%); z-index:12; width:clamp(32px,2.3vw,44px); height:clamp(32px,2.3vw,44px); border:1px solid rgba(240,238,233,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; background:rgba(57,45,43,0.25); color:var(--color-surface,#f0eee9); transition:background 250ms ease,transform 250ms ease; }
        .project-slider-arrow:hover { background:rgba(57,45,43,0.5); transform:translateY(-50%) scale(1.04); }
        .project-slider-arrow.left { left:10px; }
        .project-slider-arrow.right { right:10px; }
        .project-slider-arrow svg { width:9px; height:17px; }
        .project-slider-dots { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:12; }
        .project-slider-dot { width:5px; height:5px; border-radius:50%; border:0; padding:0; background:rgba(240,238,233,0.4); cursor:pointer; transition:background 0.3s ease,transform 0.3s ease; }
        .project-slider-dot.active,.project-slider-dot:hover { background:rgba(240,238,233,0.95); transform:scale(1.2); }
        .project-hero-nav { position:absolute; bottom:clamp(20px,3.7vh,40px); left:clamp(16px,1.56vw,30px); right:clamp(16px,1.56vw,30px); display:flex; justify-content:space-between; align-items:center; z-index:10; }
        .project-nav-btn { display:flex; align-items:center; gap:8px; background:none; border:none; cursor:pointer; font-family:var(--font-inter-tight,"Inter Tight",sans-serif); font-weight:700; font-size:clamp(7px,0.47vw,9px); letter-spacing:1.17px; color:var(--color-surface,#f0eee9); text-transform:uppercase; text-decoration:none; transition:opacity 250ms ease,transform 250ms ease; }
        .project-nav-btn:hover { opacity:0.72; transform:translateY(-1px); }
        .project-section-2 { width:100vw; height:100vh; min-height:600px; display:grid; grid-template-columns:1fr 1fr; overflow:hidden; background:var(--color-grey-light,#e7e6e4); contain:layout; }
        .project-s2-photo-wrap { overflow:hidden; position:relative; }
        .project-s2-photo { position:absolute; inset:-10%; transform:translateY(60px); opacity:0; transition:transform 1.1s cubic-bezier(0.16,1,0.3,1),opacity 1.1s cubic-bezier(0.16,1,0.3,1); }
        .project-s2-photo.in-view { transform:translateY(0); opacity:1; }
        .project-s2-info { background:var(--color-surface,#f0eee9); display:flex; flex-direction:column; padding:clamp(40px,5.2vh,100px) clamp(20px,1.56vw,30px) clamp(20px,2.8vh,30px); justify-content:space-between; }
        .project-s2-title { margin:0; font-family:var(--font-rader,"PP Rader",sans-serif); font-weight:400; font-size:clamp(28px,3.65vw,70px); line-height:0.9; color:var(--color-dark,#392d2b); text-align:right; }
        .project-s2-bottom { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; }
        .project-s2-details,.project-s2-desc { font-family:var(--font-inter-tight,"Inter Tight",sans-serif); font-size:clamp(11px,1.04vw,20px); line-height:1.2; color:var(--color-dark,#392d2b); flex:1; opacity:0; transition:opacity 0.9s ease; }
        .project-s2-details.text-visible,.project-s2-desc.text-visible { opacity:1; }
        .project-s2-desc { margin:0; padding-top:clamp(10px,2.5vh,24px); }
        .project-section-4 { width:100vw; height:100vh; min-height:600px; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; contain:layout; }
        .project-s4-bg { position:absolute; inset:-6%; will-change:transform; transition:transform 0.12s ease-out; }
        .project-s4-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.22); z-index:1; }
        .project-s4-content { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:clamp(16px,2vh,28px); }
        .project-s4-nav { display:flex; gap:clamp(60px,8vw,160px); align-items:center; }
        .project-s4-title { margin:0; font-family:var(--font-rader,"PP Rader",sans-serif); font-weight:400; font-size:clamp(28px,3.65vw,70px); line-height:0.9; color:var(--color-surface,#f0eee9); text-align:center; }
        .project-s4-start-btn { position:absolute; bottom:clamp(40px,8.6vh,93px); height:92px; display:flex; flex-direction:column; align-items:center; gap:8px; background:none; border:none; cursor:pointer; font-family:var(--font-inter-tight,"Inter Tight",sans-serif); font-weight:700; font-size:clamp(7px,0.47vw,9px); letter-spacing:1.17px; color:var(--color-surface,#f0eee9); text-transform:uppercase; text-decoration:none; z-index:2; transition:opacity 250ms ease; }
        .project-s4-start-btn:hover { opacity:0.72; }
        .project-s4-start-btn::after { content:""; display:block; width:1px; height:clamp(40px,5vh,77px); background:var(--color-surface,#f0eee9); margin-top:6px; }
        .project-word { display:inline-block; margin-right:0.28em; white-space:nowrap; }
        .project-char { display:inline-block; opacity:0; filter:blur(8px); transform:translateY(6px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),filter 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .project-char.visible { opacity:1; filter:blur(0); transform:translateY(0); }
        @media (max-width:768px) {
          .project-hero-slider { width:min(58vw,360px); height:56vh; right:clamp(16px,5vw,30px); }
          .project-section-2 { grid-template-columns:1fr; height:auto; min-height:unset; }
          .project-s2-photo-wrap { height:50vw; min-height:220px; }
          .project-s2-info { min-height:320px; }
          .project-s2-bottom { flex-direction:column; align-items:stretch; }
          .project-s4-nav { gap:clamp(18px,5vw,40px); }
        }
      `}</style>
    </article>
  );
}
