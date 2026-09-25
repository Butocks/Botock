import { Metadata } from "next";
import UrlEncoderDecoderClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "URL Encoder & Decoder Online - Free RFC 3986 Tool | Botock",
  description:
    "Encode and decode URLs, query strings, and URI components in your browser. Real-time percent-encoding and instant string swapping.",
  keywords: [
    "url encoder",
    "url decoder",
    "encodeURIComponent tool",
    "percent encoding online",
    "uri decoder",
  ],
  openGraph: {
    title: "URL Encoder & Decoder Online - Free RFC 3986 Tool | Botock",
    description:
      "Encode and decode URLs, query strings, and URI components in your browser.",
    type: "website",
  },
};

export default function UrlEncoderDecoderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "URL Encoder & Decoder",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side RFC 3986 compliant URL encoder and decoder.",
  };

  return (
    <ToolErrorBoundary toolName="URL Encoder & Decoder">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UrlEncoderDecoderClient />
    </ToolErrorBoundary>
  );
}
