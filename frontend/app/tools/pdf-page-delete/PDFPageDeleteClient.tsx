"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { FileUp, FileText, Download, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { usePdfDocument } from "@/lib/pdf/usePdfDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

export default function PDFPageDeleteClient() {
  const { file, pageCount, error: docError, loadFile, reset: resetDoc } = usePdfDocument();
  const { url: downloadUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const errorMessage = actionError || docError;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      resetDownload();
      setPagesToDelete([]);
      await loadFile(acceptedFiles[0]);
    },
    [loadFile, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const togglePageDeletion = (pageNum: number) => {
    setPagesToDelete((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleDeletePages = async () => {
    if (!file || pageCount === 0) return;
    if (pagesToDelete.length >= pageCount) {
      setActionError("You cannot delete every page. At least one page must remain.");
      return;
    }
    if (pagesToDelete.length === 0) {
      setActionError("Please select at least one page to delete.");
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      const keepIndices: number[] = [];
      for (let i = 1; i <= pageCount; i++) {
        if (!pagesToDelete.includes(i)) {
          keepIndices.push(i - 1);
        }
      }

      const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      setBlob(pdfBytes);
    } catch (err: any) {
      console.error("Deletion failed:", err);
      setActionError(err.message || "Failed to remove selected pages from PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    resetDoc();
    resetDownload();
    setPagesToDelete([]);
    setActionError(null);
  };
  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-rose-500 bg-rose-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-rose-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF to remove pages
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click on unwanted pages to delete them from your final document.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount} page(s) total • {pagesToDelete.length} marked for deletion
                </p>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
            >
              Choose another
            </button>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Pages to Delete (Click to mark for removal):
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-64 overflow-y-auto p-2 border border-slate-200 dark:border-white/[0.08] rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                const isMarked = pagesToDelete.includes(pageNum);
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => togglePageDeletion(pageNum)}
                    className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center border transition-all text-xs font-bold ${
                      isMarked
                        ? "bg-rose-500 text-white border-rose-500 line-through shadow-sm"
                        : "bg-white dark:bg-[#121215] border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {isMarked ? <Trash2 className="w-4 h-4 mb-1" /> : <FileText className="w-4 h-4 mb-1 text-slate-400" />}
                    <span>p.{pageNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeletePages}
              disabled={isProcessing || pagesToDelete.length === 0}
              className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Removing {pagesToDelete.length} Page(s)...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete {pagesToDelete.length} Selected Page(s)
                </>
              )}
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-sm font-semibold transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

          {downloadUrl && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Pages Deleted Successfully!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Saved new document containing {pageCount - pagesToDelete.length} page(s).
                </p>
              </div>
              <a
                href={downloadUrl}
                download={`${file.name.replace(/\.pdf$/i, "")}-edited.pdf`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" /> Download Clean PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
