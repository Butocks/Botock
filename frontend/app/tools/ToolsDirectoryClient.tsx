"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Scissors,
  FileText,
  Image as ImageIcon,
  FileVideo,
  Music,
  Search,
  CheckCircle2,
  ArrowRight,
  Lock,
  Crop,
  Layers,
  FileSpreadsheet,
  Minimize2,
  Sliders,
  Type,
  Maximize2,
  RotateCw,
  FolderTree,
  BookOpen,
} from "lucide-react";
import AdBanner from "../components/AdBanner";

export interface ToolItem {
  id: string;
  name: string;
  desc: string;
  category: "ai" | "pdf" | "image" | "video";
  href: string;
  icon: any;
}

export const IMPLEMENTED_TOOLS: ToolItem[] = [
  // 1. AI Creative Suite
  {
    id: "video-gen",
    name: "AI Video Generator",
    desc: "Turn text prompts and photos into cinematic videos with high-definition AI rendering.",
    category: "ai",
    href: "/tools/video-generator",
    icon: Film,
  },
  {
    id: "image-gen",
    name: "AI Image Generator",
    desc: "Generate photorealistic artwork, product photos, and digital designs from text prompts.",
    category: "ai",
    href: "/tools/image-generator",
    icon: Sparkles,
  },
  {
    id: "video-studio",
    name: "In-Browser Video Studio",
    desc: "Multi-track video editor with trimming, splitting, speed control, and color presets.",
    category: "ai",
    href: "/tools/video-editor",
    icon: Scissors,
  },
  {
    id: "media-library",
    name: "My Media Library",
    desc: "Instant access to all your generated videos and downloaded creative assets.",
    category: "ai",
    href: "/tools/library",
    icon: Sparkles,
  },

  // 2. PDF Suite
  {
    id: "pdf-merge",
    name: "Merge PDF",
    desc: "Combine multiple PDF documents into a single organized file with custom ordering.",
    category: "pdf",
    href: "/tools/pdf-merge",
    icon: FileText,
  },
  {
    id: "pdf-split",
    name: "Split PDF",
    desc: "Extract specific page ranges or split PDF documents into standalone files.",
    category: "pdf",
    href: "/tools/pdf-split",
    icon: FileText,
  },
  {
    id: "pdf-compress",
    name: "Compress PDF",
    desc: "Reduce PDF document size for email sharing while preserving font clarity.",
    category: "pdf",
    href: "/tools/pdf-compress",
    icon: Minimize2,
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word (DOCX)",
    desc: "Convert static PDF documents into fully editable Microsoft Word documents.",
    category: "pdf",
    href: "/tools/pdf-to-word",
    icon: FileText,
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    desc: "Convert Microsoft Word (.docx) files into clean, shareable PDF documents.",
    category: "pdf",
    href: "/tools/word-to-pdf",
    icon: FileText,
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    desc: "Extract tables and tabular data from PDF files into Microsoft Excel spreadsheets.",
    category: "pdf",
    href: "/tools/pdf-to-excel",
    icon: FileSpreadsheet,
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    desc: "Convert spreadsheets (.xlsx, .xls) into formatted printable PDF documents.",
    category: "pdf",
    href: "/tools/excel-to-pdf",
    icon: FileSpreadsheet,
  },
  {
    id: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    desc: "Convert PDF slides into presentation-ready PowerPoint (.pptx) decks.",
    category: "pdf",
    href: "/tools/pdf-to-powerpoint",
    icon: FileText,
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    desc: "Extract high-resolution images from PDF pages in JPG format.",
    category: "pdf",
    href: "/tools/pdf-to-jpg",
    icon: ImageIcon,
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    desc: "Convert images and photos into a structured, unified PDF document.",
    category: "pdf",
    href: "/tools/jpg-to-pdf",
    icon: FileText,
  },
  {
    id: "crop-pdf",
    name: "Crop PDF",
    desc: "Trim margins and crop unwanted white space from PDF document pages.",
    category: "pdf",
    href: "/tools/crop-pdf",
    icon: Crop,
  },
  {
    id: "organize-pdf",
    name: "Organize PDF",
    desc: "Reorder, duplicate, rotate, and sort pages inside any PDF document.",
    category: "pdf",
    href: "/tools/organize-pdf",
    icon: FolderTree,
  },
  {
    id: "pdf-page-numbers",
    name: "Add Page Numbers to PDF",
    desc: "Insert customizable header and footer page numbering across PDF documents.",
    category: "pdf",
    href: "/tools/pdf-page-numbers",
    icon: Type,
  },
  {
    id: "pdf-protect",
    name: "Password Protect PDF",
    desc: "Encrypt sensitive PDF documents with secure password protection.",
    category: "pdf",
    href: "/tools/pdf-protect",
    icon: Lock,
  },
  {
    id: "pdf-rotate",
    name: "Rotate PDF",
    desc: "Rotate individual or all pages in a PDF document 90, 180, or 270 degrees.",
    category: "pdf",
    href: "/tools/pdf-rotate",
    icon: RotateCw,
  },
  {
    id: "pdf-page-delete",
    name: "Delete PDF Pages",
    desc: "Remove unwanted, blank, or confidential pages from any PDF document.",
    category: "pdf",
    href: "/tools/pdf-page-delete",
    icon: FileText,
  },
  {
    id: "pdf-watermark",
    name: "Watermark PDF",
    desc: "Stamp copyright text or image watermarks onto PDF pages.",
    category: "pdf",
    href: "/tools/pdf-watermark",
    icon: Layers,
  },
  {
    id: "html-to-pdf",
    name: "HTML to PDF",
    desc: "Convert HTML source code and web pages into clean PDF documents.",
    category: "pdf",
    href: "/tools/html-to-pdf",
    icon: FileText,
  },
  {
    id: "pdf-forms",
    name: "Fill & Sign PDF Forms",
    desc: "Interactively fill out PDF form fields, checkboxes, and sign documents.",
    category: "pdf",
    href: "/tools/pdf-forms",
    icon: FileText,
  },
  {
    id: "pdf-to-book",
    name: "PDF to Booklet",
    desc: "Transform standard PDF documents into paginated print-ready booklets.",
    category: "pdf",
    href: "/tools/pdf-to-book",
    icon: BookOpen,
  },
  {
    id: "pdf-ai-summarizer",
    name: "PDF AI Summarizer",
    desc: "Extract key takeaways, executive summaries, and action points from PDF reports.",
    category: "pdf",
    href: "/tools/pdf-ai-summarizer",
    icon: Sparkles,
  },

  // 3. Image Suite
  {
    id: "image-remove-bg",
    name: "AI Background Remover",
    desc: "Remove photo backgrounds with edge-precision AI for portraits and e-commerce.",
    category: "image",
    href: "/tools/image-remove-bg",
    icon: Sparkles,
  },
  {
    id: "image-compress",
    name: "Compress Images",
    desc: "Shrink image file size for WebP, PNG, and JPG without visible quality loss.",
    category: "image",
    href: "/tools/image-compress",
    icon: Minimize2,
  },
  {
    id: "image-convert",
    name: "Image Format Converter",
    desc: "Convert between WebP, PNG, JPG, BMP, and GIF formats in seconds.",
    category: "image",
    href: "/tools/image-convert",
    icon: ImageIcon,
  },
  {
    id: "image-crop",
    name: "Crop Image",
    desc: "Crop photos to standard aspect ratios (16:9, 1:1, 4:5, 9:16) with pixel precision.",
    category: "image",
    href: "/tools/image-crop",
    icon: Crop,
  },
  {
    id: "image-resize",
    name: "Resize Image",
    desc: "Scale image dimensions in pixels or percentages while locking aspect ratio.",
    category: "image",
    href: "/tools/image-resize",
    icon: Maximize2,
  },
  {
    id: "image-rotate",
    name: "Rotate & Flip Image",
    desc: "Rotate photos 90/180/270 degrees and flip horizontally or vertically.",
    category: "image",
    href: "/tools/image-rotate",
    icon: RotateCw,
  },
  {
    id: "image-filters",
    name: "Image Filters & Effects",
    desc: "Apply brightness, contrast, grayscale, sepia, and cinematic color grading.",
    category: "image",
    href: "/tools/image-filters",
    icon: Sliders,
  },

  // 4. Video Suite
  {
    id: "video-trim",
    name: "Video Cutter & Trimmer",
    desc: "Trim and cut video clips with frame accuracy in browser with zero latency.",
    category: "video",
    href: "/tools/video-trim",
    icon: Scissors,
  },
  {
    id: "video-to-mp3",
    name: "Extract MP3 Audio",
    desc: "Extract high-bitrate MP3 audio from MP4, WebM, and MOV video files.",
    category: "video",
    href: "/tools/video-to-mp3",
    icon: Music,
  },
  {
    id: "video-compress",
    name: "Compress Video",
    desc: "Reduce video file sizes while retaining optimal bitrate and resolution.",
    category: "video",
    href: "/tools/video-compress",
    icon: Minimize2,
  },
  {
    id: "video-convert",
    name: "Video Converter",
    desc: "Convert videos between MP4, WebM, MOV, and AVI formats.",
    category: "video",
    href: "/tools/video-convert",
    icon: FileVideo,
  },
  {
    id: "video-to-gif",
    name: "Video to GIF",
    desc: "Convert video highlights into lightweight animated GIF loops.",
    category: "video",
    href: "/tools/video-to-gif",
    icon: Film,
  },
  {
    id: "subtitles",
    name: "Video Subtitles Generator",
    desc: "Generate and edit subtitle tracks (SRT/VTT) with synchronized timing.",
    category: "video",
    href: "/tools/subtitles",
    icon: Type,
  },
];

function ToolsDirectoryInner() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: `All Tools (${IMPLEMENTED_TOOLS.length})` },
    { id: "ai", label: "AI Creative Suite" },
    { id: "pdf", label: "PDF Suite" },
    { id: "image", label: "Image Tools" },
    { id: "video", label: "Video & Audio" },
  ];

  const filteredTools = IMPLEMENTED_TOOLS.filter((t) => {
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="max-w-md mx-auto relative mb-8">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search any tool (e.g. video cutter, PDF merge, background remover)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search tools"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? "bg-primary text-white shadow-sm"
                : "border border-border/50 bg-card/40 hover:bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="glass-card rounded-2xl p-5 border border-border/50 hover:border-primary/40 transition-all group flex flex-col justify-between shadow-sm relative hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Free &amp; Online</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <AdBanner slotId="directory-bottom-ad" format="horizontal" />
    </div>
  );
}


export default function ToolsDirectoryClient() {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-500">Loading tools directory...</div>}>
      <ToolsDirectoryInner />
    </Suspense>
  );
}
