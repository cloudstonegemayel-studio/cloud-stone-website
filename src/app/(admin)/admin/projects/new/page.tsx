import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata = { title: "New Project — Admin" };

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F5F1EC]">
      <header className="bg-[#392D2B] px-8 py-4 flex items-center gap-4">
        <Link href="/admin/projects" className="text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors text-[11px] uppercase tracking-[0.08em] font-sans">
          ← Projects
        </Link>
        <h1 className="font-display text-[20px] italic text-[#EEE9E3]">New Project</h1>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        <ProjectForm />
      </main>
    </div>
  );
}
