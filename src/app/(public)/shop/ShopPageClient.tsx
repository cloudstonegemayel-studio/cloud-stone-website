"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawFrame, type TrailPoint, TRAIL_MS } from "@/lib/circleGrid";
import { ContactForm } from "@/components/sections/ContactForm";
import { PixelButton } from "@/components/ui/PixelButton";

// ── Types ────────────────────────────────────────────────────────────────────
export type ShopItem = {
  id: string;
  slug: string;
  number: string;
  title: string;
  desc: string;
  longDesc: string;
  category: "Stone" | "Marble" | "Special";
  availability: "Available" | "Sold" | "Expected";
  src: string;
  sketchSrc?: string;
  images?: string[];
};

type ViewMode = "chaos" | "grid";
type Filter = "All" | "Available" | "Sold" | "Expected";

const FILTERS: readonly Filter[] = ["All", "Available", "Sold", "Expected"];

const SHOP_ITEMS: readonly ShopItem[] = [
  {
    id: "1", slug: "travertine-slab", number: "01",
    title: "Travertine Slab", desc: "Classic ivory, vein-cut",
    longDesc: "Roman travertine selected for quiet banding and warm ivory color. A calm, architectural slab for walls, floors, counters, and bespoke furniture.",
    category: "Stone", availability: "Available",
    src: "/images/shop-item-1.png", sketchSrc: "/images/shop-item-1-sketch.svg",
  },
  {
    id: "2", slug: "warm-limestone", number: "02",
    title: "Warm Limestone", desc: "Portuguese, honed finish",
    longDesc: "Fine-grain Portuguese limestone with a soft honey undertone. Built for continuous surfaces that need a warm mineral presence without visual noise.",
    category: "Stone", availability: "Available",
    src: "/images/shop-item-2.png", sketchSrc: "/images/shop-item-2-sketch.svg",
  },
  {
    id: "3", slug: "cloud-marble", number: "03",
    title: "Cloud Marble", desc: "Carrara bianco, polished",
    longDesc: "A clear Carrara marble with soft grey movement and a polished reflective surface. Suited to vanities, wall planes, and sculptural details.",
    category: "Marble", availability: "Available",
    src: "/images/shop-item-3.png", sketchSrc: "/images/shop-item-3-sketch.svg",
  },
  {
    id: "4", slug: "basalt-tile", number: "04",
    title: "Basalt Tile", desc: "Volcanic basalt, brushed",
    longDesc: "Dense volcanic basalt with a brushed finish that keeps the surface matte and tactile. Strong for floor transitions, wet zones, and exterior details.",
    category: "Stone", availability: "Sold", src: "/images/rectangle.png",
  },
  {
    id: "5", slug: "alabaster-panel", number: "05",
    title: "Alabaster Panel", desc: "Backlit translucent panel",
    longDesc: "Translucent Spanish alabaster chosen for cloud-like internal formations. Designed for backlit walls, screens, and luminous furniture inserts.",
    category: "Special", availability: "Expected", src: "/images/stone.png",
  },
  {
    id: "6", slug: "onyx-slab", number: "06",
    title: "Onyx Slab", desc: "Green onyx, book-matched",
    longDesc: "Book-matched green onyx with deep forest tones, white veining, and golden bands. Works best where stone can become the visual center.",
    category: "Special", availability: "Available", src: "/images/twenty-seven.png",
  },
  {
    id: "7", slug: "soft-beige-marble", number: "07",
    title: "Soft Beige Marble", desc: "Cream marble, brushed edge",
    longDesc: "A balanced beige marble with gentle mineral clouds and refined movement. Soft enough for residential work, formal enough for hospitality.",
    category: "Marble", availability: "Available", src: "/images/img1.png",
  },
  {
    id: "8", slug: "sandstone-block", number: "08",
    title: "Sandstone Block", desc: "Textured architectural block",
    longDesc: "A modular sandstone block with visible sediment layers. Built for plinths, fireplaces, landscape edges, and quiet sculptural objects.",
    category: "Stone", availability: "Expected", src: "/images/img2.png",
  },
  {
    id: "9", slug: "rose-onyx", number: "09",
    title: "Rose Onyx", desc: "Warm translucent onyx",
    longDesc: "Rose onyx with soft amber translucency and layered internal drawing. Especially strong as illuminated panels or small statement surfaces.",
    category: "Special", availability: "Sold", src: "/images/img3.png",
  },
];

