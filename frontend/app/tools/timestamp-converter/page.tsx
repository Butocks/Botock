import { Metadata } from "next";
import TimestampConverterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Unix Timestamp & Epoch Converter Online | Botock",
  description:
    "Convert Unix timestamps in seconds or milliseconds to human-readable dates (UTC, ISO 8601, and local time). Live current epoch ticker with zero latency.",
  keywords: [
    "unix timestamp converter",
    "epoch to date",
    "timestamp to human date",
    "current unix timestamp",
    "iso 8601 converter",
  ],
  openGraph: {
    title: "Unix Timestamp & Epoch Converter Online | Botock",
    description:
      "Convert Unix timestamps in seconds or milliseconds to human-readable dates.",
    type: "website",
  },
};

export default function TimestampConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Unix Timestamp & Epoch Converter",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side Unix epoch and temporal timestamp converter.",
  };

  return (
    <ToolErrorBoundary toolName="Timestamp Converter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TimestampConverterClient />
    </ToolErrorBoundary>
  );
}
