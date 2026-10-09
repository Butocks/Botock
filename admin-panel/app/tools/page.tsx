import type { Metadata } from "next";
import ToolsDirectoryClient from "./ToolsDirectoryClient";

export const metadata: Metadata = {
  title: "Botock AI Tools | Free Video Generator & PDF Utilities",
  description:
    "Explore 35+ free AI, PDF, image, and video utilities on Botock AI. Generate cinematic AI video, merge PDFs, convert media, and edit video in your browser.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "Botock AI Tools | Free Video Generator & PDF Utilities",
    description:
      "Explore 35+ free AI, PDF, image, and video utilities on Botock AI. Fast, client-side, zero server uploads, and instant processing.",
    url: "https://botock.app/tools",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Botock AI Tools Directory",
    description:
      "Explore free AI video generation, image creation, PDF utilities, and video editing tools on Botock AI.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ToolsDirectoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Botock Creative & Productivity Tools Directory",
        url: "https://botock.app/tools",
        description:
          "Comprehensive collection of online AI generators, PDF utilities, image editors, and video converters.",
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
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Semantic Server-Rendered Header */}
      <header className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          Botock Tool Directory
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-3 mb-3">
          Free Online Creative &amp; Productivity Tools
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Access high-performance generative AI studios, in-browser video editors, and client-side PDF and image utilities. Every tool runs securely with zero software installation required.
        </p>
      </header>

      {/* Interactive Client Directory with Filters & Search */}
      <ToolsDirectoryClient />
    </div>
  );
}
