"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "@/lib/utils/formatters";
import JSZip from "jszip";
import {
  Image as ImageIcon,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

type ImageFormat = "png" | "jpeg" | "webp";

interface ConvertedItem {
  id: string;
  name: string;
  originalSize: number;
  newSize: number;
  blobUrl: string;
  blob: Blob;
  targetFormat: ImageFormat;
}

export default function ImageConvertClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>("#ffffff");

  const [convertedItems, setConvertedItems] = useState<ConvertedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      convertedItems.forEach((item) => URL.revokeObjectURL(item.blobUrl));
    };
  }, [convertedItems]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFiles((prev) => [...prev, ...acceptedFiles]);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".avif"],
    },
  });

  const resetAll = () => {
    convertedItems.forEach((item) => URL.revokeObjectURL(item.blobUrl));
    setFiles([]);
    setConvertedItems([]);
    setErrorMsg(null);
  };

  const convertSingleFile = (file: File): Promise<ConvertedItem> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not initialize 2D canvas context."));
          return;
        }

        // Fill background if converting transparent format to JPEG
        if (targetFormat === "jpeg") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mime = `image/${targetFormat}`;
        const q = quality / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error(`Failed to encode to ${targetFormat.toUpperCase()}`));
              return;
            }

            const base = file.name.replace(/\.[^/.]+$/, "");
            const newName = `${base}.${targetFormat === "jpeg" ? "jpg" : targetFormat}`;
            const blobUrl = URL.createObjectURL(blob);

            resolve({
              id: `${file.name}-${Date.now()}`,
              name: newName,
              originalSize: file.size,
              newSize: blob.size,
              blobUrl,
              blob,
              targetFormat,
            });
          },
          mime,
          q
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image: ${file.name}`));
      };

      img.src = objectUrl;
    });
  };

  const handleConvertAll = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const results = await Promise.all(files.map((f) => convertSingleFile(f)));
      setConvertedItems(results);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to convert some images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAllZip = async () => {
    if (convertedItems.length === 0) return;

    const zip = new JSZip();
    convertedItems.forEach((item) => {
      zip.file(item.name, item.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `botock-converted-${targetFormat}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {files.length === 0 ? (
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
            Drop Images here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Convert JPG, PNG, WebP, BMP, and GIF to modern formats with custom quality. Batch conversion supported.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {files.length} {files.length === 1 ? "Image" : "Images"} Selected
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Size: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
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
            {/* File List & Converted Outputs */}
            <div className="lg:col-span-2 space-y-4">
              {convertedItems.length === 0 ? (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-slate-500 shrink-0">{formatBytes(file.size)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Converted {convertedItems.length} Files
                    </span>

                    {convertedItems.length > 1 && (
                      <button
                        onClick={downloadAllZip}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download All as ZIP
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {convertedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.blobUrl}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-white/[0.1]"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {formatBytes(item.originalSize)} <ArrowRight className="w-3 h-3 inline mx-0.5" />{" "}
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatBytes(item.newSize)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <a
                          href={item.blobUrl}
                          download={item.name}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
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
                <span>Format Settings</span>
              </div>

              {/* Target Format */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Convert To
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["webp", "png", "jpeg"] as ImageFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetFormat === fmt
                          ? "border-emerald-500 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {fmt === "jpeg" ? "JPG" : fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider */}
              {targetFormat !== "png" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <span>Quality</span>
                    <span className="text-emerald-500">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Smaller Size</span>
                    <span>High Fidelity</span>
                  </div>
                </div>
              )}

              {/* Background Color for JPEG */}
              {targetFormat === "jpeg" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Background Color for Transparency
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {bgColor}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvertAll}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? "Converting..."
                    : `Convert ${files.length} Image${files.length > 1 ? "s" : ""}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
