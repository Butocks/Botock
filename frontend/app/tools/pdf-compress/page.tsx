import Link from "next/link";
import { Metadata } from "next";
import { FileArchive, ShieldCheck } from "lucide-react";
import Client from "./Client";

export const metadata: Metadata = {
  title: "Compress PDF Online Free | Reduce PDF File Size",
  description: "Compress PDF files online while preserving text readability and font clarity. Fast, private client-side compression with zero uploads.",
  alternates: {
    canonical: "/tools/pdf-compress",
  },
  openGraph: {
    title: "Compress PDF Online Free | Reduce PDF File Size",
    description: "Compress PDF files online while preserving text readability and font clarity. Fast, private client-side compression with zero uploads.",
    url: "https://botock.app/tools/pdf-compress",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online Free | Reduce PDF File Size",
    description: "Compress PDF files online while preserving text readability and font clarity. Fast, private client-side compression with zero uploads.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PdfCompressPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side • Private &amp; Secure</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileArchive className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Compress PDF Document
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Reduce PDF file size by intelligent image downsampling and object stream compaction.
          All operations run directly in your browser without uploading your documents to any server.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Compress PDF - Botock",
        "url": "https://botock.app/tools/pdf-compress",
        "description": "Compress PDF files online while preserving text readability and font clarity. Fast, private client-side compression with zero uploads.",
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
            "name": "Compress PDF",
            "item": "https://botock.app/tools/pdf-compress",
          },
        ],
      },
    ],
  }),
        }}
      />

      {/* Client Component */}
      <Client />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/pdf-merge"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Merge PDF
          </Link>
          <Link
            href="/tools/pdf-split"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Split PDF
          </Link>
          <Link
            href="/tools/pdf-to-word"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            PDF to Word
          </Link>
        </div>
      </div>
    </div>
  );
}
