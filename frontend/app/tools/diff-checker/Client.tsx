"use client";

import { useState, useMemo } from "react";
import {
  GitCompare,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Columns,
  List,
  Plus,
  Minus,
} from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  leftLine?: number;
  rightLine?: number;
}

export default function DiffCheckerClient() {
  const [original, setOriginal] = useState(
    `function calculateTax(subtotal) {
  const taxRate = 0.08;
  return subtotal * taxRate;
}`
  );
  const [modified, setModified] = useState(
    `function calculateTax(subtotal, state = "CA") {
  const taxRate = state === "NY" ? 0.088 : 0.0725;
  const discount = subtotal > 100 ? 5 : 0;
  return (subtotal - discount) * taxRate;
}`
  );
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [copied, setCopied] = useState(false);

  // Compute Myers-like line diff
  const diffResult = useMemo(() => {
    const origLines = original.split("\n");
    const modLines = modified.split("\n");

    const n = origLines.length;
    const m = modLines.length;

    // LCS Matrix
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
      new Array(m + 1).fill(0)
    );

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (origLines[i] === modLines[j]) {
          dp[i + 1][j + 1] = dp[i][j] + 1;
        } else {
          dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    // Backtrack to find diff
    const diff: DiffLine[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
        diff.unshift({
          type: "unchanged",
          text: origLines[i - 1],
          leftLine: i,
          rightLine: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({
          type: "added",
          text: modLines[j - 1],
          rightLine: j,
        });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        diff.unshift({
          type: "removed",
          text: origLines[i - 1],
          leftLine: i,
        });
        i--;
      }
    }

    const additions = diff.filter((d) => d.type === "added").length;
    const deletions = diff.filter((d) => d.type === "removed").length;

    return { diff, additions, deletions };
  }, [original, modified]);

  const handleCopyUnified = () => {
    const patch = diffResult.diff
      .map((d) => {
        const prefix = d.type === "added" ? "+ " : d.type === "removed" ? "- " : "  ";
        return prefix + d.text;
      })
      .join("\n");

    navigator.clipboard.writeText(patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            Zero-Latency Code & Text Diff
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Online Text & Code Diff Checker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Compare two texts or code files side-by-side to highlight additions, deletions, and modifications.
          </p>
        </div>

        {/* Input Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Original Text */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Original Text (Before)
              </span>
              <button
                onClick={() => setOriginal("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste original text or code here..."
              className="w-full h-48 bg-transparent text-slate-200 placeholder-slate-600 resize-y focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Modified Text */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Modified Text (After)
              </span>
              <button
                onClick={() => setModified("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="Paste updated text or code here..."
              className="w-full h-48 bg-transparent text-slate-200 placeholder-slate-600 resize-y focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Diff Result View Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1">
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === "split"
                    ? "bg-purple-600 text-white font-semibold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Side by Side
              </button>
              <button
                onClick={() => setViewMode("unified")}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === "unified"
                    ? "bg-purple-600 text-white font-semibold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Unified Diff
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" />
                {diffResult.additions} additions
              </span>
              <span className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono font-semibold flex items-center gap-1">
                <Minus className="w-3 h-3" />
                {diffResult.deletions} deletions
              </span>
            </div>
          </div>

          <button
            onClick={handleCopyUnified}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied Patch!" : "Copy Diff Patch"}
          </button>
        </div>

        {/* Diff Display Container */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 shadow-xl overflow-x-auto">
          {viewMode === "unified" ? (
            <div className="font-mono text-xs leading-relaxed space-y-0.5">
              {diffResult.diff.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded ${
                    line.type === "added"
                      ? "bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500"
                      : line.type === "removed"
                      ? "bg-rose-500/15 text-rose-300 border-l-2 border-rose-500"
                      : "text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <span className="w-6 shrink-0 text-slate-600 select-none">
                    {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1">
                    {line.text || "\u00A0"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 font-mono text-xs leading-relaxed">
              <div className="space-y-0.5 border-r border-slate-800/80 pr-2">
                <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block mb-2">
                  Original
                </span>
                {diffResult.diff.map((line, idx) => {
                  if (line.type === "added") return null;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start px-2 py-0.5 rounded ${
                        line.type === "removed"
                          ? "bg-rose-500/15 text-rose-300 border-l-2 border-rose-500"
                          : "text-slate-300 hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-2">
                        {line.leftLine || ""}
                      </span>
                      <span className="whitespace-pre-wrap break-all flex-1">
                        {line.text || "\u00A0"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-0.5 pl-2">
                <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block mb-2">
                  Modified
                </span>
                {diffResult.diff.map((line, idx) => {
                  if (line.type === "removed") return null;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start px-2 py-0.5 rounded ${
                        line.type === "added"
                          ? "bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500"
                          : "text-slate-300 hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-2">
                        {line.rightLine || ""}
                      </span>
                      <span className="whitespace-pre-wrap break-all flex-1">
                        {line.text || "\u00A0"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
