"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// Mapping of route slugs to clean human-readable titles
const ROUTE_LABELS: Record<string, string> = {
  tools: "Tools",
  "botock-library": "Botock Library",
  blog: "Blogs",
  security: "Security & Privacy",
  contact: "Contact Support",
  complaint: "Complaints & Feedback",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  "join-us": "Join Us",
  features: "Features",
  profile: "My Account",
  login: "Sign In",
  signup: "Create Account",

  // Flagship AI Tools
  "video-generator": "AI Video Generator",
  "image-generator": "AI Image Generator",
  "voice-changer": "Voice Changer",
  "audio-enhance": "Audio Enhancer",
  "video-auto-reframe": "Auto Reframe (Reels / 9:16)",
  "reaction-video-maker": "Reaction Video Maker",
  subtitles: "Auto Subtitles & Captions",
  "video-editor": "Video Studio Editor",
  "video-compress": "Video Compressor",
  "video-convert": "Video Converter",
  "video-trim": "Video Trimmer",
  "video-to-mp3": "Extract Audio to MP3",
  "video-to-gif": "Video to GIF",
  "video-remove-bg": "Video Background Remover",

  // Image Tools
  "image-compress": "Image Compressor",
  "image-convert": "Image Converter",
  "image-crop": "Image Crop & Canvas",
  "image-filters": "Photo Filters & Effects",
  "image-remove-bg": "AI Background Remover",
  "image-resize": "Image Resizer",
  "image-rotate": "Rotate & Flip Image",
  "jpg-to-pdf": "JPG to PDF",

  // PDF Suite Tools
  "pdf-compress": "PDF Compressor",
  "pdf-merge": "Merge PDF Files",
  "pdf-split": "Split PDF Pages",
  "pdf-to-word": "PDF to Word Converter",
  "word-to-pdf": "Word to PDF Converter",
  "pdf-to-excel": "PDF to Excel",
  "pdf-to-jpg": "PDF to JPG",
  "pdf-protect": "Protect & Unlock PDF",
  "pdf-watermark": "Watermark & Stamp PDF",
  "organize-pdf": "Organize PDF Pages",
  "pdf-ai-summarizer": "AI PDF Summarizer",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Do not show on home page or full-screen studio
  if (!pathname || pathname === "/" || pathname === "/tools/video-editor") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // Build breadcrumb items with accumulated paths
  const items = segments.map((seg, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = ROUTE_LABELS[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav
      aria-label="Breadcrumb Navigation"
      className="w-full border-b border-slate-200/70 dark:border-white/[0.06] bg-slate-100/50 dark:bg-white/[0.015] py-2.5 px-4 sm:px-6 lg:px-8 transition-colors select-none"
    >
      <div className="max-w-[1560px] mx-auto flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto no-scrollbar">
        {/* Home Root */}
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          title="Back to Home"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="font-medium">Home</span>
        </Link>

        {items.map((item, idx) => (
          <React.Fragment key={item.href}>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 flex-shrink-0" />
            {item.isLast ? (
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate flex-shrink-0 max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors truncate flex-shrink-0 cursor-pointer"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
