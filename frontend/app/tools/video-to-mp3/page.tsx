import Link from "next/link";
import { Metadata } from "next";
import { Music, ShieldCheck } from "lucide-react";
import VideoToMp3Client from "./Client";

export const metadata: Metadata = {
  title: "Extract MP3 from Video Online Free | Lossless Audio Ripper",
  description: "Extract crystal clear high-bitrate MP3 audio from any MP4, MOV, WebM, or MKV video file with zero server uploads.",
  alternates: {
    canonical: "/tools/video-to-mp3",
  },
  openGraph: {
    title: "Extract MP3 from Video Online Free | Lossless Audio Ripper | Botock",
    description: "Extract crystal clear high-bitrate MP3 audio from any MP4, MOV, WebM, or MKV video file with zero server uploads.",
    url: "https://botock.app/tools/video-to-mp3",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Extract MP3 from Video Online Free | Lossless Audio Ripper | Botock",
    description: "Extract crystal clear high-bitrate MP3 audio from any MP4, MOV, WebM, or MKV video file with zero server uploads.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoToMp3Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Extract MP3 Audio - Botock",
        "url": "https://botock.app/tools/video-to-mp3",
        "description": "Extract crystal clear high-bitrate MP3 audio from any MP4, MOV, WebM, or MKV video file with zero server uploads.",
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
            "name": "Extract MP3 Audio",
            "item": "https://botock.app/tools/video-to-mp3",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Music className="w-8 h-8 text-emerald-500" />
          Convert Video to MP3
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Extract crystal-clear MP3 audio from your video files in seconds.
          All conversion happens locally in your browser with zero data sent to servers.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <VideoToMp3Client />
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
