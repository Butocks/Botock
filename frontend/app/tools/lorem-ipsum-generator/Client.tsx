"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Code,
  Download,
} from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
  "est", "laborum",
];

export default function LoremIpsumGeneratorClient() {
  const [count, setCount] = useState<number>(3);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [htmlTags, setHtmlTags] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const generateSentence = (): string => {
    const len = Math.floor(Math.random() * 10) + 8;
    const words: string[] = [];
    for (let i = 0; i < len; i++) {
      const idx = Math.floor(Math.random() * LOREM_WORDS.length);
      words.push(LOREM_WORDS[idx]);
    }
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };

  const generateParagraph = (isFirst: boolean): string => {
    const numSentences = Math.floor(Math.random() * 4) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < numSentences; i++) {
      if (isFirst && i === 0 && startWithLorem) {
        sentences.push(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        );
      } else {
        sentences.push(generateSentence());
      }
    }
    return sentences.join(" ");
  };

  const generateOutput = (): string => {
    if (type === "words") {
      const words: string[] = [];
      if (startWithLorem && count >= 5) {
        words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      }
      while (words.length < count) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      const raw = words.slice(0, count).join(" ");
      return htmlTags ? `<p>${raw}</p>` : raw;
    }

    if (type === "sentences") {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem) {
          sentences.push(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          );
        } else {
          sentences.push(generateSentence());
        }
      }
      return htmlTags
        ? sentences.map((s) => `<p>${s}</p>`).join("\n")
        : sentences.join(" ");
    }

    // Paragraphs
    const paras: string[] = [];
    for (let i = 0; i < count; i++) {
      paras.push(generateParagraph(i === 0));
    }

    if (htmlTags) {
      return paras.map((p) => `<p>${p}</p>`).join("\n\n");
    }
    return paras.join("\n\n");
  };

  const [output, setOutput] = useState<string>(generateOutput);

  const handleRegenerate = () => {
    setOutput(generateOutput());
  };

  const handleCopy = () => {
    copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lorem-ipsum-${type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Placeholder Generator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Lorem Ipsum Dummy Text Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Instantly generate custom dummy text with paragraphs, sentences, words, and HTML wrappers.
          </p>
        </div>

        {/* Controls Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Type selector */}
            <div>
              <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-2">
                Generate By
              </label>
              <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
                {(["paragraphs", "sentences", "words"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setType(t);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                      type === t
                        ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                  Quantity
                </label>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {count} {type}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={type === "words" ? 250 : 20}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2 pt-2 md:pt-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Start with "Lorem ipsum dolor..."
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={htmlTags}
                  onChange={(e) => setHtmlTags(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Wrap in HTML &lt;p&gt; tags
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleRegenerate}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Text
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Generated Placeholder Output
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download TXT
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/60 max-h-96 overflow-y-auto">
            <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
