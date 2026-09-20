import { Metadata } from "next";
import dynamic from "next/dynamic";

const ImageRemoveBgClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading AI Removal Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "AI Background Remover Online - Botock",
  description: "Instantly remove backgrounds from images online using client-side AI. 100% private, free, and runs entirely in your browser with zero server uploads.",
  openGraph: {
    title: "AI Background Remover Online - Botock",
    description: "Remove image backgrounds with local neural networks directly in your browser. 100% secure and private.",
  },
};

export default function ImageRemoveBgPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          AI Background Remover
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Automatically isolate subjects and cut out backgrounds with in-browser neural networks. All processing happens locally on your device for absolute data privacy.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock AI Background Remover",
            "operatingSystem": "Web Browser",
            "applicationCategory": "MultimediaApplication",
            "description": "Client-side AI tool to remove image backgrounds directly in the browser with total privacy.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      <ImageRemoveBgClient />
    </div>
  );
}
