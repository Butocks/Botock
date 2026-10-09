"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Layers,
  Plus,
} from "lucide-react";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

type PageOrientation = "auto" | "portrait" | "landscape";
type PageSizeOption = "fit" | "a4" | "letter";
type MarginOption = "none" | "small" | "big";

export default function JpgToPdfClient() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<PageOrientation>("auto");
  const [pageSize, setPageSize] = useState<PageSizeOption>("a4");
  const [margin, setMargin] = useState<MarginOption>("none");

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [images, resultUrl]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const newItems: ImageItem[] = [];

      for (const file of acceptedFiles) {
        const previewUrl = URL.createObjectURL(file);
        const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => resolve({ w: 800, h: 600 });
          img.src = previewUrl;
        });

        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl,
          width: dimensions.w,
          height: dimensions.h,
        });
      }

      setImages((prev) => [...prev, ...newItems]);
      setResultUrl(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
  });

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const resetAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImages([]);
    setResultUrl(null);
    setResultSize(null);
    setErrorMsg(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const arrayBuffer = await item.file.arrayBuffer();
        let pdfImage;

        const isPng = item.file.type.includes("png") || item.file.name.endsWith(".png");

        if (isPng) {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        }

        // Determine margin points
        const m = margin === "none" ? 0 : margin === "small" ? 18 : 36;

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === "a4") {
          pageWidth = 595.28;
          pageHeight = 841.89;
        } else if (pageSize === "letter") {
          pageWidth = 612.0;
          pageHeight = 792.0;
        } else {
          // Fit to image
          pageWidth = item.width + m * 2;
          pageHeight = item.height + m * 2;
        }

        // Handle Orientation
        if (orientation === "landscape" && pageHeight > pageWidth) {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        } else if (orientation === "portrait" && pageWidth > pageHeight) {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        } else if (orientation === "auto") {
          if (item.width > item.height && pageHeight > pageWidth) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted image dimensions maintaining aspect ratio
        const availableW = pageWidth - m * 2;
        const availableH = pageHeight - m * 2;
        const imgRatio = item.width / item.height;
        const boxRatio = availableW / availableH;

        let drawW = availableW;
        let drawH = availableH;

        if (imgRatio > boxRatio) {
          drawW = availableW;
          drawH = availableW / imgRatio;
        } else {
          drawH = availableH;
          drawW = availableH * imgRatio;
        }

        const drawX = m + (availableW - drawW) / 2;
        const drawY = m + (availableH - drawH) / 2;

        page.drawImage(pdfImage, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to create PDF from images.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {images.length === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-amber-500 bg-amber-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop JPG or PNG images here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Convert JPG, PNG, and WebP images into a single clean PDF document. Reorder pages and configure custom page margins.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {images.length} {images.length === 1 ? "Image" : "Images"} Ready
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Size: {formatBytes(images.reduce((acc, i) => acc + i.file.size, 0))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add More Images
                </button>
              </div>
              <button
                onClick={resetAll}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Start Over
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Image Cards List (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto p-1 border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] p-2 flex flex-col justify-between group shadow-sm"
                  >
                    <div className="aspect-[3/4] w-full bg-white rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
                      <img
                        src={item.previewUrl}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white font-mono text-[10px]">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                        {item.file.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] disabled:opacity-30"
                          title="Move Earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, "down")}
                          disabled={idx === images.length - 1}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] disabled:opacity-30"
                          title="Move Later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(item.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {resultUrl && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>PDF Created Successfully!</span>
                    </div>
                    {resultSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatBytes(resultSize)}
                      </span>
                    )}
                  </div>

                  <a
                    href={resultUrl}
                    download="botock-converted-images.pdf"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Merged PDF Document
                  </a>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right Settings (4 Cols) */}
            <div className="lg:col-span-4 space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Page Layout Settings</span>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["auto", "portrait", "landscape"] as PageOrientation[]).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOrientation(o)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
                        orientation === o
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Document Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "a4", label: "A4 (Standard)" },
                    { id: "letter", label: "US Letter" },
                    { id: "fit", label: "Fit to Image" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPageSize(s.id as PageSizeOption)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        pageSize === s.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Page Margins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "none", label: "No Margin" },
                    { id: "small", label: "Small" },
                    { id: "big", label: "Large" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMargin(m.id as MarginOption)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        margin === m.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? "Building PDF..."
                    : `Convert ${images.length} Image${images.length > 1 ? "s" : ""} to PDF`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
