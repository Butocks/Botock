"use client";

import { useState, useCallback, useId } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import {
  Download,
  Trash2,
  Sliders,
  Sparkles,
  Loader2,
  AlertCircle,
  Maximize2,
  HardDrive,
  FileCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { useImageDocument } from "@/lib/image/useImageDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

// ─── Size target presets ──────────────────────────────────────────────────────
const SIZE_PRESETS = [
  { label: "250 KB", unit: "KB" as const, val: "250" },
  { label: "500 KB", unit: "KB" as const, val: "500" },
  { label: "1 MB", unit: "MB" as const, val: "1.0" },
  { label: "2 MB", unit: "MB" as const, val: "2.0" },
];

const DIM_PRESETS = [
  { label: "Full HD (1920px)", val: "1920" },
  { label: "HD (1280px)", val: "1280" },
  { label: "Web (800px)", val: "800" },
];

// ─── Derive file extension from MIME type ─────────────────────────────────────
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

function getDownloadFilename(
  compressedFile: File | null,
  originalFile: File | null
): string {
  if (!compressedFile) return "Botock-Compressed-Image.jpg";
  const ext =
    MIME_TO_EXT[compressedFile.type] ||
    (originalFile ? `.${originalFile.name.split(".").pop()}` : ".jpg");
  const baseName = originalFile
    ? originalFile.name.replace(/\.[^/.]+$/, "")
    : "Image";
  return `Botock-Compressed-${baseName}${ext}`;
}

export default function ImageCompressClient() {
  // ─── Shared Image hook (file metadata + preview URL) ─────────────────────────
  const {
    file: originalFile,
    previewUrl: originalUrl,
    dimensions: originalDimensions,
    error: docError,
    loadImage,
    reset: resetImage,
  } = useImageDocument();

  // ─── Shared download URL hook (auto-revokes on replace/unmount) ──────────────
  const {
    url: compressedUrl,
    setBlob: setCompressedBlob,
    reset: resetDownload,
  } = useObjectUrlDownload();

  // ─── Settings state ──────────────────────────────────────────────────────────
  const [sizeUnit, setSizeUnit] = useState<"MB" | "KB">("MB");
  const [maxSizeInput, setMaxSizeInput] = useState<string>("1.0");
  const [quality, setQuality] = useState<number>(80);
  const [enableDimensionConstraint, setEnableDimensionConstraint] = useState<boolean>(false);
  const [maxDimensionInput, setMaxDimensionInput] = useState<string>("1920");

  // ─── Output state ────────────────────────────────────────────────────────────
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedDimensions, setCompressedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const errorMessage = errorMsg || docError;

  const qualityInputId = useId();
  const targetSizeInputId = useId();
  const maxDimInputId = useId();

  // ─── Drop handler ────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      setErrorMsg(null);
      resetDownload();
      setCompressedFile(null);
      setCompressedDimensions(null);
      setProgress(0);

      // Auto-suggest reasonable target size
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb >= 1) {
        setSizeUnit("MB");
        setMaxSizeInput((Math.max(0.2, Math.round(sizeMb * 0.5 * 10) / 10)).toFixed(1));
      } else {
        setSizeUnit("KB");
        setMaxSizeInput(Math.max(50, Math.round((file.size / 1024) * 0.5)).toString());
      }

      await loadImage(file);
    },
    [loadImage, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
    },
    maxFiles: 1,
  });

  // ─── Compress ────────────────────────────────────────────────────────────────
  const handleCompress = async () => {
    if (!originalFile) return;

    setIsCompressing(true);
    setProgress(0);
    setErrorMsg(null);

    try {
      const parsedSize = parseFloat(maxSizeInput);
      const targetSizeMB =
        isNaN(parsedSize) || parsedSize <= 0
          ? 1
          : sizeUnit === "MB"
          ? parsedSize
          : parsedSize / 1024;

      const parsedDim =
        enableDimensionConstraint && maxDimensionInput
          ? parseInt(maxDimensionInput, 10)
          : undefined;

      const qualityRatio = Math.max(0.01, Math.min(1, quality / 100));

      const options = {
        maxSizeMB: targetSizeMB,
        maxWidthOrHeight: parsedDim && parsedDim > 0 ? parsedDim : undefined,
        useWebWorker: true,
        initialQuality: qualityRatio,
        onProgress: (p: number) => {
          setProgress(Math.round(p));
        },
      };

      let result: File;
      try {
        result = await imageCompression(originalFile, options);
      } catch (workerErr) {
        console.warn("Web worker compression fallback to main thread:", workerErr);
        result = await imageCompression(originalFile, { ...options, useWebWorker: false });
      }

      // Get compressed image dimensions
      const compressedObjectUrl = URL.createObjectURL(result);
      const dims = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = compressedObjectUrl;
      });
      URL.revokeObjectURL(compressedObjectUrl);

      // Set via shared hook — auto-revokes old URL, tracks lifecycle
      setCompressedBlob(result, result.type || "image/jpeg");
      setCompressedFile(result);
      setCompressedDimensions(dims);
      setProgress(100);
    } catch (err: unknown) {
      console.error("Compression failed:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to compress image. Try adjusting parameters."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  // ─── Reset ───────────────────────────────────────────────────────────────────
  const resetAll = () => {
    resetImage();
    resetDownload();
    setCompressedFile(null);
    setCompressedDimensions(null);
    setErrorMsg(null);
    setProgress(0);
  };

  const reductionPercentage =
    originalFile && compressedFile
      ? Math.round(((originalFile.size - compressedFile.size) / originalFile.size) * 100)
      : 0;

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!originalFile ? (
        /* ─── Drop Zone ────────────────────────────────────────────────── */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop an Image here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, PNG, WEBP, and AVIF. Multi-threaded in-browser compression.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Controls ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <HardDrive className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                    {originalFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Original: {formatBytes(originalFile.size)}
                    {originalDimensions &&
                      ` • ${originalDimensions.width}×${originalDimensions.height}px`}
                  </p>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Start Over
              </button>
            </div>

            {/* Original Preview Thumbnail */}
            {originalUrl && (
              <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
                  <span>Source Image</span>
                  <span>{formatBytes(originalFile.size)}</span>
                </div>
                <div className="relative max-h-[260px] flex items-center justify-center overflow-hidden rounded-xl bg-black/5 dark:bg-white/[0.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original source preview"
                    className="max-h-[240px] max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Controls Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Compression Settings
                </h2>
              </div>

              {/* Target Max Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor={targetSizeInputId}
                    className="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Target Max Size
                  </label>
                  <div className="flex rounded-lg bg-slate-200 dark:bg-white/[0.1] p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSizeUnit("MB")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        sizeUnit === "MB"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      MB
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeUnit("KB")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        sizeUnit === "KB"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      KB
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id={targetSizeInputId}
                    type="number"
                    min={sizeUnit === "MB" ? "0.05" : "50"}
                    max={sizeUnit === "MB" ? "50" : "50000"}
                    step={sizeUnit === "MB" ? "0.1" : "50"}
                    value={maxSizeInput}
                    onChange={(e) => setMaxSizeInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={sizeUnit === "MB" ? "e.g. 1.0" : "e.g. 500"}
                  />
                  <span className="text-xs font-bold text-slate-500 w-8">{sizeUnit}</span>
                </div>

                {/* Preset buttons */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 self-center mr-1">
                    Presets:
                  </span>
                  {SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSizeUnit(preset.unit);
                        setMaxSizeInput(preset.val);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor={qualityInputId}
                    className="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Quality Compression Level
                  </label>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {quality}%
                  </span>
                </div>
                <input
                  id={qualityInputId}
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-white/[0.1] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Smallest Size (1%)</span>
                  <span>Balanced (80%)</span>
                  <span>Max Quality (100%)</span>
                </div>
              </div>

              {/* Dimension Constraint (Optional) */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={enableDimensionConstraint}
                      onChange={(e) => setEnableDimensionConstraint(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                    />
                    <span>Max Dimension Constraint (Optional)</span>
                  </label>
                  {enableDimensionConstraint && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Enabled
                    </span>
                  )}
                </div>

                {enableDimensionConstraint && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          id={maxDimInputId}
                          type="number"
                          min="100"
                          max="8000"
                          step="50"
                          value={maxDimensionInput}
                          onChange={(e) => setMaxDimensionInput(e.target.value)}
                          placeholder="e.g. 1920"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                          px
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DIM_PRESETS.map((dim) => (
                        <button
                          key={dim.label}
                          type="button"
                          onClick={() => setMaxDimensionInput(dim.val)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          {dim.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* ── Right: Output Column ────────────────────────────────────── */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Compress &amp; Output
            </h2>

            {/* CTA Button */}
            <button
              onClick={handleCompress}
              disabled={isCompressing}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mb-6 cursor-pointer ${
                isCompressing
                  ? "bg-emerald-700 opacity-80 cursor-wait"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-95"
              }`}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compressing ({progress}%)...
                </>
              ) : compressedUrl ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Re-compress
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Compress Image Now
                </>
              )}
            </button>

            {/* Live Progress Bar during compression */}
            {isCompressing && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Web Worker Processing</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150 rounded-full"
                    style={{ width: `${Math.max(5, progress)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results Section */}
            {compressedFile && compressedUrl ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Stats Summary Card */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Reduction
                    </span>
                    <span
                      className={`text-sm font-black px-2.5 py-0.5 rounded-full ${
                        reductionPercentage > 0
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 dark:bg-white/[0.1] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {reductionPercentage > 0 ? `-${reductionPercentage}%` : `${reductionPercentage}%`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-500/10">
                    <div>
                      <p className="text-slate-400 font-medium">Before</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatBytes(originalFile.size)}
                      </p>
                      {originalDimensions && (
                        <p className="text-[11px] text-slate-400">
                          {originalDimensions.width}×{originalDimensions.height}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">After</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatBytes(compressedFile.size)}
                      </p>
                      {compressedDimensions && (
                        <p className="text-[11px] text-slate-400">
                          {compressedDimensions.width}×{compressedDimensions.height}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Result Preview */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Result Preview</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Compressed
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#09090b] flex items-center justify-center p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={compressedUrl}
                      alt="Compressed preview"
                      className="max-w-full max-h-[220px] object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>

                {/* Download Button — BOTOCK-101: Dynamic extension matching MIME type */}
                <a
                  href={compressedUrl}
                  download={getDownloadFilename(compressedFile, originalFile)}
                  className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-2xl text-slate-400 min-h-[220px]">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mb-3">
                  <Maximize2 className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Ready to Compress
                </p>
                <p className="text-xs max-w-[200px] leading-relaxed">
                  Adjust target size or quality settings, then click &ldquo;Compress Image Now&rdquo;.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
