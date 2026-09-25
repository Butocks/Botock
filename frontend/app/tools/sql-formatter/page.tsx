import { Metadata } from "next";
import SqlFormatterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "SQL Formatter & Beautifier Online - Clean SQL Queries | Botock",
  description:
    "Format, indent, and beautify messy SQL queries in your browser. Automatic keyword capitalization, clause line-breaks, and instant file download.",
  keywords: [
    "sql formatter",
    "beautify sql",
    "sql query cleaner",
    "format sql online",
    "sql indent tool",
  ],
  openGraph: {
    title: "SQL Formatter & Beautifier Online - Clean SQL Queries | Botock",
    description:
      "Format, indent, and beautify messy SQL queries in your browser.",
    type: "website",
  },
};

export default function SqlFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SQL Formatter & Beautifier",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side SQL query formatter with keyword case formatting.",
  };

  return (
    <ToolErrorBoundary toolName="SQL Formatter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SqlFormatterClient />
    </ToolErrorBoundary>
  );
}
