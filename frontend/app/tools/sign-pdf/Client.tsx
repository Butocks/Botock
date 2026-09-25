"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileText,
  PenTool,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Type,
  Upload,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Move,
} from "lucide-react";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

type SigMode = "draw" | "type" | "upload";

export default function SignPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Signature creation state
  const [sigMode, setSigMode] = useState<SigMode>("draw");
  const [penColor, setPenColor] = useState<string>("#000000");
  const [typedName, setTypedName] = useState<string>("");
  const [activeSignatureUrl, setActiveSignatureUrl] = useState<string | null>(null);

  // Position & Placement state
  const [placedX, setPlacedX] = useState<number>(50); // percentage 0-100
  const [placedY, setPlacedY] = useState<number>(80); // percentage 0-100
  const [sigScale, setSigScale] = useState<number>(1);
  const [targetPageNumber, setTargetPageNumber] = useState<number>(1);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Canvas refs
  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    return () => {
      if (activeSignatureUrl) URL.revokeObjectURL(activeSignatureUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [activeSignatureUrl, resultUrl]);

  // Load and render page preview
  const renderCurrentPage = useCallback(
    async (doc: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
      const canvas = pageCanvasRef.current;
      if (!canvas) return;

      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    },
    []
  );

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderCurrentPage(pdfDoc, currentPage);
    }
  }, [pdfDoc, currentPage, renderCurrentPage]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const f = acceptedFiles[0];
        setFile(f);
        setIsLoading(true);
        setErrorMsg(null);
        setResultUrl(null);

        try {
          const arrayBuffer = await f.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
            cMapPacked: true,
          });

          const doc = await loadingTask.promise;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setTargetPageNumber(doc.numPages); // Typically people sign the last page
        } catch {
          setErrorMsg("Could not read PDF. Make sure it is not corrupted or password-locked.");
        } finally {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  // Freehand drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setActiveSignatureUrl(url);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setActiveSignatureUrl(null);
  };

  // Type signature handler
  const generateTypedSignature = (text: string) => {
    setTypedName(text);
    if (!text.trim()) {
      setActiveSignatureUrl(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = penColor;
    ctx.font = "italic 44px 'Brush Script MT', 'Dancing Script', cursive, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 200, 70);

    const url = canvas.toDataURL("image/png");
    setActiveSignatureUrl(url);
  };

  const handleUploadSig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setActiveSignatureUrl(url);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfDoc(null);
    setResultUrl(null);
    setActiveSignatureUrl(null);
    setErrorMsg(null);
  };

  const handleSignPdf = async () => {
    if (!file || !activeSignatureUrl) {
      setErrorMsg("Please create or draw your signature first.");
      return;
    }

    setIsSigning(true);
    setErrorMsg(null);

    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDocLoaded = await PDFDocument.load(pdfBytes);

      // Fetch signature PNG bytes
      const sigResponse = await fetch(activeSignatureUrl);
      const sigArrayBuffer = await sigResponse.arrayBuffer();
      const signatureImage = await pdfDocLoaded.embedPng(sigArrayBuffer);

      const targetPage = pdfDocLoaded.getPage(targetPageNumber - 1);
      const { width: pWidth, height: pHeight } = targetPage.getSize();

      const sigWidth = 160 * sigScale;
      const sigHeight = 65 * sigScale;

      // Convert percentage coordinates to PDF page coordinates (PDF origin is bottom-left)
      const xPos = (placedX / 100) * (pWidth - sigWidth);
      const yPos = (1 - placedY / 100) * (pHeight - sigHeight);

      targetPage.drawImage(signatureImage, {
        x: Math.max(0, xPos),
        y: Math.max(0, yPos),
        width: sigWidth,
        height: sigHeight,
      });

      const outputBytes = await pdfDocLoaded.save();
      const blob = new Blob([outputBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to embed signature into PDF.");
    } finally {
      setIsSigning(false);
    }
  };

  const baseName = file ? file.name.replace(/\.[^/.]+$/, "") : "signed-doc";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8 text-violet-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop PDF here to Sign Online
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Draw, type, or upload your signature and embed it into contracts and forms. 100% private in-browser signing.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)} • {numPages} Total Pages
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              disabled={isSigning}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Page View & Live Stamp Placement (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    disabled={currentPage === numPages}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Stamp Target:</span>
                  <select
                    value={targetPageNumber}
                    onChange={(e) => {
                      setTargetPageNumber(Number(e.target.value));
                      setCurrentPage(Number(e.target.value));
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-bold"
                  >
                    {Array.from({ length: numPages }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Page {i + 1} {i + 1 === numPages ? "(Last Page)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PDF Preview Canvas with Interactive Stamp Overlay */}
              <div className="relative border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/30 flex justify-center p-2">
                <canvas ref={pageCanvasRef} className="max-w-full shadow-lg rounded" />

                {/* Live Signature Stamp Overlay when viewing the target page */}
                {currentPage === targetPageNumber && activeSignatureUrl && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${placedX}%`,
                      top: `${placedY}%`,
                      transform: `translate(-50%, -50%) scale(${sigScale})`,
                    }}
                    className="border-2 border-dashed border-violet-500 rounded p-1 bg-violet-500/10 cursor-move shadow-md"
                  >
                    <img
                      src={activeSignatureUrl}
                      alt="Signature Stamp"
                      className="h-12 w-32 object-contain"
                    />
                    <div className="absolute -top-3 -right-3 w-5 h-5 bg-violet-600 rounded-full text-white flex items-center justify-center text-[10px]">
                      <Move className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              {resultUrl && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Signature Successfully Burned into PDF!</span>
                    </div>
                    {resultSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatBytes(resultSize)}
                      </span>
                    )}
                  </div>

                  <a
                    href={resultUrl}
                    download={`${baseName}-signed.pdf`}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Legally Signed PDF
                  </a>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right Signature Studio (5 cols) */}
            <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <PenTool className="w-4 h-4 text-violet-500" />
                <span>Create Your Signature</span>
              </div>

              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/[0.06]">
                {[
                  { id: "draw", label: "Draw", icon: PenTool },
                  { id: "type", label: "Type", icon: Type },
                  { id: "upload", label: "Upload", icon: Upload },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSigMode(m.id as SigMode)}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        sigMode === m.id
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Draw Signature Pad */}
              {sigMode === "draw" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Sign with mouse or stylus:</span>
                    <button
                      type="button"
                      onClick={clearDrawing}
                      className="text-rose-500 hover:text-rose-600 font-bold"
                    >
                      Clear Pad
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-white/[0.1] rounded-2xl overflow-hidden bg-white shadow-inner">
                    <canvas
                      ref={drawCanvasRef}
                      width={380}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-36 cursor-crosshair"
                    />
                  </div>
                </div>
              )}

              {/* Type Signature */}
              {sigMode === "type" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => generateTypedSignature(e.target.value)}
                    placeholder="E.g. John Doe"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
                  />
                  {activeSignatureUrl && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-center">
                      <img src={activeSignatureUrl} alt="Signature" className="h-14 object-contain" />
                    </div>
                  )}
                </div>
              )}

              {/* Upload Signature Image */}
              {sigMode === "upload" && (
                <div className="space-y-2">
                  <label className="block border border-dashed border-slate-300 dark:border-white/[0.1] rounded-xl p-5 text-center cursor-pointer hover:border-violet-500 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Choose Signature Image
                    </span>
                    <span className="text-[10px] text-slate-400">PNG or JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadSig}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Pen Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ink Color
                </label>
                <div className="flex gap-2">
                  {[
                    { color: "#000000", label: "Black" },
                    { color: "#1e3a8a", label: "Blue" },
                    { color: "#991b1b", label: "Red" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        setPenColor(c.color);
                        if (sigMode === "type") generateTypedSignature(typedName);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        penColor === c.color
                          ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Stamp Coordinates on Page
                </span>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Horizontal Position (X)</span>
                    <span>{placedX}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={placedX}
                    onChange={(e) => setPlacedX(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Vertical Position (Y)</span>
                    <span>{placedY}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    value={placedY}
                    onChange={(e) => setPlacedY(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Burn & Sign Button */}
              <button
                type="button"
                onClick={handleSignPdf}
                disabled={isSigning || !activeSignatureUrl}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Apply Signature to Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
