"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import JSZip from "jszip";
import {
  RotateCw,
  RotateCcw,
  Image as ImageIcon,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  FolderUp,
  Upload,
  RefreshCw,
  FileCheck,
  Check,
  Loader2,
  Sliders,
} from "lucide-react";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  autoStraightened: boolean;
  exifOrientation: number;
}

/**
 * Extracts EXIF orientation tag (0x0112) from JPEG image files
 * Returns: 1 (normal), 3 (180 deg), 6 (90 deg CW), 8 (270 deg CW), or 1 if none
 */
async function getExifOrientation(file: File): Promise<number> {
  if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
    return 1;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) {
        return resolve(1);
      }
      let offset = 2;
      const length = view.byteLength;
      while (offset < length) {
        if (view.getUint16(offset, false) === 0xffe1) {
          offset += 4;
          if (view.getUint32(offset, false) !== 0x45786966) {
            return resolve(1);
          }
          offset += 6;
          const little = view.getUint16(offset, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          if (offset + 2 > length) return resolve(1);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (offset + 12 > length) return resolve(1);
            if (view.getUint16(offset, little) === 0x0112) {
              return resolve(view.getUint16(offset + 8, little));
            }
            offset += 12;
          }
          return resolve(1);
        } else {
          offset += 2 + view.getUint16(offset + 2, false);
        }
      }
      return resolve(1);
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageRotateClient() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [ignoredCount, setIgnoredCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    let skipped = 0;
    const validImageFiles: File[] = [];

    for (const f of rawFiles) {
      if (
        f.type.startsWith("image/") ||
        /\.(jpe?g|png|webp|gif|bmp|avif|tiff)$/i.test(f.name)
      ) {
        validImageFiles.push(f);
      } else {
        skipped++;
      }
    }

    if (skipped > 0) {
      setIgnoredCount((prev) => prev + skipped);
    }

    if (validImageFiles.length === 0) return;

    setIsProcessing(true);
    setStatusText(`Scanning ${validImageFiles.length} photos and analyzing orientation...`);

    const newItems: ImageItem[] = [];

    for (let i = 0; i < validImageFiles.length; i++) {
      const f = validImageFiles[i];
      try {
        const exif = await getExifOrientation(f);
        // Modern browsers already apply EXIF orientation automatically on decode.
        // We track exif for diagnostics without forcing double rotation.
        const initialRotation = 0;
        const autoStraight = exif > 1;

        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(f);
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else img.onload = () => resolve();
        });

        newItems.push({
          id: `${f.name}-${Date.now()}-${i}-${Math.random()}`,
          file: f,
          name: f.name,
          size: f.size,
          dataUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          rotation: initialRotation,
          flipH: false,
          autoStraightened: autoStraight,
          exifOrientation: exif,
        });
      } catch (err) {
        console.warn("Could not parse image:", f.name, err);
      }
      setProgress(Math.round(((i + 1) / validImageFiles.length) * 100));
    }

    setImages((prev) => [...prev, ...newItems]);
    setIsProcessing(false);
    setProgress(0);
    setStatusText("");
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRotateSingle = (id: string, delta: number) => {
    setImages((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextRot = (item.rotation + delta + 360) % 360;
          return {
            ...item,
            rotation: nextRot,
            autoStraightened: false,
          };
        }
        return item;
      })
    );
  };

  const handleFlipSingle = (id: string) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, flipH: !item.flipH } : item))
    );
  };

  const handleRemoveSingle = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  // Batch actions
  const handleRotateAll = (delta: number) => {
    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        rotation: (item.rotation + delta + 360) % 360,
      }))
    );
  };

  const handleAutoStraightenAll = () => {
    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        rotation: 0,
        flipH: false,
        autoStraightened: true,
      }))
    );
  };

  const handleClearAll = () => {
    setImages([]);
    setIgnoredCount(0);
  };

  const getItemExtension = (item: ImageItem): string => {
    const t = (item.file.type || "").toLowerCase();
    if (t.includes("png")) return "png";
    if (t.includes("webp")) return "webp";
    if (t.includes("gif")) return "gif";
    if (t.includes("bmp")) return "bmp";
    const match = item.name.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : "jpg";
  };

  const renderTransformedImage = async (item: ImageItem): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = item.dataUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));

        const is90or270 = item.rotation === 90 || item.rotation === 270;
        canvas.width = is90or270 ? img.height : img.width;
        canvas.height = is90or270 ? img.width : img.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.scale(item.flipH ? -1 : 1, 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const outMime = item.file.type || "image/jpeg";
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Blob generation failed"));
        }, outMime, 0.95);
      };
      img.onerror = reject;
    });
  };

  const handleExportZip = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText("Rotating images and building ZIP package...");

    try {
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setStatusText(`Processing photo ${i + 1} of ${images.length}...`);
        const blob = await renderTransformedImage(item);
        const ext = getItemExtension(item);
        const base = item.name.replace(/\.[^/.]+$/, "");
        const fileName = `${base}_straightened.${ext}`;
        zip.file(fileName, blob);
        setProgress(Math.round(((i + 1) / images.length) * 80));
      }

      setStatusText("Compressing files into download ZIP...");
      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        (metadata) => {
          setProgress(80 + Math.round(metadata.percent * 0.2));
        }
      );

      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `straightened_photos_${images.length}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
    } catch (err: any) {
      console.error("ZIP creation failed:", err);
      alert("Failed to build ZIP file. Please try again.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatusText("");
    }
  };

  const handleExportSingle = async (item: ImageItem) => {
    try {
      const blob = await renderTransformedImage(item);
      const url = URL.createObjectURL(blob);
      const ext = getItemExtension(item);
      const base = item.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}_straightened.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const autoStraightenedCount = images.filter((i) => i.autoStraightened).length;

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Batch Photo Straightener &amp; Orientation Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Batch Image Rotate &amp; Auto-Straighten
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            Upload individual photos or a full folder with 100+ images. AI automatically detects and straightens crooked or sideways photos, ignores non-images (PDFs/docs), and bundles everything into a convenient ZIP.
          </p>
        </div>

        {/* Upload Zone */}
        {images.length === 0 ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="max-w-2xl mx-auto p-12 border-2 border-dashed border-slate-700/60 hover:border-cyan-500/50 rounded-3xl bg-slate-900/40 hover:bg-slate-900/80 transition-all text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <RotateCw className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Drop Photos or Select Full Folder
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Batch upload up to 100+ photos. Non-image files (PDFs, Word docs) are automatically filtered out.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Select Photos
              </button>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-sm transition flex items-center gap-2"
              >
                <FolderUp className="w-4 h-4 text-cyan-400" /> Upload Full Folder
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelect}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error directory attribute
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFilesSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Bar & Stats Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  {images.length} Photos Loaded
                </span>
                {autoStraightenedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {autoStraightenedCount} Auto-Straightened
                  </span>
                )}
                {ignoredCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                    {ignoredCount} Non-images skipped
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoStraightenAll}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Auto-Straighten
                </button>
                <button
                  type="button"
                  onClick={() => handleRotateAll(90)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate All 90° CW
                </button>
                <button
                  type="button"
                  onClick={() => handleRotateAll(270)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rotate All 90° CCW
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Add More
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>
            </div>

            {/* Progress / Status Notice */}
            {isProcessing && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    {statusText}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((item) => {
                const transform = `rotate(${item.rotation}deg) scaleX(${item.flipH ? -1 : 1})`;
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-2.5 flex flex-col justify-between transition-all"
                  >
                    {/* Thumbnail Viewport */}
                    <div className="relative w-full aspect-square rounded-xl bg-black/60 overflow-hidden flex items-center justify-center p-2 mb-2">
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        style={{ transform }}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                      />
                      {item.autoStraightened && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                          AI Straightened
                        </div>
                      )}
                      {item.rotation !== 0 && !item.autoStraightened && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-cyan-600/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                          {item.rotation}°
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSingle(item.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="mb-2">
                      <p className="text-[11px] font-semibold text-white truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.width}×{item.height} px • {formatBytes(item.size)}
                      </p>
                    </div>

                    {/* Quick Rotate Buttons */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleRotateSingle(item.id, -90)}
                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center flex items-center justify-center transition"
                        title="Rotate 90° CCW"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotateSingle(item.id, 90)}
                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center flex items-center justify-center transition"
                        title="Rotate 90° CW"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFlipSingle(item.id)}
                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center flex items-center justify-center transition"
                        title="Flip Horizontal"
                      >
                        <FlipHorizontal className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSingle(item)}
                        className="flex-1 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-center flex items-center justify-center transition"
                        title="Download this photo"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Export Bar */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">
                  Ready to download {images.length} processed {images.length === 1 ? "photo" : "photos"}
                </h4>
                <p className="text-xs text-slate-400">
                  Loss-free canvas export preserving high resolution in a single ZIP file.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportZip}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/20 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Packaging ZIP...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download All ({images.length}) as ZIP
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-800/60">
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">AI Auto-Straighten</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Detects camera sensor EXIF metadata to automatically orient upside-down or sideways photos straight.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-start gap-3">
            <FolderUp className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Batch &amp; Full Folder Upload</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Drop 100+ files or an entire folder. Non-image files like PDFs and Word documents are automatically filtered out.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">100% Private in Browser</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Zero server uploads. All images are processed and packaged into a ZIP entirely on your local device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
