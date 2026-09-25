import { Metadata } from "next";
import YamlToJsonClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "YAML to JSON & JSON to YAML Converter Online | Botock",
  description:
    "Bidirectional client-side YAML to JSON and JSON to YAML converter. Preserves nested lists, objects, types, and supports instant file downloading.",
  keywords: [
    "yaml to json",
    "json to yaml",
    "yaml converter online",
    "yaml parser",
    "json to yml",
  ],
  openGraph: {
    title: "YAML to JSON & JSON to YAML Converter Online | Botock",
    description:
      "Bidirectional client-side YAML to JSON and JSON to YAML converter.",
    type: "website",
  },
};

export default function YamlToJsonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YAML to JSON & JSON to YAML Converter",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side bidirectional YAML to JSON and JSON to YAML serialization engine.",
  };

  return (
    <ToolErrorBoundary toolName="YAML to JSON">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YamlToJsonClient />
    </ToolErrorBoundary>
  );
}
