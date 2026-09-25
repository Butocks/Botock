import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert Video Format Online Free - MP4, WebM, MOV, MKV, AVI | Botock Tools",
  description:
    "Convert video files between MP4, WebM, MOV, MKV, and AVI containers online for free. Works directly in your browser with zero server uploads using WASM FFmpeg.",
  keywords: [
    "video converter online",
    "convert mov to mp4 free",
    "webm to mp4 converter",
    "mkv to mp4 online browser",
    "video format converter free",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/video-convert",
  },
  openGraph: {
    title: "Convert Video Format Online Free - Botock Tools",
    description: "Convert video containers and formats directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/video-convert",
    siteName: "Botock",
    type: "website",
  },
};

export default function VideoConvertPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Video Format Converter - Botock Tools",
    url: "https://botock.com/tools/video-convert",
    description: "Convert video containers and formats directly in your browser using WebAssembly FFmpeg.",
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
      <ToolErrorBoundary toolName="Video Format Converter">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
