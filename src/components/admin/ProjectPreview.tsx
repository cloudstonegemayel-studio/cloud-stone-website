"use client";

import Image from "next/image";
import type {
  ContentBlock,
  SplitDetailBlock,
  FullMediaBlock,
  HalfMediaTextBlock,
} from "@/types/blocks";
import type { MetaData } from "./ProjectMetaForm";

interface Props {
  meta: MetaData;
  blocks: ContentBlock[];
}

export function ProjectPreview({ meta, blocks }: Props) {
  const firstSlide = meta.slider_items[0] ?? null;
  const slideCount = meta.slider_items.length;

  return (
    <div
      style={{
        fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: "#C9BFB8",
      }}
    >
      {/* ── Section 2 — Slider + Info ─────────────────────────────────────────── */}
      <div
        style={{
          height: 240,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Left: slider preview */}
        <div style={{ position: "relative", overflow: "hidden", background: "#D8D5D0" }}>
          {firstSlide && firstSlide.type === "image" && firstSlide.url ? (
            <Image
              src={firstSlide.url}
              alt=""
              fill
              sizes="200px"
              style={{ objectFit: "cover" }}
            />
          ) : firstSlide && firstSlide.type === "video" ? (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#2a2220",
            }}>
              <span style={{ fontSize: 28, color: "rgba(240,238,233,0.5)" }}>▶</span>
            </div>
          ) : (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 8, color: "rgba(57,45,43,0.3)" }}>No slides</span>
            </div>
          )}
          {/* Dot indicators */}
          {slideCount > 1 && (
            <div style={{
              position: "absolute", bottom: 8, left: "50%",
              transform: "translateX(-50%)",
              display: "flex", gap: 4,
            }}>
              {meta.slider_items.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === 0 ? 10 : 4, height: 4, borderRadius: 2,
                    background: i === 0 ? "rgba(240,238,233,0.9)" : "rgba(240,238,233,0.3)",
                    transition: "width 200ms",
                  }}
                />
              ))}
            </div>
          )}
          {slideCount > 0 && (
            <div style={{
              position: "absolute", top: 6, left: 8,
              fontSize: 7, color: "rgba(240,238,233,0.6)",
              background: "rgba(0,0,0,0.35)", padding: "2px 5px", borderRadius: 2,
            }}>
              {slideCount} slide{slideCount !== 1 ? "s" : ""}
            </div>
          )}
          <SectionLabel label="Slider" light />
        </div>

        {/* Right: info */}
        <div
          style={{
            background: "#F0EEE9",
            padding: "14px 12px 12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-rader,'PP Rader',serif)",
              fontWeight: 400,
              fontSize: 18,
              lineHeight: 0.9,
              color: "#392D2B",
              textAlign: "right",
            }}
          >
            {meta.title || "—"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ fontSize: 8, lineHeight: 1.6, color: "#392D2B", opacity: 0.75 }}>
              {meta.project_status && <div>Status: {meta.project_status}</div>}
              {meta.project_year   && <div>Year: {meta.project_year}</div>}
              {meta.client         && <div>Client: {meta.client}</div>}
              {meta.site_area      && <div>Area: {meta.site_area}</div>}
              {meta.location       && <div>Location: {meta.location}</div>}
              {meta.project_type   && <div>Type: {meta.project_type}</div>}
            </div>
            {meta.description && (
              <p style={{ margin: 0, fontSize: 8, lineHeight: 1.5, color: "#392D2B", opacity: 0.6, flex: 1 }}>
                {meta.description.slice(0, 160)}{meta.description.length > 160 ? "…" : ""}
              </p>
            )}
          </div>
          <SectionLabel label="Info" />
        </div>
      </div>

      {/* ── Content Blocks ────────────────────────────────────────────────────── */}
      {blocks.map((block, i) => (
        <BlockPreviewCard key={block.id} block={block} index={i} />
      ))}

      {blocks.length === 0 && (
        <div
          style={{
            height: 80,
            background: "#E7E4DF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: 10, color: "#A09890", letterSpacing: "0.08em" }}>
            No content blocks · add from editor
          </p>
        </div>
      )}

      {/* ── Outro — dark end section ──────────────────────────────────────────── */}
      <div
        style={{
          height: 140,
          background: "#392D2B",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {meta.section4_image && (
          <Image
            src={meta.section4_image}
            alt=""
            fill
            sizes="420px"
            style={{ objectFit: "cover", opacity: 0.35 }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-rader,'PP Rader',serif)",
              fontWeight: 400,
              fontSize: 22,
              color: "#F0EEE9",
              opacity: 0.6,
            }}
          >
            {meta.title || "—"}
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 7, color: "rgba(240,238,233,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ← prev · Inquire · next →
          </p>
        </div>
        <SectionLabel label="Outro" light />
      </div>
    </div>
  );
}

// ── Block cards ──────────────────────────────────────────────────────────────

function BlockPreviewCard({ block, index }: { block: ContentBlock; index: number }) {
  switch (block.type) {
    case "split_detail":    return <SplitDetailPreview   block={block} index={index} />;
    case "full_media":      return <FullMediaPreview     block={block} index={index} />;
    case "half_media_text": return <HalfMediaTextPreview block={block} index={index} />;
    default: return null;
  }
}

function SplitDetailPreview({ block, index }: { block: SplitDetailBlock; index: number }) {
  const bgColor   = block.bg === "dark" ? "#392D2B" : "#F0EEE9";
  const textColor = block.bg === "dark" ? "#F0EEE9" : "#392D2B";
  const label = `Split ${block.bg === "dark" ? "Dark" : "Light"} — ${block.layout === "image_right" ? "Image Right" : "Image Left"}`;

  const bgSide = (
    <div
      style={{
        background: bgColor,
        padding: "14px 12px 12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "60%",
          paddingBottom: "80%",
          background: block.bg === "dark" ? "#4d3c3a" : "#DDD7CF",
          overflow: "hidden",
          alignSelf: "flex-start",
        }}
      >
        {block.small_image ? (
          <Image src={block.small_image} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 8, color: block.bg === "dark" ? "rgba(240,238,233,0.25)" : "rgba(57,45,43,0.3)" }}>
              Small image
            </span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 10 }}>
        <p style={{ margin: 0, fontSize: 7.5, color: textColor, flex: 1, lineHeight: 1.45, opacity: 0.75 }}>
          {block.caption1 || "Caption 1"}
        </p>
        <p style={{ margin: 0, fontSize: 7.5, color: textColor, flex: 1, lineHeight: 1.45, opacity: 0.75 }}>
          {block.caption2 || "Caption 2"}
        </p>
      </div>
      <SectionLabel label={`Block ${index + 1} · ${label}`} light={block.bg === "dark"} />
    </div>
  );

  const imageSide = (
    <div style={{ position: "relative", overflow: "hidden", background: "#6B5E5A" }}>
      {block.big_image ? (
        <Image src={block.big_image} alt="" fill sizes="200px" style={{ objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>Large image</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ height: 240, display: "grid", gridTemplateColumns: "1fr 1fr", flexShrink: 0, position: "relative" }}>
      {block.layout === "image_right" ? bgSide   : imageSide}
      {block.layout === "image_right" ? imageSide : bgSide}
    </div>
  );
}

function FullMediaPreview({ block, index }: { block: FullMediaBlock; index: number }) {
  return (
    <div style={{ height: 180, position: "relative", overflow: "hidden", background: "#392D2B", flexShrink: 0 }}>
      {block.url && block.media_type === "image" ? (
        <Image src={block.url} alt="" fill sizes="420px" style={{ objectFit: "cover", opacity: block.overlay ? 0.55 : 1 }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: block.media_type === "video" ? 32 : 12, color: "rgba(240,238,233,0.3)" }}>
            {block.media_type === "video" ? "▶" : "Full image"}
          </span>
        </div>
      )}
      {block.overlay && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)" }} />}
      <SectionLabel label={`Block ${index + 1} · Full ${block.media_type === "video" ? "Video" : "Image"}`} light />
    </div>
  );
}

function HalfMediaTextPreview({ block, index }: { block: HalfMediaTextBlock; index: number }) {
  const bgColor   = block.bg === "dark" ? "#392D2B" : "#F0EEE9";
  const textColor = block.bg === "dark" ? "#F0EEE9" : "#392D2B";
  const label = `Half ${block.bg === "dark" ? "Dark" : "Light"} — Media ${block.media_side === "left" ? "Left" : "Right"}`;

  const mediaSide = (
    <div style={{ position: "relative", overflow: "hidden", background: "#6B5E5A" }}>
      {block.url && block.media_type === "image" ? (
        <Image src={block.url} alt="" fill sizes="200px" style={{ objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: block.media_type === "video" ? 24 : 9, color: "rgba(255,255,255,0.3)" }}>
            {block.media_type === "video" ? "▶" : "Image"}
          </span>
        </div>
      )}
    </div>
  );

  const textSide = (
    <div style={{ background: bgColor, padding: "16px 14px 14px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 6, position: "relative" }}>
      {block.heading ? (
        <p style={{ margin: 0, fontSize: 14, fontFamily: "var(--font-rader,'PP Rader',serif)", color: textColor, lineHeight: 1 }}>
          {block.heading}
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: 9, color: textColor, opacity: 0.3 }}>Heading</p>
      )}
      {block.body ? (
        <p style={{ margin: 0, fontSize: 8, color: textColor, opacity: 0.7, lineHeight: 1.5 }}>
          {block.body.slice(0, 140)}{block.body.length > 140 ? "…" : ""}
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: 8, color: textColor, opacity: 0.25 }}>Body text</p>
      )}
      <SectionLabel label={`Block ${index + 1} · ${label}`} light={block.bg === "dark"} />
    </div>
  );

  return (
    <div style={{ height: 210, display: "grid", gridTemplateColumns: "1fr 1fr", flexShrink: 0 }}>
      {block.media_side === "left" ? mediaSide : textSide}
      {block.media_side === "left" ? textSide : mediaSide}
    </div>
  );
}

function SectionLabel({ label, light = false }: { label: string; light?: boolean }) {
  return (
    <div
      style={{
        position: "absolute", top: 5, right: 7,
        fontSize: 7, letterSpacing: "0.08em", textTransform: "uppercase",
        color: light ? "rgba(240,238,233,0.4)" : "rgba(57,45,43,0.35)",
        pointerEvents: "none", zIndex: 20,
      }}
    >
      {label}
    </div>
  );
}
