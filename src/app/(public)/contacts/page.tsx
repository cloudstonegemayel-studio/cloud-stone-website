import type { Metadata } from "next";
import { ContactsPageClient } from "./ContactsPageClient";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Start your project with Cloud Stone Studio. Reach us in Brooklyn, NY — +1-646-272-8208 — antonio@cloudstonestudio.com",
  openGraph: {
    title: "Contact Us — Cloud Stone Studio",
    description: "Start your project with Cloud Stone Studio. Interior design and stone fabrication in Brooklyn, NY.",
    images: [{ url: "/images/img1.png", width: 1200, height: 800, alt: "Cloud Stone Studio" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function ContactsPage() {
  return (
    <>
      <ContactsPageClient />
      <Footer />
    </>
  );
}
