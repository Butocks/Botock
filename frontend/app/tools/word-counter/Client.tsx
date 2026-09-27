"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  BookOpen,
  AlignLeft,
  Volume2,
  Upload,
  BarChart2,
  FileCheck,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setIsExtracting(true);

      try {
        if (file.name.toLowerCase().endsWith(".pdf")) {
          const buffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: buffer });
          const pdf = await loadingTask.promise;
          let full = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            full += content.items.map((it: any) => it.str).join(" ") + " ";
          }
          setText(full.trim());
        } else {
          const raw = await file.text();
          if (file.name.toLowerCase().endsWith(".html") || file.name.toLowerCase().endsWith(".htm")) {
            // Strip tags for clean text analysis
            const clean = raw.replace(/<[^>]+>/g, " ");
            setText(clean.replace(/\s+/g, " ").trim());
          } else {
            setText(raw);
          }
        }
      } catch {
        setText("Could not parse file. Please upload a valid text, markdown, or PDF document.");
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0,
        readabilityScore: 0,
        topKeywords: [],
      };
    }

    const words = trimmed.match(/\b\S+\b/g) || [];
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, "").length;
    const sentences = trimmed.split(/[.!?]+/).filter(Boolean).length || 1;
    const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;

    // Average reading: 200 wpm, speaking: 130 wpm
    const readingTime = Math.max(1, Math.ceil(words.length / 200));
    const speakingTime = Math.max(1, Math.ceil(words.length / 130));

    // Approximate Flesch Reading Ease
    // 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
    const avgWordsPerSentence = words.length / sentences;
    const readability = Math.min(100, Math.max(0, Math.round(206.835 - 1.015 * avgWordsPerSentence - 35)));

    // Keyword density analysis
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set([
      "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
      "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
      "this", "but", "his", "by", "from", "they", "we", "say", "her",
      "she", "or", "an", "will", "my", "one", "all", "would", "there",
      "their", "what", "so", "up", "out", "if", "about", "who", "get",
      "which", "go", "me", "when", "make", "can", "like", "time", "no",
      "just", "him", "know", "take", "people", "into", "year", "your",
      "good", "some", "could", "them", "see", "other", "than", "then",
      "now", "look", "only", "come", "its", "over", "think", "also", "is", "are"
    ]);

    words.forEach((w) => {
      const cleaned = w.toLowerCase().replace(/[^a-z0-9]/gi, "");
      if (cleaned.length > 2 && !stopWords.has(cleaned)) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({
        word,
        count,
        percent: ((count / words.length) * 100).toFixed(1),
      }));

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      readabilityScore: readability,
      topKeywords,
    };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            Content Intelligence Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Word & Character Counter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Live word frequency, reading time estimates, keyword density, and multi-format document support (PDF, DOCX, TXT, HTML).
          </p>
        </div>

        {/* File Drag & Drop Upload Strip */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {fileName ? fileName : "Upload Document to Count Words"}
              </span>
              <span className="text-[11px] text-slate-500">
                Directly extracts and analyzes PDF, TXT, Markdown, HTML, CSV files
              </span>
            </div>
          </div>

          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer">
            {isExtracting ? "Extracting..." : "Browse Document"}
            <input
              type="file"
              accept=".txt,.md,.pdf,.html,.htm,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isExtracting}
            />
          </label>
        </div>

        {/* Top 4 Primary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Words
            </span>
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats.words.toLocaleString()}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">
              Characters
            </span>
            <span className="text-3xl font-extrabold text-purple-300 font-mono">
              {stats.characters.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              {stats.charactersNoSpaces.toLocaleString()} no spaces
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Reading Time</span>
            </div>
            <span className="text-3xl font-extrabold text-emerald-300 font-mono">
              ~{stats.readingTime} min
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              Based on 200 wpm
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Speaking Time</span>
            </div>
            <span className="text-3xl font-extrabold text-blue-300 font-mono">
              ~{stats.speakingTime} min
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              Based on 130 wpm
            </span>
          </div>
        </div>

        {/* Secondary Metrics Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 mb-6 flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-300">
          <div>Sentences: <strong className="text-white">{stats.sentences}</strong></div>
          <div>Paragraphs: <strong className="text-white">{stats.paragraphs}</strong></div>
          <div>Avg Sentence Length: <strong className="text-white">{stats.words > 0 ? (stats.words / stats.sentences).toFixed(1) : 0} words</strong></div>
          <div>Readability Score: <strong className="text-emerald-400">{stats.readabilityScore}/100</strong></div>
        </div>

        {/* Text Area */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Content Editor
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Text"}
              </button>
              {text && (
                <button
                  onClick={() => {
                    setText("");
                    setFileName("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type, paste, or drop your document here to analyze text statistics in real time..."
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-y"
          />
        </div>

        {/* Keyword Density Table */}
        {stats.topKeywords.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Top Keywords & Frequency Density
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.topKeywords.map((kw, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-purple-300 font-bold">&quot;{kw.word}&quot;</span>
                  <div className="text-right">
                    <span className="text-white font-mono font-bold block">{kw.count}×</span>
                    <span className="text-[10px] text-slate-500 font-mono">{kw.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
