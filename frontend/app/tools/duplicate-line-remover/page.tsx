import { Metadata } from "next";
import DuplicateLineRemoverClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Remove Duplicate Lines Online - Free Text Cleaner Tool | Botock",
  description:
    "Remove duplicate lines from text, lists, and CSV data. Features case sensitivity toggle, whitespace trimming, empty line removal, and alphabetical sorting.",
  keywords: [
    "duplicate line remover",
    "remove duplicate lines",
    "text deduplication",
    "clean list online",
    "unique lines filter",
  ],
  openGraph: {
    title: "Remove Duplicate Lines Online - Free Text Cleaner Tool | Botock",
    description:
      "Remove duplicate lines from text, lists, and CSV data instantly in your browser.",
    type: "website",
  },
};

export default function DuplicateLineRemoverPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Duplicate Line Remover",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side text line deduplication utility with whitespace trimming and sorting options.",
  };

  return (
    <ToolErrorBoundary toolName="Duplicate Line Remover">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DuplicateLineRemoverClient />
    </ToolErrorBoundary>
  );
}
