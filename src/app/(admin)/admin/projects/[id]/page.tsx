import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata = { title: "Edit Project — Admin" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-[#F5F1EC]">
      <header className="bg-[#392D2B] px-8 py-4 flex items-center gap-4">
        <Link href="/admin/projects" className="text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors text-[11px] uppercase tracking-[0.08em] font-sans">
          ← Projects
        </Link>
        <h1 className="font-display text-[20px] italic text-[#EEE9E3]">
          {project.title}
        </h1>
        <Link
          href={`/design/${project.slug}`}
          target="_blank"
          className="ml-auto text-[11px] uppercase tracking-[0.08em] text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors font-sans"
        >
          View live →
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        <ProjectForm
          projectId={id}
          initialData={{
            title:       project.title,
            slug:        project.slug,
            category:    project.category    ?? "",
            year:        project.year        ?? "",
            location:    project.location    ?? "",
            area:        project.area        ?? "",
            description: project.description ?? "",
            content:     project.content     ?? "",
            published:   project.published   ?? false,
          }}
        />
      </main>
    </div>
  );
}
