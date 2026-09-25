"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode,
  Download,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Code,
} from "lucide-react";

export default function JsonFormatterClient() {
  const [inputJson, setInputJson] = useState<string>("");
  const [outputJson, setOutputJson] = useState<string>("");
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormat = () => {
    setError(null);
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutputJson(formatted);
    } catch (err: any) {
      setError("Invalid JSON: " + (err.message || "Parse syntax error"));
    }
  };

  const handleMinify = () => {
    setError(null);
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
    } catch (err: any) {
      setError("Invalid JSON: " + (err.message || "Parse syntax error"));
    }
  };

  const handleCopy = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputJson) return;
    const blob = new Blob([outputJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Code className="w-3.5 h-3.5" />
            JSON Linter & Beautifier
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            JSON Formatter & Validator Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Format, validate, beautify, and minify JSON payloads with syntax error detection directly in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl mb-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Indent:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={1}>1 Tab</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Beautify JSON
            </button>
            <button
              onClick={handleMinify}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
            >
              Minify / Compact
            </button>
            <button
              onClick={() => {
                setInputJson("");
                setOutputJson("");
                setError(null);
              }}
              className="p-2 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Input / Output Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Input Raw JSON
            </span>
            <textarea
              placeholder='{"name": "Botock", "features": ["Client-Side WASM", "0ms Lag"]}'
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 resize-none leading-relaxed focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Formatted Output
              </span>
              {outputJson && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download .json
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              placeholder="Formatted valid JSON will appear here..."
              value={outputJson}
              className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 resize-none leading-relaxed focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Code className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Instant Syntax Validation</h4>
            <p className="text-xs text-slate-400">
              Pinpoints unclosed brackets, missing quotes, or misplaced commas with line-level accuracy.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              Your API keys, tokens, and payloads are formatted in local memory without remote logs.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Minify or Beautify</h4>
            <p className="text-xs text-slate-400">
              Switch between compact production strings and readable multi-space indented schemas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
