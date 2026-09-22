"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  FileText,
  UploadCloud,
  Loader2,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

type ConversionStatus = "idle" | "converting" | "success" | "error";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function extractFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch {
      return match[1].trim();
    }
  }
  return fallback;
}

export default function WordToPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlobUrl, setResultBlobUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>("");
  const [resultSize, setResultSize] = useState<number | null>(null);

  const blobUrlRef = useRef<string | null>(null);

  const cleanupBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrl();
    };
  }, [cleanupBlobUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const selected = acceptedFiles[0];

      // Extension sanity check
      const lower = selected.name.toLowerCase();
      if (!lower.endsWith(".docx") && !lower.endsWith(".doc")) {
        setErrorMessage("Please select a Microsoft Word document (.docx or .doc).");
        setStatus("error");
        return;
      }

      cleanupBlobUrl();
      setFile(selected);
      setStatus("idle");
      setErrorMessage(null);
      setResultBlobUrl(null);
      setResultFilename("");
      setResultSize(null);
    },
    [cleanupBlobUrl]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const rej = fileRejections[0];
      const isInvalidType = rej.errors.some((e) => e.code === "file-invalid-type");
      if (isInvalidType) {
        setErrorMessage("Invalid file format. Please upload a Word document (.docx or .doc).");
      } else {
        setErrorMessage(rej.errors[0]?.message || "Failed to select file.");
      }
      setStatus("error");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    multiple: false,
    noClick: false,
  });

  const handleReset = useCallback(() => {
    cleanupBlobUrl();
    setFile(null);
    setStatus("idle");
    setErrorMessage(null);
    setResultBlobUrl(null);
    setResultFilename("");
    setResultSize(null);
  }, [cleanupBlobUrl]);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setStatus("converting");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      // Form field name must strictly be 'file'
      formData.append("file", file);

      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:8000";
      const endpoint = `${apiBase.replace(/\/$/, "")}/api/convert/docx-to-pdf`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let detailMessage = `Server error (${response.status}: ${
          response.statusText || "Conversion failed"
        })`;

        try {
          const errorJson = await response.json();
          if (errorJson?.detail) {
            if (typeof errorJson.detail === "string") {
              detailMessage = errorJson.detail;
            } else if (Array.isArray(errorJson.detail)) {
              detailMessage = errorJson.detail
                .map((d: { msg?: string }) => d.msg || JSON.stringify(d))
                .join(", ");
            } else {
              detailMessage = JSON.stringify(errorJson.detail);
            }
          }
        } catch {
          // If response body is not valid JSON
        }

        // Handle specific 501 LibreOffice missing error
        if (
          response.status === 501 ||
          detailMessage.toLowerCase().includes("libreoffice")
        ) {
          detailMessage =
            "LibreOffice is not installed on the conversion server. Please ensure LibreOffice is installed and accessible in the server environment.";
        }

        throw new Error(detailMessage);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const resolvedFilename = extractFilename(contentDisposition, `${baseName}.pdf`);

      cleanupBlobUrl();
      const objectUrl = URL.createObjectURL(blob);
      blobUrlRef.current = objectUrl;

      setResultBlobUrl(objectUrl);
      setResultFilename(resolvedFilename);
      setResultSize(blob.size);
      setStatus("success");

      // Auto-trigger download
      try {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = resolvedFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (triggerErr) {
        console.warn("Auto-trigger download note:", triggerErr);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setErrorMessage(
          "Unable to connect to the document conversion server (http://localhost:8000). Please check your internet connection or verify the backend server is running."
        );
      } else {
        setErrorMessage(msg || "An unexpected error occurred during conversion.");
      }
      setStatus("error");
    }
  }, [file, cleanupBlobUrl]);

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {/* Error Alert (Dismissible with Retry) */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-start justify-between gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Conversion Notice</p>
              <p className="text-xs sm:text-sm leading-relaxed">{errorMessage}</p>
              {file && status === "error" && (
                <button
                  type="button"
                  onClick={handleConvert}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Conversion
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone (No file selected) */}
      {!file && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-blue-500 bg-blue-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your Word document here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Supports Microsoft Word documents (<span className="font-semibold text-slate-700 dark:text-slate-300">.docx</span> and legacy <span className="font-semibold text-slate-700 dark:text-slate-300">.doc</span> formats).
          </p>
          <button
            type="button"
            onClick={open}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            Browse Word File
          </button>
        </div>
      )}

      {/* Selected File Section */}
      {file && (
        <div className="space-y-6">
          {/* File Overview Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md"
                  title={file.name}
                >
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold tracking-wider">
                    {file.name.split(".").pop()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={status === "converting"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-colors shrink-0"
              title="Remove file and select another"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>

          {/* Converting State UI */}
          {status === "converting" && (
            <div className="p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Converting Word document to PDF on server...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Processing your document layout and styles via LibreOffice headless conversion. This usually takes just a few seconds.
              </p>
            </div>
          )}

          {/* Idle / Ready to Convert State */}
          {status === "idle" && (
            <button
              type="button"
              onClick={handleConvert}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              Convert to PDF
            </button>
          )}

          {/* Success State UI */}
          {status === "success" && resultBlobUrl && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Success Banner */}
              <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Conversion Complete!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Your PDF file is ready. The download should have started automatically. If not, click the button below.
                </p>
              </div>

              {/* Converted File Details */}
              <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {resultFilename}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PDF Document • {resultSize !== null ? formatBytes(resultSize) : "Ready"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Ready to Save
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={resultBlobUrl}
                  download={resultFilename}
                  className="py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-4 px-6 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Convert Another Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
