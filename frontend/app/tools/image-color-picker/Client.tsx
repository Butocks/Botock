"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Pipette,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Shield,
  CheckCircle2,
  Upload,
  RefreshCw,
  Palette,
} from "lucide-react";

export default function ImageColorPickerClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: string; hsl: string }>({
    hex: "#6366F1",
    rgb: "rgb(99, 102, 241)",
    hsl: "hsl(239, 84%, 67%)",
  });
  const [selectedColor, setSelectedColor] = useState<{ hex: string; rgb: string; hsl: string }>({
    hex: "#6366F1",
    rgb: "rgb(99, 102, 241)",
    hsl: "hsl(239, 84%, 67%)",
  });
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPalette([]);

      const url = URL.createObjectURL(file);
      setImageSrc(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        imgRef.current = img;
        drawToCanvas(img);
      };
    }
  };

  const drawToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas internal dimensions to match natural image size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    // Pick center pixel as initial selection
    const midX = Math.floor(img.naturalWidth / 2);
    const midY = Math.floor(img.naturalHeight / 2);
    getColorAt(midX, midY, true);
  };

  const getColorAt = (x: number, y: number, isSelect: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);

    const colorObj = { hex, rgb, hsl };
    setHoverColor(colorObj);

    if (isSelect) {
      setSelectedColor(colorObj);
      setPalette((prev) => {
        if (!prev.includes(hex)) {
          return [hex, ...prev].slice(0, 10);
        }
        return prev;
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    getColorAt(x, y, false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    getColorAt(x, y, true);
  };

  const handleNativeEyeDropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          // parse hex to rgb
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const rgb = `rgb(${r}, ${g}, ${b})`;
          const hsl = rgbToHsl(r, g, b);
          setSelectedColor({ hex, rgb, hsl });
          setPalette((prev) => (!prev.includes(hex) ? [hex, ...prev].slice(0, 10) : prev));
        }
      } catch (err) {
        // user cancelled eyedropper
      }
    }
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }
  };

  const resetAll = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setSelectedFile(null);
    setImageSrc(null);
    setPalette([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Upload Dropzone */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/80 hover:border-primary/80 bg-card/40 hover:bg-card/70 transition-all rounded-3xl p-10 sm:p-14 text-center cursor-pointer flex flex-col items-center justify-center gap-4 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.avif"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 group-hover:scale-110 transition-transform">
            <Pipette className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Select or Drop Image to Pick Colors
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              PNG, JPG, WebP, SVG supported • Exact HEX, RGB & HSL Codes • 100% In-Browser Privacy
            </p>
          </div>
          <button
            type="button"
            className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:bg-primary/90 transition-all"
          >
            Select Image
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl border border-border shadow-inner flex items-center justify-center"
                style={{ backgroundColor: selectedColor.hex }}
              >
                <Pipette className="w-4 h-4 text-white mix-blend-difference" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  Selected: {selectedColor.hex}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeof window !== "undefined" && "EyeDropper" in window && (
                <button
                  type="button"
                  onClick={handleNativeEyeDropper}
                  className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Pipette className="w-3.5 h-3.5" />
                  <span>Eyedropper Tool</span>
                </button>
              )}
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Color Inspector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* HEX Card */}
            <div
              onClick={() => copyToClipboard(selectedColor.hex, "hex")}
              className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">HEX Code</span>
                <span className="text-base font-mono font-bold text-foreground">{selectedColor.hex}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary">
                {copiedFormat === "hex" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </div>
            </div>

            {/* RGB Card */}
            <div
              onClick={() => copyToClipboard(selectedColor.rgb, "rgb")}
              className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">RGB Values</span>
                <span className="text-xs font-mono font-semibold text-foreground truncate">{selectedColor.rgb}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary">
                {copiedFormat === "rgb" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </div>
            </div>

            {/* HSL Card */}
            <div
              onClick={() => copyToClipboard(selectedColor.hsl, "hsl")}
              className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">HSL Coordinates</span>
                <span className="text-xs font-mono font-semibold text-foreground truncate">{selectedColor.hsl}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary">
                {copiedFormat === "hsl" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Canvas Interactive Image Inspection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Pipette className="w-3.5 h-3.5 text-primary" />
                Hover to inspect pixels, click anywhere on the image to save color
              </span>
              <div className="flex items-center gap-2">
                <span>Hovered:</span>
                <span
                  className="w-4 h-4 rounded-full border border-border inline-block"
                  style={{ backgroundColor: hoverColor.hex }}
                />
                <span className="font-mono">{hoverColor.hex}</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-border/60 flex items-center justify-center max-h-[500px]">
              <canvas
                ref={canvasRef}
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                className="max-w-full max-h-[500px] object-contain cursor-crosshair select-none"
              />
            </div>
          </div>

          {/* Color Palette History */}
          {palette.length > 0 && (
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-fuchsia-500" />
                Saved Color Palette (Click swatch to select)
              </span>
              <div className="flex flex-wrap gap-2.5">
                {palette.map((colorHex, idx) => (
                  <button
                    key={`${colorHex}-${idx}`}
                    onClick={() => {
                      const r = parseInt(colorHex.slice(1, 3), 16);
                      const g = parseInt(colorHex.slice(3, 5), 16);
                      const b = parseInt(colorHex.slice(5, 7), 16);
                      setSelectedColor({
                        hex: colorHex,
                        rgb: `rgb(${r}, ${g}, ${b})`,
                        hsl: rgbToHsl(r, g, b),
                      });
                    }}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-muted/40 hover:bg-muted border border-border transition-all group"
                  >
                    <span
                      className="w-6 h-6 rounded-lg border border-black/20 shadow-sm"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="text-xs font-mono font-medium text-foreground">{colorHex}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fuchsia-500" />
          <span>Pixel-Precise Eyedropper & Palette</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>100% Client-Side In-Browser Security</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>HEX, RGB & HSL Instant Clipboard Copy</span>
        </div>
      </div>
    </div>
  );
}
