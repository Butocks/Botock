import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator Online Free - Beautify & Minify JSON | Botock Tools",
  description:
    "Format, validate, beautify, and minify JSON data online for free with syntax checking. Works directly in your browser with zero file uploads.",
  keywords: [
    "json formatter",
    "json validator online",
    "beautify json",
    "minify json free",
    "json syntax checker browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/json-formatter",
  },
  openGraph: {
    title: "JSON Formatter & Validator Online Free - Botock Tools",
    description: "Format, validate, and minify JSON code directly in your browser.",
    url: "https://botock.com/tools/json-formatter",
    siteName: "Botock",
    type: "website",
  },
};

export default function JsonFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JSON Formatter & Validator - Botock Tools",
    url: "https://botock.com/tools/json-formatter",
    description: "Format, validate, and minify JSON data directly in your browser.",
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
      <ToolErrorBoundary toolName="JSON Formatter & Validator">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
