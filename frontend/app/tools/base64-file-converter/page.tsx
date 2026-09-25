import { Metadata } from "next";
import Base64FileConverterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Base64 File Encoder & Decoder Online | Botock",
  description:
    "Encode any file (PDF, PNG, JPG, MP3, ZIP) into Base64 data URI format or decode Base64 strings back to binary files with complete client-side security.",
  keywords: [
    "base64 file converter",
    "file to base64",
    "base64 to file",
    "data uri generator",
    "base64 binary decoder",
  ],
  openGraph: {
    title: "Base64 File Encoder & Decoder Online | Botock",
    description:
      "Encode any file into Base64 format or decode Base64 strings back to files.",
    type: "website",
  },
};

export default function Base64FileConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Base64 File Encoder & Decoder",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side Base64 file encoder and binary reconstructor.",
  };

  return (
    <ToolErrorBoundary toolName="Base64 File Converter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Base64FileConverterClient />
    </ToolErrorBoundary>
  );
}
