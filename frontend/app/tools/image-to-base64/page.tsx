import type { Metadata } from "next";
import Client from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Convert Image to Base64 Online Free - Data URI Generator | Botock Tools",
  description:
    "Convert images to Base64 code, Data URIs, HTML img tags, and CSS background snippets online for free. Works directly in your browser with zero file uploads.",
  keywords: [
    "image to base64",
    "base64 image converter",
    "png to base64 online free",
    "data uri generator",
    "image base64 encoder browser",
    "botock tools",
  ],
  alternates: {
    canonical: "https://botock.com/tools/image-to-base64",
  },
  openGraph: {
    title: "Convert Image to Base64 Online Free - Botock Tools",
    description: "Convert images to Base64 code and Data URIs directly in your browser with zero server uploads.",
    url: "https://botock.com/tools/image-to-base64",
    siteName: "Botock",
    type: "website",
  },
};

export default function ImageToBase64Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Image to Base64 - Botock Tools",
    url: "https://botock.com/tools/image-to-base64",
    description: "Convert images to Base64 code and Data URIs directly in your browser.",
    applicationCategory: "DeveloperApplication",
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
      <ToolErrorBoundary toolName="Image to Base64">
        <Client />
      </ToolErrorBoundary>
    </>
  );
}
