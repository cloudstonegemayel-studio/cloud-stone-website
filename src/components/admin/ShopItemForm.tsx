"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface ShopItemFormData {
  title:            string;
  slug:             string;
  item_number:      string;
  category:         string;
  availability:     string;
  description:      string;
  long_description: string;
  photo_url:        string;
  sketch_url:       string;
  images:           string;
  published:        boolean;
}

interface ShopItemFormProps {
  initialData?: Partial<ShopItemFormData>;
  itemId?:     string;
}

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
    sketch_url:       initialData?.sketch_url       ?? "",
    images:           initialData?.images           ?? "",
    published:        initialData?.published        ?? false,
  });

  function field(key: keyof ShopItemFormData) {
    return {
      value: data[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...data,
        item_number: parseInt(data.item_number) || null,
        images: data.images
          ? data.images.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
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

        {/* Category */}
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

        {/* Availability */}
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

        <div className="col-span-2">
          <Input label="Card photo URL" placeholder="/images/shop-item-1.png" {...field("photo_url")} />
        </div>
        <div className="col-span-2">
          <Input label="Sketch URL (card background overlay)" placeholder="/images/shop-item-1-sketch.svg" {...field("sketch_url")} />
        </div>
        <div className="col-span-2">
          <Input
            label="Popup gallery images (comma-separated URLs)"
            placeholder="/images/gallery-1.png, /images/gallery-2.png"
            {...field("images")}
          />
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
