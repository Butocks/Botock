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
    title: "Convert PDF to JPG Online Free",
    description:
      "Convert PDF pages to JPG images in your browser with zero server uploads.",
    url: "https://botock.app/tools/pdf-to-jpg",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to JPG Online Free",
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

      
      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free Convert PDF to JPG Online Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>Convert PDF to JPG Online</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
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
                  Is Convert PDF to JPG Online really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our Convert PDF to JPG Online is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the Convert PDF to JPG Online immediately without logging in or providing any personal information.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

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
