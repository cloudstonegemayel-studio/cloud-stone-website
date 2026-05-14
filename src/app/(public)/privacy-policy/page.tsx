import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Cloud Stone Studio",
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: "#F0EEE9", minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "0 0 40px" }}>
        <object
          data="/Website%20Privacy%20Policy.pdf"
          type="application/pdf"
          style={{ width: "100%", height: "calc(100vh - 56px)", border: "none", display: "block" }}
        >
          <div style={{ padding: 40, textAlign: "center" }}>
            <a href="/Website%20Privacy%20Policy.pdf" target="_blank" rel="noopener noreferrer"
              style={{ color: "#392D2B", fontFamily: "var(--font-inter-tight,'Inter Tight',sans-serif)", fontSize: 14 }}>
              Open Privacy Policy PDF →
            </a>
          </div>
        </object>
      </div>
    </div>
  );
}
