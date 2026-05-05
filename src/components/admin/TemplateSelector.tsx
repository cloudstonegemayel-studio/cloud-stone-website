"use client";

import { BLOCK_TEMPLATES } from "@/types/blocks";
import type { BlockTemplate } from "@/types/blocks";

interface Props {
  onSelect: (tpl: BlockTemplate) => void;
}

export function TemplateSelector({ onSelect }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#887870" }}>
        Add block
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 8,
      }}>
        {BLOCK_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
              padding: "10px 12px",
              background: "#F5F1EC",
              border: "1.5px solid #DDD7CF",
              borderRadius: 6,
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#392D2B";
              (e.currentTarget as HTMLButtonElement).style.background = "#EDE9E3";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#DDD7CF";
              (e.currentTarget as HTMLButtonElement).style.background = "#F5F1EC";
            }}
          >
            <span style={{ fontSize: 18 }}>{tpl.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#392D2B", lineHeight: 1.2 }}>
              {tpl.label}
            </span>
            <span style={{ fontSize: 11, color: "#887870", lineHeight: 1.3 }}>
              {tpl.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
