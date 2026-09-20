import { Metadata } from "next";
import { FileArchive, ShieldCheck } from "lucide-react";
import Client from "./Client";

export const metadata: Metadata = {
  title: "Compress PDF Online - Reduce PDF File Size Free - Botock",
  description:
    "Shrink and compress PDF file size securely in your browser. Downsample raster images and compact object streams locally with zero server uploads.",
  keywords: [
    "compress PDF",
    "reduce PDF file size",
    "shrink PDF online",
    "PDF compressor free",
    "client-side PDF compression",
    "downsample PDF images",
    "fast PDF reducer",
    "private PDF compress",
  ],
  openGraph: {
    title: "Compress PDF Online - Reduce PDF File Size Free - Botock",
    description:
      "Compress PDF files securely in your browser. Downsample embedded images with zero file uploads for 100% privacy.",
  },
};

export default function PdfCompressPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side • Private &amp; Secure</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileArchive className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Compress PDF Document
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Reduce PDF file size by intelligent image downsampling and object stream compaction.
          All operations run directly in your browser without uploading your documents to any server.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF Compressor",
            "operatingSystem": "Any",
            "applicationCategory": "UtilitiesApplication",
            "description":
              "Browser-based PDF compression utility to downsample raster images and compact PDF document streams locally.",
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
