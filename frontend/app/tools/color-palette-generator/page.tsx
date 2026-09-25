import { Metadata } from "next";
import ColorPaletteGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "AI Color Palette Generator - Trending Color Schemes | Botock",
  description:
    "Generate harmonious color schemes, locks favorite tones, and exports directly to CSS custom properties, hex codes, and design tokens.",
  keywords: [
    "color palette generator",
    "color scheme maker",
    "hex color palette",
    "ui colors generator",
    "css color variables",
  ],
  openGraph: {
    title: "AI Color Palette Generator - Trending Color Schemes | Botock",
    description:
      "Generate harmonious color schemes and export to CSS variables.",
    type: "website",
  },
};

export default function ColorPaletteGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Color Palette Generator",
    operatingSystem: "All",
    applicationCategory: "DesignApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side color palette generator with locking controls and CSS variable export.",
  };

  return (
    <ToolErrorBoundary toolName="Color Palette Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ColorPaletteGeneratorClient />
    </ToolErrorBoundary>
  );
}
