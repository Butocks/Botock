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
    siteName: "Botock AI",
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
        "name": "Merge PDF - Botock AI",
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
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is it really free to merge PDFs on Botock?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our PDF merger is completely free to use with no hidden fees, no watermarks, and no registration required."
            }
          },
          {
            "@type": "Question",
            "name": "Is my data safe when I upload sensitive documents?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Botock AI relies on client-side rendering, meaning your files are processed in your browser and never transmitted to servers."
            }
          }
        ]
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

      {/* --- Rich SEO Content Section --- */}
      <section className="mt-20 pt-12 border-t border-slate-200 dark:border-white/[0.05] space-y-12">
        
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            The Best Way to Combine PDF Files Online for Free
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Botock AI's PDF Merger provides an enterprise-grade solution for combining multiple PDF documents into a single, beautifully organized file. Unlike traditional tools that upload your sensitive documents to remote servers, our <strong>client-side processing technology</strong> ensures that your files never leave your device. Whether you are merging legal contracts, financial reports, or academic assignments, you get lightning-fast results with absolute privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Secure & Private</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We utilize advanced WebAssembly (WASM) to process PDFs directly inside your browser. No server uploads, no data retention, and no risk of data breaches.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Drag & Drop Ordering</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Easily upload multiple files and drag them into the exact order you need before hitting merge. Total control over your final document's structure.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Zero Quality Loss</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our merging engine preserves your original formatting, fonts, images, and page dimensions, guaranteeing a professional result every time.
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
                Is it really free to merge PDFs on Botock?
              </summary>
              <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes, our PDF merger is completely free to use with no hidden fees, no watermarks, and no registration required for basic document merging.
              </p>
            </details>
            <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                Can I merge PDFs on my mobile phone?
              </summary>
              <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Absolutely! Botock AI is fully optimized for mobile browsers. You can seamlessly select and merge PDF files directly from your iPhone, iPad, or Android device.
              </p>
            </details>
            <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                Is my data safe when I upload sensitive documents?
              </summary>
              <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes. Since Botock AI relies on client-side rendering (processing everything inside your browser's memory), your files are never transmitted to our backend servers. It is the most secure way to handle confidential files.
              </p>
            </details>
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