const GRID_POSITIONS = [
  [0, 0], [470, 0], [705, 0], [1175, 0], [1410, 0],
  [235, 350], [940, 350], [1175, 350], [1645, 350],
] as const;

const CHAOS_POSITIONS = [
  [470, 0], [320, -260], [705, 0], [125, 420], [1535, 350],
  [1010, 190], [1175, -220], [1520, -370], [835, -80],
] as const;

// ── Dot background (same as existing) ───────────────────────────────────────
function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef  = useRef<TrailPoint[]>([]);
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width  = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width  = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      trailRef.current = trailRef.current.filter(p => now - p.t < TRAIL_MS);
      drawFrame(ctx, width, height, now * 0.000035, now * 0.000025, trailRef.current, now);
      rafRef.current = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      trailRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });
      if (trailRef.current.length > 24) trailRef.current.shift();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// ── Filter bar (Figma design) ────────────────────────────────────────────────
function FilterBar({ mode, filter, onMode, onFilter }: {
  mode: ViewMode; filter: Filter;
  onMode: (m: ViewMode) => void; onFilter: (f: Filter) => void;
}) {
  return (
    <div style={{
      position: "relative",
      display: "inline-flex",
      height: 26,
      alignItems: "center",
      borderRadius: 0,
      background: "#392D2B",
      padding: "0 8px 0 8px",
      overflow: "visible",
    }}>
      {/* Left pixel cap */}
      <div style={{
        position: "absolute", left: -26, top: 0, width: 83, height: 26,
        backgroundImage: "url(/nav-right-texture.svg)",
        backgroundSize: "auto 26px", backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
        transform: "scaleX(-1)", pointerEvents: "none", zIndex: 1,
      }} />
      {/* Right pixel cap */}
      <div style={{
        position: "absolute", right: -40, top: 0, width: 100, height: 26,
        backgroundImage: "url(/nav-right-texture.svg)",
        backgroundSize: "auto 26px", backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Filter tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 2 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilter(f)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "6px 8px",
              border: "none",
              borderRadius: 0,
              background: filter === f ? "#F0EEE9" : "transparent",
              color: filter === f ? "#392D2B" : "#F0EEE9",
              fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
              fontWeight: 600, fontSize: 9,
              letterSpacing: "1.17px", textTransform: "uppercase",
              whiteSpace: "nowrap", cursor: "pointer",
              transition: "background 180ms ease, color 180ms ease",
            }}
          >
            {f === "All" ? "All Items" : f}
          </button>
        ))}
      </div>

      {/* Divider */}
      <span style={{
        display: "inline-block", width: 1, height: 12,
        background: "rgba(240,238,233,0.22)", margin: "0 8px", flexShrink: 0, position: "relative", zIndex: 2,
      }} />

      {/* Chaos / Grid toggle — hidden on mobile via CSS */}
      <div className="shop-view-toggle" style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 2 }}>
        <span style={{
          fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
          fontWeight: 600, fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
          color: mode === "chaos" ? "#F0EEE9" : "rgba(240,238,233,0.38)",
          transition: "color 180ms ease", userSelect: "none",
        }}>
          Chaos
        </span>
        <button
          type="button"
          onClick={() => onMode(mode === "chaos" ? "grid" : "chaos")}
          aria-label={mode === "chaos" ? "Switch to grid view" : "Switch to chaos view"}
          style={{
            position: "relative", width: 30, height: 11,
            padding: 0, border: "none", borderRadius: 99,
            background: "rgba(240,238,233,0.18)", cursor: "pointer",
          }}
        >
          <span style={{
            position: "absolute", top: 1,
            left: mode === "grid" ? 12 : 1,
            width: 17, height: 9,
            borderRadius: 99, background: "#F0EEE9",
            transition: "left 250ms cubic-bezier(0.16,1,0.3,1)",
          }} />
        </button>
        <span style={{
          fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
          fontWeight: 600, fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
          color: mode === "grid" ? "#F0EEE9" : "rgba(240,238,233,0.38)",
          transition: "color 180ms ease", userSelect: "none",
        }}>
          Grid
        </span>
      </div>
    </div>
  );
}

