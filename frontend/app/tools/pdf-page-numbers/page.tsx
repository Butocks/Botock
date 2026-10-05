import type { Metadata } from "next";
import Link from "next/link";
import { Type, FileText, Minimize2, CheckCircle2 } from "lucide-react";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online Free | Custom Header & Footer",
  description:
    "Easily add page numbers, headers, and footers to your PDF document online for free. Custom positions, fonts, page ranges, and formats directly in your browser with complete client-side privacy.",
  keywords: [
    "add page numbers to pdf",
    "pdf page numbering",
    "number pdf pages free",
    "header footer pdf",
    "pdf pagination online",
    "page numbers pdf browser",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/pdf-page-numbers",
  },
  openGraph: {
    title: "Add Page Numbers to PDF Online Free",
    description: "Custom page numbers, headers, and footers in your PDF with instant browser processing.",
    url: "https://botock.app/tools/pdf-page-numbers",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Page Numbers to PDF Online Free",
    description: "Custom page numbers, headers, and footers in your PDF with instant browser processing.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PdfPageNumbersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Add Page Numbers to PDF - Botock",
        url: "https://botock.app/tools/pdf-page-numbers",
        description: "Add page numbers, headers, and footers to PDF documents directly inside your browser.",
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
            name: "Add Page Numbers to PDF",
            item: "https://botock.app/tools/pdf-page-numbers",
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
            <span className="text-foreground font-semibold">Add Page Numbers to PDF</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Private Client-Side Processing</span>
          </span>
        </div>
      </section>

      {/* Interactive Tool Component */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Add Page Numbers to PDF">
          <ClientWrapper />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Add Page Numbers to PDF Online — Custom Header &amp; Footer Pagination
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Insert clear, sequential page numbers across all or selected ranges of your PDF documents. Select custom placement (top left, top center, bottom right, etc.), typography formatting, and start index with instant real-time preview.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related PDF Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/pdf-watermark"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Watermark PDF</span>
              </Link>
              <Link
                href="/tools/pdf-merge"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Merge PDF</span>
              </Link>
              <Link
                href="/tools/organize-pdf"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Type className="w-3.5 h-3.5 text-primary" />
                <span>Organize PDF</span>
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
