"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Layers,
  ArrowUpDown,
  Sparkles,
  Download,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Subtitles,
  Headphones,
  Mic,
  Scissors,
  CheckCircle2,
  RefreshCw,
  Video,
  X,
  Edit2,
  Sliders,
  Smartphone,
  Monitor,
  Square,
  Maximize2,
} from "lucide-react";
import { getBackendUrl } from "@/utils/runtime-urls";
import { saveTransferMedia } from "@/app/utils/mediaTransfer";

type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5";
type LayoutMode = "stacked" | "side_by_side" | "pip";
type SplitRatio = "50/50" | "60/40" | "70/30" | "40/60" | "30/70";
type AudioMode = "mix" | "top_only" | "bottom_only" | "mute";

export default function ReactionVideoClient() {
  const router = useRouter();

  // Video Inputs
  const [fileTop, setFileTop] = useState<File | null>(null);
  const [fileBottom, setFileBottom] = useState<File | null>(null);
  const [urlTop, setUrlTop] = useState<string | null>(null);
  const [urlBottom, setUrlBottom] = useState<string | null>(null);

  // Settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [layout, setLayout] = useState<LayoutMode>("stacked");
  const [splitRatio, setSplitRatio] = useState<SplitRatio>("50/50");
  const [audioMode, setAudioMode] = useState<AudioMode>("mix");
  const [volumeTop, setVolumeTop] = useState<number>(1.0);
  const [volumeBottom, setVolumeBottom] = useState<number>(1.0);
  const [durationMode, setDurationMode] = useState<"shortest" | "longest">("shortest");

  // Playback sync
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Export State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Refs
  const inputTopRef = useRef<HTMLInputElement>(null);
  const inputBottomRef = useRef<HTMLInputElement>(null);
  const videoTopRef = useRef<HTMLVideoElement>(null);
  const videoBottomRef = useRef<HTMLVideoElement>(null);
  const exportedVideoRef = useRef<HTMLVideoElement>(null);

  // Synchronize top file upload
  const handleTopFile = (file: File) => {
    if (urlTop) URL.revokeObjectURL(urlTop);
    setFileTop(file);
    const u = URL.createObjectURL(file);
    setUrlTop(u);
    setErrorMessage("");
  };

  // Synchronize bottom file upload
  const handleBottomFile = (file: File) => {
    if (urlBottom) URL.revokeObjectURL(urlBottom);
    setFileBottom(file);
    const u = URL.createObjectURL(file);
    setUrlBottom(u);
    setErrorMessage("");
  };

  // Swap top and bottom videos
  const handleSwapVideos = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const tempFile = fileTop;
    const tempUrl = urlTop;
    const tempVol = volumeTop;

    setFileTop(fileBottom);
    setUrlTop(urlBottom);
    setVolumeTop(volumeBottom);

    setFileBottom(tempFile);
    setUrlBottom(tempUrl);
    setVolumeBottom(tempVol);
  };

  // Synchronize playback
  const togglePlay = () => {
    if (!videoTopRef.current && !videoBottomRef.current) return;
    if (isPlaying) {
      videoTopRef.current?.pause();
      videoBottomRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoTopRef.current?.play().catch(() => {});
      videoBottomRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const t = videoTopRef.current?.currentTime || 0;
    setCurrentTime(t);
  };

  const handleLoadedMetadata = () => {
    const dTop = videoTopRef.current?.duration || 0;
    const dBot = videoBottomRef.current?.duration || 0;
    const dur = Math.max(dTop, dBot);
    setMaxDuration(dur);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoTopRef.current) videoTopRef.current.currentTime = t;
    if (videoBottomRef.current) videoBottomRef.current.currentTime = t;
  };

  // Process / Combine Videos
  const handleCombineVideos = async () => {
    if (!fileTop || !fileBottom) {
      setErrorMessage("Please upload both videos (Top & Bottom) inside the preview canvas.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setProcessStep("Preparing videos and settings...");

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("video_top", fileTop);
      formData.append("video_bottom", fileBottom);
      formData.append("aspect_ratio", aspectRatio);
      formData.append("layout", layout);
      formData.append("split_ratio", splitRatio);
      formData.append("audio_mode", audioMode);
      formData.append("volume_top", volumeTop.toString());
      formData.append("volume_bottom", volumeBottom.toString());
      formData.append("duration_mode", durationMode);

      setProcessStep("Rendering reaction video with high-definition FFmpeg...");

      const primaryUrl = backendUrl
        ? `${backendUrl}/api/video/reaction-combine`
        : "/api/video/reaction-combine";

      let res: Response;
      try {
        res = await fetch(primaryUrl, {
          method: "POST",
          body: formData,
        });
      } catch (networkErr) {
        // Fallback to same-origin Next.js proxy route if direct backend fetch fails
        if (primaryUrl !== "/api/video/reaction-combine") {
          res = await fetch("/api/video/reaction-combine", {
            method: "POST",
            body: formData,
          });
        } else {
          throw networkErr;
        }
      }

      if (!res.ok) {
        let errorText = "";
        try {
          const json = await res.json();
          errorText = json.detail || JSON.stringify(json);
        } catch {
          errorText = await res.text();
        }
        throw new Error(errorText || "Failed to combine reaction videos. Please check file sizes.");
      }

      setProcessStep("Finalizing video export...");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setExportedBlob(blob);
      setExportedUrl(url);

      // Save into media store so other tools have it automatically ready
      await saveTransferMedia(blob, `reaction_${aspectRatio.replace(":", "_")}.mp4`);

      setShowExportModal(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred while creating your reaction video.");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  const handleNavigateWithMedia = async (targetToolPath: string) => {
    if (exportedBlob) {
      await saveTransferMedia(exportedBlob, `reaction_${aspectRatio.replace(":", "_")}.mp4`);
    }
    router.push(targetToolPath);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={inputTopRef}
        onChange={(e) => e.target.files?.[0] && handleTopFile(e.target.files[0])}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={inputBottomRef}
        onChange={(e) => e.target.files?.[0] && handleBottomFile(e.target.files[0])}
        accept="video/*"
        className="hidden"
      />

      {/* Header */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Interactive Split &amp; Stacked Video Maker</span>
        </div>
        <h1 className="text-xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Reaction Video Maker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Tap or drag videos directly into the canvas below. Stack gameplay above your facecam for viral TikToks, Reels, and Shorts.
        </p>
      </div>

      {/* Main Interactive Stage Container */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-5">
        
        {/* Aspect Ratio & Layout Quick Bar */}
        <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          {/* Row 1: Aspect Ratio */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start px-0.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 min-w-[48px]">
              Ratio:
            </span>
            {[
              { id: "9:16", label: "9:16", sub: "Shorts", icon: Smartphone },
              { id: "16:9", label: "16:9", sub: "Wide", icon: Monitor },
              { id: "1:1", label: "1:1", sub: "Square", icon: Square },
              { id: "4:5", label: "4:5", sub: "Feed", icon: Maximize2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAspectRatio(item.id as AspectRatio)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    aspectRatio === item.id
                      ? "bg-pink-600 text-white shadow-sm shadow-pink-500/20 border border-pink-600"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  <span className="opacity-75 text-[10px] hidden sm:inline">({item.sub})</span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Layout Mode */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start px-0.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 min-w-[48px]">
              Layout:
            </span>
            {[
              { id: "stacked", label: "Stacked (Up/Down)" },
              { id: "side_by_side", label: "Side-by-Side (Left/Right)" },
              { id: "pip", label: "PiP Cam" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLayout(item.id as LayoutMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  layout === item.id
                    ? "bg-pink-600 text-white shadow-sm shadow-pink-500/20 border border-pink-600"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Row 3: Split Ratio Pills (If Stacked) */}
          {layout === "stacked" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start px-0.5 pt-0.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 min-w-[48px]">
                Split:
              </span>
              {[
                { id: "50/50", label: "50/50 Equal" },
                { id: "60/40", label: "60/40 Top Focus" },
                { id: "70/30", label: "70/30 Large Clip" },
                { id: "40/60", label: "40/60 Cam Focus" },
                { id: "30/70", label: "30/70 Bottom Focus" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSplitRatio(item.id as SplitRatio)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    splitRatio === item.id
                      ? "bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/40 font-bold"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-zinc-800/60 dark:hover:bg-zinc-700 dark:text-slate-400 border border-transparent"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Row 4: Duration Mode Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start px-0.5 pt-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 min-w-[48px]">
              Duration:
            </span>
            {[
              { id: "shortest", label: "Shortest Video (Cut End)" },
              { id: "longest", label: "Longest Video (Freeze End)" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDurationMode(item.id as "shortest" | "longest")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  durationMode === item.id
                    ? "bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/40 font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-zinc-800/60 dark:hover:bg-zinc-700 dark:text-slate-400 border border-transparent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* THE MAIN INTERACTIVE STAGE (Direct In-Canvas Uploaders) */}
        <div className="flex flex-col items-center">
          <div
            className={`relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-zinc-800 shadow-2xl bg-zinc-950 flex flex-col transition-all duration-300 mx-auto ${
              aspectRatio === "9:16"
                ? "w-full max-w-[240px] xs:max-w-[260px] sm:max-w-[320px] aspect-[9/16] max-h-[380px] sm:max-h-[500px]"
                : aspectRatio === "16:9"
                ? "w-full max-w-[520px] aspect-video"
                : aspectRatio === "1:1"
                ? "w-full max-w-[320px] sm:max-w-[360px] aspect-square"
                : "w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5]"
            }`}
          >
            {/* 1. STACKED LAYOUT */}
            {layout === "stacked" && (
              <div className="w-full h-full flex flex-col relative select-none bg-zinc-950">
                {/* TOP HALF SLOT */}
                <div
                  style={{
                    height:
                      splitRatio === "60/40"
                        ? "60%"
                        : splitRatio === "70/30"
                        ? "70%"
                        : splitRatio === "40/60"
                        ? "40%"
                        : splitRatio === "30/70"
                        ? "30%"
                        : "50%",
                  }}
                  className="relative w-full overflow-hidden transition-all duration-200 border-b border-dashed border-zinc-700"
                >
                  {!urlTop ? (
                    <div
                      onClick={() => inputTopRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) handleTopFile(e.dataTransfer.files[0]);
                      }}
                      className="w-full h-full p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-900/90 hover:bg-zinc-800/90 text-white group"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        Click to upload or drag &amp; drop
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                        Top Video (Gameplay, Meme, Clip)
                      </p>
                      <span className="mt-1.5 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        TOP VIDEO
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full group bg-black">
                      <video
                        ref={videoTopRef}
                        src={urlTop}
                        playsInline
                        muted={isMuted || audioMode === "bottom_only" || audioMode === "mute"}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        className="w-full h-full object-cover"
                      />
                      {/* Top Overlay Badge & Actions */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className="pointer-events-auto px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white backdrop-blur-sm truncate max-w-[130px]">
                          TOP: {fileTop?.name}
                        </span>
                        <div className="pointer-events-auto flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => inputTopRef.current?.click()}
                            className="p-1 rounded-md bg-black/70 hover:bg-black text-white text-[10px] flex items-center gap-1 px-1.5 transition-colors cursor-pointer"
                            title="Change Video"
                          >
                            <Edit2 className="w-3 h-3" /> Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFileTop(null);
                              if (urlTop) URL.revokeObjectURL(urlTop);
                              setUrlTop(null);
                            }}
                            className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                            title="Remove Video"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Centered Swap Button - ALWAYS ON TOP, NEVER CLIPPED */}
                <div
                  style={{
                    top:
                      splitRatio === "60/40"
                        ? "60%"
                        : splitRatio === "70/30"
                        ? "70%"
                        : splitRatio === "40/60"
                        ? "40%"
                        : "50%",
                  }}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
                >
                  <button
                    type="button"
                    onClick={handleSwapVideos}
                    disabled={!fileTop && !fileBottom}
                    className="flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="Swap Top and Bottom videos"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-pink-400" />
                    <span>Swap Positions</span>
                  </button>
                </div>

                {/* BOTTOM HALF SLOT */}
                <div className="relative w-full flex-1 overflow-hidden transition-all duration-200">
                  {!urlBottom ? (
                    <div
                      onClick={() => inputBottomRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) handleBottomFile(e.dataTransfer.files[0]);
                      }}
                      className="w-full h-full p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-900/90 hover:bg-zinc-800/90 text-white group"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        Click to upload or drag &amp; drop
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                        Bottom Video (Reaction Cam, Facecam)
                      </p>
                      <span className="mt-1.5 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        REACTION CAM
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full group bg-black">
                      <video
                        ref={videoBottomRef}
                        src={urlBottom}
                        playsInline
                        muted={isMuted || audioMode === "top_only" || audioMode === "mute"}
                        className="w-full h-full object-cover"
                      />
                      {/* Bottom Overlay Badge & Actions */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className="pointer-events-auto px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white backdrop-blur-sm truncate max-w-[130px]">
                          CAM: {fileBottom?.name}
                        </span>
                        <div className="pointer-events-auto flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => inputBottomRef.current?.click()}
                            className="p-1 rounded-md bg-black/70 hover:bg-black text-white text-[10px] flex items-center gap-1 px-1.5 transition-colors cursor-pointer"
                            title="Change Video"
                          >
                            <Edit2 className="w-3 h-3" /> Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFileBottom(null);
                              if (urlBottom) URL.revokeObjectURL(urlBottom);
                              setUrlBottom(null);
                            }}
                            className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                            title="Remove Video"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. SIDE-BY-SIDE LAYOUT */}
            {layout === "side_by_side" && (
              <div className="w-full h-full flex flex-row relative select-none bg-zinc-950">
                {/* LEFT SLOT */}
                <div className="relative w-1/2 h-full overflow-hidden border-r border-zinc-700">
                  {!urlTop ? (
                    <div
                      onClick={() => inputTopRef.current?.click()}
                      className="w-full h-full p-2 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-900/90 hover:bg-zinc-800/90 text-white"
                    >
                      <Upload className="w-5 h-5 text-blue-400 mb-1" />
                      <p className="text-[11px] font-bold text-white">Click to upload</p>
                      <span className="text-[10px] text-zinc-400">Left Video</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-black">
                      <video
                        ref={videoTopRef}
                        src={urlTop}
                        playsInline
                        muted={isMuted || audioMode === "bottom_only" || audioMode === "mute"}
                        onTimeUpdate={handleTimeUpdate}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFileTop(null);
                          if (urlTop) URL.revokeObjectURL(urlTop);
                          setUrlTop(null);
                        }}
                        className="absolute top-1 right-1 p-1 rounded bg-red-600/80 hover:bg-red-600 text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* RIGHT SLOT */}
                <div className="relative w-1/2 h-full overflow-hidden">
                  {!urlBottom ? (
                    <div
                      onClick={() => inputBottomRef.current?.click()}
                      className="w-full h-full p-2 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-900/90 hover:bg-zinc-800/90 text-white"
                    >
                      <Video className="w-5 h-5 text-pink-400 mb-1" />
                      <p className="text-[11px] font-bold text-white">Click to upload</p>
                      <span className="text-[10px] text-zinc-400">Right Video</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-black">
                      <video
                        ref={videoBottomRef}
                        src={urlBottom}
                        playsInline
                        muted={isMuted || audioMode === "top_only" || audioMode === "mute"}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFileBottom(null);
                          if (urlBottom) URL.revokeObjectURL(urlBottom);
                          setUrlBottom(null);
                        }}
                        className="absolute top-1 right-1 p-1 rounded bg-red-600/80 hover:bg-red-600 text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. PIP LAYOUT */}
            {layout === "pip" && (
              <div className="relative w-full h-full select-none bg-zinc-950">
                {/* Main Fullscreen Video */}
                {!urlTop ? (
                  <div
                    onClick={() => inputTopRef.current?.click()}
                    className="w-full h-full p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-900/90 hover:bg-zinc-800/90 text-white"
                  >
                    <Upload className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="text-xs sm:text-sm font-bold text-white">Click to upload</p>
                    <span className="text-[11px] text-zinc-400">Main Video</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoTopRef}
                      src={urlTop}
                      playsInline
                      muted={isMuted || audioMode === "bottom_only" || audioMode === "mute"}
                      onTimeUpdate={handleTimeUpdate}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                      <button
                        type="button"
                        onClick={() => inputTopRef.current?.click()}
                        className="p-1 rounded-md bg-black/70 hover:bg-black text-white text-[10px] flex items-center gap-1 px-1.5 transition-colors cursor-pointer"
                        title="Change Main Video"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFileTop(null);
                          if (urlTop) URL.revokeObjectURL(urlTop);
                          setUrlTop(null);
                        }}
                        className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        title="Remove Main Video"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Floating Corner Reaction Box */}
                <div
                  onClick={() => !urlBottom && inputBottomRef.current?.click()}
                  className="absolute bottom-3 right-3 w-1/3 aspect-video rounded-xl overflow-hidden border-2 border-pink-500 shadow-2xl bg-zinc-900 flex items-center justify-center cursor-pointer z-10 group"
                >
                  {!urlBottom ? (
                    <div className="text-center p-1 text-white">
                      <Video className="w-4 h-4 text-pink-400 mx-auto mb-0.5" />
                      <span className="text-[9px] font-bold block">Upload Cam</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoBottomRef}
                        src={urlBottom}
                        playsInline
                        muted={isMuted || audioMode === "top_only" || audioMode === "mute"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 flex items-center gap-1 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            inputBottomRef.current?.click();
                          }}
                          className="p-0.5 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                          title="Change Reaction Video"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileBottom(null);
                            if (urlBottom) URL.revokeObjectURL(urlBottom);
                            setUrlBottom(null);
                          }}
                          className="p-0.5 rounded bg-red-600/80 hover:bg-red-600 text-white cursor-pointer"
                          title="Remove Reaction Video"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Synchronized Playback Controls */}
          {(urlTop || urlBottom) && (
            <div className="w-full max-w-[420px] mt-3 p-2.5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/[0.1] shadow-sm flex items-center gap-2.5">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition-all shrink-0 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max={maxDuration || 10}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-pink-600 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                {Math.floor(currentTime)}s / {Math.floor(maxDuration)}s
              </span>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Audio Mixing & Volume Balance Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-pink-500" />
              Audio Mixing Settings
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "mix", label: "Mix Both Audios" },
              { id: "top_only", label: "Top Video Only" },
              { id: "bottom_only", label: "Reaction Cam Only" },
              { id: "mute", label: "Mute All" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAudioMode(item.id as AudioMode)}
                className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                  audioMode === item.id
                    ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold"
                    : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Volume Sliders when Mix mode is active */}
          {audioMode === "mix" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Top Video Volume</span>
                  <span className="font-bold text-pink-500">{Math.round(volumeTop * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={volumeTop}
                  onChange={(e) => setVolumeTop(parseFloat(e.target.value))}
                  className="w-full accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Reaction Cam Volume</span>
                  <span className="font-bold text-pink-500">{Math.round(volumeBottom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={volumeBottom}
                  onChange={(e) => setVolumeBottom(parseFloat(e.target.value))}
                  className="w-full accent-pink-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleCombineVideos}
          disabled={isProcessing || !fileTop || !fileBottom}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-extrabold text-base shadow-lg shadow-pink-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{processStep || "Combining Videos..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Create Reaction Video</span>
            </>
          )}
        </button>
      </div>

      {/* Export Completed Modal */}
      {showExportModal && exportedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Reaction Video Ready!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Your video has been combined and exported in high definition.
              </p>
            </div>

            {/* Video Player */}
            <div className="bg-black rounded-2xl p-2 flex flex-col items-center">
              <video
                ref={exportedVideoRef}
                src={exportedUrl}
                controls
                autoPlay
                className="max-h-[280px] rounded-xl object-contain"
              />
              <div className="mt-3 flex flex-wrap gap-2.5 justify-center w-full">
                <a
                  href={exportedUrl}
                  download={`reaction_${aspectRatio.replace(":", "_")}.mp4`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Video
                </a>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white font-semibold text-xs sm:text-sm transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Next Steps Suggestions */}
            <div className="border-t border-slate-200 dark:border-white/[0.08] pt-4 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Do you want to do more with this video?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Continue editing with one click (no re-upload needed):
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Subtitles */}
                <button
                  onClick={() => handleNavigateWithMedia("/tools/subtitles")}
                  className="p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:bg-pink-500/10 hover:border-pink-500/40 transition-all text-left flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors shrink-0">
                    <Subtitles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                      Add Subtitles / Captions
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      Auto-generate animated viral captions with AI Whisper.
                    </p>
                  </div>
                </button>

                {/* 2. Audio Enhance */}
                <button
                  onClick={() => handleNavigateWithMedia("/tools/audio-enhance")}
                  className="p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all text-left flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      Increase &amp; Enhance Audio
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      Remove background hiss and boost commentary clarity.
                    </p>
                  </div>
                </button>

                {/* 3. Voice Changer */}
                <button
                  onClick={() => handleNavigateWithMedia("/tools/voice-changer")}
                  className="p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:bg-violet-500/10 hover:border-violet-500/40 transition-all text-left flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-colors shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">
                      AI Voice Changer &amp; Pitch
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      Apply funny voice filters, deep villain, or robot tone.
                    </p>
                  </div>
                </button>

                {/* 4. Video Studio */}
                <button
                  onClick={() => handleNavigateWithMedia("/tools/video-editor")}
                  className="p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:bg-blue-500/10 hover:border-blue-500/40 transition-all text-left flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      Multi-Track Video Studio
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      Add cuts, stickers, transitions, and text overlays.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
