import { Metadata } from "next";
import LoremIpsumGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator - Dummy Text & Placeholder Tool | Botock",
  description:
    "Generate custom Lorem Ipsum placeholder text by paragraphs, sentences, or words. Includes options to wrap in HTML paragraph tags.",
  keywords: [
    "lorem ipsum generator",
    "dummy text generator",
    "placeholder text",
    "lipsum generator",
    "html paragraph generator",
  ],
  openGraph: {
    title: "Lorem Ipsum Generator - Dummy Text & Placeholder Tool | Botock",
    description:
      "Generate custom Lorem Ipsum placeholder text by paragraphs, sentences, or words.",
    type: "website",
  },
};

export default function LoremIpsumGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lorem Ipsum Generator",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate custom Lorem Ipsum dummy text for mockups, prototypes, and web layouts.",
  };

  return (
    <ToolErrorBoundary toolName="Lorem Ipsum Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoremIpsumGeneratorClient />
    </ToolErrorBoundary>
  );
}
