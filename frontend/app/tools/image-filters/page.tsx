import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Photo Filters & Effects Online Free - Image Color Grading | Botock Tools",
  description:
    "Apply cinematic filters, adjust brightness, contrast, saturation, and color grading online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "photo filters online",
    "image color grading",
    "photo effects free",
    "adjust image brightness contrast",
    "vintage filter online",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/image-filters",
  },
  openGraph: {
    title: "Photo Filters & Effects Online Free - Botock Tools",
    description: "Fine-tune brightness, contrast, saturation, and cinematic film presets directly in your browser.",
    url: "https://botock.com/tools/image-filters",
    siteName: "Botock",
    type: "website",
  },
};

export default function ImageFiltersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Photo Filters & Effects - Botock Tools",
    url: "https://botock.com/tools/image-filters",
    description: "Fine-tune photo brightness, contrast, saturation, and cinematic film presets directly in your browser.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolErrorBoundary toolName="Photo Filters & Effects">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
