import { Metadata } from "next";
import GradientGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "CSS Gradient Generator - Linear & Radial Backgrounds | Botock",
  description:
    "Design gorgeous CSS linear and radial gradients online. Multi-stop color picker, angle controls, curated presets, and instant CSS code output.",
  keywords: [
    "css gradient generator",
    "linear gradient maker",
    "radial gradient generator",
    "css color gradient",
    "gradient designer",
  ],
  openGraph: {
    title: "CSS Gradient Generator - Linear & Radial Backgrounds | Botock",
    description:
      "Design gorgeous CSS linear and radial gradients online with instant CSS code output.",
    type: "website",
  },
};

export default function GradientGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CSS Gradient Generator",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side CSS gradient designer with multi-stop color picks and preset templates.",
  };

  return (
    <ToolErrorBoundary toolName="Gradient Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GradientGeneratorClient />
    </ToolErrorBoundary>
  );
}
