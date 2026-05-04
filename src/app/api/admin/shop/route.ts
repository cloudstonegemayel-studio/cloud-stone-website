import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("shop_items")
    .insert({
      title:            body.title,
      slug:             body.slug,
      item_number:      body.item_number      ?? null,
      category:         body.category         || null,
      availability:     body.availability     || "available",
      description:      body.description      || null,
      long_description: body.long_description || null,
      photo_url:        body.photo_url        || null,
      sketch_url:       body.sketch_url       || null,
      images:           body.images           ?? [],
      status:           body.published ? "published" : "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
