import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Compare PDF Files Online Free - Side by Side Diff | Botock Tools",
  description:
    "Compare two PDF documents side by side online for free. Spot differences, revisions, altered text, and additions directly in your browser with zero server uploads.",
  keywords: [
    "compare pdf",
    "compare two pdf files",
    "pdf diff online",
    "pdf difference checker",
    "pdf revision compare",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/compare-pdf",
  },
  openGraph: {
    title: "Compare PDF Files Online Free - Botock Tools",
    description: "Compare two PDF documents side by side to detect text differences and revisions directly in your browser.",
    url: "https://botock.com/tools/compare-pdf",
    siteName: "Botock",
    type: "website",
  },
};

export default function ComparePdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Compare PDF - Botock Tools",
    url: "https://botock.com/tools/compare-pdf",
    description: "Compare two PDF documents side by side to detect changes and revisions directly in your browser.",
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
      <ToolErrorBoundary toolName="Compare PDF">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
