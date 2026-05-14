import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShopItemForm } from "@/components/admin/ShopItemForm";

export const metadata = { title: "Edit Shop Item — Admin" };

export default async function EditShopItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any)
    .from("shop_items")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  return (
    <div className="h-screen flex flex-col bg-[#F5F1EC] overflow-hidden">
      <header className="bg-[#392D2B] px-8 py-4 flex items-center gap-4 flex-shrink-0">
        <Link href="/admin/shop" className="text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors text-[11px] uppercase tracking-[0.08em] font-sans">
          ← Shop Items
        </Link>
        <h1 className="font-display text-[20px] italic text-[#EEE9E3]">{item.title}</h1>
        <Link
          href={`/shop/${item.slug}`}
          target="_blank"
          className="ml-auto text-[11px] uppercase tracking-[0.08em] text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors font-sans"
        >
          View live →
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <ShopItemForm
            itemId={id}
            initialData={{
              title:            item.title,
              slug:             item.slug,
              item_number:      item.item_number != null ? String(item.item_number) : "",
              category:         item.category         ?? "Stone",
              availability:     item.availability     ?? "available",
              description:      item.description      ?? "",
              long_description: item.long_description ?? "",
              photo_url:        item.photo_url        ?? "",
              photo_alt:        item.photo_alt        ?? "",
              sketch_url:       item.sketch_url       ?? "",
              sketch_alt:       item.sketch_alt       ?? "",
              popup_images:     Array.isArray(item.popup_images) ? item.popup_images : [],
              published:        item.status === "published",
            }}
          />
        </div>
      </main>
    </div>
  );
}
