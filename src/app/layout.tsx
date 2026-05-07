import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Inter_Tight } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LenisProvider } from "@/components/layout/LenisProvider";
import { Preloader } from "@/components/layout/Preloader";
import { PageTransitionOverlay } from "@/components/layout/PageTransitionOverlay";
import { TransitionProvider } from "@/lib/transitionContext";
import { CustomCursor } from "@/components/ui/CustomCursor";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://cloudstonestudio.com"
  ),
  title: {
    default: "Cloud Stone Studio",
    template: "%s — Cloud Stone Studio",
  },
  description:
    "Cloud Stone Studio — we think like craftsmen and design like storytellers. Premium interior design and architecture studio.",
  openGraph: {
    siteName: "Cloud Stone Studio",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${interTight.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#F6F5F2] text-[#392D2B] antialiased">
        <CustomCursor />
        <Preloader />
        <TransitionProvider>
          <PageTransitionOverlay />
          <LenisProvider>
            {children}
          </LenisProvider>
        </TransitionProvider>
        {/* Elfsight — weather widget platform (loaded once globally) */}
        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
        />
        {/* Hide Elfsight free-tier branding link via MutationObserver */}
        <Script id="hide-elfsight-branding" strategy="afterInteractive">{`
          (function () {
            function hide(el) {
              el.style.setProperty('display', 'none', 'important');
            }
            function scan() {
              document.querySelectorAll('a[href*="elfsight.com/weather-widget"]').forEach(hide);
            }
            scan();
            var obs = new MutationObserver(scan);
            obs.observe(document.body, { childList: true, subtree: true });
          })();
        `}</Script>
      </body>
    </html>
  );
}
