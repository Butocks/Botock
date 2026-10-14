"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import {
  Wrench,
  FileCheck,
  FileX,
  ShieldCheck,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  Sparkles,
  Cpu,
  Layers,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { copyToClipboard } from "@/lib/utils/clipboard";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

interface DiagnosticReport {
  hasValidHeader: boolean;
  headerOffset: number;
  pdfVersion: string;
  hasEofMarker: boolean;
  hasTrailer: boolean;
  hasXrefTable: boolean;
  estimatedObjectCount: number;
  pageCount: number;
  integrityScore: number;
  issuesDetected: string[];
}

export default function RepairPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport | null>(null);

  // Repair states
  const [repairMode, setRepairMode] = useState<"smart" | "deep">("smart");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [repairStep, setRepairStep] = useState<string>("");
  const [repairedBlobUrl, setRepairedBlobUrl] = useState<string | null>(null);
  const [repairedSize, setRepairedSize] = useState<number | null>(null);
  const [repairedPages, setRepairedPages] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);

  // Preview states
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewTotalPages, setPreviewTotalPages] = useState<number>(1);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const repairedDocRef = useRef<any>(null);

  // Diagnose PDF raw bytes
  const analyzePdfBytes = (buffer: ArrayBuffer): DiagnosticReport => {
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    const issues: string[] = [];

    // 1. Check Header
    let headerOffset = -1;
    let pdfVersion = "Unknown";
    const headerPrefix = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
    for (let i = 0; i < Math.min(len - 5, 2048); i++) {
      if (
        bytes[i] === headerPrefix[0] &&
        bytes[i + 1] === headerPrefix[1] &&
        bytes[i + 2] === headerPrefix[2] &&
        bytes[i + 3] === headerPrefix[3] &&
        bytes[i + 4] === headerPrefix[4]
      ) {
        headerOffset = i;
        const verBytes = bytes.slice(i + 5, i + 8);
        pdfVersion = String.fromCharCode(...verBytes);
        break;
      }
    }

    if (headerOffset === -1) {
      issues.push("Missing '%PDF-' header marker at document start.");
    } else if (headerOffset > 0) {
      issues.push(`Preamble byte corruption: Header shifted by ${headerOffset} junk bytes.`);
    }

    // 2. Check EOF Marker in last 2048 bytes
    let hasEofMarker = false;
    const tailStart = Math.max(0, len - 2048);
    const tailStr = new TextDecoder("latin1").decode(bytes.slice(tailStart));
    if (tailStr.includes("%%EOF")) {
      hasEofMarker = true;
    } else {
      issues.push("Truncated or missing '%%EOF' end-of-file trailer.");
    }

    // 3. Check Trailer & XRef
    const hasTrailer = tailStr.includes("trailer") || tailStr.includes("/XRef");
    if (!hasTrailer) {
      issues.push("Damaged or missing PDF trailer dictionary.");
    }

    const hasXrefTable = tailStr.includes("xref") || tailStr.includes("/XRef");
    if (!hasXrefTable) {
      issues.push("Damaged cross-reference (xref) offset index table.");
    }

    // 4. Object & Page estimation
    let objCount = 0;
    let pageCount = 0;
    // Chunked search to avoid giant strings
    const chunkSize = 65536;
    for (let c = 0; c < len; c += chunkSize) {
      const chunk = new TextDecoder("latin1").decode(bytes.slice(c, Math.min(len, c + chunkSize + 128)));
      const matches = chunk.match(/\d+\s+\d+\s+obj/g);
      if (matches) objCount += matches.length;
      const pageMatches = chunk.match(/\/Type\s*\/Page\b/g);
      if (pageMatches) pageCount += pageMatches.length;
    }

    // 5. Integrity score
    let score = 100;
    if (headerOffset === -1) score -= 40;
    else if (headerOffset > 0) score -= 15;
    if (!hasEofMarker) score -= 25;
    if (!hasTrailer) score -= 20;
    if (!hasXrefTable) score -= 20;
    if (objCount === 0) score -= 20;
    score = Math.max(10, Math.min(100, score));

    return {
      hasValidHeader: headerOffset === 0,
      headerOffset,
      pdfVersion,
      hasEofMarker,
      hasTrailer,
      hasXrefTable,
      estimatedObjectCount: objCount,
      pageCount: Math.max(pageCount, 1),
      integrityScore: score,
      issuesDetected: issues,
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setErrorMsg(null);
      setRepairedBlobUrl(null);
      setRepairedSize(null);
      setRepairedPages(0);
      repairedDocRef.current = null;
      setIsAnalyzing(true);

      try {
        const buffer = await selected.arrayBuffer();
        setFileBuffer(buffer);
        const report = analyzePdfBytes(buffer);
        setDiagnostics(report);
      } catch (err: any) {
        setErrorMsg("Failed to read document bytes: " + (err.message || String(err)));
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const resetAll = () => {
    if (repairedBlobUrl) URL.revokeObjectURL(repairedBlobUrl);
    setFile(null);
    setFileBuffer(null);
    setDiagnostics(null);
    setRepairedBlobUrl(null);
    setRepairedSize(null);
    setRepairedPages(0);
    setErrorMsg(null);
    repairedDocRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (repairedBlobUrl) URL.revokeObjectURL(repairedBlobUrl);
    };
  }, [repairedBlobUrl]);

  // Perform Repair Operation
  const handleRepair = async () => {
    if (!file || !fileBuffer || !diagnostics) return;

    if (repairedBlobUrl) {
      URL.revokeObjectURL(repairedBlobUrl);
      setRepairedBlobUrl(null);
    }

    setIsRepairing(true);
    setErrorMsg(null);
    setRepairStep("Initializing repair engine...");

    try {
      const originalBytes = new Uint8Array(fileBuffer);
      let sanitizedBytes = originalBytes;

      // Step 1: Strip leading pre-header bytes if shifted
      setRepairStep("Step 1/4: Normalizing binary header markers...");
      if (diagnostics.headerOffset > 0) {
        sanitizedBytes = originalBytes.slice(diagnostics.headerOffset);
      } else if (diagnostics.headerOffset === -1) {
        // Missing header: Prepend standard PDF 1.7 header
        const headerStr = "%PDF-1.7\n%\u00e2\u00e3\u00cf\u00d3\n";
        const headerEnc = new TextEncoder().encode(headerStr);
        const merged = new Uint8Array(headerEnc.length + originalBytes.length);
        merged.set(headerEnc);
        merged.set(originalBytes, headerEnc.length);
        sanitizedBytes = merged;
      }

      // Step 2: Ensure EOF marker is present
      setRepairStep("Step 2/4: Verifying EOF markers and trailer dictionaries...");
      const tailCheck = new TextDecoder("latin1").decode(
        sanitizedBytes.slice(Math.max(0, sanitizedBytes.length - 256))
      );
      if (!tailCheck.includes("%%EOF")) {
        const eofEnc = new TextEncoder().encode("\n%%EOF\n");
        const withEof = new Uint8Array(sanitizedBytes.length + eofEnc.length);
        withEof.set(sanitizedBytes);
        withEof.set(eofEnc, sanitizedBytes.length);
        sanitizedBytes = withEof;
      }

      let repairedPdfBytes: Uint8Array | null = null;
      let finalPageCount = 0;

      if (repairMode === "smart") {
        // Smart Rebuild: Parse with pdf-lib and re-serialize clean xref table
        setRepairStep("Step 3/4: Rebuilding object catalog & cross-reference tables...");
        try {
          const loadedDoc = await PDFDocument.load(sanitizedBytes, {
            ignoreEncryption: true,
          });
          finalPageCount = loadedDoc.getPageCount();
          setRepairStep("Step 4/4: Serializing clean cross-reference table & optimizing...");
          repairedPdfBytes = await loadedDoc.save({ useObjectStreams: false });
        } catch (pdfLibErr) {
          console.warn("Smart rebuild hit deep parse error. Switching to resilient page recovery...", pdfLibErr);
          // Fallback seamlessly to deep page salvage mode
          setRepairMode("deep");
        }
      }

      // If smart rebuild failed or deep mode selected
      if (!repairedPdfBytes) {
        setRepairStep("Step 3/4: Deep salvage — extracting pages via fault-tolerant parser...");
        const loadingTask = pdfjsLib.getDocument({
          data: sanitizedBytes,
          stopAtErrors: false,
        });
        const pdfDoc = await loadingTask.promise;
        finalPageCount = pdfDoc.numPages;

        if (finalPageCount === 0) {
          throw new Error("No salvageable pages could be extracted from this corrupted document.");
        }

        setRepairStep(`Step 4/4: Re-authoring ${finalPageCount} clean pages into new PDF...`);
        const newPdfDoc = await PDFDocument.create();

        for (let pageNum = 1; pageNum <= finalPageCount; pageNum++) {
          setRepairStep(`Step 4/4: Salvaging & embedding page ${pageNum} of ${finalPageCount}...`);
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });

          // Render page to offscreen canvas
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const dataUrl = canvas.toDataURL("image/png");
            const pngImageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
            const embeddedImage = await newPdfDoc.embedPng(pngImageBytes);

            // Create matching PDF page
            const newPage = newPdfDoc.addPage([viewport.width / 2.0, viewport.height / 2.0]);
            newPage.drawImage(embeddedImage, {
              x: 0,
              y: 0,
              width: viewport.width / 2.0,
              height: viewport.height / 2.0,
            });
          }
        }

        repairedPdfBytes = await newPdfDoc.save();
      }

      // Repair succeeded! Create blob URL
      const blob = new Blob([repairedPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setRepairedBlobUrl(url);
      setRepairedSize(blob.size);
      setRepairedPages(finalPageCount);

      // Load for live thumbnail preview
      const previewLoadingTask = pdfjsLib.getDocument({ data: repairedPdfBytes });
      const loadedRepaired = await previewLoadingTask.promise;
      repairedDocRef.current = loadedRepaired;
      setPreviewTotalPages(loadedRepaired.numPages);
      setPreviewPage(1);
      renderPreviewPage(loadedRepaired, 1);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Could not repair document. The file may be encrypted with an unknown cipher or completely wiped."
      );
    } finally {
      setIsRepairing(false);
      setRepairStep("");
    }
  };

  // Render a specific page preview onto canvas
  const renderPreviewPage = async (doc: any, pageNum: number) => {
    if (!doc || !previewCanvasRef.current) return;
    setPreviewLoading(true);
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = previewCanvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (e) {
      console.error("Preview render failed:", e);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleNextPage = () => {
    if (previewPage < previewTotalPages && repairedDocRef.current) {
      const next = previewPage + 1;
      setPreviewPage(next);
      renderPreviewPage(repairedDocRef.current, next);
    }
  };

  const handlePrevPage = () => {
    if (previewPage > 1 && repairedDocRef.current) {
      const prev = previewPage - 1;
      setPreviewPage(prev);
      renderPreviewPage(repairedDocRef.current, prev);
    }
  };

  const copyDiagnosticReport = () => {
    if (!diagnostics || !file) return;
    const text = `--- Botock PDF Repair Diagnostic Report ---
File: ${file.name} (${formatBytes(file.size)})
PDF Version: ${diagnostics.pdfVersion}
Health Score: ${diagnostics.integrityScore}%
Valid Header: ${diagnostics.hasValidHeader ? "Yes" : "No (Shift: " + diagnostics.headerOffset + " bytes)"}
EOF Marker: ${diagnostics.hasEofMarker ? "Present" : "Missing"}
XRef Table: ${diagnostics.hasXrefTable ? "Detected" : "Damaged / Rebuilding needed"}
Trailer: ${diagnostics.hasTrailer ? "Valid" : "Missing / Corrupted"}
Objects Detected: ~${diagnostics.estimatedObjectCount}
Issues Found:
${diagnostics.issuesDetected.length > 0 ? diagnostics.issuesDetected.map((i) => ` - ${i}`).join("\n") : " - No critical corruptions detected."}
---------------------------------------------`;
    copyToClipboard(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2500);
  };

  return (
    <div className="w-full text-slate-900 dark:text-white flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-500 dark:selection:text-emerald-400 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8 w-full">
        {/* Tool Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <span>100% In-Browser Privacy • Zero Server Uploads</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Repair &amp; Recover Corrupted PDF Files
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Rebuild damaged cross-reference tables, restore broken headers, and salvage unreadable pages from damaged PDF documents directly in your browser.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Document Repair Notice</p>
              <p className="text-xs text-rose-700 dark:text-rose-200/90 mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs text-rose-500 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Drag & Drop Upload Zone (when no file selected) */}
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center shadow-sm ${
              isDragActive
                ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-[#111114] hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
              <Wrench className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Choose or Drop Corrupted PDF Document
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-5 leading-relaxed">
              Select any broken, damaged, or unreadable PDF. Our client-side diagnostics will analyze and reconstruct it automatically.
            </p>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md">
              <FileCheck className="w-4 h-4" />
              <span>Select Broken PDF File</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
              Supports standard PDFs up to 100MB • Processed locally in WebAssembly
            </p>
          </div>
        ) : (
          /* Active Document Workbench */
          <div className="space-y-6">
            {/* Top Info Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      PDF {diagnostics?.pdfVersion || ""}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetAll}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Remove File</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Inspection Report Card */}
            {diagnostics && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Diagnostic Health Check</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        diagnostics.integrityScore >= 80
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : diagnostics.integrityScore >= 50
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      Integrity Score: {diagnostics.integrityScore}%
                    </span>
                    <button
                      onClick={copyDiagnosticReport}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer transition"
                      title="Copy diagnostic report"
                    >
                      {copiedLog ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy Log</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4 Health Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Binary Header</p>
                    <p className="text-xs font-bold mt-1 flex items-center gap-1.5">
                      {diagnostics.hasValidHeader ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-slate-900 dark:text-white">Clean (%PDF-{diagnostics.pdfVersion})</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-300">Shifted (+{diagnostics.headerOffset}b)</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">EOF Trailer</p>
                    <p className="text-xs font-bold mt-1 flex items-center gap-1.5">
                      {diagnostics.hasEofMarker ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-slate-900 dark:text-white">Valid %%EOF</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-600 dark:text-rose-300">Truncated EOF</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">XRef Table</p>
                    <p className="text-xs font-bold mt-1 flex items-center gap-1.5">
                      {diagnostics.hasXrefTable ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-slate-900 dark:text-white">Recognized</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-300">Broken Offsets</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Salvageable Pages</p>
                    <p className="text-xs font-bold mt-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-900 dark:text-white">~{diagnostics.pageCount} Pages</span>
                    </p>
                  </div>
                </div>

                {/* Detected Issues Details */}
                {diagnostics.issuesDetected.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-200/90 space-y-1">
                    <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Identified Anomalies:</p>
                    {diagnostics.issuesDetected.map((issue, idx) => (
                      <p key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{issue}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Repair Controls & Strategy Options */}
            {!repairedBlobUrl && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Recovery Mode</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => setRepairMode("smart")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      repairMode === "smart"
                        ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Smart Structural Rebuild
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Sanitizes headers, fixes trailers, and recalculates the entire cross-reference table. Retains full vector text, embedded fonts, and interactive form structures.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setRepairMode("deep")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      repairMode === "deep"
                        ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Deep Page Salvage &amp; Synthesis
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                          Resilient
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Uses fault-tolerant recovery parser to extract every readable page individually and compile them into a pristine new PDF. Best for heavily corrupted files. (Note: Deep mode rasterizes pages, flattening selectable text layers).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Repair Action Trigger */}
                <button
                  onClick={handleRepair}
                  disabled={isRepairing}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isRepairing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{repairStep || "Repairing document..."}</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" />
                      <span>Start PDF Repair &amp; Recovery</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Repaired Result View & Live Preview */}
            {repairedBlobUrl && (
              <div className="p-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        PDF Successfully Repaired!
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300/80">
                        Reconstructed {repairedPages} page{repairedPages > 1 ? "s" : ""} • Clean XRef table generated
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={repairedBlobUrl}
                      download={
                        file.name.replace(/\.pdf$/i, "") + "-repaired.pdf"
                      }
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Repaired PDF</span>
                    </a>
                  </div>
                </div>

                {/* File size comparison stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Original Size</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Repaired Size</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {repairedSize ? formatBytes(repairedSize) : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Pages Salvaged</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {repairedPages} of {diagnostics?.pageCount || repairedPages}
                    </p>
                  </div>
                </div>

                {/* Live Page Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Live Repaired Preview
                      </h4>
                    </div>

                    {previewTotalPages > 1 && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={handlePrevPage}
                          disabled={previewPage <= 1}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-white transition cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-slate-600 dark:text-slate-300">
                          Page {previewPage} of {previewTotalPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={previewPage >= previewTotalPages}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-white transition cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center min-h-[320px] overflow-auto">
                    {previewLoading && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                        <span>Rendering page preview...</span>
                      </div>
                    )}
                    <canvas
                      ref={previewCanvasRef}
                      className={`max-w-full max-h-[500px] rounded-lg shadow-2xl bg-white ${
                        previewLoading ? "hidden" : "block"
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={resetAll}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Repair another document</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
