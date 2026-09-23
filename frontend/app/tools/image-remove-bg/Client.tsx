"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
  Eye,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { useImageDocument } from "@/lib/image/useImageDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

type ModelQuality = "isnet_fp16" | "isnet_quint8" | "isnet";

const MODEL_OPTIONS = [
  {
    id: "isnet_fp16" as ModelQuality,
    name: "Balanced (FP16)",
    badge: "Default",
    badgeColor: "bg-emerald-500",
    desc: "Optimal speed & fine boundary edge quality",
  },
  {
    id: "isnet_quint8" as ModelQuality,
    name: "Fast (Quantized)",
    badge: "Fastest",
    badgeColor: "bg-blue-500",
    desc: "Fastest for mobile & low-spec devices",
  },
  {
    id: "isnet" as ModelQuality,
    name: "High Precision",
    badge: "Max Detail",
    badgeColor: "bg-violet-500",
    desc: "Maximum detail for complex subjects",
  },
];

export default function ImageRemoveBgClient() {
  // ─── Shared hooks ─────────────────────────────────────────────────────────
  const {
    file: imageFile,
    previewUrl: imageSrc,
    dimensions: imageDimensions,
    error: docError,
    loadImage,
    reset: resetImage,
  } = useImageDocument();

  const {
    url: resultUrl,
    setBlob: setResultBlob,
    reset: resetDownload,
  } = useObjectUrlDownload();

  // ─── Processing state ────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [modelQuality, setModelQuality] = useState<ModelQuality>("isnet_fp16");

  const error = actionError || docError;

  // ─── Drop handler ─────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      setProgress(0);
      setStatusMessage("");
      resetDownload();
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
    },
    maxFiles: 1,
  });

  // ─── AI processing ────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (!imageFile && !imageSrc) return;

    setIsProcessing(true);
    setActionError(null);
    setProgress(0);
    setStatusMessage("Loading neural network model...");

    try {
      const imgly = await import("@imgly/background-removal");
      const removeBackground = imgly.removeBackground || imgly.default;

      if (typeof removeBackground !== "function") {
        throw new Error("Failed to initialize background removal engine.");
      }

      // Prefer the File object directly (most reliable input for @imgly/background-removal)
      // imageSrc (object URL) is also valid as a fallback
      const inputSource: File | string = imageFile || imageSrc!;

      const blob = await removeBackground(inputSource, {
        model: modelQuality,
        progress: (key: string, current: number, total: number) => {
          let pct = 0;
          if (total > 0) {
            pct = Math.min(100, Math.round((current / total) * 100));
          } else if (current > 0) {
            pct = Math.min(99, Math.round(current * 100));
          }
          setProgress(pct);

          const lowerKey = key.toLowerCase();
          if (lowerKey.includes("fetch") || lowerKey.includes("download") || lowerKey.includes("model")) {
            setStatusMessage(`Loading neural network model (${pct}%)...`);
          } else if (lowerKey.includes("init") || lowerKey.includes("session")) {
            setStatusMessage("Initializing WebAssembly runtime...");
          } else if (
            lowerKey.includes("compute") ||
            lowerKey.includes("inference") ||
            lowerKey.includes("segment")
          ) {
            setStatusMessage(`Processing image segmentation (${pct}%)...`);
          } else {
            setStatusMessage(`Processing: ${key} (${pct}%)`);
          }
        },
        output: {
          format: "image/png",
          quality: 1.0,
        },
      });

      // Shared hook handles revoke of previous URL automatically
      setResultBlob(blob, "image/png");
      setProgress(100);
      setStatusMessage("Background removed successfully!");
    } catch (err: unknown) {
      console.error("AI Background Removal Error:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to remove background from image."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    resetImage();
    resetDownload();
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage("");
    setActionError(null);
  };

  const downloadFileName = imageFile
    ? `${imageFile.name.replace(/\.[^/.]+$/, "")}-no-bg.png`
    : "Botock-No-Background.png";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!imageSrc ? (
        /* ─── Drop Zone ────────────────────────────────────────────────── */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop an Image to Remove Background
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Supports JPG, PNG, WEBP — Instant client-side AI processing
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] px-5 py-3 rounded-2xl">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Privacy
            </span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-500" /> In-Browser AI
            </span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <span>Zero Server Uploads</span>
          </div>
        </div>
      ) : (
        /* ─── Main Layout ──────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Source + Model ───────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  Source Image
                </span>
                {imageDimensions && (
                  <span className="text-xs bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md font-mono">
                    {imageDimensions.width} × {imageDimensions.height} px
                  </span>
                )}
                {imageFile && (
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md font-medium">
                    {formatBytes(imageFile.size)}
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Start Over
              </button>
            </div>

            {/* Input Preview */}
            <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-4 flex items-center justify-center min-h-[300px] max-h-[400px]">
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-w-full max-h-[360px] object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Model & AI Settings */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  AI Segmentation Model
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MODEL_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setModelQuality(item.id)}
                    disabled={isProcessing}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      modelQuality === item.id
                        ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                        : "border-slate-200 dark:border-white/[0.06] bg-white dark:bg-transparent hover:border-slate-300 dark:hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Actions + Output ────────────────────────────────── */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8 gap-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> AI Background Removal
            </h3>

            {/* Main Action Button */}
            {!resultUrl ? (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isProcessing
                    ? "bg-emerald-600/70 text-white cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Remove Background
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> Re-processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Re-run with {MODEL_OPTIONS.find(m => m.id === modelQuality)?.name}
                  </>
                )}
              </button>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-1">Processing Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Loading / Progress State */}
            {isProcessing && (
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    {statusMessage || "Processing image..."}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  First run downloads model weights (~40MB) into browser cache. Subsequent runs are near-instant.
                </p>
              </div>
            )}

            {/* Result Preview with Checkerboard Grid */}
            {resultUrl ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Result Preview
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Transparent PNG
                  </span>
                </div>

                {/* Checkerboard background container */}
                <div
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] flex items-center justify-center p-6 min-h-[220px]"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(rgba(148, 163, 184, 0.2) 0% 25%, transparent 0% 50%)",
                    backgroundSize: "20px 20px",
                    backgroundColor: "rgb(241 245 249)",
                  }}
                >
                  <img
                    src={resultUrl}
                    alt="Subject with background removed"
                    className="max-w-full max-h-[220px] object-contain drop-shadow-md select-none"
                  />
                </div>

                {/* Download CTA */}
                <a
                  href={resultUrl}
                  download={downloadFileName}
                  className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  Ready to use with clean alpha transparency in designs &amp; websites.
                </p>
              </div>
            ) : !isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-2xl text-slate-400">
                <Sparkles className="w-10 h-10 mb-3 opacity-40 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ready to Extract Subject
                </p>
                <p className="text-xs max-w-[200px]">
                  Click &ldquo;Remove Background&rdquo; to process directly in your browser.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