// ── Product card (Figma design) ──────────────────────────────────────────────
const CARD_W = 215;
const CARD_IMG_H = 154;

function ProductCard({ item, position, index, onSelect, onPositionChange, stageRef, mode }: {
  item: ShopItem;
  position: readonly [number, number];
  index: number;
  onSelect: (item: ShopItem) => void;
  onPositionChange?: (id: string, pos: [number, number]) => void;
  stageRef?: { current: HTMLDivElement | null };
  mode: ViewMode;
}) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initPos: [number, number] } | null>(null);

  const canDrag = mode === "chaos" && !!onPositionChange;

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!canDrag || !stageRef?.current) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initPos: [...position] as [number, number] };
    setDragging(true);
    setHovered(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current || !stageRef?.current) return;
    const stageW = stageRef.current.offsetWidth;
    const stageH = stageRef.current.offsetHeight;
    const dx = (e.clientX - dragRef.current.startX) * (1860 / stageW);
    const dy = (e.clientY - dragRef.current.startY) * (680 / stageH);
    onPositionChange!(item.id, [dragRef.current.initPos[0] + dx, dragRef.current.initPos[1] + dy]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    const dist = Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY);
    dragRef.current = null;
    setDragging(false);
    if (dist < 5) onSelect(item);
  };

  const style = {
    "--card-left": `${(position[0] / 1860) * 100}%`,
    "--card-top":  `${(position[1] / 680) * 100}%`,
    "--card-delay": `${index * 45}ms`,
  } as CSSProperties;

  return (
    <article
      style={{
        position: "absolute",
        left: "var(--card-left)" as string,
        top:  "var(--card-top)" as string,
        width: CARD_W,
        height: 330,
        background: "#F0EEE9",
        border: `1px solid ${hovered && !dragging ? "#392D2B" : "rgba(57,45,43,0.25)"}`,
        cursor: dragging ? "grabbing" : canDrag ? "grab" : "pointer",
        opacity: 0,
        transform: dragging ? "translate3d(0,0,0)" : hovered ? "translate3d(0,-6px,0)" : "translate3d(0,18px,0)",
        animation: `sc-enter 720ms cubic-bezier(0.16,1,0.3,1) var(--card-delay) forwards`,
        transition: dragging ? "none" : "border-color 250ms ease, transform 250ms ease, box-shadow 250ms ease",
        boxShadow: dragging ? "0 20px 50px rgba(57,45,43,0.18)" : hovered ? "0 12px 32px rgba(57,45,43,0.12)" : "none",
        zIndex: dragging ? 10 : 1,
        touchAction: canDrag ? "none" : "auto",
        willChange: dragging ? "left, top" : "auto",
        ...style,
      }}
      onMouseEnter={() => { if (!dragging) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={canDrag ? handlePointerDown : undefined}
      onPointerMove={canDrag ? handlePointerMove : undefined}
      onPointerUp={canDrag ? handlePointerUp : undefined}
      onPointerCancel={() => { dragRef.current = null; setDragging(false); }}
      onClick={canDrag ? undefined : () => onSelect(item)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(item); } }}
      role="button"
      tabIndex={0}
    >
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "15px 15px 20px",
      }}>
        <span style={{
          fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
          fontWeight: 500, fontSize: 9.829, lineHeight: 0.75,
          letterSpacing: "-0.295px", textTransform: "uppercase", color: "#392D2B",
        }}>
          [{item.number}]
        </span>
        <span style={{
          fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
          fontSize: 8, fontWeight: 600, letterSpacing: "0.7px",
          textTransform: "uppercase",
          color: item.availability === "Available" ? "#392D2B" : item.availability === "Sold" ? "#C86733" : "rgba(57,45,43,0.5)",
          border: "1px solid currentColor",
          padding: "2px 5px",
          whiteSpace: "nowrap",
        }}>
          {item.availability}
        </span>
      </div>

      {/* Image with sketch overlay */}
      <div style={{
        position: "relative",
        width: CARD_W - 2,
        height: CARD_IMG_H,
        overflow: "visible",
        
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.title}
          style={{
            width: "100%", height: "100%",
            objectFit: "contain", objectPosition: "center",
            transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)",
            transform: hovered ? "scale(1.06)" : "scale(1)",
	    paddingLeft: "15px", paddingRight: "15px",
          }}
        />
        {item.sketchSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.sketchSrc}
            alt=""
            aria-hidden
            style={{
              position: "absolute", left: 15, top: "-10px",
              height: "120%", width: "auto",
	      zIndex: "-1",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Description */}
      <div style={{
        padding: "14px 15px 40px",
        fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
        fontSize: 10, lineHeight: 1.2, color: "#392D2B",
      }}>
        <p style={{ margin: 0 }}>{item.desc}</p>
      </div>

      {/* CTA Button — overlaps card bottom (Figma: bottom: -13px) */}
      <div style={{ position: "absolute", bottom: -13, justifySelf: "center" }}>
        <PixelButton label="See more" onClick={() => onSelect(item)} />
      </div>
    </article>
  );
}

