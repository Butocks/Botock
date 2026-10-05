import type { Metadata } from "next";
import Link from "next/link";
import { Sliders, Sparkles, Crop, Minimize2, CheckCircle2 } from "lucide-react";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Photo Filters & Effects Online Free | Color Grading",
  description:
    "Apply cinematic filters, adjust brightness, contrast, saturation, and color grading online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "photo filters online",
    "image color grading",
    "photo effects free",
    "adjust image brightness contrast",
    "vintage filter online",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/image-filters",
  },
  openGraph: {
    title: "Photo Filters & Effects Online Free | Botock",
    description: "Fine-tune brightness, contrast, saturation, and cinematic film presets directly in your browser.",
    url: "https://botock.app/tools/image-filters",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Filters & Effects Online Free | Botock",
    description: "Fine-tune brightness, contrast, saturation, and cinematic film presets directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageFiltersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Photo Filters & Effects - Botock",
        url: "https://botock.app/tools/image-filters",
        description: "Fine-tune photo brightness, contrast, saturation, and cinematic film presets directly in your browser.",
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
            name: "Image Filters",
            item: "https://botock.app/tools/image-filters",
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
            <span className="text-foreground font-semibold">Image Filters &amp; Effects</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Private Client-Side Processing</span>
          </span>
        </div>
      </section>

      {/* Interactive Tool Component */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Photo Filters & Effects">
          <Client />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Photo Filters &amp; Effects Online — In-Browser Color Grading
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Enhance photos with real-time color sliders and presets. Adjust exposure, contrast, vibrance, warmth, grayscale, sepia, and cinematic tones with instant canvas preview.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related Image Utilities
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
                href="/tools/image-crop"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Crop className="w-3.5 h-3.5 text-primary" />
                <span>Crop Photo</span>
              </Link>
              <Link
                href="/tools/image-generator"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Image Generator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
