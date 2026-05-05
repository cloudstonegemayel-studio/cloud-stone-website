"use client";

import { ImageUpload } from "./ImageUpload";
import type { SliderItem } from "@/types/blocks";

export interface MetaData {
  title:             string;
  slug:              string;
  short_description: string;
  description:       string;
  cover_image:       string;
  slider_items:      SliderItem[];
  project_year:      string;
  project_type:      string;
  project_status:    string;
  location:          string;
  client:            string;
  site_area:         string;
  status:            "draft" | "published";
  sort_order:        number;
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

  // ── Slider items ────────────────────────────────────────────────────────────

  function addSlide() {
    set("slider_items", [...data.slider_items, { type: "image", url: "" }]);
  }

  function removeSlide(i: number) {
    set("slider_items", data.slider_items.filter((_, idx) => idx !== i));
  }

  function updateSlide(i: number, patch: Partial<SliderItem>) {
    set("slider_items", data.slider_items.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Basic info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title">
          <input style={inputStyle} {...txt("title")} />
        </Field>
        <Field label="Slug">
          <input style={inputStyle} {...txt("slug")} />
        </Field>
        <Field label="Status">
          <select style={inputStyle} {...txt("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Sort order">
          <input
            style={inputStyle}
            type="number"
            value={data.sort_order}
            onChange={(e) => set("sort_order", parseInt(e.target.value, 10) || 0)}
          />
        </Field>
      </div>

      {/* Short description */}
      <Field label="Short description (hero)">
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
          {...txt("short_description")}
        />
      </Field>

      {/* Full description */}
      <Field label="Description">
        <textarea
          style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
          {...txt("description")}
        />
      </Field>

      {/* Cover image */}
      <ImageUpload
        projectId={projectId}
        value={data.cover_image}
        onChange={(u) => set("cover_image", u)}
        scope="cover"
        label="Cover image (hero)"
        aspect="wide"
      />

      {/* Project details */}
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

      {/* Slider */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#887870" }}>
            Slider items
          </span>
          <button
            type="button"
            onClick={addSlide}
            style={{
              fontSize: 11, padding: "4px 10px",
              background: "#392D2B", color: "#F0EEE9",
              border: "none", borderRadius: 4, cursor: "pointer",
            }}
          >
            + Add slide
          </button>
        </div>

        {data.slider_items.map((slide, i) => (
          <div key={i} style={{
            background: "#F5F1EC", border: "1.5px solid #DDD7CF",
            borderRadius: 6, padding: 12,
            display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10,
            alignItems: "start",
          }}>
            <Field label={`Slide ${i + 1} — type`}>
              <select
                style={inputStyle}
                value={slide.type}
                onChange={(e) => updateSlide(i, { type: e.target.value as "image" | "video" })}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>

            {slide.type === "image" ? (
              <ImageUpload
                projectId={projectId}
                value={slide.url}
                onChange={(u) => updateSlide(i, { url: u })}
                scope={`slide-${i}`}
                label="Image"
                aspect="wide"
              />
            ) : (
              <Field label="Video URL">
                <input
                  style={inputStyle}
                  value={slide.url}
                  onChange={(e) => updateSlide(i, { url: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
            )}

            <button
              type="button"
              onClick={() => removeSlide(i)}
              style={{
                background: "none", border: "none",
                fontSize: 18, color: "#C0392B", cursor: "pointer",
                marginTop: 22, alignSelf: "start",
              }}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
