import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.elfsight.com https://apps.elfsight.com https://elfsightcdn.com https://unpkg.com https://cdnjs.cloudflare.com",
      "frame-src 'self' https://*.elfsight.com",
      "img-src 'self' data: https: blob:",
      "style-src 'self' 'unsafe-inline' https://static.elfsight.com https://elfsightcdn.com",
      "connect-src 'self' https://static.elfsight.com https://api.elfsight.com https://elfsightcdn.com https://core.service.elfsight.com https://*.elfsight.com https://*.supabase.co https://cdnjs.cloudflare.com https://*.public.blob.vercel-storage.com",
      "worker-src 'self' blob: https://cdnjs.cloudflare.com https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
