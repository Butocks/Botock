import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Create Fillable PDF Forms Online Free - AcroForm Builder | Botock Tools",
  description:
    "Add fillable text fields, checkboxes, and interactive AcroForm elements to static PDF documents online for free. Works directly in your browser with zero server uploads.",
  keywords: [
    "create fillable pdf forms",
    "pdf form builder free",
    "add text box to pdf form",
    "make pdf fillable online",
    "interactive acroform generator",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/pdf-forms",
  },
  openGraph: {
    title: "Create Fillable PDF Forms Online Free - Botock Tools",
    description: "Add interactive text fields and checkboxes to PDF documents directly in your browser.",
    url: "https://botock.com/tools/pdf-forms",
    siteName: "Botock",
    type: "website",
  },
};

export default function PdfFormsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Fillable PDF Form Builder - Botock Tools",
    url: "https://botock.com/tools/pdf-forms",
    description: "Create fillable PDF forms with text fields and checkboxes directly in your browser.",
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
      <ToolErrorBoundary toolName="Fillable PDF Form Builder">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
