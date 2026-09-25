import { Metadata } from "next";
import { VolumeX, ShieldCheck } from "lucide-react";
import VideoMuteClient from "./Client";

export const metadata: Metadata = {
  title: "Mute & Reverse Video Online Free - Remove Audio - Botock",
  description:
    "Strip audio tracks from MP4, WebM, and MOV videos or reverse video footage directly in your browser. Fast lossless mute with zero server uploads.",
  openGraph: {
    title: "Mute & Reverse Video Online Free - Botock",
    description:
      "Remove audio or play video backwards in your browser with zero server uploads.",
    type: "website",
  },
  keywords: [
    "mute video",
    "remove audio from video",
    "reverse video",
    "silent video",
    "strip audio mp4",
    "browser video mute",
  ],
};

export default function VideoMutePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Video Mute & Reverse Tool",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Remove audio streams from video files or reverse video frame playback in the browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Lossless instant video mute with -an -c:v copy",
      "Reverse video and audio playback",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <VolumeX className="w-8 h-8 text-sky-500" />
          Mute & Reverse Video
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Remove unwanted background noise and audio tracks with lossless speed, or create rewind playback effects entirely on your device.
        </p>
      </div>

      <VideoMuteClient />
    </div>
  );
}
