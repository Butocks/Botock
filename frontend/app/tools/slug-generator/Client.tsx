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
  Download,
  Search,
  ExternalLink,
} from "lucide-react";

export default function SlugGeneratorClient() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  // Single mode state
  const [input, setInput] = useState("10 Best Ways to Build AI Agents in 2026: The Ultimate Guide!");
  const [baseUrl, setBaseUrl] = useState("https://example.com/blog/");

  // Bulk mode state
  const [bulkInput, setBulkInput] = useState(
    `Introduction to Machine Learning\nHow to Optimize React 19 Performance\nTop 5 Free AI Tools for Developers\nWhat is Next.js App Router?`
  );

  // Options
  const [separator, setSeparator] = useState<"-" | "_" | "/">("-");
  const [lowercase, setLowercase] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(true);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const stopWords = useMemo(
    () =>
      new Set([
        "a", "an", "the", "and", "or", "but", "about", "above", "after",
        "along", "among", "as", "at", "before", "behind", "below", "beneath",
        "beside", "between", "beyond", "by", "down", "during", "except", "for",
        "from", "in", "into", "near", "of", "off", "on", "onto", "out",
        "over", "since", "through", "throughout", "to", "toward", "under",
        "until", "up", "upon", "with", "within", "without", "is", "are", "was",
      ]),
    []
  );

  const cleanSlug = (text: string): string => {
    if (!text.trim()) return "";
    let s = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lowercase) s = s.toLowerCase();
    if (removeNumbers) s = s.replace(/[0-9]/g, " ");
    s = s.replace(/[^a-zA-Z0-9\s]/g, " ");
    let words = s.trim().split(/\s+/).filter(Boolean);
    if (removeStopWords) {
      const filtered = words.filter((w) => !stopWords.has(w.toLowerCase()));
      if (filtered.length > 0) words = filtered;
    }
    return words.join(separator);
  };

  // Single generated slug
  const singleSlug = useMemo(() => cleanSlug(input), [
    input,
    separator,
    lowercase,
    removeStopWords,
    removeNumbers,
    stopWords,
  ]);

  // Bulk generated slugs
  const bulkResults = useMemo(() => {
    const lines = bulkInput.split("\n").filter((l) => l.trim().length > 0);
    return lines.map((title) => ({
      title,
      slug: cleanSlug(title),
    }));
  }, [bulkInput, separator, lowercase, removeStopWords, removeNumbers, stopWords]);

  const handleCopy = (val: string, key = "single") => {
    if (!val) return;
    copyToClipboard(val);
    if (key === "single") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const handleDownloadBulk = () => {
    const csvContent =
      "Title,Slug\n" +
      bulkResults.map((r) => `"${r.title.replace(/"/g, '""')}","${r.slug}"`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-slugs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Google SERP Character Length Warning
  const fullUrl = `${baseUrl.replace(/\/$/, "")}/${singleSlug}`;
  const slugLength = singleSlug.length;
  const isOptimalLength = slugLength > 0 && slugLength <= 60;

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
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
            Convert article headlines, ecommerce products, and blog titles into search-optimized, clean URL permalinks.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
            <button
              onClick={() => setActiveTab("single")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "single"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Interactive Single & SERP Preview
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bulk Batch Generation ({bulkResults.length})
            </button>
          </div>
        </div>

        {/* Global Options Strip */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Separator:</span>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                {[
                  { id: "-", label: "Hyphen (-)" },
                  { id: "_", label: "Underscore (_)" },
                  { id: "/", label: "Slash (/)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSeparator(s.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                      separator === s.id
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Lowercase</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeStopWords}
                onChange={(e) => setRemoveStopWords(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Strip Stop Words (the, a, and, for...)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeNumbers}
                onChange={(e) => setRemoveNumbers(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-purple-600"
              />
              <span>Remove Numbers</span>
            </label>
          </div>
        </div>

        {/* Tab 1: Single with Google SERP Preview */}
        {activeTab === "single" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Page Title or Article Headline
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. 10 Proven Marketing Strategies for 2026"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-bold text-white text-base focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Generated Slug Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    SEO Slug Result
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        isOptimalLength
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {slugLength} characters {isOptimalLength ? "(Optimal)" : "(Consider shortening)"}
                    </span>
                    <button
                      onClick={() => handleCopy(singleSlug, "single")}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy Slug"}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm sm:text-base text-purple-300 font-bold select-all break-all">
                  {singleSlug || "slug-preview-will-appear-here"}
                </div>
              </div>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Search className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Google Search SERP Simulation
                </span>
              </div>

              {/* Google SERP Card */}
              <div className="p-5 rounded-xl bg-white text-slate-900 shadow-md max-w-2xl font-sans">
                <div className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                    G
                  </div>
                  <span className="truncate">{fullUrl}</span>
                </div>
                <h3 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer truncate">
                  {input || "Your Article Headline"}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  Discover {input}. This comprehensive guide breaks down step-by-step methodologies and verified best practices for maximum search visibility...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bulk Generation */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Batch Titles (One Per Line)
                </label>
                <textarea
                  rows={12}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Generated Slugs */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Generated Slugs ({bulkResults.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(bulkResults.map((r) => r.slug).join("\n"), "bulk")}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedKey === "bulk" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === "bulk" ? "Copied" : "Copy All"}
                    </button>
                    <button
                      onClick={handleDownloadBulk}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-purple-300 max-h-72 overflow-y-auto space-y-2">
                  {bulkResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-900">
                      <span className="truncate mr-2 text-slate-200">{r.slug}</span>
                      <button
                        onClick={() => handleCopy(r.slug, `slug_${i}`)}
                        className="text-[10px] text-purple-400 hover:text-white shrink-0 cursor-pointer"
                      >
                        {copiedKey === `slug_${i}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
