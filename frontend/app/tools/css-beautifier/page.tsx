import { Metadata } from "next";
import CssBeautifierClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "CSS Beautifier & Formatter Online - Clean Stylesheets | Botock",
  description:
    "Format and beautify unindented or minified CSS stylesheets. Configurable indentation (2 or 4 spaces) with instant one-click download.",
  keywords: [
    "css beautifier",
    "css formatter",
    "format css online",
    "clean css code",
    "unminify css",
  ],
  openGraph: {
    title: "CSS Beautifier & Formatter Online - Clean Stylesheets | Botock",
    description:
      "Format and beautify unindented or minified CSS stylesheets with zero latency.",
    type: "website",
  },
};

export default function CssBeautifierPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CSS Beautifier & Formatter",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side CSS stylesheet indentation and formatting utility.",
  };

  return (
    <ToolErrorBoundary toolName="CSS Beautifier">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CssBeautifierClient />
    </ToolErrorBoundary>
  );
}
