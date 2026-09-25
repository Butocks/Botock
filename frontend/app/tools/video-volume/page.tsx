import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Adjust Video Volume Online Free - Boost Video Audio up to 500% | Botock Tools",
  description:
    "Boost quiet video sound or reduce audio volume in MP4 and MOV videos online for free. Works directly in your browser with zero server uploads using WASM FFmpeg.",
  keywords: [
    "adjust video volume",
    "boost video audio online free",
    "video volume booster",
    "increase mp4 volume browser",
    "mute audio in video",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/video-volume",
  },
  openGraph: {
    title: "Adjust Video Volume Online Free - Botock Tools",
    description: "Boost quiet video audio or decrease volume directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/video-volume",
    siteName: "Botock",
    type: "website",
  },
};

export default function VideoVolumePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Video Volume Booster - Botock Tools",
    url: "https://botock.com/tools/video-volume",
    description: "Boost or lower video audio levels directly in your browser using WebAssembly FFmpeg.",
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
      <ToolErrorBoundary toolName="Video Volume Booster">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
