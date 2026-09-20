"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Sparkles,
  Scissors,
  FileText,
  Image as ImageIcon,
  FileVideo,
  Music,
  ArrowRight,
  Wand2,
  Lock,
  FileCheck,
  Minimize2,
  Split,
} from "lucide-react";

interface SliderTool {
  id: string;
  name: string;
  desc: string;
  category: "all" | "ai" | "pdf" | "image" | "video" | "converters";
  badge: string;
  badgeColor: string;
  href: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

const FEATURED_TOOLS: SliderTool[] = [
  {
    id: "ai-video",
    name: "AI Video Generator",
    desc: "Generate 4–10s cinematic clips from prompts and photos with Omni 1.1 Flash 360p.",
    category: "ai",
    badge: "Google Flow",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    href: "/tools/video-generator",
    icon: Film,
    iconBg: "bg-violet-600/20",
    iconColor: "text-violet-400",
  },
  {
    id: "ai-image",
    name: "AI Image Generator",
    desc: "Generate hyper-detailed visuals with Nano Banana Lite, 2 & Pro in 5 aspect ratios.",
    category: "ai",
    badge: "Nano Banana",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    href: "/tools/image-generator",
    icon: Wand2,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "pdf-merge",
    name: "Merge PDF",
    desc: "Combine multiple PDF documents into a single organized file in seconds.",
    category: "pdf",
    badge: "34 PDF Suite",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    href: "/tools/pdf-merge",
    icon: FileText,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "remove-bg",
    name: "Remove Background",
    desc: "Instantly cut out backgrounds from product photos and portraits with AI precision.",
    category: "image",
    badge: "30 Image Suite",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    href: "/tools/image-remove-bg",
    icon: Sparkles,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "video-studio",
    name: "In-Browser Video Studio",
    desc: "Trim, crop, adjust playback speed, mute audio, and color grade directly in browser.",
    category: "video",
    badge: "0ms Latency",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    href: "/tools/video-editor",
    icon: Scissors,
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    id: "pdf-compress",
    name: "Compress PDF",
    desc: "Shrink PDF size by up to 80% without noticeable loss in document readability.",
    category: "pdf",
    badge: "High Efficiency",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    href: "/tools/pdf-compress",
    icon: Minimize2,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "video-to-mp3",
    name: "Extract MP3 Audio",
    desc: "Rip crystal clear high-bitrate MP3 audio from any MP4, MOV, or MKV video file.",
    category: "video",
    badge: "Fast Extraction",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    href: "/tools/video-to-mp3",
    icon: Music,
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    id: "webp-converter",
    name: "Convert to WebP",
    desc: "Convert heavy JPG and PNG photos into lightweight Next-Gen WebP images for web.",
    category: "image",
    badge: "Web Ready",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    href: "/tools/image-to-webp",
    icon: ImageIcon,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word (DOCX)",
    desc: "Turn read-only PDF contracts, receipts, and documents into fully editable Word files.",
    category: "pdf",
    badge: "OCR Enabled",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    href: "/tools/pdf-to-word",
    icon: FileCheck,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "video-trimmer",
    name: "Video Cutter & Trimmer",
    desc: "Cut unwanted footage with frame-level accuracy and export without re-encoding.",
    category: "video",
    badge: "Lossless Cut",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    href: "/tools/video?action=trim",
    icon: FileVideo,
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    id: "pdf-protect",
    name: "Protect & Encrypt PDF",
    desc: "Secure sensitive documents with military-grade 256-bit AES password encryption.",
    category: "pdf",
    badge: "AES-256",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    href: "/tools/pdf?action=protect",
    icon: Lock,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "pdf-split",
    name: "Split PDF",
    desc: "Extract specific page ranges or burst a single multi-page PDF into separate files.",
    category: "pdf",
    badge: "Custom Range",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    href: "/tools/pdf-split",
    icon: Split,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Featured Tools" },
  { id: "ai", label: "AI Studios" },
  { id: "pdf", label: "PDF Suite (34)" },
  { id: "image", label: "Image Tools (30)" },
  { id: "video", label: "Video Tools (25)" },
];

export default function ToolsSlider() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredTools =
    selectedCategory === "all"
      ? FEATURED_TOOLS
      : FEATURED_TOOLS.filter((t) => t.category === selectedCategory);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full">
      {/* Category Pills & Navigation Buttons Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-white text-zinc-950 shadow-md font-bold"
                  : "bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.06]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Slider Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="p-2 rounded-xl bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="p-2 rounded-xl bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="w-[285px] sm:w-[315px] flex-shrink-0 snap-start rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 hover:bg-slate-100 dark:bg-[#15151a] p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Header: Icon & Category Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${tool.iconBg} ${tool.iconColor} border border-slate-200 dark:border-white/[0.06] flex items-center justify-center group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tool.badgeColor}`}
                  >
                    {tool.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-violet-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {tool.desc}
                </p>
              </div>

              {/* Action Button */}
              <Link
                href={tool.href}
                className="mt-2 text-xs font-semibold text-white/90 hover:text-white inline-flex items-center justify-between w-full pt-3 border-t border-slate-200 dark:border-white/[0.06] group/btn cursor-pointer"
              >
                <span className="text-slate-300 group-hover/btn:text-white transition-colors">
                  Launch Tool
                </span>
                <div className="w-6 h-6 rounded-lg bg-white/[0.06] group-hover/btn:bg-violet-600 flex items-center justify-center text-slate-300 group-hover/btn:text-white transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
