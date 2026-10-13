"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Music,
  FileVideo,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Subtitles,
  Smartphone,
  Layers,
  FileText,
  Mic,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { saveTransferMedia } from "@/app/utils/mediaTransfer";

interface ToolItem {
  id: string;
  title: string;
  desc: string;
  icon: any;
  href: string;
  supportsTransfer?: boolean;
}

interface ToolSuggestionsProps {
  type?: "video" | "image" | "audio" | "pdf";
  mediaBlob?: Blob | null;
  mediaUrl?: string | null;
  fileName?: string;
  onEditInStudio?: () => void;
}

export default function ToolSuggestions({
  type = "video",
  mediaBlob,
  mediaUrl,
  fileName = "botock_media",
  onEditInStudio,
}: ToolSuggestionsProps) {
  const router = useRouter();
  const [transferringToolId, setTransferringToolId] = useState<string | null>(null);

  // VIDEO TOOLS: Context-pure, strictly next steps for video creators
  const videoTools: ToolItem[] = [
    {
      id: "subtitles",
      title: "Add Auto Subtitles / Captions",
      desc: "Generate animated word-by-word captions in seconds",
      icon: Subtitles,
      href: "/tools/subtitles",
      supportsTransfer: true,
    },
    {
      id: "reframe",
      title: "Auto-Reframe to 9:16 (Reels)",
      desc: "Smart subject tracking crop for TikTok & Shorts",
      icon: Smartphone,
      href: "/tools/video-auto-reframe",
      supportsTransfer: true,
    },
    {
      id: "to-mp3",
      title: "Extract Audio to MP3",
      desc: "Extract background voice and music as clear MP3",
      icon: Music,
      href: "/tools/video-to-mp3",
      supportsTransfer: true,
    },
    {
      id: "trim",
      title: "Cut / Trim Video",
      desc: "Remove unwanted start/end segments instantly",
      icon: Scissors,
      href: "/tools/video-trim",
      supportsTransfer: true,
    },
    {
      id: "compress",
      title: "Compress Video File",
      desc: "Reduce file size up to 80% without losing quality",
      icon: FileVideo,
      href: "/tools/video-compress",
      supportsTransfer: true,
    },
  ];

  // IMAGE TOOLS: Context-pure for image and visual art creators
  const imageTools: ToolItem[] = [
    {
      id: "photo-to-video",
      title: "Animate into AI Video",
      desc: "Turn this still photo into a cinematic moving video",
      icon: Sparkles,
      href: "/tools/video-generator?mode=photo-to-video",
      supportsTransfer: false,
    },
    {
      id: "bg-remove",
      title: "AI Background Remover",
      desc: "Cut out background cleanly with 1-click AI mask",
      icon: Wand2,
      href: "/tools/image-remove-bg",
      supportsTransfer: true,
    },
    {
      id: "crop",
      title: "Crop & Canvas Resize",
      desc: "Format for Instagram, YouTube banner, or TikTok",
      icon: ImageIcon,
      href: "/tools/image-crop",
      supportsTransfer: true,
    },
    {
      id: "compress-img",
      title: "Compress Image",
      desc: "Reduce image file size with zero visible loss",
      icon: FileVideo,
      href: "/tools/image-compress",
      supportsTransfer: true,
    },
  ];

  // AUDIO TOOLS: Context-pure for audio editors
  const audioTools: ToolItem[] = [
    {
      id: "audio-enhance",
      title: "AI Voice Enhancer & Denoise",
      desc: "Remove background hiss, room echo, and noise",
      icon: Mic,
      href: "/tools/audio-enhance",
      supportsTransfer: true,
    },
    {
      id: "voice-changer",
      title: "AI Voice Changer",
      desc: "Pitch shift and transform voice into custom characters",
      icon: Sparkles,
      href: "/tools/voice-changer",
      supportsTransfer: true,
    },
    {
      id: "video-to-mp3",
      title: "Extract Audio to MP3",
      desc: "Convert and extract high-quality audio",
      icon: Music,
      href: "/tools/video-to-mp3",
      supportsTransfer: true,
    },
  ];

  // PDF TOOLS: Context-pure for documents
  const pdfTools: ToolItem[] = [
    {
      id: "pdf-merge",
      title: "Merge Multiple PDFs",
      desc: "Combine multiple PDF documents into a single file",
      icon: Layers,
      href: "/tools/pdf-merge",
      supportsTransfer: false,
    },
    {
      id: "pdf-compress",
      title: "Compress PDF Document",
      desc: "Reduce heavy PDF megabytes for quick email sharing",
      icon: FileText,
      href: "/tools/pdf-compress",
      supportsTransfer: false,
    },
    {
      id: "pdf-to-word",
      title: "Convert PDF to Word",
      desc: "Extract editable text and tables to DOCX format",
      icon: FileText,
      href: "/tools/pdf-to-word",
      supportsTransfer: false,
    },
    {
      id: "pdf-split",
      title: "Split PDF Pages",
      desc: "Extract specific pages into standalone files",
      icon: Scissors,
      href: "/tools/pdf-split",
      supportsTransfer: false,
    },
  ];

  let tools = videoTools;
  if (type === "image") tools = imageTools;
  else if (type === "audio") tools = audioTools;
  else if (type === "pdf") tools = pdfTools;

  const handleToolClick = async (tool: ToolItem) => {
    // If the tool supports media carryover and we have a media blob or url
    if (tool.supportsTransfer && (mediaBlob || mediaUrl)) {
      setTransferringToolId(tool.id);
      try {
        let blobToTransfer = mediaBlob;
        if (!blobToTransfer && mediaUrl) {
          const resp = await fetch(mediaUrl);
          blobToTransfer = await resp.blob();
        }

        if (blobToTransfer) {
          await saveTransferMedia(blobToTransfer, `${fileName}.${type === "video" ? "mp4" : "png"}`);
        }
      } catch (err) {
        console.warn("Could not transfer media to next tool:", err);
      } finally {
        setTransferringToolId(null);
      }
    }

    router.push(tool.href);
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08] w-full select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Recommended Next Actions</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continue enhancing your content with seamlessly connected Botock tools
          </p>
        </div>
        {type === "video" && onEditInStudio && (
          <button
            onClick={onEditInStudio}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 hover:bg-violet-600/20 border border-violet-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Open in Full Studio Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {tools.slice(0, 4).map((tool) => {
          const Icon = tool.icon;
          const isTransferring = transferringToolId === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              disabled={isTransferring}
              className="group p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-cyan-500/40 dark:hover:border-cyan-500/40 hover:shadow-lg dark:hover:shadow-cyan-500/5 transition-all text-left flex items-start gap-3 cursor-pointer disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                {isTransferring ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>{tool.title}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-cyan-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
