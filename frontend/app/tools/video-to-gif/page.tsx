import { Metadata } from "next";
import { Film, ShieldCheck } from "lucide-react";
import VideoToGifClient from "./Client";

export const metadata: Metadata = {
  title: "Convert Video to GIF Online Free - Fast Animated GIF Maker - Botock",
  description:
    "Convert MP4, WebM, and MOV videos to smooth animated GIFs in your browser. Custom framerate, resolution scaling, and clip trimming with zero server uploads.",
  openGraph: {
    title: "Convert Video to GIF Online Free - Botock",
    description:
      "Make high-quality animated GIFs from videos locally in your browser. 100% private, free, and fast.",
    type: "website",
  },
  keywords: [
    "video to gif",
    "mp4 to gif",
    "convert video to gif",
    "gif maker",
    "free gif converter",
    "browser gif maker",
    "ffmpeg wasm gif",
  ],
};

export default function VideoToGifPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Video to GIF Converter",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Convert video files to smooth animated GIFs with palette optimization directly in the browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Custom framerate (10-24 fps)",
      "High quality Bayer dithering palette optimization",
      "Resolution presets and custom range trimming",
      "100% Client-Side Privacy",
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Film className="w-8 h-8 text-purple-500" />
          Convert Video to GIF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Turn your favorite video clips, memes, and animations into crisp, lightweight animated GIFs without any watermarks or quality degradation.
        </p>
      </div>

      <VideoToGifClient />
    </div>
  );
}
