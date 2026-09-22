import { Metadata } from "next";
import dynamic from "next/dynamic";
import { FileText, Server } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading PDF to Word Conversion Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "PDF to Word Converter - Convert PDF to DOCX Online | Botock",
  description:
    "Convert PDF documents to editable Microsoft Word (DOCX) files online. Fast, secure, and preserves fonts, tables, and layouts.",
  keywords: [
    "PDF to Word",
    "convert PDF to DOCX",
    "PDF to Word converter online",
    "editable Word from PDF",
    "free PDF to Word",
    "Botock document tools",
    "PDF to Office converter",
  ],
  openGraph: {
    title: "PDF to Word Converter - Convert PDF to DOCX Online | Botock",
    description:
      "Convert PDF documents to editable Microsoft Word (DOCX) files online. Fast, secure, and preserves formatting.",
    type: "website",
  },
};

export default function PdfToWordPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF to Word Converter",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    description:
      "Convert PDF documents into editable Microsoft Word DOCX files with high formatting accuracy.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <Server className="w-4 h-4" />
          <span>Backend Powered • FastAPI</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            PDF to Word Converter
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Transform your PDF files into editable Microsoft Word documents (.docx).
          Preserves original formatting, tables, text styles, and layout structure with high accuracy.
        </p>
      </div>

      {/* JSON-LD Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* Client Component */}
      <Client />
    </div>
  );
}
