import type { Metadata } from "next";
import Link from "next/link";
import { Languages, FileText, Minimize2, Wrench, CheckCircle2 } from "lucide-react";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Translate PDF Online Free | Translate PDF Documents to 18+ Languages - Botock",
  description:
    "Translate PDF documents online into Spanish, French, German, Chinese, Japanese, Arabic, and 18+ languages for free. Maintain formatting, view side-by-side comparisons, and download translated or bilingual PDFs directly in your browser.",
  keywords: [
    "translate pdf",
    "pdf translator free",
    "translate pdf document online",
    "translate english pdf to spanish",
    "bilingual pdf translator",
    "pdf language translator",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/translate-pdf",
  },
  openGraph: {
    title: "Translate PDF Online Free - Botock",
    description: "Translate PDF documents into 18+ international languages directly in your browser with live side-by-side preview.",
    url: "https://botock.app/tools/translate-pdf",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Translate PDF Online Free - Botock",
    description: "Translate PDF documents into 18+ international languages directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function TranslatePdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Translate PDF - Botock AI",
        url: "https://botock.app/tools/translate-pdf",
        description: "Translate PDF text into 18+ international languages directly in your browser.",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
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
            name: "Translate PDF",
            item: "https://botock.app/tools/translate-pdf",
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Interactive Tool Component */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="Translate PDF">
          <ClientWrapper />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Translate PDF Documents Online — Multi-Language Document Translation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
              Translate foreign contracts, academic articles, manuals, and reports into Spanish, French, German, Chinese, Japanese, Arabic, and more. Features synchronized side-by-side dual reading, paragraph editing, and one-click export to translated or bilingual PDF documents.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08]">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Related PDF Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/repair-pdf"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                <span>Repair Corrupted PDF</span>
              </Link>
              <Link
                href="/tools/pdf-to-word"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>PDF to Word</span>
              </Link>
              <Link
                href="/tools/pdf-compress"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
              >
                <Minimize2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Compress PDF</span>
              </Link>
              <Link
                href="/tools/pdf-merge"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Merge PDF</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12 pb-16">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free Online PDF Document Translator
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to translate PDF files with Botock AI. We provide unlimited translation access with absolutely no charges, no hidden fees, and no sign-up required. Your documents are parsed directly in your browser, maintaining complete privacy while delivering high-accuracy translation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Free of Cost</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enjoy unlimited document translation without credit card subscriptions or usage quotas. Designed for researchers, global travelers, and international businesses.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Side-by-Side Dual View</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Review the original text alongside its translation in synchronized dual view. Spot nuances and verify terms easily before downloading the final document.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Bilingual Export Options</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Download a fully translated standalone PDF, a bilingual side-by-side reference document, or export raw text into TXT or clipboard formats with one click.
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
                  Which languages can I translate my PDF into?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Botock supports 18+ major languages including English, Spanish, French, German, Italian, Portuguese, Russian, Simplified Chinese, Japanese, Korean, Arabic, Hindi, Urdu, Vietnamese, Turkish, Dutch, Polish, and Indonesian.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Can I edit the translation before downloading the PDF?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our built-in Editor tab lets you review and modify any paragraph of the translated text before generating the final PDF.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Are my uploaded documents secure?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes. Document parsing and layout reconstruction are performed entirely on your device. We do not store or keep copies of your documents on any server.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
