import { Metadata } from "next";
import { Minimize2, ShieldCheck } from "lucide-react";
import VideoCompressClient from "./Client";

export const metadata: Metadata = {
  title: "Compress Video Online Free - Reduce Video File Size - Botock",
  description:
    "Reduce MP4 and WebM video file sizes in your browser using client-side H.264 compression without server uploads. 100% private, adjust CRF and resolution with instant savings.",
  openGraph: {
    title: "Compress Video Online Free - Botock",
    description:
      "Compress videos locally in your browser with smart CRF rate control and resolution scaling. 100% private, zero server uploads.",
    type: "website",
  },
  keywords: [
    "video compressor",
    "compress video online",
    "reduce video file size",
    "compress mp4",
    "free video compressor",
    "browser video compressor",
    "ffmpeg wasm compress",
    "h264 crf compression",
    "client-side video optimizer",
  ],
};

export default function VideoCompressPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Video Compressor",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Shrink video file sizes in your browser using client-side FFmpeg WebAssembly. Configurable H.264 CRF quality levels and resolution downscaling with zero server uploads.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "CRF quality presets: Light (24), Balanced (28), Heavy (32)",
      "Smart resolution downscaling (Original, 1080p, 720p, 480p)",
      "Real-time compression savings calculator",
      "Ultrafast in-browser H.264 encoding",
      "100% Client-Side Privacy - Zero server uploads",
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Minimize2 className="w-8 h-8 text-emerald-500" />
          Compress Video Online
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Shrink MP4 and WebM video files dramatically without sacrificing visual quality.
          All processing runs 100% locally in your browser.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <VideoCompressClient />
    </div>
  );
}
