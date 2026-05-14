"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { drawFrame, type TrailPoint, TRAIL_MS } from "@/lib/circleGrid";
import { PixelButton } from "@/components/ui/PixelButton";

const ABOUT_COPY = [
  { text: "Cloud Stone Studio ", accent: true },
  { text: "brings architecture and stone craftsmanship into a single, unified process.", accent: false },
  { text: "We don't separate design from making -", accent: false },
  { text: "we build with full control over both.", accent: true },
] as const;

const SERVICES = [
  {
    title: "Design",
    meta: "Architecture, furniture",
    image: "/images/frame-30.png",
    href: "/design",
  },
  {
    title: "Bathrooms",
    meta: "Design",
    image: "/images/bath-left.png",
    href: "/bathrooms",
  },
  {
    title: "Bathrooms",
    meta: "Fabrication",
    image: "/images/rectangle.png",
    href: "/bathrooms",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "What makes Cloud Stone different?",
    a: "We combine design and fabrication into one seamless system.",
  },
  {
    q: "How long does a project take?",
    a: "Project timelines vary by scope and complexity — typically 3–12 months for residential and 6–18 months for commercial work. We provide a detailed schedule during the initial consultation.",
  },
  {
    q: "Do you work internationally?",
    a: "Yes, we collaborate with clients worldwide. Our team has experience delivering projects across North America, Europe, and the Middle East.",
  },
  {
    q: "What is your design process?",
    a: "We begin with a discovery session to understand your vision, then move through concept, design development, documentation, and implementation phases — keeping you involved at every step.",
  },
  {
    q: "Can you work with a fixed budget?",
    a: "Absolutely. We are transparent about costs from the start and design to the best of our ability within your budget constraints.",
  },

] as const;

const CLOUD_PATH =
  "M122.019 76.4797C122.019 76.4797 110.689 103.322 82.3635 103.322C55.4543 104.6 42.7078 79.0361 42.7078 79.0361C42.7078 79.0361 12.966 90.54 1.63565 64.9758C-5.72901 48.3591 13.6302 31.7425 22.8798 31.7425C22.8798 31.7425 26.3453 16.404 42.7078 12.5694C59.0703 8.7348 73.0052 16.178 72.4496 17.6822C71.895 19.1839 82.3635 -5.32548 107.856 1.06552C130.517 6.74647 130.517 29.1861 130.517 29.1861C130.517 29.1861 174.421 22.795 170.173 59.863C161.675 94.3745 122.019 76.4797 122.019 76.4797Z";

function useInView<T extends HTMLElement>(threshold = 0.45) {
  const ref = useRef<T | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, entered] as const;
}

function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const t0Ref = useRef(0);
  const trailRef = useRef<TrailPoint[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = document.documentElement.clientWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    t0Ref.current = performance.now();

    const frame = (now: number) => {
      const current = canvasRef.current;
      if (!current) return;
      const ctx = current.getContext("2d");
      if (!ctx) return;

      const elapsed = now - t0Ref.current;
      trailRef.current = trailRef.current.filter((point) => now - point.t < TRAIL_MS);
      drawFrame(ctx, current.width, current.height, elapsed * 0.000018, -elapsed * 0.000006, trailRef.current, now);
      rafRef.current = requestAnimationFrame(frame);
    };

    const pushTrail = (x: number, y: number) => {
      const now = performance.now();
      const trail = trailRef.current;
      const last = trail[0];
      if (!last || (x - last.x) ** 2 + (y - last.y) ** 2 > 49) {
        trail.unshift({ x, y, t: now });
        if (trail.length > 40) trail.length = 40;
      }
    };

    const onMove = (event: MouseEvent) => pushTrail(event.clientX, event.clientY);
    const onLeave = () => {
      trailRef.current = [];
    };

    rafRef.current = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="about-dot-bg"
    />
  );
}

function ProjectDotHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotGridRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);
  const [imgVisible, setImgVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dotGridElement = dotGridRef.current;
    if (!canvas || !dotGridElement) return;
    const dotGrid: HTMLDivElement = dotGridElement;

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

    const addClickTarget = (key: string, cx: number, cy: number) => {
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
      target.addEventListener("click", () => {
        if (!holes.has(key)) return;
        holes.delete(key);
        removedHoles.add(key);
        target.remove();
        drawMask();
      });
      dotGrid.appendChild(target);
    };

    let firstDraw = true;
    const setup = () => {
      canvas.width = document.documentElement.clientWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / step) + 1;
      rows = Math.ceil(canvas.height / step) + 1;
      holes = new Set<string>();
      removedHoles = new Set<string>();
      dotGrid.innerHTML = "";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const key = `${col},${row}`;
          if (Math.random() < 0.88 && !removedHoles.has(key)) holes.add(key);
        }
      }

      drawMask();
      if (firstDraw) { firstDraw = false; setImgVisible(true); }
      holes.forEach((key) => {
        const [col, row] = key.split(",").map(Number);
        addClickTarget(key, col * step + dotRadius, row * step + dotRadius);
      });
    };

    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      dotGrid.innerHTML = "";
    };
  }, []);

  return (
    <section className="about-project-hero" data-nav-dark aria-label="About Cloud Stone Studio">
      <Image
        src="/images/design/79AB18DD-3959-4C04-9A5E-417E691B6D46.JPG"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`about-project-hero-image${imgVisible ? " img-visible" : ""}`}
        style={{ objectFit: "cover", objectPosition: "center bottom" }}
      />
      <div className="about-project-hero-overlay" />
      <canvas ref={canvasRef} className="about-project-mask" aria-hidden="true" />
      <div ref={dotGridRef} className="about-project-dot-grid" aria-hidden="true" />

      {/* Centered content: logo + title */}
      <div className="about-project-hero-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Logo-light.svg"
          alt=""
          aria-hidden
          className="about-project-hero-logo"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "none" : "translateY(12px)",
            transition: "opacity 0.8s ease 0.18s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s",
          }}
        />
        <h1 className="about-project-hero-title" aria-label="Design meets fabrication">
          {["Design", "meets", "fabrication"].map((word, i) => (
            <span
              key={word}
              aria-hidden
              style={{
                display: "inline-block",
                marginRight: i < 2 ? "0.28em" : 0,
                opacity: entered ? 1 : 0,
                filter: entered ? "blur(0px)" : "blur(10px)",
                transform: entered ? "translateY(0)" : "translateY(14px)",
                transition: `opacity 0.9s ease ${0.22 + i * 0.13}s, filter 0.9s ease ${0.22 + i * 0.13}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.22 + i * 0.13}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>
      </div>

      {/* Bottom text blocks */}
      <div className="about-hero-bottom">
        {[
          { label: "Studio", value: "Cloud Stone Studio" },
          { label: "Location", value: "Brooklyn, NY" },
          { label: "Focus", value: "Design & Fabrication" },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className="about-hero-bottom-item"
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.7s ease ${0.9 + i * 0.1}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${0.9 + i * 0.1}s`,
            }}
          >
            <span className="about-hero-bottom-label">{label}</span>
            <span className="about-hero-bottom-value">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutStatement() {
  const [ref, entered] = useInView<HTMLElement>(0.5);

  const words = ABOUT_COPY.flatMap(({ text, accent }) =>
    text.trim().split(/\s+/).map((w) => ({ text: w, accent }))
  );

  return (
    <section ref={ref} className="about-statement" aria-label="Studio statement">
      <h1 aria-label={ABOUT_COPY.map((c) => c.text).join("")}>
        {words.map(({ text, accent }, i) => (
          <span
            key={i}
            aria-hidden
            className={accent ? "accent" : undefined}
            style={{
              display: "inline-block",
              marginRight: "0.28em",
              opacity: entered ? 1 : 0,
              filter: entered ? "blur(0px)" : "blur(10px)",
              transform: entered ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.9s ease ${0.04 + i * 0.045}s, filter 0.9s ease ${0.04 + i * 0.045}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.04 + i * 0.045}s`,
            }}
          >
            {text}
          </span>
        ))}
      </h1>
    </section>
  );
}

function FounderSection() {
  const [ref, entered] = useInView<HTMLElement>(0.55);

  return (
    <section ref={ref} className="about-founder" aria-label="Founder">
      <div className="about-founder-photo-wrap">
        <div className={`about-founder-photo ${entered ? "in-view" : ""}`}>
          <Image
            src="/images/founder.png"
            alt="Antonio Gemayel, founder of Cloud Stone Studio"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="about-founder-image"
          />
        </div>
      </div>
      <div className="about-founder-bio">
        <div className="about-founder-heading">
          <p aria-label="Founder">
            {(["Founder"] as const).map((word, i) => (
              <span key={word} aria-hidden style={{
                display: "inline-block",
                opacity: entered ? 1 : 0,
                filter: entered ? "blur(0px)" : "blur(10px)",
                transform: entered ? "translateY(0)" : "translateY(14px)",
                transition: `opacity 0.9s ease ${0.2 + i * 0.1}s, filter 0.9s ease ${0.2 + i * 0.1}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.1}s`,
              }}>{word}</span>
            ))}
          </p>
          <h2 aria-label="Antonio Gemayel">
            {(["Antonio", "Gemayel"] as const).map((word, i) => (
              <span key={word} aria-hidden style={{
                display: "inline-block",
                marginRight: i < 1 ? "0.28em" : 0,
                opacity: entered ? 1 : 0,
                filter: entered ? "blur(0px)" : "blur(10px)",
                transform: entered ? "translateY(0)" : "translateY(14px)",
                transition: `opacity 0.9s ease ${0.3 + i * 0.1}s, filter 0.9s ease ${0.3 + i * 0.1}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.1}s`,
              }}>{word}</span>
            ))}
          </h2>
        </div>
        <div className={`about-founder-bottom ${entered ? "in-view" : ""}`}>
          <div className="about-founder-copy">
            <div className="about-founder-cols">
              <p>
                <strong>Location:</strong> New York City
                <br />
                <strong>Experience:</strong> 10+ Years
                <br />
                <strong>Education:</strong> Architecture
                <br />
                <strong>Expertise:</strong> Design | Fabrication | Stone Masonry
              </p>
              <p>
                Raised within a third-generation stone workshop, Antonio bridges architectural
                design with hands-on fabrication. His work is defined by precision, material
                understanding, and full control over execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const [ref, entered] = useInView<HTMLElement>(0.35);

  return (
    <section ref={ref} className="about-services" aria-label="Services">
      <p className={`about-services-intro ${entered ? "in-view" : ""}`}>
        We create <span>architecture, interiors and bathrooms</span> where natural stone,
        wood, and metal work in perfect harmony - crafting warm, contemporary, and timeless
        spaces that feel <span>both grounded and extraordinary</span>.
      </p>
      <div className="about-service-grid">
        {SERVICES.map((service, index) => (
          <Link
            className={`about-service-card ${entered ? "in-view" : ""}`}
            href={service.href}
            key={`${service.title}-${service.meta}`}
            style={{ "--delay": `${index * 120}ms` } as CSSProperties}
          >
            <div
              className="about-service-image"
              style={index === 1 ? { borderRadius: "0" } : undefined}
            >
              <Image
                src={service.image}
                alt=""
                fill
                sizes="312px"
                className="about-service-img"
              />
            </div>
            <div className="about-service-label">
              <strong>{service.title}</strong>
              <span>{service.meta}</span>
            </div>
            <div className="about-service-cloud" aria-hidden="true">
              <svg viewBox="0 0 171 104" fill="none" aria-hidden="true">
                <path d={CLOUD_PATH} fill="#F6F5F2" stroke="#392D2B" strokeWidth="3" />
              </svg>
              <span>+</span>
            </div>
          </Link>
        ))}
      </div>
      <PixelButton
        label="Let's create"
        href="#footer"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 30,
          transform: "translateX(-50%)",
        }}
      />
    </section>
  );
}

function CloudPlusIcon({ minus, active }: { minus: boolean; active: boolean }) {
  return (
    <span className="about-faq-cloud" aria-hidden="true">
      <svg viewBox="0 0 171 104" fill="none" aria-hidden="true">
        <path
          d={CLOUD_PATH}
          fill={active ? "#F6F5F2" : "#F6F5F2"}
          stroke="#392D2B"
          strokeWidth="3"
        />
      </svg>
      <span>{minus ? "-" : "+"}</span>
    </span>
  );
}

function FAQItem({
  item,
  index,
  entered,
}: {
  item: (typeof FAQ_ITEMS)[number];
  index: number;
  entered: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const active = open || hovered;
  const delay = 0.05 + index * 0.08;

  return (
    <div
      className={`about-faq-item ${entered ? "entered" : ""} ${open ? "open" : ""}`}
      style={{ "--item-delay": `${delay}s` } as CSSProperties}
    >
      <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 1, overflow: "visible", pointerEvents: "none" }} preserveAspectRatio="none">
        <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#392D2B" strokeWidth="1"
          pathLength={1} strokeDasharray={1}
          strokeDashoffset={entered ? 0 : 1}
          style={{ transition: `stroke-dashoffset 0.8s ease ${delay + 0.1}s` }}
        />
      </svg>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="about-faq-question"
      >
        <span className="about-faq-fill" />
        <span className="about-faq-question-text">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{item.q}</span>
        </span>
        <CloudPlusIcon minus={open} active={active} />
      </button>
      <div className="about-faq-answer">
        <p>{item.a}</p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [ref, entered] = useInView<HTMLElement>(0.4);

  return (
    <section ref={ref} className="about-faq" aria-label="FAQ">
      <h2 className={entered ? "in-view" : ""}>FAQ</h2>
      <div className={`about-faq-list ${entered ? "in-view" : ""}`}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} preserveAspectRatio="none">
          <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)"
            fill="none" stroke="#392D2B" strokeWidth="1"
            pathLength={1} strokeDasharray={1}
            strokeDashoffset={entered ? 0 : 1}
            style={{ transition: "stroke-dashoffset 1.2s ease 0.2s" }}
          />
        </svg>
        {FAQ_ITEMS.map((item, index) => (
          <FAQItem item={item} index={index} entered={entered} key={index} />
        ))}
      </div>
    </section>
  );
}

export function AboutPageClient() {
  return (<div className="about-dotted-content">
        <DotBackground />
    <div className="about-page">
     
      
        <div className="about-content-layer">
          <FounderSection />
	  <AboutStatement />
         
          <FAQSection />
        </div>
      </div>

      <style jsx global>{`
        .about-page {
          background: #F0EEE9;
          color: var(--color-dark, #392d2b);
          overflow-x: hidden;
        }

        .about-project-hero {
          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: var(--color-dark, #392d2b);
          contain: strict;
        }

        .about-project-hero-image {
          object-fit: cover;
          object-position: center;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.6s ease;
        }

        .about-project-hero-image.img-visible {
          opacity: 1;
        }

        .about-project-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          z-index: 1;
        }

        .about-project-mask {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .about-project-dot-grid {
          position: absolute;
          inset: 0;
          z-index: 4;
          overflow: hidden;
          pointer-events: auto;
        }

        /* Wrapper that centers both logo and title */
        .about-project-hero-content {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 5;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(20px, 2.5vw, 40px);
          pointer-events: none;
        }

        .about-project-hero-logo {
          width: clamp(56px, 5.4vw, 104px);
          height: auto;
          display: block;
        }

        .about-project-hero-title {
          margin: 0;
          width: min(1100px, calc(100vw - 60px));
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-size: clamp(72px, 11.15vw, 214px);
          font-style: normal;
          font-weight: 400;
          line-height: 94%;
          letter-spacing: clamp(-6.42px, -0.335vw, -2px);
          color: var(--color-surface, #f0eee9);
          text-align: center;
          text-wrap: balance;
        }

        .about-hero-bottom {
          position: absolute;
          bottom: 30px;
          left: 30px;
          right: 30px;
          z-index: 5;
          display: flex;
          align-items: flex-end;
          gap: clamp(24px, 4vw, 60px);
          pointer-events: none;
        }

        .about-hero-bottom-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .about-hero-bottom-label {
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-weight: 600;
          font-size: 8px;
          letter-spacing: 1.3px;
          text-transform: uppercase;
          color: rgba(240,238,233,0.50);
        }

        .about-hero-bottom-value {
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-weight: 600;
          font-size: 9px;
          letter-spacing: 1.17px;
          text-transform: uppercase;
          color: #F0EEE9;
        }

        .about-dotted-content {
          position: relative;
          min-height: 300vh;
          overflow-x: clip;
          background: #F0EEE9;
        }

        .about-dot-bg {
          position: sticky;
          top: 0;
          z-index: 0;
          display: block;
          width: 100%;
          max-width: 100vw;
          height: 100vh;
          margin-bottom: -100vh;
          pointer-events: none;
        }

        .about-content-layer {
          position: relative;
          z-index: 1;
        }

        .about-statement {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 30px;
        }

        .about-statement h1 {
          margin: 0;
          width: min(1386px, calc(100vw - 60px));
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-weight: 400;
          font-size: clamp(34px, 3.65vw, 70px);
          line-height: 1.14;
          color: var(--color-dark, #392d2b);
          text-align: center;
          text-transform: uppercase;
        }

        .about-line {
          display: block;
        }

        .about-line--anim {
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity  0.85s ease var(--line-delay, 0ms),
            transform 0.85s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)) var(--line-delay, 0ms);
        }

        .about-line--anim.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .about-statement .accent {
          color: var(--color-cta, #c86733);
        }

        .about-founder {
          width: 100vw;
          min-height: 100vh;
	  max-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          background: var(--color-surface, #f0eee9);
        }

        .about-founder-photo-wrap {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .about-founder-photo {
          position: absolute;
          inset: -10% 0 0;
          transform: translateY(70px);
          opacity: 0;
          transition:
            transform 1.15s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)),
            opacity 1.15s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1));
        }

        .about-founder-photo.in-view {
          transform: translateY(0);
          opacity: 1;
        }

        .about-founder-image {
          object-fit: cover;
          object-position: center bottom;
        }

        .about-founder-bio {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          padding: 30px;
        }

        .about-founder-heading {
          width: min(450px, 100%);
          text-align: right;
          margin-top: 40px;
        }

        .about-founder-heading p {
          margin: 0 0 2px;
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-size: clamp(13px, 0.94vw, 18px);
          line-height: 0.9;
          color: var(--color-cta, #c86733);
          text-transform: uppercase;
        }

        .about-founder-heading h2 {
          margin: 0;
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-weight: 400;
          font-size: clamp(38px, 3.65vw, 70px);
          line-height: 0.9;
          color: var(--color-dark, #392d2b);
        }

        .about-founder-bottom {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.8s ease 0.45s, transform 0.8s var(--ease-expo-out) 0.45s;
        }

        .about-founder-bottom.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .about-founder-copy {
          width: 100%;
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: clamp(14px, 1.04vw, 20px);
          line-height: 1.2;
          color: var(--color-dark, #392d2b);
        }

        .about-founder-cols {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-end;
          gap: 40px;
        }

        .about-founder-cols > p {
          margin: 0;
          flex: 1;
        }

        .about-founder-copy strong {
          font-weight: 700;
        }

        .about-services {
          position: relative;
          min-height: 100vh;
          padding: 80px 30px 30px;
        }

        .about-services-intro {
          margin: 0;
	  font-weight: 400;
          width: min(745px, calc(100vw - 60px));
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-size: clamp(28px, 2.08vw, 40px);
          line-height: 0.94;
          color: var(--color-dark, #392d2b);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.7s ease, transform 0.7s var(--ease-expo-out);
        }

        .about-services-intro.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .about-services-intro span {
          color: var(--color-cta, #c86733);
        }

        .about-service-grid {
          min-height: 620px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(48px, 6.7vw, 129px);
          padding: 140px 0 90px;
        }

        .about-service-card {
          position: relative;
          display: block;
          width: 369px;
          height: 404px;
          border: 1px solid var(--color-dark, #392d2b);
          color: var(--color-dark, #392d2b);
          text-decoration: none;
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 0.65s ease var(--delay),
            transform 0.8s var(--ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1)) var(--delay),
            box-shadow 0.35s ease;
        }

        .about-service-card.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .about-service-card:hover {
          box-shadow: 0 18px 50px rgba(57, 45, 43, 0.12);
        }

        .about-service-image {
          position: absolute;
          left: 29px;
          top: -61px;
          width: 312px;
          height: 406px;
          overflow: hidden;
          background: var(--color-grey-light, #d9d9d9);
        }

        .about-service-img {
          object-fit: cover;
          object-position: center;
          transition: transform 0.9s var(--ease-expo-out);
        }

        .about-service-card:hover .about-service-img {
          transform: scale(1.05);
        }

        .about-service-label {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 14px;
        }

        .about-service-label strong {
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-size: 30px;
          line-height: 0.75;
          font-weight: 500;
          text-transform: uppercase;
        }

        .about-service-label span {
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: 20px;
          line-height: 1.2;
          white-space: nowrap;
        }

        .about-service-cloud,
        .about-faq-cloud {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .about-service-cloud {
          position: absolute;
          right: -18px;
          bottom: -17px;
          width: 56px;
          height: 38px;
          transition: transform 0.35s var(--ease-spring);
        }

        .about-service-card:hover .about-service-cloud {
          transform: scale(1.15);
        }

        .about-service-cloud svg,
        .about-faq-cloud svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .about-service-cloud span,
        .about-faq-cloud span {
          position: relative;
          z-index: 1;
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: 28px;
          line-height: 1;
          color: var(--color-dark, #392d2b);
        }

        .about-faq {
          position: relative;
          min-height: 704px;
          padding: 80px 30px 180px;
        }

        .about-faq h2 {
          margin: 0 0 56px;
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-weight: 400;
          font-size: clamp(42px, 3.65vw, 70px);
          line-height: 0.9;
          color: var(--color-dark, #392d2b);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.7s ease, transform 0.7s var(--ease-expo-out);
        }

        .about-faq h2.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .about-faq-list {
          position: relative;
        }

        .about-faq-item {
          position: relative;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s ease var(--item-delay, 0s), transform 0.5s cubic-bezier(0.16,1,0.3,1) var(--item-delay, 0s);
          background: rgba(240,238,233,0.35);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .about-faq-item.entered {
          opacity: 1;
          transform: translateY(0);
        }

        .about-faq-item:hover,
        .about-faq-item.open {
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }

        .about-faq-question {
          position: relative;
          width: 100%;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px 0 10px;
          border: 0;
          background: transparent;
          color: var(--color-dark, #392d2b);
          text-align: left;
          cursor: pointer;
          overflow: hidden;
        }

        .about-faq-fill {
          position: absolute;
          inset: 0;
          background: var(--color-dark, #392d2b);
          clip-path: inset(0 100% 0 0);
          transition: clip-path 0.5s var(--ease-expo-out);
        }

        .about-faq-question:hover .about-faq-fill,
        .about-faq-item.open .about-faq-fill {
          clip-path: inset(0 0 0 0);
        }

        .about-faq-question-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 30px;
          color: inherit;
          transition: color 0.16s ease;
        }

        .about-faq-question:hover,
        .about-faq-item.open .about-faq-question {
          color: var(--color-surface, #f0eee9);
        }

        .about-faq-question-text span:first-child {
          width: 80px;
          font-family: var(--font-rader, "PP Rader", sans-serif);
          font-size: clamp(44px, 3.65vw, 70px);
          line-height: 80px;
        }

        .about-faq-question-text span:last-child {
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: clamp(14px, 1.04vw, 20px);
          line-height: 1.2;
        }

        .about-faq-cloud {
          z-index: 1;
          width: 56px;
          height: 38px;
        }

        .about-faq-answer {
          overflow: hidden;
          max-height: 0;
          background: var(--color-surface, #f0eee9);
          transition: max-height 0.45s var(--ease-expo-out);
          border-left: 1px solid #392D2B;
          border-right: 1px solid #392D2B;
        }

        .about-faq-item.open .about-faq-answer {
          max-height: 96px;
        }

        .about-faq-answer p {
          margin: 0;
          padding: 20px 0 20px 27%;
          font-family: var(--font-inter-tight, "Inter Tight", sans-serif);
          font-size: clamp(14px, 1.04vw, 20px);
          line-height: 1.2;
          color: var(--color-dark, #392d2b);
        }

        @media (max-width: 1024px) {
          .about-service-grid {
            flex-wrap: wrap;
            padding-top: 120px;
          }
        }

        @media (max-width: 767px), (orientation: portrait) {
          .about-founder {
            grid-template-columns: 1fr;
          }

          .about-founder-photo-wrap,
          .about-founder-bio {
            min-height: 50vh;
            max-height: 50vh;
          }
        }

        @media (max-width: 768px) {
          .about-statement,
          .about-services,
          .about-faq {
            padding-left: 16px;
            padding-right: 16px;
          }

.about-founder-bio {
            padding: 30px 16px;
          }

          .about-founder-bio {
            padding: 30px 16px;
          }

	 .about-founder-heading {
          margin-top: 30px;
                  }




          .about-founder-bottom {
            flex-direction: column;
            align-items: flex-start;
          }

          .about-founder-cols {
            flex-direction: column;
            align-items: flex-start;
          }

          .about-service-card {
            width: min(369px, calc(100vw - 48px));
          }

          .about-service-grid {
            gap: 110px;
          }

          .about-faq-question-text {
            gap: 14px;
          }

          .about-faq-question-text span:first-child {
            width: 58px;
          }

          .about-faq-answer p {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>
    </div>
  );
}
