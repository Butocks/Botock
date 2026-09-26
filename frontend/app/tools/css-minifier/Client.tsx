"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Percent,
} from "lucide-react";

export default function CssMinifierClient() {
  const [cssInput, setCssInput] = useState(
    `/* Header Stylesheet */
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #080b0f;
  margin: 0px 0px 0px 0px;
}

/* Navigation Links */
.header-container .nav-link {
  color: #a855f7;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
}

.header-container .nav-link:hover {
  color: #ffffff;
}`
  );
  const [copied, setCopied] = useState(false);

  const { minified, rawSize, minSize, savedPercent } = useMemo(() => {
    if (!cssInput.trim()) {
      return { minified: "", rawSize: 0, minSize: 0, savedPercent: 0 };
    }

    let min = cssInput;

    // 1. Remove comments
    min = min.replace(/\/\*[\s\S]*?\*\//g, "");

    // 2. Remove space around colons, braces, semicolons, commas
    min = min.replace(/\s*([\{\}\:\;\,])\s*/g, "$1");

    // 3. Replace multiple spaces / newlines with single space
    min = min.replace(/\s+/g, " ");

    // 4. Remove space before opening brace
    min = min.replace(/\s+\{/g, "{");

    // 5. Replace 0px, 0em, 0rem with 0
    min = min.replace(/(:|\s)0(px|em|rem|%|pt)/g, "$10");

    // 6. Remove trailing semicolon inside blocks
    min = min.replace(/;}/g, "}");

    // 7. Trim start & end
    min = min.trim();

    const rawSize = new Blob([cssInput]).size;
    const minSize = new Blob([min]).size;
    const saved = rawSize > 0 ? (((rawSize - minSize) / rawSize) * 100).toFixed(1) : 0;

    return {
      minified: min,
      rawSize,
      minSize,
      savedPercent: Number(saved),
    };
  }, [cssInput]);

  const handleCopy = () => {
    if (!minified) return;
    copyToClipboard(minified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([minified], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "style.min.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Zero-Latency Code Compression
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CSS Minifier Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Compress CSS stylesheets by stripping comments and redundant whitespace directly in your browser.
          </p>
        </div>

        {/* Compression Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Original Size
            </span>
            <span className="text-2xl font-black text-slate-200">
              {rawSize} <span className="text-xs font-normal text-slate-400">bytes</span>
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Minified Size
            </span>
            <span className="text-2xl font-black text-purple-400">
              {minSize} <span className="text-xs font-normal text-slate-400">bytes</span>
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Bandwidth Saved
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {savedPercent}%
            </span>
          </div>
        </div>

        {/* Dual Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raw CSS Input
              </span>
              <button
                onClick={() => setCssInput("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={cssInput}
              onChange={(e) => setCssInput(e.target.value)}
              placeholder="Paste CSS stylesheet here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Minified Output
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!minified}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!minified}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3 h-3" />
                  Download .min.css
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={minified}
              placeholder="Minified CSS will appear here..."
              className="w-full flex-1 bg-transparent text-purple-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
