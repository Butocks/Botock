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
          
      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free {tool?.name || "Create Fillable PDF"} Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>{tool?.name || "Create Fillable PDF"}</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
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
                  Is {tool?.name || "Create Fillable PDF"} really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our {tool?.name || "Create Fillable PDF"} is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the {tool?.name || "Create Fillable PDF"} immediately without logging in or providing any personal information.
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
