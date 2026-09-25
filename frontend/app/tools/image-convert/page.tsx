import { Metadata } from "next";
import { Image as ImageIcon, ShieldCheck } from "lucide-react";
import ImageConvertClient from "./Client";

export const metadata: Metadata = {
  title: "Convert Image Online Free - WebP, PNG, JPG Converter - Botock",
  description:
    "Batch convert images between WebP, PNG, and JPG directly in your browser. Fast, client-side, zero server uploads with customizable compression quality.",
  openGraph: {
    title: "Convert Image Online Free - Botock",
    description:
      "Batch convert images between WebP, PNG, and JPG with zero server uploads.",
    type: "website",
  },
  keywords: [
    "image converter",
    "png to webp",
    "jpg to webp",
    "png to jpg",
    "webp to png",
    "batch image converter",
    "free image converter",
  ],
};

export default function ImageConvertPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Image Converter",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Convert images between WebP, PNG, and JPG formats locally in your browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Batch convert multiple images at once",
      "Custom quality control slider",
      "Transparency background fill for JPG",
      "ZIP download for converted batch",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-emerald-500" />
          Image Format Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Convert your photos and graphics to lightweight WebP, transparent PNG, or high-compatibility JPG with instant browser processing.
        </p>
      </div>

      <ImageConvertClient />
    </div>
  );
}
