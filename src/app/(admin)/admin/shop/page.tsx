import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Shop Items — Admin" };

export default async function AdminShopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase as any)
    .from("shop_items")
    .select("id, title, slug, item_number, category, availability, status, created_at")
    .order("sort_order", { ascending: true });

  const rows = (items ?? []) as Array<{
    id: string; title: string; slug: string;
    item_number: number | null; category: string;
    availability: string; status: string; created_at: string;
  }>;

  return (
    <div className="min-h-screen bg-[#F5F1EC]">
      <header className="bg-[#392D2B] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors text-[11px] uppercase tracking-[0.08em] font-sans">
            ← Admin
          </Link>
          <h1 className="font-display text-[20px] italic text-[#EEE9E3]">Shop Items</h1>
        </div>
        <Link
          href="/admin/shop/new"
          className="text-[11px] uppercase tracking-[0.08em] text-[#EEE9E3] border border-[#EEE9E3]/20 px-4 py-1.5 hover:bg-[#EEE9E3]/10 transition-colors font-sans"
        >
          + New item
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {rows.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#392D2B]/40 font-sans text-[13px]">No shop items yet.</p>
            <Link href="/admin/shop/new" className="mt-4 inline-block text-[11px] uppercase tracking-[0.08em] text-[#392D2B] border border-[#392D2B]/20 px-5 py-2 hover:bg-[#392D2B]/5 transition-colors font-sans">
              Add first item
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#392D2B]/10">
                {["#", "Title", "Category", "Availability", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-[9px] uppercase tracking-[0.12em] text-[#392D2B]/30 font-sans py-3 pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-[#392D2B]/5 hover:bg-[#392D2B]/[0.02] transition-colors">
                  <td className="py-4 pr-6 text-[11px] text-[#392D2B]/30 font-sans tabular-nums">
                    {item.item_number != null ? String(item.item_number).padStart(2, "0") : "—"}
                  </td>
                  <td className="py-4 pr-6">
                    <p className="font-display italic text-[15px] text-[#392D2B]">{item.title}</p>
                    <p className="text-[11px] text-[#392D2B]/30 font-sans mt-0.5">/shop/{item.slug}</p>
                  </td>
                  <td className="py-4 pr-6 text-[12px] text-[#392D2B]/60 font-sans">{item.category}</td>
                  <td className="py-4 pr-6">
                    <span className={`text-[10px] uppercase tracking-[0.08em] font-sans ${
                      item.availability === "available" ? "text-[#392D2B]"
                      : item.availability === "sold"    ? "text-[#C86733]"
                      : "text-[#392D2B]/40"
                    }`}>
                      {item.availability}
                    </span>
                  </td>
                  <td className="py-4 pr-6">
                    <span className={`text-[10px] uppercase tracking-[0.08em] font-sans px-2 py-0.5 ${
                      item.status === "published"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/admin/shop/${item.id}`}
                      className="text-[11px] uppercase tracking-[0.08em] text-[#392D2B]/40 hover:text-[#392D2B] transition-colors font-sans"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
