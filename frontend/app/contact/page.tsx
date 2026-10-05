import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us & Support",
  description:
    "Get in touch with the Botock team for technical assistance, partnership opportunities, and customer support inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & Support",
    description:
      "Get in touch with the Botock team for technical assistance, partnerships, and customer support.",
    url: "https://botock.app/contact",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us & Support",
    description: "Get in touch with the Botock support team.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Contact Botock Support",
        url: "https://botock.app/contact",
        description: "Official support and contact channels for Botock users.",
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
            name: "Contact",
            item: "https://botock.app/contact",
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
      <ContactClient />
    </>
  );
}
