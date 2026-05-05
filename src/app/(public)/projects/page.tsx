"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  { src: "/images/img1.png", alt: "Project view 1" },
  { src: "/images/img2.png", alt: "Project view 2" },
  { src: "/images/img3.png", alt: "Project view 3" },
  { src: "/images/img4.png", alt: "Project view 4" },
] as const;

const PROJECT_TITLE = "Studio Twenty Seven";
const PROJECT_COPY =
  "At Studio Twenty Seven, we designed three architectural moments that unfold slowly, each revealing a deeper layer of the gallery's world.";
const DETAIL_COPY =
  "The first is a pair of concealed doors that open not into another room, but into a secret library - a sanctuary of books, art, and quiet density, illuminated like a hidden thought.";

type RevealTitleProps = {
  text: string;
  active: boolean;
  className?: string;
};

function RevealTitle({ text, active, className = "" }: RevealTitleProps) {
  let offset = 0;

  return (
    <span aria-label={text} className={className}>
      {text.split(" ").map((word, wordIndex) => {
        const start = offset;
        offset += word.length;

        return (
          <span className="project-word" key={`${word}-${wordIndex}`}>
            {word.split("").map((char, charIndex) => (
              <span
                aria-hidden="true"
                className={`project-char ${active ? "visible" : ""}`}
                key={`${wordIndex}-${charIndex}-${char}`}
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

export default function ProjectsPage() {
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotGridRef = useRef<HTMLDivElement | null>(null);
  const section2Ref = useRef<HTMLElement | null>(null);
  const section3Ref = useRef<HTMLElement | null>(null);
  const section4Ref = useRef<HTMLElement | null>(null);
  const parallaxBgRef = useRef<HTMLDivElement | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroTitleVisible, setHeroTitleVisible] = useState(false);
  const [heroTextVisible, setHeroTextVisible] = useState(false);
  const [s2PhotoVisible, setS2PhotoVisible] = useState(false);
  const [s2TitleVisible, setS2TitleVisible] = useState(false);
  const [s2TextVisible, setS2TextVisible] = useState(false);
  const [s3SmallVisible, setS3SmallVisible] = useState(false);
  const [s3BigVisible, setS3BigVisible] = useState(false);
  const [s3TextVisible, setS3TextVisible] = useState(false);
  const [s4TitleVisible, setS4TitleVisible] = useState(false);

  useEffect(() => {
    const titleTimer = window.setTimeout(() => setHeroTitleVisible(true), 200);
    const textTimer = window.setTimeout(() => setHeroTextVisible(true), 1750);

    return () => {
      window.clearTimeout(titleTimer);
      window.clearTimeout(textTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % SLIDES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = maskCanvasRef.current;
    const dotGridElement = dotGridRef.current!;
    if (!canvas || !dotGridRef.current) return;

    const dotRadius = 30;
    const dotDiameter = dotRadius * 2;
    const step = dotDiameter + 1;
    let cols = 0;
    let rows = 0;
    let holes = new Set<string>();
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
          const key = `${col},${row}`;
          if (!holes.has(key)) continue;
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
        const cx = col * step + dotRadius;
        const cy = row * step + dotRadius;
        let progress = 0;

        const animate = () => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          progress += 0.1;

          if (progress >= 1) {
            drawMask();
            addClickTarget(key, col, row, cx, cy);
            return;
          }

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
      holes.delete(key);
      removedHoles.add(key);
      target.remove();

      let progress = 1;
      const animate = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        progress -= 0.12;

        if (progress <= 0) {
          drawMask();
          spawnNewHole();
          return;
        }

        ctx.fillStyle = "rgb(57,45,43)";
        ctx.beginPath();
        ctx.arc(cx, cy, dotRadius * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    };

    function addClickTarget(key: string, col: number, row: number, cx: number, cy: number) {
      const target = document.createElement("div");
      target.style.cssText = `
        position:absolute;
        left:${cx - dotRadius}px;
        top:${cy - dotRadius}px;
        width:${dotDiameter}px;
        height:${dotDiameter}px;
        border-radius:50%;
        cursor:pointer;
        pointer-events:auto;
      `;
      target.dataset.key = key;
      target.addEventListener("click", () => removeHole(key, cx, cy, target));
      dotGridElement.appendChild(target);
    }

    const setupDotMask = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / step) + 1;
      rows = Math.ceil(height / step) + 1;
      holes = new Set<string>();
      removedHoles = new Set<string>();
      dotGridElement.innerHTML = "";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const key = `${col},${row}`;
          if (Math.random() < 0.9) holes.add(key);
        }
      }

      drawMask();
      holes.forEach((key) => {
        const [col, row] = key.split(",").map(Number);
        addClickTarget(key, col, row, col * step + dotRadius, row * step + dotRadius);
      });
    };

    setupDotMask();
    window.addEventListener("resize", setupDotMask);

    return () => {
      window.removeEventListener("resize", setupDotMask);
      dotGridElement.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const section2 = section2Ref.current;
    const section3 = section3Ref.current;
    const section4 = section4Ref.current;
    if (!section2 || !section3 || !section4) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio < 0.5) return;

          if (entry.target === section2) {
            setS2PhotoVisible(true);
            setS2TitleVisible(true);
            window.setTimeout(() => setS2TextVisible(true), 1350);
          }

          if (entry.target === section3) {
            setS3SmallVisible(true);
            setS3BigVisible(true);
            window.setTimeout(() => setS3TextVisible(true), 1300);
          }

          if (entry.target === section4) {
            setS4TitleVisible(true);
          }
        });
      },
      { threshold: [0, 0.5, 0.8] }
    );

    observer.observe(section2);
    observer.observe(section3);
    observer.observe(section4);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = section4Ref.current;
    const bg = parallaxBgRef.current;
    if (!section || !bg) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    const strength = 18;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;

      targetX = (event.clientX / window.innerWidth - 0.5) * strength;
      targetY = (event.clientY / window.innerHeight - 0.5) * strength;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      bg.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.12)`;
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide((index + SLIDES.length) % SLIDES.length);
  };

  return (
    <article className="project-page">
      <section id="hero" className="project-hero" data-nav-dark>
        <Image
          className="project-hero-bg-photo"
          src="/images/img2.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "bottom" }}
        />
        <div className="project-hero-bg-overlay" />
        <canvas ref={maskCanvasRef} className="project-dot-mask-canvas" aria-hidden="true" />
        <div ref={dotGridRef} className="project-dot-grid" aria-hidden="true" />

        <div className="project-hero-slider" aria-label="Project image slider">
          {SLIDES.map((slide, index) => (
            <div className={`project-hero-slide ${index === currentSlide ? "active" : ""}`} key={slide.src}>
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 70vw, 33vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          ))}

          <button className="project-slider-arrow left" type="button" aria-label="Previous slide" onClick={() => goToSlide(currentSlide - 1)}>
            <svg viewBox="0 0 9 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <polyline points="6,1 1,8.5 6,16" />
            </svg>
          </button>
          <button className="project-slider-arrow right" type="button" aria-label="Next slide" onClick={() => goToSlide(currentSlide + 1)}>
            <svg viewBox="0 0 9 17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <polyline points="3,1 8,8.5 3,16" />
            </svg>
          </button>

          <div className="project-slider-dots" aria-label="Choose project image">
            {SLIDES.map((slide, index) => (
              <button
                className={`project-slider-dot ${index === currentSlide ? "active" : ""}`}
                key={slide.src}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === currentSlide}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>

        <h1 className="project-hero-title">
          <RevealTitle text={PROJECT_TITLE} active={heroTitleVisible} />
        </h1>
        <p className={`project-hero-desc ${heroTextVisible ? "text-visible" : ""}`}>{PROJECT_COPY}</p>

        <div className="project-hero-nav">
          <Link className="project-nav-btn" href="/design/gemayel-residence">
            <ArrowLeft />
            prev project
          </Link>
          <Link className="project-nav-btn" href="/design/cloud-stone-bathrooms">
            next project
            <ArrowRight />
          </Link>
        </div>
      </section>

      <section ref={section2Ref} id="section2" className="project-section-2">
        <div className="project-s2-photo-wrap">
          <div className={`project-s2-photo ${s2PhotoVisible ? "in-view" : ""}`}>
            <Image
              src="/images/img2.png"
              alt="Studio Twenty Seven showroom"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
        </div>
        <div className="project-s2-info">
          <h2 className="project-s2-title">
            <RevealTitle text={PROJECT_TITLE} active={s2TitleVisible} />
          </h2>
          <div className="project-s2-bottom">
            <div className={`project-s2-details ${s2TextVisible ? "text-visible" : ""}`}>
              Project Status: Completed
              <br />
              Project Year: 2025
              <br />
              Client: Furniture Designer (Private)
              <br />
              Site Area: 2,800 sq ft
              <br />
              Location: Tribeca, New York City
              <br />
              Project Type: Commercial - Showroom
            </div>
            <p className={`project-s2-desc ${s2TextVisible ? "text-visible" : ""}`}>{DETAIL_COPY}</p>
          </div>
        </div>
      </section>

      <section ref={section3Ref} id="section3" className="project-section-3">
        <div className="project-s3-left">
          <div className="project-s3-small-photo-wrap">
            <div className={`project-s3-small-photo ${s3SmallVisible ? "in-view" : ""}`}>
              <Image
                src="/images/img3.png"
                alt="Project material detail"
                fill
                sizes="(max-width: 768px) 55vw, 19vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </div>
          <div className="project-s3-captions">
            <p className={`project-s3-caption ${s3TextVisible ? "text-visible" : ""}`}>{DETAIL_COPY}</p>
            <p className={`project-s3-caption ${s3TextVisible ? "text-visible" : ""}`}>{DETAIL_COPY}</p>
          </div>
        </div>
        <div className="project-s3-right">
          <div className={`project-s3-big-photo ${s3BigVisible ? "in-view" : ""}`}>
            <Image
              src="/images/img1.png"
              alt="Studio Twenty Seven gallery view"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
        </div>
      </section>

      <section ref={section4Ref} id="section4" className="project-section-4">
        <div ref={parallaxBgRef} className="project-s4-bg">
          <Image
            src="/images/img4.png"
            alt=""
            fill
            sizes="112vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div className="project-s4-overlay" />
        <div className="project-s4-content">
          <div className="project-s4-nav">
            <Link className="project-nav-btn" href="/design/gemayel-residence">
              <ArrowLeft />
              prev project
            </Link>
            <h2 className="project-s4-title">
              <RevealTitle text={PROJECT_TITLE} active={s4TitleVisible} />
            </h2>
            <Link className="project-nav-btn" href="/design/cloud-stone-bathrooms">
              next project
              <ArrowRight />
            </Link>
          </div>
        </div>
        <Link className="project-s4-start-btn" href="#footer">
          Start your project
        </Link>
      </section>

      <style jsx global>{`
        .project-page {
          background: var(--color-dark, #392d2b);
          color: var(--color-dark, #392d2b);
          overflow-x: hidden;
        }

        .project-hero {
          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: var(--color-dark, #392d2b);
          contain: strict;
        }

        .project-hero-bg-photo,
        .project-hero-bg-overlay,
        .project-dot-mask-canvas,
        .project-dot-grid {
          position: absolute;
          inset: 0;
        }

        .project-hero-bg-photo {
          z-index: 0;
	 transform: scaleX(-1);
        }

        .project-hero-bg-overlay {
          background: rgba(0, 0, 0, 0.5);
          z-index: 1;
          pointer-events: none;
        }

        .project-dot-mask-canvas {
          z-index: 2;
          pointer-events: none;
          width: 100%;
          height: 100%;
          max-width: 100vw;
          max-height: 100vh;
        }

        .project-dot-grid {
          z-index: 4;
          pointer-events: auto;
          overflow: hidden;
          width: 100%;
          height: 100%;
          max-width: 100vw;
          max-height: 100vh;
        }

        .project-hero-title {
          position: relative;
          left: clamp(16px, 1.56vw, 30px);
          top: clamp(50px, 12.4vh, 150px);
          margin: 0;
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-weight: 400;
          font-size: clamp(36px, 3.65vw, 70px);
          line-height: 0.9;
          color: var(--color-surface, #f0eee9);
          z-index: 10;
          pointer-events: none;
        }

        .project-hero-desc {
          position: relative;
          left: clamp(16px, 1.56vw, 30px);
          top: clamp(110px, 15.5vh, 140px);
          width: clamp(200px, 20vw, 360px);
          margin: 0;
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: clamp(11px, 1.04vw, 20px);
          line-height: 1.2;
          color: var(--color-surface, #f0eee9);
          z-index: 10;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .project-hero-desc.text-visible {
          opacity: 1;
        }

        .project-hero-slider {
          position: absolute;
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          width: 33%;
          height: 75vh;
          z-index: 9;
          overflow: hidden;
        }

        .project-hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.8s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1));
          pointer-events: none;
        }

        .project-hero-slide.active {
          opacity: 1;
          pointer-events: auto;
        }

        .project-slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 12;
          width: clamp(32px, 2.3vw, 44px);
          height: clamp(32px, 2.3vw, 44px);
          border: 1px solid rgba(240, 238, 233, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(57, 45, 43, 0.25);
          color: var(--color-surface, #f0eee9);
          transition: background var(--dur-normal, 250ms) ease, transform var(--dur-normal, 250ms) ease;
        }

        .project-slider-arrow:hover {
          background: rgba(57, 45, 43, 0.5);
          transform: translateY(-50%) scale(1.04);
        }

        .project-slider-arrow.left {
          left: 10px;
        }

        .project-slider-arrow.right {
          right: 10px;
        }

        .project-slider-arrow svg {
          width: 9px;
          height: 17px;
        }

        .project-slider-dots {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 12;
        }

        .project-slider-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          border: 0;
          padding: 0;
          background: rgba(240, 238, 233, 0.4);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
        }

        .project-slider-dot.active,
        .project-slider-dot:hover {
          background: rgba(240, 238, 233, 0.95);
          transform: scale(1.2);
        }

        .project-hero-nav {
          position: absolute;
          bottom: clamp(20px, 3.7vh, 40px);
          left: clamp(16px, 1.56vw, 30px);
          right: clamp(16px, 1.56vw, 30px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .project-nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-weight: 700;
          font-size: clamp(7px, 0.47vw, 9px);
          letter-spacing: 1.17px;
          color: var(--color-surface, #f0eee9);
          text-transform: uppercase;
          text-decoration: none;
          transition: opacity var(--dur-normal, 250ms) ease, transform var(--dur-normal, 250ms) ease;
        }

        .project-nav-btn:hover {
          opacity: 0.72;
          transform: translateY(-1px);
        }

        .project-section-2 {
          width: 100vw;
          height: 100vh;
          min-height: 600px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          background: var(--color-grey-light, #e7e6e4);
          contain: layout;
        }

        .project-s2-photo-wrap {
          overflow: hidden;
          position: relative;
        }

        .project-s2-photo {
          position: absolute;
          inset: -10%;
          transform: translateY(60px);
          opacity: 0;
          transition:
            transform 1.1s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)),
            opacity 1.1s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1));
        }

        .project-s2-photo.in-view {
          transform: translateY(0);
          opacity: 1;
        }

        .project-s2-info {
          background: var(--color-surface, #f0eee9);
          display: flex;
          flex-direction: column;
          padding: clamp(40px, 5.2vh, 100px) clamp(20px, 1.56vw, 30px) clamp(20px, 2.8vh, 30px);
          justify-content: space-between;
        }

        .project-s2-title {
          margin: 0;
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-weight: 400;
          font-size: clamp(28px, 3.65vw, 70px);
          line-height: 0.9;
          color: var(--color-dark, #392d2b);
          text-align: right;
        }

        .project-s2-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }

        .project-s2-details,
        .project-s2-desc {
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: clamp(11px, 1.04vw, 20px);
          line-height: 1.2;
          color: var(--color-dark, #392d2b);
          flex: 1;
          opacity: 0;
          transition: opacity 0.9s ease;
        }

        .project-s2-details.text-visible,
        .project-s2-desc.text-visible {
          opacity: 1;
        }

        .project-s2-desc {
          margin: 0;
          padding-top: clamp(10px, 2.5vh, 24px);
        }

        .project-section-3 {
          width: 100vw;
          height: 100vh;
          min-height: 600px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          contain: layout;
        }

        .project-s3-left {
          background: var(--color-dark, #392d2b);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(20px, 1.56vw, 30px);
          position: relative;
          overflow: hidden;
        }

        .project-s3-small-photo-wrap {
          overflow: hidden;
          position: relative;
        }

        .project-s3-small-photo {
          position: relative;
          width: 18.5vw;
          height: clamp(200px, 41vh, 445px);
          transform: translateY(80px);
          opacity: 0;
          transition:
            transform 1.2s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)),
            opacity 1.2s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1));
        }

        .project-s3-small-photo.in-view {
          transform: translateY(0);
          opacity: 1;
        }

        .project-s3-captions {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: auto;
        }

        .project-s3-caption {
          margin: 0;
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: clamp(10px, 1.04vw, 20px);
          line-height: 1.2;
          color: var(--color-surface, #f0eee9);
          flex: 1;
          opacity: 0;
          transition: opacity 0.9s ease;
        }

        .project-s3-caption.text-visible {
          opacity: 1;
        }

        .project-s3-right {
          overflow: hidden;
          position: relative;
        }

        .project-s3-big-photo {
          position: absolute;
          inset: -10%;
          transform: translateY(80px);
          opacity: 0;
          transition:
            transform 1.4s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)) 0.1s,
            opacity 1.4s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)) 0.1s;
        }

        .project-s3-big-photo.in-view {
          transform: translateY(0);
          opacity: 1;
        }

        .project-section-4 {
          width: 100vw;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          contain: layout;
        }

        .project-s4-bg {
          position: absolute;
          inset: -6%;
          will-change: transform;
          transition: transform 0.12s ease-out;
        }

        .project-s4-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.22);
          z-index: 1;
        }

        .project-s4-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(16px, 2vh, 28px);
        }

        .project-s4-nav {
          display: flex;
          gap: clamp(60px, 8vw, 160px);
          align-items: center;
        }

        .project-s4-title {
          margin: 0;
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-weight: 400;
          font-size: clamp(28px, 3.65vw, 70px);
          line-height: 0.9;
          color: var(--color-surface, #f0eee9);
          text-align: center;
        }

        .project-s4-start-btn {
          position: absolute;
          bottom: clamp(40px, 8.6vh, 93px);
          height: 92px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-weight: 700;
          font-size: clamp(7px, 0.47vw, 9px);
          letter-spacing: 1.17px;
          color: var(--color-surface, #f0eee9);
          text-transform: uppercase;
          text-decoration: none;
          z-index: 2;
          transition: opacity var(--dur-normal, 250ms) ease;
        }

        .project-s4-start-btn:hover {
          opacity: 0.72;
        }

        .project-s4-start-btn::after {
          content: "";
          display: block;
          width: 1px;
          height: clamp(40px, 5vh, 77px);
          background: var(--color-surface, #f0eee9);
          margin-top: 6px;
        }

        .project-word {
          display: inline-block;
          margin-right: 0.28em;
          white-space: nowrap;
        }

        .project-char {
          display: inline-block;
          opacity: 0;
          filter: blur(8px);
          transform: translateY(6px);
          transition:
            opacity 0.7s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)),
            filter 0.7s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)),
            transform 0.7s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1));
        }

        .project-char.visible {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .project-hero-slider {
            width: min(58vw, 360px);
            height: 56vh;
            right: clamp(16px, 5vw, 30px);
          }

          .project-section-2,
          .project-section-3 {
            grid-template-columns: 1fr;
            height: auto;
            min-height: unset;
          }

          .project-s2-photo-wrap,
          .project-s3-right {
            height: 50vw;
            min-height: 220px;
          }

          .project-s2-info {
            min-height: 320px;
          }

          .project-s3-left {
            min-height: 340px;
          }

          .project-s2-bottom {
            flex-direction: column;
            align-items: stretch;
          }

          .project-s3-small-photo {
            width: min(52vw, 260px);
          }

          .project-s4-nav {
            gap: clamp(18px, 5vw, 40px);
          }
        }
      `}</style>
    </article>
  );
}
