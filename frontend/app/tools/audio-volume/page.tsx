import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Adjust Audio Volume Online Free - Boost MP3/WAV Volume | Botock Tools",
  description:
    "Boost quiet audio tracks or reduce volume in MP3, WAV, and AAC audio files online for free. Works directly in your browser with zero server uploads using WASM FFmpeg.",
  keywords: [
    "adjust audio volume",
    "boost mp3 volume online free",
    "audio volume booster",
    "increase sound volume browser",
    "audio amplifier free",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/audio-volume",
  },
  openGraph: {
    title: "Adjust Audio Volume Online Free - Botock Tools",
    description: "Boost quiet audio or lower volume directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/audio-volume",
    siteName: "Botock",
    type: "website",
  },
};

export default function AudioVolumePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Audio Volume Booster - Botock Tools",
    url: "https://botock.com/tools/audio-volume",
    description: "Boost or lower audio file volume levels directly in your browser using WebAssembly FFmpeg.",
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
      <ToolErrorBoundary toolName="Audio Volume Booster">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
