import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFPageDeleteClient = dynamic(() => import("./PDFPageDeleteClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Delete PDF Pages Online - Remove Unwanted Pages - Botock",
  description: "Select and delete specific pages from any PDF document in your browser. Fast, 100% private client-side processing.",
  openGraph: {
    title: "Delete PDF Pages Online - Botock",
    description: "Remove unwanted pages from your PDF documents client-side.",
  },
};

export default function PDFPageDeletePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Delete PDF Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Remove unwanted blank, confidential, or duplicate pages from your document. Processing runs 100% locally in your browser.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF Page Remover",
            "operatingSystem": "Web Browser",
            "applicationCategory": "UtilitiesApplication",
            "description": "Delete individual or groups of pages from a PDF file.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      <PDFPageDeleteClient />
    </div>
  );
}
