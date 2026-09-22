"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Image as ImageIcon,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sliders,
  FileText,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { useImageDocument } from "@/lib/image/useImageDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

interface Preset {
  label: string;
  value: number;
  description: string;
}

const QUALITY_PRESETS: Preset[] = [
  { label: "Maximum", value: 95, description: "95% - Near-lossless, pristine detail" },
  { label: "High", value: 85, description: "85% - Recommended, optimal size & quality" },
  { label: "Medium", value: 75, description: "75% - Balanced for web publishing" },
  { label: "Low", value: 50, description: "50% - Smallest file size, faster loading" },
];

export default function ImageToWebPClient() {
  // Shared Image & Object URL Hooks
  const {
    file,
    previewUrl: originalUrl,
    dimensions,
    error: docError,
    loadImage,
    reset: resetImage,
  } = useImageDocument();

  const {
    url: resultUrl,
    setBlob,
    reset: resetDownload,
  } = useObjectUrlDownload();

  const [originalFormat, setOriginalFormat] = useState<string>("IMAGE");
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const errorMessage = actionError || docError;

  const convertToWebP = useCallback(
    (sourceUrl: string, qualityVal: number) => {
      setIsProcessing(true);
      setActionError(null);

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Canvas 2D context is not available.");
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setActionError("Unable to generate WebP image from canvas.");
                setIsProcessing(false);
                return;
              }

              // Set blob via shared hook (auto-revokes previous URL)
              setBlob(blob, "image/webp");
              setResultSize(blob.size);
              setIsProcessing(false);
            },
            "image/webp",
            qualityVal / 100
          );
        } catch (err: unknown) {
          console.error("Conversion execution error:", err);
          setActionError(
            err instanceof Error ? err.message : "Failed to process image on canvas."
          );
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setActionError("Failed to load source image for WebP conversion.");
        setIsProcessing(false);
      };

      img.src = sourceUrl;
    },
    [setBlob]
  );

  const handleFileDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const selectedFile = acceptedFiles[0];

      resetDownload();
      setResultSize(null);
      setActionError(null);

      // Detect original format
      let format = "IMAGE";
      if (selectedFile.type) {
        format = selectedFile.type.replace("image/", "").toUpperCase();
      } else {
        const ext = selectedFile.name.split(".").pop();
        if (ext) format = ext.toUpperCase();
      }
      setOriginalFormat(format);

      const dims = await loadImage(selectedFile);
      if (dims) {
        const tempUrl = URL.createObjectURL(selectedFile);
        convertToWebP(tempUrl, quality);
      }
    },
    [loadImage, resetDownload, convertToWebP, quality]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "image/tiff": [".tiff", ".tif"],
      "image/avif": [".avif"],
    },
    maxFiles: 1,
  });

  const handleQualityChange = (newQuality: number) => {
    const clampedQuality = Math.min(100, Math.max(1, newQuality));
    setQuality(clampedQuality);
    if (originalUrl) {
      convertToWebP(originalUrl, clampedQuality);
    }
  };

  const handleStartOver = () => {
    resetImage();
    resetDownload();
    setOriginalFormat("IMAGE");
    setQuality(85);
    setResultSize(null);
    setActionError(null);
    setIsProcessing(false);
  };

  const originalSize = file?.size || 0;
  const spaceSavedBytes = originalSize && resultSize ? originalSize - resultSize : 0;
  const spaceSavedPercent =
    originalSize && resultSize
      ? Math.round(((originalSize - resultSize) / originalSize) * 100)
      : 0;

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file || !originalUrl ? (
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
            <ImageIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop an Image to Convert to WebP
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Supports PNG, JPG, JPEG, GIF, BMP, SVG, TIFF, and AVIF. Converted locally in your browser.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Click or drag image here</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Information, Quality Controls & Preview */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* File Info Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[280px] sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {originalFormat} • {formatBytes(originalSize)}
                    {dimensions && ` • ${dimensions.width} × ${dimensions.height}px`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/[0.1] text-slate-700 dark:text-slate-300">
                  {originalFormat}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  WEBP
                </span>
              </div>
            </div>

            {/* Quality Preset Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                  Quality Presets
                </label>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Current: {quality}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUALITY_PRESETS.map((preset) => {
                  const isActive = quality === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleQualityChange(preset.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                          : "border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="text-xs font-bold">{preset.label}</div>
                      <div className="text-[11px] opacity-75">{preset.value}%</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality Range Slider */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Fine-tune Compression Quality
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-white/[0.1] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1% (Smallest file)</span>
                <span>85% (Recommended)</span>
                <span>100% (Lossless-like)</span>
              </div>
            </div>

            {/* Original Preview Container */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Source Preview
              </span>
              <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-4 flex items-center justify-center min-h-[300px] max-h-[420px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt="Original upload preview"
                  className="max-w-full max-h-[380px] object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleStartOver}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Start Over
              </button>
              <button
                type="button"
                onClick={() => convertToWebP(originalUrl, quality)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                Re-apply Quality
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Right Column: WebP Conversion Output & Download */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> WebP Conversion Output
            </h3>

            {/* Comparison Metrics */}
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Original ({originalFormat})
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatBytes(originalSize)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Output (WebP)
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {isProcessing ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        Calculating...
                      </span>
                    ) : resultSize !== null ? (
                      formatBytes(resultSize)
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </div>

              {/* Space Savings Badge */}
              {!isProcessing && resultSize !== null && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                    spaceSavedPercent > 0
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : spaceSavedPercent < 0
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {spaceSavedPercent > 0
                      ? `${spaceSavedPercent}% smaller (${formatBytes(spaceSavedBytes)} saved)`
                      : spaceSavedPercent < 0
                      ? `${Math.abs(spaceSavedPercent)}% larger (high quality WebP encoding)`
                      : "Same file size"}
                  </span>
                </div>
              )}
            </div>

            {/* Result Preview & Download Button */}
            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-2xl text-slate-400 min-h-[260px]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Converting to WebP...
                </p>
                <p className="text-xs text-slate-400 mt-1">Processing in-browser with HTML5 Canvas</p>
              </div>
            ) : resultUrl ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1">
                <div className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Result Preview
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#09090b] flex items-center justify-center p-4 min-h-[220px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="WebP converted preview"
                    className="max-w-full max-h-[250px] object-contain rounded-lg shadow-sm"
                  />
                </div>
                <a
                  href={resultUrl}
                  download="Botock-Converted.webp"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 mt-auto cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download WebP Image
                </a>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-xl text-slate-400">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Ready to convert.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}