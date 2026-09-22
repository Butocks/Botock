import { Metadata } from "next";
import dynamic from "next/dynamic";
import { FileSpreadsheet, Server } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Excel Conversion Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "PDF to Excel Converter - Extract Tables from PDF to XLSX | Botock",
  description: "Convert PDF documents to Microsoft Excel spreadsheets online for free. Extract tabular data directly into formatted XLSX workbooks with high accuracy.",
  keywords: [
    "pdf to excel",
    "pdf to xlsx",
    "extract tables from pdf",
    "convert pdf to spreadsheet",
    "pdf table extractor",
    "botock"
  ],
  openGraph: {
    title: "PDF to Excel Converter - Extract Tables from PDF to XLSX | Botock",
    description: "Extract spreadsheet tables from PDF documents into Microsoft Excel XLSX workbooks instantly.",
  },
};

export default function PdfToExcelPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header with badge, title and description */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
          <Server className="w-3.5 h-3.5" />
          <span>Backend Powered • FastAPI</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            PDF to Excel Converter
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Extract tabular data and spreadsheets from your PDF documents into formatted Microsoft Excel (.xlsx) workbooks.
        </p>
      </div>

      {/* JSON-LD SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PDF to Excel Converter",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "description": "Extract spreadsheet tables from PDF documents into Microsoft Excel XLSX workbooks.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      <Client />
    </div>
  );
}
