"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Trash2,
  Sliders,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
} from "lucide-react";

export default function ImageFiltersClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Filters state
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);

  const [activePreset, setActivePreset] = useState<string>("original");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presets = [
    { id: "original", label: "Original", b: 100, c: 100, s: 100, sep: 0, g: 0, h: 0 },
    { id: "vintage", label: "Vintage Warm", b: 110, c: 90, s: 115, sep: 45, g: 0, h: -10 },
    { id: "bw-noir", label: "Classic Noir", b: 105, c: 140, s: 0, sep: 0, g: 100, h: 0 },
    { id: "vibrant", label: "Vibrant Pop", b: 105, c: 120, s: 155, sep: 0, g: 0, h: 0 },
    { id: "cool-fade", label: "Cool Fade", b: 100, c: 95, s: 85, sep: 10, g: 15, h: 180 },
    { id: "cyberpunk", label: "Cyberpunk", b: 110, c: 130, s: 180, sep: 0, g: 0, h: 90 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setDownloadUrl(null);
      resetFilters();

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    setBrightness(preset.b);
    setContrast(preset.c);
    setSaturation(preset.s);
    setSepia(preset.sep);
    setGrayscale(preset.g);
    setHueRotate(preset.h);
    setBlur(0);
    setInvert(0);
    setDownloadUrl(null);
  };

  const resetFilters = () => {
    applyPreset(presets[0]);
  };

  const filterStyleString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%) hue-rotate(${hueRotate}deg)`;

  const handleExport = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Apply CSS filter to Canvas context
      ctx.filter = filterStyleString;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const url = canvas.toDataURL("image/png", 0.95);
      setDownloadUrl(url);
    };
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-pink-500/20 selection:text-pink-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sliders className="w-3.5 h-3.5" />
            Photo Effects & Color Grading
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Photo Filters & Effects Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Fine-tune brightness, contrast, saturation, and cinematic film presets directly on your photos with GPU-accelerated canvas filters.
          </p>
        </div>

        {!imageSrc ? (
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="image-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-pink-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select photo or graphic image
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Full-resolution GPU rendering: 100% private in-browser editing.
              </p>
              <span className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs shadow-lg shadow-pink-600/25 transition">
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
            {/* Visual Canvas View */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                <div className="relative max-h-130 w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-slate-800 p-2">
                  <img
                    src={imageSrc}
                    alt="Preview"
                    style={{ filter: filterStyleString }}
                    className="max-h-120 max-w-full object-contain rounded transition-all duration-75 select-none"
                  />
                </div>

                {/* Preset Strip */}
                <div className="w-full mt-4 flex items-center justify-start gap-2 overflow-x-auto pb-2">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        activePreset === p.id
                          ? "bg-pink-600 text-white shadow-sm"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
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
                    Change photo
                  </button>
                </div>
              </div>
            </div>

            {/* Adjustments Sidebar */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                  Manual Adjustments
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-pink-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={brightness}
                    onChange={(e) => {
                      setBrightness(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={contrast}
                    onChange={(e) => {
                      setContrast(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Saturation</span>
                    <span>{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={saturation}
                    onChange={(e) => {
                      setSaturation(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Sepia Warmth</span>
                    <span>{sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sepia}
                    onChange={(e) => {
                      setSepia(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Grayscale</span>
                    <span>{grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={grayscale}
                    onChange={(e) => {
                      setGrayscale(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Soft Blur</span>
                    <span>{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={blur}
                    onChange={(e) => {
                      setBlur(parseInt(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              {!downloadUrl ? (
                <button
                  onClick={handleExport}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Render & Prepare Download
                </button>
              ) : (
                <a
                  href={downloadUrl}
                  download={`filtered-${file?.name || "image.png"}`}
                  className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Filtered Image
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">GPU Accelerated Rendering</h4>
            <p className="text-xs text-slate-400">
              Hardware-accelerated color matrices compute instant adjustments at 60 FPS without lag.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero File Uploads</h4>
            <p className="text-xs text-slate-400">
              Photos remain strictly in your browser memory for absolute privacy and zero server bandwidth costs.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Full Source Resolution</h4>
            <p className="text-xs text-slate-400">
              Preserves original pixel dimensions upon export without downscaling or lossy compression artifacts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
