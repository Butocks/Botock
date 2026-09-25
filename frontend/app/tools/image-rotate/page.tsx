import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Rotate & Flip Image Online Free - 90°, 180°, Mirror Flip | Botock Tools",
  description:
    "Rotate images 90, 180, or 270 degrees or flip horizontally and vertically online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "rotate image online",
    "flip image horizontal",
    "flip photo vertical",
    "rotate photo 90 degrees",
    "mirror image online free",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/image-rotate",
  },
  openGraph: {
    title: "Rotate & Flip Image Online Free - Botock Tools",
    description: "Rotate and flip photos directly in your browser with instant GPU canvas acceleration.",
    url: "https://botock.com/tools/image-rotate",
    siteName: "Botock",
    type: "website",
  },
};

export default function ImageRotatePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rotate & Flip Image - Botock Tools",
    url: "https://botock.com/tools/image-rotate",
    description: "Rotate and flip images directly in your browser.",
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
      <ToolErrorBoundary toolName="Rotate & Flip Image">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
