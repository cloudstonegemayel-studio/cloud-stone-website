import Image from "next/image";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export function FounderSection() {
  return (
    <section className="py-24 md:py-36" aria-label="Founder">
      <div className="container-site">
        <div className="grid-site items-center gap-y-12">
          {/* Image — left side */}
          <div className="col-span-8 md:col-span-3">
            <AnimatedSection variant="fadeInScale" delay={0}>
              <div className="relative aspect-[3/4] overflow-hidden max-w-sm">
                <Image
                  src="/images/frame-30.png"
                  alt="Antonio Gemayel — Founder of Cloud Stone Studio"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </AnimatedSection>
          </div>

          {/* Text — right side */}
          <div className="col-span-8 md:col-span-5">
            <AnimatedSection variant="fadeInUp" delay={0}>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#392D2B]/40 font-sans mb-4">
                Founder
              </p>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.08}>
              <h2 className="font-display text-[clamp(32px,3.5vw,52px)] text-[#392D2B] leading-[1.1] tracking-[-0.02em] mb-1">
                Antonio Gemayel
              </h2>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.12}>
              <p className="font-display italic text-[18px] text-[#392D2B]/50 mb-8">
                Architect & Interior Designer
              </p>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.16}>
              <div className="space-y-4 text-[14px] leading-[1.75] text-[#392D2B]/60 font-sans max-w-lg">
                <p>
                  New York City based. Antonio brings a rare combination of architectural
                  rigour and interior sensitivity to every project — from curated private
                  residences to commercial showrooms that tell a story.
                </p>
                <p>
                  Trained in Beirut and New York, his practice is guided by a deep
                  respect for material truth and the stories that spaces hold over time.
                </p>
              </div>
            </AnimatedSection>

            {/* Info grid */}
            <AnimatedSection variant="fadeInUp" delay={0.24} className="mt-10">
              <dl className="grid grid-cols-2 gap-6">
                {[
                  { dt: "Location",    dd: "New York City" },
                  { dt: "Est.",        dd: "2018" },
                  { dt: "Discipline",  dd: "Architecture" },
                  { dt: "Focus",       dd: "Interior Design" },
                ].map(({ dt, dd }) => (
                  <div key={dt}>
                    <dt className="text-[9px] uppercase tracking-[0.12em] text-[#392D2B]/30 font-sans mb-1">
                      {dt}
                    </dt>
                    <dd className="text-[13px] text-[#392D2B] font-sans">
                      {dd}
                    </dd>
                  </div>
                ))}
              </dl>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
