import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Cloud Stone Studio",
};

export default function TermsPage() {
  return (
    <div style={{ background: "#F0EEE9", minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "0 0 40px" }}>
        <iframe
          src="/Website Terms of Service.pdf"
          style={{ width: "100%", height: "calc(100vh - 56px)", border: "none", display: "block" }}
          title="Terms of Service"
        />
      </div>
    </div>
  );
}
