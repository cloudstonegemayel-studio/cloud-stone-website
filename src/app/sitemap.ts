import type { MetadataRoute } from "next";
import { createClient as createBuildClient } from "@supabase/supabase-js";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cloudstonestudio.com";

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                             changeFrequency: "weekly",  priority: 1    },
  { url: `${BASE}/about`,                  changeFrequency: "monthly", priority: 0.8  },
  { url: `${BASE}/design`,                 changeFrequency: "weekly",  priority: 0.9  },
  { url: `${BASE}/shop`,                   changeFrequency: "weekly",  priority: 0.8  },
  { url: `${BASE}/contacts`,               changeFrequency: "monthly", priority: 0.6  },
  { url: `${BASE}/bathrooms`,              changeFrequency: "monthly", priority: 0.7  },
  { url: `${BASE}/cloudstone-bathrooms`,   changeFrequency: "monthly", priority: 0.6  },
  { url: `${BASE}/gemayel-group`,          changeFrequency: "monthly", priority: 0.6  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createBuildClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("projects")
      .select("slug")
      .eq("status", "published") as { data: { slug: string }[] | null };

    const projectRoutes: MetadataRoute.Sitemap = (data ?? []).map(p => ({
      url: `${BASE}/design/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));

    return [...STATIC, ...projectRoutes];
  } catch {
    return STATIC;
  }
}
