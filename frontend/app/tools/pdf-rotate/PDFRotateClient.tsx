"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import {
  FileUp,
  FileText,
  Download,
  Loader2,
  RefreshCcw,
  RotateCw,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Check,
} from "lucide-react";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

interface PageData {
  pageNum: number;
  thumbnail: string;
  isLandscape: boolean;
  width: number;
  height: number;
}

export default function PDFRotateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PageData[]>([]);
  const [rotations, setRotations] = useState<number[]>([]);
  const [autoStraightenedMap, setAutoStraightenedMap] = useState<Record<number, boolean>>({});

  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { url: downloadUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  const loadPdfThumbnails = async (pdfFile: File) => {
    setIsLoadingPdf(true);
    setActionError(null);
    setPdfPages([]);
    setRotations([]);
    setAutoStraightenedMap({});

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      const count = doc.numPages;

      const loaded: PageData[] = [];
      const initRots: number[] = [];

      for (let i = 1; i <= count; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        let thumb = "";
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          thumb = canvas.toDataURL("image/jpeg", 0.75);
        }

        const isLand = viewport.width > viewport.height;
        loaded.push({
          pageNum: i,
          thumbnail: thumb,
          isLandscape: isLand,
          width: viewport.width,
          height: viewport.height,
        });
        initRots.push(0);
      }

      setPdfPages(loaded);
      setRotations(initRots);
    } catch (err: any) {
      console.error("PDF thumbnail load error:", err);
      setActionError("Failed to parse PDF document pages.");
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const f = acceptedFiles[0];
      setFile(f);
      resetDownload();
      await loadPdfThumbnails(f);
    },
    [resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleRotateSinglePage = (pageIndex: number, delta: number) => {
    setRotations((prev) => {
      const next = [...prev];
      next[pageIndex] = (next[pageIndex] + delta + 360) % 360;
      return next;
    });
    setAutoStraightenedMap((prev) => ({ ...prev, [pageIndex]: false }));
    resetDownload();
  };

  const handleRotateAll = (delta: number) => {
    setRotations((prev) => prev.map((r) => (r + delta + 360) % 360));
    resetDownload();
  };

  const handleAutoStraighten = () => {
    // Automatically detect pages whose orientation doesn't match standard portrait
    // If a page is landscape (width > height), rotate 90° CW to make it straight upright!
    const newRots = [...rotations];
    const newAutoMap: Record<number, boolean> = {};

    pdfPages.forEach((p, idx) => {
      if (p.isLandscape) {
        newRots[idx] = (newRots[idx] + 90) % 360;
        newAutoMap[idx] = true;
      }
    });

    setRotations(newRots);
    setAutoStraightenedMap(newAutoMap);
    resetDownload();
  };

  const handleResetAngles = () => {
    setRotations(new Array(pdfPages.length).fill(0));
    setAutoStraightenedMap({});
    resetDownload();
  };

  const handleApplyAndSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setActionError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const addedRot = rotations[i] || 0;
        if (addedRot !== 0) {
          const currentRotation = pages[i].getRotation().angle;
          pages[i].setRotation(degrees((currentRotation + addedRot) % 360));
        }
      }

      const pdfBytes = await pdfDoc.save();
      setBlob(pdfBytes);
    } catch (err: any) {
      console.error("PDF rotation apply failed:", err);
      setActionError(err.message || "Failed to process and rotate PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfPages([]);
    setRotations([]);
    setAutoStraightenedMap({});
    setActionError(null);
    resetDownload();
  };

  const modifiedPagesCount = rotations.filter((r) => r !== 0).length;

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center mx-auto mb-4">
            <RotateCw className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Upload PDF Document
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Rotate individual pages or all pages at once. Fix sideways or crooked pages with 1-click Auto-Straighten.
          </p>
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-md shadow-violet-600/25 transition"
          >
            Select PDF File
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Info & Actions Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pdfPages.length} pages • {modifiedPagesCount} {modifiedPagesCount === 1 ? "page rotated" : "pages rotated"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAutoStraighten}
                className="px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 text-xs font-bold transition flex items-center gap-1.5"
                title="Detect and straighten sideways landscape pages to portrait"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-Straighten
              </button>
              <button
                type="button"
                onClick={() => handleRotateAll(90)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotate All 90° CW
              </button>
              <button
                type="button"
                onClick={() => handleRotateAll(270)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rotate All 90° CCW
              </button>
              <button
                type="button"
                onClick={handleResetAngles}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-medium transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>

          {/* Loading state for thumbnails */}
          {isLoadingPdf && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Rendering visual page thumbnails...
              </p>
            </div>
          )}

          {/* Page Thumbnails Interactive Grid */}
          {!isLoadingPdf && pdfPages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pdfPages.map((page, idx) => {
                const rot = rotations[idx] || 0;
                const isAuto = autoStraightenedMap[idx];
                return (
                  <div
                    key={page.pageNum}
                    className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3 flex flex-col justify-between hover:border-violet-500/50 transition-all group"
                  >
                    {/* Thumbnail Frame */}
                    <div className="relative w-full aspect-[3/4] rounded-xl bg-white dark:bg-black/60 overflow-hidden flex items-center justify-center p-2 mb-2 shadow-xs">
                      {page.thumbnail ? (
                        <img
                          src={page.thumbnail}
                          alt={`Page ${page.pageNum}`}
                          style={{
                            transform: `rotate(${rot}deg)`,
                            transition: "transform 0.2s ease-in-out",
                          }}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-slate-400" />
                      )}

                      {/* Rotation Badge */}
                      {rot !== 0 && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-violet-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                          {rot}° {isAuto ? "(Auto)" : ""}
                        </div>
                      )}
                    </div>

                    {/* Page Number & Info */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Page {page.pageNum}
                      </span>
                      {page.isLandscape && (
                        <span className="text-[10px] text-slate-400 uppercase">
                          Landscape
                        </span>
                      )}
                    </div>

                    {/* Individual Page Rotate Controls */}
                    <div className="flex items-center gap-1 pt-1.5 border-t border-slate-200 dark:border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => handleRotateSinglePage(idx, -90)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-200/70 dark:bg-white/[0.06] hover:bg-violet-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center transition"
                        title="Rotate Page 90° CCW"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotateSinglePage(idx, 90)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-200/70 dark:bg-white/[0.06] hover:bg-violet-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center transition"
                        title="Rotate Page 90° CW"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotateSinglePage(idx, 180)}
                        className="px-2 py-1.5 rounded-lg bg-slate-200/70 dark:bg-white/[0.06] hover:bg-violet-500 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-bold transition"
                        title="Rotate Page 180°"
                      >
                        180°
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {actionError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Bottom Execution & Download Banner */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Save &amp; Export Rotated PDF
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All page rotations and orientations will be permanently embedded in the downloaded PDF.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!downloadUrl ? (
                <button
                  type="button"
                  onClick={handleApplyAndSave}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Rotated PDF...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Apply Changes &amp; Generate PDF
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={downloadUrl}
                  download={`rotated_${file.name}`}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Rotated PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
