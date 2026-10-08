import Link from "next/link";
import { Metadata } from "next";
import Client from "./Client";
import { ToolRegistry } from "../ToolEngine";

const tool = ToolRegistry.getTool("pdf-forms");

export const metadata: Metadata = {
  title: "Fill & Sign PDF Forms Online Free | AcroForms Tool",
  description: "Interactively fill out PDF text fields, checkboxes, radio buttons, and sign documents online with 100% client-side privacy.",
  alternates: {
    canonical: "/tools/pdf-forms",
  },
  openGraph: {
    title: "Fill & Sign PDF Forms Online Free | AcroForms Tool",
    description: "Interactively fill out PDF text fields, checkboxes, radio buttons, and sign documents online with 100% client-side privacy.",
    url: "https://botock.app/tools/pdf-forms",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fill & Sign PDF Forms Online Free | AcroForms Tool",
    description: "Interactively fill out PDF text fields, checkboxes, radio buttons, and sign documents online with 100% client-side privacy.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function PDFFormsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Fill & Sign PDF Forms - Botock AI",
        "url": "https://botock.app/tools/pdf-forms",
        "description": "Interactively fill out PDF text fields, checkboxes, radio buttons, and sign documents online with 100% client-side privacy.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://botock.app" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://botock.app/tools" },
          { "@type": "ListItem", "position": 3, "name": "Fill PDF Forms", "item": "https://botock.app/tools/pdf-forms" }
        ]
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
          {tool?.name || "Create Fillable PDF"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {tool?.description}
        </p>
      </div>

      <Client />
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
            href="/tools/pdf-protect"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            Protect PDF
          </Link>
          <Link
            href="/tools/pdf-to-word"
            className="px-3.5 py-1.5 rounded-lg bg-card border border-border/60 hover:border-primary text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            PDF to Word
          </Link>
        </div>
      </div>
    </div>
  );
}
