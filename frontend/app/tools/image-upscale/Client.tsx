"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Image as ImageIcon,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle2,
  Sliders,
  Maximize2,
  AlertCircle,
  Eye,
  Layers,
} from "lucide-react";
import { upscaleImage, UpscaleResult } from "./upscaler";
import { formatBytes } from "@/lib/utils/formatters";
import { useImageDocument } from "@/lib/image/useImageDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

type SharpnessPreset = {
  label: string;
  amount: number;
};

const SHARPNESS_PRESETS: SharpnessPreset[] = [
  { label: "Subtle (0.35)", amount: 0.35 },
  { label: "Balanced (0.65)", amount: 0.65 },
  { label: "Crisp (1.00)", amount: 1.0 },
];

export default function Client() {
  // Shared Image & Object URL Hooks
  const {
    file,
    previewUrl: imageSrc,
    dimensions: originalDimensions,
    error: docError,
    loadImage,
    reset: resetImage,
  } = useImageDocument();

  const {
    url: resultUrl,
    setBlob,
    reset: resetDownload,
  } = useObjectUrlDownload();

  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
  const [sharpnessEnabled, setSharpnessEnabled] = useState<boolean>(true);
  const [sharpnessAmount, setSharpnessAmount] = useState<number>(0.65);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [activePreviewTab, setActivePreviewTab] = useState<"upscaled" | "original">("upscaled");

  const errorMessage = actionError || docError;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      resetDownload();
      setResult(null);

      await loadImage(acceptedFiles[0]);
    },
    [loadImage, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
    },
    maxFiles: 1,
  });

  const handleUpscale = async () => {
    if (!imageSrc || !originalDimensions) return;

    try {
      setIsProcessing(true);
      setActionError(null);
      setProcessStatus("Initializing Canvas Engine...");

      await new Promise((resolve) => setTimeout(resolve, 50));

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      await new Promise<void>((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load source image into DOM."));
        }
      });

      setProcessStatus(
        scaleFactor === 4
          ? "Executing Multi-Pass Step Scaling (1x → 2x → 4x)..."
          : "Scaling 2x with High-Quality Interpolation..."
      );

      await new Promise((resolve) => setTimeout(resolve, 60));

      if (sharpnessEnabled) {
        setProcessStatus("Applying Unsharp Mask Convolution Filter...");
        await new Promise((resolve) => setTimeout(resolve, 40));
      }

      const upscaled = await upscaleImage(img, {
        scale: scaleFactor,
        sharpness: sharpnessEnabled,
        sharpnessAmount,
      });

      // Update via shared download hook (auto-revokes previous URLs)
      setBlob(upscaled.blob, "image/png");
      setResult(upscaled);
      setActivePreviewTab("upscaled");
    } catch (err) {
      console.error("Upscaling error:", err);
      setActionError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while upscaling the image."
      );
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
  };

  const handleReset = () => {
    resetImage();
    resetDownload();
    setResult(null);
    setActionError(null);
    setScaleFactor(2);
    setSharpnessEnabled(true);
    setSharpnessAmount(0.65);
    setActivePreviewTab("upscaled");
  };

  const targetWidth = originalDimensions ? originalDimensions.width * scaleFactor : 0;
  const targetHeight = originalDimensions ? originalDimensions.height * scaleFactor : 0;

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!imageSrc ? (
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
            Drop an Image here to Upscale
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Supports JPG, PNG, WEBP, BMP. 100% private in-browser processing with zero server uploads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Information & Enhancement Controls */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header info badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  IMG
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[200px] sm:max-w-xs truncate">
                    {file?.name || "Uploaded Image"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {file ? formatBytes(file.size) : "Local File"}
                  </span>
                </div>
              </div>

              {originalDimensions && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Original Resolution:
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 dark:bg-white/[0.1] text-slate-800 dark:text-slate-200">
                    {originalDimensions.width} × {originalDimensions.height} px
                  </span>
                </div>
              )}
            </div>

            {/* Scale Factor Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-500" /> Scale Factor
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Target: {targetWidth} × {targetHeight} px
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScaleFactor(2)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    scaleFactor === 2
                      ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500"
                      : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] bg-slate-50/50 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      2x Double Resolution
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        scaleFactor === 2
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 dark:bg-white/[0.1] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Fast
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Doubles width and height (4x pixel density). Ideal for web graphics and social posts.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setScaleFactor(4)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    scaleFactor === 4
                      ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500"
                      : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] bg-slate-50/50 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      4x Ultra HD
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        scaleFactor === 4
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 dark:bg-white/[0.1] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Ultra Detail
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Quadruples dimensions (16x pixel density) using progressive multi-pass step scaling.
                  </p>
                </button>
              </div>
            </div>

            {/* Enhancement Toggle: Sharpness Filter */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Sharpness Enhancement
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharpnessEnabled}
                    onChange={(e) => setSharpnessEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-white/[0.1] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Applies an edge-preserving unsharp mask convolution pass to restore fine contours and eliminate bilinear interpolation blur.
              </p>

              {sharpnessEnabled && (
                <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-2">
                    Filter Strength:
                  </span>
                  {SHARPNESS_PRESETS.map((preset) => (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => setSharpnessAmount(preset.amount)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        sharpnessAmount === preset.amount
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Source Image Display */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> Source Image Preview
              </span>
              <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-4 flex items-center justify-center min-h-[220px] max-h-[340px]">
                <img
                  src={imageSrc}
                  alt="Original preview"
                  className="max-h-[280px] max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Reset / Start Over */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-2 transition-colors active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Start Over
              </button>
            </div>
          </div>

          {/* Right Column: Processing CTA, Resolution Diff & Result */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Upscale Settings & Process
            </h3>

            {/* Resolution comparison card */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] mb-5 flex flex-col gap-2.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Resolution Comparison
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Original:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height} px` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Upscaled ({scaleFactor}x):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {targetWidth} × {targetHeight} px
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Pixel Multiplier:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {scaleFactor === 2 ? "+300% (4x pixels)" : "+1500% (16x pixels)"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Enhancement:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {sharpnessEnabled ? `Unsharp Mask (${sharpnessAmount})` : "Standard Bicubic"}
                </span>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={handleUpscale}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-bold text-sm transition-all shadow-md active:scale-95 mb-6 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{processStatus || "Upscaling..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upscale to {scaleFactor}x Resolution</span>
                </>
              )}
            </button>

            {/* Processing status banner */}
            {isProcessing && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {processStatus}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Processing locally on device memory...
                </p>
              </div>
            )}

            {/* Result Area */}
            {result ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Result Ready
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {formatBytes(result.size)}
                  </span>
                </div>

                {/* View switcher tabs */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-white/[0.05] rounded-xl border border-slate-200 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("upscaled")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePreviewTab === "upscaled"
                        ? "bg-white dark:bg-[#121215] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" /> Upscaled ({result.width}×{result.height})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("original")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePreviewTab === "original"
                        ? "bg-white dark:bg-[#121215] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Layers className="w-3 h-3" /> Original
                  </button>
                </div>

                {/* Image Output Card */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#09090b] flex items-center justify-center p-3 max-h-[260px]">
                  <img
                    src={activePreviewTab === "upscaled" ? (resultUrl || result.objectUrl) : imageSrc}
                    alt={activePreviewTab === "upscaled" ? "Upscaled result" : "Original image"}
                    className="max-w-full max-h-[230px] object-contain rounded-lg shadow-sm"
                  />
                </div>

                {/* Download Button */}
                <a
                  href={resultUrl || result.objectUrl}
                  download="Botock-Upscaled-Image.png"
                  className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>
              </div>
            ) : !isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-xl text-slate-400">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">
                  Click &quot;Upscale to {scaleFactor}x Resolution&quot; to render your high-resolution preview.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}