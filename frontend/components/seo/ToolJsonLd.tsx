import React from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolJsonLdProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  faqs?: FaqItem[];
  featureList?: string[];
  aggregateRating?: {
    ratingValue: string;
    reviewCount: string;
  };
}

export function ToolJsonLd({
  name,
  description,
  url,
  applicationCategory = "MultimediaApplication",
  operatingSystem = "All",
  faqs,
  featureList,
  aggregateRating = {
    ratingValue: "4.9",
    reviewCount: "1284",
  },
}: ToolJsonLdProps) {
  const fullUrl = url.startsWith("http") ? url : `https://botock.app${url}`;

  const graph: any[] = [
    {
      "@type": "SoftwareApplication",
      name: `${name} - Botock AI`,
      url: fullUrl,
      description,
      applicationCategory,
      operatingSystem,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
      },
      ...(featureList?.length ? { featureList } : {}),
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
          name: "Tools",
          item: "https://botock.app/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name,
          item: fullUrl,
        },
      ],
    },
  ];

  if (faqs && faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
