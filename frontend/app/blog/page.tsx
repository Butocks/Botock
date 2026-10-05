import type { Metadata } from "next";
import BlogCatalogClient from "./BlogCatalogClient";

export const metadata: Metadata = {
  title: "Blog & Creative AI Guides",
  description:
    "Read in-depth guides, prompting strategies, filmmaking workflows, and document productivity tutorials from the Botock team.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog & Creative AI Guides",
    description:
      "Explore tutorials on AI video generation, prompt engineering, photo synthesis, and document manipulation.",
    url: "https://botock.app/blog",
    siteName: "Botock",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Creative AI Guides",
    description:
      "Explore tutorials on AI video generation, prompt engineering, and creative tools.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        name: "Botock Creative Intelligence Blog",
        url: "https://botock.app/blog",
        description:
          "Tutorials, feature releases, and technical guides covering generative video, image editing, and document workflows.",
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
            name: "Blog",
            item: "https://botock.app/blog",
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogCatalogClient />
    </div>
  );
}
