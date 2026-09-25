"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
  Check,
  Layers,
  ArrowRight,
} from "lucide-react";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

interface PageItem {
  pageNumber: number;
  thumbnailUrl: string;
  selected: boolean;
  blob?: Blob;
  size?: number;
}

export default function PdfToJpgClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [dpi, setDpi] = useState<150 | 300>(150);
  const [quality, setQuality] = useState<number>(90);

  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  const [convertedPages, setConvertedPages] = useState<PageItem[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.thumbnailUrl));
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    };
  }, [pages, zipUrl]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setIsLoading(true);
      setErrorMsg(null);
      setPages([]);
      setConvertedPages([]);
      setZipUrl(null);

      try {
        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        setPdfDoc(doc);

        const pageList: PageItem[] = [];

        // Generate fast low-res thumbnails for UI grid preview
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            const thumbUrl = canvas.toDataURL("image/jpeg", 0.7);
            pageList.push({
              pageNumber: i,
              thumbnailUrl: thumbUrl,
              selected: true,
            });
          }
        }

        setPages(pageList);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("password") || msg.includes("Password")) {
          setErrorMsg(
            "This PDF is password-protected. Please unlock it using our Unlock PDF tool first."
          );
        } else {
          setErrorMsg("Could not read this PDF document. Please verify the file is not corrupted.");
        }
      } finally {
        setIsLoading(false);
      }
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

  const resetAll = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.thumbnailUrl));
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setFile(null);
    setPdfDoc(null);
    setPages([]);
    setConvertedPages([]);
    setZipUrl(null);
    setErrorMsg(null);
  };

  const togglePageSelect = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const handleConvert = async () => {
    if (!pdfDoc || !file) return;

    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      setErrorMsg("Please select at least one page to convert.");
      return;
    }

    setIsConverting(true);
    setErrorMsg(null);
    setProgress({ current: 0, total: selectedPages.length });

    try {
      const scale = dpi === 300 ? 3.0 : 1.5;
      const q = quality / 100;
      const zip = new JSZip();
      const outputList: PageItem[] = [];

      for (let index = 0; index < selectedPages.length; index++) {
        const item = selectedPages[index];
        setProgress({ current: index + 1, total: selectedPages.length });

        const page = await pdfDoc.getPage(item.pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Could not initialize canvas context.");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error("Failed to render page to JPEG blob."));
            },
            "image/jpeg",
            q
          );
        });

        const highResUrl = URL.createObjectURL(blob);
        const fileName = `${file.name.replace(/\.[^/.]+$/, "")}-page-${String(item.pageNumber).padStart(3, "0")}.jpg`;

        zip.file(fileName, blob);

        outputList.push({
          pageNumber: item.pageNumber,
          thumbnailUrl: highResUrl,
          selected: true,
          blob,
          size: blob.size,
        });
      }

      setConvertedPages(outputList);

      // Generate ZIP archive if more than 1 page
      if (outputList.length > 1) {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zUrl = URL.createObjectURL(zipBlob);
        setZipUrl(zUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "An error occurred while converting pages to JPG.");
    } finally {
      setIsConverting(false);
    }
  };

  const baseName = file ? file.name.replace(/\.[^/.]+$/, "") : "document";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-amber-500 bg-amber-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop PDF here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Convert every page of your PDF into high-resolution JPG images. 100% private, client-side WASM processing.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)} • {pages.length} Pages Detected
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              disabled={isConverting}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Page Grid & Results (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {isLoading ? (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                  <p className="text-xs text-slate-500 font-semibold">
                    Reading PDF pages and generating previews...
                  </p>
                </div>
              ) : convertedPages.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Select Pages to Convert ({pages.filter((p) => p.selected).length}/{pages.length})
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(true)}
                        className="text-xs font-bold text-amber-600 hover:text-amber-500"
                      >
                        Select All
                      </button>
                      <span className="text-slate-400">•</span>
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(false)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1 border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                    {pages.map((item) => (
                      <div
                        key={item.pageNumber}
                        onClick={() => togglePageSelect(item.pageNumber)}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all p-1 flex flex-col items-center group ${
                          item.selected
                            ? "border-amber-500 bg-amber-500/5 shadow-sm"
                            : "border-transparent bg-slate-100 dark:bg-white/[0.03] opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="aspect-[3/4] w-full bg-white rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                          <img
                            src={item.thumbnailUrl}
                            alt={`Page ${item.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span>Page {item.pageNumber}</span>
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => togglePageSelect(item.pageNumber)}
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Converted Results View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Converted {convertedPages.length} Pages
                    </span>

                    {zipUrl && (
                      <a
                        href={zipUrl}
                        download={`${baseName}-all-pages-jpg.zip`}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download All as ZIP
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto p-1">
                    {convertedPages.map((item) => (
                      <div
                        key={item.pageNumber}
                        className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-2 flex flex-col justify-between space-y-2"
                      >
                        <div className="aspect-[3/4] w-full bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                          <img
                            src={item.thumbnailUrl}
                            alt={`Page ${item.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold px-1">
                          <span>Page {item.pageNumber}</span>
                          {item.size && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatBytes(item.size)}
                            </span>
                          )}
                        </div>

                        <a
                          href={item.thumbnailUrl}
                          download={`${baseName}-page-${item.pageNumber}.jpg`}
                          className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Download JPG
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right Settings (4 Cols) */}
            <div className="lg:col-span-4 space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>JPG Export Quality</span>
              </div>

              {/* Resolution DPI */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Rendering Resolution (DPI)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDpi(150)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      dpi === 150
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    150 DPI (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDpi(300)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      dpi === 300
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    300 DPI (High-Res)
                  </button>
                </div>
              </div>

              {/* Quality Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>JPEG Compression</span>
                  <span className="text-amber-500 font-mono">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting || isLoading}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Rendering Page {progress.current} of {progress.total}...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Convert to JPG ({pages.filter((p) => p.selected).length} Pages)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
