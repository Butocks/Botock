import { Metadata } from "next";
import { Music, ShieldCheck } from "lucide-react";
import AudioConverterClient from "./Client";

export const metadata: Metadata = {
  title: "Audio Format Converter Free Online - MP3, WAV, AAC, FLAC - Botock",
  description:
    "Convert audio files between MP3, WAV, AAC, OGG, and FLAC directly in your browser. 100% private, client-side FFmpeg WebAssembly audio converter.",
  openGraph: {
    title: "Audio Format Converter Free Online - Botock",
    description:
      "Convert audio files between MP3, WAV, AAC, OGG, and FLAC directly in your browser with zero server uploads.",
    type: "website",
  },
  keywords: [
    "audio converter",
    "convert mp3 to wav",
    "convert wav to mp3",
    "convert aac to mp3",
    "flac converter",
    "free audio converter",
    "browser audio converter",
    "ffmpeg audio converter",
  ],
};

export default function AudioConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Audio Format Converter",
    "operatingSystem": "Any",
    "applicationCategory": "MultimediaApplication",
    "description":
      "Convert audio files between MP3, WAV, AAC, OGG, and FLAC formats directly in your browser with WebAssembly.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Convert between MP3, WAV, AAC, OGG, FLAC",
      "Bitrate quality selection up to 320kbps",
      "Stereo and Mono channel control",
      "100% Client-Side Privacy - Zero server uploads",
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Music className="w-8 h-8 text-violet-500" />
          Audio Format Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Convert your music, podcasts, and recordings between MP3, WAV, AAC, OGG, and FLAC formats. Powered by FFmpeg WebAssembly inside your browser with zero server uploads.
        </p>
      </div>

      <AudioConverterClient />
    </div>
  );
}
