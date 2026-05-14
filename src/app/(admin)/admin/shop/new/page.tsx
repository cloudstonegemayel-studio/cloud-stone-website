import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShopItemForm } from "@/components/admin/ShopItemForm";

export const metadata = { title: "New Shop Item — Admin" };

export default async function NewShopItemPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="h-screen flex flex-col bg-[#F5F1EC] overflow-hidden">
      <header className="bg-[#392D2B] px-8 py-4 flex items-center gap-4 flex-shrink-0">
        <Link href="/admin/shop" className="text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors text-[11px] uppercase tracking-[0.08em] font-sans">
          ← Shop Items
        </Link>
        <h1 className="font-display text-[20px] italic text-[#EEE9E3]">New Shop Item</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <ShopItemForm />
        </div>
      </main>
    </div>
  );
}
