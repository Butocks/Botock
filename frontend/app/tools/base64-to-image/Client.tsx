"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode,
  Image as ImageIcon,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Code2,
} from "lucide-react";

export default function Base64ToImageClient() {
  const [inputString, setInputString] = useState<string>("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [imageFormat, setImageFormat] = useState<string>("png");
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = () => {
    setError(null);
    if (!inputString.trim()) {
      setError("Please paste a valid Base64 string or Data URI.");
      return;
    }

    try {
      let cleanInput = inputString.trim();

      // If raw base64 string without data prefix
      if (!cleanInput.startsWith("data:image/")) {
        cleanInput = `data:image/${imageFormat};base64,${cleanInput.replace(/^data:image\/[^;]+;base64,/, "")}`;
      } else {
        // Detect format from header
        const match = cleanInput.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
        if (match && match[1]) {
          setImageFormat(match[1]);
        }
      }

      const img = new Image();
      img.onload = () => {
        setPreviewSrc(cleanInput);
        // Estimate byte size from base64 length
        const base64Len = cleanInput.split(",")[1]?.length || cleanInput.length;
        setFileSize(Math.round((base64Len * 3) / 4));
      };
      img.onerror = () => {
        setError("Invalid Base64 image payload. Please check the string.");
      };
      img.src = cleanInput;
    } catch (err: any) {
      setError("Failed to decode Base64 image: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ImageIcon className="w-3.5 h-3.5" />
            Base64 to Binary Image Decoder
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert Base64 to Image Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Decode raw Base64 strings or Data URIs into downloadable JPG, PNG, or WebP image files directly in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Base64 Input Box */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Paste Base64 Code or Data URI
              </span>
              <button
                onClick={() => {
                  setInputString("");
                  setPreviewSrc(null);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-red-400 transition"
              >
                Clear Input
              </button>
            </div>
            <textarea
              placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              className="w-full h-80 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-teal-300 resize-none leading-relaxed focus:outline-none focus:border-teal-500"
            />
            <div className="flex items-center gap-3">
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="png">PNG Image</option>
                <option value="jpeg">JPEG Image</option>
                <option value="webp">WebP Image</option>
                <option value="svg+xml">SVG Vector</option>
              </select>
              <button
                onClick={handleDecode}
                disabled={!inputString.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Decode & Preview Image
              </button>
            </div>
          </div>

          {/* Rendered Preview Card */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4 self-start">
              Decoded Image Output
            </span>

            {previewSrc ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="max-h-72 w-full flex items-center justify-center bg-black/40 border border-slate-800 rounded-xl p-3 overflow-hidden">
                  <img src={previewSrc} alt="Decoded result" className="max-h-64 object-contain rounded" />
                </div>
                <div className="text-xs text-slate-400 text-center">
                  Estimated File Size: {(fileSize / 1024).toFixed(1)} KB
                </div>
                <a
                  href={previewSrc}
                  download={`decoded-image.${imageFormat === "svg+xml" ? "svg" : imageFormat}`}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Image File
                </a>
              </div>
            ) : (
              <div className="h-72 w-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                <span>Paste your Base64 string on the left to preview and download image.</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Instant Binary Reconstruction</h4>
            <p className="text-xs text-slate-400">
              Decodes raw Base64 and Data URI payloads into binary blobs for instant download.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero File Uploads</h4>
            <p className="text-xs text-slate-400">
              Decoding occurs completely in your web browser. No strings are logged or sent across network requests.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Auto Header Detection</h4>
            <p className="text-xs text-slate-400">
              Automatically identifies image MIME types (PNG, JPG, WebP, SVG) or lets you specify custom fallback formats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