// ── Request form popup ───────────────────────────────────────────────────────
function RequestPopup({ item, onClose }: { item: ShopItem; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(57,45,43,0.5)", backdropFilter: "blur(4px)",
        animation: "sc-fadein 200ms ease both",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(480px, calc(100vw - 40px))",
          background: "#F0EEE9",
          padding: "30px",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "sc-popup-in 360ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <span style={{
              display: "block",
              fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
              fontWeight: 500, fontSize: 9, textTransform: "uppercase",
              letterSpacing: "-0.3px", color: "rgba(57,45,43,0.5)", marginBottom: 4,
            }}>[{item.number}]</span>
            <span style={{
              fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
              fontSize: 14, fontWeight: 600, color: "#392D2B",
            }}>{item.title}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 22, lineHeight: 1, color: "rgba(57,45,43,0.5)", padding: 0,
            }}
          >
            ×
          </button>
        </div>
        <ContactForm
          sourcePage={`Shop — ${item.title} [${item.number}]`}
          compact
        />
      </div>
    </div>
  );
}

// ── Product popup (Figma design) ─────────────────────────────────────────────
function ProductPopup({ item, onClose, onNext, onPrevious }: {
  item: ShopItem; onClose: () => void;
  onNext: () => void; onPrevious: () => void;
}) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  // Reset slider when item changes
  useEffect(() => { setImgIdx(0); }, [item.id]);

  const allImages = (item.images && item.images.length > 0) ? item.images : [item.src];
  const hasMany   = allImages.length > 1;

  const prevImg = () => setImgIdx(i => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setImgIdx(i => (i + 1) % allImages.length);

  // Arrow-key image navigation while popup is open
  useEffect(() => {
    if (!hasMany) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMany, allImages.length]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(183,209,234,0.38)", backdropFilter: "blur(2px)",
          animation: "sc-fadein 240ms ease both",
        }}
      >
        {/* Card */}
        <article
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal
          aria-labelledby="popup-title"
          style={{
            position: "relative",
            width: "min(800px, calc(100vw - 40px))",
            background: "#F0EEE9",
            border: "1px solid #392D2B",
            boxShadow: "0 30px 90px rgba(57,45,43,0.16)",
            animation: "sc-popup-in 520ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Title bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "15px 15px 20px",
            borderBottom: "1px solid rgba(57,45,43,0.2)",
            height: 55,
          }}>
            {/* Prev product */}
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Previous product"
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-inter-tight)", fontSize: 14,
                color: "rgba(57,45,43,0.45)", padding: "0 4px",
                lineHeight: 1, display: "flex", alignItems: "center",
              }}
            >
              ‹
            </button>

            <h2 id="popup-title" style={{
              margin: 0, flex: 1, textAlign: "center",
              fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
              fontSize: 8.532, fontWeight: 400, lineHeight: 1.2, color: "#392D2B",
              textTransform: "uppercase", letterSpacing: "1px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              padding: "0 8px",
            }}>
              <span style={{
                fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
                fontWeight: 500, fontSize: 9, marginRight: 8,
                letterSpacing: "-0.3px", opacity: 0.5,
              }}>
                [{item.number}]
              </span>
              {item.title}
            </h2>

            {/* Next product */}
            <button
              type="button"
              onClick={onNext}
              aria-label="Next product"
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-inter-tight)", fontSize: 14,
                color: "rgba(57,45,43,0.45)", padding: "0 4px",
                lineHeight: 1, display: "flex", alignItems: "center",
              }}
            >
              ›
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close product details"
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-inter-tight)", fontSize: 9,
                fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.17px",
                color: "rgba(57,45,43,0.5)", marginLeft: 12,
              }}
            >
              Close
            </button>
          </div>

          {/* Image slider */}
          <div style={{
            position: "relative",
            width: "100%", minHeight: 400,
            background: "rgba(183,209,234,0.2)",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={allImages[imgIdx]}
              src={allImages[imgIdx]}
              alt={`${item.title} — image ${imgIdx + 1}`}
              style={{
                width: "min(436px, 72%)", height: 400,
                objectFit: "contain", objectPosition: "center",
                animation: "sc-fadein 220ms ease both",
              }}
            />

            {hasMany && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  aria-label="Previous image"
                  style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    width: 42, height: 42, background: "rgba(240,238,233,0.6)",
                    border: "1px solid rgba(57,45,43,0.2)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: "#392D2B", backdropFilter: "blur(2px)",
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  aria-label="Next image"
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    width: 42, height: 42, background: "rgba(240,238,233,0.6)",
                    border: "1px solid rgba(57,45,43,0.2)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: "#392D2B", backdropFilter: "blur(2px)",
                  }}
                >
                  ›
                </button>

                {/* Dot indicators */}
                <div style={{
                  position: "absolute", bottom: 10,
                  display: "flex", gap: 5,
                  left: "50%", transform: "translateX(-50%)",
                }}>
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      aria-label={`Go to image ${i + 1}`}
                      style={{
                        width: i === imgIdx ? 18 : 6, height: 6,
                        borderRadius: 3, border: "none", padding: 0,
                        background: i === imgIdx ? "#392D2B" : "rgba(57,45,43,0.3)",
                        cursor: "pointer",
                        transition: "width 200ms ease, background 200ms ease",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Description bar */}
          <div style={{
            position: "relative",
            padding: "20px 15px 28px",
            borderTop: "1px solid rgba(57,45,43,0.2)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 20,
            alignItems: "end",
          }}>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
              fontSize: 8.532, lineHeight: 1.5, color: "#392D2B",
            }}>
              {item.longDesc}
            </p>

            <PixelButton label="Request Item" onClick={() => setRequestOpen(true)} />
          </div>
        </article>
      </div>

      {requestOpen && (
        <RequestPopup item={item} onClose={() => setRequestOpen(false)} />
      )}
    </>
  );
}

