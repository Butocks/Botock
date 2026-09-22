"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { FileUp, FileText, X, Loader2, Download } from "lucide-react";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

export default function PDFMergeClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { url: mergedPdfUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
      resetDownload();
    },
    [resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    resetDownload();
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      setBlob(mergedPdfBytes);
    } catch (error) {
      console.error("Failed to merge PDFs:", error);
      throw new Error("Failed to process PDFs. They might be encrypted or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="w-full">
      {!mergedPdfUrl ? (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-violet-500 bg-violet-500/5"
                : "border-slate-300 dark:border-white/[0.1] hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileUp className="w-8 h-8 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Drop PDF files here
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              or click to browse from your computer
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-3 mb-8">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-rose-500" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleMerge}
                disabled={files.length < 2 || isProcessing}
                className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-300 dark:disabled:bg-white/[0.1] disabled:text-slate-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing PDFs...
                  </>
                ) : (
                  "Merge PDFs Now"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] rounded-3xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Merge Successful!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your files have been securely merged in your browser.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setFiles([]);
                resetDownload();
              }}
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-white/[0.1] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
            >
              Merge More
            </button>
            <a
              href={mergedPdfUrl}
              download="Botock-Merged.pdf"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
