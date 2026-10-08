import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading AI Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "AI Background Remover Online Free | Batch Background Removal",
  description: "Remove backgrounds from photos and portraits instantly with high-precision AI. Download transparent PNGs with zero server uploads.",
  alternates: {
    canonical: "/tools/image-remove-bg",
  },
  openGraph: {
    title: "AI Background Remover Online Free | Batch Background Removal",
    description: "Remove backgrounds from photos and portraits instantly with high-precision AI. Download transparent PNGs with zero server uploads.",
    url: "https://botock.app/tools/image-remove-bg",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Background Remover Online Free | Batch Background Removal",
    description: "Remove backgrounds from photos and portraits instantly with high-precision AI. Download transparent PNGs with zero server uploads.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageRemoveBGPage() {
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "AI Background Remover - Botock AI",
      "url": "https://botock.app/tools/image-remove-bg",
      "description": "Remove backgrounds from photos instantly with AI. Download transparent PNGs with zero server uploads.",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://botock.app" },
        { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://botock.app/tools" },
        { "@type": "ListItem", "position": 3, "name": "AI Background Remover", "item": "https://botock.app/tools/image-remove-bg" }
      ]
    }
  ]
};

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>AI Powered & Batch Supported</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          AI Background Remover
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium">
          Upload one or multiple images and our AI will magically remove the backgrounds in seconds. Perfect for products, portraits, and graphics.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1a22] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-4 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none relative z-10">
        <Client />
            
      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free AI Background Remover Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>AI Background Remover</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
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
                  Is AI Background Remover really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our AI Background Remover is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the AI Background Remover immediately without logging in or providing any personal information.
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
            href="/tools/image-compress"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Compress Images
          </Link>
          <Link
            href="/tools/image-crop"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Crop Image
          </Link>
          <Link
            href="/tools/image-generator"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            AI Image Studio
          </Link>
        </div>
      </div>
    </div>
    </main>
  );
}
