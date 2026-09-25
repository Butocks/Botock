import { Metadata } from "next";
import MarkdownTableGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Markdown Table Generator Online - Visual Grid Editor | Botock",
  description:
    "Design and generate GitHub Flavored Markdown tables visually. Interactive spreadsheet grid with column alignment toggles, row insertion, and one-click copy.",
  keywords: [
    "markdown table generator",
    "markdown table creator",
    "gfm table editor",
    "table to markdown",
    "visual markdown grid",
  ],
  openGraph: {
    title: "Markdown Table Generator Online - Visual Grid Editor | Botock",
    description:
      "Design and generate GitHub Flavored Markdown tables visually.",
    type: "website",
  },
};

export default function MarkdownTableGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Markdown Table Generator",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Visual spreadsheet editor that generates GitHub-Flavored Markdown tables.",
  };

  return (
    <ToolErrorBoundary toolName="Markdown Table Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarkdownTableGeneratorClient />
    </ToolErrorBoundary>
  );
}
