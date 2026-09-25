import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert PDF to JSON Online Free - Extract PDF Data | Botock Tools",
  description:
    "Convert PDF documents to structured JSON data online for free. Extract page text, document metadata, and coordinate layouts directly in your browser with zero server uploads.",
  keywords: [
    "pdf to json",
    "extract pdf to json",
    "convert pdf to json free",
    "pdf data extraction online",
    "pdf json schema browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-to-json",
  },
  openGraph: {
    title: "Convert PDF to JSON Online Free - Botock Tools",
    description: "Extract structured JSON text, pages, and metadata from PDF files directly in your browser.",
    url: "https://botock.com/tools/pdf-to-json",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfToJsonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to JSON Converter - Botock Tools",
    url: "https://botock.com/tools/pdf-to-json",
    description: "Extract structured JSON data and metadata from PDF documents directly in your browser.",
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
      <ToolErrorBoundary toolName="PDF to JSON Converter">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
