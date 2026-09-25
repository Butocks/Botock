import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert PDF to PowerPoint Presentation (PPTX) Online Free | Botock Tools",
  description:
    "Convert your PDF documents into high-definition Microsoft PowerPoint (.pptx) presentation slides online for free. Works directly in your browser with zero file uploads for guaranteed privacy.",
  keywords: [
    "pdf to powerpoint",
    "pdf to pptx",
    "convert pdf to slides",
    "pdf to presentation free",
    "browser pdf to powerpoint",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-to-powerpoint",
  },
  openGraph: {
    title: "Convert PDF to PowerPoint Online Free - Botock Tools",
    description: "Convert PDF pages to Microsoft PowerPoint PPTX slides instantly in your browser.",
    url: "https://botock.com/tools/pdf-to-powerpoint",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfToPowerpointPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to PowerPoint Converter - Botock Tools",
    url: "https://botock.com/tools/pdf-to-powerpoint",
    description: "Convert PDF documents to Microsoft PowerPoint PPTX presentations directly in your browser.",
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
      <ToolErrorBoundary toolName="PDF to PowerPoint Converter">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
