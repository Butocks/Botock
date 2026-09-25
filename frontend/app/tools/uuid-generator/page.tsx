import { Metadata } from "next";
import UuidGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Bulk UUID v4 Generator Online - Free RFC 4122 Tool | Botock",
  description:
    "Generate random, cryptographically secure UUID version 4 identifiers in bulk. Customizable hyphens, uppercase formatting, and instant batch download.",
  keywords: [
    "uuid generator",
    "uuid v4 online",
    "bulk uuid generator",
    "guid generator",
    "random uuid creator",
  ],
  openGraph: {
    title: "Bulk UUID v4 Generator Online - Free RFC 4122 Tool | Botock",
    description:
      "Generate random, cryptographically secure UUID version 4 identifiers in bulk.",
    type: "website",
  },
};

export default function UuidGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "UUID v4 Generator",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side cryptographically secure UUID v4 generator.",
  };

  return (
    <ToolErrorBoundary toolName="UUID Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UuidGeneratorClient />
    </ToolErrorBoundary>
  );
}
