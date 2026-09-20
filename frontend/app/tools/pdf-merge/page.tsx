import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFMergeClient = dynamic(() => import("./PDFMergeClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Merge PDF Files Online - Botock",
  description: "Merge multiple PDF files into a single document instantly in your browser. 100% secure, no files uploaded to servers.",
  openGraph: {
    title: "Merge PDF Files Online - Botock",
    description: "Merge multiple PDF files into a single document instantly in your browser.",
  },
};

export default function PDFMergePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Merge PDF Files
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Combine multiple PDFs into a single document. Processing happens entirely in your browser using WASM, meaning your files are never uploaded to our servers.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF Merger",
            "operatingSystem": "Web Browser",
            "applicationCategory": "UtilitiesApplication",
            "description": "Merge multiple PDF files into a single document in the browser.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      {/* Client-side processing component */}
      <PDFMergeClient />
    </div>
  );
}
