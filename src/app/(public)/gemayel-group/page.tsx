import type { Metadata } from "next";
import { PresentationViewer } from "@/components/sections/PresentationViewer";

export const metadata: Metadata = {
  title: "Gemayel Group — Portfolio 2025",
  description: "Gemayel Group — a third-generation stone factory founded in Lebanon over 50 years ago, supporting architectural projects in New York and worldwide.",
  openGraph: {
    title: "Gemayel Group — Portfolio 2025",
    description: "Third-generation stone factory founded in Lebanon. Supporting architectural projects in New York and worldwide.",
    images: [{ url: "/images/bath-right.png", width: 1200, height: 800, alt: "Gemayel Group stone bathroom" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function GemayiGroupPage() {
  return (
    <PresentationViewer
      pdfUrl="/presentations/Gemayel_Group_Portfolio.pdf"
      title="Gemayel Group"
      sourcePage="Gemayel Group Portfolio Presentation"
    />
  );
}
