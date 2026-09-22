"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  FileSpreadsheet,
  FileUp,
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  FileText,
} from "lucide-react";

type ConversionStatus = "idle" | "converting" | "success" | "error";

interface ConversionResult {
  blobUrl: string;
  filename: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function Client() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const activeUrlRef = useRef<string | null>(null);

  // Clean up Blob URLs on unmount
  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
    };
  }, []);

  const cleanupBlobUrl = useCallback(() => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    cleanupBlobUrl();
    setFile(null);
    setStatus("idle");
    setErrorMessage(null);
    setResult(null);
  }, [cleanupBlobUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections && fileRejections.length > 0) {
        setErrorMessage("Please upload a valid PDF document (.pdf).");
        return;
      }

      if (!acceptedFiles || acceptedFiles.length === 0) return;

      cleanupBlobUrl();
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setStatus("idle");
      setErrorMessage(null);
      setResult(null);
    },
    [cleanupBlobUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: status === "converting",
  });

  const handleConvert = async () => {
    if (!file) return;

    setStatus("converting");
    setErrorMessage(null);
    cleanupBlobUrl();

    try {
      const formData = new FormData();
      // Request body: FormData with field name strictly 'file'
      formData.append("file", file);

      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:8000";

      const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/convert/pdf-to-excel`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let extractedDetail = "";
        try {
          const errorJson = await res.json();
          if (errorJson?.detail) {
            extractedDetail =
              typeof errorJson.detail === "string"
                ? errorJson.detail
                : Array.isArray(errorJson.detail) && errorJson.detail[0]?.msg
                ? errorJson.detail[0].msg
                : JSON.stringify(errorJson.detail);
          }
        } catch {
          // Response body was not JSON
        }

        // Special error handling: if response status is 400 with "No tables found in the PDF"
        if (
          res.status === 400 &&
          (extractedDetail.includes("No tables found") ||
            extractedDetail.toLowerCase().includes("no tables"))
        ) {
          throw new Error(
            "No tables found in the PDF. Please upload a PDF that contains tables to convert to Excel."
          );
        }

        if (extractedDetail) {
          throw new Error(extractedDetail);
        }

        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const blob = await res.blob();

      // Extract filename from Content-Disposition header or fallback to original name with .xlsx
      let outputFilename = file.name.replace(/\.[^/.]+$/, "") + ".xlsx";
      const disposition = res.headers.get("Content-Disposition");
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          outputFilename = match[1].trim();
        }
      }

      const blobUrl = URL.createObjectURL(blob);
      activeUrlRef.current = blobUrl;

      const conversionResult: ConversionResult = {
        blobUrl,
        filename: outputFilename,
        size: blob.size,
      };

      setResult(conversionResult);
      setStatus("success");

      // Auto-trigger download
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = outputFilename;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (err: unknown) {
      console.error("PDF to Excel conversion failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to convert PDF to Excel. Please check the backend connection and try again.";
      setErrorMessage(msg);
      setStatus("error");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {/* Dismissible Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start justify-between gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p className="font-medium leading-relaxed">{errorMessage}</p>
              {file && status === "error" && (
                <button
                  type="button"
                  onClick={handleConvert}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Conversion
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-lg hover:bg-rose-500/15 text-rose-500 hover:text-rose-600 dark:text-rose-400 transition-colors shrink-0 cursor-pointer"
            title="Dismiss alert"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone (shown when no file is selected) */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
              : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileUp className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Select or drag &amp; drop a PDF with tables
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Upload any PDF containing structured tables. The FastAPI engine will extract every table into organized Excel sheets.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">
            Browse PDF File
          </div>
        </div>
      ) : (
        <div>
          {/* Selected File Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08]">
                    PDF
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={status === "converting"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-colors cursor-pointer"
              title="Remove file and start over"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Remove
            </button>
          </div>

          {/* Converting State / Progress Indicator */}
          {status === "converting" && (
            <div className="mb-8 p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Extracting tables and converting to Excel on server...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Scanning document pages, detecting tabular boundaries, and formatting into XLSX worksheets.
              </p>
            </div>
          )}

          {/* Success State / Result Display */}
          {status === "success" && result && (
            <div className="space-y-6 mb-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Tables Extracted Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your Excel workbook is ready for analysis and formatting.
                </p>
              </div>

              {/* Converted File Info Card */}
              <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {result.filename}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Excel Workbook (.xlsx) • {formatBytes(result.size)}
                    </p>
                  </div>
                </div>

                <a
                  href={result.blobUrl}
                  download={result.filename}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <a
                  href={result.blobUrl}
                  download={result.filename}
                  className="w-full sm:flex-1 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download Excel Workbook (.xlsx)
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl border border-slate-300 dark:border-white/[0.1] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Convert Another PDF
                </button>
              </div>
            </div>
          )}

          {/* Idle / Error State Action Button */}
          {status !== "converting" && status !== "success" && (
            <button
              onClick={handleConvert}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" /> Convert to Excel (.xlsx)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
