import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Inquiries — Admin" };

export default async function AdminContactsPage() {
  const supabase = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: contacts } = await (supabase as any)
    .from("contact_submissions")
    .select("id, name, email, phone, subject, message, source_page, status, created_at")
    .order("created_at", { ascending: false });

  const rows = (contacts ?? []) as Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    source_page: string | null;
    status: string;
    created_at: string;
  }>;

  return (
    <div className="min-h-screen bg-[#F5F1EC]">
      <header className="bg-[#392D2B] px-8 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors text-[11px] uppercase tracking-[0.08em] font-sans">
          ← Admin
        </Link>
        <h1 className="font-display text-[20px] italic text-[#EEE9E3]">Inquiries</h1>
        <span className="ml-auto text-[11px] text-[#EEE9E3]/30 font-sans">{rows.length} total</span>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {rows.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#392D2B]/40 font-sans text-[13px]">No inquiries yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((c) => (
              <div
                key={c.id}
                className={`bg-white border p-6 transition-colors ${c.status === "new" ? "border-[#C86733]/30" : "border-[#392D2B]/10"}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-display italic text-[17px] text-[#392D2B]">{c.name}</p>
                    <a
                      href={`mailto:${c.email}`}
                      className="text-[12px] text-[#392D2B]/50 hover:text-[#392D2B] transition-colors font-sans"
                    >
                      {c.email}
                    </a>
                    {c.phone && (
                      <span className="text-[12px] text-[#392D2B]/40 font-sans ml-4">{c.phone}</span>
                    )}
                  </div>
                  <div className="text-right shrink-0 flex flex-col gap-1.5">
                    <span className={`text-[10px] uppercase tracking-[0.08em] font-sans px-2 py-0.5 ${
                      c.status === "new"
                        ? "bg-[#C86733]/10 text-[#C86733] border border-[#C86733]/20"
                        : "bg-[#392D2B]/5 text-[#392D2B]/40 border border-[#392D2B]/10"
                    }`}>
                      {c.status}
                    </span>
                    <p className="text-[10px] text-[#392D2B]/30 font-sans">
                      {new Date(c.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Source page badge */}
                {c.source_page && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#B7D1EA]/20 border border-[#B7D1EA]/40 text-[10px] uppercase tracking-[0.06em] text-[#392D2B]/60 font-sans">
                      📍 {c.source_page}
                    </span>
                  </div>
                )}

                {c.subject && (
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#392D2B]/40 font-sans mb-2">
                    Re: {c.subject}
                  </p>
                )}

                <p className="text-[13px] text-[#392D2B]/70 font-sans leading-[1.7] whitespace-pre-wrap">{c.message}</p>

                <div className="mt-4 pt-4 border-t border-[#392D2B]/5 flex gap-4">
                  <a
                    href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject ?? "Your inquiry")}`}
                    className="text-[11px] uppercase tracking-[0.08em] text-[#392D2B] border border-[#392D2B]/20 px-4 py-1.5 hover:bg-[#392D2B]/5 transition-colors font-sans"
                  >
                    Reply by email
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
