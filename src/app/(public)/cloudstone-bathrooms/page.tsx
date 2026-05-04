import type { Metadata } from "next";
import { PresentationViewer } from "@/components/sections/PresentationViewer";

export const metadata: Metadata = {
  title: "CloudStone Bathrooms — Presentation",
  description: "Stone bathrooms designed, fabricated, and installed by Cloud Stone Studio.",
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
