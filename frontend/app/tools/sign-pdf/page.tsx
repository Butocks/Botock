import { Metadata } from "next";
import { PenTool, ShieldCheck } from "lucide-react";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - Draw & Type Digital Signature - Botock",
  description:
    "Sign PDF contracts and forms electronically in your browser. Draw, type, or upload your signature, position it with precision, and download legally signed documents. 100% private, zero server uploads.",
  openGraph: {
    title: "Sign PDF Online Free - Botock",
    description:
      "Sign PDF documents electronically with zero server uploads.",
    type: "website",
  },
  keywords: [
    "sign pdf",
    "electronic signature",
    "draw signature on pdf",
    "type signature",
    "free pdf signer",
    "digital signature online",
  ],
};

export default function SignPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock Sign PDF Tool",
    "operatingSystem": "Any",
    "applicationCategory": "BusinessApplication",
    "description":
      "Sign PDF contracts and forms electronically directly in the browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Draw, type, and upload signature modes",
      "Interactive page-level stamp positioning",
      "Client-side WASM signing with zero server uploads",
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
          <PenTool className="w-8 h-8 text-violet-500" />
          Sign PDF Document
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Sign contracts, agreements, and NDAs with legal clarity. Draw your signature or type your name with elegant calligraphy, position it on any page, and download instantly.
        </p>
      </div>

      <ClientWrapper />
    </div>
  );
}
