import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "AI PDF Document Summarizer & Intelligence Synthesizer | Botock",
  description:
    "Extract executive summaries, key directives, actionable obligations, and question-answer pairs from PDF documents directly in your browser with zero server uploads.",
  keywords: [
    "ai pdf summarizer",
    "summarize pdf online",
    "pdf summary tool",
    "executive pdf summary",
    "pdf document intelligence",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-ai-summarizer",
  },
  openGraph: {
    title: "AI PDF Document Summarizer - Botock",
    description: "Extract executive summaries and key takeaways from PDF documents directly in your browser.",
    url: "https://botock.com/tools/pdf-ai-summarizer",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfAiSummarizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI PDF Summarizer - Botock Tools",
    url: "https://botock.com/tools/pdf-ai-summarizer",
    description: "Summarize PDF documents and generate bullet points directly in your browser.",
    applicationCategory: "BusinessApplication",
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
      <ToolErrorBoundary toolName="AI PDF Summarizer">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
