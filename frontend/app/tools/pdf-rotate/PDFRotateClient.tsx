"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, degrees } from "pdf-lib";
import { FileUp, FileText, Download, Loader2, RefreshCcw, RotateCw } from "lucide-react";

export default function PDFRotateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const selected = acceptedFiles[0];
    setFile(selected);
    setErrorMessage(null);
    setDownloadUrl(null);

    try {
      const buffer = await selected.arrayBuffer();
      const loadedDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(loadedDoc.getPageCount());
    } catch (err: any) {
      console.error("Could not load PDF:", err);
      setErrorMessage("Could not inspect PDF. Check file permissions or encryption.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(url);
    } catch (err: any) {
      console.error("Rotation failed:", err);
      setErrorMessage(err.message || "Failed to rotate PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setPageCount(0);
    setDownloadUrl(null);
    setErrorMessage(null);
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
            Rotate all pages 90°, 180°, or 270° clockwise.
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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Rotation Angle
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "+90° Clockwise", angle: 90 },
                { label: "180° Flip", angle: 180 },
                { label: "+270° (90° Left)", angle: 270 },
              ].map((item) => (
                <button
                  key={item.angle}
                  type="button"
                  onClick={() => setRotationAngle(item.angle)}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                    rotationAngle === item.angle
                      ? "bg-violet-600 text-white border-violet-600 shadow-md"
                      : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
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
                  <RotateCw className="w-4 h-4" /> Rotate {pageCount} Pages ({rotationAngle}°)
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
                  All {pageCount} pages rotated by {rotationAngle}°.
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
