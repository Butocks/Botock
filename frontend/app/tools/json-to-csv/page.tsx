import { Metadata } from "next";
import JsonToCsvClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "JSON to CSV Converter Online - Export to Spreadsheet | Botock",
  description:
    "Convert JSON arrays of objects to CSV or TSV spreadsheets directly in your browser. Automatic header detection, quotation handling, and instant file download.",
  keywords: [
    "json to csv",
    "convert json to csv online",
    "json to excel",
    "json to tsv",
    "export json to spreadsheet",
  ],
  openGraph: {
    title: "JSON to CSV Converter Online - Export to Spreadsheet | Botock",
    description:
      "Convert JSON arrays of objects to CSV or TSV spreadsheets directly in your browser.",
    type: "website",
  },
};

export default function JsonToCsvPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JSON to CSV Converter",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side JSON array to CSV and TSV tabular data exporter.",
  };

  return (
    <ToolErrorBoundary toolName="JSON to CSV">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JsonToCsvClient />
    </ToolErrorBoundary>
  );
}
