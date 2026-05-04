import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Admin — Cloud Stone Studio" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Counts (graceful fallback when tables don't exist yet)
  async function safeCount(table: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any).from(table).select("*", { count: "exact", head: true });
      return count ?? 0;
    } catch { return 0; }
  }
  const [projectsCount, shopCount, contactsCount] = await Promise.all([
    safeCount("projects"),
    safeCount("shop_items"),
    safeCount("contact_submissions"),
  ]);

  const stats = [
    { label: "Projects",     count: projectsCount ?? 0, href: "/admin/projects" },
    { label: "Shop items",   count: shopCount     ?? 0, href: "/admin/shop"     },
    { label: "New inquiries",count: contactsCount ?? 0, href: "/admin/contacts" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1EC]">
      {/* Admin nav */}
      <header className="bg-[#392D2B] px-8 py-4 flex items-center justify-between">
        <h1 className="font-display text-[20px] italic text-[#EEE9E3]">Cloud Stone Admin</h1>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[11px] uppercase tracking-[0.08em] text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors font-sans">
            View site →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {stats.map(({ label, count, href }) => (
            <Link key={label} href={href} className="group">
              <div className="bg-white border border-[#392D2B]/10 p-6 hover:border-[#392D2B]/30 transition-[border-color] duration-[250ms]">
                <p className="font-display text-[40px] text-[#392D2B] leading-none mb-2">{count}</p>
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#392D2B]/40 font-sans">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/projects/new" className="flex items-center gap-3 bg-white border border-[#392D2B]/10 p-5 hover:border-[#392D2B]/30 transition-[border-color] duration-[250ms]">
            <span className="text-[22px] text-[#392D2B]/20">+</span>
            <span className="text-[13px] text-[#392D2B] font-sans">New project</span>
          </Link>
          <Link href="/admin/shop/new" className="flex items-center gap-3 bg-white border border-[#392D2B]/10 p-5 hover:border-[#392D2B]/30 transition-[border-color] duration-[250ms]">
            <span className="text-[22px] text-[#392D2B]/20">+</span>
            <span className="text-[13px] text-[#392D2B] font-sans">New shop item</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
