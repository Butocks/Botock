import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert Base64 to Image Online Free - Data URI to PNG/JPG | Botock Tools",
  description:
    "Convert Base64 strings and Data URIs into downloadable PNG, JPG, WebP, or SVG images online for free. Works directly in your browser with zero server uploads.",
  keywords: [
    "base64 to image",
    "convert base64 to png",
    "data uri to image online",
    "base64 decoder image free",
    "decode base64 photo",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/base64-to-image",
  },
  openGraph: {
    title: "Convert Base64 to Image Online Free - Botock Tools",
    description: "Decode Base64 strings and Data URIs into PNG, JPG, or WebP images directly in your browser.",
    url: "https://botock.com/tools/base64-to-image",
    siteName: "Botock",
    type: "website",
  },
};

export default function Base64ToImagePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Base64 to Image - Botock Tools",
    url: "https://botock.com/tools/base64-to-image",
    description: "Convert Base64 strings to downloadable images directly in your browser.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolErrorBoundary toolName="Base64 to Image">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
