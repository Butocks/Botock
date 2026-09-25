import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online Free - Botock Tools",
  description:
    "Easily add page numbers, headers, and footers to your PDF document online for free. Custom positions, fonts, page ranges, and formats directly in your browser without uploading to any server.",
  keywords: [
    "add page numbers to pdf",
    "pdf page numbering",
    "number pdf pages free",
    "header footer pdf",
    "pdf pagination online",
    "page numbers pdf browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-page-numbers",
  },
  openGraph: {
    title: "Add Page Numbers to PDF Online Free - Botock Tools",
    description: "Custom page numbers, headers, and footers in your PDF with instant browser processing.",
    url: "https://botock.com/tools/pdf-page-numbers",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfPageNumbersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Add Page Numbers to PDF - Botock Tools",
    url: "https://botock.com/tools/pdf-page-numbers",
    description: "Add page numbers, headers, and footers to PDF documents directly inside your browser.",
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
      <ToolErrorBoundary toolName="Add Page Numbers to PDF">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
