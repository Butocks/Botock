import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const PDFSplitClient = dynamic(() => import("./PDFSplitClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Tool Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Split PDF Online Free | Extract Pages from PDF",
  description: "Extract specific page ranges or split large PDF files into standalone documents with zero quality loss and complete privacy.",
  alternates: {
    canonical: "/tools/pdf-split",
  },
  openGraph: {
    title: "Split PDF Online Free | Extract Pages from PDF",
    description: "Extract specific page ranges or split large PDF files into standalone documents with zero quality loss and complete privacy.",
    url: "https://botock.app/tools/pdf-split",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online Free | Extract Pages from PDF",
    description: "Extract specific page ranges or split large PDF files into standalone documents with zero quality loss and complete privacy.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PDFSplitPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Split & Extract PDF Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Extract specific pages or page ranges from your PDF. Running client-side via WASM ensures your documents stay completely secure on your machine.
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
        "name": "Split PDF - Botock AI",
        "url": "https://botock.app/tools/pdf-split",
        "description": "Extract specific page ranges or split large PDF files into standalone documents with zero quality loss and complete privacy.",
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
            "name": "Split PDF",
            "item": "https://botock.app/tools/pdf-split",
          },
        ],
      },
    ],
  }),
        }}
      />

      <PDFSplitClient />
          
      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free Split & Extract PDF Pages Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>Split & Extract PDF Pages</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
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
                  Is Split & Extract PDF Pages really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our Split & Extract PDF Pages is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the Split & Extract PDF Pages immediately without logging in or providing any personal information.
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
            href="/tools/pdf-merge"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Merge PDF
          </Link>
          <Link
            href="/tools/organize-pdf"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Organize PDF
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
