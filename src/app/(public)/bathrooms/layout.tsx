import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bathrooms",
  description: "Cloud Stone Studio bathroom collections — CloudStone Bathrooms and Gemayel Group. Stone bathrooms designed, fabricated, and installed from factory to space.",
  openGraph: {
    title: "Bathrooms — Cloud Stone Studio",
    description: "CloudStone Bathrooms and Gemayel Group. Stone bathrooms designed, fabricated, and installed from factory to space.",
    images: [{ url: "/images/bath-left.png", width: 1200, height: 800, alt: "CloudStone bathroom interior" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function BathroomsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
