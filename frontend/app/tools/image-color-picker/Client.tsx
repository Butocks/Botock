"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Pipette,
  Image as ImageIcon,
  Download,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";

interface ColorItem {
  hex: string;
  rgb: string;
  hsl: string;
}

export default function ImageColorPickerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);
  const [palette, setPalette] = useState<ColorItem[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setSelectedColor(null);
      setPalette([]);

      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setImageSrc(src);

        const img = new Image();
        img.onload = () => {
          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);

          // Extract dominant palette sample points
          extractSamplePalette(ctx, img.width, img.height);
        };
        img.src = src;
      };
      reader.readAsDataURL(selected);
    }
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  const extractSamplePalette = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const samples: ColorItem[] = [];
    const stepX = Math.floor(width / 4);
    const stepY = Math.floor(height / 4);

    for (let x = stepX / 2; x < width; x += stepX) {
      for (let y = stepY / 2; y < height; y += stepY) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);

        if (!samples.some((s) => s.hex === hex)) {
          samples.push({ hex, rgb, hsl });
        }
      }
    }
    setPalette(samples.slice(0, 10));
    if (samples.length > 0) {
      setSelectedColor(samples[0]);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);

    const item: ColorItem = { hex, rgb, hsl };
    setSelectedColor(item);

    if (!palette.some((p) => p.hex === hex)) {
      setPalette((prev) => [item, ...prev.slice(0, 9)]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(id);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-pink-500/20 selection:text-pink-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Pipette className="w-3.5 h-3.5" />
            Hex, RGB & HSL Eyedropper
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Image Color Picker & Palette Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Click anywhere on an uploaded image to inspect exact HEX, RGB, and HSL color values or generate an automatic color palette.
          </p>
        </div>

        {!imageSrc ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="image-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-pink-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <Pipette className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select image to pick colors
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Interactive eyedropper: Inspect pixel color codes with zero server uploads.
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
            {/* Interactive Canvas Canvas */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                <div className="relative max-h-130 w-full flex items-center justify-center overflow-auto rounded-xl bg-black/40 border border-slate-800 p-2">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="max-h-120 max-w-full object-contain cursor-crosshair rounded select-none shadow-2xl"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Click anywhere on the photo to pick and sample that exact pixel
                </p>

                <div className="w-full flex items-center justify-between mt-4 text-xs text-slate-400">
                  <span>{file?.name}</span>
                  <button
                    onClick={() => {
                      setFile(null);
                      setImageSrc(null);
                      setSelectedColor(null);
                    }}
                    className="hover:text-red-400 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Change image
                  </button>
                </div>
              </div>
            </div>

            {/* Color Swatch & Palette Sidebar */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
              {selectedColor ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                    Sampled Color
                  </h3>

                  {/* Big Color Card */}
                  <div
                    style={{ backgroundColor: selectedColor.hex }}
                    className="w-full h-24 rounded-xl shadow-inner border border-white/10 flex items-end p-3 transition-colors"
                  >
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {selectedColor.hex}
                    </span>
                  </div>

                  {/* Formats and Copy Buttons */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">HEX</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-semibold">{selectedColor.hex}</span>
                        <button
                          onClick={() => handleCopy(selectedColor.hex, "hex")}
                          className="text-pink-400 hover:text-white"
                        >
                          {copiedFormat === "hex" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">RGB</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-semibold">{selectedColor.rgb}</span>
                        <button
                          onClick={() => handleCopy(selectedColor.rgb, "rgb")}
                          className="text-pink-400 hover:text-white"
                        >
                          {copiedFormat === "rgb" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">HSL</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-semibold">{selectedColor.hsl}</span>
                        <button
                          onClick={() => handleCopy(selectedColor.hsl, "hsl")}
                          className="text-pink-400 hover:text-white"
                        >
                          {copiedFormat === "hsl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Extracted Palette */}
              {palette.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-3">
                    Detected Palette Swatches
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {palette.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(item)}
                        style={{ backgroundColor: item.hex }}
                        title={item.hex}
                        className="w-full h-10 rounded-lg border border-white/10 hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
              <Pipette className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Pixel Precision Eyedropper</h4>
            <p className="text-xs text-slate-400">
              Inspect pixel-perfect color hex values directly on UI mockups, logos, photos, and digital artwork.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero File Uploads</h4>
            <p className="text-xs text-slate-400">
              Color sampling uses browser native Canvas 2D `getImageData`. Your images never leave your computer.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Automatic Color Palette</h4>
            <p className="text-xs text-slate-400">
              Extracts dominant branding swatches with instant one-click copying for CSS stylesheets and Tailwind classes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
