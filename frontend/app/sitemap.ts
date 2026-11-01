import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://botock.app";
  // Use a real "last meaningful change" date, NOT the build time.
  // Setting every page to "now" on each deploy teaches Google to ignore lastmod.
  // Bump SITE_LAST_UPDATED when you actually change content; add a page to
  // PAGE_LAST_UPDATED only when that page itself changes.
  const SITE_LAST_UPDATED = new Date("2026-11-02");
  const PAGE_LAST_UPDATED: Record<string, Date> = {
    "/tools/video-color-grading": new Date("2026-11-02"),
    "/tools/video-mute": new Date("2026-11-02"),
    "/tools/audio-volume": new Date("2026-11-02"),
    "/tools/pdf-ocr": new Date("2026-11-02"),
    "/tools/audio-trim": new Date("2026-11-02"),
    "/tools/crop-pdf": new Date("2026-11-02"),
    "/tools/image-upscale": new Date("2026-11-02"),
  };
  const now = SITE_LAST_UPDATED;

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
    "/tools/video-color-grading",

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
    "/tools/audio-converter",
    "/tools/video-merge",
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

    // Blog Articles & High-Value Guides
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
    "/blog/ai-video-prompt-engineering-master-handbook",
    "/blog/ai-video-camera-movements-angles-guide",
    "/blog/ai-video-actions-body-gestures-prompt-guide",
    "/blog/ai-video-cinematic-lighting-optics-guide",
    "/blog/how-to-write-image-to-video-prompt-one-action-rule",
    "/blog/which-hand-how-to-describe-hand-actions-ai-video-prompts",
    "/blog/left-right-confusion-frame-left-vs-character-left-ai-video",
    "/blog/how-to-keep-same-character-across-ai-video-clips",
    "/blog/silent-clip-voiceover-fix-lips-moving-ai-video",
    "/blog/20-camera-movement-prompts-you-can-copy",
    "/blog/two-person-dialogue-scenes-ai-video-prompts",
    "/blog/ai-video-prompts-for-products-ecommerce-ads",
    "/blog/25-reasons-ai-video-looks-wrong-and-fixes",
    "/blog/free-text-to-video-photo-to-video-what-to-expect-4-10s-clips",

    // Information & Trust Pages
    "/contact",
    "/privacy",
    "/terms",
    "/security",
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
            });
          }
        }
      }
    }
  } catch {
    // Graceful fallback during offline build
  }

  // Google ignores <priority> and <changefreq>, so only url + lastmod are emitted.
  const staticSitemap: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: PAGE_LAST_UPDATED[route] ?? SITE_LAST_UPDATED,
  }));

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
