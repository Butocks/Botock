import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Rotate Video Online Free - 90°, 180°, 270°, Mirror Flip | Botock Tools",
  description:
    "Rotate and flip MP4, MOV, and WebM videos online for free. Fix sideways smartphone videos with zero server uploads using high-speed WASM FFmpeg.",
  keywords: [
    "rotate video online",
    "flip video free",
    "rotate mp4 90 degrees",
    "fix upside down video",
    "video rotator browser wasm",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/video-rotate",
  },
  openGraph: {
    title: "Rotate Video Online Free - Botock Tools",
    description: "Rotate and flip videos directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/video-rotate",
    siteName: "Botock",
    type: "website",
  },
};

export default function VideoRotatePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rotate Video - Botock Tools",
    url: "https://botock.com/tools/video-rotate",
    description: "Rotate and flip videos directly in your browser using WebAssembly FFmpeg.",
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
      <ToolErrorBoundary toolName="Rotate Video">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
