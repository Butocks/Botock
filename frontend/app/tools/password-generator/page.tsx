import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Password Generator & Hacker Time-to-Crack Calculator | Botock",
  description:
    "Generate strong cryptographically secure passwords and Diceware passphrases with real-time brute force cracking time analysis directly in your browser.",
  keywords: [
    "secure password generator",
    "password strength calculator",
    "time to crack password",
    "diceware passphrase generator",
    "crypto password generator browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/password-generator",
  },
  openGraph: {
    title: "Password Generator & Hacker Time-to-Crack Calculator - Botock",
    description: "Generate high-entropy secure passwords and calculate brute force crack time.",
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
