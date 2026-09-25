import { Metadata } from "next";
import { Subtitles, ShieldCheck } from "lucide-react";
import SubtitlesClient from "./Client";

export const metadata: Metadata = {
  title: "Subtitle Editor & Converter Online Free - SRT to VTT - Botock",
  description:
    "Convert, adjust timing offset, and edit SRT and VTT subtitles directly in your browser. 100% private, free subtitle tool with zero server uploads.",
  openGraph: {
    title: "Subtitle Editor & Converter Online Free - Botock",
    description:
      "Edit and convert SRT and VTT subtitles with time synchronization in your browser.",
    type: "website",
  },
  keywords: [
    "subtitle editor",
    "srt to vtt",
    "vtt to srt",
    "subtitle converter",
    "sync subtitles",
    "free subtitle editor",
  ],
};

export default function SubtitlesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Subtitle & Caption Tool",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Convert and edit subtitle files between SRT and VTT with timestamp synchronization in the browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Convert between SRT and WebVTT",
      "Timestamp synchronization & offset shift",
      "Find & replace caption text",
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
          <Subtitles className="w-8 h-8 text-sky-500" />
          Subtitle & Caption Editor
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Convert subtitle files between SRT and VTT, synchronize misaligned audio cues with millisecond accuracy, and clean caption formatting.
        </p>
      </div>

      <SubtitlesClient />
    </div>
  );
}
