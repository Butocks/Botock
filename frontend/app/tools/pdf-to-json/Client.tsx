"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Code,
  Download,
  Trash2,
  Copy,
  Check,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Braces,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface PdfMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
}

interface PdfJsonOutput {
  documentName: string;
  pageCount: number;
  metadata: PdfMetadata;
  pages: Array<{
    pageNumber: number;
    width: number;
    height: number;
    text: string;
    items: Array<{
      str: string;
      x: number;
      y: number;
      fontSize: number;
    }>;
  }>;
}

export default function PdfToJsonClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [jsonData, setJsonData] = useState<PdfJsonOutput | null>(null);
  const [jsonString, setJsonString] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractMode, setExtractMode] = useState<"clean" | "detailed">("clean");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setError("Please choose a valid PDF file.");
        return;
      }
      setError(null);
      setFile(selected);
      setJsonData(null);
      setJsonString("");
      setIsProcessing(true);
      setProgress(5);

      try {
        const buffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);

        let docMeta: any = {};
        try {
          const meta = await pdf.getMetadata();
          docMeta = meta?.info || {};
        } catch (e) {
          // ignore metadata failure
        }

        const pagesData: PdfJsonOutput["pages"] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.0 });
          const textContent = await page.getTextContent();

          const items: any[] = [];
          const textChunks: string[] = [];

          for (const item of textContent.items as any[]) {
            const str = item.str;
            if (!str) continue;
            textChunks.push(str);

            if (extractMode === "detailed") {
              const fontSize = Math.sqrt(
                item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]
              );
              items.push({
                str,
                x: Math.round(item.transform[4]),
                y: Math.round(item.transform[5]),
                fontSize: Math.round(fontSize),
              });
            }
          }

          pagesData.push({
            pageNumber: i,
            width: Math.round(viewport.width),
            height: Math.round(viewport.height),
            text: textChunks.join(" "),
            items: extractMode === "detailed" ? items : [],
          });

          setProgress(Math.round((i / pdf.numPages) * 100));
        }

        const result: PdfJsonOutput = {
          documentName: selected.name,
          pageCount: pdf.numPages,
          metadata: {
            title: docMeta.Title || undefined,
            author: docMeta.Author || undefined,
            creator: docMeta.Creator || undefined,
            producer: docMeta.Producer || undefined,
            creationDate: docMeta.CreationDate || undefined,
          },
          pages: pagesData,
        };

        setJsonData(result);
        setJsonString(JSON.stringify(result, null, 2));
      } catch (err: any) {
        setError(err.message || "Failed to extract JSON from PDF.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCopy = () => {
    if (!jsonString) return;
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!jsonString || !file) return;
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Braces className="w-3.5 h-3.5" />
            PDF to JSON Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert PDF to JSON Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Extract structured JSON text data, page dimensions, document metadata, and coordinate positions from any PDF document.
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
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-emerald-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select your PDF document
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Structured parsing: Outputs cleanly formatted JSON for backend pipelines and APIs.
              </p>
              <span className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 transition">
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
          /* JSON Viewer Layout */
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
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
                  disabled={!jsonString}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!jsonString}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .json
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setJsonData(null);
                    setJsonString("");
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isProcessing ? (
              <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs text-slate-400">
                  Parsing stream objects & constructing JSON schema... ({progress}%)
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">
                    Structured Output ({pageCount} pages parsed)
                  </span>
                  <span>{(jsonString.length / 1024).toFixed(1)} KB JSON payload</span>
                </div>
                <div className="w-full h-120 bg-slate-950/80 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-emerald-400/90 leading-relaxed">
                  <pre>{jsonString}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Braces className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Clean Schema Structure</h4>
            <p className="text-xs text-slate-400">
              Outputs document title, creator metadata, page dimensions, and page-by-page text content in predictable JSON.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero Cloud Processing</h4>
            <p className="text-xs text-slate-400">
              Extraction occurs directly inside your web browser. No confidential document data is ever transmitted to a server.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Developer Friendly</h4>
            <p className="text-xs text-slate-400">
              One-click clipboard copy or direct .json file download for automated backend workflows, parsers, and data analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
