"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes, formatTime } from "@/lib/utils/formatters";
import {
  Film,
  Minimize2,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
  ArrowRight,
  HardDrive,
} from "lucide-react";

type QualityPreset = "light" | "balanced" | "heavy" | "custom";
type ResolutionTarget = "original" | "1080p" | "720p" | "480p";

export default function VideoCompressClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  // Compression Settings
  const [preset, setPreset] = useState<QualityPreset>("balanced");
  const [crf, setCrf] = useState<number>(28);
  const [resolution, setResolution] = useState<ResolutionTarget>("original");

  // Output
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { run, cancel, isProcessing, progress, statusMessage, error } = useFFmpeg();

  // Cleanup object URLs on unmount or file reset
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
      setOrigWidth(0);
      setOrigHeight(0);
      setResultUrl(null);
      setResultSize(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov", ".mkv", ".m4v"],
    },
    maxFiles: 1,
  });

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;

      if (vidDuration && !isNaN(vidDuration) && vidDuration > 0) {
        setDuration(vidDuration);
      }
      if (width && height) {
        setOrigWidth(width);
        setOrigHeight(height);
      }
    }
  };

  const handlePresetSelect = (selectedPreset: QualityPreset) => {
    setPreset(selectedPreset);
    if (selectedPreset === "light") {
      setCrf(24);
    } else if (selectedPreset === "balanced") {
      setCrf(28);
    } else if (selectedPreset === "heavy") {
      setCrf(32);
    }
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setResultSize(null);
    setDuration(0);
    setOrigWidth(0);
    setOrigHeight(0);
    setErrorMsg(null);
  };

  const handleCompress = async () => {
    if (!originalFile) return;
    setErrorMsg(null);

    const clampedCrf = Math.min(51, Math.max(18, Math.round(crf)));

    let scaleFilter: string | null = null;
    if (resolution === "720p" && origHeight > 720) {
      scaleFilter = "scale=-2:720";
    } else if (resolution === "480p" && origHeight > 480) {
      scaleFilter = "scale=-2:480";
    } else if (resolution === "1080p" && origHeight > 1080) {
      scaleFilter = "scale=-2:1080";
    }

    const runFn = run;
    if (!runFn) {
      setErrorMsg("Video compression engine is currently unavailable.");
      return;
    }

    const runFFmpegCommand = async (includeAudio: boolean) => {
      const args = [
        "-i",
        "input.mp4",
        "-c:v",
        "libx264",
        "-crf",
        String(clampedCrf),
        "-preset",
        "ultrafast",
      ];

      if (scaleFilter) {
        args.push("-vf", scaleFilter);
      }

      if (includeAudio) {
        args.push("-c:a", "aac", "-b:a", "128k");
      } else {
        args.push("-an");
      }

      args.push("output.mp4");

      return await runFn({
        inputFile: originalFile,
        inputFileName: "input.mp4",
        outputFileName: "output.mp4",
        outputMimeType: "video/mp4",
        args,
      });
    };

    try {
      let outputBlob: Blob;
      try {
        outputBlob = await runFFmpegCommand(true);
      } catch (audioErr: unknown) {
        // Fallback for silent video
        console.warn("Retrying compression without audio track:", audioErr);
        outputBlob = await runFFmpegCommand(false);
      }

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to compress video.";
      setErrorMsg(msg);
    }
  };

  // Metrics
  const originalBytes = originalFile ? originalFile.size : 0;
  const compressedBytes = resultSize || 0;
  const savedBytes = Math.max(0, originalBytes - compressedBytes);
  const savingsPercent = originalBytes > 0 ? Math.round((savedBytes / originalBytes) * 100) : 0;
  const isLargeFile = originalBytes > 100 * 1024 * 1024;

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!originalFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <Minimize2 className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop a Video here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports MP4, WebM, MOV, MKV. Compress video 100% locally.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info Bar & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {originalFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(originalFile.size)} • Duration: {duration > 0 ? formatTime(duration) : "Loading..."}
                  {origWidth > 0 && ` • ${origWidth}x${origHeight}px`}
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

          {/* Large File Advisory */}
          {isLargeFile && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Large Video Detected ({formatBytes(originalFile.size)}):</span>{" "}
                For videos over 100MB, we strongly recommend downscaling resolution to{" "}
                <span className="font-semibold underline">720p</span> to avoid browser memory exhaustion.
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Video Player Preview */}
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

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <HardDrive className="w-4 h-4 text-emerald-500" /> Original Size: {formatBytes(originalBytes)}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {origWidth > 0 ? `${origWidth}x${origHeight}` : "Resolution: Inspecting..."}
                </span>
              </div>
            </div>

            {/* Right Col: Controls & Action */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Sliders className="w-4 h-4 text-emerald-500" /> Compression Settings
                </h3>

                {/* Quality Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Quality / Compression Level
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "light" as QualityPreset,
                        label: "Light Compression (CRF 24)",
                        desc: "High visual quality, ~20–35% size reduction",
                      },
                      {
                        id: "balanced" as QualityPreset,
                        label: "Balanced Compression (CRF 28)",
                        desc: "Optimal quality & size ratio (Recommended)",
                      },
                      {
                        id: "heavy" as QualityPreset,
                        label: "Heavy Compression (CRF 32)",
                        desc: "Maximum space reduction, ~60–80% smaller",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handlePresetSelect(opt.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          preset === opt.id
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                            : "border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                          <span>{opt.label}</span>
                          {preset === opt.id && <Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CRF Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Custom CRF</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {crf} (Higher = Smaller Size)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={40}
                    step={1}
                    value={crf}
                    onChange={(e) => {
                      setCrf(Number(e.target.value));
                      setPreset("custom");
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>18 (Lossless-like)</span>
                    <span>28 (Balanced)</span>
                    <span>40 (Tiny)</span>
                  </div>
                </div>

                {/* Resolution Downscaling */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Target Resolution Downscaling
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "original" as ResolutionTarget, label: "Original" },
                      { id: "1080p" as ResolutionTarget, label: "1080p (FHD)" },
                      { id: "720p" as ResolutionTarget, label: "720p (HD)" },
                      { id: "480p" as ResolutionTarget, label: "480p (SD)" },
                    ].map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setResolution(res.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          resolution === res.id
                            ? "bg-emerald-600 text-white"
                            : "bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                        }`}
                      >
                        {res.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Compressing Video...
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" /> Compress Video
                    </>
                  )}
                </button>
              </div>

              {/* Progress & Status */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{statusMessage || "Compressing video frames..."}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {progress.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.1] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <button
                    onClick={() => cancel?.()}
                    className="w-full py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel Operation
                  </button>
                </div>
              )}

              {/* Error Message */}
              {(errorMsg || error) && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error:</span> {errorMsg || error}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Card */}
          {resultUrl && (
            <div className="mt-8 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Video Compressed Successfully!
                </div>
                {resultSize && (
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    Saved {formatBytes(savedBytes)} ({savingsPercent}% reduction)
                  </span>
                )}
              </div>

              {/* Comparison Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08]">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Original Size</p>
                  <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                    {formatBytes(originalBytes)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center gap-2">
                  <ArrowRight className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Space Saved</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      -{savingsPercent}%
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08]">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Compressed Size</p>
                  <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                    {formatBytes(compressedBytes)}
                  </p>
                </div>
              </div>

              {/* Compressed Video Player Preview */}
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  src={resultUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={resultUrl}
                  download={`compressed_${originalFile.name}`}
                  className="px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Compressed Video
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
