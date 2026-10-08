import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { FileText, Server, ShieldCheck } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Word to PDF Engine...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Convert Word to PDF Online Free | DOCX to PDF Converter",
  description: "Convert Microsoft Word (.docx, .doc) files into clean, shareable PDF documents with layout and font preservation.",
  alternates: {
    canonical: "/tools/word-to-pdf",
  },
  openGraph: {
    title: "Convert Word to PDF Online Free | DOCX to PDF Converter",
    description: "Convert Microsoft Word (.docx, .doc) files into clean, shareable PDF documents with layout and font preservation.",
    url: "https://botock.app/tools/word-to-pdf",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Word to PDF Online Free | DOCX to PDF Converter",
    description: "Convert Microsoft Word (.docx, .doc) files into clean, shareable PDF documents with layout and font preservation.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function WordToPdfPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
          <Server className="w-3.5 h-3.5" />
          <span>Backend Powered • FastAPI</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Word to PDF Converter
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
          Transform your Microsoft Word documents (.docx, .doc) into high-fidelity PDF documents with exact typography, formatting, and layout retention.
        </p>
      </div>

      {/* JSON-LD SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Word to PDF - Botock AI",
        "url": "https://botock.app/tools/word-to-pdf",
        "description": "Convert Microsoft Word (.docx, .doc) files into clean, shareable PDF documents with layout and font preservation.",
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
            "name": "Word to PDF",
            "item": "https://botock.app/tools/word-to-pdf",
          },
        ],
      },
    ],
  }),
        }}
      />

      {/* Client Component */}
      <Client />

      {/* Feature Highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">High-Fidelity Rendering</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Preserves original fonts, tables, margins, headers, footers, and complex graphics with pixel precision.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Server-Side Conversion</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Powered by high-performance backend headless document engines capable of converting both modern DOCX and legacy DOC formats.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Secure &amp; Ephemeral</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Files are processed ephemerally in isolated temporary directories and automatically cleaned up immediately after conversion.
          </p>
        </div>
      </div>
          
      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free Word to PDF Converter Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>Word to PDF Converter</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
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
                  Is Word to PDF Converter really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our Word to PDF Converter is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the Word to PDF Converter immediately without logging in or providing any personal information.
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
            href="/tools/pdf-to-word"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            PDF to Word
          </Link>
          <Link
            href="/tools/excel-to-pdf"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Excel to PDF
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
