"use client";

 
import { useState, useCallback, useRef, useEffect } from "react";
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
  Eraser,
  Paintbrush,
  Undo2,
  Redo2,
  Save,
  X,
  Brush,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { useImageDocument } from "@/lib/image/useImageDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

type ModelQuality = "isnet_fp16" | "isnet_quint8" | "isnet";
type BrushMode = "erase" | "restore";

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

  // ─── Processing & Main State ─────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [modelQuality, setModelQuality] = useState<ModelQuality>("isnet_fp16");

  // ─── Manual Editor State ──────────────────────────────────────────────────
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [brushMode, setBrushMode] = useState<BrushMode>("erase");
  const [brushSize, setBrushSize] = useState<number>(50);
  
  // Undo/Redo & Drawing State
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgObjRef = useRef<HTMLImageElement | null>(null);

  const error = actionError || docError;

  // ─── Drop handler ─────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      setProgress(0);
      setStatusMessage("");
      resetDownload();
      setIsManualEditing(false);
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
    setIsManualEditing(false);
  };

  // ─── Manual Editing Engine (Erase/Restore) ──────────────────────────────
  const startManualEditing = () => {
    setIsManualEditing(true);
  };

  const cancelManualEditing = () => {
    setIsManualEditing(false);
  };

  // Initialize Canvas when entering edit mode
  useEffect(() => {
    if (isManualEditing && canvasRef.current && resultUrl && imageSrc) {
      const initCanvas = async () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Load AI Result (Transparent Image)
        const resImg = new Image();
        resImg.crossOrigin = "anonymous";
        resImg.src = resultUrl;
        await new Promise((r) => (resImg.onload = r));

        canvas.width = resImg.width;
        canvas.height = resImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(resImg, 0, 0);

        // Setup Offscreen Canvas for Restore Masking trick
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement("canvas");
        }
        offscreenCanvasRef.current.width = resImg.width;
        offscreenCanvasRef.current.height = resImg.height;

        // Load Original Image
        const origImg = new Image();
        origImg.crossOrigin = "anonymous";
        origImg.src = imageSrc;
        await new Promise((r) => (origImg.onload = r));
        originalImgObjRef.current = origImg;

        // Save initial state to history
        const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialData]);
        setHistoryStep(0);
      };
      initCanvas();
    }
  }, [isManualEditing, resultUrl, imageSrc]);

  // Coordinate mapper
  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Draw logic
  const drawStroke = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const offCanvas = offscreenCanvasRef.current;
    const origImg = originalImgObjRef.current;
    if (!canvas || !offCanvas || !origImg) return;

    const ctx = canvas.getContext("2d");
    const offCtx = offCanvas.getContext("2d");
    if (!ctx || !offCtx) return;

    if (brushMode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over"; // Reset
    } else {
      // Restore mode: Extract original pixels using a mask
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

      // Draw the brush stroke (mask)
      offCtx.globalCompositeOperation = "source-over";
      offCtx.beginPath();
      offCtx.moveTo(start.x, start.y);
      offCtx.lineTo(end.x, end.y);
      offCtx.lineWidth = brushSize;
      offCtx.lineCap = "round";
      offCtx.lineJoin = "round";
      offCtx.strokeStyle = "black";
      offCtx.stroke();

      // Intersect with original image
      offCtx.globalCompositeOperation = "source-in";
      offCtx.drawImage(origImg, 0, 0, offCanvas.width, offCanvas.height);

      // Draw the restored pixels onto the main canvas
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(offCanvas, 0, 0);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pos = getCoords(e);
    setLastPos(pos);
    drawStroke(pos, pos); // Draw a dot if just clicked
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos || !canvasRef.current) return;
    const currentPos = getCoords(e);
    drawStroke(lastPos, currentPos);
    setLastPos(currentPos);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPos(null);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Commit stroke to history
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(data);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
      }
    }
  };

  const handleUndo = () => {
    if (historyStep > 0 && canvasRef.current) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      const ctx = canvasRef.current.getContext("2d");
      ctx?.putImageData(history[prevStep], 0, 0);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1 && canvasRef.current) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      const ctx = canvasRef.current.getContext("2d");
      ctx?.putImageData(history[nextStep], 0, 0);
    }
  };

  const applyEdits = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        setResultBlob(blob, "image/png");
        setIsManualEditing(false); // Return to main view
      }
    }, "image/png");
  };

  const downloadFileName = imageFile
    ? `${imageFile.name.replace(/\.[^/.]+$/, "")}-no-bg.png`
    : "Botock-No-Background.png";

  // ─── Manual Editor UI Render ──────────────────────────────────────────────
  if (isManualEditing) {
    return (
      <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Editor Canvas Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                <Paintbrush className="w-5 h-5 text-violet-500" /> Manual Touch-up
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] disabled:opacity-30 transition-colors"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyStep >= history.length - 1}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] disabled:opacity-30 transition-colors"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] flex items-center justify-center p-2 min-h-[400px] shadow-inner"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(rgba(148, 163, 184, 0.2) 0% 25%, transparent 0% 50%)",
                backgroundSize: "20px 20px",
                backgroundColor: "rgb(241 245 249)",
              }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="max-w-full max-h-[600px] object-contain touch-none cursor-crosshair rounded-lg"
              />
            </div>
          </div>

          {/* Tools Sidebar */}
          <div className="w-full lg:w-72 flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-5">
              
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  Tool Mode
                </label>
                <div className="flex bg-slate-200 dark:bg-white/[0.05] rounded-xl p-1">
                  <button
                    onClick={() => setBrushMode("erase")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                      brushMode === "erase"
                        ? "bg-white dark:bg-[#121215] text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    <Eraser className="w-4 h-4" /> Erase
                  </button>
                  <button
                    onClick={() => setBrushMode("restore")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                      brushMode === "restore"
                        ? "bg-white dark:bg-[#121215] text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    <Brush className="w-4 h-4" /> Restore
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  {brushMode === "erase" 
                    ? "Drag over areas to remove them." 
                    : "Drag over areas to bring back the original image."}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Brush Size
                  </label>
                  <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                    {brushSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-2 bg-slate-200 dark:bg-white/[0.1] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button
                onClick={applyEdits}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Apply Edits
              </button>
              <button
                onClick={cancelManualEditing}
                className="w-full py-3.5 rounded-xl border border-slate-300 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main AI View Render ──────────────────────────────────────────────────
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
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

            <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-4 flex items-center justify-center min-h-[300px] max-h-[400px]">
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-w-full max-h-[360px] object-contain rounded-lg shadow-sm"
              />
            </div>

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

          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8 gap-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> AI Background Removal
            </h3>

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
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={startManualEditing}
                  disabled={isProcessing}
                  className="py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Paintbrush className="w-3.5 h-3.5" /> Manual Edit
                </button>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="py-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isProcessing ? "animate-spin" : ""}`} /> 
                  Re-run AI
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-1">Processing Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

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
                  First run downloads model weights into browser cache.
                </p>
              </div>
            )}

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

                <a
                  href={resultUrl}
                  download={downloadFileName}
                  className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>
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