import type { Metadata } from "next";
import Link from "next/link";
import { FileText, FileSpreadsheet, Minimize2, CheckCircle2 } from "lucide-react";
import ClientWrapper from "./ClientWrapper";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert HTML to PDF Online Free | Web Page & Code to PDF",
  description:
    "Convert HTML code, web templates, CSS stylesheets, and tables into pixel-perfect PDF documents online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "html to pdf",
    "convert html to pdf free",
    "webpage to pdf",
    "css to pdf converter",
    "html invoice to pdf",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/html-to-pdf",
  },
  openGraph: {
    title: "Convert HTML to PDF Online Free",
    description: "Render HTML templates, CSS styles, and web pages into PDF documents directly in your browser.",
    url: "https://botock.app/tools/html-to-pdf",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert HTML to PDF Online Free",
    description: "Render HTML and CSS templates to printable PDF documents directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function HtmlToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "HTML to PDF Converter - Botock AI",
        url: "https://botock.app/tools/html-to-pdf",
        description: "Render HTML and CSS templates to printable PDF documents directly in your browser.",
        applicationCategory: "BusinessApplication",
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
            name: "HTML to PDF",
            item: "https://botock.app/tools/html-to-pdf",
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

      {/* Semantic Top Navigation Breadcrumb */}
      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">HTML to PDF</span>
          </nav>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Private Client-Side Processing</span>
          </span>
        </div>
      </section>

      {/* Interactive Tool Component */}
      <div className="flex-1">
        <ToolErrorBoundary toolName="HTML to PDF Converter">
          <ClientWrapper />
        </ToolErrorBoundary>
      </div>

      {/* Structured SEO & Internal Link Footer Section */}
      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">
              Convert HTML to PDF Online — Web Code &amp; Templates to PDF
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Render raw HTML markup, styled invoices, responsive templates, or web pages into crisp PDF documents. Perfect for developers, billing generation, and report exports with zero external server dependencies.
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Related Document Converters
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/tools/pdf-to-word"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>PDF to Word</span>
              </Link>
              <Link
                href="/tools/excel-to-pdf"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                <span>Excel to PDF</span>
              </Link>
              <Link
                href="/tools/pdf-compress"
                className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Minimize2 className="w-3.5 h-3.5 text-primary" />
                <span>Compress PDF</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
