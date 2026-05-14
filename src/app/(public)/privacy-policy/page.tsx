import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Cloud Stone Studio",
};

const S = {
  page: {
    background: "#F0EEE9",
    minHeight: "100vh",
    padding: "80px 24px 120px",
    fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
    color: "#392D2B",
  } as React.CSSProperties,
  wrap: {
    maxWidth: 760,
    margin: "0 auto",
  } as React.CSSProperties,
  h1: {
    fontFamily: "var(--font-rader,'PP Rader',serif)",
    fontWeight: 500,
    fontSize: "clamp(36px,4vw,72px)",
    lineHeight: 0.9,
    textTransform: "uppercase" as const,
    letterSpacing: "-0.02em",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#887870",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 60,
    display: "block",
  },
  h2: {
    fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    marginTop: 44,
    marginBottom: 12,
  },
  p: {
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 10,
    opacity: 0.85,
  },
  ul: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  li: {
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 4,
    opacity: 0.85,
  },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(57,45,43,0.12)",
    margin: "60px 0 48px",
  },
  backLink: {
    display: "inline-block",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#887870",
    textDecoration: "none",
    marginBottom: 48,
  },
} as const;

export default function PrivacyPolicyPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.backLink}>← Cloud Stone Studio</Link>

        <h1 style={S.h1}>Privacy Policy</h1>
        <span style={S.date}>Effective Date: May 13, 2026</span>

        <p style={S.p}>
          Cloud Stone Studio ("Cloud Stone Studio," "we," "our," or "us") respects your privacy and is
          committed to protecting the personal information you may provide through this website.
        </p>
        <p style={S.p}>
          This Privacy Policy explains how information is collected, used, and protected when you visit
          or interact with this website.
        </p>

        <h2 style={S.h2}>1. Information We Collect</h2>
        <p style={S.p}>We may collect personal information that you voluntarily provide through:</p>
        <ul style={S.ul}>
          {["contact forms", "inquiry submissions", "newsletter signups", "email communications",
            "or other direct interactions with the website"].map(i => (
            <li key={i} style={S.li}>{i}</li>
          ))}
        </ul>
        <p style={S.p}>This information may include:</p>
        <ul style={S.ul}>
          {["name", "email address", "phone number", "company name", "project information",
            "or any information you choose to provide"].map(i => (
            <li key={i} style={S.li}>{i}</li>
          ))}
        </ul>
        <p style={S.p}>We may also automatically collect limited technical information such as:</p>
        <ul style={S.ul}>
          {["IP address", "browser type", "device information", "pages visited",
            "referral sources", "and general website usage analytics"].map(i => (
            <li key={i} style={S.li}>{i}</li>
          ))}
        </ul>

        <h2 style={S.h2}>2. How We Use Information</h2>
        <p style={S.p}>Information collected through this website may be used to:</p>
        <ul style={S.ul}>
          {["respond to inquiries",
            "communicate regarding projects or services",
            "provide updates or newsletters",
            "improve website performance and user experience",
            "analyze website traffic and engagement",
            "and maintain website security"].map(i => (
            <li key={i} style={S.li}>{i}</li>
          ))}
        </ul>
        <p style={S.p}>We do not sell personal information to third parties.</p>

        <h2 style={S.h2}>3. Newsletter &amp; Marketing Communications</h2>
        <p style={S.p}>
          If you subscribe to updates or newsletters, you may receive occasional communications
          related to Cloud Stone Studio, projects, products, news, or announcements.
        </p>
        <p style={S.p}>
          You may unsubscribe from these communications at any time through the unsubscribe link
          included in emails or by contacting us directly.
        </p>

        <h2 style={S.h2}>4. Cookies &amp; Analytics</h2>
        <p style={S.p}>
          This website may use cookies and similar technologies to improve functionality and understand
          how visitors interact with the site.
        </p>
        <p style={S.p}>We may use third-party services such as:</p>
        <ul style={S.ul}>
          {["Google Analytics", "Meta Pixel", "scheduling platforms",
            "embedded media providers", "or other analytics and marketing tools"].map(i => (
            <li key={i} style={S.li}>{i}</li>
          ))}
        </ul>
        <p style={S.p}>
          These services may collect anonymized or aggregated usage information in accordance with
          their own privacy policies.
        </p>
        <p style={S.p}>
          You may disable cookies through your browser settings; however, certain parts of the
          website may not function properly as a result.
        </p>

        <h2 style={S.h2}>5. Third-Party Links &amp; Services</h2>
        <p style={S.p}>
          This website may contain links to third-party websites, social platforms, or external
          services. Cloud Stone Studio is not responsible for the privacy practices or content of
          third-party websites.
        </p>
        <p style={S.p}>Users access third-party services at their own discretion.</p>

        <h2 style={S.h2}>6. Data Security</h2>
        <p style={S.p}>
          We take reasonable measures to help protect information submitted through this website.
          However, no method of internet transmission or electronic storage is completely secure,
          and we cannot guarantee absolute security.
        </p>

        <h2 style={S.h2}>7. International Visitors</h2>
        <p style={S.p}>
          This website may be accessed internationally. By using this website, you understand that
          your information may be transferred to and processed in the United States.
        </p>

        <h2 style={S.h2}>8. Children&apos;s Privacy</h2>
        <p style={S.p}>
          This website is not intended for individuals under the age of 13, and we do not knowingly
          collect personal information from children.
        </p>

        <h2 style={S.h2}>9. Your Rights</h2>
        <p style={S.p}>
          Depending on your location and applicable laws, you may have rights regarding your personal
          information, including the right to:
        </p>
        <ul style={S.ul}>
          {["request access to your data",
            "request correction or deletion",
            "withdraw consent to communications",
            "or request information regarding how your data is used"].map(i => (
            <li key={i} style={S.li}>{i}</li>
          ))}
        </ul>
        <p style={S.p}>To make such requests, please contact us directly.</p>

        <h2 style={S.h2}>10. Changes to This Privacy Policy</h2>
        <p style={S.p}>
          Cloud Stone Studio reserves the right to update or modify this Privacy Policy at any time.
          Continued use of the website after changes are posted constitutes acceptance of the updated
          policy.
        </p>

        <h2 style={S.h2}>11. Contact</h2>
        <p style={S.p}>
          For questions regarding this Privacy Policy or your information, please contact:
        </p>
        <p style={{ ...S.p, opacity: 1 }}>
          Cloud Stone Studio<br />
          New York, NY<br />
          <a href="mailto:antonio@cloudstonestudio.com"
            style={{ color: "#392D2B" }}>antonio@cloudstonestudio.com</a>
        </p>

        <hr style={S.divider} />
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#887870" }}>
          <Link href="/terms" style={{ color: "#887870" }}>Terms of Service →</Link>
        </div>
      </div>
    </div>
  );
}
