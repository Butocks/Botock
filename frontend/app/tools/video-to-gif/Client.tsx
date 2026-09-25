"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes, formatTime } from "@/lib/utils/formatters";
import {
  Film,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
  Eye,
} from "lucide-react";

type GifFps = "10" | "15" | "20" | "24";
type GifWidth = "320" | "480" | "640" | "-1";

export default function VideoToGifClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Settings
  const [fps, setFps] = useState<GifFps>("15");
  const [width, setWidth] = useState<GifWidth>("480");
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);

  // Output
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { run, isProcessing, progress } = useFFmpeg();

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [videoUrl, resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setOriginalFile(file);
      setVideoUrl(url);
      setDuration(0);
      setResultUrl(null);
      setResultSize(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov", ".mkv", ".avi"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(d);
      setStartTime(0);
      setEndTime(Math.min(d, 10)); // Default max 10s for snappy gif
    }
  };

  const resetAll = () => {
    setOriginalFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setVideoUrl(null);
    setResultUrl(null);
    setResultSize(null);
    setErrorMsg(null);
  };

  const handleConvert = async () => {
    if (!originalFile) return;

    setErrorMsg(null);
    setResultUrl(null);

    const scaleFilter = width === "-1" ? "" : `scale=${width}:-1:flags=lanczos,`;
    const filter = `fps=${fps},${scaleFilter}split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer`;

    const clipDuration = Math.max(0.5, endTime - startTime);

    const args = [
      "-ss",
      String(startTime),
      "-t",
      String(clipDuration),
      "-i",
      "input_video.mp4",
      "-vf",
      filter,
      "-loop",
      "0",
      "output.gif",
    ];

    if (!run) {
      setErrorMsg("FFmpeg engine is initializing. Please try again.");
      return;
    }

    try {
      const blob = await run({
        inputFile: originalFile,
        inputFileName: "input_video.mp4",
        outputFileName: "output.gif",
        outputMimeType: "image/gif",
        args,
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to convert video to GIF.");
    }
  };

  const baseName = originalFile
    ? originalFile.name.replace(/\.[^/.]+$/, "")
    : "animation";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!originalFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-purple-500 bg-purple-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop Video here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Supports MP4, WebM, MOV. Convert to high-framerate animated GIF with zero server uploads.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {originalFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(originalFile.size)} • Duration: {duration > 0 ? formatTime(duration) : "Loading..."}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player & Output Display */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  ref={videoRef}
                  src={videoUrl || undefined}
                  controls
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                />
              </div>

              {resultUrl && (
                <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>GIF Created Successfully!</span>
                    </div>
                    {resultSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatBytes(resultSize)}
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl overflow-hidden bg-black/40 p-2 flex items-center justify-center max-h-[360px]">
                    <img
                      src={resultUrl}
                      alt="Generated GIF"
                      className="max-h-[340px] max-w-full object-contain rounded-lg shadow-md"
                    />
                  </div>

                  <a
                    href={resultUrl}
                    download={`${baseName}.gif`}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Animated GIF
                  </a>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right Settings */}
            <div className="space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-purple-500" />
                <span>GIF Settings</span>
              </div>

              {/* Clip range */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Clip Segment (Seconds)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Start (s)</span>
                    <input
                      type="number"
                      min={0}
                      max={duration}
                      step={0.5}
                      value={startTime}
                      onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">End (s)</span>
                    <input
                      type="number"
                      min={startTime + 0.5}
                      max={duration || 60}
                      step={0.5}
                      value={endTime}
                      onChange={(e) => setEndTime(Math.max(startTime + 0.5, Number(e.target.value)))}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Framerate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Frame Rate (FPS)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["10", "15", "20", "24"] as GifFps[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFps(f)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        fps === f
                          ? "border-purple-500 bg-purple-600/10 text-purple-600 dark:text-purple-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {f} fps
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Width */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  GIF Width
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Small (320px)", val: "320" },
                    { label: "Medium (480px)", val: "480" },
                    { label: "Large (640px)", val: "640" },
                    { label: "Original", val: "-1" },
                  ].map((w) => (
                    <button
                      key={w.val}
                      type="button"
                      onClick={() => setWidth(w.val as GifWidth)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        width === w.val
                          ? "border-purple-500 bg-purple-600/10 text-purple-600 dark:text-purple-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Convert Button */}
              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering GIF... {progress.percent ? `${Math.round(progress.percent)}%` : ""}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Animated GIF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
