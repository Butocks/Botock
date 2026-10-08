import type { Metadata } from "next";
import Link from "next/link";
import { RotateCw, Crop, Minimize2, CheckCircle2 } from "lucide-react";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Rotate & Flip Image Online Free | 90°, 180° & Mirror",
  description:
    "Rotate images 90, 180, or 270 degrees or flip horizontally and vertically online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "rotate image online",
    "flip image horizontal",
    "flip photo vertical",
    "rotate photo 90 degrees",
    "mirror image online free",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/image-rotate",
  },
  openGraph: {
    title: "Rotate & Flip Image Online Free",
    description: "Rotate and flip photos directly in your browser with instant GPU canvas acceleration.",
    url: "https://botock.app/tools/image-rotate",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate & Flip Image Online Free",
    description: "Rotate and flip images directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageRotatePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Rotate & Flip Image - Botock AI",
        url: "https://botock.app/tools/image-rotate",
        description: "Rotate and flip images directly in your browser.",
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
            name: "Rotate Image",
            item: "https://botock.app/tools/image-rotate",
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
            <span className="text-foreground font-semibold">Rotate &amp; Flip Image</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Private Client-Side Processing</span>
          </span>
        </div>
      </section>

      {/* Interactive Tool Component */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Rotate & Flip Image">
          <Client />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Rotate &amp; Flip Image Online — Clockwise, Counter-Clockwise &amp; Mirror
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Rotate photos by 90°, 180°, or 270° degrees, or mirror images with horizontal and vertical flips. Works with PNG, JPG, WebP, and BMP files with zero server uploads and zero quality loss.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related Image Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/image-crop"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Crop className="w-3.5 h-3.5 text-primary" />
                <span>Crop Photo</span>
              </Link>
              <Link
                href="/tools/image-compress"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Minimize2 className="w-3.5 h-3.5 text-primary" />
                <span>Compress Images</span>
              </Link>
              <Link
                href="/tools/image-filters"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-primary" />
                <span>Image Filters</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
