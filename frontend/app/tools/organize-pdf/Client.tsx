"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, degrees } from "pdf-lib";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileText,
  Layers,
  RotateCw,
  Trash2,
  Copy,
  Plus,
  ArrowLeft,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

interface PageCard {
  id: string;
  originalIndex: number; // 0-indexed in source PDF, or -1 for blank
  thumbnailUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export default function OrganizePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageCard[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      pages.forEach((p) => {
        if (p.thumbnailUrl.startsWith("blob:")) URL.revokeObjectURL(p.thumbnailUrl);
      });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [pages, resultUrl]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setIsLoading(true);
      setErrorMsg(null);
      setPages([]);
      setResultUrl(null);

      try {
        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        const pageList: PageCard[] = [];

        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            const thumbUrl = canvas.toDataURL("image/jpeg", 0.7);

            pageList.push({
              id: `page-${i}-${Date.now()}-${Math.random()}`,
              originalIndex: i - 1,
              thumbnailUrl: thumbUrl,
              rotation: 0,
            });
          }
        }

        setPages(pageList);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(msg || "Failed to load PDF pages.");
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const movePage = (index: number, direction: "left" | "right") => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= pages.length) return;

    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const rotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const duplicatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      const source = copy[index];
      const cloned: PageCard = {
        ...source,
        id: `page-clone-${Date.now()}-${Math.random()}`,
      };
      copy.splice(index + 1, 0, cloned);
      return copy;
    });
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const addBlankPage = () => {
    // Generate white thumbnail canvas
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 160, 220);
      ctx.strokeStyle = "#e2e8f0";
      ctx.strokeRect(0, 0, 160, 220);
    }
    const blankThumb = canvas.toDataURL("image/jpeg", 0.7);

    const blank: PageCard = {
      id: `blank-${Date.now()}-${Math.random()}`,
      originalIndex: -1,
      thumbnailUrl: blankThumb,
      rotation: 0,
    };
    setPages((prev) => [...prev, blank]);
  };

  const resetAll = () => {
    setFile(null);
    setPages([]);
    setResultUrl(null);
    setResultSize(null);
    setErrorMsg(null);
  };

  const handleSaveOrganized = async () => {
    if (!file || pages.length === 0) return;

    setIsOrganizing(true);
    setErrorMsg(null);

    try {
      const sourceBytes = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(sourceBytes);
      const newDoc = await PDFDocument.create();

      for (const card of pages) {
        if (card.originalIndex === -1) {
          // Add blank A4 page
          const blankPage = newDoc.addPage([595.28, 841.89]);
          if (card.rotation !== 0) {
            blankPage.setRotation(degrees(card.rotation));
          }
        } else {
          // Copy page from source document
          const [copiedPage] = await newDoc.copyPages(sourceDoc, [card.originalIndex]);
          if (card.rotation !== 0) {
            const currentRot = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees((currentRot + card.rotation) % 360));
          }
          newDoc.addPage(copiedPage);
        }
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to organize PDF document.");
    } finally {
      setIsOrganizing(false);
    }
  };

  const baseName = file ? file.name.replace(/\.[^/.]+$/, "") : "organized";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-violet-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop PDF here to Organize Pages
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Reorder, delete, rotate, duplicate, and insert pages visually with Canva/iLovePDF level control.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)} • {pages.length} Pages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addBlankPage}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-violet-500" /> Insert Blank Page
              </button>
              <button
                onClick={resetAll}
                disabled={isOrganizing}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Start Over
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-semibold">
                Rendering visual page tiles...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pages Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[520px] overflow-y-auto p-2 border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                {pages.map((card, idx) => (
                  <div
                    key={card.id}
                    className="relative rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] p-2.5 flex flex-col justify-between group shadow-sm hover:border-violet-500/50 transition-all"
                  >
                    {/* Page Thumbnail with Rotation */}
                    <div className="aspect-[3/4] w-full bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative p-1">
                      <img
                        src={card.thumbnailUrl}
                        alt={`Page ${idx + 1}`}
                        style={{
                          transform: `rotate(${card.rotation}deg)`,
                          transition: "transform 0.2s ease",
                        }}
                        className="max-h-full max-w-full object-contain"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-white font-mono text-[10px]">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Action Bar per Card */}
                    <div className="mt-2.5 flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => movePage(idx, "left")}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] disabled:opacity-20 text-slate-600 dark:text-slate-400"
                          title="Move Left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(idx, "right")}
                          disabled={idx === pages.length - 1}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] disabled:opacity-20 text-slate-600 dark:text-slate-400"
                          title="Move Right"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => rotatePage(card.id)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-violet-600 dark:text-violet-400"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicatePage(idx)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-400"
                          title="Duplicate Page"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePage(card.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  Organized document will contain {pages.length} page{pages.length > 1 ? "s" : ""}.
                </span>

                <button
                  type="button"
                  onClick={handleSaveOrganized}
                  disabled={isOrganizing || pages.length === 0}
                  className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isOrganizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rebuilding PDF Structure...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save & Download Organized PDF</span>
                    </>
                  )}
                </button>
              </div>

              {resultUrl && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>PDF Organized Successfully!</span>
                    </div>
                    {resultSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatBytes(resultSize)}
                      </span>
                    )}
                  </div>

                  <a
                    href={resultUrl}
                    download={`${baseName}-organized.pdf`}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Organized PDF
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
          )}
        </div>
      )}
    </div>
  );
}
