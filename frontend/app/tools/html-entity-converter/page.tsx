import { Metadata } from "next";
import HtmlEntityConverterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "HTML Entity Encoder & Decoder Online - Free Utility | Botock",
  description:
    "Encode special characters into HTML entities (named, decimal, hex) or decode escaped entities back to normal text. Pure browser-side processing.",
  keywords: [
    "html entity encoder",
    "html entity decoder",
    "escape html characters",
    "unescape html",
    "html special characters",
  ],
  openGraph: {
    title: "HTML Entity Encoder & Decoder Online - Free Utility | Botock",
    description:
      "Encode special characters into HTML entities or decode escaped entities back to normal text.",
    type: "website",
  },
};

export default function HtmlEntityConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HTML Entity Encoder & Decoder",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side HTML entity encoder and decoder supporting named, decimal, and hexadecimal formats.",
  };

  return (
    <ToolErrorBoundary toolName="HTML Entity Converter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HtmlEntityConverterClient />
    </ToolErrorBoundary>
  );
}
