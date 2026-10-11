import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Film, Image as ImageIcon, ShieldCheck } from "lucide-react";
import BotockLibraryClient from "./BotockLibraryClient";
import { ToolErrorBoundary } from "../components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Botock Free AI Library | 100% Copyright-Free AI Stock Videos & Photos",
  description:
    "Explore and download free AI-generated stock videos and photos. 100% copyright-free and safe for commercial use, Instagram Reels, TikTok, and YouTube Shorts.",
  alternates: {
    canonical: "/botock-library",
  },
  openGraph: {
    title: "Botock Free AI Library | 100% Copyright-Free AI Videos & Photos",
    description:
      "Explore and download free AI-generated stock videos and photos. 100% copyright-free and safe for commercial use, Instagram Reels, TikTok, and YouTube Shorts.",
    url: "https://botock.app/botock-library",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Botock Free AI Library | 100% Copyright-Free Media",
    description:
      "Download royalty-free AI-generated videos and photos for social media and commercial projects.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function BotockLibraryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Botock Free AI Content Library",
        url: "https://botock.app/botock-library",
        description:
          "High-resolution copyright-free AI videos and photos available for free download and commercial use.",
        provider: {
          "@type": "Organization",
          name: "Botock AI",
          url: "https://botock.app",
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
            name: "Free AI Library",
            item: "https://botock.app/botock-library",
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolErrorBoundary toolName="Botock AI Library">
        <BotockLibraryClient />
      </ToolErrorBoundary>
    </main>
  );
}
