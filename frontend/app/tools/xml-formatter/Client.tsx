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

export default function XmlFormatterClient() {
  const [inputXml, setInputXml] = useState<string>("");
  const [outputXml, setOutputXml] = useState<string>("");
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatXml = (xml: string, tabSpaces: number) => {
    let formatted = "";
    let indent = "";
    const tab = " ".repeat(tabSpaces);
    xml = xml.replace(/(>)(<)(\/*)/g, "$1\r\n$2$3");

    const lines = xml.split("\r\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.match(/^<\/\w/)) {
        indent = indent.substring(tab.length);
      }

      formatted += indent + line + "\r\n";

      if (line.match(/^<\w[^>]*[^\/]>.*$/) && !line.match(/^<\w[^>]*>.*<\/\w[^>]*>$/)) {
        indent += tab;
      }
    }
    return formatted.trim();
  };

  const handleFormat = () => {
    setError(null);
    if (!inputXml.trim()) return;

    try {
      const parser = new DOMParser();
      const dom = parser.parseFromString(inputXml, "application/xml");
      const parseError = dom.querySelector("parsererror");

      if (parseError) {
        setError("Invalid XML Syntax: " + (parseError.textContent?.slice(0, 150) || "Parse error"));
        return;
      }

      const formatted = formatXml(inputXml, indentSize);
      setOutputXml(formatted);
    } catch (err: any) {
      setError("XML Syntax Error: " + err.message);
    }
  };

  const handleMinify = () => {
    setError(null);
    if (!inputXml.trim()) return;
    const minified = inputXml.replace(/>\s+</g, "><").trim();
    setOutputXml(minified);
  };

  const handleCopy = () => {
    if (!outputXml) return;
    navigator.clipboard.writeText(outputXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Code className="w-3.5 h-3.5" />
            XML Linter & Formatter
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            XML Formatter & Beautifier Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Clean, indent, validate, and minify XML and SVG markup with client-side DOMParser verification directly in your browser.
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
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Beautify XML
            </button>
            <button
              onClick={handleMinify}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
            >
              Minify XML
            </button>
            <button
              onClick={() => {
                setInputXml("");
                setOutputXml("");
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
              Input Raw XML / SVG
            </span>
            <textarea
              placeholder='<root><item id="1"><name>Botock</name></item></root>'
              value={inputXml}
              onChange={(e) => setInputXml(e.target.value)}
              className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 resize-none leading-relaxed focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Formatted Output
              </span>
              {outputXml && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs text-orange-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              placeholder="Formatted valid XML will appear here..."
              value={outputXml}
              className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-orange-300 resize-none leading-relaxed focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-3">
              <Code className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">DOMParser Syntax Verification</h4>
            <p className="text-xs text-slate-400">
              Validates XML syntax, closing tag matching, and attribute quotation rules in real-time.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% In-Browser Privacy</h4>
            <p className="text-xs text-slate-400">
              Your config XML, SVG designs, and RSS feeds remain strictly in browser RAM without server calls.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">SVG Code Cleaner</h4>
            <p className="text-xs text-slate-400">
              Ideal for formatting exported Figma/Illustrator SVG graphics and minifying production vector files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
