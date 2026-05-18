"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const STORAGE_KEY = "css_cookie_consent";

/**
 * Завантажує GTM тільки якщо:
 *  1. GTM_ID прописаний в env
 *  2. Користувач натиснув "Accept" в CookieBanner (або вже раніше)
 *
 * Слухає storage-подію — якщо банер приймається в іншій вкладці,
 * GTM підвантажиться і тут.
 */
export function GoogleTagManager() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => {
      setConsented(localStorage.getItem(STORAGE_KEY) === "accepted");
    };
    check();
    window.addEventListener("storage", check);
    // Також слухаємо кастомну подію від CookieBanner (в тій самій вкладці)
    window.addEventListener("css:cookie-accepted", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("css:cookie-accepted", check);
    };
  }, []);

  if (!GTM_ID || !consented) return null;

  return (
    <>
      {/* GTM script — завантажується після consent, strategy="afterInteractive" */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
      {/* GTM noscript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
