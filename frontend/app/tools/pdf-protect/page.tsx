import { Metadata } from "next";
import { Lock, ShieldCheck } from "lucide-react";
import PdfProtectClient from "./Client";

export const metadata: Metadata = {
  title: "Password Protect PDF Online Free - Encrypt PDF - Botock",
  description:
    "Secure your PDF files with password protection and encryption directly in your browser. 100% private, client-side WASM processing with zero server uploads.",
  openGraph: {
    title: "Password Protect PDF Online Free - Botock",
    description:
      "Encrypt and protect PDF documents with password security locally in your browser.",
    type: "website",
  },
  keywords: [
    "protect pdf",
    "password protect pdf",
    "encrypt pdf online",
    "free pdf locker",
    "secure pdf",
  ],
};

export default function PdfProtectPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock PDF Protect Tool",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Encrypt and password protect PDF documents locally in your browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Custom user password protection",
      "WASM client-side document processing",
      "100% Client-Side Privacy",
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
    </div>
  );
}
