import { Metadata } from "next";
import UnitConverterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Universal Unit Converter Online - Digital, Length, Mass, Temp | Botock",
  description:
    "Free engineering and science unit converter. Instantly convert digital storage (MB, GB, TB), length, weight, and temperature with high precision.",
  keywords: [
    "unit converter",
    "digital storage converter",
    "gb to mb converter",
    "length converter",
    "weight converter",
    "temperature converter online",
  ],
  openGraph: {
    title: "Universal Unit Converter Online - Digital, Length, Mass, Temp | Botock",
    description:
      "Free engineering and science unit converter for digital data, length, weight, and temperature.",
    type: "website",
  },
};

export default function UnitConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Universal Unit Converter",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side multidimensional unit conversion engine.",
  };

  return (
    <ToolErrorBoundary toolName="Unit Converter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UnitConverterClient />
    </ToolErrorBoundary>
  );
}
