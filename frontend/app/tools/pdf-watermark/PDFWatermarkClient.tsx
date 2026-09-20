"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { FileUp, FileText, Download, Loader2, RefreshCcw, Stamp } from "lucide-react";

export default function PDFWatermarkClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotationAngle, setRotationAngle] = useState<number>(45);
  const [colorHex, setColorHex] = useState<string>("#e11d48");
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
      console.error("Could not read PDF:", err);
      setErrorMessage("Could not load PDF document. It may be encrypted or corrupted.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
    const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
    const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
    return rgb(r, g, b);
  };

  const handleApplyWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

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

        // Center calculation
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
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(url);
    } catch (err: any) {
      console.error("Watermark failed:", err);
      setErrorMessage(err.message || "Failed to stamp watermark onto PDF.");
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
            <Stamp className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF to add watermark
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stamp text overlays across all pages client-side.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
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

          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL or DRAFT"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121215] text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Color Preset
              </label>
              <div className="flex items-center gap-2">
                {["#e11d48", "#2563eb", "#059669", "#4b5563", "#000000"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColorHex(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      colorHex === color ? "scale-110 border-slate-900 dark:border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Font Size ({fontSize}px)
              </label>
              <input
                type="range"
                min={20}
                max={120}
                step={2}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Opacity ({Math.round(opacity * 100)}%)
              </label>
              <input
                type="range"
                min={0.05}
                max={0.9}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value) || 0.3)}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleApplyWatermark}
              disabled={isProcessing || !watermarkText.trim()}
              className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Applying Watermark...
                </>
              ) : (
                <>
                  <Stamp className="w-4 h-4" /> Apply Watermark to All Pages
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
                  Watermark Applied!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Applied "{watermarkText}" across all {pageCount} pages.
                </p>
              </div>
              <a
                href={downloadUrl}
                download={`${file.name.replace(/\.pdf$/i, "")}-watermarked.pdf`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" /> Download Watermarked PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
