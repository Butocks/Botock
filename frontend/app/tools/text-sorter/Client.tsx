"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
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
  Upload,
  FileText,
  Table,
  Sliders,
} from "lucide-react";

export default function TextSorterClient() {
  const [input, setInput] = useState(
    `Zebra\napple\nMonkey\n100 items\n10 items\n2 items\nbanana\nOrange`
  );
  const [fileName, setFileName] = useState<string>("");
  const [fileExt, setFileExt] = useState<string>("txt");

  const [sortType, setSortType] = useState<
    "az" | "za" | "natural" | "length-asc" | "length-desc" | "reverse" | "shuffle"
  >("natural");

  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [csvColumnIndex, setCsvColumnIndex] = useState<number | null>(null);

  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  // File upload handler
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

  // Detect if content is CSV/TSV
  const csvHeaders = useMemo(() => {
    const firstLine = input.split("\n")[0] || "";
    if (firstLine.includes(",")) return firstLine.split(",");
    if (firstLine.includes("\t")) return firstLine.split("\t");
    return null;
  }, [input]);

  const sortedOutput = useMemo(() => {
    if (!input) return "";

    let lines = input.split("\n");
    if (trimLines) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter(Boolean);

    // If CSV column sort is selected and header exists
    let headerLine = "";
    if (csvColumnIndex !== null && lines.length > 1) {
      headerLine = lines[0];
      lines = lines.slice(1);
    }

    const copy = [...lines];

    const getSortKey = (line: string): string => {
      if (csvColumnIndex !== null) {
        const cols = line.includes(",") ? line.split(",") : line.split("\t");
        return cols[csvColumnIndex] || line;
      }
      return line;
    };

    switch (sortType) {
      case "az":
        copy.sort((a, b) => {
          const keyA = getSortKey(a);
          const keyB = getSortKey(b);
          return caseSensitive
            ? keyA.localeCompare(keyB)
            : keyA.toLowerCase().localeCompare(keyB.toLowerCase());
        });
        break;
      case "za":
        copy.sort((a, b) => {
          const keyA = getSortKey(a);
          const keyB = getSortKey(b);
          return caseSensitive
            ? keyB.localeCompare(keyA)
            : keyB.toLowerCase().localeCompare(keyA.toLowerCase());
        });
        break;
      case "natural":
        copy.sort((a, b) => {
          const keyA = getSortKey(a);
          const keyB = getSortKey(b);
          return keyA.localeCompare(keyB, undefined, {
            numeric: true,
            sensitivity: caseSensitive ? "variant" : "base",
          });
        });
        break;
      case "length-asc":
        copy.sort((a, b) => getSortKey(a).length - getSortKey(b).length || a.localeCompare(b));
        break;
      case "length-desc":
        copy.sort((a, b) => getSortKey(b).length - getSortKey(a).length || a.localeCompare(b));
        break;
      case "reverse":
        copy.reverse();
        break;
      case "shuffle":
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        break;
    }

    if (headerLine) {
      return [headerLine, ...copy].join("\n");
    }
    return copy.join("\n");
  }, [input, sortType, caseSensitive, trimLines, removeEmpty, csvColumnIndex, shuffleSeed]);

  const stats = useMemo(() => {
    const rawLines = input.split("\n").filter((l) => (removeEmpty ? l.trim() : true));
    const sortedLines = sortedOutput.split("\n").filter(Boolean);
    return {
      total: rawLines.length,
      sorted: sortedLines.length,
    };
  }, [input, sortedOutput, removeEmpty]);

  const handleCopy = () => {
    if (!sortedOutput) return;
    copyToClipboard(sortedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sortedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? `sorted-${fileName}` : `sorted-list.${fileExt}`;
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
            Deterministic Ordering Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Text & List Sorter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Order large text lists, CSV datasets, and logs by natural alphanumeric, alphabetical, length, or custom columns.
          </p>
        </div>

        {/* File Drag-and-drop & Upload Strip */}
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
                Supports TXT, CSV, TSV, JSON, LOG, Markdown lists
              </span>
            </div>
          </div>

          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer">
            Browse File
            <input
              type="file"
              accept=".txt,.csv,.tsv,.json,.log,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Sorting Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6 space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Sort Algorithm
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: "natural", label: "Natural (1, 2, 10)", icon: Sparkles },
                { id: "az", label: "A → Z", icon: SortAsc },
                { id: "za", label: "Z → A", icon: SortDesc },
                { id: "length-asc", label: "Shortest First", icon: ArrowUpDown },
                { id: "length-desc", label: "Longest First", icon: ArrowUpDown },
                { id: "reverse", label: "Reverse Order", icon: RotateCcw },
                { id: "shuffle", label: "Random Shuffle", icon: Shuffle },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = sortType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (opt.id === "shuffle") setShuffleSeed((s) => s + 1);
                      setSortType(opt.id as any);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      active
                        ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CSV Column Picker if detected */}
          {csvHeaders && csvHeaders.length > 1 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3">
              <Table className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-bold text-slate-300">CSV Column Sort:</span>
              <select
                value={csvColumnIndex !== null ? csvColumnIndex : "full"}
                onChange={(e) =>
                  setCsvColumnIndex(e.target.value === "full" ? null : Number(e.target.value))
                }
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none"
              >
                <option value="full">Sort by Entire Line</option>
                {csvHeaders.map((h, i) => (
                  <option key={i} value={i}>
                    Column {i + 1}: &quot;{h.trim().slice(0, 20)}&quot;
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800 text-xs text-slate-300">
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
              <span>Trim Leading/Trailing Whitespace</span>
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
          </div>
        </div>

        {/* Dual Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Input Data ({stats.total} lines)
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

          {/* Sorted Output */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sorted Output ({stats.sorted} lines)
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
              value={sortedOutput}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-purple-300 focus:outline-none resize-y select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
