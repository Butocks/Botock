"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Crop,
  FileText,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

interface CropBox {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage
  height: number; // percentage
}

export default function CropPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<any>(null);

  // Crop settings
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 80 });
  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Canvas interaction
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"move" | "nw" | "ne" | "sw" | "se" | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleCropPointerDown = (e: React.PointerEvent, mode: "move" | "nw" | "ne" | "sw" | "se" = "move") => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    setDragStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCropBox((prev) => {
      let { x, y, width, height } = prev;
      if (dragMode === "move") {
        x = Math.max(0, Math.min(100 - width, x + deltaXPercent));
        y = Math.max(0, Math.min(100 - height, y + deltaYPercent));
      } else if (dragMode === "se") {
        width = Math.max(10, Math.min(100 - x, width + deltaXPercent));
        height = Math.max(10, Math.min(100 - y, height + deltaYPercent));
      } else if (dragMode === "nw") {
        const newX = Math.max(0, Math.min(x + width - 10, x + deltaXPercent));
        const newY = Math.max(0, Math.min(y + height - 10, y + deltaYPercent));
        width = width + (x - newX);
        height = height + (y - newY);
        x = newX;
        y = newY;
      } else if (dragMode === "ne") {
        const newY = Math.max(0, Math.min(y + height - 10, y + deltaYPercent));
        width = Math.max(10, Math.min(100 - x, width + deltaXPercent));
        height = height + (y - newY);
        y = newY;
      } else if (dragMode === "sw") {
        const newX = Math.max(0, Math.min(x + width - 10, x + deltaXPercent));
        width = width + (x - newX);
        height = Math.max(10, Math.min(100 - y, height + deltaYPercent));
        x = newX;
      }
      return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleContainerPointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setDragMode(null);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setError("Please choose a valid PDF file.");
        return;
      }
      setError(null);
      setFile(selected);
      setDownloadUrl(null);
      setCurrentPage(1);

      try {
        const buffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const doc = await loadingTask.promise;
        setPdfJsDoc(doc);
        setPageCount(doc.numPages);
        renderPagePreview(doc, 1);
      } catch (err: any) {
        setError(err.message || "Failed to parse PDF document.");
      }
    }
  };

  const renderPagePreview = async (doc: any, pageNum: number) => {
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPageImage(canvas.toDataURL("image/jpeg", 0.85));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pdfJsDoc || newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
    renderPagePreview(pdfJsDoc, newPage);
  };

  const handleCrop = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      const cropStart = applyToAll ? 0 : currentPage - 1;
      const cropEnd = applyToAll ? pages.length : currentPage;

      for (let i = cropStart; i < cropEnd; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate points from percentage
        // Note: PDF coordinate system (0,0 is bottom-left)
        const left = (cropBox.x / 100) * width;
        const right = ((cropBox.x + cropBox.width) / 100) * width;
        const top = height - (cropBox.y / 100) * height;
        const bottom = height - ((cropBox.y + cropBox.height) / 100) * height;

        page.setCropBox(left, bottom, right - left, top - bottom);
        page.setMediaBox(left, bottom, right - left, top - bottom);
      }

      const croppedBytes = await pdfDoc.save();
      const blob = new Blob([croppedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to crop PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full text-slate-900 dark:text-white flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-500 dark:selection:text-indigo-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Crop className="w-3.5 h-3.5" />
            PDF Cropping Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Crop PDF Pages Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Visually trim margins, remove unwanted headers, or crop page margins to exact dimensions. Works directly in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          /* Upload Stage */
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="pdf-upload"
              className="relative group flex flex-col items-center justify-center p-6 sm:p-10 md:p-12 border-2 border-dashed border-slate-300 dark:border-white/[0.1] hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl bg-white dark:bg-[#111114] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all duration-300 cursor-pointer text-center overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Crop className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                Select your PDF document
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
                Interactive crop boundary: Trim margins for all pages or specific page numbers.
              </p>
              <span className="px-6 py-3 min-h-[48px] inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition">
                Choose PDF File
              </span>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          /* Visual Crop Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Canvas Pane */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 flex flex-col items-center shadow-sm">
                {/* Pagination Toolbar */}
                <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-slate-200 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      Page {currentPage} of {pageCount}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pageCount}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Interactive Crop Preview Box */}
                {pageImage && (
                  <div
                    ref={containerRef}
                    onPointerMove={handleContainerPointerMove}
                    onPointerUp={handleContainerPointerUp}
                    onPointerCancel={handleContainerPointerUp}
                    className="relative max-w-md w-full border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden select-none shadow-xl bg-white touch-none"
                  >
                    <img src={pageImage} alt="Crop preview" className="w-full h-auto pointer-events-none select-none" />

                    {/* Darkened Mask Over Uncropped Area */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Top Mask */}
                      <div
                        style={{ height: `${cropBox.y}%` }}
                        className="w-full bg-black/60 absolute top-0 left-0"
                      />
                      {/* Bottom Mask */}
                      <div
                        style={{ height: `${100 - (cropBox.y + cropBox.height)}%` }}
                        className="w-full bg-black/60 absolute bottom-0 left-0"
                      />
                      {/* Left Mask */}
                      <div
                        style={{
                          top: `${cropBox.y}%`,
                          height: `${cropBox.height}%`,
                          width: `${cropBox.x}%`,
                        }}
                        className="bg-black/60 absolute left-0"
                      />
                      {/* Right Mask */}
                      <div
                        style={{
                          top: `${cropBox.y}%`,
                          height: `${cropBox.height}%`,
                          width: `${100 - (cropBox.x + cropBox.width)}%`,
                        }}
                        className="bg-black/60 absolute right-0"
                      />
                    </div>

                    {/* Active Crop Border Box */}
                    <div
                      onPointerDown={(e) => handleCropPointerDown(e, "move")}
                      style={{
                        top: `${cropBox.y}%`,
                        left: `${cropBox.x}%`,
                        width: `${cropBox.width}%`,
                        height: `${cropBox.height}%`,
                      }}
                      className="absolute border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] cursor-move touch-none"
                    >
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-indigo-600 text-[10px] text-white font-medium select-none pointer-events-none">
                        Crop Area
                      </div>

                      {/* Corner Handles for touch / mouse resize */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown(e, "nw")}
                        className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize touch-none shadow-md z-30"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown(e, "ne")}
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize touch-none shadow-md z-30"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown(e, "sw")}
                        className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize touch-none shadow-md z-30"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown(e, "se")}
                        className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize touch-none shadow-md z-30"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setFile(null);
                    setDownloadUrl(null);
                  }}
                  className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Choose another file
                </button>
              </div>
            </div>

            {/* Right Options Sidebar */}
            <div className="lg:col-span-4 bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase mb-3">
                  Crop Scope
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setApplyToAll(true)}
                    className={`py-2 px-3 text-xs rounded-lg border transition ${
                      applyToAll
                        ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    All Pages ({pageCount})
                  </button>
                  <button
                    onClick={() => setApplyToAll(false)}
                    className={`py-2 px-3 text-xs rounded-lg border transition ${
                      !applyToAll
                        ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Current Page Only
                  </button>
                </div>
              </div>

              {/* Crop Margin Sliders */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase mb-3">
                  Adjust Margins (%)
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Left Margin</span>
                      <span>{cropBox.x}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      value={cropBox.x}
                      onChange={(e) => {
                        const newX = parseInt(e.target.value);
                        setCropBox((prev) => ({
                          ...prev,
                          x: newX,
                          width: Math.min(prev.width, 100 - newX),
                        }));
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Top Margin</span>
                      <span>{cropBox.y}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      value={cropBox.y}
                      onChange={(e) => {
                        const newY = parseInt(e.target.value);
                        setCropBox((prev) => ({
                          ...prev,
                          y: newY,
                          height: Math.min(prev.height, 100 - newY),
                        }));
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Crop Width</span>
                      <span>{cropBox.width}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100 - cropBox.x}
                      value={cropBox.width}
                      onChange={(e) => setCropBox((prev) => ({ ...prev, width: parseInt(e.target.value) }))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Crop Height</span>
                      <span>{cropBox.height}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100 - cropBox.y}
                      value={cropBox.height}
                      onChange={(e) => setCropBox((prev) => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!downloadUrl ? (
                <button
                  onClick={handleCrop}
                  disabled={isProcessing}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cropping Document...
                    </>
                  ) : (
                    <>
                      <Crop className="w-4 h-4" />
                      Apply Crop
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <a
                    href={downloadUrl}
                    download={`cropped-${file.name}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Cropped PDF
                  </a>
                  <button
                    onClick={() => setDownloadUrl(null)}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition text-center"
                  >
                    Reset &amp; crop again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <Crop className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Lossless MediaBox Trimming</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Modifies native PDF CropBox tags without lossy image re-compression, preserving razor-sharp text and diagrams.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Instant In-Browser Execution</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Cropping coordinates are calculated and updated inside your browser. No files are ever sent to an external server.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Batch or Single Page</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Apply uniform margin trims across entire books and reports, or isolate a single page for targeted cropping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
