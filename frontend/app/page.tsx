import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Botock | AI Video, Image & Productivity Tools",
  description:
    "Generate cinematic AI videos from text and photos, synthesize photorealistic artwork, edit videos in-browser, and process PDF documents locally with Botock.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Botock | AI Video, Image & Productivity Tools",
    description:
      "Generate cinematic AI videos from text and photos, synthesize photorealistic artwork, edit videos in-browser, and process PDF documents locally with Botock.",
    url: "https://botock.app",
    siteName: "Botock",
    type: "website",
    images: [
      {
        url: "https://botock.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Botock Creative Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Botock | AI Video, Image & Productivity Tools",
    description:
      "Generate cinematic AI videos from text and photos, synthesize photorealistic artwork, edit videos in-browser, and process PDF documents locally.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://botock.app/#website",
        name: "Botock",
        url: "https://botock.app",
        description:
          "All-in-one platform for AI Video Generation, Photo Generation, in-browser Video Studio, and 35+ multimedia utilities.",
        publisher: {
          "@type": "Organization",
          name: "Botock",
          url: "https://botock.app",
          logo: {
            "@type": "ImageObject",
            url: "https://botock.app/logo.png",
          },
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Botock Creative Suite",
        url: "https://botock.app",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Generate AI videos, edit media directly in browser via WebAssembly, and process PDFs locally with zero software installation.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
