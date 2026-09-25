import { Metadata } from "next";
import SvgToPngClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "SVG to PNG Converter Online - High-Res 1x, 2x, 4x Retina | Botock",
  description:
    "Convert SVG vector files to crisp PNG raster images in your browser. Supports 1x, 2x Retina, 4x Ultra HD scaling with transparent or custom background colors.",
  keywords: [
    "svg to png",
    "convert svg to png online",
    "vector to png",
    "retina svg converter",
    "svg rasterizer",
  ],
  openGraph: {
    title: "SVG to PNG Converter Online - High-Res 1x, 2x, 4x Retina | Botock",
    description:
      "Convert SVG vector files to crisp PNG raster images in your browser.",
    type: "website",
  },
};

export default function SvgToPngPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SVG to PNG Converter",
    operatingSystem: "All",
    applicationCategory: "DesignApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side SVG vector to PNG raster converter with custom scaling.",
  };

  return (
    <ToolErrorBoundary toolName="SVG to PNG">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SvgToPngClient />
    </ToolErrorBoundary>
  );
}
