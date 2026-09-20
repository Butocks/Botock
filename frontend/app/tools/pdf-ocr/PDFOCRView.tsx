"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import { createWorker, type Worker as TesseractWorker } from "tesseract.js";
import { PDFDocument } from "pdf-lib";
import {
  renderPdfPageToCanvas,
  extractTextFromPage,
  type OCRPageResult,
} from "@/lib/pdf/pdfOcrHelper";
import {
  FileText,
  FileUp,
  Loader2,
  Copy,
  Check,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Languages,
  BookOpen,
  Sparkles,
  StopCircle,
} from "lucide-react";

// Configure pdfjs worker for browser environment
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

type SupportedLanguage = "eng" | "spa" | "fra" | "deu";

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "eng", name: "English", flag: "🇺🇸" },
  { code: "spa", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fra", name: "French (Français)", flag: "🇫🇷" },
  { code: "deu", name: "German (Deutsch)", flag: "🇩🇪" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function parsePageSelection(rangeStr: string, total: number): number[] {
  const clean = rangeStr.trim();
  if (!clean) return Array.from({ length: total }, (_, i) => i + 1);

  const selectedPages = new Set<number>();
  const tokens = clean.split(/[,;\s]+/);

  for (const token of tokens) {
    if (!token) continue;
    if (token.includes("-")) {
      const [startStr, endStr] = token.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(total, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          selectedPages.add(p);
        }
      }
    } else {
      const p = parseInt(token, 10);
      if (!isNaN(p) && p >= 1 && p <= total) {
        selectedPages.add(p);
      }
    }
  }

  const result = Array.from(selectedPages).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: total }, (_, i) => i + 1);
}

