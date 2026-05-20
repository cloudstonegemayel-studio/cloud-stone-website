import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Auto-assign sort_order = max existing + 1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: maxRow } = await (supabase as any)
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxRow ? (maxRow.sort_order ?? 0) + 1 : 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("projects")
      .insert({
        title:          body.title,
        slug:           body.slug,
        status:         "draft",
        sort_order:     nextSortOrder,
        content_blocks: [],
        slider_items:   [],
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data)  return NextResponse.json({ error: "No data returned" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
