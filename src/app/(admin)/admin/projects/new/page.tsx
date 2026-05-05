import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { NewProjectClient } from "./NewProjectClient";

export const metadata = { title: "New Project — Admin" };

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1EC" }}>
      <header style={{
        background: "#392D2B",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexShrink: 0,
      }}>
        <Link
          href="/admin/projects"
          style={{
            color: "rgba(240,238,233,0.5)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          ← Projects
        </Link>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-rader,'PP Rader',serif)",
          fontWeight: 400,
          fontSize: 18,
          fontStyle: "italic",
          color: "#F0EEE9",
        }}>
          New Project
        </h1>
      </header>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        <p style={{
          margin: "0 0 32px",
          fontSize: 13,
          color: "#887870",
          lineHeight: 1.5,
        }}>
          Enter a title and slug to create the project. You&apos;ll be taken to the full editor immediately after.
        </p>
        <NewProjectClient />
      </main>
    </div>
  );
}
