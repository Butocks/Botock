"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "@/lib/utils/formatters";
import {
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Trash2,
  Sliders,
  Sparkles,
  Code2,
  Layers,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ImageToSvgClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(128);
  const [colorMode, setColorMode] = useState<"bw" | "posterize">("bw");
  const [colorsCount, setColorsCount] = useState<number>(4);

  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setSvgOutput(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setSvgOutput(null);
    setErrorMsg(null);
  };

  const handleVectorize = async () => {
    if (!file || !previewUrl) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      // Canvas processing
      const maxDim = 480;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D context.");

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Generate SVG rects / polygons
      let paths = "";

      if (colorMode === "bw") {
        // High-contrast vector mask
        for (let y = 0; y < h; y += 2) {
          let runStart = -1;
          for (let x = 0; x < w; x += 2) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            const isDark = a > 50 && brightness < threshold;

            if (isDark) {
              if (runStart === -1) runStart = x;
            } else {
              if (runStart !== -1) {
                paths += `<rect x="${runStart}" y="${y}" width="${x - runStart}" height="2" fill="#111827"/>`;
                runStart = -1;
              }
            }
          }
          if (runStart !== -1) {
            paths += `<rect x="${runStart}" y="${y}" width="${w - runStart}" height="2" fill="#111827"/>`;
          }
        }
      } else {
        // Quantized multi-color vector mosaic
        const step = Math.floor(256 / colorsCount);
        for (let y = 0; y < h; y += 3) {
          for (let x = 0; x < w; x += 3) {
            const idx = (y * w + x) * 4;
            const a = data[idx + 3];
            if (a < 30) continue;

            const r = Math.min(255, Math.floor(data[idx] / step) * step);
            const g = Math.min(255, Math.floor(data[idx + 1] / step) * step);
            const b = Math.min(255, Math.floor(data[idx + 2] / step) * step);
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

            paths += `<rect x="${x}" y="${y}" width="3" height="3" fill="${hex}"/>`;
          }
        }
      }

      const generatedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">${paths}</svg>`;
      setSvgOutput(generatedSvg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to vectorize image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file ? file.name.replace(/\.[^/.]+$/, "") : "vector"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!svgOutput) return;
    copyToClipboard(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
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
            Drop Image here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Convert PNG or JPG logos, icons, and sketches into scalable SVG vectors.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visualizer Display */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source raster */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Original Raster Image
                  </span>
                  <div className="h-64 w-full flex items-center justify-center bg-black/10 rounded-xl overflow-hidden p-2">
                    <img
                      src={previewUrl || ""}
                      alt="Source"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* SVG Vector Output */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">
                    Vectorized SVG Output
                  </span>
                  <div className="h-64 w-full flex items-center justify-center bg-white dark:bg-slate-950 rounded-xl overflow-hidden p-2 border border-slate-200 dark:border-white/[0.1]">
                    {svgOutput ? (
                      <div
                        className="max-h-full max-w-full h-full w-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: svgOutput }}
                      />
                    ) : (
                      <p className="text-xs text-slate-400 text-center px-4">
                        Adjust settings on the right and click Vectorize to generate SVG.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {svgOutput && (
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download SVG File
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Code2 className="w-4 h-4" />}
                    <span>{copied ? "Copied SVG!" : "Copy SVG Code"}</span>
                  </button>
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
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Vector Settings</span>
              </div>

              {/* Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Vector Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorMode("bw")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      colorMode === "bw"
                        ? "border-emerald-500 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Monochrome / Stamp
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode("posterize")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      colorMode === "posterize"
                        ? "border-emerald-500 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Multi-Color
                  </button>
                </div>
              </div>

              {colorMode === "bw" ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <span>Threshold Cutoff</span>
                    <span className="text-emerald-500">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={230}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <span>Color Levels</span>
                    <span className="text-emerald-500">{colorsCount}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={colorsCount}
                    onChange={(e) => setColorsCount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleVectorize}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Tracing Vector Paths...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Trace & Vectorize to SVG</span>
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
