"use client";

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
} from "lucide-react";

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

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
        topKeywords: [],
      };
    }

    const words = trimmed.match(/\b\S+\b/g) || [];
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, "").length;
    const sentences = trimmed.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

    // Average reading speed: 200 words per minute
    const readingTime = Math.ceil(words.length / 200);
    // Average speaking speed: 130 words per minute
    const speakingTime = Math.ceil(words.length / 130);

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
      "now", "look", "only", "come", "its", "over", "think", "also",
    ]);

    words.forEach((w) => {
      const cleaned = w.toLowerCase().replace(/[^a-z0-9]/gi, "");
      if (cleaned.length > 2 && !stopWords.has(cleaned)) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
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
      topKeywords,
    };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Zero-Latency Content Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Word & Character Counter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Live word frequency, reading time estimates, sentence structure analysis, and keyword density.
          </p>
        </div>

        {/* Real-time Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Words
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-400">
              {stats.words.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Characters
            </span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-400">
              {stats.characters.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              No Spaces
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats.charactersNoSpaces.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Sentences
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {stats.sentences.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Paragraphs
            </span>
            <span className="text-2xl sm:text-3xl font-black text-pink-400">
              {stats.paragraphs.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-1">
              Reading Time
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-400">
              {stats.readingTime} <span className="text-xs font-normal text-slate-400">min</span>
            </span>
          </div>
        </div>

        {/* Main Editor & Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-purple-400" />
                  Text Input
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!text}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40 text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={!text}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40 text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here to get instant word, sentence, and character statistics..."
                className="w-full h-80 bg-transparent text-slate-100 placeholder-slate-500 resize-y focus:outline-none text-sm sm:text-base leading-relaxed"
              />
            </div>
          </div>

          {/* Intelligence Panel */}
          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Speech & Reading Metrics
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Reading Time
                  </div>
                  <span className="font-semibold text-white">~{stats.readingTime} min</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Volume2 className="w-4 h-4 text-pink-400" />
                    Speaking Time
                  </div>
                  <span className="font-semibold text-white">~{stats.speakingTime} min</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Keyword Density
              </h3>
              {stats.topKeywords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Start typing to see top keywords and density metrics.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.topKeywords.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-mono">{item.word}</span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-slate-500">{item.count}x</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-semibold">
                          {item.percent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
