import type { Metadata } from "next";
import Link from "next/link";
import { Scissors, Film, Sparkles, Music, CheckCircle2 } from "lucide-react";
import VideoEditorComponent from "./VideoEditorComponent";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Free Online Video Editor | In-Browser Studio",
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
    canonical: "/tools/video-editor",
  },
  openGraph: {
    title: "Free Online Video Editor | In-Browser Studio",
    description:
      "Edit videos online directly in your browser with multi-track timeline, trimming, splitting, and color presets.",
    url: "https://botock.app/tools/video-editor",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Video Editor",
    description:
      "In-browser multi-track video editing with 0ms lag and complete client-side privacy.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoEditorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Online Video Editor - Botock AI",
        url: "https://botock.app/tools/video-editor",
        description:
          "Edit videos online directly in your browser with multi-track timeline, trimming, and effects.",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://botock.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: "https://botock.app/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Online Video Editor",
            item: "https://botock.app/tools/video-editor",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does Botock upload my videos to a server while editing?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No, Botock's Video Studio processes your media locally using WebAssembly and Web Codecs in your browser. Your files never leave your computer.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-screen h-[100dvh] overflow-hidden bg-black text-white fixed top-0 left-0 right-0 bottom-0 z-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolErrorBoundary toolName="Video Editor">
        <VideoEditorComponent />
      </ToolErrorBoundary>
    </div>
  );
}
