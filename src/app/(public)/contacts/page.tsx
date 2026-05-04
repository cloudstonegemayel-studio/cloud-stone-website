import type { Metadata } from "next";
import { ContactsPageClient } from "./ContactsPageClient";

export const metadata: Metadata = {
  title: "Contacts",
  description: "Start your project with Cloud Stone Studio.",
};

export default function ContactsPage() {
  return <ContactsPageClient />;
}
