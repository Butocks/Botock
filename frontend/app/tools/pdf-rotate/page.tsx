import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFRotateClient = dynamic(() => import("./PDFRotateClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online - Free Tool - Botock",
  description: "Rotate PDF pages 90, 180, or 270 degrees clockwise or counterclockwise securely in your browser.",
  openGraph: {
    title: "Rotate PDF Online - Botock",
    description: "Rotate single pages or entire PDF documents client-side with zero server uploads.",
  },
};

export default function PDFRotatePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Rotate PDF Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Fix upside-down or sideways PDF scans. Rotate all pages 90°, 180°, or 270° instantly in your browser.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock PDF Rotator",
            "operatingSystem": "Web Browser",
            "applicationCategory": "UtilitiesApplication",
            "description": "Rotate PDF pages online in the browser.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />

      <PDFRotateClient />
    </div>
  );
}
