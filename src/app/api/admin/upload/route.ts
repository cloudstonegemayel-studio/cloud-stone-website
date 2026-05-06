import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form    = await request.formData();
  const file    = form.get("file") as File | null;
  const altText = (form.get("alt") as string | null)?.trim() ?? "";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

  // Use alt text as SEO-friendly filename when provided
  const base = altText
    ? altText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const filename = `projects/${base}.${ext}`;

  const blob = await put(filename, file, { access: "public", addRandomSuffix: true });

  return NextResponse.json({ url: blob.url });
}
