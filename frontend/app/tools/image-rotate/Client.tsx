"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  RotateCw,
  Image as ImageIcon,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";

export default function ImageRotateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Rotation and Flip state
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setDownloadUrl(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleRotate90 = (delta: number) => {
    setRotation((prev) => (prev + delta + 360) % 360);
    setDownloadUrl(null);
  };

  const handleExport = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const is90or270 = rotation === 90 || rotation === 270;
      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;

      // Translate context to center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const url = canvas.toDataURL("image/png", 0.95);
      setDownloadUrl(url);
      setIsProcessing(false);
    };
  };

  const transformStyle = `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <RotateCw className="w-3.5 h-3.5" />
            Image Orientation Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Rotate & Flip Image Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Rotate photos 90°, 180°, 270° or flip horizontally and vertically with instant client-side canvas transformations.
          </p>
        </div>

        {!imageSrc ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="image-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-cyan-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <RotateCw className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select image to rotate or flip
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Instant loss-free rotation: Works with JPG, PNG, and WebP.
              </p>
              <span className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/25 transition">
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
          <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            {/* Visual Canvas Area */}
            <div className="relative w-full h-110 flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-slate-800 p-4 mb-6">
              <img
                src={imageSrc}
                alt="Preview"
                style={{ transform: transformStyle }}
                className="max-h-96 max-w-full object-contain rounded transition-transform duration-200 select-none"
              />
            </div>

            {/* Transform Controls Toolbar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
              <button
                onClick={() => handleRotate90(-90)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <RotateCw className="w-4 h-4 -scale-x-100 text-cyan-400" />
                Rotate Left 90°
              </button>
              <button
                onClick={() => handleRotate90(90)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <RotateCw className="w-4 h-4 text-cyan-400" />
                Rotate Right 90°
              </button>
              <button
                onClick={() => {
                  setFlipH((prev) => !prev);
                  setDownloadUrl(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition ${
                  flipH
                    ? "bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                }`}
              >
                <FlipHorizontal className="w-4 h-4 text-cyan-400" />
                Flip Horizontal
              </button>
              <button
                onClick={() => {
                  setFlipV((prev) => !prev);
                  setDownloadUrl(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition ${
                  flipV
                    ? "bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                }`}
              >
                <FlipVertical className="w-4 h-4 text-cyan-400" />
                Flip Vertical
              </button>
            </div>

            {/* Action buttons */}
            <div className="w-full">
              {!downloadUrl ? (
                <button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply & Save Transformed Image
                </button>
              ) : (
                <a
                  href={downloadUrl}
                  download={`rotated-${file?.name || "image.png"}`}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Transformed Image
                </a>
              )}
            </div>

            <button
              onClick={() => {
                setFile(null);
                setImageSrc(null);
                setDownloadUrl(null);
              }}
              className="mt-4 text-xs text-slate-400 hover:text-red-400 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Choose different image
            </button>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <RotateCw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Instant Geometric Rotation</h4>
            <p className="text-xs text-slate-400">
              Rotates image coordinate matrices with 0ms delay directly inside the HTML5 Canvas context.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% In-Browser Privacy</h4>
            <p className="text-xs text-slate-400">
              Transformations take place locally in your device memory with zero server uploads or external tracking.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Mirror & Mirror Flip</h4>
            <p className="text-xs text-slate-400">
              Correct flipped selfie cameras and mirror photos along horizontal and vertical axes effortlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
