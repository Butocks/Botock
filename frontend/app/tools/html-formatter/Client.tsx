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

export default function HtmlFormatterClient() {
  const [inputHtml, setInputHtml] = useState<string>("");
  const [outputHtml, setOutputHtml] = useState<string>("");
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const formatHtml = (html: string, tabSpaces: number) => {
    let formatted = "";
    let indent = 0;
    const tab = " ".repeat(tabSpaces);

    // Standardize token splits
    const tokens = html.replace(/>\s*</g, "><").replace(/</g, "~#~<").split("~#~");

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim();
      if (!token) continue;

      if (token.startsWith("</")) {
        indent = Math.max(0, indent - 1);
        formatted += tab.repeat(indent) + token + "\n";
      } else if (token.startsWith("<") && !token.endsWith("/>") && !token.match(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)[^>]*>/i)) {
        formatted += tab.repeat(indent) + token + "\n";
        indent++;
      } else {
        formatted += tab.repeat(indent) + token + "\n";
      }
    }
    return formatted.trim();
  };

  const handleFormat = () => {
    if (!inputHtml.trim()) return;
    const formatted = formatHtml(inputHtml, indentSize);
    setOutputHtml(formatted);
  };

  const handleMinify = () => {
    if (!inputHtml.trim()) return;
    const minified = inputHtml.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
    setOutputHtml(minified);
  };

  const handleCopy = () => {
    if (!outputHtml) return;
    navigator.clipboard.writeText(outputHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Code className="w-3.5 h-3.5" />
            HTML Beautifier & Minifier
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            HTML Formatter & Beautifier Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Format messy, unindented HTML markup or minify production web templates with zero server uploads directly in your browser.
          </p>
        </div>

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
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Beautify HTML
            </button>
            <button
              onClick={handleMinify}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
            >
              Minify HTML
            </button>
            <button
              onClick={() => {
                setInputHtml("");
                setOutputHtml("");
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
              Input Raw HTML
            </span>
            <textarea
              placeholder="<div><h1>Botock</h1><p>Zero-latency web utilities</p></div>"
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
              className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 resize-none leading-relaxed focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Formatted Output
              </span>
              {outputHtml && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              placeholder="Formatted HTML will appear here..."
              value={outputHtml}
              className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-sky-300 resize-none leading-relaxed focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <Code className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Clean Hierarchical Indentation</h4>
            <p className="text-xs text-slate-400">
              Structures nested div tags, headings, script tags, and tables with consistent readable spacing.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% In-Browser Privacy</h4>
            <p className="text-xs text-slate-400">
              Code is processed directly inside your browser memory with zero network calls or server logging.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Self-Closing Tag Aware</h4>
            <p className="text-xs text-slate-400">
              Properly handles void elements (img, input, br, hr, meta, link) without misaligning surrounding tree structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
