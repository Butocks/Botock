import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert PDF to Markdown Online Free - Extract Text to .md | Botock Tools",
  description:
    "Convert PDF files to clean Markdown (.md) formatted text online for free. Automatically detects headings, paragraph breaks, and lists. 100% private in-browser extraction.",
  keywords: [
    "pdf to markdown",
    "pdf to md",
    "extract text to markdown",
    "convert pdf to markdown free",
    "pdf text extractor browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-to-markdown",
  },
  openGraph: {
    title: "Convert PDF to Markdown Online Free - Botock Tools",
    description: "Extract structured headings and clean markdown from PDF documents directly in your browser.",
    url: "https://botock.com/tools/pdf-to-markdown",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfToMarkdownPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to Markdown Converter - Botock Tools",
    url: "https://botock.com/tools/pdf-to-markdown",
    description: "Convert PDF documents to clean Markdown format directly in your browser.",
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
      <ToolErrorBoundary toolName="PDF to Markdown Converter">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
