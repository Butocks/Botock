import { Metadata } from "next";
import CaseConverterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Case Converter Online - Upper, Lower, Title, Camel, Snake | Botock",
  description:
    "Convert text into uppercase, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE instantly.",
  keywords: [
    "case converter",
    "camelcase converter",
    "snake case converter",
    "kebab case converter",
    "uppercase to lowercase",
    "title case tool",
  ],
  openGraph: {
    title: "Case Converter Online - Upper, Lower, Title, Camel, Snake | Botock",
    description:
      "Convert text into uppercase, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case.",
    type: "website",
  },
};

export default function CaseConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Case Converter",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side case converter utility supporting 10 standard text formats.",
  };

  return (
    <ToolErrorBoundary toolName="Case Converter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CaseConverterClient />
    </ToolErrorBoundary>
  );
}
