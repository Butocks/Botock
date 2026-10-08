import Link from "next/link";
import { Metadata } from "next";
import Client from "./Client";
import { ToolRegistry } from "../ToolEngine";

const tool = ToolRegistry.getTool("pdf-to-book");

export const metadata: Metadata = {
  title: "PDF to Booklet Viewer Online Free | Two-Page Reading",
  description: "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
  alternates: {
    canonical: "/tools/pdf-to-book",
  },
  openGraph: {
    title: "PDF to Booklet Viewer Online Free | Two-Page Reading",
    description: "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
    url: "https://botock.app/tools/pdf-to-book",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Booklet Viewer Online Free | Two-Page Reading",
    description: "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PDFToBookPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "PDF to Booklet Viewer - Botock AI",
        "url": "https://botock.app/tools/pdf-to-book",
        "description": "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://botock.app" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://botock.app/tools" },
          { "@type": "ListItem", "position": 3, "name": "PDF to Booklet Viewer", "item": "https://botock.app/tools/pdf-to-book" }
        ]
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
          {tool?.name || "PDF to Book"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {tool?.description || "Read your PDFs like a real book with an immersive side-by-side view."}
        </p>
      </div>

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
            href="/tools/pdf-ai-summarizer"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            PDF AI Summarizer
          </Link>
          <Link
            href="/tools/organize-pdf"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Organize PDF
          </Link>
        </div>
      </div>
    </div>
  );
}
