import type { Metadata } from "next";
import Link from "next/link";
import { FileVideo, Film, Scissors, Music, CheckCircle2 } from "lucide-react";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert Video Format Online Free | MP4, WebM, MOV, AVI",
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
    canonical: "/tools/video-convert",
  },
  openGraph: {
    title: "Convert Video Format Online Free",
    description: "Convert video containers and formats directly in your browser with zero server uploads.",
    url: "https://botock.app/tools/video-convert",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Video Format Online Free",
    description: "Convert video containers and formats directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoConvertPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Video Format Converter - Botock",
        url: "https://botock.app/tools/video-convert",
        description: "Convert video containers and formats directly in your browser using WebAssembly FFmpeg.",
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
            name: "Video Converter",
            item: "https://botock.app/tools/video-convert",
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Semantic Top Navigation Breadcrumb */}
      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Video Converter</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Private Client-Side Processing</span>
          </span>
        </div>
      </section>

      {/* Interactive Tool Component */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Video Format Converter">
          <Client />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Convert Video Files Online — MP4, WebM, MOV, MKV &amp; AVI
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Transcode video formats seamlessly in your browser with hardware acceleration. Convert uncompressed camera footage (.mov) to universal MP4, WebM for web deployment, or extract audio with zero server queues.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related Video Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/video-editor"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-primary" />
                <span>Video Editor</span>
              </Link>
              <Link
                href="/tools/video-to-mp3"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Music className="w-3.5 h-3.5 text-primary" />
                <span>Extract MP3</span>
              </Link>
              <Link
                href="/tools/video-to-gif"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-primary" />
                <span>Video to GIF</span>
              </Link>
              <Link
                href="/tools/video-trim"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-primary" />
                <span>Cut Video</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
