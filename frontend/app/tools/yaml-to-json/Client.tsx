"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Download,
  AlertCircle,
} from "lucide-react";

export default function YamlToJsonClient() {
  const [mode, setMode] = useState<"yaml-to-json" | "json-to-yaml">("yaml-to-json");
  const [input, setInput] = useState<string>(
    `server:\n  port: 8080\n  host: 0.0.0.0\ndatabase:\n  enabled: true\n  name: botock_db\n  poolSize: 10\ntags:\n  - development\n  - client-side\n  - wasm`
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // YAML to JSON parser
  const parseYaml = (yamlStr: string): any => {
    const lines = yamlStr.split("\n");
    const root: Record<string, any> = {};
    const stack: { obj: any; indent: number; key?: string }[] = [
      { obj: root, indent: -1 },
    ];

    for (const rawLine of lines) {
      if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;

      const indent = rawLine.search(/\S/);
      const line = rawLine.trim();

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      if (line.startsWith("- ")) {
        // List item
        const valStr = line.substring(2).trim();
        const parsedVal = parsePrimitive(valStr);
        if (!Array.isArray(parent)) {
          // If parent is an object, look at current key
          const curKey = stack[stack.length - 1].key;
          if (curKey && !Array.isArray(parent[curKey])) {
            parent[curKey] = [];
          }
          if (curKey) parent[curKey].push(parsedVal);
        } else {
          parent.push(parsedVal);
        }
      } else {
        const colonIdx = line.indexOf(":");
        if (colonIdx !== -1) {
          const key = line.substring(0, colonIdx).trim();
          const valStr = line.substring(colonIdx + 1).trim();

          if (!valStr) {
            // New nested object
            const newObj = {};
            parent[key] = newObj;
            stack.push({ obj: newObj, indent, key });
          } else {
            parent[key] = parsePrimitive(valStr);
          }
        }
      }
    }
    return root;
  };

  const parsePrimitive = (val: string): any => {
    if (val === "true") return true;
    if (val === "false") return false;
    if (val === "null") return null;
    if (!isNaN(Number(val)) && val !== "") return Number(val);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      return val.slice(1, -1);
    }
    return val;
  };

  // JSON to YAML serializer
  const serializeYaml = (obj: any, indentLevel = 0): string => {
    const pad = "  ".repeat(indentLevel);
    if (Array.isArray(obj)) {
      return obj
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return `${pad}- \n${serializeYaml(item, indentLevel + 1)}`;
          }
          return `${pad}- ${JSON.stringify(item)}`;
        })
        .join("\n");
    } else if (typeof obj === "object" && obj !== null) {
      return Object.entries(obj)
        .map(([k, v]) => {
          if (typeof v === "object" && v !== null) {
            return `${pad}${k}:\n${serializeYaml(v, indentLevel + 1)}`;
          }
          return `${pad}${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`;
        })
        .join("\n");
    }
    return `${pad}${String(obj)}`;
  };

  const output = useMemo(() => {
    if (!input.trim()) return "";
    setError(null);

    try {
      if (mode === "yaml-to-json") {
        const parsed = parseYaml(input);
        return JSON.stringify(parsed, null, 2);
      } else {
        const parsed = JSON.parse(input);
        return serializeYaml(parsed);
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse syntax.");
      return "";
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setMode((m) => (m === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json"));
    }
  };

  const handleDownload = () => {
    const ext = mode === "yaml-to-json" ? "json" : "yaml";
    const mime = mode === "yaml-to-json" ? "application/json" : "text/yaml";
    const blob = new Blob([output], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileCode className="w-3.5 h-3.5" />
            Config & Serialization Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            YAML to JSON & JSON to YAML Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Bidirectional converter between YAML configuration and JSON data structures with zero latency.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => {
                setMode("yaml-to-json");
                setError(null);
              }}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "yaml-to-json"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              YAML to JSON
            </button>
            <button
              onClick={() => {
                setMode("json-to-yaml");
                setError(null);
              }}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "json-to-yaml"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              JSON to YAML
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Result"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Download File
            </button>
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
                {mode === "yaml-to-json" ? "YAML Input" : "JSON Input"}
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
              placeholder="Paste content here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {mode === "yaml-to-json" ? "JSON Output" : "YAML Output"}
              </span>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Converted output appears here..."
              className="w-full flex-1 bg-transparent text-purple-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