// ── Main page component ──────────────────────────────────────────────────────
export function ShopPageClient({ items }: { items: ShopItem[] }) {
  const [mode,     setMode]     = useState<ViewMode>("grid");
  const [filter,   setFilter]   = useState<Filter>("All");
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [chaosPositions, setChaosPositions] = useState<Record<string, [number, number]>>(() =>
    Object.fromEntries(items.map((item, i) => [
      item.id,
      [...CHAOS_POSITIONS[i % CHAOS_POSITIONS.length]] as [number, number],
    ]))
  );

  const handlePositionChange = useCallback((id: string, pos: [number, number]) => {
    setChaosPositions(prev => ({ ...prev, [id]: pos }));
  }, []);

  const filteredItems = useMemo(() =>
    filter === "All" ? items : items.filter(item => item.availability === filter),
  [filter, items]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const selectedIndex = selected
    ? filteredItems.findIndex(i => i.id === selected.id)
    : -1;

  const selectSibling = (dir: 1 | -1) => {
    if (!filteredItems.length) return;
    const cur  = selectedIndex >= 0 ? selectedIndex : 0;
    const next = (cur + dir + filteredItems.length) % filteredItems.length;
    setSelected(filteredItems[next]);
  };

  const isStaticGrid = isMobile && mode === "grid";

  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      height: isStaticGrid ? "auto" : "100svh",
      overflow: isStaticGrid ? "visible" : "hidden",
      background: "#B7D1EA",
      color: "#392D2B",
      isolation: "isolate",
    }}>
      <DotBackground />

      {/* Header copy */}
      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", flexDirection: "column",
 zIndex: 2, padding: "120px 30px 0", width: "min(900px, calc(100vw - 60px))" }}>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
          fontWeight: 400, fontSize: "clamp(48px, 4.2vw, 70px)",
          lineHeight: 0.9, letterSpacing: 0,
        }}>
          <span style={{ color: "#C86733" }}>Material,</span> in its simplest form.
        </h1>
        <span style={{
          display: "block", width: "min(450px, 80vw)", marginTop: "clamp(8px, 1.2vw, 16px)",
          fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
          fontSize: 13, lineHeight: 1.23,
        }}>
          Objects shaped through the same process — design, fabrication, and detail.
        </span>

