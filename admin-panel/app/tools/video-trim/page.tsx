import Link from "next/link";
import { Metadata } from "next";
import { Scissors, ShieldCheck } from "lucide-react";
import VideoTrimClient from "./Client";

export const metadata: Metadata = {
  title: "Trim Video Online Free | Fast Lossless Video Cutter",
  description: "Cut and trim video clips with frame-accurate precision in your browser. 0ms latency, zero uploads, instant export.",
  alternates: {
    canonical: "/tools/video-trim",
  },
  openGraph: {
    title: "Trim Video Online Free | Fast Lossless Video Cutter",
    description: "Cut and trim video clips with frame-accurate precision in your browser. 0ms latency, zero uploads, instant export.",
    url: "https://botock.app/tools/video-trim",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trim Video Online Free | Fast Lossless Video Cutter",
    description: "Cut and trim video clips with frame-accurate precision in your browser. 0ms latency, zero uploads, instant export.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoTrimPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Video Cutter & Trimmer - Botock AI",
        "url": "https://botock.app/tools/video-trim",
        "description": "Cut and trim video clips with frame-accurate precision in your browser. 0ms latency, zero uploads, instant export.",
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
            "name": "Video Cutter & Trimmer",
            "item": "https://botock.app/tools/video-trim",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Scissors className="w-8 h-8 text-emerald-500" />
          Trim Video Online
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Cut and extract video clips with lightning-fast lossless speed or frame-accurate precision.
          All processing happens directly in your browser.
        </p>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <VideoTrimClient />
          
      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free Trim Video Online Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>Trim Video Online</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Free of Cost</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enjoy unlimited usage without ever pulling out your credit card. We believe premium tools should be accessible to everyone, completely free of charge.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Sign-Up Required</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Skip the tedious registration process. You don't need to create an account or provide your email address to access our full suite of features.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Absolute Privacy</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We use cutting-edge client-side rendering technology. This means your files stay on your device and are processed locally, guaranteeing zero data retention.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Is Trim Video Online really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our Trim Video Online is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the Trim Video Online immediately without logging in or providing any personal information.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tools Navigation */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Related Tools
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/tools/video-editor"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Video Editor
          </Link>
          <Link
            href="/tools/video-to-mp3"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Extract MP3
          </Link>
          <Link
            href="/tools/video-to-gif"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Video to GIF
          </Link>
        </div>
      </div>
    </div>
  );
}
