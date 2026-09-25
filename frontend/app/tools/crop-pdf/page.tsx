import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Crop PDF Online Free - Trim PDF Margins & Pages | Botock Tools",
  description:
    "Crop PDF pages and trim margins visually online for free. Adjust margins per page or apply globally with interactive bounding boxes directly in your browser.",
  keywords: [
    "crop pdf",
    "trim pdf margins",
    "crop pdf pages free",
    "pdf margin trimmer",
    "crop pdf online",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/crop-pdf",
  },
  openGraph: {
    title: "Crop PDF Online Free - Botock Tools",
    description: "Visually crop PDF pages and trim margins directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/crop-pdf",
    siteName: "Botock",
    type: "website",
  },
};

export default function CropPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Crop PDF - Botock Tools",
    url: "https://botock.com/tools/crop-pdf",
    description: "Crop PDF margins and trim pages visually directly in your browser.",
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
      <ToolErrorBoundary toolName="Crop PDF">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
