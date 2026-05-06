import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { parseContentBlocks, SliderItemSchema } from "@/types/blocks";
import { EditPageClient } from "./EditPageClient";
import type { MetaData } from "@/components/admin/ProjectMetaForm";

export const metadata = { title: "Edit Project — Admin" };

type RawProject = {
  id: string; slug: string; title: string;
  short_description: string | null; description: string | null;
  cover_image: string | null; cover_image_alt: string | null;
  slider_items: unknown; content_blocks: unknown;
  project_year: number | null; project_type: string | null;
  project_status: string | null; location: string | null;
  client: string | null; site_area: string | null;
  sort_order: number; status: string;
  project_number: number | null; light_text: boolean | null;
  card_image: string | null; card_image_alt: string | null;
  card_hover_image: string | null; card_hover_image_alt: string | null;
  section2_image: string | null; section2_image_alt: string | null;
  section4_image: string | null; section4_image_alt: string | null;
};

type ProjectListItem = {
  id: string; title: string; slug: string; status: string; sort_order: number;
};

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
  const [{ data: raw }, { data: projectList }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("projects")
      .select("*")
      .eq("id", id)
      .single() as Promise<{ data: RawProject | null }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("projects")
      .select("id, title, slug, status, sort_order")
      .order("sort_order", { ascending: true }) as Promise<{ data: ProjectListItem[] | null }>,
  ]);

  if (!raw) notFound();

  const sliderItems = Array.isArray(raw.slider_items)
    ? (raw.slider_items as unknown[]).flatMap((item) => {
        const r = SliderItemSchema.safeParse(item);
        return r.success ? [r.data] : [];
      })
    : [];

  const initialMeta: MetaData = {
    title:             raw.title             ?? "",
    slug:              raw.slug              ?? "",
    short_description: raw.short_description ?? "",
    description:       raw.description       ?? "",
    status:            raw.status === "published" ? "published" : "draft",
    sort_order:        raw.sort_order        ?? 0,
    project_number:    String(raw.project_number ?? ""),
    light_text:        raw.light_text        ?? false,
    cover_image:       raw.cover_image       ?? "",
    cover_image_alt:   raw.cover_image_alt   ?? "",
    slider_items:      sliderItems,
    card_image:              raw.card_image              ?? "",
    card_image_alt:          raw.card_image_alt          ?? "",
    card_hover_image:        raw.card_hover_image        ?? "",
    card_hover_image_alt:    raw.card_hover_image_alt    ?? "",
    section2_image:          raw.section2_image          ?? "",
    section2_image_alt:      raw.section2_image_alt      ?? "",
    section4_image:          raw.section4_image          ?? "",
    section4_image_alt:      raw.section4_image_alt      ?? "",
    project_year:      String(raw.project_year ?? ""),
    project_type:      raw.project_type      ?? "",
    project_status:    raw.project_status    ?? "",
    location:          raw.location          ?? "",
    client:            raw.client            ?? "",
    site_area:         raw.site_area         ?? "",
  };

  const initialBlocks = parseContentBlocks(raw.content_blocks);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1EC" }}>
      <header style={{
        background: "#392D2B",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexShrink: 0,
      }}>
        <Link
          href="/admin/projects"
          style={{ color: "rgba(240,238,233,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}
        >
          ← Projects
        </Link>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-rader,'PP Rader',serif)",
          fontWeight: 400,
          fontSize: 18,
          fontStyle: "italic",
          color: "#F0EEE9",
        }}>
          {initialMeta.title || "Untitled"}
        </h1>
        <Link
          href={`/design/${initialMeta.slug}`}
          target="_blank"
          style={{
            marginLeft: "auto",
            color: "rgba(240,238,233,0.5)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          View live →
        </Link>
      </header>

      <EditPageClient
        projectId={id}
        initialMeta={initialMeta}
        initialBlocks={initialBlocks}
        projectList={projectList ?? []}
      />
    </div>
  );
}
