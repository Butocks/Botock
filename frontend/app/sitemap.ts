import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://botock.app";
  const now = new Date();

  // All valid, implemented public indexable routes
  const routes = [
    // Homepage
    "",

    // Core Hubs
    "/tools",
    "/blog",
    "/services",

    // Flagship AI & Video Tools
    "/tools/video-generator",
    "/tools/image-generator",
    "/tools/video-editor",

    // PDF Suite Tools
    "/tools/crop-pdf",
    "/tools/excel-to-pdf",
    "/tools/html-to-pdf",
    "/tools/organize-pdf",
    "/tools/pdf-ai-summarizer",
    "/tools/pdf-compress",
    "/tools/pdf-forms",
    "/tools/pdf-merge",
    "/tools/pdf-page-delete",
    "/tools/pdf-page-numbers",
    "/tools/pdf-protect",
    "/tools/pdf-rotate",
    "/tools/pdf-split",
    "/tools/pdf-to-book",
    "/tools/pdf-to-excel",
    "/tools/pdf-to-jpg",
    "/tools/pdf-to-powerpoint",
    "/tools/pdf-to-word",
    "/tools/pdf-watermark",
    "/tools/word-to-pdf",

    // Image Suite Tools
    "/tools/image-compress",
    "/tools/image-convert",
    "/tools/image-crop",
    "/tools/image-filters",
    "/tools/image-remove-bg",
    "/tools/image-resize",
    "/tools/image-rotate",
    "/tools/jpg-to-pdf",

    // Video & Audio Utilities
    "/tools/subtitles",
    "/tools/video-compress",
    "/tools/video-convert",
    "/tools/video-to-gif",
    "/tools/video-to-mp3",
    "/tools/video-trim",

    // Blog Articles
    "/blog/about-botock-app",
    "/blog/guide-to-ai-video-generation",
    "/blog/guide-to-photo-generation-and-faq",
    "/blog/guide-to-image-editing-and-background-removal",
    "/blog/guide-to-pdf-and-document-tools",

    // Information & Legal
    "/contact",
    "/privacy",
    "/terms",
    "/security",
    "/join-us",
    "/complaint",
  ];

  return routes.map((route) => {
    let priority = 0.7;
    let changeFrequency: "daily" | "weekly" | "monthly" = "weekly";

    if (route === "") {
      priority = 1.0;
      changeFrequency = "daily";
    } else if (
      route === "/tools" ||
      route === "/tools/video-generator" ||
      route === "/tools/image-generator" ||
      route === "/tools/video-editor"
    ) {
      priority = 0.9;
      changeFrequency = "daily";
    } else if (route.startsWith("/tools/")) {
      priority = 0.8;
      changeFrequency = "weekly";
    } else if (route.startsWith("/blog")) {
      priority = 0.7;
      changeFrequency = "weekly";
    } else {
      priority = 0.5;
      changeFrequency = "monthly";
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency,
      priority,
    };
  });
}
