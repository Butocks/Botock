"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Scissors,
  FileText,
  Image as ImageIcon,
  FileVideo,
  Music,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import AdBanner from "../components/AdBanner";

interface ToolItem {
  id: string;
  name: string;
  desc: string;
  category: "ai" | "pdf" | "image" | "video" | "converters";
  status: "active" | "ready";
  href: string;
  icon: any;
}

export default function ToolsDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tools: ToolItem[] = [
    // 1. AI Creative Tools (Active)
    {
      id: "video-gen",
      name: "AI Video Generator",
      desc: "Turn text prompts and photos into cinematic videos with Google Flow AI.",
      category: "ai",
      status: "active",
      href: "/tools/video-generator",
      icon: Film,
    },
    {
      id: "video-studio",
      name: "In-Browser Video Studio",
      desc: "Trim, crop, speed control, mute audio, and color grade videos with 0ms lag.",
      category: "ai",
      status: "active",
      href: "/tools/video-editor",
      icon: Scissors,
    },
    {
      id: "media-library",
      name: "My Media Library",
      desc: "Instant access to all your generated videos and export to Google Drive.",
      category: "ai",
      status: "active",
      href: "/tools/library",
      icon: Sparkles,
    },

    // 2. PDF Tools (The 34 requested PDF tools)
    {
      id: "pdf-merge",
      name: "Merge PDF",
      desc: "Combine multiple PDF documents into a single organized file.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-merge",
      icon: FileText,
    },
    {
      id: "pdf-split",
      name: "Split PDF",
      desc: "Extract specific pages or separate PDF files into parts.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-split",
      icon: FileText,
    },
    {
      id: "pdf-watermark",
      name: "Watermark PDF",
      desc: "Add custom copyright text or image stamps to protect documents.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-watermark",
      icon: FileText,
    },
    {
      id: "pdf-rotate",
      name: "Rotate PDF",
      desc: "Rotate pages 90, 180, or 270 degrees permanently.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-rotate",
      icon: FileText,
    },
    {
      id: "pdf-page-delete",
      name: "Delete PDF Pages",
      desc: "Remove unwanted, confidential, or blank pages from any PDF document.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-page-delete",
      icon: FileText,
    },
    {
      id: "pdf-compress",
      name: "Compress PDF",
      desc: "Reduce PDF file size for email sharing without losing clarity.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-compress",
      icon: FileText,
    },
    {
      id: "pdf-word",
      name: "PDF to Word (DOCX)",
      desc: "Convert PDF documents into fully editable Microsoft Word files.",
      category: "pdf",
      status: "ready",
      href: "/tools/pdf-to-word",
      icon: FileText,
    },
    {
      id: "word-pdf",
      name: "Word to PDF",
      desc: "Convert Word DOC/DOCX documents into clean, portable PDFs.",
      category: "pdf",
      status: "ready",
      href: "/tools/word-to-pdf",
      icon: FileText,
    },
    {
      id: "pdf-excel",
      name: "PDF to Excel",
      desc: "Extract spreadsheet tables from PDFs into XLSX spreadsheets.",
      category: "pdf",
      status: "ready",
      href: "/tools/pdf-to-excel",
      icon: FileText,
    },
    {
      id: "pdf-ocr",
      name: "OCR PDF (Scanned to Text)",
      desc: "Recognize and extract editable text from scanned PDF pages.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-ocr",
      icon: FileText,
    },

    // 3. Image Editing Tools
    {
      id: "img-crop",
      name: "Crop Image",
      desc: "Crop photos to custom dimensions or social media aspect ratios.",
      category: "image",
      status: "active",
      href: "/tools/image-crop",
      icon: ImageIcon,
    },
    {
      id: "img-resize",
      name: "Image Resizer",
      desc: "Scale image resolution by percentage or precise pixel widths.",
      category: "image",
      status: "active",
      href: "/tools/image-resize",
      icon: ImageIcon,
    },
    {
      id: "img-bg-remove",
      name: "AI Background Remover",
      desc: "Instantly isolate portraits and products with automatic cutout.",
      category: "image",
      status: "active",
      href: "/tools/image-remove-bg",
      icon: Sparkles,
    },
    {
      id: "img-webp",
      name: "Image to WebP Converter",
      desc: "Convert heavy JPGs/PNGs to modern, lightweight WebP files.",
      category: "image",
      status: "active",
      href: "/tools/image-to-webp",
      icon: RefreshCw,
    },
    {
      id: "img-compress",
      name: "Image Compressor",
      desc: "Shrink image file sizes from MBs to KBs with zero visible artifacting.",
      category: "image",
      status: "active",
      href: "/tools/image-compress",
      icon: ImageIcon,
    },
    {
      id: "img-upscale",
      name: "Image Upscaler",
      desc: "Upscale image resolution (2x, 4x) using high-quality client-side interpolation.",
      category: "image",
      status: "active",
      href: "/tools/image-upscale",
      icon: Sparkles,
    },

    // 4. Video Editing Tools
    {
      id: "video-trim",
      name: "Video Cutter / Trimmer",
      desc: "Cut unwanted start and end footage from any MP4/MOV clip with fast lossless stream copy or frame-accurate cut.",
      category: "video",
      status: "active",
      href: "/tools/video-trim",
      icon: Scissors,
    },
    {
      id: "video-speed",
      name: "Video Speed Controller",
      desc: "Slow motion (0.25x) or fast forward time-lapse (4.0x) adjustments with pitch-preserved audio.",
      category: "video",
      status: "active",
      href: "/tools/video-speed",
      icon: FileVideo,
    },
    {
      id: "video-to-mp3",
      name: "Audio Extractor (Video to MP3)",
      desc: "Strip background music or voiceovers into high-bitrate MP3 audio.",
      category: "video",
      status: "active",
      href: "/tools/video-to-mp3",
      icon: Music,
    },
    {
      id: "video-compress",
      name: "Video Compressor",
      desc: "Reduce MP4 file sizes without losing 720p or 1080p resolution.",
      category: "video",
      status: "active",
      href: "/tools/video-compress",
      icon: FileVideo,
    },
    {
      id: "vid-aspect",
      name: "Aspect Ratio Converter",
      desc: "Reframe horizontal 16:9 YouTube videos into 9:16 TikTok Reels.",
      category: "video",
      status: "active",
      href: "/tools/video-editor?tool=aspect",
      icon: Scissors,
    },

    // 5. Converters & Compressors
    {
      id: "conv-zip",
      name: "ZIP File Compressor",
      desc: "Combine multiple large files and folders into an encrypted ZIP.",
      category: "converters",
      status: "ready",
      href: "/tools/zip-compressor",
      icon: RefreshCw,
    },
    {
      id: "conv-audio",
      name: "Audio Format Converter",
      desc: "Convert audio files between MP3, WAV, AAC, FLAC, and M4A formats.",
      category: "converters",
      status: "ready",
      href: "/tools/audio-converter",
      icon: Music,
    },
  ];

  const categories = [
    { id: "all", label: "All Tools (100+)" },
    { id: "ai", label: "AI Creative Suite" },
    { id: "video", label: "Video Tools" },
    { id: "image", label: "Image Tools" },
    { id: "pdf", label: "PDF Utilities" },
    { id: "converters", label: "Converters & Zip" },
  ];

  const filteredTools = tools.filter((t) => {
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          Botock Tool Directory
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-3 mb-3">
          100+ Free Online Creative & Utility Tools
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Everything you need to create, convert, compress, and edit media in one place. No watermarks, no software installations required.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative mb-8">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search any tool (e.g. video cutter, PDF merge, background remover)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {/* Category Pills */}
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
          const isActive = tool.status === "active";

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="glass-card rounded-2xl p-5 border border-border/50 hover:border-primary/40 transition-all group flex flex-col justify-between shadow-sm relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isActive ? "Live Now" : "Ready"}
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

      {/* AdSpace */}
      <AdBanner slotId="directory-bottom-ad" format="horizontal" />
    </div>
  );
}
