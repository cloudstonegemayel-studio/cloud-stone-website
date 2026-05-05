"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ContentBlock, SplitDetailBlock, FullMediaBlock, HalfMediaTextBlock } from "@/types/blocks";
import { ImageUpload } from "./ImageUpload";

interface Props {
  projectId: string;
  blocks:    ContentBlock[];
  onChange:  (blocks: ContentBlock[]) => void;
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#887870" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px",
  fontSize: 13, color: "#392D2B",
  background: "#F5F1EC", border: "1.5px solid #DDD7CF",
  borderRadius: 5, outline: "none", boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, minHeight: 80, resize: "vertical",
};

function SelectField({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Per-block form ─────────────────────────────────────────────────────────────

function SplitDetailForm({
  block, projectId, onChange,
}: { block: SplitDetailBlock; projectId: string; onChange: (b: SplitDetailBlock) => void }) {
  function set<K extends keyof SplitDetailBlock>(key: K, val: SplitDetailBlock[K]) {
    onChange({ ...block, [key]: val });
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <FieldRow label="Background">
        <SelectField value={block.bg} onChange={(v) => set("bg", v as "dark" | "light")}
          options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
      </FieldRow>
      <FieldRow label="Layout">
        <SelectField value={block.layout} onChange={(v) => set("layout", v as "image_right" | "image_left")}
          options={[{ value: "image_right", label: "Image right" }, { value: "image_left", label: "Image left" }]} />
      </FieldRow>
      <ImageUpload projectId={projectId} value={block.small_image ?? ""} onChange={(u) => set("small_image", u)} scope="split" label="Small image" aspect="portrait" />
      <ImageUpload projectId={projectId} value={block.big_image   ?? ""} onChange={(u) => set("big_image",   u)} scope="split" label="Large image" aspect="wide" />
      <FieldRow label="Caption 1">
        <textarea style={textareaStyle} value={block.caption1 ?? ""} onChange={(e) => set("caption1", e.target.value)} />
      </FieldRow>
      <FieldRow label="Caption 2">
        <textarea style={textareaStyle} value={block.caption2 ?? ""} onChange={(e) => set("caption2", e.target.value)} />
      </FieldRow>
    </div>
  );
}

function FullMediaForm({
  block, projectId, onChange,
}: { block: FullMediaBlock; projectId: string; onChange: (b: FullMediaBlock) => void }) {
  function set<K extends keyof FullMediaBlock>(key: K, val: FullMediaBlock[K]) {
    onChange({ ...block, [key]: val });
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <FieldRow label="Media type">
        <SelectField value={block.media_type} onChange={(v) => set("media_type", v as "image" | "video")}
          options={[{ value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
      </FieldRow>
      <FieldRow label="Dark overlay">
        <SelectField value={block.overlay ? "yes" : "no"} onChange={(v) => set("overlay", v === "yes")}
          options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />
      </FieldRow>
      {block.media_type === "image" ? (
        <div style={{ gridColumn: "1 / -1" }}>
          <ImageUpload projectId={projectId} value={block.url ?? ""} onChange={(u) => set("url", u)} scope="full" label="Image" aspect="wide" />
        </div>
      ) : (
        <>
          <FieldRow label="Video URL">
            <input style={inputStyle} value={block.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="https://…" />
          </FieldRow>
          <ImageUpload projectId={projectId} value={block.poster ?? ""} onChange={(u) => set("poster", u)} scope="full" label="Poster image" aspect="wide" />
        </>
      )}
    </div>
  );
}

function HalfMediaTextForm({
  block, projectId, onChange,
}: { block: HalfMediaTextBlock; projectId: string; onChange: (b: HalfMediaTextBlock) => void }) {
  function set<K extends keyof HalfMediaTextBlock>(key: K, val: HalfMediaTextBlock[K]) {
    onChange({ ...block, [key]: val });
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <FieldRow label="Background">
        <SelectField value={block.bg} onChange={(v) => set("bg", v as "dark" | "light")}
          options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
      </FieldRow>
      <FieldRow label="Media side">
        <SelectField value={block.media_side} onChange={(v) => set("media_side", v as "left" | "right")}
          options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
      </FieldRow>
      <FieldRow label="Media type">
        <SelectField value={block.media_type} onChange={(v) => set("media_type", v as "image" | "video")}
          options={[{ value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
      </FieldRow>
      <div />
      {block.media_type === "image" ? (
        <div style={{ gridColumn: "1 / -1" }}>
          <ImageUpload projectId={projectId} value={block.url ?? ""} onChange={(u) => set("url", u)} scope="half" label="Image" aspect="portrait" />
        </div>
      ) : (
        <>
          <FieldRow label="Video URL">
            <input style={inputStyle} value={block.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="https://…" />
          </FieldRow>
          <ImageUpload projectId={projectId} value={block.poster ?? ""} onChange={(u) => set("poster", u)} scope="half" label="Poster" aspect="portrait" />
        </>
      )}
      <FieldRow label="Heading">
        <input style={inputStyle} value={block.heading ?? ""} onChange={(e) => set("heading", e.target.value)} />
      </FieldRow>
      <FieldRow label="Body text">
        <textarea style={textareaStyle} value={block.body ?? ""} onChange={(e) => set("body", e.target.value)} />
      </FieldRow>
    </div>
  );
}

// ── Sortable block row ─────────────────────────────────────────────────────────

function BlockRow({
  block, projectId, onChange, onRemove,
}: {
  block:     ContentBlock;
  projectId: string;
  onChange:  (b: ContentBlock) => void;
  onRemove:  () => void;
}) {
  const [open, setOpen] = useState(true);

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: "#fff",
    border: "1.5px solid #DDD7CF",
    borderRadius: 8,
    overflow: "hidden",
  };

  const label =
    block.type === "split_detail"    ? `Split — ${block.bg} / ${block.layout}` :
    block.type === "full_media"      ? `Full ${block.media_type}` :
    block.type === "half_media_text" ? `Half ${block.media_side} — ${block.bg}` :
    "Unknown block";

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px",
        background: "#F5F1EC",
        borderBottom: open ? "1.5px solid #DDD7CF" : "none",
        cursor: "default",
      }}>
        <span
          {...attributes}
          {...listeners}
          style={{ cursor: "grab", color: "#A09890", fontSize: 16, lineHeight: 1 }}
        >⠿</span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#392D2B" }}>{label}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#887870" }}
        >
          {open ? "▲" : "▼"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#C0392B" }}
        >×</button>
      </div>

      {open && (
        <div style={{ padding: 16 }}>
          {block.type === "split_detail" && (
            <SplitDetailForm
              block={block}
              projectId={projectId}
              onChange={(b) => onChange(b)}
            />
          )}
          {block.type === "full_media" && (
            <FullMediaForm
              block={block}
              projectId={projectId}
              onChange={(b) => onChange(b)}
            />
          )}
          {block.type === "half_media_text" && (
            <HalfMediaTextForm
              block={block}
              projectId={projectId}
              onChange={(b) => onChange(b)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main BlockEditor ───────────────────────────────────────────────────────────

export function BlockEditor({ projectId, blocks, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    onChange(arrayMove(blocks, oldIdx, newIdx));
  }

  function updateBlock(id: string, updated: ContentBlock) {
    onChange(blocks.map((b) => (b.id === id ? updated : b)));
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              projectId={projectId}
              onChange={(b) => updateBlock(block.id, b)}
              onRemove={() => removeBlock(block.id)}
            />
          ))}
          {blocks.length === 0 && (
            <p style={{ textAlign: "center", color: "#A09890", fontSize: 13, padding: "24px 0" }}>
              No blocks yet. Add one below.
            </p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
