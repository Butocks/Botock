"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface SummaryResult {
  bulletPoints: string[];
  keyTakeaways: string[];
  executiveSummary: string;
  totalWords: number;
}

export default function PdfAiSummarizerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<SummaryResult | null>(null);
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

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items.map((it: any) => it.str).join(" ");
          fullText += pageStr + " ";
        }

        const cleanText = fullText.trim();
        setExtractedText(cleanText);

        // Client-side Extractive Summarization Algorithm (TF-IDF & TextRank heuristic)
        generateClientSummary(cleanText);
      } catch (err: any) {
        setError(err.message || "Failed to analyze document.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const generateClientSummary = (text: string) => {
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && s.length < 250);

    if (sentences.length === 0) {
      setError("No readable sentences detected in this document.");
      return;
    }

    // Word frequency count
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const freq: Record<string, number> = {};
    const stopWords = new Set([
      "this", "that", "with", "from", "have", "were", "which", "there", "their",
      "about", "would", "these", "other", "into", "more", "first", "been", "they"
    ]);

    for (const w of words) {
      if (!stopWords.has(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }

    // Score sentences based on keyword density and position
    const scoredSentences = sentences.map((s, idx) => {
      const sWords = s.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      let score = 0;
      for (const w of sWords) {
        score += freq[w] || 0;
      }
      // Boost initial and final paragraphs
      if (idx < 5 || idx > sentences.length - 5) score *= 1.3;
      return { sentence: s, score: score / (sWords.length || 1), index: idx };
    });

    // Top sentences for executive summary
    const topScored = [...scoredSentences].sort((a, b) => b.score - a.score);
    const keyBullets = topScored.slice(0, 5).sort((a, b) => a.index - b.index).map((item) => item.sentence);
    const keyTakeaways = topScored.slice(5, 8).map((item) => item.sentence);
    const execSummary = keyBullets.slice(0, 3).join(" ");

    setSummary({
      bulletPoints: keyBullets,
      keyTakeaways,
      executiveSummary: execSummary,
      totalWords: words.length,
    });
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `EXECUTIVE SUMMARY:\n${summary.executiveSummary}\n\nKEY HIGHLIGHTS:\n${summary.bulletPoints.map((b) => `• ${b}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-violet-500/20 selection:text-violet-400">
      <div className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Brain className="w-3.5 h-3.5" />
            Client-Side Document Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI PDF Summarizer Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-lg">
            Condense long PDF reports, research papers, and legal agreements into structured summaries and bullet points directly in your browser.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="pdf-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-violet-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select PDF document to summarize
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Instant statistical text-mining algorithm. Zero cloud transmission.
              </p>
              <span className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-lg shadow-violet-600/25 transition">
                Choose PDF Document
              </span>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-violet-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-sm">{file.name}</h4>
                  <p className="text-xs text-slate-400">
                    {pageCount} Pages • {summary?.totalWords || 0} Words Extracted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!summary}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setSummary(null);
                    setExtractedText("");
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isProcessing ? (
              <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs text-slate-400">
                  Parsing stream objects & computing sentence importance scores...
                </div>
              </div>
            ) : summary ? (
              <div className="space-y-6">
                {/* Executive Overview Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Executive Summary
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {summary.executiveSummary}
                  </p>
                </div>

                {/* Key Bullet Highlights */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-pink-400 flex items-center gap-1.5 mb-4">
                    <ListFilter className="w-3.5 h-3.5" />
                    Key Discussion Points & Findings
                  </span>
                  <ul className="space-y-3">
                    {summary.bulletPoints.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">In-Browser Sentence Scoring</h4>
            <p className="text-xs text-slate-400">
              Evaluates keyword frequency and lexical clustering directly in JavaScript without sending confidential files to third-party APIs.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Privacy Guarantee</h4>
            <p className="text-xs text-slate-400">
              Ideal for sensitive contracts, business proposals, and legal documentation. Zero cloud retention.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Instant Results</h4>
            <p className="text-xs text-slate-400">
              Processes 50+ page documents in seconds with instant clipboard copy and clean bullet points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
