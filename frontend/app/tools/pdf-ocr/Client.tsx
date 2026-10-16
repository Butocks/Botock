"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Globe,
} from "lucide-react";
import { processPdfOcr, OCRPageResult, OCRProgress } from "@/lib/pdf/pdfOcrHelper";

const LANGUAGES = [
  { code: "eng", name: "English" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "ita", name: "Italian" },
  { code: "por", name: "Portuguese" },
];

export default function PdfOcrClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("eng");
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [progressInfo, setProgressInfo] = useState<OCRProgress>({
    currentPage: 0,
    totalPages: 0,
    status: "",
    progress: 0,
  });
  const [fullText, setFullText] = useState<string>("");
  const [pagesResult, setPagesResult] = useState<OCRPageResult[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFullText("");
      setPagesResult([]);
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleStartOcr = async () => {
    if (!selectedFile) return;

    setStatus("processing");
    setErrorMessage("");

    try {
      const result = await processPdfOcr(selectedFile, language, (progress) => {
        setProgressInfo(progress);
      });

      setFullText(result.fullText);
      setPagesResult(result.pages);
      setStatus("completed");
    } catch (err: any) {
      console.error("PDF OCR error:", err);
      setErrorMessage(err?.message || "Failed to extract text from PDF. Please verify your file.");
      setStatus("error");
    }
  };

  const handleCopyText = async () => {
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleDownloadTxt = () => {
    if (!fullText || !selectedFile) return;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, "")}_ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setFullText("");
    setPagesResult([]);
    setStatus("idle");
    setErrorMessage("");
    setProgressInfo({ currentPage: 0, totalPages: 0, status: "", progress: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Upload Dropzone */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/80 hover:border-primary/80 bg-card/40 hover:bg-card/70 transition-all rounded-3xl p-10 sm:p-14 text-center cursor-pointer flex flex-col items-center justify-center gap-4 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Select or Drop Scanned PDF
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Extract text from scanned PDFs & book pages • 100% In-Browser Privacy
            </p>
          </div>
          <button
            type="button"
            className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:bg-primary/90 transition-all"
          >
            Select PDF Document
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors self-end sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>

          {/* OCR Language Selector */}
          <div className="p-4 rounded-2xl bg-card/60 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Globe className="w-4 h-4 text-primary" />
              <span>Document Recognition Language:</span>
            </div>
            <select
              value={language}
              disabled={status === "processing"}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Indicator */}
          {status === "processing" && (
            <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  {progressInfo.status || "Recognizing text on pages..."}
                </span>
                <span>
                  {progressInfo.totalPages > 0
                    ? `Page ${progressInfo.currentPage} of ${progressInfo.totalPages}`
                    : `${progressInfo.progress}%`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${
                      progressInfo.totalPages > 0
                        ? (progressInfo.currentPage / progressInfo.totalPages) * 100
                        : progressInfo.progress || 10
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Extracted Text Area */}
          {status === "completed" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Extracted Text ({pagesResult.length} Pages Recognized)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Text"}</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow hover:bg-primary/90 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .TXT</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={fullText}
                rows={12}
                className="w-full p-4 rounded-2xl bg-muted/20 border border-border/80 text-foreground font-mono text-xs leading-relaxed focus:outline-none select-all"
                placeholder="Extracted text will appear here..."
              />
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {status !== "completed" ? (
              <button
                onClick={handleStartOcr}
                disabled={status === "processing"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running Neural OCR...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Extract Text with OCR</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={resetAll}
                className="px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>OCR Another Document</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Trust & Guarantee */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>High-Accuracy Tesseract Neural OCR</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>100% Client-Side In-Browser Security</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          <span>Free .TXT & Clipboard Export</span>
        </div>
      </div>
    </div>
  );
}
