import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "AI PDF Summarizer Online Free - Summarize PDF Documents | Botock Tools",
  description:
    "Summarize long PDF documents, research papers, and reports into key bullet points and executive summaries online for free. Works directly in your browser with zero server uploads.",
  keywords: [
    "ai pdf summarizer",
    "summarize pdf online free",
    "pdf summary tool",
    "condense pdf to bullet points",
    "free ai pdf reader",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-ai-summarizer",
  },
  openGraph: {
    title: "AI PDF Summarizer Online Free - Botock Tools",
    description: "Extract key takeaways and bullet points from PDF documents directly in your browser.",
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
