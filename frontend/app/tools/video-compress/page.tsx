import Link from "next/link";
import { Metadata } from "next";
import { Minimize2, ShieldCheck } from "lucide-react";
import VideoCompressClient from "./Client";

export const metadata: Metadata = {
  title: "Compress Video Online Free | Reduce Video File Size",
  description: "Compress MP4, MOV, and WebM videos in your browser. Reduce file size for email and web sharing with optimal resolution.",
  alternates: {
    canonical: "/tools/video-compress",
  },
  openGraph: {
    title: "Compress Video Online Free | Reduce Video File Size",
    description: "Compress MP4, MOV, and WebM videos in your browser. Reduce file size for email and web sharing with optimal resolution.",
    url: "https://botock.app/tools/video-compress",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress Video Online Free | Reduce Video File Size",
    description: "Compress MP4, MOV, and WebM videos in your browser. Reduce file size for email and web sharing with optimal resolution.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoCompressPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Compress Video - Botock",
        "url": "https://botock.app/tools/video-compress",
        "description": "Compress MP4, MOV, and WebM videos in your browser. Reduce file size for email and web sharing with optimal resolution.",
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
            "name": "Compress Video",
            "item": "https://botock.app/tools/video-compress",
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
          <Minimize2 className="w-8 h-8 text-emerald-500" />
          Compress Video Online
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Shrink MP4 and WebM video files dramatically without sacrificing visual quality.
          All processing runs 100% locally in your browser.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <VideoCompressClient />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/video-convert"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Video Converter
          </Link>
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
        </div>
      </div>
    </div>
  );
}
