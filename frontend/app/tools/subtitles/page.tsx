import Link from "next/link";
import { Metadata } from "next";
import { Subtitles, ShieldCheck } from "lucide-react";
import SubtitlesClient from "./Client";

export const metadata: Metadata = {
  title: "Subtitle Editor & Converter Online Free | SRT to VTT",
  description: "Generate, edit, and convert subtitle files between SRT and WebVTT formats with synchronized timing and real-time preview.",
  alternates: {
    canonical: "/tools/subtitles",
  },
  openGraph: {
    title: "Subtitle Editor & Converter Online Free | SRT to VTT | Botock",
    description: "Generate, edit, and convert subtitle files between SRT and WebVTT formats with synchronized timing and real-time preview.",
    url: "https://botock.app/tools/subtitles",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Subtitle Editor & Converter Online Free | SRT to VTT | Botock",
    description: "Generate, edit, and convert subtitle files between SRT and WebVTT formats with synchronized timing and real-time preview.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function SubtitlesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Subtitle Editor - Botock",
        "url": "https://botock.app/tools/subtitles",
        "description": "Generate, edit, and convert subtitle files between SRT and WebVTT formats with synchronized timing and real-time preview.",
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
            "name": "Subtitle Editor",
            "item": "https://botock.app/tools/subtitles",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Subtitles className="w-8 h-8 text-sky-500" />
          Subtitle & Caption Editor
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Convert subtitle files between SRT and VTT, synchronize misaligned audio cues with millisecond accuracy, and clean caption formatting.
        </p>
      </div>

      <SubtitlesClient />
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
            href="/tools/video-editor"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Video Editor
          </Link>
          <Link
            href="/tools/video-to-mp3"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Extract MP3
          </Link>
        </div>
      </div>
    </div>
  );
}
