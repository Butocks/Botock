"use client";

import Link from "next/link";
import React from "react";
import { Scissors, Music, Sliders, FileVideo, Sparkles, Image as ImageIcon, Wand2, RefreshCw } from "lucide-react";

interface ToolItem {
  title: string;
  desc: string;
  icon: any;
  href: string;
  action?: () => void;
}

interface ToolSuggestionsProps {
  type?: "video" | "image";
  onEditInStudio?: () => void;
}

export default function ToolSuggestions({ type = "video", onEditInStudio }: ToolSuggestionsProps) {
  const videoTools: ToolItem[] = [
    {
      title: "Video Cutter / Trimmer",
      desc: "Cut unwanted start/end segments instantly",
      icon: Scissors,
      href: "/tools/video-editor?tool=trim",
      action: onEditInStudio,
    },
    {
      title: "Audio Extractor (MP3)",
      desc: "Extract crystal clear voice and music",
      icon: Music,
      href: "/tools?category=video",
    },
    {
      title: "Speed Controller",
      desc: "Add slow-mo or fast forward effects",
      icon: Sliders,
      href: "/tools/video-editor?tool=speed",
      action: onEditInStudio,
    },
    {
      title: "Video Compressor",
      desc: "Reduce file size without losing quality",
      icon: FileVideo,
      href: "/tools?category=video",
    },
  ];

  const imageTools: ToolItem[] = [
    {
      title: "AI Background Remover",
      desc: "Remove photo background in 1 click",
      icon: Wand2,
      href: "/tools/photo-editor?tool=bg-remove",
    },
    {
      title: "Photo to Video",
      desc: "Animate this photo into a cinematic scene",
      icon: Sparkles,
      href: "/tools/video-generator?mode=photo-to-video",
    },
    {
      title: "Image Resizer",
      desc: "Resize for YouTube, Instagram, TikTok",
      icon: ImageIcon,
      href: "/tools/photo-editor?tool=resize",
    },
    {
      title: "Convert to WebP",
      desc: "Compress for websites and fast loading",
      icon: RefreshCw,
      href: "/tools?category=image",
    },
  ];

  const tools = type === "video" ? videoTools : imageTools;

  return (
    <div className="mt-8 pt-6 border-t border-border/50 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            Suggested Next Actions
          </h3>
          <p className="text-xs text-muted-foreground">
            Continue editing or enhancing your generation with Botock tools
          </p>
        </div>
        {type === "video" && onEditInStudio && (
          <button
            onClick={onEditInStudio}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all border border-primary/30"
          >
            Open in Video Studio →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map((t, idx) => {
          const Icon = t.icon;
          return (
            <Link
              key={idx}
              href={t.href}
              onClick={(e) => {
                if (t.action) {
                  e.preventDefault();
                  t.action();
                }
              }}
              className="p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-card hover:border-primary/40 transition-all group flex items-start gap-3 text-left"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {t.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {t.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
