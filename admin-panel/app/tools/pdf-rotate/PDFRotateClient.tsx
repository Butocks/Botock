"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, degrees } from "pdf-lib";
import { FileUp, FileText, Download, Loader2, RefreshCcw, RotateCw } from "lucide-react";
import { usePdfDocument } from "@/lib/pdf/usePdfDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

const parsePagesString = (input: string, maxPages: number): number[] => {
  if (!input.trim()) return Array.from({ length: maxPages }, (_, i) => i);
  
  const pages = new Set<number>();
  const parts = input.split(',');
  
  for (const part of parts) {
    const range = part.trim().split('-');
    if (range.length === 1) {
      const p = parseInt(range[0], 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) pages.add(p - 1);
    } else if (range.length === 2) {
      let start = parseInt(range[0], 10);
      let end = parseInt(range[1], 10);
      
      if (!isNaN(start) && !isNaN(end)) {
        if (start > end) {
           const temp = start;
           start = end;
           end = temp;
        }
        start = Math.max(1, start);
        end = Math.min(maxPages, end);
        for (let i = start; i <= end; i++) {
          pages.add(i - 1);
        }
      }
    }
  }
  return Array.from(pages);
};

export default function PDFRotateClient() {
  const { file, pageCount, error: docError, loadFile, reset: resetDoc } = usePdfDocument();
  const { url: downloadUrl, setBlob, reset: resetDownload } = useObjectUrlDownload();

  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [pagesInput, setPagesInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const errorMessage = actionError || docError;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      resetDownload();
      setPagesInput("");
      await loadFile(acceptedFiles[0]);
    },
    [loadFile, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setActionError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      
      const targetIndices = parsePagesString(pagesInput, pages.length);
      
      if (targetIndices.length === 0) {
        throw new Error("No valid pages found for the given input.");
      }

      for (let i = 0; i < pages.length; i++) {
        if (targetIndices.includes(i)) {
          const currentRotation = pages[i].getRotation().angle;
          pages[i].setRotation(degrees((currentRotation + rotationAngle) % 360));
        }
      }

      const pdfBytes = await pdfDoc.save();
      setBlob(pdfBytes);
    } catch (err: any) {
      console.error("Rotation failed:", err);
      setActionError(err.message || "Failed to rotate PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    resetDoc();
    resetDownload();
    setActionError(null);
    setRotationAngle(90);
    setPagesInput("");
  };
  
  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCw className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF to rotate
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rotate specific pages or all pages 90°, 180°, or 270° clockwise.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount} page(s)
                </p>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
            >
              Choose another
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Pages to Rotate
              </label>
              <input
                type="text"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                placeholder="e.g. 1, 3, 5-7 (leave empty for all)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#18181b] text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Leave empty to rotate all {pageCount} pages. Example format: 1, 3, 5-7.
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Rotation Angle
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "+90°", angle: 90 },
                  { label: "180° Flip", angle: 180 },
                  { label: "+270°", angle: 270 },
                ].map((item) => (
                  <button
                    key={item.angle}
                    type="button"
                    onClick={() => setRotationAngle(item.angle)}
                    className={`flex-1 min-w-[80px] py-3 px-2 rounded-xl border text-xs font-bold transition-all ${
                      rotationAngle === item.angle
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleRotate}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Rotating Pages...
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" /> Rotate Selected Pages ({rotationAngle}°)
                </>
              )}
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-sm font-semibold transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

          {downloadUrl && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Rotation Applied!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Pages rotated by {rotationAngle}°.
                </p>
              </div>
              <a
                href={downloadUrl}
                download={`${file.name.replace(/\.pdf$/i, "")}-rotated-${rotationAngle}deg.pdf`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" /> Download Rotated PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
