import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "Cloud Stone Studio brings architecture and stone craftsmanship into a single, unified process. Based in Brooklyn, NY — serving residential, commercial, and hospitality clients.",
  openGraph: {
    title: "About — Cloud Stone Studio",
    description: "Architecture and stone craftsmanship in a single, unified process.",
    images: [{ url: "/images/design/79AB18DD-3959-4C04-9A5E-417E691B6D46.JPG", alt: "Cloud Stone Studio studio" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function AboutPage() {
  return (
    <>
      <AboutPageClient />
      <Footer />
    </>
  );
}
