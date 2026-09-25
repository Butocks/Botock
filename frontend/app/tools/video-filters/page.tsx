import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Video Filters & Color Effects Online Free - Video Color Grading | Botock Tools",
  description:
    "Adjust video brightness, contrast, and saturation, or apply cinematic presets online for free. Works directly in your browser with zero server uploads using WASM FFmpeg.",
  keywords: [
    "video filters online",
    "video color grading free",
    "adjust video brightness",
    "cinematic video filter browser",
    "video effects online free",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/video-filters",
  },
  openGraph: {
    title: "Video Filters & Color Effects Online Free - Botock Tools",
    description: "Adjust video brightness, contrast, saturation, and cinematic film presets directly in your browser.",
    url: "https://botock.com/tools/video-filters",
    siteName: "Botock",
    type: "website",
  },
};

export default function VideoFiltersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Video Filters & Effects - Botock Tools",
    url: "https://botock.com/tools/video-filters",
    description: "Color grade and filter videos directly in your browser using WebAssembly FFmpeg.",
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
      <ToolErrorBoundary toolName="Video Filters & Effects">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
