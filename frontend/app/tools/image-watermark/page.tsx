import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Add Watermark to Image Online Free - Custom Copyright Stamps | Botock Tools",
  description:
    "Add customizable text watermarks, copyright notices, and custom opacity stamps to photos online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "watermark image online",
    "add watermark to photo",
    "photo watermark free",
    "copyright stamp photo",
    "image watermark creator browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/image-watermark",
  },
  openGraph: {
    title: "Add Watermark to Image Online Free - Botock Tools",
    description: "Add custom copyright stamps and watermarks to photos directly in your browser.",
    url: "https://botock.com/tools/image-watermark",
    siteName: "Botock",
    type: "website",
  },
};

export default function ImageWatermarkPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Add Watermark to Image - Botock Tools",
    url: "https://botock.com/tools/image-watermark",
    description: "Add custom watermarks and copyright stamps to images directly in your browser.",
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
      <ToolErrorBoundary toolName="Add Watermark to Image">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
