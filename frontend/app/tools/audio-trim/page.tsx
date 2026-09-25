import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Trim Audio Online Free - Cut MP3, WAV, AAC Clips | Botock Tools",
  description:
    "Cut and trim audio files (MP3, WAV, AAC) online for free. Make ringtones and extract audio segments with lossless stream copy directly in your browser.",
  keywords: [
    "trim audio online",
    "cut mp3 free",
    "audio cutter online",
    "ringtone maker browser",
    "slice audio file free",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/audio-trim",
  },
  openGraph: {
    title: "Trim Audio Online Free - Botock Tools",
    description: "Cut and extract audio clips directly in your browser with lossless stream copy.",
    url: "https://botock.com/tools/audio-trim",
    siteName: "Botock",
    type: "website",
  },
};

export default function AudioTrimPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Audio Cutter & Trimmer - Botock Tools",
    url: "https://botock.com/tools/audio-trim",
    description: "Cut and trim audio files directly in your browser using WebAssembly FFmpeg.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolErrorBoundary toolName="Audio Cutter & Trimmer">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
