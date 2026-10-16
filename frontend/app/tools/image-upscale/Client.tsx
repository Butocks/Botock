"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import {
  Sparkles,
  Maximize2,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  ArrowRight,
  ImageIcon,
  Video,
  Film,
  Wand2,
  Scissors,
  Crop,
  Minimize2 as MinimizeIcon,
  RotateCw,
  Eye,
  Info,
  SplitSquareVertical,
  Zap,
  ZoomIn,
} from "lucide-react";
import {
  upscaleImage,
  extractVideoFrame,
  UpscaleResult,
} from "./upscaler";
import { processImageTool } from "@/app/tools/ToolEngine";


function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function Client() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);

  // Video frame extraction state
  const [videoTimestamp, setVideoTimestamp] = useState<number>(0.5);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isExtractingFrame, setIsExtractingFrame] = useState(false);

  // Settings
  const [scaleFactor, setScaleFactor] = useState<2 | 4 | 8>(4);
  const [sharpnessEnabled, setSharpnessEnabled] = useState(true);
  const [sharpnessAmount, setSharpnessAmount] = useState(0.65);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/webp" | "image/jpeg">("image/png");

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interactive Comparison & UI
  const [activePreviewTab, setActivePreviewTab] = useState<"compare" | "upscaled" | "original" | "zoom">("compare");
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  const resetAll = useCallback(() => {
    if (result?.objectUrl) {
      URL.revokeObjectURL(result.objectUrl);
    }
    setFile(null);
    setImageSrc(null);
    setResult(null);
    setResultUrl(null);
    setOriginalDimensions(null);
    setErrorMessage(null);
    setFileType("image");
    setVideoDuration(0);
  }, [result]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const uploadedFile = acceptedFiles[0];
      setErrorMessage(null);
      setResult(null);
      setResultUrl(null);
      setFile(uploadedFile);

      if (uploadedFile.type.startsWith("video/")) {
        setFileType("video");
        setIsExtractingFrame(true);
        setProcessStatus("Extracting video frame...");
        try {
          const frame = await extractVideoFrame(uploadedFile, 0.5);
          setImageSrc(frame.objectUrl);
          setVideoDuration(frame.duration);
          setOriginalDimensions({
            width: frame.width,
            height: frame.height,
            size: uploadedFile.size,
          });
        } catch (err: any) {
          setErrorMessage(err?.message || "Failed to extract frame from video.");
        } finally {
          setIsExtractingFrame(false);
          setProcessStatus("");
        }
      } else {
        setFileType("image");
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const img = new Image();
          img.onload = () => {
            setImageSrc(dataUrl);
            setOriginalDimensions({
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
              size: uploadedFile.size,
            });
          };
          img.onerror = () => {
            setErrorMessage("Failed to read image data.");
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(uploadedFile);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/quicktime": [".mov"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleVideoScrub = async (newTime: number) => {
    if (!file || fileType !== "video") return;
    setVideoTimestamp(newTime);
    setIsExtractingFrame(true);
    try {
      const frame = await extractVideoFrame(file, newTime);
      setImageSrc(frame.objectUrl);
      setOriginalDimensions({
        width: frame.width,
        height: frame.height,
        size: file.size,
      });
      setResult(null);
      setResultUrl(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to extract frame at this position.");
    } finally {
      setIsExtractingFrame(false);
    }
  };

  const handleUpscale = async (overrideFormat?: "image/png" | "image/webp" | "image/jpeg") => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessStatus("Initializing AI upscaling pipeline...");

    try {
      const targetFmt = overrideFormat || exportFormat;
      const fmtShort = targetFmt.replace("image/", "");

      // ─── Fast Hybrid Path (Instant C-compiled Server Scaling) ───────────
      if (file && fileType === "image") {
        setProcessStatus("Connecting to high-speed upscaling engine...");
        try {
          const { result: outBlob, executedOn } = await processImageTool(
            "image-upscale",
            file,
            { scale: scaleFactor, format: fmtShort },
            (p, mode) => {
              setProcessStatus(
                mode === "backend"
                  ? `Upscaling on Fast Server (${p}%)...`
                  : `Processing via browser engine (${p}%)...`
              );
            }
          );

          const outUrl = URL.createObjectURL(outBlob);
          const outImg = new Image();
          outImg.src = outUrl;
          await new Promise<void>((res) => {
            outImg.onload = () => res();
            outImg.onerror = () => res();
          });

          const upscaleRes: UpscaleResult = {
            blob: outBlob,
            objectUrl: outUrl,
            width:
              outImg.naturalWidth ||
              (originalDimensions?.width ? originalDimensions.width * scaleFactor : 1920),
            height:
              outImg.naturalHeight ||
              (originalDimensions?.height ? originalDimensions.height * scaleFactor : 1080),
            size: outBlob.size,
            mimeType: targetFmt,
          };

          setResult(upscaleRes);
          setResultUrl(outUrl);
          setActivePreviewTab("compare");
          setProcessStatus(
            executedOn === "backend"
              ? "Upscaled via Fast Server Engine!"
              : "Upscaled via Browser Engine!"
          );
          return;
        } catch (serverErr) {
          console.warn("Server upscaling failed, falling back to local canvas:", serverErr);
        }
      }

      // ─── Browser Fallback (Canvas / Video-frame upscale) ──────────────────
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      await new Promise<void>((resolve, reject) => {
        if (img.complete) resolve();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load source image into buffer."));
      });

      setProcessStatus(`Executing ${scaleFactor}x multi-pass step scaling...`);
      await new Promise((r) => setTimeout(r, 60));

      const upscaled = await upscaleImage(img, {
        scale: scaleFactor,
        sharpness: sharpnessEnabled,
        sharpnessAmount: sharpnessAmount,
        noiseReduction: noiseReduction,
        format: targetFmt,
      });

      setResult(upscaled);
      setResultUrl(upscaled.objectUrl);
      setActivePreviewTab("compare");
      setProcessStatus("Enhancement completed successfully!");
    } catch (err: any) {
      console.error("Upscale failed:", err);
      setErrorMessage(err?.message || "An error occurred during image upscaling.");
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
  };


  // Drag comparison slider handler
  const handleSliderMove = useCallback((clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(clampedPercent);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const handleMouseUp = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Target preview calculations
  const targetWidth = originalDimensions ? originalDimensions.width * scaleFactor : 0;
  const targetHeight = originalDimensions ? originalDimensions.height * scaleFactor : 0;

  // Transfer image to AI Image Generator for prompt-based editing
  const handleSendToImageGenerator = () => {
    const activeImage = resultUrl || imageSrc;
    if (activeImage && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("botock_edit_image_ref", activeImage);
      } catch (e) {
        // Ignore storage quota errors
      }
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Video & AI Studio Quick Tip Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-emerald-600/10 to-transparent border border-violet-500/20 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-500 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Enhance Media & AI Video Generation</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-violet-500 text-white">Pro Tip</span>
            </p>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
              Upscale photos, extract 4K video frames, or generate cinematic 1080p AI videos in Botock Video Studio.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/tools/video-generator"
            className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-xs"
          >
            AI Video Studio →
          </Link>
          <Link
            href="/tools/video-auto-reframe"
            className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200 dark:border-white/[0.06]"
          >
            Auto-Reframe
          </Link>
        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
        {!imageSrc ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-12 sm:p-20 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]"
                : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
              Drop Your Image or Video File Here
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-5">
              Upscale photos up to 8K resolution or extract and enhance high-definition frames from video clips.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06]">
                JPG / JPEG
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06]">
                PNG (Lossless)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06]">
                WebP
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06]">
                MP4 / WebM Video
              </span>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Select File to Upscale</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Visual Preview & Comparison Area */}
            <div className="lg:col-span-7 space-y-4">
              {/* Media Status Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {fileType === "video" ? (
                    <Video className="w-4 h-4 text-violet-500" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="truncate max-w-[200px] sm:max-w-xs">{file?.name || "Uploaded Media"}</span>
                  {originalDimensions && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-500">
                      {originalDimensions.width} × {originalDimensions.height} px
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 transition-colors font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Start Over
                </button>
              </div>

              {/* Video Frame Scrubber (shown when video is uploaded) */}
              {fileType === "video" && videoDuration > 0 && (
                <div className="p-3.5 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Video Frame Seeker
                    </span>
                    <span className="text-slate-500">
                      {videoTimestamp.toFixed(2)}s / {videoDuration.toFixed(2)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={videoTimestamp}
                    onChange={(e) => handleVideoScrub(parseFloat(e.target.value))}
                    disabled={isExtractingFrame || isProcessing}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Drag the slider to capture and upscale any moment from your video into high definition.
                  </p>
                </div>
              )}

              {/* View Switcher Tabs (when result is available) */}
              {result && (
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.05] rounded-xl border border-slate-200 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("compare")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activePreviewTab === "compare"
                        ? "bg-white dark:bg-[#121215] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <SplitSquareVertical className="w-3.5 h-3.5" /> Split Compare
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("upscaled")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activePreviewTab === "upscaled"
                        ? "bg-white dark:bg-[#121215] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Upscaled ({result.width}×{result.height})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("original")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activePreviewTab === "original"
                        ? "bg-white dark:bg-[#121215] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("zoom")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activePreviewTab === "zoom"
                        ? "bg-white dark:bg-[#121215] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <ZoomIn className="w-3.5 h-3.5" /> 200% Pixel Inspect
                  </button>
                </div>
              )}

              {/* Main Preview Container */}
              <div
                ref={compareContainerRef}
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] bg-slate-950 flex items-center justify-center min-h-[380px] sm:min-h-[460px] select-none"
              >
                {/* 1. Comparison Mode */}
                {result && activePreviewTab === "compare" && (
                  <div
                    className="relative w-full h-[460px] overflow-hidden cursor-ew-resize"
                    onMouseDown={() => setIsDraggingSlider(true)}
                    onTouchStart={() => setIsDraggingSlider(true)}
                  >
                    {/* Background: Upscaled Image */}
                    <img
                      src={resultUrl || result.objectUrl}
                      alt="Upscaled resolution"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {/* Foreground: Original Image (Clipped) */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                    >
                      <img
                        src={imageSrc}
                        alt="Original resolution"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Divider Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-xl flex items-center justify-center text-emerald-500">
                        <SplitSquareVertical className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/10 pointer-events-none">
                      Original ({originalDimensions?.width}×{originalDimensions?.height})
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/10 pointer-events-none">
                      Upscaled ({result.width}×{result.height})
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium pointer-events-none">
                      Drag divider to compare clarity
                    </div>
                  </div>
                )}

                {/* 2. Upscaled Single View */}
                {result && activePreviewTab === "upscaled" && (
                  <div className="relative w-full h-[460px] flex items-center justify-center p-3">
                    <img
                      src={resultUrl || result.objectUrl}
                      alt="Upscaled result"
                      className="max-w-full max-h-[440px] object-contain rounded-lg shadow-md"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                      {result.width} × {result.height} px
                    </div>
                  </div>
                )}

                {/* 3. Original Single View */}
                {(!result || activePreviewTab === "original") && (
                  <div className="relative w-full h-[460px] flex items-center justify-center p-3">
                    <img
                      src={imageSrc}
                      alt="Source preview"
                      className="max-w-full max-h-[440px] object-contain rounded-lg"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider">
                      Original: {originalDimensions?.width} × {originalDimensions?.height} px
                    </div>
                  </div>
                )}

                {/* 4. 200% Pixel Zoom View */}
                {result && activePreviewTab === "zoom" && (
                  <div className="relative w-full h-[460px] p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950">
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
                      <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        Original (Zoomed 2.5x)
                      </div>
                      <img
                        src={imageSrc}
                        alt="Original zoomed"
                        className="max-w-none transform scale-[2.5] origin-center object-none filter contrast-105"
                      />
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-black flex items-center justify-center">
                      <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        Upscaled (Super-Resolution Crisp)
                      </div>
                      <img
                        src={resultUrl || result.objectUrl}
                        alt="Upscaled zoomed"
                        className="max-w-none transform scale-[2.5] origin-center object-none"
                      />
                    </div>
                    <div className="sm:col-span-2 text-center text-[11px] text-slate-400 -mt-1">
                      Side-by-side 2.5x pixel zoom reveals raw source pixelation vs reconstructed high-definition clarity.
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold text-white mb-1">
                      {processStatus || "Upscaling in progress..."}
                    </p>
                    <p className="text-xs text-slate-400">
                      Processing 100% locally on your browser memory
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Controls, Parameters & Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Sliders className="w-4 h-4 text-emerald-500" /> Resolution & Enhancement
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure scale multiplier and edge sharpening algorithms.
                </p>
              </div>

              {/* Scale Multiplier Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Scale Multiplier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScaleFactor(2)}
                    className={`py-3 px-2 rounded-xl text-center border font-bold text-xs transition-all ${
                      scaleFactor === 2
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-sm font-black">2x</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">Double HD</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScaleFactor(4)}
                    className={`py-3 px-2 rounded-xl text-center border font-bold text-xs transition-all relative ${
                      scaleFactor === 4
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-600 text-white">
                      Best
                    </span>
                    <div className="text-sm font-black">4x</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">Ultra 4K</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScaleFactor(8)}
                    className={`py-3 px-2 rounded-xl text-center border font-bold text-xs transition-all ${
                      scaleFactor === 8
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-sm font-black">8x</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">Super 8K</div>
                  </button>
                </div>
              </div>

              {/* Edge Sharpness Toggle & Slider */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      AI Sharpness Recovery
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Unsharp mask convolution restoring high-frequency textures
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSharpnessEnabled(!sharpnessEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                      sharpnessEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sharpnessEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {sharpnessEnabled && (
                  <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Sharpening Amount:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {sharpnessAmount <= 0.4
                          ? "Subtle (0.35)"
                          : sharpnessAmount <= 0.75
                          ? "Balanced (0.65)"
                          : sharpnessAmount <= 1.1
                          ? "Crisp (1.00)"
                          : "Ultra (1.30)"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "Subtle", val: 0.35 },
                        { label: "Balanced", val: 0.65 },
                        { label: "Crisp", val: 1.0 },
                        { label: "Ultra", val: 1.3 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setSharpnessAmount(item.val)}
                          className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                            sharpnessAmount === item.val
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white dark:bg-[#121215] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Denoise & JPEG Artifact Suppression */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Noise & Artifact Suppression
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Removes JPEG compression grain prior to sharpening
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNoiseReduction(!noiseReduction)}
                  className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                    noiseReduction ? "bg-emerald-600" : "bg-slate-300 dark:bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      noiseReduction ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Resolution Metric Comparison */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Resolution Metrics
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Resolution:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height} px` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Upscaled:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {targetWidth} × {targetHeight} px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pixel Multiplier:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {scaleFactor === 2
                      ? "+300% (4x pixels)"
                      : scaleFactor === 4
                      ? "+1500% (16x pixels)"
                      : "+6300% (64x pixels)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Export Format:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 uppercase">
                    {exportFormat.replace("image/", "")}
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upscale CTA Button */}
              <button
                type="button"
                onClick={() => handleUpscale()}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-bold text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? processStatus || "Upscaling..."
                    : `Upscale to ${scaleFactor}x Resolution (${targetWidth}×${targetHeight})`}
                </span>
              </button>

              {/* Download and Export Buttons (When Result Ready) */}
              {result && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/[0.08] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Ready to Download
                    </span>
                    <span className="text-slate-500 font-semibold">{formatBytes(result.size)}</span>
                  </div>

                  <a
                    href={resultUrl || result.objectUrl}
                    download={`Botock-Upscaled-${result.width}x${result.height}.${exportFormat === "image/png" ? "png" : exportFormat === "image/webp" ? "webp" : "jpg"}`}
                    className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download High-Res Image
                  </a>

                  {/* Format export switch */}
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="text-slate-500 text-[11px]">Format:</span>
                    {(["image/png", "image/webp", "image/jpeg"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setExportFormat(fmt);
                          // Re-trigger generation for new format with explicit parameter
                          handleUpscale(fmt);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          exportFormat === fmt
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {fmt.replace("image/", "")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          FEATURED AI CREATIVE SUGGESTION (AS REQUESTED BY USER)
          Direct link & explanation of AI Image Generator (attachment file reference)
          ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-transparent border border-violet-500/20 dark:border-white/[0.08] relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400 text-xs font-bold border border-violet-600/20">
            <Wand2 className="w-3.5 h-3.5" /> Next Creative Step: AI Image Studio
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Want to Edit or Restyle this Picture with AI Prompts?
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            In Botock&apos;s <strong>AI Image Generator</strong>, you don&apos;t just create art from text—you can upload an 
            <strong> attachment reference image</strong> to edit, swap backgrounds, reimagining styles, or generate new variations while preserving your original composition!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/tools/image-generator"
              onClick={handleSendToImageGenerator}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> Open in AI Image Generator (Use as Reference)
            </Link>

            <Link
              href="/tools/image-remove-bg"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#121215] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] font-semibold text-xs sm:text-sm transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-500" /> Remove Background First
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RELATED IMAGE TOOLS SUGGESTION MATRIX
          ========================================================================= */}
      <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              More Recommended Image & Video Tools
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transform and optimize your creative assets across Botock&apos;s tool suite.
            </p>
          </div>
          <Link
            href="/tools"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            All Tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              title: "AI Background Remover",
              desc: "1-click cutout with edge-accurate transparency",
              icon: Wand2,
              href: "/tools/image-remove-bg",
              tag: "AI Powered",
            },
            {
              title: "Compress Image",
              desc: "Reduce file weight for WebP, PNG, and JPG",
              icon: MinimizeIcon,
              href: "/tools/image-compress",
              tag: "Fast",
            },
            {
              title: "Crop Image",
              desc: "Pixel-accurate cropping for social media formats",
              icon: Crop,
              href: "/tools/image-crop",
              tag: "Instant",
            },
            {
              title: "Resize Image",
              desc: "Custom pixel resolution with locked aspect ratio",
              icon: Maximize2,
              href: "/tools/image-resize",
              tag: "Free",
            },
            {
              title: "Image Format Converter",
              desc: "Convert between WebP, PNG, JPG, and BMP",
              icon: ImageIcon,
              href: "/tools/image-convert",
              tag: "Lossless",
            },
            {
              title: "Image Filters & Effects",
              desc: "Cinematic color grading, contrast, and brightness",
              icon: Sliders,
              href: "/tools/image-filters",
              tag: "Presets",
            },
            {
              title: "AI Video Studio",
              desc: "Generate 1080p cinematic AI video from prompts",
              icon: Film,
              href: "/tools/video-generator",
              tag: "Studio",
            },
            {
              title: "Video Auto-Reframe",
              desc: "Smart reframe videos for 9:16 Shorts & Reels",
              icon: Scissors,
              href: "/tools/video-auto-reframe",
              tag: "Smart Crop",
            },
          ].map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Link
                key={idx}
                href={tool.href}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] hover:border-emerald-500/50 transition-all group flex flex-col justify-between gap-3 text-left shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white">
                    {tool.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
