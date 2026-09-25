import { Metadata } from "next";
import PxToRemConverterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "PX to REM Converter Online - CSS Typography Calculator | Botock",
  description:
    "Convert pixels (px) to REM and EM units in real-time with customizable root font-size. Includes standard responsive typography conversion tables.",
  keywords: [
    "px to rem",
    "rem to px converter",
    "css px to rem calculator",
    "pixels to rem",
    "responsive typography tool",
  ],
  openGraph: {
    title: "PX to REM Converter Online - CSS Typography Calculator | Botock",
    description:
      "Convert pixels (px) to REM and EM units in real-time with customizable root font-size.",
    type: "website",
  },
};

export default function PxToRemConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PX to REM Converter",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Bidirectional pixel to REM unit converter for responsive web typography.",
  };

  return (
    <ToolErrorBoundary toolName="PX to REM Converter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PxToRemConverterClient />
    </ToolErrorBoundary>
  );
}
