import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://botock.app";
  const now = new Date();

  // All valid, implemented public indexable routes
  const routes = [
    // Homepage
    "",

    // Core Hubs
    "/tools",
    "/botock-library",
    "/blog",

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
    "/tools/repair-pdf",
    "/tools/translate-pdf",
    "/tools/word-to-pdf",
    "/tools/pdf-ocr",

    // Image Suite Tools
    "/tools/image-compress",
    "/tools/image-convert",
    "/tools/image-crop",
    "/tools/image-filters",
    "/tools/image-remove-bg",
    "/tools/image-resize",
    "/tools/image-rotate",
    "/tools/image-upscale",
    "/tools/jpg-to-pdf",
    "/tools/image-color-picker",

    // Video & Audio Utilities
    "/tools/reaction-video-maker",
    "/tools/audio-enhance",
    "/tools/audio-volume",
    "/tools/audio-trim",
    "/tools/video-mute",
    "/tools/video-auto-reframe",
    "/tools/video-rotate",
    "/tools/video-remove-bg",
    "/tools/subtitles",
    "/tools/video-compress",
    "/tools/video-convert",
    "/tools/video-to-gif",
    "/tools/video-to-mp3",
    "/tools/video-trim",
    "/tools/voice-changer",
    "/tools/live-data-extractor",

    // Feature Hub Pages
    "/features/video-editor",
    "/features/pdf-suite",
    "/features/image-tools",
    "/features/audio-tools",

    // Blog Articles
    "/blog/tesla-new-roadster-the-car-that-almost-flies",
    "/blog/complete-guide-to-botock-video-editor",
    "/blog/complete-guide-to-pdf-tools-workflows",
    "/blog/complete-guide-to-ai-video-tools-creators",
    "/blog/complete-guide-to-ai-audio-voice-tools",
    "/blog/complete-guide-to-ai-image-tools-upscale-rotate",
    "/blog/how-to-create-reaction-videos-trends-guide",
    "/blog/top-5-ai-video-trends-2026",
    "/blog/ai-agents-creative-workflows",
    "/blog/ai-document-management-productivity",
    "/blog/evolution-of-ai-image-generation",
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

  // Try fetching dynamically published blogs from CMS/backend
  const backendUrl = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://api.botock.app"
  ).replace(/\/$/, "");

  const dynamicBlogEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${backendUrl}/api/public/blogs`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts)) {
        for (const post of posts) {
          if (post?.slug && (post.status === "PUBLISHED" || !post.status)) {
            const blogUrl = `${baseUrl}/blog/${post.slug}`;
            dynamicBlogEntries.push({
              url: blogUrl,
              lastModified: post.updated_at ? new Date(post.updated_at) : (post.published_at ? new Date(post.published_at) : now),
              changeFrequency: "weekly",
              priority: 0.7,
            });
          }
        }
      }
    }
  } catch {
    // Graceful fallback during offline build
  }

  const staticSitemap = routes.map((route) => {
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
    } else if (route.startsWith("/features/")) {
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

  // Deduplicate entries by URL
  const seenUrls = new Set<string>();
  const finalSitemap: MetadataRoute.Sitemap = [];

  for (const item of [...staticSitemap, ...dynamicBlogEntries]) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      finalSitemap.push(item);
    }
  }

  return finalSitemap;
}
