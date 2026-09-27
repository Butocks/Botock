"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  ListFilter,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  Upload,
  Table,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function DuplicateLineRemoverClient() {
  const [input, setInput] = useState(
    `apple\nbanana\norange\napple\nbanana\ngrape\nAPPLE\npear`
  );
  const [fileName, setFileName] = useState<string>("");
  const [fileExt, setFileExt] = useState<string>("txt");

  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortResult, setSortResult] = useState(false);
  const [csvColumnIndex, setCsvColumnIndex] = useState<number | null>(null);

  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const ext = file.name.split(".").pop() || "txt";
      setFileExt(ext);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content || "");
      };
      reader.readAsText(file);
    }
  };

  const csvHeaders = useMemo(() => {
    const firstLine = input.split("\n")[0] || "";
    if (firstLine.includes(",")) return firstLine.split(",");
    if (firstLine.includes("\t")) return firstLine.split("\t");
    return null;
  }, [input]);

  const statsAndOutput = useMemo(() => {
    if (!input) {
      return { output: "", originalCount: 0, uniqueCount: 0, removedCount: 0, duplicatesReport: [] };
    }

    let rawLines = input.split("\n");
    const originalCount = rawLines.length;

    let headerLine = "";
    if (csvColumnIndex !== null && rawLines.length > 1) {
      headerLine = rawLines[0];
      rawLines = rawLines.slice(1);
    }

    const seen = new Set<string>();
    const frequency: Record<string, number> = {};
    const result: string[] = [];

    const getDedupKey = (line: string): string => {
      let candidate = line;
      if (csvColumnIndex !== null) {
        const cols = line.includes(",") ? line.split(",") : line.split("\t");
        candidate = cols[csvColumnIndex] || line;
      }
      if (trimLines) candidate = candidate.trim();
      return caseSensitive ? candidate : candidate.toLowerCase();
    };

    for (let line of rawLines) {
      if (trimLines) line = line.trim();
      if (removeEmpty && !line) continue;

      const compareKey = getDedupKey(line);
      frequency[compareKey] = (frequency[compareKey] || 0) + 1;

      if (!seen.has(compareKey)) {
        seen.add(compareKey);
        result.push(line);
      }
    }

    if (sortResult) {
      result.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      );
    }

    // Top duplicates list
    const duplicatesReport = Object.entries(frequency)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const finalOutput = headerLine ? [headerLine, ...result].join("\n") : result.join("\n");
    const uniqueCount = result.length + (headerLine ? 1 : 0);

    return {
      output: finalOutput,
      originalCount,
      uniqueCount,
      removedCount: originalCount - uniqueCount,
      duplicatesReport,
    };
  }, [input, caseSensitive, trimLines, removeEmpty, sortResult, csvColumnIndex]);

  const handleCopy = () => {
    if (!statsAndOutput.output) return;
    copyToClipboard(statsAndOutput.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([statsAndOutput.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? `deduped-${fileName}` : `clean-list.${fileExt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reductionPercent =
    statsAndOutput.originalCount > 0
      ? Math.round((statsAndOutput.removedCount / statsAndOutput.originalCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ListFilter className="w-3.5 h-3.5" />
            Set Theory Deduplication
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Remove Duplicate Lines
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Clean, deduplicate, and analyze large text files, emails, CSV datasets, and keywords with zero server uploads.
          </p>
        </div>

        {/* File Drag & Drop Strip */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {fileName ? fileName : "Upload or Drop Data File"}
              </span>
              <span className="text-[11px] text-slate-500">
                Supports TXT, CSV, TSV, JSON, and LOG files
              </span>
            </div>
          </div>

          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer">
            Browse File
            <input
              type="file"
              accept=".txt,.csv,.tsv,.json,.log"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Original Lines
            </span>
            <span className="text-2xl font-extrabold text-white font-mono">
              {statsAndOutput.originalCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
              Unique Lines Left
            </span>
            <span className="text-2xl font-extrabold text-emerald-300 font-mono">
              {statsAndOutput.uniqueCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
              Duplicates Purged
            </span>
            <span className="text-2xl font-extrabold text-rose-400 font-mono">
              {statsAndOutput.removedCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">
              Dataset Reduction
            </span>
            <span className="text-2xl font-extrabold text-purple-300 font-mono">
              {reductionPercent}%
            </span>
          </div>
        </div>

        {/* Options Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl mb-6 space-y-4">
          {/* CSV Column Picker if detected */}
          {csvHeaders && csvHeaders.length > 1 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3">
              <Table className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-bold text-slate-300">Deduplicate Based on CSV Column:</span>
              <select
                value={csvColumnIndex !== null ? csvColumnIndex : "full"}
                onChange={(e) =>
                  setCsvColumnIndex(e.target.value === "full" ? null : Number(e.target.value))
                }
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none"
              >
                <option value="full">Match Entire Line</option>
                {csvHeaders.map((h, i) => (
                  <option key={i} value={i}>
                    Column {i + 1}: &quot;{h.trim().slice(0, 20)}&quot;
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Case Sensitive</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Trim Spaces</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Remove Empty Lines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sortResult}
                onChange={(e) => setSortResult(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Alphabetically Sort Unique Results</span>
            </label>
          </div>
        </div>

        {/* Dual Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Original Input Data
              </label>
              {input && (
                <button
                  onClick={() => {
                    setInput("");
                    setFileName("");
                  }}
                  className="text-xs text-slate-500 hover:text-rose-400"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              rows={14}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-y"
            />
          </div>

          {/* Clean Output */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Clean Unique Output
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save File
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={14}
              value={statsAndOutput.output}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 focus:outline-none resize-y select-all"
            />
          </div>
        </div>

        {/* Duplicate Frequency Breakdown */}
        {statsAndOutput.duplicatesReport.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Most Frequent Duplicate Entries
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {statsAndOutput.duplicatesReport.map(([key, count], i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-300 truncate mr-2">&quot;{key}&quot;</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-bold font-mono text-[11px] shrink-0">
                    {count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
