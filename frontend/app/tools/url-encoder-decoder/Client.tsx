"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState } from "react";
import {
  Link2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  AlertCircle,
} from "lucide-react";

export default function UrlEncoderDecoderClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeType, setEncodeType] = useState<"component" | "full">("component");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = (): string => {
    if (!input) return "";
    setError(null);
    try {
      if (mode === "encode") {
        return encodeType === "component"
          ? encodeURIComponent(input)
          : encodeURI(input);
      } else {
        return decodeURIComponent(input);
      }
    } catch (err: any) {
      setError("Malformed URL encoding detected. Unable to decode string.");
      return "";
    }
  };

  const output = processText();

  const handleCopy = () => {
    if (!output) return;
    copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Link2 className="w-3.5 h-3.5" />
            RFC 3986 Web Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            URL Encoder & Decoder Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Safely percent-encode query strings or decode obfuscated URLs in real-time with zero server requests.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setMode("encode");
                setError(null);
              }}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "encode"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Encode (Percent-Encode)
            </button>
            <button
              onClick={() => {
                setMode("decode");
                setError(null);
              }}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "decode"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Decode
            </button>
          </div>

          {mode === "encode" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Encoding Scheme:</span>
              <button
                onClick={() => setEncodeType("component")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                  encodeType === "component"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                encodeURIComponent (Query params)
              </button>
              <button
                onClick={() => setEncodeType("full")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                  encodeType === "full"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                encodeURI (Full URL)
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Input Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {mode === "encode" ? "Raw Text / URL to Encode" : "Encoded String to Decode"}
            </span>
            <button
              onClick={() => {
                setInput("");
                setError(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Paste URL or text e.g. https://example.com/search?query=hello world&filter=all"
                : "Paste percent-encoded string e.g. https%3A%2F%2Fexample.com%2Fsearch%3Fquery%3Dhello%20world"
            }
            className="w-full h-36 bg-transparent text-slate-100 placeholder-slate-600 resize-y focus:outline-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Middle Swap Button */}
        <div className="flex justify-center my-3">
          <button
            onClick={handleSwap}
            disabled={!output}
            title="Swap input and output"
            className="p-2.5 rounded-full bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-purple-300 transition shadow-lg disabled:opacity-30 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
          </button>
        </div>

        {/* Output Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {mode === "encode" ? "Encoded Result" : "Decoded Result"}
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
                  Processed output will appear here automatically...
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
