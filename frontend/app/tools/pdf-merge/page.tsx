import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFMergeClient = dynamic(() => import("./PDFMergeClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free | Combine Multiple PDFs",
  description: "Combine multiple PDF documents into a single organized file with drag-and-drop page reordering. 100% client-side and secure.",
  alternates: {
    canonical: "/tools/pdf-merge",
  },
  openGraph: {
    title: "Merge PDF Files Online Free | Combine Multiple PDFs",
    description: "Combine multiple PDF documents into a single organized file with drag-and-drop page reordering. 100% client-side and secure.",
    url: "https://botock.app/tools/pdf-merge",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Files Online Free | Combine Multiple PDFs",
    description: "Combine multiple PDF documents into a single organized file with drag-and-drop page reordering. 100% client-side and secure.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PDFMergePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Merge PDF Files
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Combine multiple PDFs into a single document. Processing happens entirely in your browser using WASM, meaning your files are never uploaded to our servers.
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
        "name": "Merge PDF - Botock",
        "url": "https://botock.app/tools/pdf-merge",
        "description": "Combine multiple PDF documents into a single organized file with drag-and-drop page reordering. 100% client-side and secure.",
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
            "name": "Merge PDF",
            "item": "https://botock.app/tools/pdf-merge",
          },
        ],
      },
    ],
  })
        }}
      />

      {/* Client-side processing component */}
      <PDFMergeClient />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/pdf-split"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Split PDF
          </Link>
          <Link
            href="/tools/pdf-compress"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Compress PDF
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
