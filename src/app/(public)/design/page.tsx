import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DesignPageClient, type Project } from "./DesignPageClient";

export const metadata: Metadata = {
  title: "Design Projects — Cloud Stone Studio",
  description: "Interior architecture projects — residential, commercial, and hospitality.",
};

export default async function DesignPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("projects")
    .select("id, slug, project_number, title, project_status, project_year, card_image, card_hover_image, light_text")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const projects: Project[] = ((data as null | unknown[]) ?? []).map((row: unknown) => {
    const p = row as Record<string, unknown>;
    return {
      id:        String(p.id          ?? ""),
      slug:      String(p.slug        ?? ""),
      number:    String(p.project_number ?? "").padStart(2, "0"),
      title:     String(p.title       ?? ""),
      status:    String(p.project_status ?? ""),
      year:      String(p.project_year   ?? ""),
      sketch:    String(p.card_image     ?? ""),
      thumbnail: String(p.card_hover_image ?? ""),
      lightText: Boolean(p.light_text),
    };
  });

  return <DesignPageClient projects={projects} />;
}
