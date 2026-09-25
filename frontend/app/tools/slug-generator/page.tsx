import { Metadata } from "next";
import SlugGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "SEO Friendly Slug Generator Online | Botock",
  description:
    "Convert any title or text into clean, SEO-optimized, URL-friendly permalinks. Custom delimiters, stop words removal, and accent stripping.",
  keywords: [
    "slug generator",
    "url slug creator",
    "permalink generator",
    "seo friendly url",
    "url clean tool",
  ],
  openGraph: {
    title: "SEO Friendly Slug Generator Online | Botock",
    description:
      "Convert any title or text into clean, SEO-optimized, URL-friendly permalinks.",
    type: "website",
  },
};

export default function SlugGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SEO Slug Generator",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate clean, SEO-optimized permalink slugs from text and blog headlines.",
  };

  return (
    <ToolErrorBoundary toolName="Slug Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SlugGeneratorClient />
    </ToolErrorBoundary>
  );
}
