import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

const ImageCompressClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading Compression Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Compress Image Online - Reduce File Size Instantly - Botock",
  description:
    "Quickly compress JPG, PNG, and WebP images in your browser without losing quality. 100% private, client-side Web Worker image compression.",
  openGraph: {
    title: "Compress Image Online - Botock",
    description:
      "Secure, high-performance in-browser image compression tool. Free, zero server uploads, unlimited use.",
    type: "website",
  },
  keywords: [
    "image compressor",
    "compress jpg",
    "compress png",
    "compress webp",
    "reduce image file size",
    "browser image compression",
    "client-side image optimizer"
  ],
};

export default function ImageCompressPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Image Compressor",
    "operatingSystem": "Web Browser",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Free in-browser image compression tool. Drastically reduces JPG, PNG, and WebP image sizes securely without uploading files to remote servers.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Target maximum file size in MB or KB",
      "Adjustable quality slider (1% to 100%)",
      "Optional max dimension constraint",
      "Multi-threaded Web Worker compression",
      "Zero server uploads - 100% private"
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> 100% Client-Side Web Worker
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Compress Image Online
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Reduce JPG, PNG, and WebP file sizes instantly with smart client-side compression. No files are ever sent to a server.
        </p>
      </div>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <ImageCompressClient />
    </div>
  );
}
