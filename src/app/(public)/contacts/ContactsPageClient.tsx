"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { drawFrame, type TrailPoint, TRAIL_MS } from "@/lib/circleGrid";
import { PixelButton } from "@/components/ui/PixelButton";


const FIELD_STYLE: React.CSSProperties = {
  background: "#DEDBD6",
  padding: "8px 10px",
  width: "100%",
  fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.2,
  color: "#392D2B",
  border: "none",
  outline: "none",
  boxSizing: "border-box",
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.2,
  color: "#392D2B",
  textTransform: "uppercase" as const,
  letterSpacing: "0.02em",
};

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactsPageClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef  = useRef<TrailPoint[]>([]);
  const rafRef    = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contactSchema) as any,
  });
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const onSubmit = async (data: ContactFormData) => {
    setFormStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source_page: "Contacts" }),
      });
      if (res.ok) { setFormStatus("success"); reset(); }
      else setFormStatus("error");
    } catch {
      setFormStatus("error");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      trailRef.current = trailRef.current.filter(p => now - p.t < TRAIL_MS);
      drawFrame(ctx, W, H, now * 0.000035, now * 0.000025, trailRef.current, now);
      rafRef.current = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      trailRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });
      if (trailRef.current.length > 24) trailRef.current.shift();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      aria-label="Contacts"
      style={{
        position: "relative",
        height: "100vh",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#B7D1EA",
        overflow: "hidden",
      }}
    >
      {/* Dot canvas background */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          width: "100%", height: "100%", pointerEvents: "none",
        }}
      />

      {/* Form area — centered in remaining space */}
      <div style={{
        position: "relative",
        zIndex: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 30px 60px",
      }}>
        {/* Contact form card */}
        <div style={{
          width: "min(485px, 100%)",
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.4)",
          padding: "30px 29px",
          display: "flex",
          flexDirection: "column",
          gap: 23,
          alignItems: "center",
          position: "relative",
        }}>
          {/* "Contact form" label top-right */}
          <span style={{
            position: "absolute",
            top: 30,
            right: 29,
            fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
            fontWeight: 500,
            fontSize: 11.52,
            letterSpacing: "-0.3456px",
            textTransform: "uppercase",
            color: "#392D2B",
            whiteSpace: "pre",
          }}>
            Contact  form
          </span>

          {/* Logo */}
          <div style={{ width: 170, height: 103, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/footer-logo.svg"
              alt="Cloud Stone Studio"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>

          {/* Tagline */}
          <p style={{
            fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
            fontWeight: 400,
            fontSize: 20,
            lineHeight: 1.2,
            color: "#392D2B",
            textAlign: "center",
            width: "100%",
          }}>
            Tell us what{" "}
            <span style={{ color: "#C86733" }}>you&apos;re building</span>.
            <br />
            We&apos;ll take it from concept{" "}
            <span style={{ color: "#C86733" }}>to reality</span>.
          </p>

          {/* Form */}
          {formStatus === "success" ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 12, textAlign: "center", padding: "20px 0",
            }}>
              <p style={{
                fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
                fontWeight: 700, fontSize: 24,
                textTransform: "uppercase", letterSpacing: "-0.5px", color: "#392D2B",
              }}>
                Thank you!
              </p>
              <p style={{
                fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
                fontSize: 14, color: "#392D2B", lineHeight: 1.5,
              }}>
                We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Name</label>
                <input
                  {...register("name")}
                  placeholder="Your full name"
                  style={{ ...FIELD_STYLE, color: errors.name ? "#C86733" : "#392D2B" }}
                />
                {errors.name && (
                  <span style={{ fontSize: 10, color: "#C86733" }}>{errors.name.message}</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="your@email.com"
                  style={{ ...FIELD_STYLE, color: errors.email ? "#C86733" : "#392D2B" }}
                />
                {errors.email && (
                  <span style={{ fontSize: 10, color: "#C86733" }}>{errors.email.message}</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Phone (optional)</label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+1 XXX XXX-XXX"
                  style={FIELD_STYLE}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Subject (optional)</label>
                <input
                  {...register("subject")}
                  placeholder="Project type, scope ..."
                  style={FIELD_STYLE}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Message</label>
                <textarea
                  {...register("message")}
                  placeholder="Tell us about your project, timeline, and vision ..."
                  rows={4}
                  style={{
                    ...FIELD_STYLE,
                    paddingBottom: 50,
                    resize: "none",
                    color: errors.message ? "#C86733" : "#392D2B",
                  }}
                />
                {errors.message && (
                  <span style={{ fontSize: 10, color: "#C86733" }}>{errors.message.message}</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 }}>
                <PixelButton
                  label={formStatus === "loading" ? "Sending..." : "Send Request"}
                  type="submit"
                />
                {formStatus === "error" && (
                  <p style={{
                    marginTop: 8, fontSize: 11, color: "#C86733",
                    fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
                  }}>
                    Something went wrong. Please try again.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

    </section>
  );
}
