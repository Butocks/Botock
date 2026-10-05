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
    siteName: "Botock",
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
        name: "Online Video Editor - Botock",
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
            <span className="text-foreground font-semibold">Online Video Editor</span>
          </nav>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% In-Browser Privacy</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Video Studio */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Video Editor">
          <VideoEditorComponent />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Free Online Video Editor — Multi-Track Timeline &amp; Zero Latency
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Botock Online Video Editor gives creators a desktop-grade timeline editor right in the browser. Cut, split, reorder clips, adjust playback speed, mute audio, and apply color grading presets with zero upload latency powered by local WebAssembly.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related Video Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/video-generator"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-primary" />
                <span>AI Video Generator</span>
              </Link>
              <Link
                href="/tools/video-trim"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-primary" />
                <span>Video Cutter</span>
              </Link>
              <Link
                href="/tools/video-to-mp3"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Music className="w-3.5 h-3.5 text-primary" />
                <span>Extract MP3 Audio</span>
              </Link>
              <Link
                href="/tools/image-generator"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Image Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
