import { Metadata } from "next";
import { FileText, ShieldCheck } from "lucide-react";
import JpgToPdfClient from "./Client";

export const metadata: Metadata = {
  title: "Convert JPG to PDF Online Free - Merge Images to PDF - Botock",
  description:
    "Convert JPG, PNG, and WebP images into a single PDF file directly in your browser. Customize page orientation, margins, and document sizes with 100% privacy and zero server uploads.",
  openGraph: {
    title: "Convert JPG to PDF Online Free - Botock",
    description:
      "Convert and merge JPG and PNG images into a PDF document in your browser.",
    type: "website",
  },
  keywords: [
    "jpg to pdf",
    "png to pdf",
    "image to pdf",
    "convert photos to pdf",
    "free jpg to pdf converter",
    "combine images into pdf",
  ],
};

export default function JpgToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock JPG to PDF Converter",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Convert JPG, PNG, and WebP images into a single PDF document in the browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Custom page orientation (Portrait, Landscape, Auto)",
      "Standard sizes (A4, US Letter, Fit to image)",
      "Visual page reordering and margin control",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-amber-500" />
          Convert JPG to PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Combine, reorder, and convert multiple photos and scans into a single organized PDF document. Zero server uploads and zero file size limits.
        </p>
      </div>

      <JpgToPdfClient />
    </div>
  );
}
