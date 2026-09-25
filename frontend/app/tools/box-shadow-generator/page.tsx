import { Metadata } from "next";
import BoxShadowGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "CSS Box Shadow Generator - Visual Shadow Designer | Botock",
  description:
    "Design realistic CSS box-shadows visually. Adjust horizontal/vertical offset, blur, spread radius, color, opacity, and inner inset shadows with instant CSS code generation.",
  keywords: [
    "css box shadow generator",
    "box shadow tool",
    "visual css shadow",
    "drop shadow generator",
    "inset shadow maker",
  ],
  openGraph: {
    title: "CSS Box Shadow Generator - Visual Shadow Designer | Botock",
    description:
      "Design realistic CSS box-shadows visually with instant CSS export.",
    type: "website",
  },
};

export default function BoxShadowGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CSS Box Shadow Generator",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Visual CSS box shadow designer with blur, spread, and inset controls.",
  };

  return (
    <ToolErrorBoundary toolName="Box Shadow Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BoxShadowGeneratorClient />
    </ToolErrorBoundary>
  );
}
