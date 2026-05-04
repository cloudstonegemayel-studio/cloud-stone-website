"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { PixelButton } from "@/components/ui/PixelButton";

// ── Icon path data ─────────────────────────────────────────────────────────
const MAP_PIN_PATHS = [
  "M42 20C42 34 24 46 24 46C24 46 6 34 6 20C6 15.2261 7.89642 10.6477 11.2721 7.27208C14.6477 3.89642 19.2261 2 24 2C28.7739 2 33.3523 3.89642 36.7279 7.27208C40.1036 10.6477 42 15.2261 42 20Z",
  "M24 26C27.3137 26 30 23.3137 30 20C30 16.6863 27.3137 14 24 14C20.6863 14 18 16.6863 18 20C18 23.3137 20.6863 26 24 26Z",
];
const PHONE_PATHS = [
  "M44.0008 33.8402V39.8402C44.0031 40.3972 43.889 40.9485 43.6659 41.4589C43.4427 41.9692 43.1154 42.4274 42.705 42.8039C42.2946 43.1805 41.81 43.4672 41.2823 43.6456C40.7547 43.8241 40.1956 43.8903 39.6408 43.8402C33.4865 43.1715 27.5748 41.0685 22.3808 37.7002C17.5485 34.6295 13.4515 30.5325 10.3808 25.7002C7.0008 20.4826 4.89733 14.5422 4.24084 8.36019C4.19086 7.80713 4.25659 7.24971 4.43384 6.72344C4.61109 6.19717 4.89598 5.71357 5.27037 5.30344C5.64477 4.8933 6.10045 4.56561 6.60842 4.34124C7.1164 4.11686 7.66552 4.00072 8.22084 4.00019H14.2208C15.1915 3.99064 16.1324 4.33435 16.8684 4.96726C17.6043 5.60017 18.085 6.47909 18.2208 7.44019C18.4741 9.36033 18.9437 11.2456 19.6208 13.0602C19.8899 13.776 19.9482 14.554 19.7887 15.302C19.6291 16.0499 19.2586 16.7364 18.7208 17.2802L16.1808 19.8202C19.028 24.8273 23.1738 28.9731 28.1808 31.8202L30.7208 29.2802C31.2646 28.7425 31.9512 28.3719 32.6991 28.2124C33.447 28.0529 34.225 28.1111 34.9408 28.3802C36.7554 29.0573 38.6407 29.5269 40.5608 29.7802C41.5324 29.9173 42.4196 30.4066 43.0539 31.1552C43.6882 31.9038 44.0252 32.8593 44.0008 33.8402Z",
];
const MAIL_PATHS = [
  "M44 12C44 9.8 42.2 8 40 8H8C5.8 8 4 9.8 4 12M44 12V36C44 38.2 42.2 40 40 40H8C5.8 40 4 38.2 4 36V12M44 12L24 26L4 12",
];
const INSTAGRAM_PATHS = [
  "M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z",
];
const WHATSAPP_PATHS = [
  "M39.5112 8.4021C37.494 6.36514 35.0915 4.75004 32.4438 3.65091C29.796 2.55179 26.956 1.99062 24.0893 2.00012C12.0773 2.00012 2.28733 11.7901 2.28733 23.8021C2.28733 27.6521 3.29933 31.392 5.19132 34.692L2.11133 46L13.6613 42.964C16.8513 44.702 20.4373 45.626 24.0893 45.626C36.1012 45.626 45.8912 35.836 45.8912 23.8241C45.8912 17.9941 43.6252 12.5161 39.5112 8.4021ZM24.0893 41.93C20.8333 41.93 17.6433 41.05 14.8493 39.4L14.1893 39.004L7.32531 40.808L9.15131 34.12L8.71131 33.438C6.90192 30.5496 5.94135 27.2105 5.93932 23.8021C5.93932 13.8141 14.0793 5.67411 24.0673 5.67411C28.9073 5.67411 33.4612 7.5661 36.8712 10.9981C38.56 12.6786 39.8983 14.6777 40.8084 16.8794C41.7185 19.0811 42.1825 21.4417 42.1732 23.8241C42.2172 33.812 34.0772 41.93 24.0893 41.93ZM34.0332 28.378C33.4832 28.114 30.7993 26.7941 30.3153 26.5961C29.8093 26.4201 29.4573 26.3321 29.0833 26.8601C28.7093 27.4101 27.6753 28.642 27.3673 28.994C27.0593 29.368 26.7293 29.412 26.1793 29.126C25.6293 28.862 23.8693 28.268 21.8013 26.4201C20.1733 24.9681 19.0953 23.1861 18.7653 22.6361C18.4573 22.0861 18.7213 21.8001 19.0073 21.5141C19.2493 21.2721 19.5573 20.8761 19.8213 20.5681C20.0853 20.2601 20.1953 20.0181 20.3713 19.6661C20.5473 19.2921 20.4593 18.9841 20.3273 18.7201C20.1953 18.4561 19.0953 15.7721 18.6553 14.6721C18.2153 13.6161 17.7533 13.7481 17.4233 13.7261H16.3673C15.9933 13.7261 15.4213 13.8581 14.9153 14.4081C14.4313 14.9581 13.0233 16.2781 13.0233 18.9621C13.0233 21.6461 14.9813 24.2421 15.2453 24.5941C15.5093 24.9681 19.0953 30.468 24.5513 32.822C25.8493 33.394 26.8613 33.724 27.6533 33.966C28.9513 34.384 30.1393 34.318 31.0853 34.186C32.1413 34.032 34.3192 32.866 34.7592 31.59C35.2212 30.314 35.2212 29.236 35.0672 28.994C34.9132 28.752 34.5832 28.642 34.0332 28.378Z",
];

