"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Loader2,
  Trash2,
  Layers,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

interface PageData {
  pageNum: number;
  dataUrl: string;
  width: number;
  height: number;
}

export default function PDFToBookClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");

  // Spread state: currentPage is the page on the LEFT (or right if cover)
  // For cover (page 1): single right page
  // For interior: left is even, right is odd
  const [currentSpread, setCurrentSpread] = useState<number>(0); // 0 = Cover (Page 1)
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  const bookContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Play realistic paper swish sound using Web Audio API
  const playPageTurnSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.12);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft filtered white noise with exponential envelope
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.35));
        data[i] = (Math.random() * 2 - 1) * decay * 0.15;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1800;

      noise.connect(filter);
      filter.connect(audioCtx.destination);
      noise.start();
    } catch {
      // Ignore audio synthesis errors
    }
  };

  const loadPdf = async (pdfFile: File) => {
    setLoading(true);
    setProgress(0);
    setStatusText("Reading PDF document...");
    setPages([]);
    setCurrentSpread(0);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      const total = doc.numPages;

      const loadedPages: PageData[] = [];

      for (let i = 1; i <= total; i++) {
        setStatusText(`Rendering page ${i} of ${total} into flipbook...`);
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          loadedPages.push({
            pageNum: i,
            dataUrl: canvas.toDataURL("image/jpeg", 0.9),
            width: viewport.width,
            height: viewport.height,
          });
        }
        setProgress(Math.round((i / total) * 100));
      }

      setPages(loadedPages);
    } catch (err: any) {
      console.error("Failed to load PDF:", err);
      alert("Failed to load PDF file. Please ensure it is a valid PDF document.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      await loadPdf(f);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  // Calculate spreads
  // Spread 0: Cover (Page 1)
  // Spread 1: Pages 2 & 3
  // Spread 2: Pages 4 & 5
  // Spread k: Pages 2k & 2k+1
  const totalSpreads = pages.length > 0 ? Math.ceil((pages.length - 1) / 2) + 1 : 0;

  const getPagesForSpread = (spreadIndex: number) => {
    if (spreadIndex === 0) {
      return { left: null, right: pages[0] || null };
    }
    const leftIndex = (spreadIndex - 1) * 2 + 1;
    const rightIndex = leftIndex + 1;
    return {
      left: pages[leftIndex] || null,
      right: pages[rightIndex] || null,
    };
  };

  const turnNext = () => {
    if (currentSpread >= totalSpreads - 1 || isFlipping) return;
    setFlipDirection("next");
    setIsFlipping(true);
    playPageTurnSound();
    setTimeout(() => {
      setCurrentSpread((prev) => prev + 1);
      setIsFlipping(false);
    }, 400);
  };

  const turnPrev = () => {
    if (currentSpread <= 0 || isFlipping) return;
    setFlipDirection("prev");
    setIsFlipping(true);
    playPageTurnSound();
    setTimeout(() => {
      setCurrentSpread((prev) => prev - 1);
      setIsFlipping(false);
    }, 400);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        turnNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        turnPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSpread, totalSpreads, isFlipping]);

  const toggleFullscreen = () => {
    if (!bookContainerRef.current) return;
    if (!document.fullscreenElement) {
      bookContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPages([]);
    setCurrentSpread(0);
    setZoom(1);
  };

  const { left: leftPage, right: rightPage } = getPagesForSpread(currentSpread);

  return (
    <div className="w-full text-slate-900 dark:text-white flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-500 dark:selection:text-amber-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            3D Interactive Flipbook Reader
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Turn PDF into an Interactive Flipbook
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Experience documents like a real book with authentic page-turning animation, center spine shadows, and two-page spreads.
          </p>
        </div>

        {/* Upload State */}
        {!file ? (
          <div
            {...getRootProps()}
            className={`max-w-xl mx-auto p-16 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all space-y-4 shadow-sm ${
              isDragActive
                ? "border-amber-500 bg-amber-500/5"
                : "border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#111114] hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:border-amber-500 dark:hover:border-amber-500"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Upload PDF to Create 3D Book
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Magazines, brochures, catalogs, eBooks, and comics rendered with real page flips.
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/25 transition"
            >
              Select PDF File
            </button>
          </div>
        ) : loading ? (
          /* Loading Pipeline */
          <div className="max-w-md mx-auto p-12 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] text-center space-y-4 shadow-xl">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 dark:text-amber-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Generating 3D Flipbook
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{statusText}</p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          /* Interactive 3D Book Viewport */
          <div
            ref={bookContainerRef}
            className={`space-y-4 ${
              isFullscreen ? "fixed inset-0 z-50 bg-slate-100 dark:bg-[#050608] p-4 flex flex-col justify-between" : ""
            }`}
          >
            {/* Top Toolbar */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                  {file.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                  {currentSpread === 0
                    ? "Front Cover"
                    : `Pages ${leftPage?.pageNum || "-"}-${rightPage?.pageNum || "-"}`} of {pages.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl transition ${
                    soundEnabled
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                      : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800"
                  }`}
                  title={soundEnabled ? "Mute Page Flip Sound" : "Enable Sound"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = URL.createObjectURL(file);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = file.name;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition"
                    title="Download Original PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetAll}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                  title="Close Book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Realistic Book Stage */}
            <div className="relative w-full h-[540px] sm:h-[620px] rounded-3xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 dark:from-[#11141c] dark:to-[#0a0d14] border border-slate-300 dark:border-slate-800 flex items-center justify-center p-4 sm:p-8 overflow-hidden shadow-2xl select-none">
              {/* Previous Page Clickable Side Region */}
              <button
                type="button"
                onClick={turnPrev}
                disabled={currentSpread <= 0 || isFlipping}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 hover:border-amber-500/50 hover:bg-amber-500 dark:hover:bg-amber-600 text-slate-800 hover:text-white dark:text-white flex items-center justify-center shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-all group"
                title="Previous Page (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Next Page Clickable Side Region */}
              <button
                type="button"
                onClick={turnNext}
                disabled={currentSpread >= totalSpreads - 1 || isFlipping}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 hover:border-amber-500/50 hover:bg-amber-500 dark:hover:bg-amber-600 text-slate-800 hover:text-white dark:text-white flex items-center justify-center shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-all group"
                title="Next Page (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Book Spine & Two-Page Spread Container */}
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transition: "transform 0.2s ease-out",
                }}
                className={`relative flex items-center justify-center max-w-full max-h-full rounded-2xl p-2 bg-[#2a1e17] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] ${
                  currentSpread === 0 ? "max-w-[480px]" : "w-full max-w-[940px]"
                }`}
              >
                {/* Hardcover Outer Frame Texture */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1c130d] via-[#2f2017] to-[#1c130d] border border-amber-900/40 pointer-events-none" />

                {/* Left Page (Hidden on Cover) */}
                {currentSpread > 0 && (
                  <div
                    onClick={turnPrev}
                    className="relative flex-1 h-[480px] sm:h-[540px] bg-white rounded-l-lg overflow-hidden flex items-center justify-center cursor-pointer shadow-inner border-r border-black/20 group"
                  >
                    {leftPage ? (
                      <img
                        src={leftPage.dataUrl}
                        alt={`Page ${leftPage.pageNum}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#fdfbf7] flex items-center justify-center text-slate-300 text-xs italic">
                        [Blank Page]
                      </div>
                    )}

                    {/* Left Center Crease Shadow */}
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/40 via-black/15 to-transparent pointer-events-none" />
                    {/* Left Page Turn Hover Curl Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Page Number Footer */}
                    {leftPage && (
                      <div className="absolute bottom-2 left-4 text-[10px] text-slate-500 font-serif">
                        {leftPage.pageNum}
                      </div>
                    )}
                  </div>
                )}

                {/* Center Book Spine Fold (when spread is open) */}
                {currentSpread > 0 && (
                  <div className="relative z-20 w-3.5 h-[480px] sm:h-[540px] bg-gradient-to-r from-black/60 via-[#18110b] to-black/60 shadow-2xl shrink-0" />
                )}

                {/* Right Page */}
                <div
                  onClick={turnNext}
                  className={`relative flex-1 h-[480px] sm:h-[540px] bg-white rounded-r-lg overflow-hidden flex items-center justify-center cursor-pointer shadow-inner group ${
                    currentSpread === 0 ? "rounded-lg" : ""
                  }`}
                >
                  {rightPage ? (
                    <img
                      src={rightPage.dataUrl}
                      alt={`Page ${rightPage.pageNum}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#fdfbf7] flex items-center justify-center text-slate-300 text-xs italic">
                      [Back Cover]
                    </div>
                  )}

                  {/* Right Center Crease Shadow */}
                  {currentSpread > 0 && (
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
                  )}

                  {/* Right Page Turn Hover Curl Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-l from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Page Number Footer */}
                  {rightPage && (
                    <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-serif">
                      {rightPage.pageNum}
                    </div>
                  )}
                </div>

                {/* Animated 3D Flip Leaf */}
                {isFlipping && (
                  <div
                    style={{
                      transform: flipDirection === "next" ? "perspective(1000px) rotateY(-90deg)" : "perspective(1000px) rotateY(90deg)",
                      transformOrigin: flipDirection === "next" ? "left center" : "right center",
                    }}
                    className={`absolute inset-y-2 z-40 w-1/2 bg-white/95 rounded-lg shadow-2xl pointer-events-none transition-transform duration-300 opacity-80 ${
                      flipDirection === "next" ? "right-2" : "left-2"
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Bottom Spread Slider & Navigation Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={turnPrev}
                  disabled={currentSpread <= 0 || isFlipping}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  type="button"
                  onClick={turnNext}
                  disabled={currentSpread >= totalSpreads - 1 || isFlipping}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-30"
                >
                  Next Page <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Spread Scrub Range Slider */}
              <div className="flex-1 max-w-md w-full flex items-center gap-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cover</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, totalSpreads - 1)}
                  value={currentSpread}
                  onChange={(e) => setCurrentSpread(parseInt(e.target.value, 10))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">End</span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Tip: Click left/right pages or use <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-mono text-[10px]">→</kbd> keys
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
