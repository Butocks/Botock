"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Hash,
  ArrowRight,
  Eye,
} from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function PdfPageNumbersClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  // Configuration
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left">("bottom-center");
  const [format, setFormat] = useState<"n" | "n-of-total" | "page-n" | "page-n-of-total">("n-of-total");
  const [startPage, setStartPage] = useState<number>(1);
  const [firstNumber, setFirstNumber] = useState<number>(1);
  const [margin, setMargin] = useState<number>(24);
  const [fontSize, setFontSize] = useState<number>(11);
  const [fontColor, setFontColor] = useState<string>("#475569");

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultBlobSize, setResultBlobSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
        setError("Please upload a valid PDF document.");
        return;
      }
      setError(null);
      setFile(selectedFile);
      setResultPdfUrl(null);

      try {
        const buffer = await selectedFile.arrayBuffer();
        const loadedDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        setPdfDoc(loadedDoc);
        setPageCount(loadedDoc.getPageCount());
      } catch (err: any) {
        setError("Failed to parse PDF: " + (err.message || "File might be corrupted or encrypted."));
      }
    }
  };

  const handleApplyNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;

      // Hex to RGB
      const r = parseInt(fontColor.slice(1, 3), 16) / 255;
      const g = parseInt(fontColor.slice(3, 5), 16) / 255;
      const b = parseInt(fontColor.slice(5, 7), 16) / 255;
      const color = rgb(r, g, b);

      for (let i = 0; i < pages.length; i++) {
        const pageNum = i + 1;
        if (pageNum < startPage) continue;

        const currentNum = firstNumber + (pageNum - startPage);
        let text = "";
        switch (format) {
          case "n":
            text = `${currentNum}`;
            break;
          case "n-of-total":
            text = `${currentNum} / ${total}`;
            break;
          case "page-n":
            text = `Page ${currentNum}`;
            break;
          case "page-n-of-total":
            text = `Page ${currentNum} of ${total}`;
            break;
        }

        const page = pages[i];
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.sizeAtHeight(fontSize);

        let x = 0;
        let y = 0;

        // Position calculations
        if (position.includes("center")) {
          x = (width - textWidth) / 2;
        } else if (position.includes("left")) {
          x = margin;
        } else if (position.includes("right")) {
          x = width - textWidth - margin;
        }

        if (position.startsWith("top")) {
          y = height - margin - textHeight;
        } else {
          y = margin;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color,
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultPdfUrl(url);
      setResultBlobSize(blob.size);
    } catch (err: any) {
      setError(err.message || "Failed to stamp page numbers onto PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPreviewText = () => {
    switch (format) {
      case "n":
        return `${firstNumber}`;
      case "n-of-total":
        return `${firstNumber} / ${pageCount || 10}`;
      case "page-n":
        return `Page ${firstNumber}`;
      case "page-n-of-total":
        return `Page ${firstNumber} of ${pageCount || 10}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Hash className="w-3.5 h-3.5" />
            PDF Numbering Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Add Page Numbers to PDF
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Insert customizable headers, footers, and page numbers into your PDF. Position anywhere with custom formats and typography.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          /* Upload Stage */
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="pdf-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-rose-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select or drop your PDF document
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Client-side execution: Your PDF never leaves your device. Zero cloud uploads.
              </p>
              <span className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-600/25 transition">
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
          /* Editor Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Preview Pane */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className="font-medium text-slate-200 truncate max-w-xs">{file.name}</span>
                  </div>
                  <span>{pageCount} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                {/* Simulated Visual Sheet Preview */}
                <div className="relative w-64 h-90 bg-white rounded-lg shadow-2xl border border-slate-300 p-4 flex flex-col justify-between text-slate-900 my-4 select-none">
                  {/* Top Bar Preview */}
                  <div className="flex justify-between items-start text-[10px] w-full min-h-[14px]">
                    <div className="w-1/3 text-left">
                      {position === "top-left" && (
                        <span style={{ color: fontColor, fontSize: `${fontSize}px` }} className="font-medium">
                          {getPreviewText()}
                        </span>
                      )}
                    </div>
                    <div className="w-1/3 text-center">
                      {position === "top-center" && (
                        <span style={{ color: fontColor, fontSize: `${fontSize}px` }} className="font-medium">
                          {getPreviewText()}
                        </span>
                      )}
                    </div>
                    <div className="w-1/3 text-right">
                      {position === "top-right" && (
                        <span style={{ color: fontColor, fontSize: `${fontSize}px` }} className="font-medium">
                          {getPreviewText()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dummy Page Content Mockup */}
                  <div className="space-y-2 opacity-25 pointer-events-none">
                    <div className="w-3/4 h-2 bg-slate-400 rounded" />
                    <div className="w-full h-1.5 bg-slate-300 rounded" />
                    <div className="w-5/6 h-1.5 bg-slate-300 rounded" />
                    <div className="w-4/5 h-1.5 bg-slate-300 rounded" />
                    <div className="w-full h-1.5 bg-slate-300 rounded" />
                    <div className="w-2/3 h-1.5 bg-slate-300 rounded" />
                  </div>

                  {/* Bottom Bar Preview */}
                  <div className="flex justify-between items-end text-[10px] w-full min-h-[14px]">
                    <div className="w-1/3 text-left">
                      {position === "bottom-left" && (
                        <span style={{ color: fontColor, fontSize: `${fontSize}px` }} className="font-medium">
                          {getPreviewText()}
                        </span>
                      )}
                    </div>
                    <div className="w-1/3 text-center">
                      {position === "bottom-center" && (
                        <span style={{ color: fontColor, fontSize: `${fontSize}px` }} className="font-medium">
                          {getPreviewText()}
                        </span>
                      )}
                    </div>
                    <div className="w-1/3 text-right">
                      {position === "bottom-right" && (
                        <span style={{ color: fontColor, fontSize: `${fontSize}px` }} className="font-medium">
                          {getPreviewText()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400 mt-2">
                  Live preview simulation showing placement & format
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setResultPdfUrl(null);
                  }}
                  className="mt-6 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Choose another file
                </button>
              </div>
            </div>

            {/* Right Options Sidebar */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
                  Position on Page
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "top-left", label: "Top Left" },
                    { id: "top-center", label: "Top Center" },
                    { id: "top-right", label: "Top Right" },
                    { id: "bottom-left", label: "Bottom Left" },
                    { id: "bottom-center", label: "Bottom Center" },
                    { id: "bottom-right", label: "Bottom Right" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPosition(p.id as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${
                        position === p.id
                          ? "bg-rose-600/20 border-rose-500 text-rose-300 font-semibold"
                          : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numbering Format */}
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
                  Numbering Format
                </h3>
                <div className="space-y-2">
                  {[
                    { id: "n-of-total", label: `Page Number of Total (e.g. 1 / ${pageCount || 10})` },
                    { id: "page-n-of-total", label: `Page X of Y (e.g. Page 1 of ${pageCount || 10})` },
                    { id: "n", label: "Single Number (e.g. 1)" },
                    { id: "page-n", label: "Prefix Page (e.g. Page 1)" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id as any)}
                      className={`w-full text-left py-2 px-3 text-xs rounded-lg border transition ${
                        format === f.id
                          ? "bg-rose-600/20 border-rose-500 text-rose-300 font-semibold"
                          : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Start from page</label>
                  <input
                    type="number"
                    min={1}
                    max={pageCount || 1000}
                    value={startPage}
                    onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">First number shown</label>
                  <input
                    type="number"
                    min={1}
                    value={firstNumber}
                    onChange={(e) => setFirstNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Margin ({margin}px)</label>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Font Size ({fontSize}pt)</label>
                  <input
                    type="range"
                    min={8}
                    max={20}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>

              {/* Process / Download Button */}
              {!resultPdfUrl ? (
                <button
                  onClick={handleApplyNumbers}
                  disabled={isProcessing}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying Page Numbers...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Apply Page Numbers
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <a
                    href={resultPdfUrl}
                    download={`numbered-${file.name}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Numbered PDF ({(resultBlobSize / 1024 / 1024).toFixed(2)} MB)
                  </a>
                  <button
                    onClick={() => setResultPdfUrl(null)}
                    className="w-full py-2 text-xs text-slate-400 hover:text-white transition text-center"
                  >
                    Adjust settings & reapply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              Page numbers are stamped natively in your browser using WebAssembly. Your documents are never sent over the internet.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Custom Format & Ranges</h4>
            <p className="text-xs text-slate-400">
              Skip title pages or cover sheets by setting a starting offset. Choose between Page X of Y, simple digits, or custom prefixes.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Retains PDF Quality</h4>
            <p className="text-xs text-slate-400">
              No re-compression or rasterization. All vector texts, form fields, and original resolution are preserved completely intact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
