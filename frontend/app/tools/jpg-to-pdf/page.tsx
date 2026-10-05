import Link from "next/link";
import { Metadata } from "next";
import { FileText, ShieldCheck } from "lucide-react";
import JpgToPdfClient from "./Client";

export const metadata: Metadata = {
  title: "Convert JPG to PDF Online Free | Combine Images to PDF",
  description: "Convert JPG, PNG, and WebP images into a single professional PDF document. Reorder pages and adjust margins in your browser.",
  alternates: {
    canonical: "/tools/jpg-to-pdf",
  },
  openGraph: {
    title: "Convert JPG to PDF Online Free | Combine Images to PDF | Botock",
    description: "Convert JPG, PNG, and WebP images into a single professional PDF document. Reorder pages and adjust margins in your browser.",
    url: "https://botock.app/tools/jpg-to-pdf",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert JPG to PDF Online Free | Combine Images to PDF | Botock",
    description: "Convert JPG, PNG, and WebP images into a single professional PDF document. Reorder pages and adjust margins in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function JpgToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "JPG to PDF - Botock",
        "url": "https://botock.app/tools/jpg-to-pdf",
        "description": "Convert JPG, PNG, and WebP images into a single professional PDF document. Reorder pages and adjust margins in your browser.",
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
            "name": "JPG to PDF",
            "item": "https://botock.app/tools/jpg-to-pdf",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-amber-500" />
          Convert JPG to PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Combine, reorder, and convert multiple photos and scans into a single organized PDF document. Zero server uploads and zero file size limits.
        </p>
      </div>

      <JpgToPdfClient />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/pdf-to-jpg"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            PDF to JPG
          </Link>
          <Link
            href="/tools/pdf-merge"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Merge PDF
          </Link>
          <Link
            href="/tools/pdf-compress"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Compress PDF
          </Link>
        </div>
      </div>
    </div>
  );
}
