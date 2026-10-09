import type { Metadata } from "next";
import JoinUsClient from "./JoinUsClient";

export const metadata: Metadata = {
  title: "Careers & Join the Team",
  description:
    "Join the engineering, product, and AI research team at Botock. Help build the next-generation creative operating suite.",
  alternates: {
    canonical: "/join-us",
  },
  openGraph: {
    title: "Careers & Join the Team",
    description:
      "Join the engineering, product, and AI research team at Botock. Help build the next-generation creative operating suite.",
    url: "https://botock.app/join-us",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers & Join the Team",
    description: "Build the future of generative media and client-side web tools with Botock.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function JoinUsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Botock Careers & Open Roles",
        url: "https://botock.app/join-us",
        description: "Open positions across fullstack engineering, WebAssembly, and AI research at Botock.",
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
            name: "Careers",
            item: "https://botock.app/join-us",
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
      <JoinUsClient />
    </>
  );
}
