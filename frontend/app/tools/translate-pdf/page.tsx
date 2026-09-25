import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Translate PDF Online Free - Multi-Language PDF Translator | Botock Tools",
  description:
    "Extract and translate PDF document text into over 12+ international languages online for free. Works directly in your browser with zero document file uploads.",
  keywords: [
    "translate pdf",
    "pdf translator online free",
    "translate english pdf to spanish",
    "pdf language translator",
    "extract and translate pdf",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/translate-pdf",
  },
  openGraph: {
    title: "Translate PDF Online Free - Botock Tools",
    description: "Translate PDF document text into 12+ languages directly in your browser.",
    url: "https://botock.com/tools/translate-pdf",
    siteName: "Botock",
    type: "website",
  },
};

export default function TranslatePdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Translator - Botock Tools",
    url: "https://botock.com/tools/translate-pdf",
    description: "Translate PDF text into 12+ languages directly in your browser.",
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
      <ToolErrorBoundary toolName="PDF Translator">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
