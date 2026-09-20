"use client";

import Link from "next/link";
import {
  Film,
  Sparkles,
  Scissors,
  FileText,
  Image as ImageIcon,
  FileVideo,
  Music,
  Zap,
  ArrowRight,
  Layers,
  Wand2,
  Lock,
  FileCheck,
  Minimize2,
  Split,
  Crop,
  ShieldCheck,
  Sliders,
  FileSpreadsheet,
  FileArchive,
  Volume2,
  Camera,
  RefreshCw,
} from "lucide-react";

interface GlideTool {
  id: string;
  name: string;
  suite: string;
  suiteColor: string;
  href: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

const ROW_1: GlideTool[] = [
  {
    id: "ai-video",
    name: "AI Video Generator",
    suite: "Flow AI",
    suiteColor: "text-violet-300 bg-violet-500/20 border-violet-500/30",
    href: "/tools/video-generator",
    icon: Film,
    iconBg: "bg-violet-600/20",
    iconColor: "text-violet-400",
  },
  {
    id: "pdf-merge",
    name: "Merge PDF Documents",
    suite: "PDF",
    suiteColor: "text-rose-300 bg-rose-500/20 border-rose-500/30",
    href: "/tools/pdf-merge",
    icon: FileText,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "remove-bg",
    name: "Remove Photo Background",
    suite: "Image",
    suiteColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30",
    href: "/tools/image-remove-bg",
    icon: Sparkles,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "video-editor",
    name: "In-Browser Video Studio",
    suite: "0ms Video",
    suiteColor: "text-sky-300 bg-sky-500/20 border-sky-500/30",
    href: "/tools/video-editor",
    icon: Scissors,
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    id: "ai-image",
    name: "Nano Banana AI Image",
    suite: "AI Art",
    suiteColor: "text-amber-300 bg-amber-500/20 border-amber-500/30",
    href: "/tools/image-generator",
    icon: Wand2,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word (DOCX)",
    suite: "OCR PDF",
    suiteColor: "text-rose-300 bg-rose-500/20 border-rose-500/30",
    href: "/tools/pdf-to-word",
    icon: FileCheck,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "video-to-mp3",
    name: "Extract MP3 Audio",
    suite: "Audio",
    suiteColor: "text-indigo-300 bg-indigo-500/20 border-indigo-500/30",
    href: "/tools/video-to-mp3",
    icon: Music,
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    id: "webp-converter",
    name: "JPG / PNG to WebP",
    suite: "Image",
    suiteColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30",
    href: "/tools/image-to-webp",
    icon: ImageIcon,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

const ROW_2: GlideTool[] = [
  {
    id: "pdf-compress",
    name: "Compress PDF Files",
    suite: "PDF",
    suiteColor: "text-rose-300 bg-rose-500/20 border-rose-500/30",
    href: "/tools/pdf-compress",
    icon: Minimize2,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "video-trimmer",
    name: "Precision Video Cutter",
    suite: "Video",
    suiteColor: "text-sky-300 bg-sky-500/20 border-sky-500/30",
    href: "/tools/video?action=trim",
    icon: FileVideo,
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    id: "pdf-protect",
    name: "AES-256 PDF Protect",
    suite: "Security",
    suiteColor: "text-rose-300 bg-rose-500/20 border-rose-500/30",
    href: "/tools/pdf?action=protect",
    icon: Lock,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "image-upscale",
    name: "AI Photo Upscaler",
    suite: "Image",
    suiteColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30",
    href: "/tools/image-upscale",
    icon: Camera,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "pdf-split",
    name: "Split & Extract Pages",
    suite: "PDF",
    suiteColor: "text-rose-300 bg-rose-500/20 border-rose-500/30",
    href: "/tools/pdf-split",
    icon: Split,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "video-compress",
    name: "Compress Video MP4",
    suite: "Video",
    suiteColor: "text-sky-300 bg-sky-500/20 border-sky-500/30",
    href: "/tools/video-compress",
    icon: FileVideo,
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    id: "pdf-excel",
    name: "PDF to Excel (XLSX)",
    suite: "PDF",
    suiteColor: "text-rose-300 bg-rose-500/20 border-rose-500/30",
    href: "/tools/pdf-to-excel",
    icon: FileSpreadsheet,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    id: "all-directory",
    name: "Explore 100+ Directory",
    suite: "All Tools",
    suiteColor: "text-violet-300 bg-violet-500/20 border-violet-500/30",
    href: "/tools",
    icon: Layers,
    iconBg: "bg-violet-600/20",
    iconColor: "text-violet-400",
  },
];

export default function ToolGlideTicker() {
  // We duplicate array so marquee loops seamlessly
  const doubledRow1 = [...ROW_1, ...ROW_1];
  const doubledRow2 = [...ROW_2, ...ROW_2];

  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      {/* Left and Right Fade Gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

      {/* Ticker Row 1: Leftward Glide */}
      <div className="animate-marquee gap-3.5 mb-3 flex items-center">
        {doubledRow1.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <Link
              key={`row1-${tool.id}-${idx}`}
              href={tool.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#111114] hover:bg-[#16161c] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 transition-all group flex-shrink-0 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div
                className={`w-8 h-8 rounded-xl ${tool.iconBg} ${tool.iconColor} border border-slate-200 dark:border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors whitespace-nowrap">
                  {tool.name}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className={`px-1 py-0.2 rounded border font-semibold text-[9px] ${tool.suiteColor}`}>
                    {tool.suite}
                  </span>
                  <span>Direct Open →</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Ticker Row 2: Rightward Glide (Reverse) */}
      <div className="animate-marquee-reverse gap-3.5 flex items-center">
        {doubledRow2.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <Link
              key={`row2-${tool.id}-${idx}`}
              href={tool.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#111114] hover:bg-[#16161c] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500/40 transition-all group flex-shrink-0 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div
                className={`w-8 h-8 rounded-xl ${tool.iconBg} ${tool.iconColor} border border-slate-200 dark:border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors whitespace-nowrap">
                  {tool.name}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className={`px-1 py-0.2 rounded border font-semibold text-[9px] ${tool.suiteColor}`}>
                    {tool.suite}
                  </span>
                  <span>Direct Open →</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
