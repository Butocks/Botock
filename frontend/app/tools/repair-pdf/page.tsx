import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, FileText, Minimize2, FolderTree, CheckCircle2 } from "lucide-react";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Repair Corrupted PDF Online Free | Recover Damaged PDF Files - Botock",
  description:
    "Repair corrupted, broken, or unreadable PDF files online for free. Reconstruct cross-reference tables, fix truncated EOF headers, and recover damaged documents directly in your browser with zero server uploads.",
  keywords: [
    "repair pdf",
    "fix corrupted pdf",
    "recover damaged pdf",
    "repair pdf online",
    "rebuild pdf xref table",
    "pdf recovery tool",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/repair-pdf",
  },
  openGraph: {
    title: "Repair Corrupted PDF Online Free - Botock",
    description: "Recover and repair corrupt, damaged, or unreadable PDF files directly in your browser with zero server uploads.",
    url: "https://botock.app/tools/repair-pdf",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repair Corrupted PDF Online Free - Botock",
    description: "Recover and repair corrupt PDF documents directly in your browser with complete privacy.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function RepairPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Repair Corrupted PDF - Botock AI",
        url: "https://botock.app/tools/repair-pdf",
        description: "Rebuild cross-reference tables and recover broken, unreadable PDF files directly in your browser.",
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
            name: "Repair Corrupted PDF",
            item: "https://botock.app/tools/repair-pdf",
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
        <ToolErrorBoundary toolName="Repair Corrupted PDF">
          <ClientWrapper />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Repair Damaged &amp; Corrupted PDF Files Online
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
              Restore unreadable or damaged PDF documents caused by interrupted downloads, storage corruptions, broken cross-reference (xref) offset tables, or truncated end-of-file markers. Rebuilds file structure and recovers readable pages with complete local privacy.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08]">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Related PDF Utilities
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/organize-pdf"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <FolderTree className="w-3.5 h-3.5 text-emerald-500" />
                <span>Organize PDF</span>
              </Link>
              <Link
                href="/tools/pdf-merge"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Merge PDF</span>
              </Link>
              <Link
                href="/tools/pdf-compress"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <Minimize2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Compress PDF</span>
              </Link>
              <Link
                href="/tools/translate-pdf"
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Translate PDF</span>
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
              The Best Free Online Corrupted PDF Repair Tool
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to repair damaged PDF documents with Botock AI. We provide unlimited recovery access with absolutely no charges, no credit cards, and no registration required. All document parsing and cross-reference table rebuilding happens locally inside your browser, ensuring your private financial, legal, and personal documents never touch an external server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Free of Cost</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enjoy unlimited document repairs without monthly subscriptions or hidden paywalls. High-tier file reconstruction for students, businesses, and developers.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Sign-Up Required</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Repair broken PDFs immediately without creating an account or submitting personal credentials. Drop your damaged file and restore it in seconds.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Client-Side Security</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Using cutting-edge WebAssembly and in-browser parsing, your documents are processed strictly on your hardware. Zero data collection or server storage.
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
                  How does Botock repair corrupted PDF files?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Our repair engine scans the binary structure of your PDF to identify damaged cross-reference (xref) offset indices, shifted %PDF headers, and truncated %%EOF markers. It re-aligns byte boundaries, repairs root dictionaries, and re-serializes clean, standard-compliant PDF files that any PDF reader can open.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Can it recover files with ruined or truncated pages?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! With our Deep Page Salvage mode, even if internal object tables are unparseable, our fault-tolerant renderer recovers individual readable pages and reconstructs them into a new pristine PDF document.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Are my files uploaded or stored on any server?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No. The repair process runs completely client-side in your web browser. Your files never leave your device, ensuring total privacy for sensitive financial or legal paperwork.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
