import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Scissors, ShieldCheck } from "lucide-react";

const VideoTrimClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading Video Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Trim Video Online Free - Fast Lossless Video Cutter - Botock",
  description:
    "Cut and trim video clips instantly in your browser using client-side FFmpeg WebAssembly. Fast lossless stream copy or frame-accurate cut. 100% private, no server uploads.",
  openGraph: {
    title: "Trim Video Online Free - Botock",
    description:
      "Secure, high-performance in-browser video trimming tool. 100% private, client-side WebAssembly execution.",
    type: "website",
  },
  keywords: [
    "video trim",
    "trim video online",
    "cut video",
    "video cutter",
    "free video trimmer",
    "lossless video trim",
    "browser video editor",
    "mp4 trim",
    "ffmpeg wasm",
    "client-side video cutter",
  ],
};

export default function VideoTrimPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Video Trimmer",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Cut and trim video clips instantly in your browser using client-side FFmpeg WebAssembly. Fast lossless stream copy or frame-accurate re-encoding with zero server uploads.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Fast lossless stream-copy trimming",
      "Frame-accurate re-encoding mode",
      "Instant browser preview player",
      "Millisecond time precision controls",
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
          <Scissors className="w-8 h-8 text-emerald-500" />
          Trim Video Online
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Cut and extract video clips with lightning-fast lossless speed or frame-accurate precision.
          All processing happens directly in your browser.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <VideoTrimClient />
    </div>
  );
}
