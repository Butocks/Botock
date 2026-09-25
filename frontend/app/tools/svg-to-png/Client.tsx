"use client";

import { useState, useRef } from "react";
import {
  FileImage,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function SvgToPngClient() {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("vector");
  const [scale, setScale] = useState<number>(2); // Default 2x Retina
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [pngDimensions, setPngDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
      setError(null);
      setPngDataUrl(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSvgContent(text);
        renderPng(text, scale, bgColor);
      };
      reader.onerror = () => setError("Failed to read SVG file.");
      reader.readAsText(file);
    }
  };

  const renderPng = (svgText: string, currentScale: number, currentBg: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svgEl = doc.querySelector("svg");

      if (!svgEl) {
        throw new Error("Invalid SVG: <svg> root element was not found.");
      }

      // Determine dimensions
      let baseWidth = 300;
      let baseHeight = 300;

      const viewBox = svgEl.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).filter(Boolean).map(Number);
        if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
          baseWidth = parts[2];
          baseHeight = parts[3];
        }
      } else {
        const wAttr = parseFloat(svgEl.getAttribute("width") || "300");
        const hAttr = parseFloat(svgEl.getAttribute("height") || "300");
        if (!isNaN(wAttr)) baseWidth = wAttr;
        if (!isNaN(hAttr)) baseHeight = hAttr;
      }

      const outWidth = Math.round(baseWidth * currentScale);
      const outHeight = Math.round(baseHeight * currentScale);

      setPngDimensions({ width: outWidth, height: outHeight });

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context.");

      // Background color
      if (currentBg !== "transparent") {
        ctx.fillStyle = currentBg;
        ctx.fillRect(0, 0, outWidth, outHeight);
      }

      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0, outWidth, outHeight);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL("image/png");
        setPngDataUrl(dataUrl);
        setIsProcessing(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("Browser canvas failed to render SVG graphic.");
        setIsProcessing(false);
      };

      img.src = url;
    } catch (err: any) {
      setError(err.message || "Failed to parse and convert SVG.");
      setIsProcessing(false);
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    if (svgContent) renderPng(svgContent, newScale, bgColor);
  };

  const handleBgChange = (newBg: string) => {
    setBgColor(newBg);
    if (svgContent) renderPng(svgContent, scale, newBg);
  };

  const handleDownload = () => {
    if (!pngDataUrl) return;
    const a = document.createElement("a");
    a.href = pngDataUrl;
    a.download = `${fileName}@${scale}x.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileImage className="w-3.5 h-3.5" />
            Client-Side Vector Rasterizer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SVG to PNG Converter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert scalable vector graphics (SVG) into crisp high-resolution PNG images (1x, 2x, 4x) directly in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!svgContent ? (
          /* Upload Card */
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="svg-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-purple-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Upload SVG Vector File
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Drag and drop your .svg file here or browse from your device.
              </p>
              <span className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition">
                Choose SVG File
              </span>
              <input
                id="svg-upload"
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          /* Editor & Export Studio */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Options */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Raster Settings
                </span>
                <label
                  htmlFor="svg-replace"
                  className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Change SVG
                  <input
                    id="svg-replace"
                    type="file"
                    accept=".svg,image/svg+xml"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Resolution Multiplier */}
              <div>
                <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-2">
                  Resolution Scale
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 1, label: "1x Standard" },
                    { val: 2, label: "2x Retina" },
                    { val: 3, label: "3x Ultra" },
                    { val: 4, label: "4x 4K Print" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => handleScaleChange(s.val)}
                      className={`py-2 rounded-xl text-xs font-medium text-center border transition ${
                        scale === s.val
                          ? "bg-purple-600 text-white border-purple-500 font-bold shadow-lg shadow-purple-600/30"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                      }`}
                    >
                      {s.val}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-2">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBgChange("transparent")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                      bgColor === "transparent"
                        ? "bg-purple-600 text-white border-purple-500 font-bold"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    Transparent
                  </button>
                  <button
                    onClick={() => handleBgChange("#ffffff")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                      bgColor === "#ffffff"
                        ? "bg-purple-600 text-white border-purple-500 font-bold"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => handleBgChange("#000000")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                      bgColor === "#000000"
                        ? "bg-purple-600 text-white border-purple-500 font-bold"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    Black
                  </button>
                </div>
              </div>

              {/* Dimensions info */}
              {pngDimensions && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Export Dimensions:</span>
                    <span className="font-mono text-purple-300 font-bold">
                      {pngDimensions.width} × {pngDimensions.height} px
                    </span>
                  </div>
                </div>
              )}

              {/* Download Action */}
              <button
                onClick={handleDownload}
                disabled={!pngDataUrl || isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download High-Res PNG
              </button>
            </div>

            {/* Live Visual Canvas Preview */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-400" />
                  Rasterized Preview
                </span>
              </div>

              {pngDataUrl ? (
                <div className="p-4 rounded-2xl border border-slate-800/80 max-w-full max-h-[380px] overflow-auto flex items-center justify-center bg-[linear-gradient(45deg,#131822_25%,transparent_25%),linear-gradient(-45deg,#131822_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#131822_75%),linear-gradient(-45deg,transparent_75%,#131822_75%)] bg-[size:16px_16px] bg-[#0c1017]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pngDataUrl}
                    alt="Converted SVG to PNG"
                    className="max-h-72 object-contain rounded drop-shadow-xl"
                  />
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500">
                  Processing SVG rendering...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
