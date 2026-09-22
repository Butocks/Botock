import { Metadata } from "next";
import dynamic from "next/dynamic";
import { FileText, Server, ShieldCheck } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Word to PDF Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Word to PDF Converter - Convert DOCX & DOC to PDF Online | Botock",
  description:
    "Convert Microsoft Word DOCX and DOC documents into high-quality PDF files online. Fast, secure, and preserves formatting, styles, and layouts with backend processing.",
  keywords: [
    "Word to PDF",
    "DOCX to PDF",
    "DOC to PDF",
    "convert Word to PDF online",
    "free Word to PDF converter",
    "DOCX converter",
    "Word to PDF high quality",
    "Botock Word to PDF",
  ],
  openGraph: {
    title: "Word to PDF Converter - Convert DOCX & DOC to PDF Online | Botock",
    description:
      "Convert Word DOCX and DOC documents to portable PDF files online with high fidelity.",
    type: "website",
  },
};

export default function WordToPdfPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
          <Server className="w-3.5 h-3.5" />
          <span>Backend Powered • FastAPI</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Word to PDF Converter
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Transform your Microsoft Word documents (.docx, .doc) into high-fidelity PDF documents with exact typography, formatting, and layout retention.
        </p>
      </div>

      {/* JSON-LD SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Word to PDF Converter",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "description": "Convert Microsoft Word DOCX and DOC documents into clean, portable PDF files online.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      {/* Client Component */}
      <Client />

      {/* Feature Highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">High-Fidelity Rendering</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Preserves original fonts, tables, margins, headers, footers, and complex graphics with pixel precision.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Server-Side Conversion</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Powered by high-performance backend headless document engines capable of converting both modern DOCX and legacy DOC formats.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Secure &amp; Ephemeral</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Files are processed ephemerally in isolated temporary directories and automatically cleaned up immediately after conversion.
          </p>
        </div>
      </div>
    </div>
  );
}
