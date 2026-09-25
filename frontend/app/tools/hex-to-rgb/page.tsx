import { Metadata } from "next";
import HexToRgbClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "HEX to RGB, HSL & CMYK Converter Online | Botock",
  description:
    "Convert HEX color codes into RGB, RGBA, HSL, and print-ready CMYK values instantly with a live visual swatch preview.",
  keywords: [
    "hex to rgb",
    "hex to hsl",
    "color converter",
    "rgb to cmyk",
    "css color code converter",
  ],
  openGraph: {
    title: "HEX to RGB, HSL & CMYK Converter Online | Botock",
    description:
      "Convert HEX color codes into RGB, RGBA, HSL, and print-ready CMYK values instantly.",
    type: "website",
  },
};

export default function HexToRgbPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HEX to RGB Converter",
    operatingSystem: "All",
    applicationCategory: "DesignApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side color model conversion engine for HEX, RGB, HSL, and CMYK.",
  };

  return (
    <ToolErrorBoundary toolName="HEX to RGB">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HexToRgbClient />
    </ToolErrorBoundary>
  );
}
