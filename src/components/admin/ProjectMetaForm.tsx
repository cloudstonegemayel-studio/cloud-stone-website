"use client";

import { ImageUpload } from "./ImageUpload";
import type { SliderItem } from "@/types/blocks";

export interface MetaData {
  title:             string;
  slug:              string;
  short_description: string;
  description:       string;
  status:            "draft" | "published";
  sort_order:        number;
  project_number:    string;
  light_text:        boolean;

  // Hero
  cover_image:       string;
  cover_image_alt:   string;
  slider_items:      SliderItem[];

  // Project card (design page)
  card_image:              string;
  card_image_alt:          string;
  card_hover_image:        string;
  card_hover_image_alt:    string;

  // Section images
  section2_image:          string;
  section2_image_alt:      string;
  section4_image:          string;
  section4_image_alt:      string;

  // Project details
  project_year:      string;
  project_type:      string;
  project_status:    string;
  location:          string;
  client:            string;
  site_area:         string;
}

interface Props {
  projectId: string;
  data:      MetaData;
  onChange:  (data: MetaData) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px",
  fontSize: 13, color: "#392D2B",
  background: "#F5F1EC", border: "1.5px solid #DDD7CF",
  borderRadius: 5, outline: "none", boxSizing: "border-box",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
  color: "#887870", margin: "8px 0 12px", paddingBottom: 6,
  borderBottom: "1px solid #DDD7CF",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#887870" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function ProjectMetaForm({ projectId, data, onChange }: Props) {
  function set<K extends keyof MetaData>(key: K, val: MetaData[K]) {
    onChange({ ...data, [key]: val });
  }
  function txt(key: keyof MetaData) {
    return {
      value: data[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        set(key, e.target.value as MetaData[typeof key]),
    };
  }

  function addSlide() {
    set("slider_items", [...data.slider_items, { type: "image", url: "", alt: "" }]);
  }
  function removeSlide(i: number) {
    set("slider_items", data.slider_items.filter((_, idx) => idx !== i));
  }
  function updateSlide(i: number, patch: Partial<SliderItem>) {
    set("slider_items", data.slider_items.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Publishing ─────────────────────────────────────────────────── */}
      <p style={sectionLabel}>Publishing</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Status">
          <select style={inputStyle} {...txt("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Sort order">
          <input style={inputStyle} type="number"
            value={data.sort_order}
            onChange={(e) => set("sort_order", parseInt(e.target.value, 10) || 0)} />
        </Field>
        <Field label="Project № (card badge)">
          <input style={inputStyle} {...txt("project_number")} placeholder="1" />
        </Field>
      </div>
      <Field label="Light text on card (for dark card images)">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div
            role="switch"
            aria-checked={data.light_text}
            onClick={() => set("light_text", !data.light_text)}
            style={{
              width: 36, height: 18, borderRadius: 9,
              background: data.light_text ? "#392D2B" : "#DDD7CF",
              position: "relative", transition: "background 0.2s",
            }}
          >
            <div style={{
              position: "absolute", top: 2, left: data.light_text ? 18 : 2,
              width: 14, height: 14, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s",
            }} />
          </div>
          <span style={{ fontSize: 11, color: "#887870" }}>
            {data.light_text ? "Light (card has dark bg)" : "Dark (card has light bg)"}
          </span>
        </label>
      </Field>

      {/* ── Titles ─────────────────────────────────────────────────────── */}
      <p style={sectionLabel}>Titles & descriptions</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title">
          <input style={inputStyle} {...txt("title")} />
        </Field>
        <Field label="Slug">
          <input style={inputStyle} {...txt("slug")} />
        </Field>
      </div>
      <Field label="Short description (hero)">
        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} {...txt("short_description")} />
      </Field>
      <Field label="Description (section 2)">
        <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} {...txt("description")} />
      </Field>

      {/* ── Project details ─────────────────────────────────────────────── */}
      <p style={sectionLabel}>Project details</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Year">
          <input style={inputStyle} {...txt("project_year")} placeholder="2024" />
        </Field>
        <Field label="Type">
          <input style={inputStyle} {...txt("project_type")} placeholder="Residential" />
        </Field>
        <Field label="Project status">
          <input style={inputStyle} {...txt("project_status")} placeholder="Completed" />
        </Field>
        <Field label="Location">
          <input style={inputStyle} {...txt("location")} />
        </Field>
        <Field label="Client">
          <input style={inputStyle} {...txt("client")} />
        </Field>
        <Field label="Site area">
          <input style={inputStyle} {...txt("site_area")} placeholder="120 m²" />
        </Field>
      </div>

      {/* ── Card images (design page) ───────────────────────────────────── */}
      <p style={sectionLabel}>Card images — Design page</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ImageUpload
          projectId={projectId}
          value={data.card_image}
          onChange={(u) => set("card_image", u)}
          alt={data.card_image_alt}
          onAltChange={(a) => set("card_image_alt", a)}
          scope="card"
          label="Card image (blueprint / sketch)"
          aspect="portrait"
        />
        <ImageUpload
          projectId={projectId}
          value={data.card_hover_image}
          onChange={(u) => set("card_hover_image", u)}
          alt={data.card_hover_image_alt}
          onAltChange={(a) => set("card_hover_image_alt", a)}
          scope="card-hover"
          label="Card hover image (photo)"
          aspect="portrait"
        />
      </div>

      {/* ── Page images ─────────────────────────────────────────────────── */}
      <p style={sectionLabel}>Page images</p>
      <ImageUpload
        projectId={projectId}
        value={data.cover_image}
        onChange={(u) => set("cover_image", u)}
        alt={data.cover_image_alt}
        onAltChange={(a) => set("cover_image_alt", a)}
        scope="cover"
        label="Hero / Cover image (Section 1 background)"
        aspect="wide"
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ImageUpload
          projectId={projectId}
          value={data.section2_image}
          onChange={(u) => set("section2_image", u)}
          alt={data.section2_image_alt}
          onAltChange={(a) => set("section2_image_alt", a)}
          scope="section2"
          label="Section 2 image (info block)"
          aspect="portrait"
        />
        <ImageUpload
          projectId={projectId}
          value={data.section4_image}
          onChange={(u) => set("section4_image", u)}
          alt={data.section4_image_alt}
          onAltChange={(a) => set("section4_image_alt", a)}
          scope="section4"
          label="Section 4 image (end section)"
          aspect="wide"
        />
      </div>

      {/* ── Slider ──────────────────────────────────────────────────────── */}
      <p style={sectionLabel}>Hero slider</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#A09890" }}>Slides ({data.slider_items.length})</span>
          <button type="button" onClick={addSlide} style={{
            fontSize: 11, padding: "4px 10px",
            background: "#392D2B", color: "#F0EEE9",
            border: "none", borderRadius: 4, cursor: "pointer",
          }}>+ Add slide</button>
        </div>
        {data.slider_items.map((slide, i) => (
          <div key={i} style={{
            background: "#F5F1EC", border: "1.5px solid #DDD7CF",
            borderRadius: 6, padding: 12,
            display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10,
            alignItems: "start",
          }}>
            <Field label={`Slide ${i + 1} — type`}>
              <select style={inputStyle} value={slide.type}
                onChange={(e) => updateSlide(i, { type: e.target.value as "image" | "video" })}>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>
            {slide.type === "image" ? (
              <ImageUpload
                projectId={projectId}
                value={slide.url}
                onChange={(u) => updateSlide(i, { url: u })}
                alt={slide.alt}
                onAltChange={(a) => updateSlide(i, { alt: a })}
                scope={`slide-${i}`}
                label="Image"
                aspect="wide"
              />
            ) : (
              <Field label="Video URL">
                <input style={inputStyle} value={slide.url}
                  onChange={(e) => updateSlide(i, { url: e.target.value })}
                  placeholder="https://…" />
              </Field>
            )}
            <button type="button" onClick={() => removeSlide(i)} style={{
              background: "none", border: "none", fontSize: 18,
              color: "#C0392B", cursor: "pointer", marginTop: 22,
            }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
