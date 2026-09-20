import { Metadata } from "next";
import dynamic from "next/dynamic";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Image Resizer...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Resize Image Online - Free & Fast Image Resizer - Botock",
  description: "Resize JPG, PNG, and WEBP images online in your browser. Fast, free, client-side image scaling with exact pixel dimensions or percentage without uploading to any server.",
  openGraph: {
    title: "Resize Image Online - Botock",
    description: "Secure, in-browser image resizing tool. Maintain aspect ratio or scale by percentage with 100% privacy.",
  },
};

export default function ImageResizePage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Resize Image
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Resize pictures by exact dimensions or percentage. All image processing happens instantly in your browser to protect your privacy.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock Image Resizer",
            "operatingSystem": "Web Browser",
            "applicationCategory": "MultimediaApplication",
            "description": "Browser-based image resizing utility with pixel and percentage scaling.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      <Client />
    </div>
  );
}
