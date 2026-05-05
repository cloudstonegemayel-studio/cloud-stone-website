"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function autoSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 14,
  color: "#392D2B",
  background: "#F5F1EC",
  border: "1.5px solid #DDD7CF",
  borderRadius: 5,
  outline: "none",
  boxSizing: "border-box",
};

export function NewProjectClient() {
  const router = useRouter();
  const [title,   setTitle]   = useState("");
  const [slug,    setSlug]    = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugEdited) setSlug(autoSlug(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res  = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), slug: slug.trim() }),
      });

      const text = await res.text();
      let data: { id?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || `Server error ${res.status}`);
      }
      if (!res.ok) throw new Error(data.error ?? "Create failed");

      router.push(`/admin/projects/${data.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#887870" }}>
            Title
          </label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Studio Twenty Seven"
            autoFocus
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#887870" }}>
            Slug
          </label>
          <input
            style={inputStyle}
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder="studio-twenty-seven"
            required
          />
          <span style={{ fontSize: 10, color: "#A09890" }}>
            /design/{slug || "…"}
          </span>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: 12, color: "#C0392B" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "9px 28px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              background: saving ? "#A09890" : "#392D2B",
              color: "#F0EEE9",
              border: "none",
              borderRadius: 4,
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving ? "Creating…" : "Create & edit"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            style={{
              padding: "9px 20px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: "transparent",
              color: "#A09890",
              border: "1.5px solid #DDD7CF",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
