"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  FileCode,
  Download,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export default function PdfToMarkdownClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [markdown, setMarkdown] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setError("Please choose a valid PDF file.");
        return;
      }
      setError(null);
      setFile(selected);
      setMarkdown("");
      setIsProcessing(true);
      setProgress(5);

      try {
        const buffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);

        let fullMarkdown = `# ${selected.name.replace(/\.pdf$/i, "")}\n\n`;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          fullMarkdown += `\n---\n\n## Page ${pageNum}\n\n`;

          let lastY: number | null = null;
          let currentParagraph = "";

          for (const item of textContent.items as any[]) {
            const str = item.str.trim();
            if (!str) continue;

            const currentY = item.transform[5];
            const fontSize = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]);

            // Detect new line / paragraph break based on vertical distance
            if (lastY !== null && Math.abs(currentY - lastY) > 8) {
              if (currentParagraph) {
                fullMarkdown += currentParagraph + "\n\n";
                currentParagraph = "";
              }
            }

            // Simple heading heuristic based on font size
            if (fontSize > 16 && str.length < 80) {
              if (currentParagraph) {
                fullMarkdown += currentParagraph + "\n\n";
                currentParagraph = "";
              }
              fullMarkdown += `### ${str}\n\n`;
            } else {
              currentParagraph += (currentParagraph ? " " : "") + str;
            }

            lastY = currentY;
          }

          if (currentParagraph) {
            fullMarkdown += currentParagraph + "\n\n";
          }

          setProgress(Math.round((pageNum / pdf.numPages) * 100));
        }

        setMarkdown(fullMarkdown.trim());
      } catch (err: any) {
        setError(err.message || "Failed to extract markdown from PDF.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCopy = () => {
    if (!markdown) return;
    copyToClipboard(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!markdown || !file) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileCode className="w-3.5 h-3.5" />
            PDF to Markdown Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert PDF to Markdown Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Extract headings, formatted paragraphs, and structured page notes from your PDF into clean, GitHub-flavored Markdown text.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          /* Upload State */
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="pdf-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-cyan-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <FileCode className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select your PDF document
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Instant text analysis: Extract structured headings, clean paragraphs, and clean page dividers.
              </p>
              <span className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/25 transition">
                Choose PDF File
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
          /* Markdown Editor / Preview Layout */
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-sm">{file.name}</h4>
                  <p className="text-xs text-slate-400">
                    {pageCount} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopy}
                  disabled={!markdown}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Markdown"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!markdown}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .md
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setMarkdown("");
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isProcessing ? (
              <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs text-slate-400">
                  Parsing stream objects & constructing Markdown... ({progress}%)
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Raw Markdown Editor */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Raw Markdown Source
                  </span>
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Rendered Preview */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Rendered Preview
                  </span>
                  <div className="w-full h-120 bg-slate-900/40 border border-slate-800 rounded-xl p-6 overflow-y-auto text-xs text-slate-300 space-y-4">
                    {markdown.split("\n\n").map((chunk, idx) => {
                      if (chunk.startsWith("# ")) {
                        return <h1 key={idx} className="text-xl font-bold text-white pb-2 border-b border-slate-800">{chunk.replace("# ", "")}</h1>;
                      }
                      if (chunk.startsWith("## ")) {
                        return <h2 key={idx} className="text-base font-semibold text-cyan-400 mt-4">{chunk.replace("## ", "")}</h2>;
                      }
                      if (chunk.startsWith("### ")) {
                        return <h3 key={idx} className="text-sm font-semibold text-white mt-2">{chunk.replace("### ", "")}</h3>;
                      }
                      if (chunk.trim() === "---") {
                        return <hr key={idx} className="border-slate-800 my-4" />;
                      }
                      return <p key={idx} className="leading-relaxed text-slate-300">{chunk}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">GitHub Flavored Markdown</h4>
            <p className="text-xs text-slate-400">
              Converts PDF hierarchy and font scale changes into standard markdown headings (#, ##, ###) and clean paragraphs.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Private & Safe</h4>
            <p className="text-xs text-slate-400">
              Extraction occurs entirely on your device via client-side PDF parser. No server calls or third-party API dependencies.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Ready for LLMs & AI</h4>
            <p className="text-xs text-slate-400">
              Transform dense PDF documents into token-efficient Markdown suitable for feeding directly into ChatGPT, Claude, and local AI prompts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
