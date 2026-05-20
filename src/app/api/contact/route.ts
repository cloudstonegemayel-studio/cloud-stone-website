import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body      = await request.json();
    const validated = contactSchema.parse(body);

    // ── 1. Save to Supabase ────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured =
      supabaseUrl &&
      supabaseUrl !== "https://YOUR_PROJECT.supabase.co";

    if (isSupabaseConfigured) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: dbError } = await (supabase as any)
          .from("contact_submissions")
          .insert({
            name:        validated.name,
            email:       validated.email,
            phone:       validated.phone        ?? null,
            subject:     validated.subject      ?? null,
            message:     validated.message,
            source_page: validated.source_page  ?? null,
            ip_address:  request.headers.get("x-forwarded-for") ?? null,
            user_agent:  request.headers.get("user-agent")      ?? null,
            status:      "new",
          });

        if (dbError) {
          // Log but don't block the request — email will still be sent
          console.error("[contact-api] Supabase insert error:", dbError.message, dbError.details);
        }
      } catch (dbErr) {
        console.error("[contact-api] Supabase client error:", dbErr);
      }
    }

    // ── 2. Send emails via Resend ──────────────────────────────────────────
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_...") {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const domain = process.env.RESEND_DOMAIN ?? "cloudstonestudio.com";
      const sourceInfo = validated.source_page
        ? `<p><strong>Source:</strong> ${validated.source_page}</p>`
        : "";

      const ownerTo = Array.from(new Set([
        "antonio@cloudstonestudio.com",
        ...(process.env.OWNER_EMAIL ? [process.env.OWNER_EMAIL] : []),
      ]));

      await Promise.all([
        resend.emails.send({
          from:    `Cloud Stone <noreply@${domain}>`,
          to:      ownerTo,
          subject: `New inquiry from ${validated.name}${validated.source_page ? ` (${validated.source_page})` : ""}`,
          html: `
            <p><strong>Name:</strong> ${validated.name}</p>
            <p><strong>Email:</strong> ${validated.email}</p>
            <p><strong>Phone:</strong> ${validated.phone ?? "—"}</p>
            <p><strong>Subject:</strong> ${validated.subject ?? "—"}</p>
            ${sourceInfo}
            <p><strong>Message:</strong></p>
            <p>${validated.message.replace(/\n/g, "<br>")}</p>
          `,
        }),
        resend.emails.send({
          from:    `Cloud Stone Studio <noreply@${domain}>`,
          to:      validated.email,
          subject: "We received your message — Cloud Stone Studio",
          html: `
            <p>Thank you, ${validated.name}.</p>
            <p>We've received your message and will be in touch within 24 hours.</p>
            <p>— Cloud Stone Studio</p>
          `,
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact-api]", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
