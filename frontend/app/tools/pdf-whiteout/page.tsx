import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Whiteout & Redact PDF Online Free - Erase Text & Data | Botock Tools",
  description:
    "Whiteout or redact confidential text, bank details, and sensitive information from PDF files online for free. Drag and drop to erase with permanent client-side vector redactions.",
  keywords: [
    "whiteout pdf",
    "redact pdf",
    "erase text pdf",
    "pdf blackout online free",
    "hide sensitive text pdf",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-whiteout",
  },
  openGraph: {
    title: "Whiteout & Redact PDF Online Free - Botock Tools",
    description: "Permanently erase or redact confidential information from PDF documents directly in your browser.",
    url: "https://botock.com/tools/pdf-whiteout",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfWhiteoutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Whiteout & Redaction - Botock Tools",
    url: "https://botock.com/tools/pdf-whiteout",
    description: "Permanently whiteout or blackout sensitive information from PDF documents in your browser.",
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
      <ToolErrorBoundary toolName="PDF Whiteout & Redaction">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
