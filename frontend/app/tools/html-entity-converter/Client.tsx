"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";

export default function HtmlEntityConverterClient() {
  const [input, setInput] = useState(
    `<div class="card">Hello & "Welcome" to Botock's 100+ tools! © 2026</div>`
  );
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeFormat, setEncodeFormat] = useState<"named" | "decimal" | "hex">("named");
  const [copied, setCopied] = useState(false);

  const processConversion = (): string => {
    if (!input) return "";

    if (mode === "encode") {
      if (encodeFormat === "named") {
        return input
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;")
          .replace(/©/g, "&copy;")
          .replace(/®/g, "&reg;")
          .replace(/™/g, "&trade;");
      } else if (encodeFormat === "decimal") {
        return input
          .split("")
          .map((c) => (c.charCodeAt(0) > 127 || /["'<>&]/.test(c) ? `&#${c.charCodeAt(0)};` : c))
          .join("");
      } else {
        // Hex
        return input
          .split("")
          .map((c) =>
            c.charCodeAt(0) > 127 || /["'<>&]/.test(c)
              ? `&#x${c.charCodeAt(0).toString(16)};`
              : c
          )
          .join("");
      }
    } else {
      // Decode
      if (typeof window === "undefined") return input;
      const parser = new DOMParser();
      const dom = parser.parseFromString(
        `<!doctype html><body>${input}`,
        "text/html"
      );
      return dom.body.textContent || "";
    }
  };

  const output = processConversion();

  const handleCopy = () => {
    if (!output) return;
    copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setMode((m) => (m === "encode" ? "decode" : "encode"));
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Code className="w-3.5 h-3.5" />
            HTML Character Standards
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            HTML Entity Encoder & Decoder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert special characters into HTML entities (named, decimal, hex) or restore entities to raw text.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 w-full sm:w-auto">
            <button
              onClick={() => setMode("encode")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "encode"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Encode Entities
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "decode"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Decode Entities
            </button>
          </div>

          {mode === "encode" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Format:</span>
              <button
                onClick={() => setEncodeFormat("named")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                  encodeFormat === "named"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Named (&amp;copy;)
              </button>
              <button
                onClick={() => setEncodeFormat("decimal")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                  encodeFormat === "decimal"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Decimal (&#169;)
              </button>
              <button
                onClick={() => setEncodeFormat("hex")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                  encodeFormat === "hex"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Hex (&#xa9;)
              </button>
            </div>
          )}
        </div>

        {/* Input Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {mode === "encode" ? "Raw Text to Encode" : "HTML Entities to Decode"}
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
            placeholder="Type or paste text here..."
            className="w-full h-36 bg-transparent text-slate-100 placeholder-slate-600 resize-y focus:outline-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-3">
          <button
            onClick={handleSwap}
            disabled={!output}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-purple-300 transition shadow-lg disabled:opacity-30 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
          </button>
        </div>

        {/* Output Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {mode === "encode" ? "Encoded Entity Result" : "Decoded Text"}
            </span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Result"}
            </button>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/60 min-h-[120px] max-h-60 overflow-y-auto">
            <pre className="font-mono text-xs sm:text-sm text-purple-300 whitespace-pre-wrap break-all select-all">
              {output || (
                <span className="text-slate-600 font-sans italic">
                  Converted output will appear here...
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
