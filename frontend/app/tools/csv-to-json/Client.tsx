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
  FileCode,
} from "lucide-react";

export default function CsvToJsonClient() {
  const [csvInput, setCsvInput] = useState(
    `id,name,role,department,active\n1,"Alice Smith",Tech Lead,Engineering,true\n2,"Bob Jones",Designer,Product,true\n3,"Charlie Brown",Auditor,Finance,false`
  );
  const [delimiter, setDelimiter] = useState<"," | "\t" | ";" | "|">(",");
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [parseNumbers, setParseNumbers] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Parse CSV to JSON
  const jsonOutput = useMemo(() => {
    if (!csvInput.trim()) {
      return "";
    }

    try {
      // Robust CSV tokenizer handling quotes and commas
      const parseCSVLine = (line: string, delim: string): string[] => {
        const result: string[] = [];
        let cur = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const next = line[i + 1];

          if (char === '"' && inQuotes && next === '"') {
            cur += '"';
            i++;
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delim && !inQuotes) {
            result.push(cur.trim());
            cur = "";
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const lines = csvInput
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) return "";

      const castValue = (val: string) => {
        if (!parseNumbers) return val;
        if (val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "false") return false;
        if (val.toLowerCase() === "null") return null;
        const num = Number(val);
        if (!isNaN(num) && val.trim() !== "") return num;
        return val;
      };

      if (hasHeader) {
        const headers = parseCSVLine(lines[0], delimiter);
        const rows = lines.slice(1).map((line) => {
          const cols = parseCSVLine(line, delimiter);
          const obj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            obj[h || `col_${idx + 1}`] = castValue(cols[idx] ?? "");
          });
          return obj;
        });

        return JSON.stringify(rows, null, 2);
      } else {
        const rows = lines.map((line) => {
          return parseCSVLine(line, delimiter).map(castValue);
        });
        return JSON.stringify(rows, null, 2);
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse CSV syntax.");
      return "";
    }
  }, [csvInput, delimiter, hasHeader, parseNumbers]);

  const handleCopy = () => {
    if (!jsonOutput) return;
    copyToClipboard(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-data.json";
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
            Tabular Data Parser
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CSV to JSON Converter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert CSV and TSV spreadsheets into structured JSON arrays of objects with quotation support.
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
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

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              First row is Header
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={parseNumbers}
                onChange={(e) => setParseNumbers(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              Parse Numbers & Booleans
            </label>
          </div>
        </div>

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                CSV / TSV Input
              </span>
              <button
                onClick={() => setCsvInput("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="Paste raw CSV text here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                JSON Output
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!jsonOutput}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!jsonOutput}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3 h-3" />
                  Download JSON
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={jsonOutput}
              placeholder="Structured JSON array will appear here..."
              className="w-full flex-1 bg-transparent text-purple-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
