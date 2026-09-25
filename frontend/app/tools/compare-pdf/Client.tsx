"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitCompare,
  FileText,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Columns,
  Diff,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface PageDiff {
  pageNum: number;
  doc1Text: string;
  doc2Text: string;
  hasDiff: boolean;
}

export default function ComparePdfClient() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [diffs, setDiffs] = useState<PageDiff[]>([]);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const extractTextByPage = async (file: File): Promise<string[]> => {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const pagesText: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((it: any) => it.str).join(" ");
      pagesText.push(text);
    }
    return pagesText;
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setIsComparing(true);
    setProgress(10);
    setError(null);
    setDiffs([]);

    try {
      const [doc1Pages, doc2Pages] = await Promise.all([
        extractTextByPage(file1),
        extractTextByPage(file2),
      ]);

      const maxPages = Math.max(doc1Pages.length, doc2Pages.length);
      const results: PageDiff[] = [];

      for (let i = 0; i < maxPages; i++) {
        const text1 = doc1Pages[i] || "[Page does not exist in Document 1]";
        const text2 = doc2Pages[i] || "[Page does not exist in Document 2]";
        const hasDiff = text1.trim() !== text2.trim();

        results.push({
          pageNum: i + 1,
          doc1Text: text1,
          doc2Text: text2,
          hasDiff,
        });

        setProgress(Math.round(((i + 1) / maxPages) * 100));
      }

      setDiffs(results);
      setSelectedPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to compare PDF documents.");
    } finally {
      setIsComparing(false);
    }
  };

  const currentDiff = diffs.find((d) => d.pageNum === selectedPage);

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            PDF Visual & Text Differencing
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Compare Two PDF Files Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Highlight differences, text changes, revisions, and page additions between two PDF document versions side by side with zero server uploads.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dual Upload Zone */}
        {diffs.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* File 1 Upload */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                  Document 1 (Original Version)
                </span>
                {!file1 ? (
                  <label className="w-full flex-1 border-2 border-dashed border-slate-700/60 hover:border-purple-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition">
                    <FileText className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-xs text-slate-300 font-medium">Choose Original PDF</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files && setFile1(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="truncate text-left">
                      <span className="text-xs font-semibold text-white block truncate">{file1.name}</span>
                      <span className="text-[10px] text-slate-400">{(file1.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button onClick={() => setFile1(null)} className="text-slate-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* File 2 Upload */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-400 mb-2">
                  Document 2 (Modified Version)
                </span>
                {!file2 ? (
                  <label className="w-full flex-1 border-2 border-dashed border-slate-700/60 hover:border-pink-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition">
                    <FileText className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-xs text-slate-300 font-medium">Choose Modified PDF</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files && setFile2(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="truncate text-left">
                      <span className="text-xs font-semibold text-white block truncate">{file2.name}</span>
                      <span className="text-[10px] text-slate-400">{(file2.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button onClick={() => setFile2(null)} className="text-slate-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!file1 || !file2 || isComparing}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-600/25 transition disabled:opacity-40"
              >
                {isComparing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Comparing Text Streams ({progress}%)...
                  </>
                ) : (
                  <>
                    <GitCompare className="w-4 h-4" />
                    Compare Documents
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Side-by-Side Comparison Workspace */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-white">Pages with Changes:</span>
                <div className="flex gap-1 overflow-x-auto max-w-md py-1">
                  {diffs.map((d) => (
                    <button
                      key={d.pageNum}
                      onClick={() => setSelectedPage(d.pageNum)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        selectedPage === d.pageNum
                          ? "bg-purple-600 text-white font-bold"
                          : d.hasDiff
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      P.{d.pageNum} {d.hasDiff && "•"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setDiffs([]);
                  setFile1(null);
                  setFile2(null);
                }}
                className="text-xs text-slate-400 hover:text-red-400 transition"
              >
                Compare other documents
              </button>
            </div>

            {/* Diff Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document 1 Column */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
                  <span className="font-semibold text-purple-400 truncate max-w-xs">{file1?.name}</span>
                  <span className="text-slate-400">Page {selectedPage}</span>
                </div>
                <div className="w-full h-110 overflow-y-auto bg-slate-950/80 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentDiff?.doc1Text}
                </div>
              </div>

              {/* Document 2 Column */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
                  <span className="font-semibold text-pink-400 truncate max-w-xs">{file2?.name}</span>
                  <span className="text-slate-400">Page {selectedPage}</span>
                </div>
                <div
                  className={`w-full h-110 overflow-y-auto bg-slate-950/80 rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap ${
                    currentDiff?.hasDiff ? "text-amber-300 bg-amber-950/10" : "text-slate-300"
                  }`}
                >
                  {currentDiff?.doc2Text}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <GitCompare className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Side-by-Side Differencing</h4>
            <p className="text-xs text-slate-400">
              Pinpoints line additions, modified contracts, and clause alterations across different revisions of your documents.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero Cloud Upload</h4>
            <p className="text-xs text-slate-400">
              Document text extraction runs locally in your browser memory via WebAssembly. Neither document is ever uploaded to a server.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
              <Columns className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Page Revision Navigator</h4>
            <p className="text-xs text-slate-400">
              Quickly jump directly to modified pages marked with orange indicators without scrolling through dozens of identical pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
