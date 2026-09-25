"use client";

import { useState, useMemo } from "react";
import {
  ListFilter,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
} from "lucide-react";

export default function DuplicateLineRemoverClient() {
  const [input, setInput] = useState(
    `apple\nbanana\norange\napple\nbanana\ngrape\nAPPLE\npear`
  );
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortResult, setSortResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const statsAndOutput = useMemo(() => {
    if (!input) {
      return { output: "", originalCount: 0, uniqueCount: 0, removedCount: 0 };
    }

    const rawLines = input.split("\n");
    const originalCount = rawLines.length;

    const seen = new Set<string>();
    const result: string[] = [];

    for (let line of rawLines) {
      if (trimLines) line = line.trim();
      if (removeEmpty && !line) continue;

      const compareKey = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(compareKey)) {
        seen.add(compareKey);
        result.push(line);
      }
    }

    if (sortResult) {
      result.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    }

    const uniqueCount = result.length;
    const removedCount = originalCount - uniqueCount;

    return {
      output: result.join("\n"),
      originalCount,
      uniqueCount,
      removedCount,
    };
  }, [input, caseSensitive, trimLines, removeEmpty, sortResult]);

  const handleCopy = () => {
    if (!statsAndOutput.output) return;
    navigator.clipboard.writeText(statsAndOutput.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([statsAndOutput.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deduplicated-lines.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ListFilter className="w-3.5 h-3.5" />
            List Deduplication Utility
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Remove Duplicate Lines Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Clean and deduplicate lists, emails, keywords, and data entries in your browser instantly.
          </p>
        </div>

        {/* Real-time stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Original Lines
            </span>
            <span className="text-2xl font-black text-slate-200">
              {statsAndOutput.originalCount}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Duplicates Removed
            </span>
            <span className="text-2xl font-black text-rose-400">
              {statsAndOutput.removedCount}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Unique Lines Kept
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {statsAndOutput.uniqueCount}
            </span>
          </div>
        </div>

        {/* Options Bar */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              Case Sensitive
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              Trim Whitespace
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              Remove Empty Lines
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={sortResult}
                onChange={(e) => setSortResult(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              Sort Alphabetically (A-Z)
            </label>
          </div>
        </div>

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raw Input
              </span>
              <button
                onClick={() => setInput("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste list with duplicate items here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Deduplicated Clean Result
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={statsAndOutput.output}
              placeholder="Deduplicated lines will appear here..."
              className="w-full flex-1 bg-transparent text-emerald-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
