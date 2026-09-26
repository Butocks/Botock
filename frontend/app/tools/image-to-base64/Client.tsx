"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode,
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
  Code2,
} from "lucide-react";

export default function ImageToBase64Client() {
  const [file, setFile] = useState<File | null>(null);
  const [base64String, setBase64String] = useState<string>("");
  const [dataUri, setDataUri] = useState<string>("");
  const [format, setFormat] = useState<"data-uri" | "raw-base64" | "html-img" | "css-bg">("data-uri");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const fullDataUri = event.target?.result as string;
        setDataUri(fullDataUri);
        const raw = fullDataUri.split(",")[1] || "";
        setBase64String(raw);
        setIsProcessing(false);
      };
      reader.readAsDataURL(selected);
    }
  };

  const getFormattedOutput = () => {
    if (!dataUri) return "";
    switch (format) {
      case "data-uri":
        return dataUri;
      case "raw-base64":
        return base64String;
      case "html-img":
        return `<img src="${dataUri}" alt="${file?.name || "image"}" />`;
      case "css-bg":
        return `background-image: url("${dataUri}");`;
    }
  };

  const handleCopy = () => {
    const text = getFormattedOutput();
    if (!text) return;
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Code2 className="w-3.5 h-3.5" />
            Binary to Base64 Encoder
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert Image to Base64 Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert JPG, PNG, SVG, or WebP images into Data URI strings, raw Base64 code, or HTML `&lt;img&gt;` tags directly in your browser.
          </p>
        </div>

        {!dataUri ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="image-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-indigo-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select image to encode
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Fast client-side binary encoding with zero cloud server calls.
              </p>
              <span className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 transition">
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
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={dataUri}
                  alt="Thumb"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-800"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-xs">{file?.name}</h4>
                  <p className="text-xs text-slate-400">
                    {((file?.size || 0) / 1024).toFixed(1)} KB Original • {(base64String.length / 1024).toFixed(1)} KB Base64
                  </p>
                </div>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: "data-uri", label: "Data URI" },
                  { id: "raw-base64", label: "Raw Base64" },
                  { id: "html-img", label: "HTML <img>" },
                  { id: "css-bg", label: "CSS Background" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      format === f.id
                        ? "bg-indigo-600 text-white font-bold"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setDataUri("");
                    setBase64String("");
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Output Box */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Formatted Output ({format})
              </span>
              <textarea
                readOnly
                value={getFormattedOutput()}
                className="w-full h-80 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-300 resize-none leading-relaxed focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Inline Web Embedding</h4>
            <p className="text-xs text-slate-400">
              Embed icons, logos, and UI assets directly into HTML, CSS, or JSON payloads without external HTTP image requests.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero File Uploads</h4>
            <p className="text-xs text-slate-400">
              Files are converted using the browser's native `FileReader` API. Your assets never touch an external server.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Multiple Snippet Formats</h4>
            <p className="text-xs text-slate-400">
              Generate raw Base64, complete Data URIs, HTML `&lt;img&gt;` tags, or CSS `url()` snippets with a single click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
