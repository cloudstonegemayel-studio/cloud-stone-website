"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { Input, Textarea } from "@/components/ui/Input";
import { PixelButton } from "@/components/ui/PixelButton";

type FormState = "idle" | "loading" | "success" | "error";

interface ContactFormProps {
  sourcePage?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export function ContactForm({ sourcePage, onSuccess, compact }: ContactFormProps) {
  const [state, setState] = useState<FormState>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) as any });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source_page: sourcePage }),
      });

      if (!res.ok) throw new Error("Server error");

      setState("success");
      reset();
      onSuccess?.();
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "1px solid rgba(57,45,43,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <span style={{ color: "#392D2B", fontSize: 16 }}>✓</span>
        </div>
        <p style={{
          fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
          fontSize: compact ? 16 : 20,
          color: "#392D2B",
          marginBottom: 8,
        }}>Message received</p>
        <p style={{
          fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
          fontSize: 13,
          color: "rgba(57,45,43,0.5)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}>
          Thank you. We&apos;ll be in touch within 24 hours.
        </p>
        <button
          onClick={() => setState("idle")}
          style={{
            fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
            color: "rgba(57,45,43,0.35)", background: "none", border: "none",
            cursor: "pointer",
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: compact ? 14 : 20,
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
    fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em",
    color: "rgba(57,45,43,0.4)",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: compact ? "8px 10px" : "10px 14px",
    background: "rgba(57,45,43,0.05)", border: "1px solid rgba(57,45,43,0.15)",
    color: "#392D2B", fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
    fontSize: 13, outline: "none", boxSizing: "border-box",
    transition: "border-color 200ms ease",
  };
  const errorStyle: React.CSSProperties = {
    fontSize: 10, color: "#C86733",
    fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={fieldStyle}>
        <label style={labelStyle}>Name *</label>
        <Input
          placeholder="Your full name"
          error={errors.name?.message}
          style={inputStyle}
          {...register("name")}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Email *</label>
        <Input
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
          style={inputStyle}
          {...register("email")}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Phone</label>
        <Input
          type="tel"
          placeholder="+380 XX XXX XXXX"
          error={errors.phone?.message}
          style={inputStyle}
          {...register("phone")}
        />
      </div>

      {!compact && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Subject</label>
          <Input
            placeholder="Project type, scope..."
            error={errors.subject?.message}
            style={inputStyle}
            {...register("subject")}
          />
        </div>
      )}

      <div style={fieldStyle}>
        <label style={labelStyle}>Message *</label>
        <Textarea
          placeholder="Tell us about your project..."
          error={errors.message?.message}
          rows={compact ? 3 : 5}
          style={{ ...inputStyle, resize: "vertical" }}
          {...register("message")}
        />
      </div>

      {state === "error" && (
        <p style={{ ...errorStyle, marginBottom: 12 }}>
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <div style={{
        pointerEvents: state === "loading" ? "none" : "auto",
        opacity: state === "loading" ? 0.6 : 1,
        transition: "opacity 200ms ease",
        display: "flex",
        justifyContent: "center",
      }}>
        <PixelButton
          type="submit"
          label={state === "loading" ? "Sending..." : "Send message"}
        />
      </div>
    </form>
  );
}