export default function PDFOCRView() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("eng");
  const [pageMode, setPageMode] = useState<"all" | "range">("all");
  const [pageRange, setPageRange] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>("");

  const [results, setResults] = useState<OCRPageResult[] | null>(null);
  const [editableText, setEditableText] = useState<string>("");
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedPageIndex, setCopiedPageIndex] = useState<number | null>(null);
  const [expandedPages, setExpandedPages] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const activeWorkerRef = useRef<TesseractWorker | null>(null);

  // Clean up worker and URLs on unmount
  useEffect(() => {
    return () => {
      cancelRef.current.cancelled = true;
      if (activeWorkerRef.current) {
        activeWorkerRef.current.terminate().catch(() => {});
      }
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const selected = acceptedFiles[0];
    setFile(selected);
    setError(null);
    setResults(null);
    setEditableText("");
    setProgressPercent(0);
    setProgressStatus("");

    try {
      const arrayBuffer = await selected.arrayBuffer();
      // Fast page count probe
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageCount(count);
      setPageRange(`1-${count}`);
    } catch (err: unknown) {
      console.warn("Failed to read page count via pdf-lib:", err);
      // If encrypted, notify user immediately
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("encrypted") || msg.includes("password")) {
        setError("This PDF is password-protected. Please unlock or remove password before OCR processing.");
      }
      setPageCount(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleReset = () => {
    cancelRef.current.cancelled = true;
    if (activeWorkerRef.current) {
      activeWorkerRef.current.terminate().catch(() => {});
      activeWorkerRef.current = null;
    }
    setFile(null);
    setPageCount(null);
    setResults(null);
    setEditableText("");
    setProgressPercent(0);
    setProgressStatus("");
    setError(null);
    setCopiedAll(false);
    setCopiedPageIndex(null);
  };

  const handleCancel = () => {
    cancelRef.current.cancelled = true;
    setProgressStatus("Cancelling extraction...");
    if (activeWorkerRef.current) {
      activeWorkerRef.current.terminate().catch(() => {});
      activeWorkerRef.current = null;
    }
    setIsProcessing(false);
  };

  const handleStartOcr = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgressPercent(0);
    setProgressStatus("Preparing PDF document...");
    cancelRef.current = { cancelled: false };

    let worker: TesseractWorker | null = null;

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Load with PDF.js
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      const totalDocPages = pdfDoc.numPages;

      const targetPages =
        pageMode === "all"
          ? Array.from({ length: totalDocPages }, (_, i) => i + 1)
          : parsePageSelection(pageRange, totalDocPages);

      if (targetPages.length === 0) {
        throw new Error("No valid pages selected for OCR extraction.");
      }

      setProgressStatus(`Initializing OCR engine (${language})...`);
      setProgressPercent(5);

      worker = await createWorker(language, 1, {
        logger: () => {},
      });
      activeWorkerRef.current = worker;

      const pageResults: OCRPageResult[] = [];
      const totalToProcess = targetPages.length;

      for (let i = 0; i < totalToProcess; i++) {
        if (cancelRef.current.cancelled) {
          break;
        }

        const pageNum = targetPages[i];
        const stepBase = Math.round((i / totalToProcess) * 90) + 5;
        setProgressPercent(stepBase);
        setProgressStatus(`Processing page ${pageNum} of ${totalDocPages}... ${stepBase}%`);

        // Render page at 2.0 scale (144 DPI) for high OCR accuracy
        const canvas = await renderPdfPageToCanvas(pdfDoc, pageNum, 2.0);

        if (cancelRef.current.cancelled) {
          canvas.width = 0;
          canvas.height = 0;
          break;
        }

        const extracted = await extractTextFromPage(canvas, language, undefined, worker);

        // Immediate memory cleanup
        canvas.width = 0;
        canvas.height = 0;

        pageResults.push({
          pageNumber: pageNum,
          text: extracted.text,
          confidence: extracted.confidence,
        });

        // Yield to browser main thread
        await new Promise((r) => setTimeout(r, 15));
      }

      if (!cancelRef.current.cancelled) {
        setProgressPercent(100);
        setProgressStatus("OCR extraction complete!");

        setResults(pageResults);
        const fullJoined = pageResults
          .map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`)
          .join("\n\n");
        setEditableText(fullJoined);

        // Initially expand first page accordion
        if (pageResults.length > 0) {
          setExpandedPages({ [pageResults[0].pageNumber]: true });
        }
      }
    } catch (err: unknown) {
      console.error("OCR execution failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("PasswordException") || msg.includes("password")) {
        setError("This PDF is password-protected. Please unlock the file before running OCR.");
      } else {
        setError(msg || "Failed to process PDF text extraction.");
      }
    } finally {
      if (worker) {
        await worker.terminate().catch(() => {});
        activeWorkerRef.current = null;
      }
      setIsProcessing(false);
    }
  };

  const handleCopyAll = async () => {
    if (!editableText) return;
    try {
      await navigator.clipboard.writeText(editableText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      console.warn("Clipboard write failed");
    }
  };

  const handleCopyPage = async (pageIndex: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPageIndex(pageIndex);
      setTimeout(() => setCopiedPageIndex(null), 2000);
    } catch {
      console.warn("Clipboard write failed");
    }
  };

  const handleDownloadTxt = () => {
    if (!editableText) return;
    const blob = new Blob([editableText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = file?.name ? file.name.replace(/\.pdf$/i, "") : "extracted-text";
    a.download = `${baseName}-ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePageAccordion = (pageNum: number) => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageNum]: !prev[pageNum],
    }));
  };

  // Word count & confidence metrics
  const totalWords = editableText.trim() ? editableText.trim().split(/\s+/).length : 0;
  const avgConfidence =
    results && results.length > 0
      ? Math.round(results.reduce((acc, curr) => acc + curr.confidence, 0) / results.length)
      : 0;

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {/* Upload Zone */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileUp className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your scanned PDF document here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Supports multi-page PDFs. Text is extracted locally using Tesseract OCR and WebAssembly without uploading to any server.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-slate-300">
            Click to browse files
          </div>
        </div>
      ) : (
        <div>
          {/* File Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>{formatBytes(file.size)}</span>
                  {pageCount !== null && (
                    <>
                      <span>•</span>
                      <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start Over
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Configuration Form (hidden while processing) */}
          {!results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Language Selection */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-violet-500" />
                  OCR Language
                </label>
                <select
                  value={language}
                  disabled={isProcessing}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-300 dark:border-white/[0.1] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Selecting the correct language significantly improves character recognition accuracy.
                </p>
              </div>

              {/* Page Range Selection */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                  Pages to Extract
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="pageMode"
                      value="all"
                      checked={pageMode === "all"}
                      disabled={isProcessing}
                      onChange={() => setPageMode("all")}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>All Pages {pageCount ? `(1-${pageCount})` : ""}</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="pageMode"
                      value="range"
                      checked={pageMode === "range"}
                      disabled={isProcessing}
                      onChange={() => setPageMode("range")}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>Custom Range</span>
                  </label>
                </div>

                {pageMode === "range" && (
                  <div>
                    <input
                      type="text"
                      placeholder={pageCount ? `e.g. 1-${Math.min(3, pageCount)} or 1, 3, 5` : "e.g. 1-3"}
                      value={pageRange}
                      disabled={isProcessing}
                      onChange={(e) => setPageRange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-300 dark:border-white/[0.1] text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Specify page numbers or ranges separated by commas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar & Processing Status */}
          {isProcessing && (
            <div className="mb-8 p-6 rounded-2xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-spin" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {progressStatus || "Extracting text with OCR..."}
                  </span>
                </div>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 dark:bg-white/[0.1] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
                >
                  <StopCircle className="w-4 h-4" /> Cancel Extraction
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!results && !isProcessing && (
            <button
              onClick={handleStartOcr}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Start OCR Text Extraction
            </button>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Summary Stats Header */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <div className="text-center">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Pages Extracted
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {results.length}
                  </span>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-white/[0.08]">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total Words
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {totalWords}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Avg. Confidence
                  </span>
                  <span
                    className={`text-xl font-black ${
                      avgConfidence >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : avgConfidence >= 60
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {avgConfidence}%
                  </span>
                </div>
              </div>

              {/* Unified Plain Text Editor */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#18181b]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.08] gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Editable Extracted Text
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.1] transition-colors"
                    >
                      {copiedAll ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy All
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download as .txt
                    </button>
                  </div>
                </div>

                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  rows={12}
                  className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-transparent border-0 focus:outline-none resize-y leading-relaxed"
                  placeholder="Extracted text will appear here..."
                />
              </div>

              {/* Page-by-Page Accordion */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Page Breakdown ({results.length})
                </h3>
                <div className="space-y-3">
                  {results.map((pageRes, idx) => {
                    const isExpanded = !!expandedPages[pageRes.pageNumber];
                    return (
                      <div
                        key={pageRes.pageNumber}
                        className="rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-[#18181b]"
                      >
                        <div
                          onClick={() => togglePageAccordion(pageRes.pageNumber)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              Page {pageRes.pageNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                pageRes.confidence >= 80
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : pageRes.confidence >= 60
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {pageRes.confidence}% confidence
                            </span>
                            <span className="text-xs text-slate-400 hidden sm:inline">
                              {pageRes.text.trim() ? pageRes.text.trim().split(/\s+/).length : 0} words
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPage(idx, pageRes.text);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors"
                              title="Copy this page's text"
                            >
                              {copiedPageIndex === idx ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-200 dark:border-white/[0.08]">
                            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
                              {pageRes.text || "(No text recognized on this page)"}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reset to process another file */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl border border-slate-300 dark:border-white/[0.1] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] text-sm transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Extract Another Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
