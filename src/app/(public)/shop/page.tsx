import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ShopPageClient, type ShopItem } from "./ShopPageClient";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Materials Shop",
  description: "Natural stone materials — travertine, marble, limestone, onyx, and basalt. Slabs, tiles, and panels available from Cloud Stone Studio.",
  openGraph: {
    title: "Materials Shop — Cloud Stone Studio",
    description: "Natural stone materials, slabs, and samples. Travertine, marble, limestone, onyx, and basalt.",
    images: [{ url: "/images/shop-item-1.png", width: 1200, height: 800, alt: "Natural stone materials — Cloud Stone Studio" }],
  },
  twitter: { card: "summary_large_image" },
};

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default async function ShopPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("shop_items")
    .select("id, slug, item_number, title, description, long_description, category, availability, photo_url, sketch_url, popup_images")
    .eq("status", "published")
    .order("item_number", { ascending: true });

  const items: ShopItem[] = ((data as null | unknown[]) ?? []).map((row: unknown, i: number) => {
    const p = row as Record<string, unknown>;
    const rawImages = Array.isArray(p.popup_images)
      ? (p.popup_images as { url?: string }[]).map(img => img.url ?? "").filter(Boolean)
      : undefined;
    return {
      id:           String(p.id          ?? ""),
      slug:         String(p.slug        ?? ""),
      number:       String(p.item_number ?? i + 1).padStart(2, "0"),
      title:        String(p.title       ?? ""),
      desc:         String(p.description ?? ""),
      longDesc:     String(p.long_description ?? ""),
      category:     (capitalize(String(p.category ?? "Stone")) as ShopItem["category"]),
      availability: (capitalize(String(p.availability ?? "available")) as ShopItem["availability"]),
      src:          String(p.photo_url   ?? ""),
      sketchSrc:    p.sketch_url ? String(p.sketch_url) : undefined,
      images:       rawImages?.length ? rawImages : undefined,
    };
  });

  return (
    <>
      <ShopPageClient items={items} />
      <div style={{ height: 28 }} aria-hidden />
      <Footer />
    </>
  );
}
