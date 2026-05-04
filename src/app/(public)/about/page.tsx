import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About - Cloud Stone Studio",
  description:
    "Cloud Stone Studio brings architecture and stone craftsmanship into a single, unified process.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
