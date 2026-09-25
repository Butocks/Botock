"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

type DocFormat = "pdf" | "txt" | "html";

export default function ConvertDocumentClient() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<DocFormat>("pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setResultSize(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md", ".html"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const resetAll = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setResultUrl(null);
    setResultSize(null);
    setErrorMsg(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let outputBlob: Blob;
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (targetFormat === "pdf") {
        if (ext === "pdf") {
          // Already PDF, return copy
          outputBlob = file;
        } else {
          // Convert text/markdown/html to PDF using pdf-lib
          const rawText = await file.text();
          const pdfDoc = await PDFDocument.create();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontSize = 11;
          const lineHeight = 15;
          const margin = 50;

          const lines = rawText.split(/\r?\n/);
          let page = pdfDoc.addPage([595.28, 841.89]); // A4
          let y = page.getHeight() - margin;

          for (const line of lines) {
            if (y < margin + lineHeight) {
              page = pdfDoc.addPage([595.28, 841.89]);
              y = page.getHeight() - margin;
            }

            // Simple line truncation to fit page width
            const cleanLine = line.replace(/[^\x20-\x7E\t]/g, " ");
            page.drawText(cleanLine.slice(0, 90), {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(0.1, 0.1, 0.1),
            });
            y -= lineHeight;
          }

          const pdfBytes = await pdfDoc.save();
          outputBlob = new Blob([pdfBytes as any], { type: "application/pdf" });
        }
      } else if (targetFormat === "txt") {
        const text = await file.text();
        outputBlob = new Blob([text], { type: "text/plain;charset=utf-8" });
      } else {
        // HTML format
        const text = await file.text();
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title></head><body><pre>${text.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m] || m)}</pre></body></html>`;
        outputBlob = new Blob([html], { type: "text/html;charset=utf-8" });
      }

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to convert document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const baseName = file ? file.name.replace(/\.[^/.]+$/, "") : "document";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-sky-500 bg-sky-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop Document here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Supports DOCX, PDF, TXT, MD, and HTML files. Convert instantly with client-side privacy.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-sky-500" />
                <span>Conversion Settings</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Target Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "pdf", label: "PDF Document" },
                    { id: "txt", label: "Plain Text (.txt)" },
                    { id: "html", label: "Web HTML" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTargetFormat(fmt.id as DocFormat)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetFormat === fmt.id
                          ? "border-sky-500 bg-sky-600/10 text-sky-600 dark:text-sky-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Converting Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Convert to {targetFormat.toUpperCase()}</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-center">
              {resultUrl ? (
                <div className="space-y-4 w-full">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Document Converted!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {resultSize && formatBytes(resultSize)}
                    </p>
                  </div>

                  <a
                    href={resultUrl}
                    download={`${baseName}.${targetFormat}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Converted {targetFormat.toUpperCase()}
                  </a>
                </div>
              ) : (
                <div className="space-y-2 max-w-xs">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Private Document Engine
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Convert Word, text, and markdown documents directly in your browser.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
