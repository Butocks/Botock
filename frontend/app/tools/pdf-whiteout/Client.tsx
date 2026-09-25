"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Eraser,
  FileText,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb } from "pdf-lib";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface WhiteoutBox {
  id: string;
  pageNum: number;
  x: number; // percentage of preview width
  y: number; // percentage of preview height
  width: number;
  height: number;
  color: "white" | "black";
}

export default function PdfWhiteoutClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<any>(null);

  const [boxes, setBoxes] = useState<WhiteoutBox[]>([]);
  const [selectedColor, setSelectedColor] = useState<"white" | "black">("white");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag-to-draw state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setError("Please choose a valid PDF file.");
        return;
      }
      setError(null);
      setFile(selected);
      setDownloadUrl(null);
      setBoxes([]);
      setCurrentPage(1);

      try {
        const buffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const doc = await loadingTask.promise;
        setPdfJsDoc(doc);
        setPageCount(doc.numPages);
        renderPagePreview(doc, 1);
      } catch (err: any) {
        setError(err.message || "Failed to load PDF document.");
      }
    }
  };

  const renderPagePreview = async (doc: any, pageNum: number) => {
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPageImage(canvas.toDataURL("image/jpeg", 0.9));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!pdfJsDoc || newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
    renderPagePreview(pdfJsDoc, newPage);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;
    setIsDrawing(false);

    if (currentBox.width > 2 && currentBox.height > 2) {
      setBoxes((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          pageNum: currentPage,
          x: currentBox.x,
          y: currentBox.y,
          width: currentBox.width,
          height: currentBox.height,
          color: selectedColor,
        },
      ]);
    }
    setCurrentBox(null);
  };

  const handleApplyWhiteout = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      for (const box of boxes) {
        if (box.pageNum <= pages.length) {
          const page = pages[box.pageNum - 1];
          const { width, height } = page.getSize();

          // Transform percentage to native PDF points (bottom-left coordinate space)
          const left = (box.x / 100) * width;
          const boxW = (box.width / 100) * width;
          const boxH = (box.height / 100) * height;
          const bottom = height - ((box.y + box.height) / 100) * height;

          const fillColor = box.color === "white" ? rgb(1, 1, 1) : rgb(0.08, 0.08, 0.08);

          page.drawRectangle({
            x: left,
            y: bottom,
            width: boxW,
            height: boxH,
            color: fillColor,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to redact PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Eraser className="w-3.5 h-3.5" />
            PDF Whiteout & Redaction Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Whiteout & Redact PDF Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Draw over confidential figures, private text, or unwanted markings with clean whiteout or black redaction boxes directly in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          /* Upload State */
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="pdf-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-teal-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                <Eraser className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select your PDF document
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Drag-to-erase: Hide bank account details, social security numbers, or sensitive content.
              </p>
              <span className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-lg shadow-teal-600/25 transition">
                Choose PDF File
              </span>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          /* Editor Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Canvas Pane */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                {/* Page Navigation & Controls */}
                <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span className="font-medium text-slate-200 truncate max-w-xs">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      Page {currentPage} of {pageCount}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pageCount}
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Drawing Surface */}
                {pageImage && (
                  <div
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="relative max-w-md w-full border border-slate-700 rounded-lg overflow-hidden select-none shadow-2xl cursor-crosshair bg-white"
                  >
                    <img src={pageImage} alt="PDF Page" className="w-full h-auto pointer-events-none" />

                    {/* Stamped Redaction Boxes for Current Page */}
                    {boxes
                      .filter((b) => b.pageNum === currentPage)
                      .map((box) => (
                        <div
                          key={box.id}
                          style={{
                            top: `${box.y}%`,
                            left: `${box.x}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                            backgroundColor: box.color === "white" ? "#ffffff" : "#111827",
                          }}
                          className={`absolute border ${
                            box.color === "white" ? "border-slate-300" : "border-slate-800"
                          }`}
                        />
                      ))}

                    {/* Live Dragging Preview Box */}
                    {isDrawing && currentBox && (
                      <div
                        style={{
                          top: `${currentBox.y}%`,
                          left: `${currentBox.x}%`,
                          width: `${currentBox.width}%`,
                          height: `${currentBox.height}%`,
                          backgroundColor: selectedColor === "white" ? "rgba(255,255,255,0.8)" : "rgba(17,24,39,0.8)",
                        }}
                        className="absolute border-2 border-teal-500 pointer-events-none"
                      />
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-3">
                  Click and drag across any area of the page to place a whiteout box
                </p>

                <button
                  onClick={() => {
                    setFile(null);
                    setDownloadUrl(null);
                    setBoxes([]);
                  }}
                  className="mt-6 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Choose another file
                </button>
              </div>
            </div>

            {/* Right Options Sidebar */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
                  Erase Mode Color
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedColor("white")}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition ${
                      selectedColor === "white"
                        ? "bg-teal-600/20 border-teal-500 text-teal-300 font-semibold"
                        : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                    Whiteout (White)
                  </button>
                  <button
                    onClick={() => setSelectedColor("black")}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition ${
                      selectedColor === "black"
                        ? "bg-teal-600/20 border-teal-500 text-teal-300 font-semibold"
                        : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600" />
                    Redact (Black)
                  </button>
                </div>
              </div>

              {/* Erased Items Queue */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                    Applied Blocks ({boxes.length})
                  </h3>
                  {boxes.length > 0 && (
                    <button
                      onClick={() => setBoxes([])}
                      className="text-xs text-red-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {boxes.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No whiteout areas drawn yet. Drag across the document preview to add.
                    </p>
                  ) : (
                    boxes.map((box, idx) => (
                      <div
                        key={box.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              box.color === "white" ? "bg-white border border-slate-400" : "bg-black"
                            }`}
                          />
                          <span>
                            Block #{idx + 1} (Page {box.pageNum})
                          </span>
                        </div>
                        <button
                          onClick={() => setBoxes((prev) => prev.filter((b) => b.id !== box.id))}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!downloadUrl ? (
                <button
                  onClick={handleApplyWhiteout}
                  disabled={isProcessing || boxes.length === 0}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Burning Redactions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Burn Redactions & Download
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <a
                    href={downloadUrl}
                    download={`redacted-${file.name}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Redacted PDF
                  </a>
                  <button
                    onClick={() => setDownloadUrl(null)}
                    className="w-full py-2 text-xs text-slate-400 hover:text-white transition text-center"
                  >
                    Keep editing document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
              <Eraser className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Permanent Vector Burning</h4>
            <p className="text-xs text-slate-400">
              Whiteout and redaction boxes are burned directly into the PDF stream, ensuring underlying text cannot be selected or copied.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero Cloud Upload</h4>
            <p className="text-xs text-slate-400">
              Complete privacy guarantee. Confidential documents are modified directly inside your browser with zero remote transmission.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Whiteout or Blackout</h4>
            <p className="text-xs text-slate-400">
              Choose clean paper-white boxes to seamlessly mask unwanted text or solid black redaction blocks for formal compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
