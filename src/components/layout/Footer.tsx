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
// Two-layer WhatsApp: outer bubble (stroke/trim-path) + inner handset (fill)
const WHATSAPP_PATHS = [
  "M21.9775 2H21.9844C24.5857 1.99138 27.1629 2.50073 29.5654 3.49805C31.968 4.49541 34.148 5.96122 35.9785 7.80957L35.9854 7.81641C39.7233 11.5544 41.7803 16.5234 41.7803 21.8242C41.7802 32.7315 32.8849 41.626 21.9775 41.626C18.663 41.6259 15.4057 40.7874 12.5068 39.208L11.8096 38.8281L11.042 39.0293L2.83887 41.1846L5.00977 33.2178L5.22754 32.417L4.81543 31.6973C3.09532 28.6971 2.17578 25.2993 2.17578 21.8018C2.17595 10.8946 11.0704 2.00022 21.9775 2Z",
  "M31.9221 26.3785C31.3721 26.1145 28.6881 24.7945 28.2041 24.5965C27.6981 24.4205 27.3461 24.3325 26.9721 24.8605C26.5981 25.4105 25.5641 26.6425 25.2561 26.9945C24.9481 27.3685 24.6181 27.4125 24.0681 27.1265C23.5181 26.8625 21.7581 26.2685 19.6901 24.4205C18.0621 22.9685 16.9841 21.1865 16.6541 20.6365C16.3461 20.0865 16.6101 19.8005 16.8961 19.5145C17.1381 19.2725 17.4461 18.8765 17.7101 18.5685C17.9741 18.2605 18.0841 18.0185 18.2601 17.6665C18.4361 17.2925 18.3481 16.9845 18.2161 16.7205C18.0841 16.4566 16.9841 13.7726 16.5441 12.6726C16.1041 11.6166 15.6421 11.7486 15.3121 11.7266H14.2561C13.8821 11.7266 13.3101 11.8586 12.8041 12.4086C12.3201 12.9586 10.9121 14.2786 10.9121 16.9625C10.9121 19.6465 12.8701 22.2425 13.1341 22.5945C13.3981 22.9685 16.9841 28.4685 22.4401 30.8225C23.7381 31.3945 24.7501 31.7245 25.5421 31.9665C26.8401 32.3845 28.0281 32.3185 28.9741 32.1865C30.0301 32.0325 32.2081 30.8665 32.6481 29.5905C33.1101 28.3145 33.1101 27.2365 32.9561 26.9945C32.8021 26.7525 32.4721 26.6425 31.9221 26.3785Z",
];

// ── Unified icon with trim-path draw animation on hover ────────────────────
// pathTypes: "stroke" (default) = trim-path; "fill" = opacity fade
function TrimIcon({ paths, href, label, size = 48, viewBox = "0 0 48 48", pathTypes }: {
  paths: string[];
  href?: string;
  label?: string;
  size?: number;
  viewBox?: string;
  pathTypes?: ("stroke" | "fill")[];
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
      <svg width={size} height={size} viewBox={viewBox} fill="none"
        style={{ position: "absolute", inset: 0, opacity: hov ? 0 : 1, transition: "opacity 0.4s ease" }}>
        {paths.map((d, i) =>
          (pathTypes?.[i] ?? "stroke") === "fill"
            ? <path key={i} d={d} fill="#392D2B" />
            : <path key={i} d={d} stroke="#392D2B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {/* Animated layer — stroke: trim-path draws in; fill: opacity fades in */}
      <svg width={size} height={size} viewBox={viewBox} fill="none" style={{ position: "relative" }}>
        {paths.map((d, i) => {
          const type = pathTypes?.[i] ?? "stroke";
          return type === "fill" ? (
            <path key={i} d={d} fill="#C86733"
              style={{
                opacity: hov ? 1 : 0,
                transition: hov
                  ? `opacity 0.85s ease ${i * 0.12}s`
                  : `opacity 0.45s ease-in`,
              }} />
          ) : (
            <path key={i} d={d} stroke="#C86733" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              pathLength="1" strokeDasharray="1"
              strokeDashoffset={hov ? 0 : 1}
              style={{
                transition: hov
                  ? `stroke-dashoffset 0.85s ease ${i * 0.12}s`
                  : `stroke-dashoffset 0.45s ease-in`,
              }} />
          );
        })}
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
        body: JSON.stringify({ ...data, source_page: "Footer" }),
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
	gap: "30px",
        padding: 30,
        
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
              whiteSpace: "pre-wrap",
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
	    rowGap: "20px",
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
                pathTypes={["stroke", "fill"]}
                viewBox="0 0 44 44"
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
