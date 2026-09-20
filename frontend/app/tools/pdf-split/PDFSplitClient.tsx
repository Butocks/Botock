"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { FileUp, FileText, Download, Loader2, RefreshCcw, Layers } from "lucide-react";

export default function PDFSplitClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rangeMode, setRangeMode] = useState<"all" | "range">("range");
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>("split-pages.pdf");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const selected = acceptedFiles[0];
    setFile(selected);
    setErrorMessage(null);
    setDownloadUrl(null);

    try {
      const buffer = await selected.arrayBuffer();
      const loadedDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const total = loadedDoc.getPageCount();
      setPageCount(total);
      setFromPage(1);
      setToPage(Math.min(total, 1));
    } catch (err: any) {
      console.error("Could not read PDF metadata:", err);
      setErrorMessage("Could not inspect PDF. It may be password protected or corrupted.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleSplit = async () => {
    if (!file || pageCount === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      let targetIndices: number[] = [];
      if (rangeMode === "all") {
        targetIndices = Array.from({ length: pageCount }, (_, i) => i);
      } else {
        const start = Math.max(1, Math.min(fromPage, pageCount)) - 1;
        const end = Math.max(start + 1, Math.min(toPage, pageCount));
        for (let i = start; i < end; i++) {
          targetIndices.push(i);
        }
      }

      if (targetIndices.length === 0) {
        throw new Error("No valid pages selected.");
      }

      const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(url);
      setOutputFileName(
        rangeMode === "all"
          ? `${file.name.replace(/\.pdf$/i, "")}-pages.pdf`
          : `${file.name.replace(/\.pdf$/i, "")}-p${fromPage}-to-p${toPage}.pdf`
      );
    } catch (err: any) {
      console.error("Error splitting PDF:", err);
      setErrorMessage(err.message || "Failed to split PDF. Check file security/permissions.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setFile(null);
    setPageCount(0);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

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
            <FileUp className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF file here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a PDF document to split into individual pages or ranges.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount} {pageCount === 1 ? "page" : "pages"} detected
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

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setRangeMode("range")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                rangeMode === "range"
                  ? "border-violet-500 bg-violet-500/5 dark:bg-violet-500/10"
                  : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-violet-500" />
                Custom Page Range
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Extract a sequential block of pages into a new clean document.
              </p>
              {rangeMode === "range" && (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">From Page</span>
                    <input
                      type="number"
                      min={1}
                      max={toPage}
                      value={fromPage}
                      onChange={(e) => setFromPage(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121215] text-xs font-bold"
                    />
                  </div>
                  <span className="mt-4 text-xs font-bold text-slate-400">to</span>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">To Page</span>
                    <input
                      type="number"
                      min={fromPage}
                      max={pageCount}
                      value={toPage}
                      onChange={(e) => setToPage(Math.min(pageCount, Math.max(fromPage, parseInt(e.target.value) || fromPage)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121215] text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div
              onClick={() => setRangeMode("all")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                rangeMode === "all"
                  ? "border-violet-500 bg-violet-500/5 dark:bg-violet-500/10"
                  : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-white">
                <FileText className="w-4 h-4 text-violet-500" />
                Keep All Detected Pages
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Creates a fresh reconstructed PDF containing all {pageCount} pages, stripping metadata and bad objects.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSplit}
              disabled={isProcessing || pageCount === 0}
              className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Extracting Pages...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" /> Extract & Save Pages
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
                  Extraction Complete!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Extracted {rangeMode === "all" ? pageCount : (toPage - fromPage + 1)} page(s) locally.
                </p>
              </div>
              <a
                href={downloadUrl}
                download={outputFileName}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" /> Download Extracted PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
