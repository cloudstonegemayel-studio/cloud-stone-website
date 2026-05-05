"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProjectMetaForm } from "@/components/admin/ProjectMetaForm";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { TemplateSelector } from "@/components/admin/TemplateSelector";
import { ProjectPreview } from "@/components/admin/ProjectPreview";
import type { MetaData } from "@/components/admin/ProjectMetaForm";
import type { ContentBlock, BlockTemplate } from "@/types/blocks";

type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  sort_order: number;
};

interface Props {
  projectId:    string;
  initialMeta:  MetaData;
  initialBlocks: ContentBlock[];
  projectList:  ProjectListItem[];
}

const S = {
  sidebar: {
    width: 220,
    background: "#EDE9E3",
    borderRight: "1.5px solid #DDD7CF",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: "12px 14px 10px",
    fontSize: 9,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#887870",
    borderBottom: "1px solid #DDD7CF",
    flexShrink: 0,
  },
  sidebarList: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "6px 0",
  },
  sidebarItem: (active: boolean, published: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    cursor: "pointer",
    background: active ? "rgba(57,45,43,0.08)" : "transparent",
    borderLeft: active ? "2px solid #392D2B" : "2px solid transparent",
    textDecoration: "none",
    transition: "background 0.12s",
  }),
  dot: (published: boolean): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: published ? "#2ECC71" : "#DDD7CF",
    flexShrink: 0,
  }),
  previewPanel: {
    width: 420,
    borderLeft: "1.5px solid #DDD7CF",
    background: "#C9BFB8",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    flexShrink: 0,
  },
  previewHeader: {
    padding: "10px 14px",
    fontSize: 9,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#887870",
    borderBottom: "1px solid #B8B0A8",
    background: "#C9BFB8",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
} as const;

export function EditPageClient({
  projectId,
  initialMeta,
  initialBlocks,
  projectList,
}: Props) {
  const router = useRouter();
  const [meta,      setMeta]      = useState<MetaData>(initialMeta);
  const [blocks,    setBlocks]    = useState<ContentBlock[]>(initialBlocks);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState<"meta" | "blocks">("meta");
  const [showPreview, setShowPreview] = useState(true);

  const addBlock = useCallback((tpl: BlockTemplate) => {
    const newBlock: ContentBlock = {
      ...tpl.defaultBlock,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    } as ContentBlock;
    setBlocks((prev) => [...prev, newBlock]);
    setActiveTab("blocks");
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase as any)
        .from("projects")
        .update({
          title:             meta.title,
          slug:              meta.slug,
          description:       meta.description       || null,
          short_description: meta.short_description || null,
          cover_image:       meta.cover_image        || null,
          slider_items:      meta.slider_items,
          project_year:      meta.project_year  ? parseInt(meta.project_year, 10) : null,
          project_type:      meta.project_type      || null,
          project_status:    meta.project_status    || null,
          location:          meta.location           || null,
          client:            meta.client             || null,
          site_area:         meta.site_area          || null,
          status:            meta.status,
          sort_order:        meta.sort_order,
          content_blocks:    blocks,
        })
        .eq("id", projectId);

      if (err) throw new Error(err.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden" }}>

      {/* ── Left sidebar: project list ───────────────────────────────────────── */}
      <div style={S.sidebar}>
        <div style={S.sidebarHeader}>
          All projects ({projectList.length})
        </div>
        <div style={S.sidebarList}>
          {projectList.map((p) => {
            const isActive = p.id === projectId;
            const isPublished = p.status === "published";
            return (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}/edit`}
                style={S.sidebarItem(isActive, isPublished)}
              >
                <div style={S.dot(isPublished)} />
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: 12,
                    fontFamily: "var(--font-rader,'PP Rader',serif)",
                    fontStyle: "italic",
                    color: isActive ? "#392D2B" : "#6B5E5A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                  }}>
                    {p.title || "Untitled"}
                  </p>
                  <p style={{
                    margin: "2px 0 0",
                    fontSize: 9,
                    color: "#A09890",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    /design/{p.slug}
                  </p>
                </div>
              </Link>
            );
          })}
          <Link
            href="/admin/projects/new"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              marginTop: 4,
              borderTop: "1px solid #DDD7CF",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 14, color: "#A09890" }}>+</span>
            <span style={{ fontSize: 11, color: "#A09890", letterSpacing: "0.05em" }}>
              New project
            </span>
          </Link>
        </div>
      </div>

      {/* ── Center: editor ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          background: "#EDE9E3",
          borderBottom: "1.5px solid #DDD7CF",
          flexShrink: 0,
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {(["meta", "blocks"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px",
                  fontSize: 11,
                  border: "1.5px solid #DDD7CF",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  background: activeTab === tab ? "#392D2B" : "#F5F1EC",
                  color:      activeTab === tab ? "#F0EEE9" : "#392D2B",
                  borderRadius: tab === "meta" ? "4px 0 0 4px" : "0 4px 4px 0",
                  borderRight: tab === "meta" ? "none" : undefined,
                }}
              >
                {tab === "meta" ? "Metadata" : `Blocks (${blocks.length})`}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {/* Preview toggle */}
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              style={{
                padding: "5px 12px",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                background: showPreview ? "rgba(57,45,43,0.12)" : "transparent",
                border: "1.5px solid #DDD7CF",
                borderRadius: 4,
                cursor: "pointer",
                color: "#6B5E5A",
              }}
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </button>

            {saved  && <span style={{ fontSize: 11, color: "#2ECC71" }}>Saved ✓</span>}
            {error  && <span style={{ fontSize: 11, color: "#C0392B" }}>{error}</span>}

            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                padding: "7px 22px",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 600,
                background: saving ? "#A09890" : "#392D2B",
                color: "#F0EEE9",
                border: "none",
                borderRadius: 4,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Editor body */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          {activeTab === "meta" ? (
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <ProjectMetaForm projectId={projectId} data={meta} onChange={setMeta} />
            </div>
          ) : (
            <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
              <BlockEditor projectId={projectId} blocks={blocks} onChange={setBlocks} />
              <div style={{ borderTop: "1.5px solid #DDD7CF", paddingTop: 20 }}>
                <TemplateSelector onSelect={addBlock} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: live preview ─────────────────────────────────────────── */}
      {showPreview && (
        <div style={S.previewPanel}>
          <div style={S.previewHeader}>
            <span>Live Preview</span>
            <span style={{ fontSize: 8, opacity: 0.6 }}>updates in real-time</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ProjectPreview meta={meta} blocks={blocks} />
          </div>
        </div>
      )}
    </div>
  );
}
