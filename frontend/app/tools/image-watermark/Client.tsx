"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Stamp,
  Image as ImageIcon,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Type,
} from "lucide-react";

export default function ImageWatermarkClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Watermark parameters
  const [text, setText] = useState<string>("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState<number>(42);
  const [color, setColor] = useState<string>("#ffffff");
  const [opacity, setOpacity] = useState<number>(50);
  const [position, setPosition] = useState<"center" | "bottom-right" | "bottom-left" | "top-right" | "top-left">("center");
  const [angle, setAngle] = useState<number>(-25);

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setDownloadUrl(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleExport = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw base photo
      ctx.drawImage(img, 0, 0);

      // Setup watermark style
      ctx.save();
      const scaledFontSize = Math.max(16, (fontSize / 600) * img.width);
      ctx.font = `bold ${scaledFontSize}px sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity / 100;

      let x = canvas.width / 2;
      let y = canvas.height / 2;
      const metrics = ctx.measureText(text);

      if (position === "center") {
        x = canvas.width / 2;
        y = canvas.height / 2;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      } else if (position === "bottom-right") {
        x = canvas.width - metrics.width - 40;
        y = canvas.height - 40;
        ctx.textAlign = "left";
      } else if (position === "bottom-left") {
        x = 40;
        y = canvas.height - 40;
        ctx.textAlign = "left";
      } else if (position === "top-right") {
        x = canvas.width - metrics.width - 40;
        y = 60;
        ctx.textAlign = "left";
      } else if (position === "top-left") {
        x = 40;
        y = 60;
        ctx.textAlign = "left";
      }

      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();

      const url = canvas.toDataURL("image/png", 0.95);
      setDownloadUrl(url);
      setIsProcessing(false);
    };
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Stamp className="w-3.5 h-3.5" />
            Copyright & Watermark Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Add Watermark to Image Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Protect your photography and digital artwork with customizable copyright stamps, custom opacity, and angles directly in your browser.
          </p>
        </div>

        {!imageSrc ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="image-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-amber-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Stamp className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select photo or artwork to watermark
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Protects copyright: burns text stamps natively into the image.
              </p>
              <span className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-600/25 transition">
                Choose Image File
              </span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Preview */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                <div className="relative max-h-130 w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-slate-800 p-2">
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="max-h-120 max-w-full object-contain rounded select-none"
                  />

                  {/* Simulated Overlaid Watermark Preview */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                    <span
                      style={{
                        color,
                        opacity: opacity / 100,
                        fontSize: `${fontSize}px`,
                        transform: `rotate(${angle}deg)`,
                      }}
                      className="font-extrabold select-none tracking-wider drop-shadow-md text-center max-w-full break-words"
                    >
                      {text}
                    </span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between mt-4 text-xs text-slate-400">
                  <span>{file?.name}</span>
                  <button
                    onClick={() => {
                      setFile(null);
                      setImageSrc(null);
                      setDownloadUrl(null);
                    }}
                    className="hover:text-red-400 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Change image
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
              <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                Watermark Settings
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Watermark Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setDownloadUrl(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Font Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setDownloadUrl(null);
                    }}
                    className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Opacity ({opacity}%)</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={opacity}
                    onChange={(e) => {
                      setOpacity(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Scale ({fontSize}px)</label>
                  <input
                    type="range"
                    min={16}
                    max={90}
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Angle ({angle}°)</label>
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    value={angle}
                    onChange={(e) => {
                      setAngle(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "center", label: "Center" },
                    { id: "bottom-right", label: "Bottom R" },
                    { id: "bottom-left", label: "Bottom L" },
                    { id: "top-right", label: "Top R" },
                    { id: "top-left", label: "Top L" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPosition(p.id as any);
                        setDownloadUrl(null);
                      }}
                      className={`py-1.5 px-2 text-xs rounded-lg border transition ${
                        position === p.id
                          ? "bg-amber-600/20 border-amber-500 text-amber-300 font-semibold"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {!downloadUrl ? (
                <button
                  onClick={handleExport}
                  disabled={isProcessing || !text.trim()}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Burn Watermark into Image
                </button>
              ) : (
                <a
                  href={downloadUrl}
                  download={`watermarked-${file?.name || "image.png"}`}
                  className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Watermarked Image
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Stamp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Permanent Canvas Burning</h4>
            <p className="text-xs text-slate-400">
              The watermark is baked directly into the raster image pixels, preventing unwanted scrapers from removing layers.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              Your confidential photos and proprietary creative assets never leave your device. Zero remote server access.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Retains Full Clarity</h4>
            <p className="text-xs text-slate-400">
              Exports crisp PNG or JPG formats without downsampling original photo resolution or blurring fine details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
