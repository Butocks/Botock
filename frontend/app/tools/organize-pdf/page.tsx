import type { Metadata } from "next";
import Link from "next/link";
import { FolderTree, FileText, Minimize2, Crop, CheckCircle2 } from "lucide-react";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Organize PDF Pages Online Free | Rearrange & Rotate",
  description:
    "Organize PDF pages visually for free. Drag and drop to reorder, rotate individual pages, duplicate, or delete unwanted pages directly in your browser with complete privacy.",
  keywords: [
    "organize pdf",
    "rearrange pdf pages",
    "reorder pdf pages",
    "rotate pdf pages",
    "delete pdf pages",
    "sort pdf pages online",
    "pdf organizer free",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/organize-pdf",
  },
  openGraph: {
    title: "Organize PDF Pages Online Free",
    description: "Visually reorder, rotate, duplicate, and delete PDF pages directly in your browser.",
    url: "https://botock.app/tools/organize-pdf",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Organize PDF Pages Online Free",
    description: "Visually reorder, rotate, duplicate, and delete PDF pages directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function OrganizePdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Organize PDF - Botock",
        url: "https://botock.app/tools/organize-pdf",
        description: "Visual PDF page organizer to reorder, rotate, duplicate, and remove pages in your browser.",
        applicationCategory: "BusinessApplication",
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
            name: "Organize PDF",
            item: "https://botock.app/tools/organize-pdf",
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
            <span className="text-foreground font-semibold">Organize PDF</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Private Client-Side Processing</span>
          </span>
        </div>
      </section>

      {/* Interactive Tool Component */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Organize PDF">
          <ClientWrapper />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Organize PDF Pages Online — Reorder, Rotate &amp; Delete
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Rearrange the visual flow of multi-page PDF documents effortlessly. Simply drag and drop thumbnail cards to reorder pages, rotate misoriented pages, duplicate vital sections, or delete blank pages with real-time browser preview.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related PDF Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/pdf-merge"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Merge PDF</span>
              </Link>
              <Link
                href="/tools/pdf-split"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Crop className="w-3.5 h-3.5 text-primary" />
                <span>Split PDF</span>
              </Link>
              <Link
                href="/tools/crop-pdf"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Crop className="w-3.5 h-3.5 text-primary" />
                <span>Crop PDF</span>
              </Link>
              <Link
                href="/tools/pdf-compress"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Minimize2 className="w-3.5 h-3.5 text-primary" />
                <span>Compress PDF</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
