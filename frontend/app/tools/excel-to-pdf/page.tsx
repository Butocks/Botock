import type { Metadata } from "next";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert Excel to PDF Online Free - XLSX, XLS & CSV to PDF | Botock Tools",
  description:
    "Convert Excel workbooks (XLSX, XLS, CSV) into clean, printable PDF documents online for free. Auto-fit table layouts, landscape formatting, and 100% private in-browser conversion.",
  keywords: [
    "excel to pdf",
    "convert xlsx to pdf free",
    "spreadsheet to pdf",
    "csv to pdf table",
    "excel to pdf converter browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/excel-to-pdf",
  },
  openGraph: {
    title: "Convert Excel to PDF Online Free - Botock Tools",
    description: "Convert Excel spreadsheets to printable PDF documents directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/excel-to-pdf",
    siteName: "Botock",
    type: "website",
  },
};

export default function ExcelToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Excel to PDF Converter - Botock Tools",
    url: "https://botock.com/tools/excel-to-pdf",
    description: "Convert Excel spreadsheets to clean PDF documents directly in your browser.",
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
      <ToolErrorBoundary toolName="Excel to PDF Converter">
        <ClientWrapper />
      </ToolErrorBoundary>
    </>
  );
}
