"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileText,
  Unlock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  KeyRound,
} from "lucide-react";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export default function UnlockPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setPassword("");
      setResultUrl(null);
      setResultSize(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const resetAll = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPassword("");
    setResultUrl(null);
    setResultSize(null);
    setErrorMsg(null);
  };

  const handleUnlock = async () => {
    if (!file) return;

    setIsUnlocking(true);
    setErrorMsg(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Verify and decrypt using pdfjs-dist with user password
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        password,
        cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
        cMapPacked: true,
      });

      const doc = await loadingTask.promise;

      // Re-create a clean, unencrypted PDF with pdf-lib using rendered or extracted vector streams
      const newPdf = await PDFDocument.create();

      // Render each page into unencrypted visual pages to guarantee total restriction removal
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High fidelity 144 DPI
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;

          const imgBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
          });

          const imgBuffer = await imgBlob.arrayBuffer();
          const embeddedImage = await newPdf.embedJpg(imgBuffer);

          // Add page with original point dimensions
          const p = newPdf.addPage([viewport.width / 2.0, viewport.height / 2.0]);
          p.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: viewport.width / 2.0,
            height: viewport.height / 2.0,
          });
        }
      }

      const pdfBytes = await newPdf.save();
      const outputBlob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(outputBlob);

      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("password") || msg.includes("Password") || msg.includes("Incorrect")) {
        setErrorMsg("Incorrect password. Please verify your password and try again.");
      } else {
        setErrorMsg("Failed to unlock this PDF. Please verify the document is not corrupted.");
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const baseName = file ? file.name.replace(/\.[^/.]+$/, "") : "unlocked-doc";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <Unlock className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop Locked PDF here to Unlock
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Remove password security, editing locks, and printing restrictions permanently from your PDF.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              disabled={isUnlocking}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <span>Enter Document Password</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    PDF Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to unlock..."
                      className="w-full p-3 pr-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Once unlocked, all passwords and permissions will be permanently stripped so you can view, edit, and print freely.
                </p>

                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Decrypting & Removing Password...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Unlock PDF Document</span>
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-center">
              {resultUrl ? (
                <div className="space-y-4 w-full">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      PDF Decrypted Successfully!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {resultSize && formatBytes(resultSize)} • No more passwords required
                    </p>
                  </div>

                  <a
                    href={resultUrl}
                    download={`${baseName}-unlocked.pdf`}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Unlocked PDF
                  </a>
                </div>
              ) : (
                <div className="space-y-2 max-w-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <Unlock className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Permanent Password Removal
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Enter the known password once to produce a clean version that opens immediately on any device without prompts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
