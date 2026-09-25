import { Metadata } from "next";
import { Unlock, ShieldCheck } from "lucide-react";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "Unlock PDF Online Free - Remove PDF Password & Restrictions - Botock",
  description:
    "Remove PDF passwords and security restrictions permanently in your browser. Unlocks viewing, editing, and printing with zero server uploads and 100% privacy.",
  openGraph: {
    title: "Unlock PDF Online Free - Botock",
    description:
      "Remove PDF passwords and restrictions locally in your browser with zero server uploads.",
    type: "website",
  },
  keywords: [
    "unlock pdf",
    "remove pdf password",
    "pdf decrypter",
    "free pdf unlocker",
    "decrypt pdf online",
  ],
};

export default function UnlockPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Unlock PDF Tool",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Remove passwords and security restrictions from PDF files directly in the browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Permanent password and encryption removal",
      "Strips printing, editing, and copying restrictions",
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side • Private & Secure
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Unlock className="w-8 h-8 text-emerald-500" />
          Unlock PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Remove passwords and permissions from protected PDFs. Enter your password once to produce a clean version that opens freely on all devices.
        </p>
      </div>

      <ClientWrapper />
    </div>
  );
}
