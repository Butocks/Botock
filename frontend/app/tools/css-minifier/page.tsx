import { Metadata } from "next";
import CssMinifierClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "CSS Minifier Online - Compress & Optimize CSS Code | Botock",
  description:
    "Free online CSS minifier tool. Compress CSS files, strip comments, remove whitespace, and reduce file size with real-time compression ratio stats.",
  keywords: [
    "css minifier",
    "minify css online",
    "css compressor",
    "optimize css",
    "css clean",
  ],
  openGraph: {
    title: "CSS Minifier Online - Compress & Optimize CSS Code | Botock",
    description:
      "Compress CSS files, strip comments, remove whitespace, and reduce file size with real-time compression stats.",
    type: "website",
  },
};

export default function CssMinifierPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CSS Minifier",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side CSS stylesheet compression and minification utility.",
  };

  return (
    <ToolErrorBoundary toolName="CSS Minifier">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CssMinifierClient />
    </ToolErrorBoundary>
  );
}
