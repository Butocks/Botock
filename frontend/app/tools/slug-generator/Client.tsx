"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  Link as LinkIcon,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Globe,
} from "lucide-react";

export default function SlugGeneratorClient() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<"-" | "_" | "/">("-");
  const [lowercase, setLowercase] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [copied, setCopied] = useState(false);

  const stopWords = useMemo(
    () =>
      new Set([
        "a", "an", "the", "and", "or", "but", "about", "above", "after",
        "along", "among", "as", "at", "before", "behind", "below", "beneath",
        "beside", "between", "beyond", "by", "down", "during", "except", "for",
        "from", "in", "into", "near", "of", "off", "on", "onto", "out",
        "over", "since", "through", "throughout", "to", "toward", "under",
        "until", "up", "upon", "with", "within", "without",
      ]),
    []
  );

  const generatedSlug = useMemo(() => {
    if (!input.trim()) return "";

    // 1. Normalize unicode (accents like é -> e)
    let s = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 2. Case conversion
    if (lowercase) {
      s = s.toLowerCase();
    }

    // 3. Remove numbers if selected
    if (removeNumbers) {
      s = s.replace(/[0-9]/g, " ");
    }

    // 4. Remove special characters (keep only alphanumeric and spaces)
    s = s.replace(/[^a-zA-Z0-9\s]/g, " ");

    // 5. Split into words
    let words = s.trim().split(/\s+/).filter(Boolean);

    // 6. Filter stop words
    if (removeStopWords) {
      words = words.filter((w) => !stopWords.has(w.toLowerCase()));
    }

    return words.join(separator);
  }, [input, separator, lowercase, removeStopWords, removeNumbers, stopWords]);

  const handleCopy = () => {
    if (!generatedSlug) return;
    copyToClipboard(generatedSlug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Globe className="w-3.5 h-3.5" />
            SEO & URL Architect
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SEO Friendly Slug Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert blog post titles, product headlines, and article names into clean, URL-safe permalinks.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-xl space-y-6">
          <div>
            <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-2">
              Title / Input Text
            </label>
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 10 Best Productivity Tools for Designers in 2026!"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition text-sm"
              />
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800/60">
            {/* Separator */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">
                Separator
              </label>
              <div className="flex rounded-lg bg-slate-800/80 p-1 border border-slate-700/60">
                {(["-", "_", "/"] as const).map((sep) => (
                  <button
                    key={sep}
                    onClick={() => setSeparator(sep)}
                    className={`flex-1 py-1 rounded text-xs font-mono transition ${
                      separator === sep
                        ? "bg-purple-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sep}
                  </button>
                ))}
              </div>
            </div>

            {/* Lowercase toggle */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Lowercase Only
              </label>
            </div>

            {/* Stop words toggle */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={removeStopWords}
                  onChange={(e) => setRemoveStopWords(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Remove Stop Words
              </label>
            </div>

            {/* Remove numbers toggle */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={removeNumbers}
                  onChange={(e) => setRemoveNumbers(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Remove Numbers
              </label>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-purple-400" />
              Generated Slug Preview
            </span>
            <button
              onClick={handleCopy}
              disabled={!generatedSlug}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Slug"}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center">
            <span className="text-sm font-mono text-purple-300 break-all select-all">
              {generatedSlug || (
                <span className="text-slate-600 font-sans italic">
                  Your generated slug will appear here...
                </span>
              )}
            </span>
          </div>

          {generatedSlug && (
            <p className="mt-3 text-xs text-slate-500">
              Live URL Simulation:{" "}
              <span className="text-slate-400 font-mono">
                https://botock.com/blog/{generatedSlug}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
