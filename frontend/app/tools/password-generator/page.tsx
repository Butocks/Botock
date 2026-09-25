import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Secure Password Generator Online Free - High Entropy Random Passwords | Botock Tools",
  description:
    "Generate strong, random, cryptographically secure passwords online for free with custom symbols, numbers, and length directly in your browser.",
  keywords: [
    "secure password generator",
    "random password creator",
    "password generator free online",
    "strong password maker",
    "crypto password generator browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/password-generator",
  },
  openGraph: {
    title: "Secure Password Generator Online Free - Botock Tools",
    description: "Generate high-entropy secure passwords directly in your browser with zero server storage.",
    url: "https://botock.com/tools/password-generator",
    siteName: "Botock",
    type: "website",
  },
};

export default function PasswordGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Secure Password Generator - Botock Tools",
    url: "https://botock.com/tools/password-generator",
    description: "Generate cryptographically secure passwords directly in your browser.",
    applicationCategory: "SecurityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolErrorBoundary toolName="Secure Password Generator">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
