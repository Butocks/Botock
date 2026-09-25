import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Image Color Picker Online Free - HEX, RGB & Palette Generator | Botock Tools",
  description:
    "Pick colors from any image to get exact HEX, RGB, and HSL codes online for free. Extract dominant branding palettes directly in your browser with zero file uploads.",
  keywords: [
    "image color picker",
    "eyedropper tool online",
    "pick color from image free",
    "image hex code finder",
    "photo color palette generator",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/image-color-picker",
  },
  openGraph: {
    title: "Image Color Picker Online Free - Botock Tools",
    description: "Extract exact HEX and RGB color codes and palette swatches from images directly in your browser.",
    url: "https://botock.com/tools/image-color-picker",
    siteName: "Botock",
    type: "website",
  },
};

export default function ImageColorPickerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image Color Picker - Botock Tools",
    url: "https://botock.com/tools/image-color-picker",
    description: "Extract exact HEX and RGB color codes from images directly in your browser.",
    applicationCategory: "DesignApplication",
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
      <ToolErrorBoundary toolName="Image Color Picker">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
