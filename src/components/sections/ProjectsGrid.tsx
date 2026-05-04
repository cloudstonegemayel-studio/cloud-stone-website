"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { EASE } from "@/lib/animations";
import type { Project } from "@/types/database";

/* Fallback demo data until Supabase is configured */
const DEMO_PROJECTS: Partial<Project>[] = [
  {
    id: "1",
    slug: "studio-twenty-seven",
    title: "Studio Twenty Seven",
    description: "A sanctuary of books, art, and quiet density — Tribeca, NYC.",
    thumbnail: "/images/twenty-seven.png",
    category: "Commercial – Showroom",
    tags: ["Furniture", "Commercial", "NYC"],
  },
  {
    id: "2",
    slug: "cloud-stone-bathrooms",
    title: "CloudStone Bathrooms",
    description: "Luxury bathroom design with natural stone textures.",
    thumbnail: "/images/frame-28.png",
    category: "Residential",
    tags: ["Bathroom", "Stone", "Residential"],
  },
  {
    id: "3",
    slug: "gemayel-residence",
    title: "Gemayel Residence",
    description: "A private residence that breathes calm intentionality.",
    thumbnail: "/images/frame-30.png",
    category: "Residential",
    tags: ["Residential", "Private"],
  },
];

interface ProjectsGridProps {
  projects?: Partial<Project>[];
  title?:    string;
}

export function ProjectsGrid({ projects = DEMO_PROJECTS, title = "Selected Projects" }: ProjectsGridProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section className="py-24 md:py-36" aria-label={title}>
      <div className="container-site">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <AnimatedSection variant="fadeInUp">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#392D2B]/40 font-sans mb-3">
                Portfolio
              </p>
              <h2 className="font-display text-[clamp(28px,3vw,44px)] italic text-[#392D2B] tracking-[-0.02em] leading-tight text-balance">
                {title}
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeInRight" delay={0.1}>
            <Link
              href="/design"
              className="text-[11px] uppercase tracking-[0.1em] text-[#392D2B]/40 hover:text-[#392D2B] transition-colors duration-[250ms] font-sans hidden md:block"
            >
              View all →
            </Link>
          </AnimatedSection>
        </div>

        {/* Grid — asymmetric like Figma */}
        <StaggerList className="grid-site gap-6">
          {projects.map((project, i) => (
            <StaggerItem
              key={project.id}
              className={
                i === 0
                  ? "col-span-8 md:col-span-5"
                  : i === 1
                  ? "col-span-8 md:col-span-3"
                  : "col-span-8 md:col-span-4"
              }
            >
              <ProjectCard project={project} large={i === 0} />
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  large = false,
}: {
  project: Partial<Project>;
  large?: boolean;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <Link href={`/design/${project.slug}`} className="group block">
      <motion.article
        initial="rest"
        whileHover={prefersReduced ? "rest" : "hover"}
        className="relative overflow-hidden"
      >
        {/* Image */}
        <motion.div
          className={`relative overflow-hidden ${large ? "aspect-[3/2]" : "aspect-[4/5]"}`}
          variants={
            prefersReduced
              ? {}
              : {
                  rest:  { scale: 1 },
                  hover: { scale: 1.02 },
                }
          }
          transition={{ duration: 0.5, ease: EASE.expoOut }}
        >
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title ?? ""}
              fill
              className="object-cover transition-[transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              sizes={large ? "(max-width: 768px) 100vw, 62vw" : "(max-width: 768px) 100vw, 38vw"}
            />
          ) : (
            <div className="absolute inset-0 bg-[#392D2B]/5" />
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-[#392D2B]/0 group-hover:bg-[#392D2B]/20 transition-[background-color] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
        </motion.div>

        {/* Meta */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[clamp(16px,2vw,22px)] italic text-[#392D2B] leading-tight tracking-[-0.01em] group-hover:text-[#C86733] transition-colors duration-[250ms]">
              {project.title}
            </h3>
            {project.description && (
              <p className="mt-1 text-[12px] text-[#392D2B]/50 font-sans leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          {project.category && (
            <span className="text-[9px] uppercase tracking-[0.1em] text-[#392D2B]/30 font-sans whitespace-nowrap mt-1">
              {project.category}
            </span>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
