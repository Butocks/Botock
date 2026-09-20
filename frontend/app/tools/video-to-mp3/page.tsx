import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Music, ShieldCheck } from "lucide-react";

const VideoToMp3Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading Audio Extraction Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Convert Video to MP3 Online Free - Audio Extractor - Botock",
  description:
    "Extract high-quality MP3 audio from any video (MP4, WebM, MOV, MKV) directly in your browser. 100% private, client-side WebAssembly audio extractor with zero server uploads.",
  openGraph: {
    title: "Convert Video to MP3 Online Free - Botock",
    description:
      "Extract crystal-clear MP3 audio from video files locally in your browser. High bitrates up to 320kbps, 100% private.",
    type: "website",
  },
  keywords: [
    "video to mp3",
    "extract audio from video",
    "mp4 to mp3",
    "audio extractor",
    "convert video to audio",
    "free video to mp3",
    "browser mp3 converter",
    "ffmpeg wasm audio",
    "extract mp3 online",
  ],
};

export default function VideoToMp3Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Video to MP3 Converter",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Extract high-quality MP3 audio from any video file instantly in your browser with zero server uploads. Powered by client-side FFmpeg WebAssembly.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Ultra-fast video stripping with -vn flag",
      "High bitrates: 320kbps, 192kbps, 128kbps, and VBR",
      "Built-in audio player preview",
      "Instant MP3 file download",
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
          <Music className="w-8 h-8 text-emerald-500" />
          Convert Video to MP3
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Extract crystal-clear MP3 audio from your video files in seconds.
          All conversion happens locally in your browser with zero data sent to servers.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <VideoToMp3Client />
    </div>
  );
}
