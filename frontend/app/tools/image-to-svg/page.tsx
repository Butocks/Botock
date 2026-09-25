import { Metadata } from "next";
import { Image as ImageIcon, ShieldCheck } from "lucide-react";
import ImageToSvgClient from "./Client";

export const metadata: Metadata = {
  title: "Convert Image to SVG Online Free - Vectorizer - Botock",
  description:
    "Convert PNG and JPG raster images into scalable, clean SVG vector graphics in your browser. 100% private, client-side vectorizer with customizable threshold and colors.",
  openGraph: {
    title: "Convert Image to SVG Online Free - Botock",
    description:
      "Vectorize PNG and JPG images to SVG with zero server uploads.",
    type: "website",
  },
  keywords: [
    "image to svg",
    "png to svg",
    "jpg to svg",
    "vectorizer",
    "convert image to vector",
    "free svg converter",
  ],
};

export default function ImageToSvgPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Image to SVG Vectorizer",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Convert bitmap images to scalable vector graphics directly in your browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Monochrome and multi-color vectorization",
      "Live vector SVG preview",
      "Instant SVG download and code copying",
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
          Image to SVG Vectorizer
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Trace and vectorize logos, sketches, and graphics into infinitely scalable SVG files with crisp vectors and small file sizes.
        </p>
      </div>

      <ImageToSvgClient />
    </div>
  );
}
