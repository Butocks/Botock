"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import React, { useState, useMemo } from "react";
import {
  Sparkles,
  FileText,
  Download,
  Trash2,
  Copy,
  Check,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Brain,
  ListFilter,
  Search,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

interface SummaryResult {
  executiveSummary: string;
  bulletPoints: string[];
  actionItems: string[];
  qnaPairs: { q: string; a: string }[];
  totalWords: number;
}

export default function PdfAiSummarizerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRangeMode, setPageRangeMode] = useState<"all" | "custom">("all");
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(5);

  const [extractedText, setExtractedText] = useState<string>("");
  const [summaryMode, setSummaryMode] = useState<"executive" | "action-items" | "qna">("executive");
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  
  // Interactive Topic Search / Ask Document
  const [searchTopic, setSearchTopic] = useState<string>("");
  const [topicResults, setTopicResults] = useState<string[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setExtractedText("");
      setSummary(null);
      setError(null);
      setIsProcessing(true);

      try {
        const buffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);
        setEndPage(Math.min(pdf.numPages, 10));

        let fullText = "";
        const fromP = pageRangeMode === "custom" ? Math.max(1, startPage) : 1;
        const toP = pageRangeMode === "custom" ? Math.min(pdf.numPages, endPage) : pdf.numPages;

        for (let i = fromP; i <= toP; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items.map((it: any) => it.str).join(" ");
          fullText += pageStr + " ";
        }

        const cleanText = fullText.trim();
        setExtractedText(cleanText);

        generateAdvancedSummary(cleanText);
      } catch (err: any) {
        setError(err.message || "Failed to analyze document.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const generateAdvancedSummary = (text: string) => {
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30 && s.length < 300);

    if (sentences.length === 0) {
      setError("No readable sentences detected in this document.");
      return;
    }

    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const freq: Record<string, number> = {};
    const stopWords = new Set([
      "the", "and", "are", "for", "not", "but", "you", "all", "any", "can", "had", "her",
      "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new",
      "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say",
      "she", "too", "use", "this", "that", "with", "from", "have", "were", "which", "there",
      "their", "about", "would", "these", "other", "into", "more", "first", "been", "they",
      "each", "make", "like", "time", "just", "know", "take", "people", "year", "your",
      "good", "some", "could", "them", "than", "then", "also", "such", "even", "most"
    ]);

    for (const w of words) {
      if (!stopWords.has(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }

    // Score sentences
    const scored = sentences.map((sent) => {
      let score = 0;
      const sentWords = sent.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      sentWords.forEach((w) => {
        score += freq[w] || 0;
      });
      return { sent, score: score / (sentWords.length + 1) };
    });

    scored.sort((a, b) => b.score - a.score);

    const topSentences = scored.slice(0, 10).map((s) => s.sent);
    const executiveSummary = topSentences.slice(0, 3).join(" ");
    const bulletPoints = topSentences.slice(3, 7);

    // Heuristic Action Items (sentences with must, should, require, will, ensure, recommend)
    const actionSentences = sentences
      .filter((s) => /\b(must|should|require|required|will|ensure|recommend|agreed|responsible)\b/i.test(s))
      .slice(0, 5);

    // Q&A Pairs
    const qnaPairs = [
      {
        q: "What is the primary topic or thesis of this document?",
        a: topSentences[0] || "Main thesis overview.",
      },
      {
        q: "What key conclusions or findings are highlighted?",
        a: topSentences[1] || "Key conclusions and outcomes.",
      },
      {
        q: "What recommendations or critical conditions are noted?",
        a: topSentences[2] || "Recommendations and operational scope.",
      },
    ];

    setSummary({
      executiveSummary,
      bulletPoints,
      actionItems: actionSentences.length > 0 ? actionSentences : topSentences.slice(4, 7),
      qnaPairs,
      totalWords: words.length,
    });
  };

  // Interactive Topic Search
  const handleSearchTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTopic.trim() || !extractedText) return;

    const term = searchTopic.toLowerCase().trim();
    const sentences = extractedText.split(/(?<=[.?!])\s+/);
    const matches = sentences
      .filter((s) => s.toLowerCase().includes(term) && s.length > 20)
      .slice(0, 5);

    setTopicResults(matches);
  };

  const handleCopy = () => {
    if (!summary) return;
    const textToCopy = `EXECUTIVE SUMMARY:\n${summary.executiveSummary}\n\nKEY TAKEAWAYS:\n${summary.bulletPoints.map((b) => `• ${b}`).join("\n")}\n\nACTION ITEMS:\n${summary.actionItems.map((a) => `• ${a}`).join("\n")}`;
    copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const md = `# Document Intelligence Summary\n\n## Executive Summary\n${summary.executiveSummary}\n\n## Key Takeaways\n${summary.bulletPoints.map((b) => `- ${b}`).join("\n")}\n\n## Action Items & Requirements\n${summary.actionItems.map((a) => `- [ ] ${a}`).join("\n")}\n\n## Automated Q&A Analysis\n${summary.qnaPairs.map((pair) => `### Q: ${pair.q}\n**A:** ${pair.a}`).join("\n\n")}`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${file?.name ? file.name.replace(/\.[^/.]+$/, "") : "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reanalyzeRange = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSummary(null);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      let fullText = "";
      const fromP = pageRangeMode === "custom" ? Math.max(1, startPage) : 1;
      const toP = pageRangeMode === "custom" ? Math.min(pdf.numPages, endPage) : pdf.numPages;

      for (let i = fromP; i <= toP; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStr = textContent.items.map((it: any) => it.str).join(" ");
        fullText += pageStr + " ";
      }

      const cleanText = fullText.trim();
      setExtractedText(cleanText);
      generateAdvancedSummary(cleanText);
    } catch (err: any) {
      setError(err.message || "Failed to analyze document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setSummary(null);
    setExtractedText("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b0f] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Brain className="w-3.5 h-3.5" />
            Document Intelligence Synthesizer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
            <span>AI PDF Document Summarizer</span>
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Beta
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Extract executive summaries, key directives, actionable obligations, and question-answer pairs directly in your browser.
          </p>
        </div>

        {/* File Upload & Settings Card */}
        {!file ? (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Click or Drop PDF to Summarize
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                Contracts, research papers, legal deeds, and quarterly earnings reports analyzed in private WASM memory.
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active File Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-400" />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">{file.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {pageCount} Pages • {summary ? summary.totalWords.toLocaleString() : 0} Words
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setPageRangeMode("all");
                      if (file && pageRangeMode !== "all") {
                        setTimeout(() => reanalyzeRange(), 50);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg transition ${pageRangeMode === "all" ? "bg-purple-600 text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    All Pages
                  </button>
                  <button
                    onClick={() => setPageRangeMode("custom")}
                    className={`px-2.5 py-1 rounded-lg transition ${pageRangeMode === "custom" ? "bg-purple-600 text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    Custom Range
                  </button>
                </div>

                {pageRangeMode === "custom" && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span>Page</span>
                    <input
                      type="number"
                      min={1}
                      max={pageCount || 1}
                      value={startPage}
                      onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 text-center text-slate-900 dark:text-white"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      min={startPage}
                      max={pageCount || 1}
                      value={endPage}
                      onChange={(e) => setEndPage(Math.min(pageCount || 1, Math.max(startPage, parseInt(e.target.value) || startPage)))}
                      className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 text-center text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={reanalyzeRange}
                      className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-semibold text-xs"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <button
                  onClick={resetAll}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-transparent"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Start Over
                </button>
              </div>
            </div>

            {/* Processing Spinner */}
            {isProcessing && (
              <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-3"></div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Synthesizing Document Insights...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Results Studio */}
            {summary && !isProcessing && (
              <div className="space-y-6">
                {/* Mode Selector Tabs */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex gap-2">
                    {[
                      { id: "executive", label: "Executive Summary" },
                      { id: "action-items", label: "Action Items & Obligations" },
                      { id: "qna", label: "Automated Q&A" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSummaryMode(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          summaryMode === tab.id
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-transparent"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Markdown
                    </button>
                  </div>
                </div>

                {/* Content Views */}
                {summaryMode === "executive" && (
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-2">
                        Executive Overview
                      </span>
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        {summary.executiveSummary}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-3">
                        Key Strategic Takeaways
                      </span>
                      <div className="space-y-2">
                        {summary.bulletPoints.map((point, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {i + 1}
                            </span>
                            <span className="pt-0.5">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {summaryMode === "action-items" && (
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                      Directives, Requirements & Obligations
                    </span>
                    <div className="space-y-2.5">
                      {summary.actionItems.map((item, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summaryMode === "qna" && (
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                      Automated Synthesis Q&A
                    </span>
                    <div className="space-y-3">
                      {summary.qnaPairs.map((pair, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                          <p className="text-xs font-bold text-purple-300">{pair.q}</p>
                          <p className="text-xs text-slate-300 pl-3 border-l-2 border-purple-500/40">
                            {pair.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ask This Document Search Bar */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Query Specific Topic in Document
                    </span>
                  </div>

                  <form onSubmit={handleSearchTopic} className="flex gap-2">
                    <input
                      type="text"
                      value={searchTopic}
                      onChange={(e) => setSearchTopic(e.target.value)}
                      placeholder="e.g. payment terms, termination, warranty, revenue..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                    >
                      Extract Excerpts
                    </button>
                  </form>

                  {topicResults.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        Matching Passages ({topicResults.length}):
                      </span>
                      {topicResults.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono"
                        >
                          &quot;{t}&quot;
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
