import Image from "next/image";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PixelButton } from "@/components/ui/PixelButton";

export function AboutSection() {
  return (
    <section className="py-24 md:py-36" aria-label="About Cloud Stone Studio">
      <div className="container-site">
        <div className="grid-site items-center gap-y-12">
          {/* Text — left 4 cols */}
          <div className="col-span-8 md:col-span-4">
            <AnimatedSection variant="fadeInUp" delay={0}>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#392D2B]/40 font-sans mb-6">
                About the studio
              </p>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.08}>
              <h2 className="font-display text-[clamp(32px,3.5vw,52px)] italic leading-[1.1] text-[#392D2B] tracking-[-0.02em] mb-8 text-balance">
                Architecture rooted in the beauty of natural materials
              </h2>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.16}>
              <p className="text-[15px] leading-[1.7] text-[#392D2B]/60 font-sans max-w-lg">
                Cloud Stone Studio is a premium interior design and architecture practice
                founded by Antonio Gemayel. We work at the intersection of craft,
                materiality, and narrative — creating spaces that resonate long after
                the first impression.
              </p>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.24} className="mt-10">
              <PixelButton label="View Projects" href="/design" />
            </AnimatedSection>
          </div>

          {/* Image — right 4 cols */}
          <div className="col-span-8 md:col-span-4 relative">
            <AnimatedSection variant="fadeInScale" delay={0.1}>
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/twenty-seven.png"
                  alt="Cloud Stone Studio interior — Studio Twenty Seven project"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* Caption */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#392D2B]/40 font-sans">
                  Studio Twenty Seven
                </p>
                <p className="text-[10px] text-[#392D2B]/30 font-sans">
                  Tribeca, NYC — 2025
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
