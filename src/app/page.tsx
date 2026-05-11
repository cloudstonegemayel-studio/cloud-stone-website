import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/HomeHero";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Cloud Stone Studio — Crafting Atmosphere",
  description: "Cloud Stone Studio — we think like craftsmen and design like storytellers. Premium interior design and architecture studio in Brooklyn, NY.",
  openGraph: {
    title: "Cloud Stone Studio — Crafting Atmosphere",
    description: "Premium interior design and architecture studio. We think like craftsmen and design like storytellers.",
    images: [{ url: "/images/img1.png", width: 1200, height: 800, alt: "Cloud Stone Studio interior" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Footer />
    </>
  );
}
