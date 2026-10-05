import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { FileText, Server } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading PDF to Word Conversion Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Convert PDF to Word Online Free | Convert PDF to DOCX",
  description: "Transform PDF documents into editable Microsoft Word (.docx) documents with high formatting, table, and font accuracy.",
  alternates: {
    canonical: "/tools/pdf-to-word",
  },
  openGraph: {
    title: "Convert PDF to Word Online Free | Convert PDF to DOCX | Botock",
    description: "Transform PDF documents into editable Microsoft Word (.docx) documents with high formatting, table, and font accuracy.",
    url: "https://botock.app/tools/pdf-to-word",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to Word Online Free | Convert PDF to DOCX | Botock",
    description: "Transform PDF documents into editable Microsoft Word (.docx) documents with high formatting, table, and font accuracy.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PdfToWordPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "PDF to Word - Botock",
        "url": "https://botock.app/tools/pdf-to-word",
        "description": "Transform PDF documents into editable Microsoft Word (.docx) documents with high formatting, table, and font accuracy.",
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
            "name": "PDF to Word",
            "item": "https://botock.app/tools/pdf-to-word",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <Server className="w-4 h-4" />
          <span>Backend Powered • FastAPI</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            PDF to Word Converter
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Transform your PDF files into editable Microsoft Word documents (.docx).
          Preserves original formatting, tables, text styles, and layout structure with high accuracy.
        </p>
      </div>

      {/* JSON-LD Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
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
            href="/tools/word-to-pdf"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Word to PDF
          </Link>
          <Link
            href="/tools/pdf-to-excel"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            PDF to Excel
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
