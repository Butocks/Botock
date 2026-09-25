import { Metadata } from "next";
import { Image as ImageIcon, ShieldCheck } from "lucide-react";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "Convert PDF to JPG Online Free - High Resolution (300 DPI) - Botock",
  description:
    "Convert PDF pages into high-resolution JPG images directly in your browser. Choose between 150 DPI and 300 DPI, preview pages, and download single images or a ZIP archive.",
  openGraph: {
    title: "Convert PDF to JPG Online Free - Botock",
    description:
      "Convert PDF pages to JPG images in your browser with zero server uploads.",
    type: "website",
  },
  keywords: [
    "pdf to jpg",
    "pdf to jpeg",
    "convert pdf to images",
    "extract images from pdf",
    "pdf to jpg 300 dpi",
    "free pdf to jpg",
  ],
};

export default function PdfToJpgPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock PDF to JPG Converter",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Convert PDF documents into high-resolution JPG images locally in your browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "150 DPI and 300 DPI high-definition rendering",
      "Visual page selection and reordering",
      "Single JPG download or ZIP archive",
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
          <ImageIcon className="w-8 h-8 text-amber-500" />
          Convert PDF to JPG
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Extract every page of your PDF as high-resolution JPG images. Select individual pages or convert entire documents into a zip archive with zero server uploads.
        </p>
      </div>

      <ClientWrapper />
    </div>
  );
}
