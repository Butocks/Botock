import { Metadata } from "next";
import { FileText, ShieldCheck } from "lucide-react";
import ConvertDocumentClient from "./Client";

export const metadata: Metadata = {
  title: "Document Format Converter Online Free - DOCX, PDF, TXT, HTML - Botock",
  description:
    "Convert documents between PDF, Word DOCX, Plain Text, and HTML directly in your browser. 100% private, client-side document converter with zero server uploads.",
  openGraph: {
    title: "Document Format Converter Online Free - Botock",
    description:
      "Convert documents between PDF, DOCX, TXT, and HTML in your browser with zero server uploads.",
    type: "website",
  },
  keywords: [
    "document converter",
    "docx to pdf",
    "txt to pdf",
    "pdf to text",
    "free document converter",
    "browser document converter",
  ],
};

export default function ConvertDocumentPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Document Format Converter",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Convert documents between PDF, TXT, and HTML formats locally in your browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Convert DOCX, PDF, TXT, and HTML",
      "WASM in-browser PDF rendering",
      "100% Client-Side Privacy",
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-sky-500" />
          Document Format Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Convert Word documents, text notes, and web files to portable PDFs and text formats with instant browser processing.
        </p>
      </div>

      <ConvertDocumentClient />
    </div>
  );
}
