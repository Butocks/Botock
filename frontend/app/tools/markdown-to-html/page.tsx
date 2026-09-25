import { Metadata } from "next";
import MarkdownToHtmlClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Markdown to HTML Converter Online - Live Preview & HTML Code | Botock",
  description:
    "Convert Markdown syntax into clean HTML code with instant real-time live preview. Includes syntax-highlighted code blocks, tables, blockquotes, and one-click download.",
  keywords: [
    "markdown to html",
    "markdown converter",
    "markdown preview online",
    "md to html generator",
    "markdown compiler",
  ],
  openGraph: {
    title: "Markdown to HTML Converter Online - Live Preview & HTML Code | Botock",
    description:
      "Convert Markdown syntax into clean HTML code with instant real-time live preview.",
    type: "website",
  },
};

export default function MarkdownToHtmlPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Markdown to HTML Converter",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side Markdown to HTML converter with live interactive preview.",
  };

  return (
    <ToolErrorBoundary toolName="Markdown to HTML">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarkdownToHtmlClient />
    </ToolErrorBoundary>
  );
}
