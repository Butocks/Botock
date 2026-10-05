import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Film, Wand2, BookOpen, Minimize2, CheckCircle2, Crop } from "lucide-react";
import ImageGeneratorClient from "./ImageGeneratorClient";

export const metadata: Metadata = {
  title: "Free AI Image Generator | Text to Image Online",
  description:
    "Generate 8K photorealistic artwork, product visuals, and digital designs from text prompts with Botock. Powered by Nano Banana AI with 5 free images daily.",
  alternates: {
    canonical: "/tools/image-generator",
  },
  openGraph: {
    title: "Free AI Image Generator | Text to Image Online | Botock",
    description:
      "Generate 8K photorealistic artwork, product visuals, and digital designs from text prompts with Botock.",
    url: "https://botock.app/tools/image-generator",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Image Generator | Botock",
    description:
      "Generate 8K photorealistic artwork and digital designs from text prompts with Botock.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock AI Image Generator",
        url: "https://botock.app/tools/image-generator",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Generate high-resolution 8K photos, concept art, and digital illustrations from text prompts using Nano Banana AI.",
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
            name: "AI Image Generator",
            item: "https://botock.app/tools/image-generator",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I create AI images with Botock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Type your visual prompt into the text prompt box, select your preferred aspect ratio (1:1, 16:9, 9:16, 4:3, 3:2), choose an artistic style preset, and click Generate Photo.",
            },
          },
          {
            "@type": "Question",
            name: "How many free images can I generate each day?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Every registered user receives 5 free AI image generation credits per day, refreshed automatically every 24 hours.",
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
            <span className="text-foreground font-semibold">AI Image Generator</span>
          </nav>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>5 Free Daily Photos</span>
            </span>
            <Link
              href="/blog/guide-to-photo-generation-and-faq"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Photo Guide &amp; FAQ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Generator App */}
      <div className="flex-1">
        <ImageGeneratorClient />
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
              Free AI Image Generator — Synthesize High-Resolution Art &amp; Photos
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Turn your creative imagination into photorealistic imagery, digital concept art, and high-converting marketing assets. Powered by advanced Nano Banana generative architectures, Botock produces rich textures, accurate lighting, and fine detail across multiple aspect ratios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
            <div>
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-500" />
                <span>Text to Image Synthesis</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Describe intricate subjects, camera lenses, atmospheric mood, and lighting. The neural model renders 8K clarity from descriptive text.
              </p>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <Crop className="w-4 h-4 text-amber-500" />
                <span>5 Native Aspect Ratios</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Render directly in square 1:1, widescreen 16:9, vertical 9:16 story format, or classic 4:3 and 3:2 portrait standards.
              </p>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-500" />
                <span>Animate into AI Video</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seamlessly transfer your generated still photos into the AI Video Generator to produce dynamic cinematic video scenes.
              </p>
            </div>
          </div>

          {/* Related Tools Internal Links */}
          <div className="pt-6 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Related Image &amp; Creative Tools
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/image-remove-bg"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Remove Background AI</span>
              </Link>
              <Link
                href="/tools/image-compress"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Minimize2 className="w-3.5 h-3.5 text-primary" />
                <span>Compress Images</span>
              </Link>
              <Link
                href="/tools/video-generator"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-primary" />
                <span>AI Video Generator</span>
              </Link>
              <Link
                href="/tools/image-crop"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Crop className="w-3.5 h-3.5 text-primary" />
                <span>Crop Photo</span>
              </Link>
              <Link
                href="/blog/guide-to-photo-generation-and-faq"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Photo Generation FAQ</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
