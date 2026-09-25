"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Shuffle,
  Download,
  SortAsc,
  SortDesc,
} from "lucide-react";

export default function TextSorterClient() {
  const [input, setInput] = useState(
    `Zebra\napple\nMonkey\n100 items\n10 items\n2 items\nbanana\nOrange`
  );
  const [sortType, setSortType] = useState<
    "az" | "za" | "natural" | "length-asc" | "length-desc" | "reverse" | "shuffle"
  >("az");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [copied, setCopied] = useState(false);

  // Random seed state to trigger shuffle re-computation
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const sortedOutput = useMemo(() => {
    if (!input) return "";

    let lines = input.split("\n");
    if (trimLines) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter(Boolean);

    const copy = [...lines];

    switch (sortType) {
      case "az":
        copy.sort((a, b) =>
          caseSensitive
            ? a.localeCompare(b)
            : a.toLowerCase().localeCompare(b.toLowerCase())
        );
        break;
      case "za":
        copy.sort((a, b) =>
          caseSensitive
            ? b.localeCompare(a)
            : b.toLowerCase().localeCompare(a.toLowerCase())
        );
        break;
      case "natural":
        copy.sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: caseSensitive ? "variant" : "base" })
        );
        break;
      case "length-asc":
        copy.sort((a, b) => a.length - b.length || a.localeCompare(b));
        break;
      case "length-desc":
        copy.sort((a, b) => b.length - a.length || a.localeCompare(b));
        break;
      case "reverse":
        copy.reverse();
        break;
      case "shuffle":
        // Fisher-Yates
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        break;
    }

    return copy.join("\n");
  }, [input, sortType, caseSensitive, trimLines, removeEmpty, shuffleSeed]);

  const handleCopy = () => {
    if (!sortedOutput) return;
    navigator.clipboard.writeText(sortedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sortedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sorted-${sortType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Line Ordering Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Text & List Sorter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Sort text lists alphabetically (A-Z / Z-A), natural alphanumeric, by line length, reverse, or shuffle.
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-6 backdrop-blur-sm shadow-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "az", label: "A → Z (Alphabetical)", icon: SortAsc },
              { id: "za", label: "Z → A (Reverse Alpha)", icon: SortDesc },
              { id: "natural", label: "1, 2, 10 (Natural Numeric)", icon: ArrowUpDown },
              { id: "length-asc", label: "Length (Shortest First)", icon: ArrowUpDown },
              { id: "length-desc", label: "Length (Longest First)", icon: ArrowUpDown },
              { id: "reverse", label: "Reverse Entire List", icon: ArrowUpDown },
              { id: "shuffle", label: "Random Shuffle", icon: Shuffle },
            ].map((btn) => {
              const Icon = btn.icon;
              const isActive = sortType === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    setSortType(btn.id as any);
                    if (btn.id === "shuffle") setShuffleSeed((s) => s + 1);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30"
                      : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {btn.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-800/60 text-xs">
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
          </div>
        </div>

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Unsorted Source
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
              placeholder="Paste lines to sort here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sorted Output
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
              value={sortedOutput}
              placeholder="Sorted lines appear here..."
              className="w-full flex-1 bg-transparent text-purple-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
