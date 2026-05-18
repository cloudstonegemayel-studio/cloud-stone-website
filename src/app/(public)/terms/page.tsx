import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Cloud Stone Studio",
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

export default function TermsPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.backLink}>← Cloud Stone Studio</Link>

        <h1 style={S.h1}>Terms of Service</h1>
        <span style={S.date}>Effective Date: May 13, 2026</span>

        <p style={S.p}>
          Welcome to the website of Cloud Stone Studio ("Cloud Stone Studio," "we," "our," or "us").
          By accessing or using this website, you agree to the following Terms of Service. If you do
          not agree with these terms, please do not use this website.
        </p>

        <h2 style={S.h2}>1. Website Purpose</h2>
        <p style={S.p}>
          This website is intended to showcase the work, services, concepts, portfolio projects,
          materials, and products of Cloud Stone Studio. Any information provided on this website is
          for general informational and presentation purposes only.
        </p>
        <p style={S.p}>
          Product displays, visualizations, renderings, conceptual studies, and project imagery do not
          constitute binding offers, construction documents, or guarantees of availability unless
          otherwise agreed upon in writing.
        </p>

        <h2 style={S.h2}>2. Intellectual Property</h2>
        <p style={S.p}>
          All content on this website — including but not limited to photographs, renderings, drawings,
          concepts, text, graphics, branding, layouts, product designs, and visual material — is the
          intellectual property of Cloud Stone Studio or used with permission.
        </p>
        <p style={S.p}>
          No content from this website may be copied, reproduced, distributed, modified, republished,
          or used commercially without prior written consent from Cloud Stone Studio.
        </p>

        <h2 style={S.h2}>3. Collaborative Projects &amp; Credits</h2>
        <p style={S.p}>
          Certain projects displayed on this website may have been completed in collaboration with
          architects, consultants, artists, fabricators, contractors, clients, or other creative
          partners.
        </p>
        <p style={S.p}>
          Cloud Stone Studio may have contributed in various capacities including design, fabrication,
          construction coordination, material development, visualization, detailing, or project
          management.
        </p>
        <p style={S.p}>
          Project descriptions and imagery are intended to represent Cloud Stone Studio&apos;s role
          within each collaboration and do not imply sole authorship unless explicitly stated.
        </p>
        <p style={S.p}>
          Cloud Stone Studio is not a licensed architecture firm in the State of New York and does not
          provide architectural services requiring licensure unless performed in collaboration with a
          licensed Architect of Record where applicable.
        </p>

        <h2 style={S.h2}>4. Inquiries &amp; Submissions</h2>
        <p style={S.p}>
          By submitting inquiries, contact forms, emails, or newsletter signups through this website,
          you agree that the information provided may be used by Cloud Stone Studio to communicate with
          you regarding projects, services, products, updates, or related inquiries.
        </p>
        <p style={S.p}>
          You agree not to submit unlawful, abusive, misleading, or malicious content through this
          website.
        </p>

        <h2 style={S.h2}>5. Product &amp; Material Information</h2>
        <p style={S.p}>
          Products, furniture pieces, stone elements, custom works, and material samples displayed on
          this website are subject to availability, customization, fabrication limitations, shipping
          constraints, pricing revisions, and project-specific conditions.
        </p>
        <p style={S.p}>
          Colors, textures, stone veining, finishes, and materials may vary from digital
          representations.
        </p>
        <p style={S.p}>
          Submission of an inquiry does not guarantee acceptance of a project, order, or collaboration.
        </p>

        <h2 style={S.h2}>6. Third-Party Services</h2>
        <p style={S.p}>
          This website may use or integrate third-party tools and services including analytics
          platforms, scheduling services, embedded media, social media integrations, or newsletter
          providers.
        </p>
        <p style={S.p}>
          Cloud Stone Studio is not responsible for the privacy practices, content, or functionality
          of third-party services or external websites linked through this website.
        </p>

        <h2 style={S.h2}>7. Disclaimer</h2>
        <p style={S.p}>
          This website and all content are provided &quot;as is&quot; without warranties of any kind,
          express or implied.
        </p>
        <p style={S.p}>Cloud Stone Studio does not guarantee:</p>
        <ul style={S.ul}>
          {[
            "uninterrupted website access",
            "absence of technical errors",
            "completeness or accuracy of all information",
            "or suitability of website content for specific purposes",
          ].map(i => (
            <li key={i} style={S.li}>{i}</li>
          ))}
        </ul>
        <p style={S.p}>Users access and use this website at their own discretion and risk.</p>

        <h2 style={S.h2}>8. Limitation of Liability</h2>
        <p style={S.p}>
          To the fullest extent permitted under applicable law, Cloud Stone Studio shall not be liable
          for any indirect, incidental, consequential, special, or punitive damages arising from the
          use of this website or reliance on its content.
        </p>

        <h2 style={S.h2}>9. Governing Law</h2>
        <p style={S.p}>
          These Terms of Service shall be governed and interpreted in accordance with the laws of the
          State of New York, United States, without regard to conflict of law principles.
        </p>

        <h2 style={S.h2}>10. Changes to These Terms</h2>
        <p style={S.p}>
          Cloud Stone Studio reserves the right to update or modify these Terms of Service at any time
          without prior notice. Continued use of the website following changes constitutes acceptance
          of the revised terms.
        </p>

        <h2 style={S.h2}>11. Contact</h2>
        <p style={S.p}>
          For inquiries regarding these Terms of Service, please contact:
        </p>
        <p style={{ ...S.p, opacity: 1 }}>
          Cloud Stone Studio<br />
          New York, NY<br />
          <a href="mailto:antonio@cloudstonestudio.com"
            style={{ color: "#392D2B" }}>antonio@cloudstonestudio.com</a>
        </p>

        <hr style={S.divider} />
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#887870" }}>
          <Link href="/privacy-policy" style={{ color: "#887870" }}>Privacy Policy →</Link>
        </div>
      </div>
    </div>
  );
}
