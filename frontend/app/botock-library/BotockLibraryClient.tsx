"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Image as ImageIcon,
  Download,
  Search,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  FolderOpen,
  Play,
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { getBackendUrl } from "../../utils/runtime-urls";

interface LibraryItem {
  id: string;
  title: string;
  prompt: string;
  type: "photo" | "video";
  preview_url: string;
  download_url: string;
  aspect_ratio?: string;
  license: string;
  created_at: string;
}

export default function BotockLibraryClient() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "video" | "photo">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<LibraryItem | null>(null);
  const [backendUrl, setBackendUrl] = useState("");

  const fetchLibrary = async (mediaType = filter, query = search) => {
    setLoading(true);
    try {
      const base = await getBackendUrl();
      setBackendUrl(base);
      const url = new URL(`${base}/api/library/items`);
      if (mediaType !== "all") url.searchParams.set("type", mediaType);
      if (query.trim()) url.searchParams.set("search", query.trim());
      url.searchParams.set("limit", "48");

      const res = await fetch(url.toString(), {
        headers: { "Bypass-Tunnel-Reminder": "true" },
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn("Failed to fetch library items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary(filter, search);
  }, [filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLibrary(filter, search);
  };

  const copyPrompt = (item: LibraryItem) => {
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMediaUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${backendUrl}${url}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#07050d] text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      {/* =========================================================================
          HERO HEADER (Light & Dark Theme Ready)
      ========================================================================= */}
      <div className="relative border-b border-slate-200 dark:border-white/[0.08] bg-gradient-to-b from-white via-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:via-[#07050d] dark:to-[#07050d] pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Botock Library
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Copyright-Free AI Videos & Photos <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Ready for Social Media & Creators
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Browse and download high-resolution AI-generated stock videos and photos.
            Free for personal and commercial use — safe for Instagram Reels, TikTok, YouTube Shorts, and creative projects.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>100% Copyright-Free (CC0)</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span>Safe for Reels & Shorts</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS & SEARCH BAR
      ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                filter === "all"
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-bold"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => setFilter("video")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                filter === "video"
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-bold"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Film className="w-4 h-4" />
              Videos
            </button>
            <button
              onClick={() => setFilter("photo")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                filter === "photo"
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-bold"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photos
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts, keywords..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  fetchLibrary(filter, "");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Quick Refresh */}
          <button
            onClick={() => fetchLibrary()}
            disabled={loading}
            title="Refresh Library"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MEDIA GALLERY GRID
      ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-sm">Loading copyright-free media assets...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No generated content found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Content generated by creators on Botock will automatically appear here for everyone to browse, inspire, and download.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools/video-generator"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Film className="w-3.5 h-3.5" />
                Generate AI Video
              </Link>
              <Link
                href="/tools/image-generator"
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Generate AI Photo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const isVideo = item.type === "video";
              const mediaUrl = getMediaUrl(item.preview_url);

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/40 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl"
                >
                  {/* Media Visual Area */}
                  <div
                    onClick={() => setActiveItem(item)}
                    className="relative aspect-video bg-slate-950 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        preload="metadata"
                        muted
                        playsInline
                        loop
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => {
                          const v = e.currentTarget as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={item.title || "AI Photo"}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-wide text-white">
                      {isVideo ? (
                        <>
                          <Film className="w-3 h-3 text-cyan-400" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-purple-400" />
                          <span>Photo</span>
                        </>
                      )}
                    </div>

                    {/* Aspect Ratio Badge */}
                    {item.aspect_ratio && (
                      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white/90 font-mono">
                        {item.aspect_ratio}
                      </div>
                    )}

                    {/* Play Overlay Hint for Videos */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:opacity-0 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content & Action Bar */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                        "{item.prompt}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      {/* Copy Prompt */}
                      <button
                        onClick={() => copyPrompt(item)}
                        title="Copy prompt"
                        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>

                      {/* Download Link */}
                      <div className="flex items-center gap-2">
                        <a
                          href={getMediaUrl(item.download_url)}
                          download={`botock_${item.id}.${isVideo ? "mp4" : "png"}`}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          MEDIA DETAIL MODAL
      ========================================================================= */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase">
                  {activeItem.type === "video" ? "AI Video" : "AI Photo"}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{activeItem.aspect_ratio || "16:9"}</span>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Viewport */}
            <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden max-h-[50vh]">
              {activeItem.type === "video" ? (
                <video
                  src={getMediaUrl(activeItem.preview_url)}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[50vh] w-auto max-w-full"
                />
              ) : (
                <img
                  src={getMediaUrl(activeItem.preview_url)}
                  alt={activeItem.prompt}
                  className="max-h-[50vh] w-auto max-w-full object-contain"
                />
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  AI Generation Prompt
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono select-all">
                    {activeItem.prompt}
                  </p>
                  <button
                    onClick={() => copyPrompt(activeItem)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex-shrink-0 cursor-pointer"
                    title="Copy prompt"
                  >
                    {copiedId === activeItem.id ? (
                      <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* License Assurance Box */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-200 mb-0.5">100% Free & Copyright-Free</p>
                  <p className="text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    This media is free for personal & commercial use. You can use it in your Instagram Reels, TikTok, YouTube Shorts, and videos without attribution or copyright strikes.
                  </p>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <a
                  href={getMediaUrl(activeItem.download_url)}
                  download={`botock_${activeItem.id}.${activeItem.type === "video" ? "mp4" : "png"}`}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-500/25 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Full HD
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
