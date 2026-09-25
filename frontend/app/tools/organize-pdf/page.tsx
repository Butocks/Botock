import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Organize PDF Pages Online Free - Rearrange, Rotate, Delete | Botock Tools",
  description:
    "Organize PDF pages visually for free. Drag and drop to reorder, rotate individual pages, duplicate, or delete unwanted pages directly in your browser with zero server uploads.",
  keywords: [
    "organize pdf",
    "rearrange pdf pages",
    "reorder pdf pages",
    "rotate pdf pages",
    "delete pdf pages",
    "duplicate pdf page",
    "sort pdf pages online",
    "pdf organizer free",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/organize-pdf",
  },
  openGraph: {
    title: "Organize PDF Pages Online Free - Botock Tools",
    description: "Visually reorder, rotate, duplicate, and delete PDF pages directly in your browser.",
    url: "https://botock.com/tools/organize-pdf",
    siteName: "Botock",
    type: "website",
  },
};

export default function OrganizePdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Organize PDF - Botock Tools",
    url: "https://botock.com/tools/organize-pdf",
    description: "Visual PDF page organizer to reorder, rotate, duplicate, and remove pages in your browser.",
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
      <ToolErrorBoundary toolName="Organize PDF">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
