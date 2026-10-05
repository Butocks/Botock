import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFPageDeleteClient = dynamic(() => import("./PDFPageDeleteClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Delete PDF Pages Online Free | Remove Unwanted Pages",
  description: "Remove unwanted, blank, or confidential pages from any PDF document in your browser with real-time thumbnail selection.",
  alternates: {
    canonical: "/tools/pdf-page-delete",
  },
  openGraph: {
    title: "Delete PDF Pages Online Free | Remove Unwanted Pages",
    description: "Remove unwanted, blank, or confidential pages from any PDF document in your browser with real-time thumbnail selection.",
    url: "https://botock.app/tools/pdf-page-delete",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delete PDF Pages Online Free | Remove Unwanted Pages",
    description: "Remove unwanted, blank, or confidential pages from any PDF document in your browser with real-time thumbnail selection.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PDFPageDeletePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Delete PDF Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Remove unwanted blank, confidential, or duplicate pages from your document. Processing runs 100% locally in your browser.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Delete PDF Pages - Botock",
        "url": "https://botock.app/tools/pdf-page-delete",
        "description": "Remove unwanted, blank, or confidential pages from any PDF document in your browser with real-time thumbnail selection.",
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
            "name": "Delete PDF Pages",
            "item": "https://botock.app/tools/pdf-page-delete",
          },
        ],
      },
    ],
  }),
        }}
      />

      <PDFPageDeleteClient />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/organize-pdf"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Organize PDF
          </Link>
          <Link
            href="/tools/pdf-split"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Split PDF
          </Link>
          <Link
            href="/tools/pdf-merge"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Merge PDF
          </Link>
        </div>
      </div>
    </div>
  );
}
