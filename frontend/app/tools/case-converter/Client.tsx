"use client";

import { useState } from "react";
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";

export default function CaseConverterClient() {
  const [text, setText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toWords = (str: string): string[] => {
    return (
      str
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_\-.]+/g, " ")
        .match(/[A-Za-z0-9]+/g) || []
    );
  };

  const conversions = [
    {
      id: "upper",
      name: "UPPERCASE",
      desc: "CONVERT ALL CHARACTERS TO CAPITAL LETTERS",
      fn: (s: string) => s.toUpperCase(),
    },
    {
      id: "lower",
      name: "lowercase",
      desc: "convert all characters to small letters",
      fn: (s: string) => s.toLowerCase(),
    },
    {
      id: "title",
      name: "Title Case",
      desc: "Capitalize The First Letter Of Each Word",
      fn: (s: string) =>
        s.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        ),
    },
    {
      id: "sentence",
      name: "Sentence case",
      desc: "Capitalize the first letter of each sentence",
      fn: (s: string) =>
        s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
    },
    {
      id: "camel",
      name: "camelCase",
      desc: "firstWordInLowerAndRestCapitalized",
      fn: (s: string) => {
        const words = toWords(s);
        if (words.length === 0) return "";
        return (
          words[0].toLowerCase() +
          words
            .slice(1)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("")
        );
      },
    },
    {
      id: "pascal",
      name: "PascalCase",
      desc: "EveryWordCapitalizedWithNoSpaces",
      fn: (s: string) => {
        const words = toWords(s);
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");
      },
    },
    {
      id: "snake",
      name: "snake_case",
      desc: "words_separated_by_underscores",
      fn: (s: string) => toWords(s).map((w) => w.toLowerCase()).join("_"),
    },
    {
      id: "kebab",
      name: "kebab-case",
      desc: "words-separated-by-hyphens",
      fn: (s: string) => toWords(s).map((w) => w.toLowerCase()).join("-"),
    },
    {
      id: "constant",
      name: "CONSTANT_CASE",
      desc: "ALL_CAPS_SEPARATED_BY_UNDERSCORES",
      fn: (s: string) => toWords(s).map((w) => w.toUpperCase()).join("_"),
    },
    {
      id: "dot",
      name: "dot.case",
      desc: "words.separated.by.periods",
      fn: (s: string) => toWords(s).map((w) => w.toLowerCase()).join("."),
    },
  ];

  const handleCopy = (id: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Text Transformation Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Case Converter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert text between UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, and kebab-case.
          </p>
        </div>

        {/* Input Text Area */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-400" />
              Source String
            </span>
            <button
              onClick={() => setText("")}
              disabled={!text}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste any text or variable name here to convert into 10 distinct cases..."
            className="w-full h-32 bg-transparent text-slate-100 placeholder-slate-500 resize-y focus:outline-none text-sm sm:text-base font-sans leading-relaxed"
          />
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversions.map((conv) => {
            const transformed = text ? conv.fn(text) : "";
            const isCopied = copiedKey === conv.id;

            return (
              <div
                key={conv.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                      {conv.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{conv.desc}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(conv.id, transformed)}
                    disabled={!transformed}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600/20 hover:border-purple-500/50 border border-slate-700/60 text-slate-300 hover:text-purple-300 transition text-xs flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {isCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 min-h-[46px] flex items-center overflow-x-auto">
                  <span className="text-xs sm:text-sm font-mono text-slate-300 whitespace-pre-wrap break-all">
                    {transformed || (
                      <span className="text-slate-600 italic">Preview appears here</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
