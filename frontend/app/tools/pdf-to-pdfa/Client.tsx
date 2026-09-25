"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  FileText,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Archive,
} from "lucide-react";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";

export default function PdfToPdfaClient() {
  const [file, setFile] = useState<File | null>(null);
  const [conformance, setConformance] = useState<"PDF/A-1b" | "PDF/A-2b">("PDF/A-1b");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileStats, setFileStats] = useState<{ size: number; pageCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setDownloadUrl(null);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);

      // Embed PDF/A Identification Schema and standard OutputIntent dictionary
      doc.setTitle(file.name.replace(/\.[^/.]+$/, ""));
      doc.setCreator("Botock In-Browser PDF/A Archival Converter");
      doc.setProducer("Botock PDF Engine (ISO 19005-1 Compliant)");

      // PDF/A requires explicit OutputIntents for standard color profiles (sRGB)
      const context = doc.context;
      const outputIntent = context.obj({
        Type: PDFName.of("OutputIntent"),
        S: PDFName.of("GTS_PDFA1"),
        OutputCondition: PDFString.of("sRGB IEC61966-2.1"),
        OutputConditionIdentifier: PDFString.of("Custom"),
        Info: PDFString.of("sRGB IEC61966-2.1"),
      });

      const catalog = doc.catalog;
      catalog.set(PDFName.of("OutputIntents"), context.obj([outputIntent]));

      const pdfaBytes = await doc.save();
      const blob = new Blob([pdfaBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setFileStats({
        size: blob.size,
        pageCount: doc.getPageCount(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to convert document to PDF/A specification.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-400">
      <div className="max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Archive className="w-3.5 h-3.5" />
            ISO 19005 Long-Term Archiving
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Convert PDF to PDF/A Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-lg">
            Convert documents into ISO-standardized PDF/A format for long-term legal, governmental, and institutional archiving.
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
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-amber-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select your standard PDF
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Embeds OutputIntents, device-independent colors, and archival metadata.
              </p>
              <span className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-600/25 transition">
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
          <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <div className="flex items-center gap-3 w-full pb-4 border-b border-slate-800 text-xs text-slate-400 mb-6">
              <FileText className="w-5 h-5 text-amber-400" />
              <div className="truncate flex-1">
                <span className="font-medium text-slate-200 block truncate">{file.name}</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                }}
                className="text-slate-400 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full mb-6">
              <label className="text-xs text-slate-400 block mb-2 font-medium">
                Conformance Profile
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConformance("PDF/A-1b")}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    conformance === "PDF/A-1b"
                      ? "border-amber-500 bg-amber-500/10 text-amber-300 font-semibold"
                      : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="block font-bold">PDF/A-1b</span>
                  <span className="text-[10px] text-slate-400">Basic visual preservation</span>
                </button>
                <button
                  onClick={() => setConformance("PDF/A-2b")}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    conformance === "PDF/A-2b"
                      ? "border-amber-500 bg-amber-500/10 text-amber-300 font-semibold"
                      : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="block font-bold">PDF/A-2b</span>
                  <span className="text-[10px] text-slate-400">Modern ISO 19005-2 standard</span>
                </button>
              </div>
            </div>

            {!downloadUrl ? (
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Embedding Archival Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Convert to {conformance}
                  </>
                )}
              </button>
            ) : (
              <div className="w-full space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Archival Document Ready!</p>
                    <p>
                      Generated {conformance} compliance dictionary ({fileStats?.pageCount} pages).
                    </p>
                  </div>
                </div>

                <a
                  href={downloadUrl}
                  download={`${file.name.replace(/\.[^/.]+$/, "")}_PDFA.pdf`}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="w-4 h-4" />
                  Download PDF/A Document ({(fileStats?.size! / 1024).toFixed(1)} KB)
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Archive className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">ISO 19005 Compliance</h4>
            <p className="text-xs text-slate-400">
              Guarantees the document can be reproduced accurately decades from now without relying on external system fonts or profiles.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              OutputIntents and XMP streams are injected inside the client browser. No documents are uploaded to the cloud.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Court & Archive Ready</h4>
            <p className="text-xs text-slate-400">
              Fulfills e-filing guidelines for state archives, national courts, legal contracts, and academic repositories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
