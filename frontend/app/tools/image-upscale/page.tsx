import { Metadata } from "next";
import dynamic from "next/dynamic";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Image Upscaler...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "AI Image Upscaler & Resolution Enhancer Online - Botock",
  description: "Enlarge and enhance your images up to 4x resolution directly in your browser with multi-pass interpolation and sharpness enhancement. 100% private, free, and client-side.",
  openGraph: {
    title: "AI Image Upscaler - Botock",
    description: "Enlarge and enhance your images up to 4x resolution securely in your browser without uploading to any server.",
  },
};

export default function ImageUpscalePage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          AI Image Upscaler
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Enlarge and enhance your pictures up to 4x resolution instantly in your browser without losing quality. All image processing happens locally on your device for complete privacy.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock Image Upscaler",
            "operatingSystem": "Web Browser",
            "applicationCategory": "MultimediaApplication",
            "description": "Client-side image upscaling tool with multi-pass step scaling and sharpness enhancement.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      <Client />
    </div>
  );
}
