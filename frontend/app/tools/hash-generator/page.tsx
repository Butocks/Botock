import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Hash Generator Online Free - SHA-256, SHA-512, MD5, SHA-1 | Botock Tools",
  description:
    "Generate secure cryptographic hashes (SHA-256, SHA-512, MD5, SHA-1) online for free. Works directly in your browser with zero file or text uploads.",
  keywords: [
    "hash generator",
    "sha256 generator online free",
    "md5 checksum generator",
    "sha512 hash generator",
    "hash text online browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/hash-generator",
  },
  openGraph: {
    title: "Hash Generator Online Free - Botock Tools",
    description: "Generate SHA-256, SHA-512, MD5, and SHA-1 cryptographic hashes directly in your browser.",
    url: "https://botock.com/tools/hash-generator",
    siteName: "Botock",
    type: "website",
  },
};

export default function HashGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cryptographic Hash Generator - Botock Tools",
    url: "https://botock.com/tools/hash-generator",
    description: "Generate SHA-256, SHA-512, and MD5 hashes directly in your browser.",
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
      <ToolErrorBoundary toolName="Cryptographic Hash Generator">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
