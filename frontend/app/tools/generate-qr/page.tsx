import { Metadata } from "next";
import { QrCode, ShieldCheck } from "lucide-react";
import QrGeneratorClient from "./Client";

export const metadata: Metadata = {
  title: "Free QR Code Generator Online - Custom Colors & Wi-Fi - Botock",
  description:
    "Generate high-resolution QR codes for websites, Wi-Fi networks, text, email, and phone numbers. Customize foreground and background colors with instant PNG download.",
  openGraph: {
    title: "Free QR Code Generator Online - Botock",
    description:
      "Create custom QR codes instantly with custom colors, URLs, and Wi-Fi networks.",
    type: "website",
  },
  keywords: [
    "qr code generator",
    "free qr code",
    "wifi qr code",
    "url qr code",
    "custom qr code",
    "qr generator online",
  ],
};

export default function QrGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Botock QR Code Generator",
    "operatingSystem": "Any",
    "applicationCategory": "UtilitiesApplication",
    "description":
      "Generate custom QR codes for websites, text, and Wi-Fi networks in your browser.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "URL, Plain Text, Wi-Fi, Email, and Phone QR codes",
      "Custom foreground and background colors",
      "High resolution instant PNG download",
      "100% Free & Unlimited",
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Free • No Sign-Up Needed
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          <QrCode className="w-8 h-8 text-sky-500" />
          QR Code Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Create customized, high-resolution QR codes for websites, Wi-Fi credentials, contact details, and marketing campaigns in seconds.
        </p>
      </div>

      <QrGeneratorClient />
    </div>
  );
}
