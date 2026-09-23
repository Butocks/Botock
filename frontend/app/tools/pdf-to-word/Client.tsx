"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { formatBytes } from "@/lib/utils/formatters";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  FileText,
  FileUp,
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

type ConversionStatus = "idle" | "converting" | "success" | "error";

interface ConversionResult {
  downloadUrl: string;
  filename: string;
  size: number;
}

export default function PdfToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [statusText, setStatusText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const activeUrlRef = useRef<string | null>(null);
  // FIX: AbortController ref added to cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up Blob URLs to prevent memory leaks
  const cleanupBlobUrl = useCallback(() => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
  }, []);

  // Component unmount hone par URL clean karein aur in-flight request ko rokein
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cleanupBlobUrl();
    };
  }, [cleanupBlobUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cleanupBlobUrl();
      setResult(null);
      setErrorMessage(null);
      setStatus("idle");
      setStatusText("");

      if (rejectedFiles && rejectedFiles.length > 0) {
        setErrorMessage("Please upload a valid PDF document (.pdf).");
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const selected = acceptedFiles[0];
        if (!selected.name.toLowerCase().endsWith(".pdf")) {
          setErrorMessage("The selected file must have a .pdf extension.");
          return;
        }
        setFile(selected);
      }
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
  });

  const handleReset = () => {
    // FIX: Conversion cancel karne ke liye API request ko fauran abort karein
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    cleanupBlobUrl();
    setFile(null);
    setStatus("idle");
    setStatusText("");
    setErrorMessage(null);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus("converting");
    setStatusText("Converting PDF to DOCX on server...");
    setErrorMessage(null);

    // Naya AbortController initialize karein
    abortControllerRef.current = new AbortController();

    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000"
    ).replace(/\/$/, "");

    const formData = new FormData();
    // Backend strictly requires form field name 'file'
    formData.append("file", file);

    try {
      const response = await fetch(`${apiBase}/api/convert/pdf-to-docx`, {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal, // Request ke sath signal attach kar diya
      });

      if (!response.ok) {
        let errorDetail = `Server error (${response.status}: ${response.statusText})`;
        try {
          const errorJson = await response.json();
          if (errorJson?.detail) {
            if (typeof errorJson.detail === "string") {
              errorDetail = errorJson.detail;
            } else if (Array.isArray(errorJson.detail)) {
              errorDetail = errorJson.detail
                .map((d: { msg?: string }) => d.msg || JSON.stringify(d))
                .join(", ");
            } else {
              errorDetail = JSON.stringify(errorJson.detail);
            }
          }
        } catch {
          // If response body is not JSON, use fallback errorDetail
        }
        throw new Error(errorDetail);
      }

      const blob = await response.blob();

      // Determine output filename from Content-Disposition header or fallback
      let outputFilename = file.name.replace(/\.[^/.]+$/, "") + ".docx";
      const disposition =
        response.headers.get("Content-Disposition") ||
        response.headers.get("content-disposition");

      if (disposition && disposition.includes("filename=")) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          disposition
        );
        if (matches && matches[1]) {
          const parsed = matches[1].replace(/['"]/g, "").trim();
          if (parsed) {
            outputFilename = parsed;
          }
        }
      }

      // Cleanup prior Blob URL before allocating a new one
      cleanupBlobUrl();

      const blobUrl = URL.createObjectURL(blob);
      activeUrlRef.current = blobUrl;

      setResult({
        downloadUrl: blobUrl,
        filename: outputFilename,
        size: blob.size,
      });
      setStatus("success");
      setStatusText("Conversion completed successfully!");

      // Auto-trigger browser download
      try {
        const tempLink = document.createElement("a");
        tempLink.href = blobUrl;
        tempLink.download = outputFilename;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      } catch (dlErr) {
        console.warn("Auto-download trigger failed:", dlErr);
      }
    } catch (err: unknown) {
      // Agar user ne intentional cancel kiya ho toh error throw na karein
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Conversion aborted by user.");
        return; 
      }
      console.error("PDF to DOCX conversion failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect to conversion server. Please check your connection and try again.";
      setErrorMessage(message);
      setStatus("error");
      setStatusText("");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {/* Dismissible Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Conversion Error</p>
            <p className="text-xs mt-0.5 leading-relaxed">{errorMessage}</p>
            {file && status === "error" && (
              <button
                type="button"
                onClick={handleConvert}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Retry Conversion
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss error"
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-1 rounded-lg transition-colors cursor-pointer"
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
            Convert your PDF into an editable Microsoft Word document (.docx).
            Supports standard PDF documents with text, images, and tables.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-semibold text-slate-700 dark:text-slate-300">
            Click to browse files
          </div>
        </div>
      ) : (
        <div>
          {/* Selected File Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)} • PDF Document
                </p>
              </div>
            </div>

            {/* FIX: Changed to allow cancelling during conversion */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              {status === "converting" ? (
                <>
                  <X className="w-3.5 h-3.5" /> Cancel Conversion
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" /> Remove / Change File
                </>
              )}
            </button>
          </div>

          {/* Feature Highlights (shown when idle) */}
          {status === "idle" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Editable DOCX</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generates full Microsoft Word documents compatible with Word, Google Docs, and LibreOffice.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold">Preserves Layout</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Retains tables, multi-column text, fonts, paragraphs, and embedded graphics.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Secure Processing</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Documents are converted in isolated temporary storage and never permanently stored.
                </p>
              </div>
            </div>
          )}

          {/* Converting State UI */}
          {status === "converting" && (
            <div className="mb-6 p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {statusText || "Converting PDF to DOCX on server..."}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Please wait while our backend parses your PDF structure, renders text layers, and builds the Word document.
              </p>
              <div className="w-48 h-1.5 bg-emerald-200 dark:bg-emerald-900/40 rounded-full mx-auto mt-5 overflow-hidden">
                <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Idle / Error State Action Button */}
          {(status === "idle" || status === "error") && (
            <button
              onClick={handleConvert}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" /> Convert to Word (DOCX)
            </button>
          )}

          {/* Success State UI */}
          {status === "success" && result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Success Banner */}
              <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Conversion Complete!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your PDF was converted into an editable Microsoft Word document (.docx).
                </p>
              </div>

              {/* Converted File Details Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {result.filename}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(result.size)} • Word Document (.docx)
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Your download should have started automatically. If it did not start, click the button below.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <a
                  href={result.downloadUrl}
                  download={result.filename}
                  className="w-full sm:flex-1 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download Converted Word Document (.docx)
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl border border-slate-300 dark:border-white/[0.1] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Convert Another File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}