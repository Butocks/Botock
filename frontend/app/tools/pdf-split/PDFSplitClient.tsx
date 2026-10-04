"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { FileUp, FileText, Download, Loader2, RefreshCcw, Layers, Check } from "lucide-react";
import { usePdfDocument } from "@/lib/pdf/usePdfDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";
import * as pdfjsLib from "pdfjs-dist";
import PDFPageThumbnail from "./PDFPageThumbnail";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFSplitClient() {
  const { file, pageCount, error: docError, loadFile, reset: resetDoc } = usePdfDocument();
  const { url: downloadUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  const [rangeMode, setRangeMode] = useState<"all" | "range">("range");
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFileName, setOutputFileName] = useState<string>("split-pages.pdf");
  const [actionError, setActionError] = useState<string | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const errorMessage = actionError || docError;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      resetDownload();

      const loadedDoc = await loadFile(acceptedFiles[0]);
      if (loadedDoc) {
        const total = loadedDoc.getPageCount();
        setFromPage(1);
        setToPage(Math.min(total, 1));
      }
      
      try {
        const arrayBuffer = await acceptedFiles[0].arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfProxy(doc);
      } catch (err) {
        console.error("Failed to render PDF thumbnails:", err);
      }
    },
    [loadFile, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handlePageClick = (pageNum: number) => {
    setRangeMode("range");
    if (fromPage === toPage && fromPage !== pageNum) {
      if (pageNum < fromPage) {
        setFromPage(pageNum);
      } else {
        setToPage(pageNum);
      }
    } else {
      setFromPage(pageNum);
      setToPage(pageNum);
    }
  };

  const handleSplit = async () => {
    if (!file || pageCount === 0) return;
    setIsProcessing(true);
    setActionError(null);

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
      setBlob(pdfBytes);

      setOutputFileName(
        rangeMode === "all"
          ? `${file.name.replace(/\.pdf$/i, "")}-pages.pdf`
          : `${file.name.replace(/\.pdf$/i, "")}-p${fromPage}-to-p${toPage}.pdf`
      );
    } catch (err: any) {
      console.error("Error splitting PDF:", err);
      setActionError(err.message || "Failed to split PDF. Check file security/permissions.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    resetDoc();
    resetDownload();
    setActionError(null);
    setPdfProxy(null);
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

          {/* Visual Page Grid */}
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span className="uppercase tracking-wider">Visual Page Selector</span>
              {rangeMode === "range" && (
                <span className="text-[10px] font-normal bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 px-2 py-1 rounded">
                  Pages {fromPage} to {toPage}
                </span>
              )}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-4 border border-slate-200 dark:border-white/[0.08] rounded-xl bg-slate-50/50 dark:bg-[#09090b]/50">
              {Array.from({ length: pageCount }).map((_, idx) => {
                const pageNum = idx + 1;
                const isSelected = rangeMode === "all" || (pageNum >= fromPage && pageNum <= toPage);
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    className={`relative aspect-[3/4] rounded-xl flex flex-col items-center justify-center overflow-hidden border-2 transition-all shadow-sm ${
                      isSelected 
                        ? "border-violet-500 shadow-md scale-[1.02]" 
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121215] opacity-50 hover:opacity-100 hover:border-violet-300"
                    }`}
                  >
                    {pdfProxy ? (
                       <div className="w-full h-full">
                         <PDFPageThumbnail pdf={pdfProxy} pageNum={pageNum} width={120} />
                       </div>
                    ) : (
                       <FileText className={`w-8 h-8 mb-2 ${isSelected ? "text-violet-500" : "text-slate-300"}`} />
                    )}
                    
                    {/* Number Badge */}
                    <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${isSelected ? "bg-violet-500 text-white" : "bg-white/80 dark:bg-black/60 backdrop-blur-sm text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700"}`}>
                      Pg {pageNum}
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-violet-500 rounded-full p-0.5 text-white shadow">
                         <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Tip: Click on a page to select it. Click another page to select a range.
            </p>
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
