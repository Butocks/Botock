import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { CheckCircle2 } from "lucide-react";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolLoader } from "@/components/ui/ToolLoader";
import { ToolRegistry } from "../ToolEngine";

const Client = dynamic(() => import("./Client"), {
  loading: () => <ToolLoader message="Loading Booklet Viewer Engine..." />,
});

const tool = ToolRegistry.getTool("pdf-to-book");

export const metadata: Metadata = {
  title: "PDF to Booklet Viewer Online Free | Two-Page Reading",
  description: "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
  alternates: {
    canonical: "/tools/pdf-to-book",
  },
  openGraph: {
    title: "PDF to Booklet Viewer Online Free | Two-Page Reading",
    description: "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
    url: "https://botock.app/tools/pdf-to-book",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Booklet Viewer Online Free | Two-Page Reading",
    description: "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PDFToBookPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "PDF to Booklet Viewer - Botock AI",
        "url": "https://botock.app/tools/pdf-to-book",
        "description": "View and read PDF documents in an immersive side-by-side booklet format with realistic pagination and reading controls.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://botock.app" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://botock.app/tools" },
          { "@type": "ListItem", "position": 3, "name": "PDF to Booklet Viewer", "item": "https://botock.app/tools/pdf-to-book" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is PDF to Book really free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Our PDF to Book viewer is 100% free of charge with no hidden fees and no sign-up required."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to create an account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No sign-up is required. You can read your PDFs as booklets directly in your browser."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="w-full flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Semantic Top Navigation Breadcrumb */}
      <section className="bg-slate-100/60 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.08] py-2.5 px-4 sm:px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">PDF to Book</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Private Client-Side Processing</span>
          </span>
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            {tool?.name || "PDF to Book"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {tool?.description || "Read your PDFs like a real book with an immersive side-by-side view."}
          </p>
        </div>

        <ToolErrorBoundary toolName="PDF to Book">
          <Client />
        </ToolErrorBoundary>
            
        {/* --- Enterprise SEO Content --- */}
        <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                The Best Free {tool?.name || "PDF to Book"} Online
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Experience the fastest and most secure way to use our <strong>{tool?.name || "PDF to Book"}</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
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
                    Is {tool?.name || "PDF to Book"} really free to use?
                  </summary>
                  <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Yes! Our {tool?.name || "PDF to Book"} is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                  </p>
                </details>
                <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                    Do I need to create an account?
                  </summary>
                  <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    No sign-up is required. You can start using the {tool?.name || "PDF to Book"} immediately without logging in or providing any personal information.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools Navigation */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/[0.08]">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Related Tools
          </h3>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/tools/pdf-merge"
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-amber-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Merge PDF
            </Link>
            <Link
              href="/tools/pdf-ai-summarizer"
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-amber-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              PDF AI Summarizer
            </Link>
            <Link
              href="/tools/organize-pdf"
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-amber-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Organize PDF
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
