import { Metadata } from "next";
import CsvToJsonClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "CSV to JSON Converter Online - Free Table Data Tool | Botock",
  description:
    "Convert CSV and TSV spreadsheets to JSON objects or 2D arrays in your browser. Supports quotation escaping, custom delimiters, number parsing, and instant download.",
  keywords: [
    "csv to json",
    "convert csv to json online",
    "tsv to json",
    "csv parser",
    "spreadsheet to json",
  ],
  openGraph: {
    title: "CSV to JSON Converter Online - Free Table Data Tool | Botock",
    description:
      "Convert CSV and TSV spreadsheets to JSON objects or 2D arrays in your browser.",
    type: "website",
  },
};

export default function CsvToJsonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CSV to JSON Converter",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side CSV and TSV table parser converting to JSON objects.",
  };

  return (
    <ToolErrorBoundary toolName="CSV to JSON">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CsvToJsonClient />
    </ToolErrorBoundary>
  );
}
