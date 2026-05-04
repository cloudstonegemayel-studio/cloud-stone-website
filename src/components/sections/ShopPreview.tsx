"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { EASE } from "@/lib/animations";
import type { ShopItem } from "@/types/database";

const DEMO_ITEMS: Partial<ShopItem>[] = [
  {
    id: "1",
    slug: "travertine-slab",
    title: "Travertine Slab",
    description: "Classic ivory, vein-cut",
    photo_url: "/images/shop-item-1.png",
  },
  {
    id: "2",
    slug: "warm-limestone",
    title: "Warm Limestone",
    description: "Portuguese limestone, honed finish",
    photo_url: "/images/shop-item-2.png",
  },
  {
    id: "3",
    slug: "cloud-marble",
    title: "Cloud Marble",
    description: "Carrara bianco, polished",
    photo_url: "/images/shop-item-3.png",
  },
  {
    id: "4",
    slug: "basalt-tile",
    title: "Basalt Tile",
    description: "Volcanic basalt, brushed",
    photo_url: "/images/rectangle.png",
  },
];

export function ShopPreview() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="py-24 md:py-36 overflow-hidden bg-[#392D2B]" data-nav-dark aria-label="Shop — Materials">
      <div className="container-site">
        <div className="flex items-end justify-between mb-14">
          <AnimatedSection variant="fadeInUp">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#EEE9E3]/40 font-sans mb-3">
                Shop
              </p>
              <h2 className="font-display text-[clamp(28px,3vw,52px)] italic text-[#EEE9E3] tracking-[-0.02em] leading-tight text-balance">
                Material, in its simplest form.
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeInRight" delay={0.1}>
            <Link
              href="/shop"
              className="text-[11px] uppercase tracking-[0.1em] text-[#EEE9E3]/40 hover:text-[#EEE9E3] transition-colors duration-[250ms] font-sans hidden md:block"
            >
              Browse all →
            </Link>
          </AnimatedSection>
        </div>

        {/* Horizontal scroll catalog — matches Figma shop horizontal scroll */}
        <div className="overflow-x-auto -mx-[30px] px-[30px] pb-4">
          <motion.div
            className="flex gap-5 w-max"
            initial={prefersReduced ? {} : { x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease: EASE.expoOut }}
          >
            {DEMO_ITEMS.map((item) => (
              <ShopCard key={item.id} item={item} />
            ))}

            {/* End-of-catalog card */}
            <Link
              href="/shop"
              className="flex-shrink-0 w-[200px] h-[280px] border border-[#EEE9E3]/10 flex flex-col items-center justify-center gap-3 hover:border-[#EEE9E3]/30 transition-[border-color] duration-[250ms]"
            >
              <p className="font-display text-[22px] italic text-[#EEE9E3]/40">All</p>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#EEE9E3]/30 font-sans">
                Materials →
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ShopCard({ item }: { item: Partial<ShopItem> }) {
  return (
    <Link href={`/shop/${item.slug}`} className="group flex-shrink-0 block w-[220px]">
      <article>
        <div className="relative w-[220px] h-[280px] overflow-hidden bg-[#EEE9E3]/5">
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.title ?? ""}
              fill
              className="object-cover transition-[transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              sizes="220px"
            />
          ) : (
            <div className="absolute inset-0 bg-[#EEE9E3]/5" />
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-display text-[16px] italic text-[#EEE9E3] leading-tight group-hover:text-[#7AB6D9] transition-colors duration-[250ms]">
            {item.title}
          </h3>
          <p className="text-[11px] text-[#EEE9E3]/40 font-sans mt-0.5">
            {item.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