{isStaticGrid ? (
        /* Mobile grid: flex-wrap layout, each card in a zoomed wrapper */
        <div style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          padding: "20px 15px 100px",
          justifyContent: "center",
          alignItems: "flex-start",
        }}>
          {filteredItems.map((item, index) => (
            <div key={item.id} style={{ position: "relative", width: CARD_W, height: 330, zoom: "0.75" }}>
              <ProductCard
                item={item}
                index={index}
                position={[0, 0]}
                onSelect={setSelected}
                mode="grid"
              />
            </div>
          ))}
        </div>
      ) : (
        /* Desktop / chaos: absolute-positioned stage */
        <div
          ref={stageRef}
          style={{
            position: "absolute",
            zIndex: 2, left: "min(30px, 4vw)", top: "clamp(100px, 13vw, 240px)",
            width: "calc(100vw - 60px)",
            height: "min(680px, calc(100svh - 370px))",
            zoom: isMobile ? "0.75" : undefined,
          }}
        >
          {filteredItems.map((item, index) => (
            <ProductCard
              key={item.id}
              item={item}
              index={index}
              position={
                mode === "grid"
                  ? GRID_POSITIONS[index % GRID_POSITIONS.length]
                  : (chaosPositions[item.id] ?? CHAOS_POSITIONS[index % CHAOS_POSITIONS.length])
              }
              onSelect={setSelected}
              onPositionChange={handlePositionChange}
              stageRef={stageRef}
              mode={mode}
            />
          ))}
        </div>
      )}
      </div>

      

      {/* Filter bar */}
      <div className={isStaticGrid ? "shop-filter-wrap-static" : "shop-filter-wrap"}>
        <FilterBar mode={mode} filter={filter} onMode={setMode} onFilter={setFilter} />
      </div>

      {/* Popup */}
      {selected && (
        <ProductPopup
          item={selected}
          onClose={() => setSelected(null)}
          onPrevious={() => selectSibling(-1)}
          onNext={() => selectSibling(1)}
        />
      )}

      <style jsx global>{`
        @keyframes sc-enter {
          to { opacity: 1; transform: translate3d(0,0,0); }
        }
        @keyframes sc-fadein {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes sc-popup-in {
          from { opacity: 0; transform: translate3d(0,18px,0) scale(0.985); }
          to   { opacity: 1; transform: translate3d(0,0,0) scale(1); }
        }

        .shop-filter-wrap {
          position: absolute;
          z-index: 5;
          left: 50%;
          bottom: 30px;
          transform: translateX(-50%);
        }
        .shop-filter-wrap-static {
          position: sticky;
          bottom: 16px;
          z-index: 5;
          display: flex;
          justify-content: center;
          zoom: 0.82;
          margin-top: -30px;
        }

        @media (max-width: 768px) {
          .shop-filter-wrap {
            bottom: 16px;
            zoom: 0.82;
          }
        }
      `}</style>
    </section>
  );
}
