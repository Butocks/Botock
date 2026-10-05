import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Image Resizer...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Resize Image Online Free | Change Pixel Dimensions",
  description: "Resize photos and images in pixels or percentages while locking aspect ratio. Fast, free, and completely client-side.",
  alternates: {
    canonical: "/tools/image-resize",
  },
  openGraph: {
    title: "Resize Image Online Free | Change Pixel Dimensions",
    description: "Resize photos and images in pixels or percentages while locking aspect ratio. Fast, free, and completely client-side.",
    url: "https://botock.app/tools/image-resize",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resize Image Online Free | Change Pixel Dimensions",
    description: "Resize photos and images in pixels or percentages while locking aspect ratio. Fast, free, and completely client-side.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageResizePage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Resize Image
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Resize pictures by exact dimensions or percentage. All image processing happens instantly in your browser to protect your privacy.
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
        "name": "Resize Image - Botock",
        "url": "https://botock.app/tools/image-resize",
        "description": "Resize photos and images in pixels or percentages while locking aspect ratio. Fast, free, and completely client-side.",
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
            "name": "Resize Image",
            "item": "https://botock.app/tools/image-resize",
          },
        ],
      },
    ],
  }),
        }}
      />

      <Client />
          {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/image-crop"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Crop Image
          </Link>
          <Link
            href="/tools/image-compress"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Compress Images
          </Link>
          <Link
            href="/tools/image-convert"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Convert Image
          </Link>
        </div>
      </div>
    </div>
  );
}
