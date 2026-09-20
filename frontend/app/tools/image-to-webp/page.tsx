import { Metadata } from "next";
import dynamic from "next/dynamic";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading WebP Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Image to WebP Converter Online - Free & Private | Botock",
  description:
    "Convert PNG, JPG, GIF, and BMP images to modern lightweight WebP format securely in your browser. 100% private with no server uploads.",
  openGraph: {
    title: "Image to WebP Converter Online - Botock",
    description:
      "Convert your images to modern WebP format instantly in your browser with zero server uploads.",
  },
};

export default function ImageToWebPPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Image to WebP Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Convert your images to lightweight, next-generation WebP files to speed up web page loads while maintaining high visual quality. 100% private and processed locally in your browser.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock Image to WebP Converter",
            "operatingSystem": "Web Browser",
            "applicationCategory": "MultimediaApplication",
            "description":
              "Browser-based image to WebP conversion utility. Converts PNG, JPG, and other formats to WebP entirely in the browser.",
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
