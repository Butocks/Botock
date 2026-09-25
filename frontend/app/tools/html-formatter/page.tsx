import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "HTML Formatter & Beautifier Online Free - Clean & Minify HTML | Botock Tools",
  description:
    "Format, beautify, indent, and minify HTML code online for free. Works directly in your browser with zero file uploads and zero server storage.",
  keywords: [
    "html formatter",
    "html beautifier free online",
    "format html code",
    "minify html online",
    "clean html tags browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/html-formatter",
  },
  openGraph: {
    title: "HTML Formatter & Beautifier Online Free - Botock Tools",
    description: "Format, beautify, and minify HTML markup directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/html-formatter",
    siteName: "Botock",
    type: "website",
  },
};

export default function HtmlFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "HTML Formatter & Beautifier - Botock Tools",
    url: "https://botock.com/tools/html-formatter",
    description: "Format and beautify HTML code directly in your browser.",
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
      <ToolErrorBoundary toolName="HTML Formatter & Beautifier">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
