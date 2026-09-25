import { Metadata } from "next";
import TextSorterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Text & List Sorter Online - A to Z, Numeric, Length | Botock",
  description:
    "Sort text lists alphabetically, naturally (1, 2, 10), by line length, reverse, or shuffle randomly. 100% free client-side execution.",
  keywords: [
    "text sorter",
    "alphabetical sorter",
    "sort list online",
    "natural sort tool",
    "line length sort",
    "shuffle list",
  ],
  openGraph: {
    title: "Text & List Sorter Online - A to Z, Numeric, Length | Botock",
    description:
      "Sort text lists alphabetically, naturally, by line length, reverse, or shuffle randomly.",
    type: "website",
  },
};

export default function TextSorterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Text & List Sorter",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side list and text sorting utility with natural and length sorting.",
  };

  return (
    <ToolErrorBoundary toolName="Text Sorter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TextSorterClient />
    </ToolErrorBoundary>
  );
}
