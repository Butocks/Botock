import { Metadata } from "next";
import dynamic from "next/dynamic";

const ImageCropClient = dynamic(() => import("./ImageCropClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Image Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Crop & Resize Image Online - Botock",
  description: "Quickly crop, resize, and edit your images securely in your browser without uploading to any server.",
  openGraph: {
    title: "Crop Image Online - Botock",
    description: "Secure, in-browser image cropping and resizing tool.",
  },
};

export default function ImageCropPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Crop & Resize Image
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Perfectly frame your pictures. All image processing happens instantly in your browser to protect your privacy.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Botock Image Cropper",
            "operatingSystem": "Web Browser",
            "applicationCategory": "MultimediaApplication",
            "description": "Browser-based image cropping and resizing utility.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      <ImageCropClient />
    </div>
  );
}
