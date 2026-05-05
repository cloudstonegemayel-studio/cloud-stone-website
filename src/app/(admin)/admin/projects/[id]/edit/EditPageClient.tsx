"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProjectMetaForm } from "@/components/admin/ProjectMetaForm";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { TemplateSelector } from "@/components/admin/TemplateSelector";
import type { MetaData } from "@/components/admin/ProjectMetaForm";
import type { ContentBlock, BlockTemplate } from "@/types/blocks";

interface Props {
  projectId: string;
  initialMeta:   MetaData;
  initialBlocks: ContentBlock[];
}

export function EditPageClient({ projectId, initialMeta, initialBlocks }: Props) {
  const router = useRouter();
  const [meta,   setMeta]   = useState<MetaData>(initialMeta);
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const [activeTab, setActiveTab] = useState<"meta" | "blocks">("meta");

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
          description:       meta.description || null,
          short_description: meta.short_description || null,
          cover_image:       meta.cover_image  || null,
          slider_items:      meta.slider_items,
          project_year:      meta.project_year  ? parseInt(meta.project_year,  10) : null,
          project_type:      meta.project_type  || null,
          project_status:    meta.project_status || null,
          location:          meta.location       || null,
          client:            meta.client         || null,
          site_area:         meta.site_area      || null,
          status:            meta.status,
          sort_order:        meta.sort_order,
          content_blocks:    blocks,
        })
        .eq("id", projectId);

      if (err) throw new Error(err.message);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 24px",
        background: "#EDE9E3", borderBottom: "1.5px solid #DDD7CF",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 0 }}>
          {(["meta", "blocks"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 16px", fontSize: 12, border: "1.5px solid #DDD7CF",
                cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.05em",
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
          {saved && <span style={{ fontSize: 12, color: "#2ECC71" }}>Saved</span>}
          {error && <span style={{ fontSize: 12, color: "#C0392B" }}>{error}</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              padding: "7px 20px", fontSize: 12,
              background: saving ? "#A09890" : "#392D2B",
              color: "#F0EEE9", border: "none", borderRadius: 5,
              cursor: saving ? "wait" : "pointer",
              fontWeight: 600, letterSpacing: "0.05em",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {activeTab === "meta" ? (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <ProjectMetaForm projectId={projectId} data={meta} onChange={setMeta} />
          </div>
        ) : (
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
            <BlockEditor projectId={projectId} blocks={blocks} onChange={setBlocks} />
            <div style={{ borderTop: "1.5px solid #DDD7CF", paddingTop: 20 }}>
              <TemplateSelector onSelect={addBlock} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
