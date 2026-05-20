"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "./ImageUpload";

export interface PopupImage {
  url: string;
  alt: string;
}

export interface ShopItemFormData {
  title:            string;
  slug:             string;
  item_number:      string;
  category:         string;
  availability:     string;
  description:      string;
  long_description: string;
  photo_url:        string;
  photo_alt:        string;
  sketch_url:       string;
  sketch_alt:       string;
  popup_images:     PopupImage[];
  published:        boolean;
}

interface ShopItemFormProps {
  initialData?: Partial<ShopItemFormData>;
  itemId?:     string;
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
  color: "#887870", margin: "8px 0 12px", paddingBottom: 6,
  borderBottom: "1px solid #DDD7CF",
};

export function ShopItemForm({ initialData, itemId }: ShopItemFormProps) {
  const router = useRouter();
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  const [data, setData] = useState<ShopItemFormData>({
    title:            initialData?.title            ?? "",
    slug:             initialData?.slug             ?? "",
    item_number:      initialData?.item_number      ?? "",
    category:         initialData?.category         ?? "Stone",
    availability:     initialData?.availability     ?? "available",
    description:      initialData?.description      ?? "",
    long_description: initialData?.long_description ?? "",
    photo_url:        initialData?.photo_url        ?? "",
    photo_alt:        initialData?.photo_alt        ?? "",
    sketch_url:       initialData?.sketch_url       ?? "",
    sketch_alt:       initialData?.sketch_alt       ?? "",
    popup_images:     initialData?.popup_images     ?? [],
    published:        initialData?.published        ?? false,
  });

  function field(key: keyof Pick<ShopItemFormData, "title" | "slug" | "item_number" | "description" | "long_description">) {
    return {
      value: data[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  function addPopupImage() {
    setData(d => ({ ...d, popup_images: [...d.popup_images, { url: "", alt: "" }] }));
  }

  function removePopupImage(i: number) {
    setData(d => ({ ...d, popup_images: d.popup_images.filter((_, idx) => idx !== i) }));
  }

  function updatePopupImage(i: number, patch: Partial<PopupImage>) {
    setData(d => ({
      ...d,
      popup_images: d.popup_images.map((img, idx) => idx === i ? { ...img, ...patch } : img),
    }));
  }

  function movePopupImage(from: number, to: number) {
    setData(d => {
      const items = [...d.popup_images];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { ...d, popup_images: items };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...data,
        item_number: parseInt(data.item_number) || null,
      };
      const res = await fetch(
        itemId ? `/api/admin/shop/${itemId}` : "/api/admin/shop",
        {
          method:  itemId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/shop");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!itemId || !confirm("Delete this item?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/shop/${itemId}`, { method: "DELETE" });
      router.push("/admin/shop");
      router.refresh();
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="grid grid-cols-2 gap-6">

        <div className="col-span-2">
          <Input
            label="Title"
            placeholder="Travertine Slab"
            {...field("title")}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                title: e.target.value,
                slug:  d.slug || autoSlug(e.target.value),
              }))
            }
          />
        </div>

        <Input label="Slug"        placeholder="travertine-slab" {...field("slug")} />
        <Input label="Item number" placeholder="1"               {...field("item_number")} type="number" />

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.12em] text-[#392D2B]/40 font-sans">Category</span>
          <select
            value={data.category}
            onChange={(e) => setData((d) => ({ ...d, category: e.target.value }))}
            className="h-9 border border-[#392D2B]/20 bg-transparent px-3 text-[12px] text-[#392D2B] font-sans focus:outline-none focus:border-[#392D2B]/60"
          >
            {["Stone", "Marble", "Special"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.12em] text-[#392D2B]/40 font-sans">Availability</span>
          <select
            value={data.availability}
            onChange={(e) => setData((d) => ({ ...d, availability: e.target.value }))}
            className="h-9 border border-[#392D2B]/20 bg-transparent px-3 text-[12px] text-[#392D2B] font-sans focus:outline-none focus:border-[#392D2B]/60"
          >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="expected">Expected</option>
          </select>
        </div>

        <div className="col-span-2">
          <Input label="Short description" placeholder="Classic ivory, vein-cut" {...field("description")} />
        </div>

        <div className="col-span-2">
          <Textarea
            label="Long description (popup)"
            rows={4}
            placeholder="Roman travertine selected for quiet banding and warm ivory color..."
            {...field("long_description")}
          />
        </div>

      </div>

      {/* Card photo */}
      <p style={sectionLabel}>Card photo</p>
      <ImageUpload
        value={data.photo_url}
        onChange={(u) => setData(d => ({ ...d, photo_url: u }))}
        alt={data.photo_alt}
        onAltChange={(a) => setData(d => ({ ...d, photo_alt: a }))}
        scope="shop-photo"
        label="Card photo"
        aspect="portrait"
      />

      {/* Sketch */}
      <p style={sectionLabel}>Sketch overlay</p>
      <ImageUpload
        value={data.sketch_url}
        onChange={(u) => setData(d => ({ ...d, sketch_url: u }))}
        alt={data.sketch_alt}
        onAltChange={(a) => setData(d => ({ ...d, sketch_alt: a }))}
        scope="shop-sketch"
        label="Sketch / blueprint overlay"
        aspect="portrait"
      />

      {/* Popup gallery */}
      <div>
        <p style={sectionLabel}>Popup gallery images</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#A09890" }}>Images ({data.popup_images.length})</span>
            <button type="button" onClick={addPopupImage} style={{
              fontSize: 11, padding: "4px 10px",
              background: "#392D2B", color: "#F0EEE9",
              border: "none", borderRadius: 4, cursor: "pointer",
            }}>
              + Add image
            </button>
          </div>
          {data.popup_images.map((img, i) => (
            <div key={i} style={{
              background: "#F5F1EC", border: "1.5px solid #DDD7CF",
              borderRadius: 6, padding: 12,
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10,
              alignItems: "start",
            }}>
              {/* Reorder handle */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 20 }}>
                <button
                  type="button"
                  onClick={() => i > 0 && movePopupImage(i, i - 1)}
                  disabled={i === 0}
                  title="Move up"
                  style={{
                    background: "none", border: "none",
                    cursor: i === 0 ? "default" : "pointer",
                    fontSize: 10,
                    color: i === 0 ? "#DDD7CF" : "#887870",
                    padding: "2px 4px", lineHeight: 1,
                  }}
                >▲</button>
                <button
                  type="button"
                  onClick={() => i < data.popup_images.length - 1 && movePopupImage(i, i + 1)}
                  disabled={i === data.popup_images.length - 1}
                  title="Move down"
                  style={{
                    background: "none", border: "none",
                    cursor: i === data.popup_images.length - 1 ? "default" : "pointer",
                    fontSize: 10,
                    color: i === data.popup_images.length - 1 ? "#DDD7CF" : "#887870",
                    padding: "2px 4px", lineHeight: 1,
                  }}
                >▼</button>
              </div>

              <ImageUpload
                value={img.url}
                onChange={(u) => updatePopupImage(i, { url: u })}
                alt={img.alt}
                onAltChange={(a) => updatePopupImage(i, { alt: a })}
                scope={`shop-popup-${i}`}
                label={`Gallery image ${i + 1}`}
                aspect="wide"
              />
              <button type="button" onClick={() => removePopupImage(i)} style={{
                background: "none", border: "none", fontSize: 18,
                color: "#C0392B", cursor: "pointer", marginTop: 22,
              }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-8">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            role="switch"
            aria-checked={data.published}
            onClick={() => setData((d) => ({ ...d, published: !d.published }))}
            className={`relative w-10 h-5 rounded-full transition-colors duration-[250ms] ${
              data.published ? "bg-[#392D2B]" : "bg-[#392D2B]/20"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-[transform] duration-[250ms] ${
                data.published ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#392D2B]/60 font-sans">
            {data.published ? "Published" : "Draft"}
          </span>
        </label>
      </div>

      {error && (
        <p className="text-[12px] text-red-500 font-sans">{error}</p>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-[#392D2B]/10">
        <Button type="submit" variant="primary" isLoading={saving}>
          {itemId ? "Save changes" : "Create item"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/shop")}>
          Cancel
        </Button>
        {itemId && (
          <Button
            type="button"
            variant="ghost"
            isLoading={deleting}
            onClick={handleDelete}
            className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
