"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import pica from "pica";
import {
  Image as ImageIcon,
  Download,
  Trash2,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Loader2,
  RefreshCcw,
  ArrowRight,
  RotateCcw,
  FileDown,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { useImageDocument } from "@/lib/image/useImageDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

const PERCENTAGE_PRESETS = [25, 50, 75, 100, 150, 200];

export default function ImageResizeClient() {
  // Shared Image & Download Hooks
  const {
    file,
    previewUrl,
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

  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState<number>(0.92);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [resultDimensions, setResultDimensions] = useState<{ width: number; height: number } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const errorMessage = actionError || docError;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const selectedFile = acceptedFiles[0];

      setActionError(null);
      resetDownload();
      setResultSize(null);
      setResultDimensions(null);

      const dims = await loadImage(selectedFile);
      if (dims) {
        setTargetWidth(dims.width);
        setTargetHeight(dims.height);
        setScalePercent(100);
        setLockAspectRatio(true);

        if (selectedFile.type === "image/webp") {
          setOutputFormat("webp");
        } else if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/jpg") {
          setOutputFormat("jpeg");
        } else {
          setOutputFormat("png");
        }
      }
    },
    [loadImage, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/svg+xml": [".svg"],
    },
    maxFiles: 1,
  });

  const handleWidthChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setTargetWidth(0);
      return;
    }
    setTargetWidth(num);

    if (dimensions) {
      if (lockAspectRatio && dimensions.aspectRatio > 0) {
        const newH = Math.max(1, Math.round(num / dimensions.aspectRatio));
        setTargetHeight(newH);
      }
      if (dimensions.width > 0) {
        setScalePercent(Math.round((num / dimensions.width) * 100));
      }
    }
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setTargetHeight(0);
      return;
    }
    setTargetHeight(num);

    if (dimensions) {
      if (lockAspectRatio && dimensions.aspectRatio > 0) {
        const newW = Math.max(1, Math.round(num * dimensions.aspectRatio));
        setTargetWidth(newW);
      }
      if (dimensions.height > 0) {
        setScalePercent(Math.round((num / dimensions.height) * 100));
      }
    }
  };

  const handleScalePercentChange = (pct: number) => {
    setScalePercent(pct);
    if (!dimensions) return;

    const newW = Math.max(1, Math.round(dimensions.width * (pct / 100)));
    const newH = Math.max(1, Math.round(dimensions.height * (pct / 100)));
    setTargetWidth(newW);
    setTargetHeight(newH);
  };

  const resetToOriginal = () => {
    if (!dimensions) return;
    setTargetWidth(dimensions.width);
    setTargetHeight(dimensions.height);
    setScalePercent(100);
    setLockAspectRatio(true);
  };

  const resetAll = () => {
    resetImage();
    resetDownload();
    setTargetWidth(0);
    setTargetHeight(0);
    setScalePercent(100);
    setResultSize(null);
    setResultDimensions(null);
    setActionError(null);
  };

  const handleResize = async () => {
    if (!dimensions || !previewUrl || targetWidth <= 0 || targetHeight <= 0) {
      setActionError("Please specify valid width and height values.");
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    try {
      const srcImg = new Image();
      srcImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        srcImg.onload = () => resolve();
        srcImg.onerror = () => reject(new Error("Failed to render source image for resize."));
        srcImg.src = previewUrl;
      });

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = dimensions.width;
      srcCanvas.height = dimensions.height;
      const srcCtx = srcCanvas.getContext("2d");
      if (!srcCtx) {
        throw new Error("Unable to obtain 2D canvas context.");
      }
      srcCtx.drawImage(srcImg, 0, 0, dimensions.width, dimensions.height);

      const destCanvas = document.createElement("canvas");
      destCanvas.width = targetWidth;
      destCanvas.height = targetHeight;

      let resizeSucceeded = false;
      try {
        const picaRunner = pica({
          features: ["js", "wasm", "ww"],
        });
        await picaRunner.resize(srcCanvas, destCanvas, {
          filter: "lanczos3",
          unsharpAmount: 80,
          unsharpRadius: 0.6,
          unsharpThreshold: 2,
        });
        resizeSucceeded = true;
      } catch (picaErr) {
        console.warn("Pica resize fallback to Canvas API:", picaErr);
      }

      if (!resizeSucceeded) {
        const destCtx = destCanvas.getContext("2d");
        if (!destCtx) {
          throw new Error("Unable to obtain destination 2D canvas context.");
        }
        destCtx.imageSmoothingEnabled = true;
        destCtx.imageSmoothingQuality = "high";
        destCtx.drawImage(srcImg, 0, 0, targetWidth, targetHeight);
      }

      const mimeType =
        outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png";

      const blob = await new Promise<Blob>((resolve, reject) => {
        destCanvas.toBlob(
          (b) => {
            if (b) {
              resolve(b);
            } else {
              reject(new Error("Failed to create image blob from canvas."));
            }
          },
          mimeType,
          outputFormat === "png" ? undefined : quality
        );
      });

      // Update download URL via shared hook (automatically cleans up previous URL)
      setBlob(blob, mimeType);
      setResultSize(blob.size);
      setResultDimensions({ width: targetWidth, height: targetHeight });
    } catch (err: unknown) {
      console.error("Resize failed:", err);
      setActionError(err instanceof Error ? err.message : "An error occurred while resizing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDownloadFilename = () => {
    if (!file) return "Botock-Resized-Image.png";
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "image";
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
    return `Botock-Resized-${baseName}.${ext}`;
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs underline hover:opacity-80 ml-4 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!dimensions || !previewUrl ? (
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
            Drop an Image here to Resize
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, PNG, WEBP, GIF, BMP, SVG. 100% Client-Side.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Information & Dimension Controls */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Dimensions Overview Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Original Dimensions
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {dimensions.width} × {dimensions.height} px
                  {file && (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      ({formatBytes(file.size)})
                    </span>
                  )}
                </span>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Target Dimensions
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {targetWidth || 0} × {targetHeight || 0} px
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {scalePercent}%
                  </span>
                </span>
              </div>
            </div>

            {/* Quick Percentage Presets */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Scale Presets
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PERCENTAGE_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleScalePercentChange(pct)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      scalePercent === pct
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Percentage Range Slider */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>Percentage Scaling</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={scalePercent}
                    onChange={(e) => handleScalePercentChange(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-right text-xs font-bold rounded-lg bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>

              <input
                type="range"
                min={5}
                max={250}
                step={1}
                value={scalePercent}
                onChange={(e) => handleScalePercentChange(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-white/[0.1] rounded-lg cursor-pointer mt-2"
              />
            </div>

            {/* Exact Width & Height Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Target Width (px)</span>
                  <span className="text-[11px] font-normal text-slate-400">Orig: {dimensions.width}px</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20000}
                  value={targetWidth || ""}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Width in pixels"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Target Height (px)</span>
                  <span className="text-[11px] font-normal text-slate-400">Orig: {dimensions.height}px</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20000}
                  value={targetHeight || ""}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Height in pixels"
                />
              </div>
            </div>

            {/* Aspect Ratio Lock Toggle & Format Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  const nextLock = !lockAspectRatio;
                  setLockAspectRatio(nextLock);
                  if (nextLock && dimensions.aspectRatio > 0 && targetWidth > 0) {
                    setTargetHeight(Math.max(1, Math.round(targetWidth / dimensions.aspectRatio)));
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  lockAspectRatio
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.1]"
                }`}
              >
                {lockAspectRatio ? <Lock className="w-4 h-4 text-emerald-500" /> : <Unlock className="w-4 h-4" />}
                {lockAspectRatio ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Format:</span>
                {(["png", "jpeg", "webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      outputFormat === fmt
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for JPEG / WEBP) */}
            {outputFormat !== "png" && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Quality ({Math.round(quality * 100)}%):
                </span>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-white/[0.1] rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Image Preview Box */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-4 flex flex-col items-center justify-center min-h-[260px]">
              <img
                src={previewUrl}
                alt="Source preview"
                className="max-w-full max-h-[340px] object-contain rounded-lg shadow-sm"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                {file?.name} ({dimensions.width} × {dimensions.height} px)
              </div>
            </div>

            {/* Bottom Actions: Reset to 100% and Start Over */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetToOriginal}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Original (100%)
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Start Over
              </button>
            </div>
          </div>

          {/* Right Column: Processing CTA & Result Preview Card */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-emerald-500" /> Process Output
            </h3>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleResize}
              disabled={isProcessing || targetWidth <= 0 || targetHeight <= 0}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md active:scale-95 mb-6 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resizing Image (Lanczos3)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Resize Image Now
                </>
              )}
            </button>

            {/* Result Preview Card */}
            {resultUrl ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Result Preview
                  </span>
                  {resultDimensions && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {resultDimensions.width} × {resultDimensions.height} px
                    </span>
                  )}
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-4">
                  <img
                    src={resultUrl}
                    alt="Resized result preview"
                    className="max-w-full max-h-[250px] object-contain rounded-lg shadow-sm mb-2"
                  />
                  {resultSize !== null && (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Output Size: {formatBytes(resultSize)}
                    </span>
                  )}
                </div>

                {/* Download Button */}
                <a
                  href={resultUrl}
                  download={getDownloadFilename()}
                  className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>

                <div className="text-center">
                  <a
                    href={resultUrl}
                    download="Botock-Resized-Image.png"
                    className="text-[11px] text-slate-500 hover:text-emerald-500 underline transition-colors"
                  >
                    Download as default &ldquo;Botock-Resized-Image.png&rdquo;
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-xl text-slate-400 min-h-[220px]">
                <FileDown className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">Click &ldquo;Resize Image Now&rdquo; to generate your preview and download link.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}