import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert PDF to PDF/A Online Free - ISO Archival Standard | Botock Tools",
  description:
    "Convert PDF documents to ISO-compliant PDF/A-1b and PDF/A-2b format for long-term document archiving and legal compliance. 100% private in-browser conversion.",
  keywords: [
    "pdf to pdfa",
    "convert pdf to pdfa free",
    "iso 19005 pdf",
    "pdf archival format",
    "legal pdf archive",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-to-pdfa",
  },
  openGraph: {
    title: "Convert PDF to PDF/A Online Free - Botock Tools",
    description: "Convert PDF files into ISO 19005 compliant archival documents directly in your browser.",
    url: "https://botock.com/tools/pdf-to-pdfa",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfToPdfaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to PDF/A Converter - Botock Tools",
    url: "https://botock.com/tools/pdf-to-pdfa",
    description: "Convert PDF documents to long-term ISO archival standard directly in your browser.",
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
      <ToolErrorBoundary toolName="PDF to PDF/A Converter">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
