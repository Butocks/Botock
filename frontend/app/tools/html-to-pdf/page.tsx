import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert HTML to PDF Online Free - Web Page & Code to PDF | Botock Tools",
  description:
    "Convert HTML code, web templates, CSS stylesheets, and tables into pixel-perfect PDF documents online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "html to pdf",
    "convert html to pdf free",
    "webpage to pdf",
    "css to pdf converter",
    "html invoice to pdf",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/html-to-pdf",
  },
  openGraph: {
    title: "Convert HTML to PDF Online Free - Botock Tools",
    description: "Render HTML templates, CSS styles, and web pages into PDF documents directly in your browser.",
    url: "https://botock.com/tools/html-to-pdf",
    siteName: "Botock",
    type: "website",
  },
};

export default function HtmlToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "HTML to PDF Converter - Botock Tools",
    url: "https://botock.com/tools/html-to-pdf",
    description: "Render HTML and CSS templates to printable PDF documents directly in your browser.",
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
      <ToolErrorBoundary toolName="HTML to PDF Converter">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}

