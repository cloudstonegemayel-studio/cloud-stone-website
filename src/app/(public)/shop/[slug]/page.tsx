import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";

type DemoItem = {
  title:       string;
  desc:        string;
  longDesc:    string;
  category:    string;
  availability: "Available" | "Sold" | "Expected";
  images:      string[];
};

const DEMO_ITEMS: Record<string, DemoItem> = {
  "travertine-slab": {
    title:        "Travertine Slab",
    desc:         "Classic ivory, vein-cut",
    longDesc:     "Roman travertine, quarried from the Tivoli region — the same stone used in the Colosseum. Vein-cut orientation exposes the natural banding and fossilized inclusions unique to this deposit. Ideal for feature walls, flooring, and bespoke furniture panels.",
    category:     "Stone",
    availability: "Available",
    images:       ["/images/frame-28.png", "/images/frame-30.png"],
  },
  "warm-limestone": {
    title:        "Warm Limestone",
    desc:         "Portuguese, honed finish",
    longDesc:     "Extracted from Alcobaça, Portugal, this limestone carries a warm honey tone that deepens with age. Its fine grain and consistent colour make it ideal for large continuous surfaces — flooring, cladding, and countertops that evolve gracefully over decades.",
    category:     "Stone",
    availability: "Available",
    images:       ["/images/frame-30.png", "/images/frame-28.png"],
  },
  "cloud-marble": {
    title:        "Cloud Marble",
    desc:         "Carrara bianco, polished",
    longDesc:     "Carrara Bianco Gioia — the most refined grade of Italian white marble, quarried from the Apuan Alps. The crystalline clarity and delicate grey veining are the result of millions of years of metamorphic pressure. Polished to a mirror finish to maximise light reflection.",
    category:     "Marble",
    availability: "Available",
    images:       ["/images/image-70.png", "/images/frame-28.png"],
  },
  "basalt-tile": {
    title:        "Basalt Tile",
    desc:         "Volcanic basalt, brushed",
    longDesc:     "Dark volcanic basalt from the Eifel region — a stone of pure geological drama. The brushed finish reveals the fine crystalline texture while providing grip underfoot. Used in the Cloud Stone bathrooms collection for floor transitions and feature niches.",
    category:     "Stone",
    availability: "Sold",
    images:       ["/images/rectangle.png", "/images/frame-28.png"],
  },
  "alabaster-panel": {
    title:        "Alabaster Panel",
    desc:         "Backlit translucent panel",
    longDesc:     "Spanish alabaster selected for exceptional translucency — when backlit, the stone becomes luminous, revealing internal cloud-like formations unique to each slab. No two panels are alike. Applications include feature walls, ceiling panels, and decorative screens.",
    category:     "Special",
    availability: "Expected",
    images:       ["/images/frame-28.png", "/images/twenty-seven.png"],
  },
  "onyx-slab": {
    title:        "Onyx Slab",
    desc:         "Green onyx, book-matched",
    longDesc:     "Iranian green onyx of exceptional quality — quarried in a single vein and book-matched to create a perfect mirror symmetry. The rich forest-green tones with white and gold banding create a surface that reads as abstract painting.",
    category:     "Special",
    availability: "Available",
    images:       ["/images/twenty-seven.png", "/images/image-70.png"],
  },
  "soft-beige-marble": {
    title:        "Soft Beige Marble",
    desc:         "Cream marble, brushed edge",
    longDesc:     "A balanced beige marble with gentle mineral clouds and refined movement. Extracted from Portuguese quarries known for consistent grain and colour. Soft enough for residential interiors, formal enough for hospitality and commercial work.",
    category:     "Marble",
    availability: "Available",
    images:       ["/images/img1.png", "/images/frame-28.png"],
  },
  "sandstone-block": {
    title:        "Sandstone Block",
    desc:         "Textured architectural block",
    longDesc:     "A modular sandstone block with visible sediment layers and warm ochre tones. The natural cleft finish preserves the stone's geological character. Built for plinths, fireplaces, landscape edges, and quiet sculptural objects.",
    category:     "Stone",
    availability: "Expected",
    images:       ["/images/img2.png", "/images/frame-30.png"],
  },
  "rose-onyx": {
    title:        "Rose Onyx",
    desc:         "Warm translucent onyx",
    longDesc:     "Rose onyx from Pakistan with soft amber translucency and layered internal drawing. When backlit, each slab reveals a unique landscape of veining and colour. Especially strong as illuminated panels or small statement surfaces.",
    category:     "Special",
    availability: "Sold",
    images:       ["/images/img3.png", "/images/twenty-seven.png"],
  },
};

