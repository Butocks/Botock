import type { Metadata } from "next";
import Link from "next/link";
import { Image as ImageIcon, ShieldCheck, FileText, Minimize2 } from "lucide-react";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "Convert PDF to JPG Online Free | High Resolution (300 DPI)",
  description:
    "Convert PDF pages into high-resolution JPG images directly in your browser. Choose between 150 DPI and 300 DPI, preview pages, and download single images or a ZIP archive.",
  alternates: {
    canonical: "/tools/pdf-to-jpg",
  },
  openGraph: {
    title: "Convert PDF to JPG Online Free | Botock",
    description:
      "Convert PDF pages to JPG images in your browser with zero server uploads.",
    url: "https://botock.app/tools/pdf-to-jpg",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to JPG Online Free | Botock",
    description: "Convert PDF pages to JPG images in your browser with zero server uploads.",
    images: ["https://botock.app/og-image.jpg"],
  },
  keywords: [
    "pdf to jpg",
    "pdf to jpeg",
    "convert pdf to images",
    "extract images from pdf",
    "pdf to jpg 300 dpi",
    "free pdf to jpg",
  ],
};

export default function PdfToJpgPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Botock PDF to JPG Converter",
        url: "https://botock.app/tools/pdf-to-jpg",
        operatingSystem: "Any",
        applicationCategory: "UtilitiesApplication",
        description:
          "Convert PDF documents into high-resolution JPG images locally in your browser.",
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
            name: "PDF to JPG",
            item: "https://botock.app/tools/pdf-to-jpg",
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
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private &amp; Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-amber-500" />
          Convert PDF to JPG Online
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Extract every page of your PDF as high-resolution JPG images. Select individual pages or convert entire documents into a zip archive with zero server uploads.
        </p>
      </div>

      <ClientWrapper />

      {/* Related Tools Internal Links */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Document &amp; Image Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/jpg-to-pdf"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>JPG to PDF</span>
          </Link>
          <Link
            href="/tools/pdf-to-word"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>PDF to Word</span>
          </Link>
          <Link
            href="/tools/image-compress"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5 text-primary" />
            <span>Compress Images</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
