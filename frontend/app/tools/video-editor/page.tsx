import type { Metadata } from "next";
import VideoEditorComponent from "./VideoEditorComponent";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Online Video Editor Free - Cut, Trim, Split & Effects | Botock Tools",
  description:
    "Edit videos online directly in your browser with multi-track timeline, trimming, splitting, speed controls, aspect ratio presets, and zero server uploads using WebAssembly.",
  keywords: [
    "video editor online",
    "free video editor browser",
    "cut video online",
    "trim video fast",
    "split video clips",
    "wasm video editor",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/video-editor",
  },
  openGraph: {
    title: "Online Video Editor Free - Botock Tools",
    description:
      "Edit videos online directly in your browser with timeline, trimming, splitting, and color presets.",
    url: "https://botock.com/tools/video-editor",
    siteName: "Botock",
    type: "website",
  },
};

export default function VideoEditorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Online Video Editor - Botock Tools",
    url: "https://botock.com/tools/video-editor",
    description:
      "Edit videos online directly in your browser with timeline, trimming, and effects.",
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
      <ToolErrorBoundary toolName="Video Editor">
        <VideoEditorComponent />
      </ToolErrorBoundary>
    </>
  );
}
