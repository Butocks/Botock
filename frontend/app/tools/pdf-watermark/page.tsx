import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFWatermarkClient = dynamic(() => import("./PDFWatermarkClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Watermark PDF Online - Protect Documents - Botock",
  description: "Add custom text stamps, copyright notices, and watermarks to all PDF pages client-side with zero server uploads.",
  openGraph: {
    title: "Watermark PDF Online - Botock",
    description: "Add custom copyright text or image stamps to protect documents.",
  },
};

export default function PDFWatermarkPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Watermark PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Apply customized copyright text, draft markers, or confidentiality stamps across all pages securely in your browser.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF Watermarker",
            "operatingSystem": "Web Browser",
            "applicationCategory": "UtilitiesApplication",
            "description": "Add text watermarks to PDF files in the browser.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      <PDFWatermarkClient />
    </div>
  );
}
