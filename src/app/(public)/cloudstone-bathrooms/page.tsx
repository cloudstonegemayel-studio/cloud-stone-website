import type { Metadata } from "next";
import { PresentationViewer } from "@/components/sections/PresentationViewer";

export const metadata: Metadata = {
  title: "CloudStone Bathrooms",
  description: "Stone bathrooms designed, fabricated, and installed by Cloud Stone Studio — from our factory to your space.",
  openGraph: {
    title: "CloudStone Bathrooms — Cloud Stone Studio",
    description: "Stone bathrooms designed, fabricated, and installed. From our factory to your space.",
    images: [{ url: "/images/bath-left.png", width: 1200, height: 800, alt: "CloudStone bathroom interior" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function CloudStoneBathroomsPage() {
  return (
    <PresentationViewer
      pdfUrl="/presentations/CloudStone_Bathrooms.pdf"
      title="CloudStone_Bathrooms"
      sourcePage="CloudStone Bathrooms Presentation"
    />
  );
}
