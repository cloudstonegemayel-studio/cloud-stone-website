import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient as createBuildClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { parseContentBlocks, SliderItemSchema } from "@/types/blocks";
import { ProjectPage } from "@/components/project/ProjectPage";
import type { ProjectData, AdjacentProject } from "@/components/project/ProjectPage";

export const revalidate = 60;

type RawProject = {
  id: string; slug: string; title: string;
  short_description: string | null; description: string | null;
  cover_image: string | null; slider_items: unknown;
  project_year: number | null; project_type: string | null;
  project_status: string | null; location: string | null;
  client: string | null; site_area: string | null;
  content_blocks: unknown; sort_order: number;
  section2_image: string | null; section2_image_alt: string | null;
  section4_image: string | null; section4_image_alt: string | null;
};
type RawAdj = { slug: string; title: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("projects")
    .select("title, short_description, cover_image")
    .eq("slug", slug)
    .eq("status", "published")
    .single() as { data: { title: string; short_description: string | null; cover_image: string | null } | null };

  if (!data) return { title: "Project Not Found" };

  return {
    title: data.title,
    description: data.short_description ?? undefined,
    openGraph: {
      title: data.title,
      description: data.short_description ?? undefined,
      ...(data.cover_image ? { images: [{ url: data.cover_image, alt: data.title }] } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}

export async function generateStaticParams() {
  const supabase = createBuildClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("projects")
    .select("slug")
    .eq("status", "published") as { data: { slug: string }[] | null };
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw, error } = await (supabase as any)
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single() as { data: RawProject | null; error: unknown };

  if (error || !raw) notFound();

  const sliderItems = Array.isArray(raw.slider_items)
    ? (raw.slider_items as unknown[]).flatMap((item) => {
        const r = SliderItemSchema.safeParse(item);
        return r.success ? [r.data] : [];
      })
    : [];

  const project: ProjectData = {
    id:                raw.id,
    slug:              raw.slug,
    title:             raw.title,
    short_description: raw.short_description,
    description:       raw.description,
    cover_image:       raw.cover_image,
    slider_items:      sliderItems,
    project_year:      raw.project_year,
    project_type:      raw.project_type,
    project_status:    raw.project_status,
    location:          raw.location,
    client:            raw.client,
    site_area:         raw.site_area,
    content_blocks:    parseContentBlocks(raw.content_blocks),
    section2_image:    raw.section2_image,
    section2_image_alt: raw.section2_image_alt,
    section4_image:    raw.section4_image,
    section4_image_alt: raw.section4_image_alt,
  };

  const sortOrder = raw.sort_order ?? 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: prevRaw }, { data: nextRaw }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("projects")
      .select("slug, title")
      .eq("status", "published")
      .lt("sort_order", sortOrder)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle() as Promise<{ data: RawAdj | null }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("projects")
      .select("slug, title")
      .eq("status", "published")
      .gt("sort_order", sortOrder)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle() as Promise<{ data: RawAdj | null }>,
  ]);

  const prevProject: AdjacentProject | null = prevRaw
    ? { slug: prevRaw.slug, title: prevRaw.title }
    : null;
  const nextProject: AdjacentProject | null = nextRaw
    ? { slug: nextRaw.slug, title: nextRaw.title }
    : null;

  return (
    <ProjectPage
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}
