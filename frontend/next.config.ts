import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.105", "192.168.*", "localhost", "127.0.0.1"],
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    resolveAlias: {
      canvas: "./lib/shims/canvas.ts",
    },
  },
  async redirects() {
    return [
      {
        source: "/terms-of-service",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/tos",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/refund-policy",
        destination: "/refund",
        permanent: true,
      },
      {
        source: "/cancellation-policy",
        destination: "/refund",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Do not ship a fallback Azure IP in the public build. A missing deployment
    // secret must fail closed instead of silently proxying user data elsewhere.
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return [];
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendUrl.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Next.js needs inline bootstrap styles/scripts. All other
            // resource classes are restricted to known safe schemes.
            key: "Content-Security-Policy",
            value: "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' blob: https:; media-src 'self' blob: https:; worker-src 'self' blob:; frame-src 'self' https://accounts.google.com; upgrade-insecure-requests",
          },
          {
            // The public HTML site has no cross-origin API use. A wildcard
            // unnecessarily lets arbitrary sites read browser-visible output.
            key: "Access-Control-Allow-Origin",
            value: "https://botock.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
