import { Metadata } from "next";
import { FileArchive, ShieldCheck } from "lucide-react";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "Create ZIP File Online Free - Secure ZIP Compressor - Botock",
  description: "Compress multiple files and folders into a single ZIP archive locally in your browser. 100% private, fast, and secure with zero server uploads.",
  openGraph: {
    title: "Create ZIP File Online Free - Botock",
    description: "Compress files into a ZIP archive instantly in your browser.",
  },
};

export default function ZipCompressorPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Local & Secure Processing</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileArchive className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            ZIP File Compressor
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Bundle and compress multiple files into a single ZIP archive to save space and share easily.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock ZIP Compressor",
            "operatingSystem": "Web Browser",
            "applicationCategory": "UtilitiesApplication",
            "description": "Compress multiple files into a ZIP archive securely in the browser.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      {/* Ab hum yahan ClientWrapper call kar rahe hain jo safely SSR handle karega */}
      <ClientWrapper />
    </div>
  );
}