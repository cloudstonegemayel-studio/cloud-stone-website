"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, heroWord } from "@/lib/animations";

/* Floating image cards — positioned to match Figma hero scatter layout */
const cards = [
  {
    id: "bathrooms",
    src:    "/images/frame-28.png",
    label:  "Bathrooms",
    width:  220,
    height: 280,
    style:  { top: "8%",  left: "3%",  rotate: "-3deg" },
  },
  {
    id: "studio-27",
    src:    "/images/twenty-seven.png",
    label:  "Studio Twenty Seven",
    width:  200,
    height: 260,
    style:  { top: "5%",  left: "38%", rotate: "2deg" },
  },
  {
    id: "design",
    src:    "/images/frame-30.png",
    label:  "Design",
    width:  190,
    height: 240,
    style:  { top: "12%", right: "4%", rotate: "-1.5deg" },
  },
  {
    id: "material",
    src:    "/images/image-70.png",
    label:  "Materials",
    width:  170,
    height: 220,
    style:  { top: "48%", left: "26%", rotate: "3deg" },
  },
] as const;

const taglineWords = [
  "We", "think", "like", "craftsmen",
  "and", "design", "like", "storytellers",
];

export function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      aria-label="Hero"
    >
      {/* Pixel dot texture background — brand signature */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <Image
          src="/pixel-bg.png"
          alt=""
          fill
          className="object-cover opacity-50"
          priority
          sizes="100vw"
        />
      </div>

      {/* Floating image cards */}
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          className="absolute z-10 overflow-hidden shadow-[0_8px_40px_rgba(57,45,43,0.15)]"
          style={{
            ...card.style,
            width:  card.width,
            height: card.height,
            rotate: card.style.rotate,
            willChange: "transform",
          }}
          initial={prefersReduced ? {} : { opacity: 0, y: 30, scale: 0.95 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay:    0.3 + i * 0.12,
            duration: 0.8,
            ease:     EASE.expoOut,
          }}
          whileHover={prefersReduced ? {} : {
            scale: 1.03,
            zIndex: 20,
            transition: { duration: 0.25, ease: EASE.expoOut },
          }}
        >
          <Image
            src={card.src}
            alt={card.label}
            fill
            className="object-cover"
            sizes={`${card.width}px`}
          />
          {/* Label badge */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#392D2B]/60 to-transparent">
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#EEE9E3] font-sans font-medium">
              {card.label}
            </p>
          </div>
        </motion.div>
      ))}

      {/* Bottom tagline — large italic serif, Figma style */}
      <div className="absolute bottom-12 left-8 right-8 z-20 max-w-3xl">
        <motion.div
          className="flex flex-wrap gap-x-4 gap-y-1"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.06, delayChildren: 0.5 }}
          aria-label="We think like craftsmen and design like storytellers"
        >
          {taglineWords.map((word, i) => (
            <motion.span
              key={i}
              variants={heroWord}
              className="font-display italic text-[clamp(28px,4.5vw,68px)] leading-[1.05] text-[#392D2B] tracking-[-0.02em]"
              style={{ display: "inline-block" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-8 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <div className="w-8 h-px bg-[#392D2B]/30" />
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#392D2B]/40 font-sans">
            Scroll to explore
          </p>
        </motion.div>
      </div>

      {/* Sketch decorative element */}
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 opacity-15 pointer-events-none"
        style={{ willChange: "opacity" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 1, duration: 1.2 }}
        aria-hidden
      >
        <Image
          src="/scene-sketch.svg"
          alt=""
          fill
          className="object-contain object-bottom-right"
          sizes="256px"
        />
      </motion.div>
    </section>
  );
}
