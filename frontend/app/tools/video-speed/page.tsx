import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Gauge, ShieldCheck } from "lucide-react";

const VideoSpeedClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading Video Speed Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Change Video Speed Online Free - Fast Forward & Slow Motion - Botock",
  description:
    "Speed up or slow down video playback from 0.25x to 4x directly in your browser with pitch-preserved audio. 100% private, client-side WebAssembly video speed controller.",
  openGraph: {
    title: "Change Video Speed Online Free - Botock",
    description:
      "Adjust video playback speed smoothly from slow motion to fast forward. Zero server uploads, 100% in-browser processing.",
    type: "website",
  },
  keywords: [
    "video speed controller",
    "change video speed",
    "speed up video",
    "slow motion video",
    "slow down video",
    "fast forward video",
    "video speed online free",
    "browser video speed",
    "ffmpeg wasm speed",
    "atempo audio pitch",
  ],
};

export default function VideoSpeedPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Video Speed Controller",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Speed up or slow down video playback (0.25x to 4.0x) with pitch-preserved synchronized audio locally in the browser with zero server uploads.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Speed presets from 0.25x (slow motion) to 4.0x (fast forward)",
      "Audio pitch preservation via chained atempo filters",
      "Optional audio muting for timelapse effects",
      "Instant browser preview player",
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
          <Gauge className="w-8 h-8 text-emerald-500" />
          Change Video Speed
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Speed up or slow down video playback from 0.25x to 4.0x with pitch-preserved audio.
          Everything runs entirely inside your browser.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <VideoSpeedClient />
    </div>
  );
}
