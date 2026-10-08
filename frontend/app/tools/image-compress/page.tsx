import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

const ImageCompressClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading Compression Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Compress Image Online Free | Reduce File Size",
  description: "Compress JPG, PNG, WebP, and GIF images online without losing visible quality. Fast, client-side batch image compression.",
  alternates: {
    canonical: "/tools/image-compress",
  },
  openGraph: {
    title: "Compress Image Online Free | Reduce File Size",
    description: "Compress JPG, PNG, WebP, and GIF images online without losing visible quality. Fast, client-side batch image compression.",
    url: "https://botock.app/tools/image-compress",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress Image Online Free | Reduce File Size",
    description: "Compress JPG, PNG, WebP, and GIF images online without losing visible quality. Fast, client-side batch image compression.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageCompressPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Compress Images - Botock AI",
        "url": "https://botock.app/tools/image-compress",
        "description": "Compress JPG, PNG, WebP, and GIF images online without losing visible quality. Fast, client-side batch image compression.",
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
            "name": "Compress Images",
            "item": "https://botock.app/tools/image-compress",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> 100% Client-Side Web Worker
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Compress Image Online
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Reduce JPG, PNG, and WebP file sizes instantly with smart client-side compression. No files are ever sent to a server.
        </p>
      </div>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <ImageCompressClient />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/image-convert"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Convert Image
          </Link>
          <Link
            href="/tools/image-resize"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Resize Image
          </Link>
          <Link
            href="/tools/image-remove-bg"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Remove Background
          </Link>
        </div>
      </div>
    </div>
  );
}