const ALL_SLUGS = Object.keys(DEMO_ITEMS);

const AVAILABILITY_COLOR: Record<string, string> = {
  Available: "#392D2B",
  Sold:      "#C86733",
  Expected:  "rgba(57,45,43,0.4)",
};

export async function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item      = DEMO_ITEMS[slug];
  if (!item) return { title: "Not Found" };

  return {
    title:       `${item.title} — Shop`,
    description: item.longDesc,
    openGraph:   { images: [{ url: item.images[0] }] },
  };
}

export default async function ShopItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item      = DEMO_ITEMS[slug];
  if (!item)      notFound();

  const idx      = ALL_SLUGS.indexOf(slug);
  const nextSlug = ALL_SLUGS[(idx + 1) % ALL_SLUGS.length];
  const nextItem = DEMO_ITEMS[nextSlug];

  return (
    <article className="min-h-screen">

      {/* Hero */}
      <section className="pt-24 pb-0">
        <div className="container-site">
          <AnimatedSection variant="fadeInUp" className="mb-2">
            <Link
              href="/shop"
              className="text-[10px] uppercase tracking-[0.12em] text-[#392D2B]/30 hover:text-[#392D2B] transition-colors duration-[250ms] font-sans inline-flex items-center gap-2"
            >
              ← Shop
            </Link>
          </AnimatedSection>
        </div>

        <div className="relative h-[55vh] md:h-[70vh] overflow-hidden mt-6">
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#EEE9E3]/90" />
        </div>
      </section>

      {/* Main content */}
      <section className="py-16">
        <div className="container-site">
          <div className="grid-site gap-y-12">

            {/* Left: title + availability + CTA */}
            <AnimatedSection variant="fadeInUp" className="col-span-8 md:col-span-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#392D2B]/30 font-sans mb-3">
                {item.category}
              </p>
              <h1 className="font-display text-[clamp(36px,4.5vw,64px)] italic text-[#392D2B] leading-[1.05] tracking-[-0.025em] mb-4">
                {item.title}
              </h1>
              <p className="font-display italic text-[18px] text-[#392D2B]/60 mb-8 leading-[1.5]">
                {item.desc}
              </p>

              <div className="border-t border-[#392D2B]/10 pt-8 mb-10">
                <span
                  className="inline-block text-[9px] uppercase tracking-[0.12em] font-sans border px-2 py-1"
                  style={{
                    color:       AVAILABILITY_COLOR[item.availability],
                    borderColor: AVAILABILITY_COLOR[item.availability],
                  }}
                >
                  {item.availability}
                </span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/contacts"
                  className="btn-pixel block text-center py-3 text-[11px] uppercase tracking-[0.1em] text-[#392D2B] font-sans"
                >
                  Request a sample →
                </Link>
                <Link
                  href="/contacts"
                  className="block text-center text-[11px] text-[#392D2B]/40 hover:text-[#392D2B] transition-colors duration-[250ms] font-sans py-2"
                >
                  or get a project quote
                </Link>
              </div>
            </AnimatedSection>

            {/* Right: description + gallery */}
            <div className="col-span-8 md:col-span-5">
              <AnimatedSection variant="fadeInUp" delay={0.08}>
                <p className="text-[15px] leading-[1.8] text-[#392D2B]/60 font-sans mb-12 max-w-lg">
                  {item.longDesc}
                </p>
              </AnimatedSection>

              {item.images.length > 1 && (
                <StaggerList className="grid grid-cols-2 gap-4">
                  {item.images.slice(1).map((src, i) => (
                    <StaggerItem key={i}>
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={src}
                          alt={`${item.title} — view ${i + 2}`}
                          fill
                          className="object-cover transition-[transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerList>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Next item teaser */}
      <section className="border-t border-[#392D2B]/10">
        <Link
          href={`/shop/${nextSlug}`}
          className="group block py-16 hover:bg-[#392D2B]/[0.02] transition-colors duration-[400ms]"
        >
          <div className="container-site flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#392D2B]/30 font-sans mb-2">
                Next material
              </p>
              <p className="font-display text-[clamp(24px,3vw,42px)] italic text-[#392D2B] group-hover:text-[#C86733] transition-colors duration-[250ms] leading-tight tracking-[-0.02em]">
                {nextItem.title}
              </p>
            </div>
            <span className="text-[#392D2B]/20 group-hover:text-[#C86733] text-[32px] transition-[color,transform] duration-[300ms] group-hover:translate-x-2 font-light">
              →
            </span>
          </div>
        </Link>
      </section>

    </article>
  );
}
