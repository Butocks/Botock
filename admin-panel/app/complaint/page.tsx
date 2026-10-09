import type { Metadata } from "next";
import ComplaintClient from "./ComplaintClient";

export const metadata: Metadata = {
  title: "Formal Complaint & Grievance Redressal",
  description:
    "Submit formal complaints, content removal notices, or grievance reports to the Botock moderation and legal desk.",
  alternates: {
    canonical: "/complaint",
  },
  openGraph: {
    title: "Formal Complaint & Grievance Redressal",
    description:
      "Submit formal complaints, content removal notices, or grievance reports to Botock.",
    url: "https://botock.app/complaint",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formal Complaint Desk",
    description: "Submit grievance reports or content removal notices to Botock.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ComplaintPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Botock Grievance & Complaint Desk",
        url: "https://botock.app/complaint",
        description: "Official portal for user complaints, disputes, and DMCA notices.",
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
            name: "Complaint Desk",
            item: "https://botock.app/complaint",
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
      <ComplaintClient />
    </>
  );
}
