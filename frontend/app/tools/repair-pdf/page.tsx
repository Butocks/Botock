import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Repair Corrupted PDF Online Free - Fix Damaged PDF Files | Botock Tools",
  description:
    "Repair damaged, unreadable, or corrupted PDF files online for free. Rebuild cross-reference tables and corrupt byte streams directly in your browser with zero file uploads.",
  keywords: [
    "repair pdf",
    "fix corrupted pdf",
    "recover damaged pdf",
    "repair pdf online free",
    "pdf file recovery browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/repair-pdf",
  },
  openGraph: {
    title: "Repair Corrupted PDF Online Free - Botock Tools",
    description: "Rebuild and recover damaged or broken PDF files directly in your browser.",
    url: "https://botock.com/tools/repair-pdf",
    siteName: "Botock",
    type: "website",
  },
};

export default function RepairPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Repair PDF - Botock Tools",
    url: "https://botock.com/tools/repair-pdf",
    description: "Recover and repair corrupt PDF documents directly in your browser.",
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
      <ToolErrorBoundary toolName="Repair PDF">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
