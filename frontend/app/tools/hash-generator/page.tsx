import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Cryptographic Hash Generator & File Checksum - SHA-256, SHA-512, MD5 | Botock",
  description:
    "Generate verified cryptographic hashes (SHA-256, SHA-512, MD5, SHA-1) and file checksums with zero server uploads.",
  keywords: [
    "hash generator",
    "sha256 generator online",
    "md5 checksum generator",
    "sha512 hash generator",
    "reverse hash lookup",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/hash-generator",
  },
  openGraph: {
    title: "Cryptographic Hash Generator & File Checksum - Botock",
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