// ── Unified icon with trim-path draw animation on hover ────────────────────
function TrimIcon({ paths, href, label, size = 48 }: {
  paths: string[]; href?: string; label?: string; size?: number;
}) {
  const [hov, setHov] = useState(false);
  const wrapStyle: React.CSSProperties = {
    display: "inline-flex", width: size, height: size,
    position: "relative", flexShrink: 0, cursor: href ? "pointer" : "default",
  };
  const handlers = {
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
  };
  const svgs = (
    <>
      {/* Static layer — fades out as animated layer draws in */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
        style={{ position: "absolute", inset: 0, opacity: hov ? 0 : 1, transition: "opacity 0.4s ease" }}>
        {paths.map((d, i) => (
          <path key={i} d={d} stroke="#392D2B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      {/* Animated layer — orange trim-path draws on hover */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ position: "relative" }}>
        {paths.map((d, i) => (
          <path key={i} d={d} stroke="#C86733" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            pathLength="1" strokeDasharray="1"
            strokeDashoffset={hov ? 0 : 1}
            style={{
              transition: hov
                ? `stroke-dashoffset 0.85s ease ${i * 0.12}s`
                : `stroke-dashoffset 0.45s ease-in`,
            }}
          />
        ))}
      </svg>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
        style={wrapStyle} {...handlers}>
        {svgs}
      </a>
    );
  }
  return <div style={wrapStyle} {...handlers}>{svgs}</div>;
}

// ── Form field ─────────────────────────────────────────────────────────────
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

// ── Nav links ──────────────────────────────────────────────────────────────
const NAV = [
  { href: "/",          label: "Cloud Stone" },
  { href: "/design",    label: "Design"       },
  { href: "/bathrooms", label: "Bathrooms"    },
  { href: "/shop",      label: "Shop"         },
  { href: "/about",     label: "About"        },
] as const;

type FormStatus = "idle" | "loading" | "success" | "error";

// ── Footer ─────────────────────────────────────────────────────────────────
export function Footer() {
  const ref        = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);

  // Animation entry sequence
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPhase(1);
        setTimeout(() => setPhase(2), 420);
        obs.disconnect();
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Contact form
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
        body: JSON.stringify(data),
      });
      if (res.ok) { setFormStatus("success"); reset(); }
      else setFormStatus("error");
    } catch {
      setFormStatus("error");
    }
  };

  const fadeRow = (delay = 0): React.CSSProperties => ({
    opacity: phase >= 1 ? 1 : 0,
    transform: phase >= 1 ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  const fadeCenter: React.CSSProperties = {
    opacity: phase >= 2 ? 1 : 0,
    transform: phase >= 2 ? "translateY(0)" : "translateY(18px)",
    transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)",
  };

  const slideRight: React.CSSProperties = {
    opacity: phase >= 2 ? 1 : 0,
    transform: phase >= 2 ? "translateY(0)" : "translateY(60px)",
    transition: "opacity 0.7s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)",
  };

  const NAV_TEXT: React.CSSProperties = {
    fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
    fontWeight: 600,
    fontSize: 9,
    letterSpacing: "1.17px",
    textTransform: "uppercase",
    color: "#392D2B",
    textDecoration: "none",
    padding: "6px 8px",
    whiteSpace: "nowrap",
  };

  return (
    <footer
      id="footer"
      ref={ref}
      style={{
        display: "flex",
        background: "#F0EEE9",
        minHeight: 480,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Left section ──────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
	alignItems: "center",

        padding: 30,
        gap: 0,
        minWidth: 0,
      }}>

        {/* Top: nav row */}
        <div style={fadeRow(0)}>
          <nav style={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }} aria-label="Footer navigation">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} style={NAV_TEXT}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: title + contact info */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          ...fadeCenter,
        }}>
          {/* Title block */}
          <div>
            <p style={{
              fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(18px,1.563vw,30px)",
              lineHeight: 0.75,
              letterSpacing: "-0.9px",
              textTransform: "uppercase",
              color: "#392D2B",
              marginBottom: 4,
            }}>
              Cloud Stone Studio
            </p>
            <p style={{
              fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
              fontWeight: 400,
              fontSize: "clamp(36px,3.646vw,70px)",
              lineHeight: 0.9,
              letterSpacing: "-0.7px",
              color: "#392D2B",
              whiteSpace: "nowrap",
            }}>
              <span style={{ color: "#C86733" }}>Design </span>
              <span>| Custom Fabrication</span>
            </p>
          </div>

          {/* Contact row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 46,
            flexWrap: "wrap",
          }}>
            {/* Location */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <TrimIcon paths={MAP_PIN_PATHS} label="Location" />
              <span style={{
                fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
                fontWeight: 400,
                fontSize: 20,
                lineHeight: 1.2,
                color: "#392D2B",
                whiteSpace: "nowrap",
              }}>
                Brooklyn, NY 11249
              </span>
            </div>

            {/* Contact icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
              <TrimIcon
                href="tel:+16462728208"
                label="Call +1-646-272-8208"
                paths={PHONE_PATHS}
              />
              <TrimIcon
                href="mailto:antonio@cloudstonestudio.com"
                label="Email antonio@cloudstonestudio.com"
                paths={MAIL_PATHS}
              />
              <TrimIcon
                href="https://instagram.com/cloudstonestudio"
                label="Instagram"
                paths={INSTAGRAM_PATHS}
              />
              <TrimIcon
                href="https://wa.me/16462728208"
                label="WhatsApp"
                paths={WHATSAPP_PATHS}
              />
            </div>
          </div>
        </div>

        {/* Bottom: copyright */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
	width: "100%",
          ...fadeRow(150),
        }}>
          <span style={{
            fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "-0.3px",
            textTransform: "uppercase",
            color: "#392D2B",
          }}>
            © cloudstonestudio.com 2026
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { href: "/privacy-policy", label: "Privacy Policy" },
              { href: "/terms",          label: "Terms of Service" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "-0.3px",
                textTransform: "uppercase",
                color: "#392D2B",
                textDecoration: "none",
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right section ─────────────────────────────────────────────────── */}
      <div style={{
        width: 485,
        flexShrink: 0,
        background: "#B7D1EA",
        padding: "30px 29px",
        display: "flex",
        flexDirection: "column",
        gap: 23,
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        ...slideRight,
      }}>
        {/* "Contact form" label top-right */}
        <span style={{
          position: "absolute",
          top: 30,
          right: 30,
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

        {/* Contact form */}
        {formStatus === "success" ? (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-rader,'PP Rader',sans-serif)",
              fontWeight: 700,
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: "-0.5px",
              color: "#392D2B",
            }}>
              Thank you!
            </p>
            <p style={{
              fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
              fontSize: 14,
              color: "#392D2B",
              lineHeight: 1.5,
            }}>
              We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}
          >
            {/* Name */}
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

            {/* Email */}
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

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={LABEL_STYLE}>Phone (optional)</label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+1 XXX XXX-XXX"
                style={FIELD_STYLE}
              />
            </div>

            {/* Subject */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={LABEL_STYLE}>Subject (optional)</label>
              <input
                {...register("subject")}
                placeholder="Project type, scope ..."
                style={FIELD_STYLE}
              />
            </div>

            {/* Message */}
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

            {/* Submit */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 }}>
              <PixelButton
                label={formStatus === "loading" ? "Sending..." : "Send Request"}
                type="submit"
              />
              {formStatus === "error" && (
                <p style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "#C86733",
                  fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
                }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </form>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          #footer {
            flex-direction: column !important;
          }
          #footer > div:last-child {
            width: 100% !important;
            order: -1;
          }
          #footer > div:first-child {
            width: 100% !important;
          }
        }
      `}</style>
    </footer>
  );
}
