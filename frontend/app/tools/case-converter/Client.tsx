"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  AlignLeft,
} from "lucide-react";

export default function CaseConverterClient() {
  const [text, setText] = useState(
    "Convert your text to any case format with a single click. Useful for programmers, writers, and content creators."
  );
  const [copied, setCopied] = useState(false);
  const [lastAction, setLastAction] = useState<string>("Original");

  const toWords = (str: string): string[] => {
    return (
      str
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_\-.]+/g, " ")
        .match(/[A-Za-z0-9]+/g) || []
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => setText((event.target?.result as string) || "");
      reader.readAsText(file);
    }
  };

  // Transformation actions
  const applyCase = (type: string) => {
    if (!text) return;
    let converted = text;

    switch (type) {
      case "sentence":
        converted = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        setLastAction("Sentence case");
        break;

      case "lower":
        converted = text.toLowerCase();
        setLastAction("lowercase");
        break;

      case "upper":
        converted = text.toUpperCase();
        setLastAction("UPPERCASE");
        break;

      case "title":
        converted = text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        );
        setLastAction("Title Case");
        break;

      case "camel": {
        const words = toWords(text);
        if (words.length > 0) {
          converted =
            words[0].toLowerCase() +
            words
              .slice(1)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join("");
        }
        setLastAction("camelCase");
        break;
      }

      case "pascal": {
        const words = toWords(text);
        converted = words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");
        setLastAction("PascalCase");
        break;
      }

      case "snake": {
        const words = toWords(text);
        converted = words.map((w) => w.toLowerCase()).join("_");
        setLastAction("snake_case");
        break;
      }

      case "kebab": {
        const words = toWords(text);
        converted = words.map((w) => w.toLowerCase()).join("-");
        setLastAction("kebab-case");
        break;
      }

      case "constant": {
        const words = toWords(text);
        converted = words.map((w) => w.toUpperCase()).join("_");
        setLastAction("CONSTANT_CASE");
        break;
      }

      case "alternating":
        converted = text
          .split("")
          .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
          .join("");
        setLastAction("aLtErNaTiNg cAsE");
        break;

      case "inverse":
        converted = text
          .split("")
          .map((c) =>
            c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
          )
          .join("");
        setLastAction("InVeRsE cAsE");
        break;
    }

    setText(converted);
  };

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.trim() ? text.split("\n").length : 0;
    return { chars, words, lines };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Type className="w-3.5 h-3.5" />
            Typography & Case Transformer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Case Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Instantly switch text between Sentence case, UPPERCASE, lowercase, camelCase, snake_case, and kebab-case with one click.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Click Case to Transform In-Place
            </span>
            <span className="text-[11px] font-mono text-purple-400">
              Current: <strong>{lastAction}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "sentence", label: "Sentence case" },
              { id: "lower", label: "lowercase" },
              { id: "upper", label: "UPPERCASE" },
              { id: "title", label: "Title Case" },
              { id: "camel", label: "camelCase" },
              { id: "pascal", label: "PascalCase" },
              { id: "snake", label: "snake_case" },
              { id: "kebab", label: "kebab-case" },
              { id: "constant", label: "CONSTANT_CASE" },
              { id: "alternating", label: "aLtErNaTiNg" },
              { id: "inverse", label: "InVeRsE" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => applyCase(btn.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-slate-200 hover:text-white font-semibold text-xs transition cursor-pointer shadow-sm active:scale-95"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Live Stats */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>{stats.words.toLocaleString()} Words</span>
              <span>•</span>
              <span>{stats.chars.toLocaleString()} Characters</span>
              <span>•</span>
              <span>{stats.lines.toLocaleString()} Lines</span>
            </div>

            {/* Utility actions */}
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload .txt
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/25"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Text"}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setLastAction("Custom Edited");
            }}
            placeholder="Type or paste your text here..."
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-y"
          />
        </div>
      </div>
    </div>
  );
}
