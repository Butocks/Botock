import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://botock.com";
  const now = new Date();

  const routes = [
    "",
    "/pricing",
    "/login",
    "/tools",
    "/tools/video-generator",
    "/tools/image-generator",
    "/tools/pdf-merge",
    "/tools/image-remove-bg",
    "/tools/video-editor",
    "/tools/pdf-to-word",
    "/tools/video-to-mp3",
    "/tools/image-to-webp",
    "/tools/pdf-compress",
    "/tools/image-upscale",
    "/tools/pdf-split",
    "/tools/video-compress",
    "/tools/pdf-to-excel",
    "/blog",
    "/contact",
    "/join-us",
    "/complaint",
    "/security",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route.startsWith("/tools/") ? 0.8 : 0.6,
  }));
}
