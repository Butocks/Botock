"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  Code,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  AlignLeft,
} from "lucide-react";

export default function CssBeautifierClient() {
  const [cssInput, setCssInput] = useState(
    `.card{background-color:#1e293b;border-radius:12px;padding:24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}.card h2{font-size:18px;color:#f8fafc;margin-bottom:8px}.card p{color:#94a3b8;font-size:14px;line-height:1.5}`
  );
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);

  const beautified = useMemo(() => {
    if (!cssInput.trim()) return "";

    const indent = " ".repeat(indentSize);
    let s = cssInput;

    // Normalize spacing
    s = s.replace(/\s+/g, " ");
    s = s.replace(/\{/g, " {\n");
    s = s.replace(/\}/g, "\n}\n\n");
    s = s.replace(/;\s*/g, ";\n");

    const lines = s.split("\n");
    const result: string[] = [];
    let depth = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.endsWith("}")) {
        depth = Math.max(0, depth - 1);
      }

      if (line.startsWith("}")) {
        result.push("}".repeat(depth) + line);
      } else {
        result.push((depth > 0 ? indent.repeat(depth) : "") + line);
      }

      if (line.endsWith("{")) {
        depth++;
      }
    }

    return result.join("\n").trim() + "\n";
  }, [cssInput, indentSize]);

  const handleCopy = () => {
    if (!beautified) return;
    copyToClipboard(beautified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([beautified], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "beautified.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <AlignLeft className="w-3.5 h-3.5" />
            CSS Formatter & Beautifier
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CSS Beautifier & Formatter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Format minified or unindented CSS stylesheets into clean, human-readable code.
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Indentation:</span>
            <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700/60">
              <button
                onClick={() => setIndentSize(2)}
                className={`px-3 py-1 rounded text-xs font-mono transition ${
                  indentSize === 2
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2 Spaces
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-3 py-1 rounded text-xs font-mono transition ${
                  indentSize === 4
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                4 Spaces
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!beautified}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!beautified}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSS
            </button>
          </div>
        </div>

        {/* Dual Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raw / Minified CSS
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
              placeholder="Paste unformatted or minified CSS here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Beautified Output
              </span>
            </div>
            <textarea
              readOnly
              value={beautified}
              placeholder="Beautified CSS will appear here..."
              className="w-full flex-1 bg-transparent text-purple-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
