"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  projectId?: string;
  value:       string;
  onChange:    (url: string) => void;
  alt?:        string;
  onAltChange?: (alt: string) => void;
  scope?:      string;
  label?:      string;
  aspect?:     "square" | "wide" | "portrait";
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "5px 8px",
  fontSize: 11, color: "#392D2B",
  background: "#F5F1EC", border: "1.5px solid #DDD7CF",
  borderRadius: 4, outline: "none", boxSizing: "border-box",
};

export function ImageUpload({
  value, onChange,
  alt, onAltChange,
  scope = "misc",
  label = "Upload image",
  aspect = "wide",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState("");

  const aspectStyle: React.CSSProperties =
    aspect === "square"   ? { paddingBottom: "100%" } :
    aspect === "portrait" ? { paddingBottom: "133%" } :
                            { paddingBottom: "56.25%" };

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setErr("Images only"); return; }
    setErr("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (alt) form.append("alt", alt);
      const res  = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#887870" }}>
          {label}
        </span>
      )}

      {/* Alt text input */}
      {onAltChange !== undefined && (
        <input
          style={inputStyle}
          value={alt ?? ""}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Alt text / SEO filename"
        />
      )}

      {/* Drop zone */}
      <div
        style={{
          position: "relative",
          background: "#EDE9E3",
          border: "1.5px dashed #C9BFB8",
          borderRadius: 6,
          cursor: uploading ? "wait" : "pointer",
          overflow: "hidden",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <div style={{ ...aspectStyle, width: "100%" }} />
        {value ? (
          <>
            <Image
              src={value}
              alt={alt ?? ""}
              fill
              sizes="(max-width:768px) 100vw, 400px"
              style={{ objectFit: "cover" }}
            />
            {/* Hover overlay — shows "Replace" affordance */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(57,45,43,0)",
              transition: "background 180ms ease",
              pointerEvents: "none",
            }}
              className="img-replace-overlay"
            >
              <span style={{
                fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
                fontSize: 10, fontWeight: 600, letterSpacing: "1px",
                textTransform: "uppercase", color: "#F0EEE9",
                opacity: 0, transition: "opacity 180ms ease",
              }}
                className="img-replace-label"
              >
                Click to replace
              </span>
            </div>
          </>
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 8, color: "#A09890",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <span style={{ fontSize: 12 }}>{uploading ? "Uploading…" : "Drop or click"}</span>
          </div>
        )}
        {uploading && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(57,45,43,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#F0EEE9", fontSize: 13 }}>Uploading…</span>
          </div>
        )}
        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            style={{
              position: "absolute", top: 6, right: 6,
              background: "rgba(57,45,43,0.7)", border: "none",
              borderRadius: "50%", width: 24, height: 24,
              color: "#F0EEE9", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 2,
            }}
          >×</button>
        )}
        <style>{`
          .img-replace-overlay:hover,
          div:hover > .img-replace-overlay {
            background: rgba(57,45,43,0.45) !important;
          }
          div:hover > .img-replace-overlay .img-replace-label,
          .img-replace-overlay:hover .img-replace-label {
            opacity: 1 !important;
          }
        `}</style>
      </div>
      {err && <span style={{ fontSize: 11, color: "#C0392B" }}>{err}</span>}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onInputChange} />
    </div>
  );
}
