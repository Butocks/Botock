"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
} from "lucide-react";

type ModelQuality = "isnet_fp16" | "isnet_quint8" | "isnet";

export default function ImageRemoveBgClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [modelQuality, setModelQuality] = useState<ModelQuality>("isnet_fp16");

  // Clean up object URLs on unmount or reset
  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      setError(null);
      setProgress(0);
      setStatusMessage("");

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
      }

      const reader = new FileReader();
      reader.onload = () => {
        const resultString = reader.result as string;
        setImageSrc(resultString);

        // Calculate natural image dimensions
        const img = new window.Image();
        img.onload = () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = resultString;
      };
      reader.readAsDataURL(file);
    }
  }, [resultUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
  });

  const handleProcess = async () => {
    if (!imageFile && !imageSrc) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Loading neural network model...");

    try {
      // Dynamically import @imgly/background-removal strictly in client context
      const imgly = await import("@imgly/background-removal");
      const removeBackground = imgly.removeBackground || imgly.default;

      if (typeof removeBackground !== "function") {
        throw new Error("Failed to initialize background removal engine.");
      }

      const inputSource = imageFile || imageSrc!;

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
          } else if (lowerKey.includes("compute") || lowerKey.includes("inference") || lowerKey.includes("segment")) {
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

      const outputUrl = URL.createObjectURL(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return outputUrl;
      });
      setProgress(100);
      setStatusMessage("Background removed successfully!");
    } catch (err: unknown) {
      console.error("AI Background Removal Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to remove background from image.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setImageFile(null);
    setImageSrc(null);
    setImageDimensions(null);
    setResultUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage("");
    setError(null);
  };

  const downloadFileName = imageFile
    ? `${imageFile.name.replace(/\.[^/.]+$/, "")}-no-bg.png`
    : "Botock-No-Background.png";

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
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop an Image here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Supports JPG, PNG, WEBP (Instant client-side AI processing)
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] px-4 py-2 rounded-xl">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Privacy Protected
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-500" /> In-Browser AI Engine
            </span>
            <span>•</span>
            <span>Zero Server Uploads</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Source & Settings */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                    {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </div>

              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                title="Discard image and select a new one"
              >
                <Trash2 className="w-3.5 h-3.5" /> Start Over
              </button>
            </div>

            {/* Input Preview */}
            <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-4 flex items-center justify-center min-h-[320px]">
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-w-full max-h-[360px] object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Model & AI Settings */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                AI Segmentation Model
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "isnet_fp16",
                    name: "Balanced (FP16)",
                    desc: "Optimal speed & fine boundary edge quality (Default)",
                  },
                  {
                    id: "isnet_quint8",
                    name: "Fast (Quantized)",
                    desc: "Fastest download & inference for mobile/low-spec devices",
                  },
                  {
                    id: "isnet",
                    name: "High Precision",
                    desc: "Maximum detail extraction for complex subjects",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setModelQuality(item.id as ModelQuality)}
                    disabled={isProcessing}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      modelQuality === item.id
                        ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-white/[0.06] bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between mb-1">
                      {item.name}
                      {modelQuality === item.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Processing Actions & Output */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> AI Background Removal
            </h3>

            {/* Main Action Button */}
            {!resultUrl ? (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 mb-6 flex items-center justify-center gap-2 ${
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
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 mb-6"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> Re-processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Re-run Removal
                  </>
                )}
              </button>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 mb-6 flex items-start gap-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-1">Processing Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Loading / Progress State */}
            {isProcessing && (
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 mb-6 animate-in fade-in duration-300">
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
                  First run downloads model weights (~40MB) into browser cache. Subsequent runs are near instantaneous.
                </p>
              </div>
            )}

            {/* Result Preview with Checkerboard Grid */}
            {resultUrl ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Result Preview
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Transparent PNG
                  </span>
                </div>

                {/* Checkerboard Grid Container */}
                <div
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] flex items-center justify-center p-6 min-h-[260px] bg-slate-100 dark:bg-[#0c0c0e] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(rgba(148, 163, 184, 0.2) 0% 25%, transparent 0% 50%)",
                    backgroundSize: "20px 20px",
                  }}
                >
                  <img
                    src={resultUrl}
                    alt="Subject with background removed"
                    className="max-w-full max-h-[260px] object-contain drop-shadow-md select-none"
                  />
                </div>

                {/* Download CTA */}
                <a
                  href={resultUrl}
                  download={downloadFileName}
                  className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>

                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  Ready to use with clean alpha transparency in designs, presentations, and websites.
                </p>
              </div>
            ) : !isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-2xl text-slate-400">
                <ImageIcon className="w-10 h-10 mb-3 opacity-40 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ready to Extract Subject
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                  Click &ldquo;Remove Background&rdquo; to process your image directly in your browser.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
