"use client";

import Image from "next/image";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PixelButton } from "@/components/ui/PixelButton";

export function CtaSection() {

  return (
    <section
      className="relative overflow-hidden min-h-[80vh] flex items-center"
      aria-label="Start your project"
    >
      {/* Background image — left half */}
      <div className="absolute inset-y-0 left-0 w-1/2 md:w-[45%]" aria-hidden>
        <Image
          src="/images/frame-30.png"
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#EEE9E3]" />
      </div>

      {/* Pixel dot bg */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <Image
          src="/pixel-bg.png"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
      </div>

      {/* Content — right half */}
      <div className="container-site relative z-10">
        <div className="grid-site">
          <div className="col-span-8 md:col-span-4 md:col-start-5 py-24">
            <AnimatedSection variant="fadeInUp" delay={0}>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#392D2B]/40 font-sans mb-6">
                Let&apos;s create
              </p>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.08}>
              <h2 className="font-display text-[clamp(36px,4.5vw,64px)] italic text-[#392D2B] leading-[1.05] tracking-[-0.025em] mb-6 text-balance">
                Every project begins as an idea —
              </h2>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.16}>
              <p className="text-[15px] leading-[1.7] text-[#392D2B]/60 font-sans mb-8 max-w-sm">
                Tell us about your vision. We&apos;ll bring the craft, the material
                knowledge, and the attention to detail that transforms ideas into
                lasting environments.
              </p>
            </AnimatedSection>

            <AnimatedSection variant="fadeInUp" delay={0.24} className="flex flex-col sm:flex-row gap-4">
              <PixelButton label="Start your project" href="/about" />
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
