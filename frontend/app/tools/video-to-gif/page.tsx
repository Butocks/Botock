import Link from "next/link";
import { Metadata } from "next";
import { Film, ShieldCheck } from "lucide-react";
import VideoToGifClient from "./Client";

export const metadata: Metadata = {
  title: "Convert Video to GIF Online Free | Animated GIF Maker",
  description: "Convert video highlights from MP4, MOV, or WebM into high-quality looping animated GIFs with custom FPS and size.",
  alternates: {
    canonical: "/tools/video-to-gif",
  },
  openGraph: {
    title: "Convert Video to GIF Online Free | Animated GIF Maker",
    description: "Convert video highlights from MP4, MOV, or WebM into high-quality looping animated GIFs with custom FPS and size.",
    url: "https://botock.app/tools/video-to-gif",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Video to GIF Online Free | Animated GIF Maker",
    description: "Convert video highlights from MP4, MOV, or WebM into high-quality looping animated GIFs with custom FPS and size.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoToGifPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Video to GIF - Botock AI",
        "url": "https://botock.app/tools/video-to-gif",
        "description": "Convert video highlights from MP4, MOV, or WebM into high-quality looping animated GIFs with custom FPS and size.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://botock.app",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": "https://botock.app/tools",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Video to GIF",
            "item": "https://botock.app/tools/video-to-gif",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Film className="w-8 h-8 text-purple-500" />
          Convert Video to GIF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Turn your favorite video clips, memes, and animations into crisp, lightweight animated GIFs without any watermarks or quality degradation.
        </p>
      </div>

      <VideoToGifClient />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/video-trim"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Video Cutter
          </Link>
          <Link
            href="/tools/video-convert"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Video Converter
          </Link>
          <Link
            href="/tools/video-editor"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Video Editor
          </Link>
        </div>
      </div>
    </div>
  );
}
