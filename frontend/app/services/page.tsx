import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Services & Custom Generation Plans",
  description:
    "Explore Botock service plans, ad-free access, dedicated worker slots, and custom enterprise video generation tokens.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services & Custom Generation Plans | Botock",
    description:
      "Explore Botock service plans, ad-free access, and custom enterprise video generation tokens.",
    url: "https://botock.app/services",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services & Custom Generation Plans | Botock",
    description:
      "Explore Botock service plans, ad-free access, and custom enterprise video generation tokens.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ServicesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Botock Services & Custom Plans",
        url: "https://botock.app/services",
        description:
          "Service tiers, token bundles, and custom AI generation infrastructure provided by Botock.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://botock.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://botock.app/services",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesClient />
    </>
  );
}
