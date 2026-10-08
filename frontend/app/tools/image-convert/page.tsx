import Link from "next/link";
import { Metadata } from "next";
import { Image as ImageIcon, ShieldCheck } from "lucide-react";
import ImageConvertClient from "./Client";

export const metadata: Metadata = {
  title: "Convert Image Format Online Free | WebP, PNG, JPG",
  description: "Convert images between WebP, PNG, JPG, BMP, and GIF formats online in your browser with zero server uploads.",
  alternates: {
    canonical: "/tools/image-convert",
  },
  openGraph: {
    title: "Convert Image Format Online Free | WebP, PNG, JPG",
    description: "Convert images between WebP, PNG, JPG, BMP, and GIF formats online in your browser with zero server uploads.",
    url: "https://botock.app/tools/image-convert",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Image Format Online Free | WebP, PNG, JPG",
    description: "Convert images between WebP, PNG, JPG, BMP, and GIF formats online in your browser with zero server uploads.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageConvertPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Image Converter - Botock AI",
        "url": "https://botock.app/tools/image-convert",
        "description": "Convert images between WebP, PNG, JPG, BMP, and GIF formats online in your browser with zero server uploads.",
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
            "name": "Image Converter",
            "item": "https://botock.app/tools/image-convert",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-emerald-500" />
          Image Format Converter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Convert your photos and graphics to lightweight WebP, transparent PNG, or high-compatibility JPG with instant browser processing.
        </p>
      </div>

      <ImageConvertClient />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/image-compress"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Compress Images
          </Link>
          <Link
            href="/tools/jpg-to-pdf"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            JPG to PDF
          </Link>
          <Link
            href="/tools/image-resize"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Resize Image
          </Link>
        </div>
      </div>
    </div>
  );
}
