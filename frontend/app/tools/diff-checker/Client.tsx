"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
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
  Upload,
  Download,
  FileCode,
  FileText,
} from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  leftLine?: number;
  rightLine?: number;
}

export default function DiffCheckerClient() {
  const [original, setOriginal] = useState(
    `function calculateTax(subtotal) {\n  const taxRate = 0.08;\n  return subtotal * taxRate;\n}`
  );
  const [modified, setModified] = useState(
    `function calculateTax(subtotal, state = "CA") {\n  const taxRate = state === "NY" ? 0.088 : 0.0725;\n  const discount = subtotal > 100 ? 5 : 0;\n  return (subtotal - discount) * taxRate;\n}`
  );

  const [origFileName, setOrigFileName] = useState<string>("");
  const [modFileName, setModFileName] = useState<string>("");

  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [copied, setCopied] = useState(false);

  // File upload handlers
  const handleOriginalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOrigFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setOriginal((event.target?.result as string) || "");
      reader.readAsText(file);
    }
  };

  const handleModifiedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setModFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setModified((event.target?.result as string) || "");
      reader.readAsText(file);
    }
  };

  // Compute Myers-style LCS Diff
  const diffResult = useMemo(() => {
    const rawOrig = original.split("\n");
    const rawMod = modified.split("\n");

    const norm = (s: string) => (ignoreWhitespace ? s.trim().replace(/\s+/g, " ") : s);

    const origLines = rawOrig;
    const modLines = rawMod;

    const n = origLines.length;
    const m = modLines.length;

    const dp: number[][] = Array.from({ length: n + 1 }, () =>
      new Array(m + 1).fill(0)
    );

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (norm(origLines[i]) === norm(modLines[j])) {
          dp[i + 1][j + 1] = dp[i][j] + 1;
        } else {
          dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    const diff: DiffLine[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && norm(origLines[i - 1]) === norm(modLines[j - 1])) {
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
  }, [original, modified, ignoreWhitespace]);

  // Generate standard unified .diff patch text
  const unifiedPatchText = useMemo(() => {
    let out = `--- a/${origFileName || "original"}\n+++ b/${modFileName || "modified"}\n@@ -1,${original.split("\n").length} +1,${modified.split("\n").length} @@\n`;
    for (const d of diffResult.diff) {
      if (d.type === "added") out += `+${d.text}\n`;
      else if (d.type === "removed") out += `-${d.text}\n`;
      else out += ` ${d.text}\n`;
    }
    return out;
  }, [diffResult.diff, origFileName, modFileName, original, modified]);

  const handleCopyPatch = () => {
    copyToClipboard(unifiedPatchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([unifiedPatchText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `changes.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            Myers LCS Diff Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Code & Text Diff Checker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Compare source files, documents, and configurations side-by-side with line additions, deletions, and patch export.
          </p>
        </div>

        {/* File Upload & Diff Options Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "split" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
              <button
                onClick={() => setViewMode("unified")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "unified" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Unified Diff</span>
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Ignore Whitespace Changes</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Plus className="w-3 h-3" /> {diffResult.additions} Added
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-mono font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <Minus className="w-3 h-3" /> {diffResult.deletions} Removed
            </span>

            <button
              onClick={handleCopyPatch}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Patch"}
            </button>
            <button
              onClick={handleDownloadPatch}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/25"
            >
              <Download className="w-3.5 h-3.5" />
              Download .patch
            </button>
          </div>
        </div>

        {/* Dual Input Editors with File Browsers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Original */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {origFileName || "Original (Before)"}
                </span>
              </div>
              <label className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer font-semibold flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload File
                <input type="file" onChange={handleOriginalUpload} className="hidden" />
              </label>
            </div>
            <textarea
              rows={8}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Right Modified */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {modFileName || "Modified (After)"}
                </span>
              </div>
              <label className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer font-semibold flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload File
                <input type="file" onChange={handleModifiedUpload} className="hidden" />
              </label>
            </div>
            <textarea
              rows={8}
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Diff Visualizer Box */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Line-by-Line Difference View ({viewMode === "split" ? "Side by Side" : "Unified"})
            </span>
          </div>

          <div className="font-mono text-xs overflow-x-auto divide-y divide-slate-800/40">
            {diffResult.diff.map((line, idx) => {
              if (viewMode === "unified") {
                const bg =
                  line.type === "added"
                    ? "bg-emerald-950/25 text-emerald-300"
                    : line.type === "removed"
                    ? "bg-rose-950/25 text-rose-300"
                    : "text-slate-300";

                const sign = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

                return (
                  <div key={idx} className={`flex items-stretch hover:bg-white/[0.02] ${bg}`}>
                    <span className="w-12 py-1 px-2 text-right text-slate-600 select-none bg-slate-950/50">
                      {line.leftLine || ""}
                    </span>
                    <span className="w-12 py-1 px-2 text-right text-slate-600 select-none bg-slate-950/50">
                      {line.rightLine || ""}
                    </span>
                    <span className="w-6 py-1 text-center font-bold select-none">{sign}</span>
                    <span className="py-1 px-2 flex-1 whitespace-pre">{line.text}</span>
                  </div>
                );
              }

              // Split Mode
              return (
                <div key={idx} className="grid grid-cols-2 divide-x divide-slate-800">
                  {/* Left Column (Original/Removed) */}
                  <div
                    className={`flex items-stretch ${
                      line.type === "removed" ? "bg-rose-950/25 text-rose-300" : line.type === "unchanged" ? "text-slate-300" : "bg-transparent text-transparent select-none"
                    }`}
                  >
                    <span className="w-10 py-1 px-2 text-right text-slate-600 select-none bg-slate-950/50">
                      {line.leftLine || ""}
                    </span>
                    <span className="py-1 px-3 flex-1 whitespace-pre overflow-hidden">
                      {line.type !== "added" ? line.text : " "}
                    </span>
                  </div>

                  {/* Right Column (Modified/Added) */}
                  <div
                    className={`flex items-stretch ${
                      line.type === "added" ? "bg-emerald-950/25 text-emerald-300" : line.type === "unchanged" ? "text-slate-300" : "bg-transparent text-transparent select-none"
                    }`}
                  >
                    <span className="w-10 py-1 px-2 text-right text-slate-600 select-none bg-slate-950/50">
                      {line.rightLine || ""}
                    </span>
                    <span className="py-1 px-3 flex-1 whitespace-pre overflow-hidden">
                      {line.type !== "removed" ? line.text : " "}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
