"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  AlertCircle,
} from "lucide-react";

export default function JsonToCsvClient() {
  const [jsonInput, setJsonInput] = useState(
    `[\n  {\n    "id": 1,\n    "name": "Alice Smith",\n    "role": "Tech Lead",\n    "department": "Engineering",\n    "active": true\n  },\n  {\n    "id": 2,\n    "name": "Bob Jones",\n    "role": "Designer",\n    "department": "Product",\n    "active": true\n  },\n  {\n    "id": 3,\n    "name": "Charlie Brown",\n    "role": "Auditor",\n    "department": "Finance",\n    "active": false\n  }\n]`
  );
  const [delimiter, setDelimiter] = useState<"," | "\t" | ";" | "|">(",");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const csvOutput = useMemo(() => {
    if (!jsonInput.trim()) {
      return "";
    }
    setError(null);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Input must be a non-empty JSON array of objects.");
      }

      // Collect all unique keys
      const headers = Array.from(
        new Set(parsed.flatMap((item) => (typeof item === "object" && item !== null ? Object.keys(item) : [])))
      );

      if (headers.length === 0) {
        throw new Error("No object properties found in JSON array.");
      }

      const escapeField = (val: any): string => {
        if (val === null || val === undefined) return "";
        let str = typeof val === "object" ? JSON.stringify(val) : String(val);
        if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
          str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headerLine = headers.map(escapeField).join(delimiter);
      const rowLines = parsed.map((item) => {
        return headers.map((h) => escapeField(item[h])).join(delimiter);
      });

      return [headerLine, ...rowLines].join("\n");
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
      return "";
    }
  }, [jsonInput, delimiter]);

  const handleCopy = () => {
    if (!csvOutput) return;
    copyToClipboard(csvOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = delimiter === "\t" ? "tsv" : "csv";
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exported-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            JSON to Table Exporter
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            JSON to CSV Converter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Transform JSON arrays into clean CSV or TSV spreadsheet data for Excel and Google Sheets.
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Delimiter:</span>
            <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700/60">
              {[
                { id: ",", label: "Comma (,)" },
                { id: "\t", label: "Tab (TSV)" },
                { id: ";", label: "Semicolon (;)" },
                { id: "|", label: "Pipe (|)" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDelimiter(d.id as any)}
                  className={`px-2.5 py-1 rounded text-xs transition ${
                    delimiter === d.id
                      ? "bg-purple-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                JSON Array Input
              </span>
              <button
                onClick={() => setJsonInput("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON array here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                CSV Output
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!csvOutput}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!csvOutput}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3 h-3" />
                  Download CSV
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={csvOutput}
              placeholder="Formatted CSV rows will appear here..."
              className="w-full flex-1 bg-transparent text-purple-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
