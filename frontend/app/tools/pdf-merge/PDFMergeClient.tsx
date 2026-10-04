"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { FileUp, FileText, X, Loader2, Download, RefreshCw, ChevronUp, ChevronDown, Eye } from "lucide-react";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";
import { claimToolReward } from "@/lib/toolReward";

export default function PDFMergeClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { url: mergedPdfUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  useEffect(() => {
    if (previewFile) {
      const url = URL.createObjectURL(previewFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [previewFile]);

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

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index - 1];
    newFiles[index - 1] = temp;
    setFiles(newFiles);
    resetDownload();
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index + 1];
    newFiles[index + 1] = temp;
    setFiles(newFiles);
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

      // Award credits to logged-in user (24h expiration)
      claimToolReward("pdf-merge");
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
                    className="flex items-center justify-between p-4 bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] rounded-xl group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex flex-col gap-1 -ml-2 shrink-0">
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded text-slate-400 hover:text-violet-500 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx === files.length - 1}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded text-slate-400 hover:text-violet-500 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      
                      <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                      
                      <div 
                        className="relative flex items-center gap-2 group/tooltip truncate max-w-full"
                        onMouseEnter={() => setPreviewFile(file)}
                        onMouseLeave={() => setPreviewFile(null)}
                      >
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate cursor-help">
                          {file.name}
                        </span>
                        <Eye className="w-4 h-4 text-slate-400 shrink-0 hidden sm:group-hover:block" />
                        
                        {previewFile === file && previewUrl && (
                          <div className="absolute left-0 bottom-full mb-4 z-50 w-64 h-80 bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-2xl overflow-hidden items-center justify-center p-2 hidden sm:flex">
                            <iframe 
                              src={`${previewUrl}#page=1&view=Fit&toolbar=0&navpanes=0&scrollbar=0`} 
                              className="w-full h-full rounded-lg border-none bg-white"
                              title={`Preview of ${file.name}`}
                            />
                            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white dark:bg-[#1e1e24] border-b border-r border-slate-200 dark:border-white/[0.1] rotate-45 transform"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-5 h-5" />
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setFiles([]);
                resetDownload();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-white/[0.1] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Merge More
            </button>
            <a
              href={mergedPdfUrl}
              download="Botock-Merged.pdf"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

