import Link from "next/link";
import { Metadata } from "next";
import { Lock, ShieldCheck } from "lucide-react";
import PdfProtectClient from "./Client";

export const metadata: Metadata = {
  title: "Password Protect PDF Online Free | 256-Bit AES Encryption",
  description: "Encrypt sensitive PDF documents with secure passwords directly in your browser. Prevents unauthorized opening and printing.",
  alternates: {
    canonical: "/tools/pdf-protect",
  },
  openGraph: {
    title: "Password Protect PDF Online Free | 256-Bit AES Encryption",
    description: "Encrypt sensitive PDF documents with secure passwords directly in your browser. Prevents unauthorized opening and printing.",
    url: "https://botock.app/tools/pdf-protect",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Password Protect PDF Online Free | 256-Bit AES Encryption",
    description: "Encrypt sensitive PDF documents with secure passwords directly in your browser. Prevents unauthorized opening and printing.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PdfProtectPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Password Protect PDF - Botock",
        "url": "https://botock.app/tools/pdf-protect",
        "description": "Encrypt sensitive PDF documents with secure passwords directly in your browser. Prevents unauthorized opening and printing.",
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
            "name": "Password Protect PDF",
            "item": "https://botock.app/tools/pdf-protect",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Lock className="w-8 h-8 text-violet-500" />
          Password Protect PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Encrypt your private PDFs with password security. Your sensitive documents and passwords never leave your browser.
        </p>
      </div>

      <PdfProtectClient />
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
            href="/tools/pdf-watermark"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Watermark PDF
          </Link>
          <Link
            href="/tools/pdf-forms"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            PDF Forms
          </Link>
        </div>
      </div>
    </div>
  );
}
