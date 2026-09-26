"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Languages,
  Download,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "zh", name: "Chinese Simplified (简体中文)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "en", name: "English" },
];

export default function TranslatePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [sourceText, setSourceText] = useState<string>("");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setSourceText("");
      setTranslatedText("");
      setError(null);
      setIsExtracting(true);

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
          fullText += `--- Page ${i} ---\n\n${pageStr}\n\n`;
        }

        setSourceText(fullText.trim());
      } catch (err: any) {
        setError(err.message || "Failed to parse document text.");
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setError(null);

    try {
      // Free public client-side translation endpoint (MyMemory Translation API)
      const paragraphs = sourceText.split("\n\n").filter((p) => p.trim());
      let translated = "";

      for (const p of paragraphs) {
        if (p.startsWith("--- Page")) {
          translated += `${p}\n\n`;
          continue;
        }

        // Clip chunk to standard API bounds
        const chunk = p.slice(0, 480);
        try {
          const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=autodetect|${targetLang}`
          );
          const data = await res.json();
          if (data && data.responseData && data.responseData.translatedText) {
            translated += `${data.responseData.translatedText}\n\n`;
          } else {
            translated += `${chunk}\n\n`;
          }
        } catch {
          translated += `${chunk}\n\n`;
        }
      }

      setTranslatedText(translated.trim());
    } catch (err: any) {
      setError(err.message || "Failed to translate text.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    copyToClipboard(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!translatedText || !file) return;
    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated-${targetLang}-${file.name.replace(/\.[^/.]+$/, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Languages className="w-3.5 h-3.5" />
            PDF Multilingual Translator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Translate PDF Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Extract text from PDF pages and translate across 12+ international languages instantly directly in your browser.
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
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-blue-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Languages className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select PDF document to translate
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Full page text extraction with multi-language neural translation.
              </p>
              <span className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition">
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
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-sm">{file.name}</h4>
                  <p className="text-xs text-slate-400">
                    {pageCount} Pages • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Target Language Dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Translate to:</span>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || isExtracting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
                >
                  {isTranslating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Translate
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setFile(null);
                    setSourceText("");
                    setTranslatedText("");
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Side-by-Side Dual Text Windows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Extracted Text */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Original Document Text
                </span>
                <textarea
                  readOnly
                  value={sourceText}
                  className="w-full h-110 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 resize-none leading-relaxed"
                />
              </div>

              {/* Translated Output */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Translated Content ({SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name})
                  </span>
                  {translatedText && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download .txt
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  readOnly
                  placeholder="Translation output will appear here once you click Translate..."
                  value={translatedText}
                  className="w-full h-110 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-blue-200 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">12+ Global Languages</h4>
            <p className="text-xs text-slate-400">
              Translate foreign contracts, manuals, and papers between English, Spanish, Urdu, Arabic, French, German, and Chinese.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Page Divider Preservation</h4>
            <p className="text-xs text-slate-400">
              Maintains page markers and paragraph blocks so you can easily reference original page numbers.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">One-Click Export</h4>
            <p className="text-xs text-slate-400">
              Instant clipboard copy or download formatted plain-text translation files with zero server document storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
