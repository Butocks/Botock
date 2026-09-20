import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScanText, ShieldCheck } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading PDF OCR Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "PDF OCR - Extract Text from Scanned PDFs Online Free - Botock",
  description:
    "Extract editable text and copy text from scanned PDF files directly in your browser. 100% client-side Optical Character Recognition (OCR) with zero server uploads.",
  keywords: [
    "PDF OCR",
    "extract text from PDF",
    "scanned PDF to text",
    "free PDF OCR online",
    "client-side OCR",
    "browser PDF OCR",
    "Tesseract PDF OCR",
    "convert PDF to text",
  ],
  openGraph: {
    title: "PDF OCR - Extract Text from Scanned PDFs Free - Botock",
    description:
      "Client-side Optical Character Recognition for scanned PDFs. Extract text securely in your browser with zero server uploads.",
  },
};

export default function PdfOcrPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side • Private &amp; Secure</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <ScanText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            PDF OCR Text Extractor
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Extract plain, editable text from scanned documents and images within your PDF.
          Everything runs entirely inside your browser via WebAssembly — your documents never leave your device.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF OCR Text Extractor",
            "operatingSystem": "Any",
            "applicationCategory": "UtilitiesApplication",
            "description":
              "Browser-based PDF Optical Character Recognition (OCR) utility to extract editable text from scanned PDF documents.",
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
    </div>
  );
}
