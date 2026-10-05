import type { Metadata } from "next";
import Link from "next/link";
import { Film, Scissors, Sparkles, BookOpen, Music, CheckCircle2 } from "lucide-react";
import VideoGeneratorClient from "./VideoGeneratorClient";

export const metadata: Metadata = {
  title: "Free AI Video Generator | Text & Photo to Video Online",
  description:
    "Generate cinematic AI videos from text prompts and photos in seconds with Botock. High-definition rendering, multi-model support, in-browser preview, and free daily credits.",
  alternates: {
    canonical: "/tools/video-generator",
  },
  openGraph: {
    title: "Free AI Video Generator | Text & Photo to Video Online",
    description:
      "Generate cinematic AI videos from text prompts and photos in seconds with Botock. High-definition rendering and free daily credits.",
    url: "https://botock.app/tools/video-generator",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Video Generator",
    description:
      "Generate cinematic AI videos from text prompts and photos in seconds with Botock.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock AI Video Generator",
        url: "https://botock.app/tools/video-generator",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Generate 4K cinematic video clips from text prompts or photos using Botock Engine and Veo AI models.",
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
            name: "AI Video Generator",
            item: "https://botock.app/tools/video-generator",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I create an AI video with Botock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Choose between Text-to-Video or Photo-to-Video mode, enter a descriptive prompt or upload a reference photo, select duration and aspect ratio, and click Generate Video.",
            },
          },
          {
            "@type": "Question",
            name: "Is Botock's AI Video Generator free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, every registered user receives 3 free video clips daily, refreshed automatically every 24 hours.",
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

      {/* Semantic Top Navigation Breadcrumb & SEO Header */}
      <section className="bg-slate-900/50 border-b border-border/40 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">AI Video Generator</span>
          </nav>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3 Free Daily Clips</span>
            </span>
            <Link
              href="/blog/guide-to-ai-video-generation"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Prompting Guide</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Generator App */}
      <div className="flex-1">
        <VideoGeneratorClient />
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
              Free AI Video Generator — Turn Text &amp; Photos into Cinematic Clips
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Botock AI Video Generator leverages cutting-edge generative neural networks to transform natural language descriptions and reference photos into coherent, high-definition video scenes. With support for multiple aspect ratios (16:9 widescreen and 9:16 vertical), dynamic camera motions, and in-browser preview, creating professional video content has never been easier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
            <div>
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <Film className="w-4 h-4 text-primary" />
                <span>Text to Video</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Describe characters, lighting, environments, and movements. The AI translates prompts into realistic cinematic motion.
              </p>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Photo to Video</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload any portrait, product photo, or landscape image to breathe dynamic motion and realistic physics into static imagery.
              </p>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-primary" />
                <span>Instant Studio Bridge</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Directly pass generated video clips into our In-Browser Video Studio for trimming, multi-track timeline editing, and audio addition.
              </p>
            </div>
          </div>

          {/* Related Tools Internal Links */}
          <div className="pt-6 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Related Creative Tools
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/video-editor"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-primary" />
                <span>Online Video Editor</span>
              </Link>
              <Link
                href="/tools/image-generator"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Image Studio</span>
              </Link>
              <Link
                href="/tools/video-to-mp3"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Music className="w-3.5 h-3.5 text-primary" />
                <span>Extract MP3 Audio</span>
              </Link>
              <Link
                href="/tools/video-trim"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-primary" />
                <span>Video Cutter</span>
              </Link>
              <Link
                href="/blog/guide-to-ai-video-generation"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Filmmaking &amp; Prompt Guide</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
