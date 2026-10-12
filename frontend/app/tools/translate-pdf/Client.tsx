"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import {
  Languages,
  FileText,
  Download,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeftRight,
  Eye,
  RefreshCw,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Edit3,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { copyToClipboard } from "@/lib/utils/clipboard";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "id", name: "Indonesian (Bahasa Indonesia)" },
];

interface PageTranslation {
  pageNum: number;
  originalText: string;
  paragraphs: string[];
  translatedParagraphs: string[];
}

export default function TranslatePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pages, setPages] = useState<PageTranslation[]>([]);
  const [totalWords, setTotalWords] = useState<number>(0);

  // Translation settings
  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [pageRangeMode, setPageRangeMode] = useState<"all" | "custom">("all");
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);

  // Processing states
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationProgress, setTranslationProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);

  // Active view states
  const [activeTab, setActiveTab] = useState<"dual" | "preview" | "edit">("dual");
  const [currentPageView, setCurrentPageView] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setErrorMsg(null);
      setPages([]);
      setHasTranslated(false);
      setIsExtracting(true);
      setStatusMessage("Extracting text and structure from PDF pages...");

      try {
        const buffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        const totalP = pdf.numPages;
        setPageCount(totalP);
        setStartPage(1);
        setEndPage(Math.min(totalP, 10));

        const extractedPages: PageTranslation[] = [];
        let totalWordAccum = 0;

        for (let i = 1; i <= totalP; i++) {
          setStatusMessage(`Extracting page ${i} of ${totalP}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          // Group items by line and structure into paragraphs
          let rawText = "";
          let lastY: number | null = null;
          const lines: string[] = [];
          let currentLine = "";

          for (const item of textContent.items as any[]) {
            const str = item.str || "";
            const currentY = item.transform ? item.transform[5] : null;

            if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
              if (currentLine.trim()) lines.push(currentLine.trim());
              currentLine = str;
            } else {
              currentLine += (currentLine ? " " : "") + str;
            }
            lastY = currentY;
          }
          if (currentLine.trim()) lines.push(currentLine.trim());

          rawText = lines.join("\n");

          // Form coherent paragraphs (group lines into blocks)
          const paragraphs: string[] = [];
          let currentParagraph = "";

          for (const line of lines) {
            if (!line.trim()) {
              if (currentParagraph.trim()) {
                paragraphs.push(currentParagraph.trim());
                currentParagraph = "";
              }
            } else {
              currentParagraph += (currentParagraph ? " " : "") + line;
              if (/[.?!]$/.test(line.trim()) || currentParagraph.length > 300) {
                paragraphs.push(currentParagraph.trim());
                currentParagraph = "";
              }
            }
          }
          if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim());
          }

          // Fallback if paragraphs is empty
          const finalParagraphs =
            paragraphs.length > 0
              ? paragraphs
              : rawText.split(/\n\n+/).filter((p) => p.trim().length > 0);

          totalWordAccum += rawText
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;

          extractedPages.push({
            pageNum: i,
            originalText: rawText,
            paragraphs: finalParagraphs.length > 0 ? finalParagraphs : [rawText || "(No readable text)"],
            translatedParagraphs: [],
          });
        }

        setPages(extractedPages);
        setTotalWords(totalWordAccum);
        setCurrentPageView(1);
      } catch (err: any) {
        setErrorMsg("Failed to read PDF document: " + (err.message || String(err)));
      } finally {
        setIsExtracting(false);
        setStatusMessage("");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const resetAll = () => {
    setFile(null);
    setPageCount(0);
    setPages([]);
    setTotalWords(0);
    setErrorMsg(null);
    setHasTranslated(false);
    setCurrentPageView(1);
    setTranslationProgress(0);
  };

  const swapLanguages = () => {
    if (sourceLang !== "auto") {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
  };

  // Perform translation
  const handleTranslate = async () => {
    if (pages.length === 0) return;

    setIsTranslating(true);
    setTranslationProgress(0);
    setErrorMsg(null);

    const fromP = pageRangeMode === "custom" ? Math.max(1, startPage) : 1;
    const toP = pageRangeMode === "custom" ? Math.min(pageCount, endPage) : pageCount;
    const totalToTranslate = toP - fromP + 1;

    try {
      const updatedPages = [...pages];

      for (let pIdx = fromP - 1; pIdx < toP; pIdx++) {
        const page = updatedPages[pIdx];
        setStatusMessage(`Translating page ${pIdx + 1} of ${pageCount}...`);

        const translatedChunks: string[] = [];

        // Translate in batch per page
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: page.paragraphs,
              sourceLang,
              targetLang,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.translations && Array.isArray(data.translations)) {
              translatedChunks.push(...data.translations);
            }
          }
        } catch (apiErr) {
          console.warn("Server translation route failed, trying direct browser fallback...", apiErr);
        }

        // Direct fallback if server route failed or returned incomplete
        if (translatedChunks.length < page.paragraphs.length) {
          for (let i = translatedChunks.length; i < page.paragraphs.length; i++) {
            const para = page.paragraphs[i];
            try {
              const langpair = `${sourceLang === "auto" ? "autodetect" : sourceLang}|${targetLang}`;
              const directRes = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
                  para.slice(0, 450)
                )}&langpair=${encodeURIComponent(langpair)}`
              );
              if (directRes.ok) {
                const d = await directRes.json();
                translatedChunks.push(d?.responseData?.translatedText || para);
              } else {
                translatedChunks.push(para);
              }
            } catch {
              translatedChunks.push(para);
            }
          }
        }

        page.translatedParagraphs = translatedChunks;
        const currentDone = pIdx - fromP + 2;
        setTranslationProgress(Math.round((currentDone / totalToTranslate) * 100));
      }

      setPages(updatedPages);
      setHasTranslated(true);
      setCurrentPageView(fromP);
    } catch (err: any) {
      setErrorMsg("Translation interrupted: " + (err.message || String(err)));
    } finally {
      setIsTranslating(false);
      setStatusMessage("");
    }
  };

  // Update a translated paragraph in editable mode
  const handleEditParagraph = (pageIdx: number, paraIdx: number, newText: string) => {
    setPages((prev) => {
      const copy = [...prev];
      if (copy[pageIdx] && copy[pageIdx].translatedParagraphs) {
        copy[pageIdx].translatedParagraphs[paraIdx] = newText;
      }
      return copy;
    });
  };

  // Export 1: Generate Clean Translated PDF
  const handleDownloadTranslatedPdf = () => {
    if (pages.length === 0) return;

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const targetLangName =
      SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let isFirstDocPage = true;

    pages.forEach((page) => {
      const paragraphsToPrint =
        page.translatedParagraphs.length > 0
          ? page.translatedParagraphs
          : page.paragraphs;

      if (!isFirstDocPage) {
        doc.addPage();
      }
      isFirstDocPage = false;

      // Header Banner
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Translated Document (${targetLangName}) • Page ${page.pageNum}`,
        margin,
        15
      );
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 18, pageWidth - margin, 18);

      let currentY = 28;

      paragraphsToPrint.forEach((para) => {
        if (!para.trim()) return;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);

        const lines = doc.splitTextToSize(para, contentWidth);
        const blockHeight = lines.length * 6;

        if (currentY + blockHeight > pageHeight - margin) {
          doc.addPage();
          currentY = 25;
        }

        doc.text(lines, margin, currentY);
        currentY += blockHeight + 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Botock PDF Translator — https://botock.app`,
        margin,
        pageHeight - 10
      );
    });

    const baseName = file?.name.replace(/\.pdf$/i, "") || "document";
    doc.save(`${baseName}-${targetLang}.pdf`);
  };

  // Export 2: Generate Bilingual Side-by-Side / Alternate PDF
  const handleDownloadBilingualPdf = () => {
    if (pages.length === 0) return;

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const targetLangName =
      SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let isFirstDocPage = true;

    pages.forEach((page) => {
      if (!isFirstDocPage) doc.addPage();
      isFirstDocPage = false;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Bilingual Document (Original & ${targetLangName}) — Page ${page.pageNum}`,
        margin,
        15
      );
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 18, pageWidth - margin, 18);

      let currentY = 28;

      page.paragraphs.forEach((orig, idx) => {
        const trans = page.translatedParagraphs[idx] || orig;

        // Original paragraph
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        const origLines = doc.splitTextToSize(`[Original] ${orig}`, contentWidth);
        const origHeight = origLines.length * 5;

        // Translated paragraph
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        const transLines = doc.splitTextToSize(`[${targetLangName}] ${trans}`, contentWidth);
        const transHeight = transLines.length * 5.5;

        if (currentY + origHeight + transHeight + 8 > pageHeight - margin) {
          doc.addPage();
          currentY = 25;
        }

        doc.text(origLines, margin, currentY);
        currentY += origHeight + 3;

        doc.text(transLines, margin, currentY);
        currentY += transHeight + 8;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Botock PDF Translator — https://botock.app`,
        margin,
        pageHeight - 10
      );
    });

    const baseName = file?.name.replace(/\.pdf$/i, "") || "document";
    doc.save(`${baseName}-bilingual.pdf`);
  };

  // Export 3: Copy full translated text
  const handleCopyTranslatedText = () => {
    const fullText = pages
      .map((p) => {
        const lines =
          p.translatedParagraphs.length > 0
            ? p.translatedParagraphs.join("\n\n")
            : p.paragraphs.join("\n\n");
        return `--- Page ${p.pageNum} ---\n${lines}`;
      })
      .join("\n\n\n");

    copyToClipboard(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export 4: Download TXT file
  const handleDownloadTxt = () => {
    const fullText = pages
      .map((p) => {
        const lines =
          p.translatedParagraphs.length > 0
            ? p.translatedParagraphs.join("\n\n")
            : p.paragraphs.join("\n\n");
        return `--- Page ${p.pageNum} ---\n${lines}`;
      })
      .join("\n\n\n");

    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, "")}-${targetLang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activePageObj = pages[currentPageView - 1];

  return (
    <div className="w-full bg-[#080b0f] text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Tool Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            <Languages className="w-4 h-4" />
            <span>AI Multi-Language Document Translation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Translate PDF Documents Online Free
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Translate PDF files into 18+ international languages. Maintain formatting, view synchronized side-by-side comparisons, and download translated or bilingual PDFs.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Translation Notice</p>
              <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs text-rose-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Zone */}
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
              isDragActive
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                : "border-slate-800 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/70"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
              <Languages className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Choose or Drop PDF Document to Translate
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
              Upload any PDF report, contract, research paper, or manual to translate into Spanish, French, German, Japanese, and more.
            </p>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md">
              <FileText className="w-4 h-4" />
              <span>Select PDF File</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              Private client extraction • Preserves document page structure
            </p>
          </div>
        ) : (
          /* Active Translation Workbench */
          <div className="space-y-6">
            {/* Top Document Summary & Controls */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">{pageCount} Pages</span>
                    <span>•</span>
                    <span>~{totalWords.toLocaleString()} Words</span>
                  </p>
                </div>
              </div>

              {/* Language Selection Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Source Lang */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                  <span className="text-slate-400 text-[11px]">From:</span>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="auto">Auto Detect</option>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap button */}
                <button
                  onClick={swapLanguages}
                  disabled={sourceLang === "auto"}
                  title="Swap languages"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>

                {/* Target Lang */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                  <span className="text-slate-400 text-[11px]">To:</span>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset button */}
                <button
                  onClick={resetAll}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Translation Settings & Trigger Panel */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">
                    Scope:
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="pageMode"
                      checked={pageRangeMode === "all"}
                      onChange={() => setPageRangeMode("all")}
                      className="accent-blue-500"
                    />
                    <span>All Pages (1-{pageCount})</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="pageMode"
                      checked={pageRangeMode === "custom"}
                      onChange={() => setPageRangeMode("custom")}
                      className="accent-blue-500"
                    />
                    <span>Custom Range</span>
                  </label>
                </div>

                {pageRangeMode === "custom" && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Pages:</span>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={startPage}
                      onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center text-white"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={endPage}
                      onChange={(e) =>
                        setEndPage(Math.min(pageCount, parseInt(e.target.value) || 1))
                      }
                      className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center text-white"
                    />
                  </div>
                )}
              </div>

              {/* Translation Progress or Trigger */}
              {isTranslating ? (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{statusMessage || "Translating content..."}</span>
                    </span>
                    <span className="text-white font-bold">{translationProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                      style={{ width: `${translationProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleTranslate}
                  disabled={isExtracting}
                  className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {hasTranslated ? "Re-translate with Selected Settings" : "Translate PDF Document"}
                  </span>
                </button>
              )}
            </div>

            {/* Results Workbench (Tabs & Views) */}
            {pages.length > 0 && (
              <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden space-y-0">
                {/* View Mode Tabs & Page Navigator Header */}
                <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Tabs */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setActiveTab("dual")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "dual"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Side-by-Side Dual View</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "preview"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Translated Preview</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeTab === "edit"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editor</span>
                    </button>
                  </div>

                  {/* Page Pagination Controls */}
                  <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
                    <button
                      onClick={() => setCurrentPageView((p) => Math.max(1, p - 1))}
                      disabled={currentPageView <= 1}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-slate-300 font-medium">
                      Page {currentPageView} of {pageCount}
                    </span>
                    <button
                      onClick={() => setCurrentPageView((p) => Math.min(pageCount, p + 1))}
                      disabled={currentPageView >= pageCount}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 sm:p-6 min-h-[380px]">
                  {/* Tab 1: Side by side */}
                  {activeTab === "dual" && activePageObj && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Original Text */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            Original Text (Page {activePageObj.pageNum})
                          </span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {activePageObj.paragraphs.map((para, idx) => (
                            <p
                              key={idx}
                              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed select-text"
                            >
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Right: Translated Text */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Languages className="w-3.5 h-3.5 text-blue-400" />
                            Translated (
                            {SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name ||
                              targetLang}
                            )
                          </span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {activePageObj.translatedParagraphs.length > 0 ? (
                            activePageObj.translatedParagraphs.map((para, idx) => (
                              <p
                                key={idx}
                                className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed select-text"
                              >
                                {para}
                              </p>
                            ))
                          ) : (
                            <div className="p-8 text-center text-slate-500 text-xs rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                              Click &quot;Translate PDF Document&quot; above to generate translation for this page.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Full Translated Preview */}
                  {activeTab === "preview" && activePageObj && (
                    <div className="max-w-3xl mx-auto space-y-4">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Page {activePageObj.pageNum} — Full Translated View
                          </h3>
                        </div>
                        <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed select-text">
                          {(activePageObj.translatedParagraphs.length > 0
                            ? activePageObj.translatedParagraphs
                            : activePageObj.paragraphs
                          ).map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Editor */}
                  {activeTab === "edit" && activePageObj && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400">
                        Edit translated paragraphs inline before exporting to PDF:
                      </p>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {activePageObj.paragraphs.map((orig, idx) => {
                          const transVal =
                            activePageObj.translatedParagraphs[idx] !== undefined
                              ? activePageObj.translatedParagraphs[idx]
                              : orig;
                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                            >
                              <p className="text-[11px] text-slate-400 italic">
                                Original: {orig}
                              </p>
                              <textarea
                                value={transVal}
                                onChange={(e) =>
                                  handleEditParagraph(
                                    currentPageView - 1,
                                    idx,
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Export & Actions Footer */}
                <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Download Translated PDF */}
                    <button
                      onClick={handleDownloadTranslatedPdf}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Translated PDF</span>
                    </button>

                    {/* Download Bilingual PDF */}
                    <button
                      onClick={handleDownloadBilingualPdf}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download Bilingual PDF</span>
                    </button>

                    {/* Copy Text */}
                    <button
                      onClick={handleCopyTranslatedText}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>

                    {/* Download TXT */}
                    <button
                      onClick={handleDownloadTxt}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>.TXT</span>
                    </button>
                  </div>

                  <button
                    onClick={resetAll}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Translate another PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
