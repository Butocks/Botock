import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "XML Formatter & Beautifier Online Free - Validate & Clean XML/SVG | Botock Tools",
  description:
    "Format, validate, beautify, and minify XML and SVG code online for free with syntax verification. Works directly in your browser with zero file uploads.",
  keywords: [
    "xml formatter",
    "xml beautifier online free",
    "format svg online",
    "xml validator browser",
    "minify xml free",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/xml-formatter",
  },
  openGraph: {
    title: "XML Formatter & Beautifier Online Free - Botock Tools",
    description: "Format, validate, and minify XML and SVG markup directly in your browser.",
    url: "https://botock.com/tools/xml-formatter",
    siteName: "Botock",
    type: "website",
  },
};

export default function XmlFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "XML Formatter & Beautifier - Botock Tools",
    url: "https://botock.com/tools/xml-formatter",
    description: "Format, validate, and minify XML data directly in your browser.",
    applicationCategory: "DeveloperApplication",
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
      <ToolErrorBoundary toolName="XML Formatter & Beautifier">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
