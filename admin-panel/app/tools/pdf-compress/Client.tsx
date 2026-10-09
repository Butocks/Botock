"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import {
  compressPdf,
  type CompressionPreset,
  type CompressionResult,
} from "@/lib/pdf/pdfCompressHelper";
import {
  FileText,
  FileUp,
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Minimize2,
  Image as ImageIcon,
  StopCircle,
  Info,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";

interface PresetCard {
  id: CompressionPreset;
  title: string;
  badge: string;
  badgeColor: string;
  quality: string;
  maxRes: string;
  description: string;
}

const PRESETS: PresetCard[] = [
  {
    id: "balanced",
    title: "Balanced",
    badge: "Recommended",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    quality: "65% Quality",
    maxRes: "1920px (1080p)",
    description: "Great balance of visual clarity and file size reduction. Ideal for everyday documents, invoices, and reports.",
  },
  {
    id: "maximum",
    title: "Maximum Compression",
    badge: "Smallest Size",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    quality: "45% Quality",
    maxRes: "1280px (720p)",
    description: "Aggressive image downscaling for maximum size savings. Perfect for email attachments and strict upload limits.",
  },
  {
    id: "high_quality",
    title: "High Quality",
    badge: "Low Compression",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    quality: "80% Quality",
    maxRes: "2560px (2K)",
    description: "Preserves sharp image detail with moderate compression. Best for portfolios, photo-heavy PDFs, and presentations.",
  },
];

export default function PdfCompressClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [preset, setPreset] = useState<CompressionPreset>("balanced");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>("");

  const [result, setResult] = useState<CompressionResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const activeUrlRef = useRef<string | null>(null);

  // Revoke download URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const selected = acceptedFiles[0];

    // Clean up prior results
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setDownloadUrl(null);
    setResult(null);
    setError(null);
    setProgressPercent(0);
    setProgressStatus("");
    setFile(selected);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());
    } catch (err: unknown) {
      console.warn("Could not read PDF metadata:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("encrypted") || msg.includes("password")) {
        setError("This PDF is password-protected or encrypted. Please remove encryption before compressing.");
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
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setDownloadUrl(null);
    setFile(null);
    setPageCount(null);
    setResult(null);
    setError(null);
    setProgressPercent(0);
    setProgressStatus("");
    setIsProcessing(false);
  };

  const handleCancel = () => {
    cancelRef.current.cancelled = true;
    setProgressStatus("Cancelling compression...");
    setIsProcessing(false);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgressPercent(0);
    setProgressStatus("Initializing compression...");
    cancelRef.current = { cancelled: false };

    try {
      const compressionResult = await compressPdf(file, {
        preset,
        onProgress: (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        },
        cancelSignal: cancelRef.current,
      });

      if (!cancelRef.current.cancelled) {
        setResult(compressionResult);

        // Clean up previous URL if any
        if (activeUrlRef.current) {
          URL.revokeObjectURL(activeUrlRef.current);
        }

        const url = URL.createObjectURL(compressionResult.blob);
        activeUrlRef.current = url;
        setDownloadUrl(url);
      }
    } catch (err: unknown) {
      console.error("Compression failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("encrypted") || msg.includes("password")) {
        setError("This PDF is encrypted or password-protected. Please remove encryption before compressing.");
      } else {
        setError(msg || "Failed to compress PDF document.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {/* Upload Zone */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileUp className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF document here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Downsamples embedded images and compacts object streams locally in your browser. No files are uploaded to any server.
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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

          {/* Preset Selection Cards (hidden when result is shown) */}
          {!result && (
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <Minimize2 className="w-4 h-4 text-emerald-500" />
                Select Compression Preset
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRESETS.map((p) => {
                  const isSelected = preset === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isProcessing && setPreset(p.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                          : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] bg-white dark:bg-[#18181b]"
                      } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}
                        >
                          {p.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                        {p.quality} • {p.maxRes}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Processing Status & Progress Bar */}
          {isProcessing && (
            <div className="mb-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {progressStatus || "Compressing PDF document..."}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 dark:bg-white/[0.1] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
                >
                  <StopCircle className="w-4 h-4" /> Cancel Compression
                </button>
              </div>
            </div>
          )}

          {/* Start Compression Button */}
          {!result && !isProcessing && (
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Compress PDF Document
            </button>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Success Banner */}
              <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Compression Complete!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your PDF was compressed and compacted directly in your browser.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <div className="text-center">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Original Size
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Compressed Size
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatBytes(result.compressedSize)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total Savings
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {result.ratio > 0 ? `${result.ratio}% (${formatBytes(result.savedBytes)})` : "0% (Optimized)"}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Images Downsampled
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    {result.imagesCompressed}
                  </span>
                </div>
              </div>

              {/* Graceful text-only or already-compressed notes */}
              {result.imagesCompressed === 0 && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex items-start gap-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Text-only document:</strong> No embedded raster images were detected in this PDF. Lossless structural PDF object stream compaction was applied to optimize file headers and cross-reference streams.
                  </p>
                </div>
              )}

              {result.savedBytes <= 0 && result.imagesCompressed > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    This document was already highly compressed. Further downsampling did not yield byte reductions without compromising image quality, so the optimal stream was retained.
                  </p>
                </div>
              )}

              {/* Download & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`compressed-${file.name}`}
                    className="w-full sm:flex-1 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Download Compressed PDF
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl border border-slate-300 dark:border-white/[0.1] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Compress Another File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
