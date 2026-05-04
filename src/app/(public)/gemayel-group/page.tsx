import type { Metadata } from "next";
import { PresentationViewer } from "@/components/sections/PresentationViewer";

export const metadata: Metadata = {
  title: "Gemayel Group — Portfolio 2025",
  description: "Gemayel Group — a third-generation stone factory founded in Lebanon, supporting architectural projects worldwide.",
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
