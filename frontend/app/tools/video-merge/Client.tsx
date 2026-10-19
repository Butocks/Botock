"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Film,
  Music,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Play,
  Pause,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Volume2,
  VolumeX,
  Sliders,
  Maximize2,
  Layers,
  ArrowUpDown,
  Check,
} from "lucide-react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { fetchFile } from "@ffmpeg/util";
import { formatBytes, formatTime } from "@/lib/utils/formatters";

export interface VideoClipItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  duration?: number;
}

export type AspectRatioOption = "original" | "16:9" | "9:16" | "1:1" | "4:5";
export type AudioModeOption = "replace" | "mix" | "keep_original";

export default function VideoMergeClient() {
  // Video Clips State
  const [clips, setClips] = useState<VideoClipItem[]>([]);
  
  // Custom Audio State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState<AudioModeOption>("replace");
  const [audioVolume, setAudioVolume] = useState<number>(1.0);
  const [videoVolume, setVideoVolume] = useState<number>(1.0);

  // Settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("original");

  // Processing & Export State
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedSize, setMergedSize] = useState<number | null>(null);

  // FFmpeg WASM Fallback
  const { load: loadWasmFFmpeg, writeFile, readFile, deleteFile, exec, progress: wasmProgress } = useFFmpeg();

  // Audio Dropzone Ref
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      clips.forEach((c) => URL.revokeObjectURL(c.previewUrl));
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mergedVideoUrl) URL.revokeObjectURL(mergedVideoUrl);
    };
  }, []);

  // Track WASM progress when active
  useEffect(() => {
    if (status === "processing" && wasmProgress && wasmProgress.percent > 0) {
      setProgressPercent((prev) => Math.max(prev, wasmProgress.percent));
    }
  }, [wasmProgress, status]);

  // Video Dropzone
  const onVideoDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const newClips: VideoClipItem[] = acceptedFiles.map((file) => ({
      id: "clip_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setClips((prev) => [...prev, ...newClips]);
    setErrorMessage("");
    setStatus("idle");
  }, []);

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } =
    useDropzone({
      onDrop: onVideoDrop,
      accept: {
        "video/*": [".mp4", ".mov", ".webm", ".mkv", ".avi"],
      },
    });

  // Audio File Selection
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioUrl(url);
      setErrorMessage("");
    }
  };

  const removeAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl(null);
  };

  // Clip Sorting / Reordering
  const moveClipUp = (index: number) => {
    if (index <= 0) return;
    setClips((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const moveClipDown = (index: number) => {
    if (index >= clips.length - 1) return;
    setClips((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const removeClip = (id: string) => {
    setClips((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((c) => c.id !== id);
    });
  };

  const reverseOrder = () => {
    setClips((prev) => [...prev].reverse());
  };

  const clearAllClips = () => {
    clips.forEach((c) => URL.revokeObjectURL(c.previewUrl));
    setClips([]);
    if (mergedVideoUrl) URL.revokeObjectURL(mergedVideoUrl);
    setMergedVideoUrl(null);
    setMergedBlob(null);
    setStatus("idle");
    setErrorMessage("");
  };

  // Video Duration Metadata Capture
  const handleLoadedMetadata = (clipId: string, duration: number) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, duration } : c))
    );
  };

  // Total Estimated Duration
  const totalDuration = clips.reduce((acc, c) => acc + (c.duration || 0), 0);

  // Main Merge Execution (Backend with WASM Fallback)
  const handleMergeVideos = async () => {
    if (clips.length < 2) {
      setErrorMessage("Please add at least 2 videos to merge.");
      return;
    }

    setStatus("processing");
    setProgressPercent(10);
    setStatusMessage("Preparing video files for merging...");
    setErrorMessage("");

    if (mergedVideoUrl) {
      URL.revokeObjectURL(mergedVideoUrl);
      setMergedVideoUrl(null);
      setMergedBlob(null);
    }

    // 1. Try Backend Native FFmpeg (Ultra-Fast)
    try {
      setStatusMessage("Uploading and processing on high-speed engine...");
      setProgressPercent(25);

      const formData = new FormData();
      clips.forEach((clip) => {
        formData.append("videos", clip.file);
      });

      if (audioFile) {
        formData.append("audio", audioFile);
      }

      formData.append("aspect_ratio", aspectRatio);
      formData.append("audio_mode", audioFile ? audioMode : "keep_original");
      formData.append("audio_volume", String(audioVolume));
      formData.append("video_volume", String(videoVolume));

      const res = await fetch("/api/video/video-merge", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setProgressPercent(90);
        setStatusMessage("Downloading finalized merged video...");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setMergedBlob(blob);
        setMergedVideoUrl(url);
        setMergedSize(blob.size);
        setProgressPercent(100);
        setStatus("completed");
        return;
      }

      console.warn("Backend merge failed, falling back to browser WASM FFmpeg:", res.statusText);
    } catch (backendError) {
      console.warn("Backend video merge connection failed, switching to local WASM:", backendError);
    }

    // 2. Client-side In-Browser WASM FFmpeg Fallback
    try {
      setStatusMessage("Loading local in-browser processing engine...");
      setProgressPercent(35);
      await loadWasmFFmpeg();

      setStatusMessage("Writing video files to memory...");
      setProgressPercent(45);

      const wasmFilenames: string[] = [];
      for (let i = 0; i < clips.length; i++) {
        const fname = `in_${i}_${Date.now()}.mp4`;
        const data = await fetchFile(clips[i].file);
        await writeFile(fname, data);
        wasmFilenames.push(fname);
      }

      let wasmAudioName: string | null = null;
      if (audioFile) {
        wasmAudioName = `audio_${Date.now()}.mp3`;
        const aData = await fetchFile(audioFile);
        await writeFile(wasmAudioName, aData);
      }

      const outName = `merged_${Date.now()}.mp4`;

      // Target dimension
      const dimMap: Record<string, [number, number]> = {
        "9:16": [720, 1280],
        "16:9": [1280, 720],
        "1:1": [720, 720],
        "4:5": [720, 900],
      };
      const [w, h] = dimMap[aspectRatio] || [1280, 720];

      setStatusMessage("Concatenating clips and rendering MP4...");
      setProgressPercent(60);

      const N = wasmFilenames.length;
      const ffmpegArgs: string[] = [];

      for (const fn of wasmFilenames) {
        ffmpegArgs.push("-i", fn);
      }

      if (wasmAudioName) {
        ffmpegArgs.push("-stream_loop", "-1", "-i", wasmAudioName);
      }

      const filterParts: string[] = [];
      for (let i = 0; i < N; i++) {
        filterParts.push(
          `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${i}]`
        );
      }

      const outputMaps: string[] = [];
      let isShortest = false;

      if (wasmAudioName && audioMode === "replace") {
        const vInputs = wasmFilenames.map((_, i) => `[v${i}]`).join("");
        filterParts.push(`${vInputs}concat=n=${N}:v=1:a=0[outv]`);
        filterParts.push(
          `[${N}:a]volume=${audioVolume},aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[outa]`
        );
        outputMaps.push("-map", "[outv]", "-map", "[outa]");
        isShortest = true;
      } else {
        // Concat video only if browser fallback
        const vInputs = wasmFilenames.map((_, i) => `[v${i}]`).join("");
        filterParts.push(`${vInputs}concat=n=${N}:v=1:a=0[outv]`);
        outputMaps.push("-map", "[outv]");
      }

      ffmpegArgs.push("-filter_complex", filterParts.join(";"));
      ffmpegArgs.push(...outputMaps);
      ffmpegArgs.push("-c:v", "libx264", "-preset", "ultrafast", "-crf", "26");

      if (outputMaps.includes("[outa]")) {
        ffmpegArgs.push("-c:a", "aac", "-b:a", "128k");
      }

      if (isShortest) {
        ffmpegArgs.push("-shortest");
      }

      ffmpegArgs.push(outName);

      const code = await exec(ffmpegArgs);
      if (code !== 0) {
        throw new Error("Local video merge failed. Please try with MP4 clips.");
      }

      setStatusMessage("Reading completed video from memory...");
      setProgressPercent(95);

      const fileData = await readFile(outName);
      const outputBlob = new Blob([fileData as unknown as BlobPart], { type: "video/mp4" });
      const outUrl = URL.createObjectURL(outputBlob);

      // Cleanup virtual files
      for (const fn of wasmFilenames) {
        try { await deleteFile(fn); } catch {}
      }
      if (wasmAudioName) {
        try { await deleteFile(wasmAudioName); } catch {}
      }
      try { await deleteFile(outName); } catch {}

      setMergedBlob(outputBlob);
      setMergedVideoUrl(outUrl);
      setMergedSize(outputBlob.size);
      setProgressPercent(100);
      setStatus("completed");
    } catch (err: any) {
      console.error("Video merge processing error:", err);
      setStatus("error");
      setErrorMessage(err?.message || "Failed to merge videos. Please check your files and try again.");
    }
  };

  const handleDownload = () => {
    if (!mergedVideoUrl) return;
    const a = document.createElement("a");
    a.href = mergedVideoUrl;
    a.download = `botock-merged-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* COMPLETED SUCCESS BANNER */}
      {status === "completed" && mergedVideoUrl && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Videos Merged Successfully!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {clips.length} clips combined into a single seamless video ({formatBytes(mergedSize || 0)}).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Merged Video
              </button>
              <button
                onClick={() => setStatus("idle")}
                className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer"
              >
                Edit Clips
              </button>
            </div>
          </div>

          {/* Full Result Video Player */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[460px] mx-auto flex items-center justify-center">
            <video
              src={mergedVideoUrl}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
          </div>
        </div>
      )}

      {/* ACTIVE PROCESSING STATE */}
      {status === "processing" && (
        <div className="p-8 rounded-3xl bg-slate-900/5 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-violet-600 dark:text-violet-400 animate-spin" />
            <Film className="w-6 h-6 text-violet-600 dark:text-violet-400 absolute" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Merging Your Videos...
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {statusMessage || "Aligning frame rates, normalizing aspect ratio and combining audio..."}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>{statusMessage}</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN STEP 1: VIDEOS LIST & REORDERING */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold">
                1
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Add & Organize Video Clips
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload the video clips you want to combine. Use the controls to change their sequence.
            </p>
          </div>

          {clips.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reverseOrder}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Reverse
              </button>
              <button
                type="button"
                onClick={clearAllClips}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Video Clips List */}
        {clips.length > 0 ? (
          <div className="space-y-3">
            {clips.map((clip, index) => (
              <div
                key={clip.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-violet-500/40 transition-all"
              >
                {/* Position Index Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-extrabold text-sm shrink-0">
                    #{index + 1}
                  </div>

                  {/* Video Thumbnail & Preview Player */}
                  <div className="relative w-28 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <video
                      src={clip.previewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(e) =>
                        handleLoadedMetadata(clip.id, (e.target as HTMLVideoElement).duration)
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* File Information */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                    {clip.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{formatBytes(clip.size)}</span>
                    {clip.duration ? (
                      <>
                        <span>•</span>
                        <span>{formatTime(clip.duration)}</span>
                      </>
                    ) : null}
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
                  </div>
                </div>

                {/* Sorting & Action Controls */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => moveClipUp(index)}
                    disabled={index === 0}
                    title="Move Clip Earlier"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveClipDown(index)}
                    disabled={index === clips.length - 1}
                    title="Move Clip Later"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeClip(clip.id)}
                    title="Remove Clip"
                    className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-all cursor-pointer ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Add More Clips Area */}
            <div
              {...getVideoRootProps()}
              className="mt-3 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 bg-slate-50/50 dark:bg-slate-900/20 text-center cursor-pointer transition-all flex items-center justify-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400"
            >
              <input {...getVideoInputProps()} />
              <Plus className="w-4 h-4" />
              <span>Add More Video Clips</span>
            </div>
          </div>
        ) : (
          /* Empty Dropzone */
          <div
            {...getVideoRootProps()}
            className={`p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
              isVideoDragActive
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-300 dark:border-slate-700 hover:border-violet-500 bg-slate-50/50 dark:bg-slate-800/20"
            }`}
          >
            <input {...getVideoInputProps()} />
            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-base text-slate-800 dark:text-slate-200">
                Drag & drop multiple videos here, or click to browse
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports MP4, MOV, WebM, MKV, AVI. You can rearrange them anytime.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MAIN STEP 2: AUDIO TRACK INJECTION (OPTIONAL) */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold">
            2
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Add Background Audio / Music (Optional)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Inject a song, soundtrack, or voiceover over your merged video.
            </p>
          </div>
        </div>

        {audioFile && audioUrl ? (
          <div className="p-5 rounded-2xl border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-sm">
                    {audioFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(audioFile.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={removeAudio}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Audio
                </button>
              </div>
            </div>

            {/* Audio Preview Player */}
            <div className="w-full">
              <audio src={audioUrl} controls className="w-full h-10 rounded-lg" />
            </div>

            {/* Audio Mixing Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAudioMode("replace")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  audioMode === "replace"
                    ? "border-violet-600 bg-violet-600/10 text-violet-700 dark:text-violet-300 font-semibold"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Replace Video Audio</span>
                  {audioMode === "replace" && <Check className="w-4 h-4 text-violet-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mutes original video camera sounds and plays only this audio track.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAudioMode("mix")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  audioMode === "mix"
                    ? "border-violet-600 bg-violet-600/10 text-violet-700 dark:text-violet-300 font-semibold"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Mix with Video Audio</span>
                  {audioMode === "mix" && <Check className="w-4 h-4 text-violet-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Blends your background music together with the original video audio.
                </p>
              </button>
            </div>

            {/* Volume Sliders */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Music Volume</span>
                  <span>{Math.round(audioVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              {audioMode === "mix" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Original Video Audio Volume</span>
                    <span>{Math.round(videoVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={videoVolume}
                    onChange={(e) => setVideoVolume(parseFloat(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => audioInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 bg-slate-50/50 dark:bg-slate-800/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2"
          >
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioChange}
              accept="audio/*,.mp3,.wav,.aac,.m4a,.ogg"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Music className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              Click to upload MP3, WAV, AAC, or M4A music track
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Leave empty to keep all original sounds from each video clip.
            </p>
          </div>
        )}
      </div>

      {/* MAIN STEP 3: OUTPUT SETTINGS & MERGE BUTTON */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold">
            3
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Aspect Ratio & Merge
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Choose your target format and generate the merged video.
            </p>
          </div>
        </div>

        {/* Aspect Ratio Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "original", label: "Match First Video", sub: "Auto-detected" },
            { id: "16:9", label: "16:9 Landscape", sub: "YouTube / TV" },
            { id: "9:16", label: "9:16 Vertical", sub: "Shorts / TikTok" },
            { id: "1:1", label: "1:1 Square", sub: "Instagram Feed" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAspectRatio(opt.id as AspectRatioOption)}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                aspectRatio === opt.id
                  ? "border-violet-600 bg-violet-600/10 text-violet-700 dark:text-violet-300 font-bold"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="text-sm font-bold">{opt.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.sub}</div>
            </button>
          ))}
        </div>

        {/* Summary Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Total Clips: <span className="font-bold text-slate-900 dark:text-white">{clips.length}</span>
            {totalDuration > 0 && (
              <>
                {" "}• Combined Length:{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatTime(totalDuration)}
                </span>
              </>
            )}
            {audioFile && (
              <>
                {" "}• Custom Soundtrack:{" "}
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {audioFile.name} ({audioMode})
                </span>
              </>
            )}
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Lossless MP4 Stream Pipeline
          </span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleMergeVideos}
          disabled={clips.length < 2 || status === "processing"}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-extrabold text-base transition-all shadow-lg shadow-violet-600/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {status === "processing" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Merging Videos ({progressPercent}%)...</span>
            </>
          ) : (
            <>
              <Film className="w-5 h-5" />
              <span>
                {clips.length < 2
                  ? "Upload At Least 2 Videos to Merge"
                  : `Merge ${clips.length} Videos into One`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
