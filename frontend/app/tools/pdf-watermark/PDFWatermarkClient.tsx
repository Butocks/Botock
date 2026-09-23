"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import {
  FileText,
  Download,
  Loader2,
  RefreshCcw,
  Stamp,
  Sliders,
  Type,
  Palette,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { usePdfDocument } from "@/lib/pdf/usePdfDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

// ─── Color Presets ───────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { hex: "#e11d48", name: "Red" },
  { hex: "#2563eb", name: "Blue" },
  { hex: "#059669", name: "Green" },
  { hex: "#4b5563", name: "Gray" },
  { hex: "#7c3aed", name: "Purple" },
  { hex: "#000000", name: "Black" },
];

// ─── Text Presets ────────────────────────────────────────────────────────────
const TEXT_PRESETS = ["CONFIDENTIAL", "DRAFT", "DO NOT COPY", "SAMPLE", "APPROVED", "INTERNAL USE"];

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

export default function PDFWatermarkClient() {
  // ─── Shared hooks ───────────────────────────────────────────────────────────
  const { file, pageCount, error: docError, loadFile, reset: resetDoc } = usePdfDocument();
  const { url: downloadUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  // ─── Watermark settings ─────────────────────────────────────────────────────
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotationAngle, setRotationAngle] = useState<number>(45);
  const [colorHex, setColorHex] = useState<string>("#e11d48");

  // ─── Processing state ───────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const errorMessage = actionError || docError;

  // ─── Drop handler ────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      resetDownload();
      await loadFile(acceptedFiles[0]);
    },
    [loadFile, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  // ─── Apply watermark ─────────────────────────────────────────────────────────
  const handleApplyWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setActionError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      const markColor = hexToRgb(colorHex);

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: markColor,
          opacity: Math.max(0.05, Math.min(opacity, 1)),
          rotate: degrees(rotationAngle),
        });
      }

      const pdfBytes = await pdfDoc.save();
      setBlob(pdfBytes, "application/pdf");
    } catch (err: unknown) {
      console.error("Watermark failed:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to stamp watermark onto PDF."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Reset ───────────────────────────────────────────────────────────────────
  const resetAll = () => {
    resetDoc();
    resetDownload();
    setActionError(null);
    setWatermarkText("CONFIDENTIAL");
    setFontSize(48);
    setOpacity(0.3);
    setRotationAngle(45);
    setColorHex("#e11d48");
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        /* ─── Drop Zone ──────────────────────────────────────────────────── */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-rose-500 bg-rose-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-rose-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stamp className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF to add a watermark
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Stamp custom text overlays across all pages, 100% in your browser.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Click or drag a PDF here</span>
          </div>
        </div>
      ) : (
        /* ─── Main Editor ────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Controls ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-sm">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount} page(s)
                  </p>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Choose another
              </button>
            </div>

            {/* Watermark Text */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-rose-500" />
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Watermark Text
                </label>
              </div>

              {/* Text Presets */}
              <div className="flex flex-wrap gap-2">
                {TEXT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWatermarkText(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      watermarkText === preset
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "border-slate-200 dark:border-white/[0.08] bg-white dark:bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.15]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Or type a custom watermark..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-500" />
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Watermark Color
                </label>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => setColorHex(c.hex)}
                    className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                      colorHex === c.hex
                        ? "scale-110 border-slate-800 dark:border-white shadow-md"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {/* Custom color picker */}
                <div className="relative w-9 h-9">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Custom color"
                  />
                  <div
                    className="w-9 h-9 rounded-full border-2 border-dashed border-slate-400 dark:border-white/[0.3] flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold overflow-hidden"
                    style={{ backgroundColor: colorHex }}
                  />
                </div>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 col-span-full mb-1">
                <Sliders className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Style Settings
                </span>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Font Size</label>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={120}
                  step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                  className="w-full accent-rose-500 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>16px</span>
                  <span>120px</span>
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Opacity</label>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value) || 0.3)}
                  className="w-full accent-rose-500 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Subtle (5%)</span>
                  <span>Strong (90%)</span>
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2 col-span-full">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-rose-400" /> Rotation Angle
                  </label>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {rotationAngle}°
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[0, 30, 45, 90, -45].map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => setRotationAngle(angle)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        rotationAngle === angle
                          ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={5}
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* ── Right: Preview & Action ──────────────────────────────────── */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8 gap-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stamp className="w-4 h-4 text-rose-500" /> Watermark Preview
            </h3>

            {/* Live Watermark Preview */}
            <div
              className="relative rounded-2xl border border-slate-200 dark:border-white/[0.1] overflow-hidden flex items-center justify-center min-h-[260px] bg-white dark:bg-[#09090b]"
            >
              {/* PDF page mock */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <div className="w-full max-w-[200px] aspect-[210/297] bg-slate-50 dark:bg-[#1a1a1f] rounded-lg shadow-lg border border-slate-200 dark:border-white/[0.08] flex items-center justify-center relative overflow-hidden">
                  {/* Fake PDF lines */}
                  <div className="absolute inset-4 space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded bg-slate-200 dark:bg-white/[0.05]"
                        style={{ width: `${70 + Math.sin(i) * 20}%` }}
                      />
                    ))}
                  </div>
                  {/* Watermark overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ transform: `rotate(${rotationAngle}deg)` }}
                  >
                    <span
                      className="font-black whitespace-nowrap select-none"
                      style={{
                        color: colorHex,
                        opacity: opacity,
                        fontSize: `${Math.min(fontSize * 0.35, 28)}px`,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {watermarkText || "WATERMARK"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-[#09090b]/80 px-2 py-0.5 rounded-md">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Page Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pages to watermark:</span>
                <span className="font-bold text-slate-900 dark:text-white">{pageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Text:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {watermarkText || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Opacity:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing || !watermarkText.trim()}
                className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Applying...
                  </>
                ) : (
                  <>
                    <Stamp className="w-4 h-4" /> Apply to All Pages
                  </>
                )}
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-sm font-semibold transition-colors cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Download Result */}
            {downloadUrl && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      Watermark Applied!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      &ldquo;{watermarkText}&rdquo; stamped on all {pageCount} pages.
                    </p>
                  </div>
                </div>
                <a
                  href={downloadUrl}
                  download={`${file.name.replace(/\.pdf$/i, "")}-watermarked.pdf`}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition-all inline-flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Watermarked PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
