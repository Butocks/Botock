"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import { formatBytes } from "@/lib/utils/formatters";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";
import {
  FileArchive,
  Download,
  Trash2,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderArchive,
  Plus,
  X,
  Zap,
  Settings2
} from "lucide-react";

type CompressionLevel = "STORE" | "DEFLATE_FAST" | "DEFLATE_BEST";

export default function ZipCompressorClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("DEFLATE_FAST");
  const [zipFilename, setZipFilename] = useState<string>("Botock-Archive");
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentFileProcessing, setCurrentFileProcessing] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const { url: resultUrl, setBlob: setResultBlob, reset: resetDownload } = useObjectUrlDownload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFiles((prev) => [...prev, ...acceptedFiles]);
      resetDownload();
      setActionError(null);
    }
  }, [resetDownload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Accept all files
  });

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    resetDownload();
  };

  const handleCreateZip = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setActionError(null);
    setProgress(0);
    setResultSize(null);

    try {
      const zip = new JSZip();

      // Add all files to JSZip instance
      files.forEach((file) => {
        // file.webkitRelativePath gives folder structure if dropped a folder, else fallback to name
        const filePath = file.webkitRelativePath || file.name;
        zip.file(filePath, file);
      });

      // Set compression options based on user selection
      let compressionType: "STORE" | "DEFLATE" = "DEFLATE";
      let compressionOptions = { level: 6 }; // Default

      if (compressionLevel === "STORE") {
        compressionType = "STORE"; // No compression, just bundle
      } else if (compressionLevel === "DEFLATE_FAST") {
        compressionType = "DEFLATE";
        compressionOptions = { level: 1 }; // Fast
      } else if (compressionLevel === "DEFLATE_BEST") {
        compressionType = "DEFLATE";
        compressionOptions = { level: 9 }; // Maximum
      }

      const content = await zip.generateAsync(
        {
          type: "blob",
          compression: compressionType,
          compressionOptions: compressionType === "DEFLATE" ? compressionOptions : undefined,
        },
        (metadata) => {
          setProgress(Math.round(metadata.percent));
          setCurrentFileProcessing(metadata.currentFile || "Finalizing archive...");
        }
      );

      setResultBlob(content, "application/zip");
      setResultSize(content.size);
    } catch (err: unknown) {
      console.error("ZIP creation failed:", err);
      setActionError(err instanceof Error ? err.message : "Failed to create ZIP archive.");
    } finally {
      setIsProcessing(false);
      setCurrentFileProcessing("");
    }
  };

  const handleResetAll = () => {
    setFiles([]);
    setCompressionLevel("DEFLATE_FAST");
    setZipFilename("Botock-Archive");
    resetDownload();
    setIsProcessing(false);
    setProgress(0);
    setActionError(null);
    setResultSize(null);
  };

  const totalInputSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full bg-[#0a0a0b] text-slate-100 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl font-sans">
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-white/10 hover:border-emerald-500/50 hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FolderArchive className="w-10 h-10 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mb-3 tracking-tight">
            Drop Files & Folders Here
          </p>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            Create ZIP archives instantly in your browser. All files stay securely on your device.
          </p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-slate-300 border border-white/10">
            Supports All File Types
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileArchive className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white max-w-[200px] sm:max-w-md truncate">
                  Ready to Archive
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {files.length} file(s) • {formatBytes(totalInputSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" /> Add More
                </button>
              </div>
              <button
                onClick={handleResetAll}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: File List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-inner h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Selected Files</span>
                  <span className="text-emerald-400">{files.length} Items</span>
                </h3>
                
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                            {file.webkitRelativePath || file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        disabled={isProcessing}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Export Settings */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col h-full">
                <h3 className="font-bold text-white mb-5 text-sm border-b border-white/10 pb-4 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-emerald-400" /> Archive Settings
                </h3>

                <div className="space-y-5 flex-1">
                  {/* Filename Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Archive Name
                    </label>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                      <input
                        type="text"
                        value={zipFilename}
                        onChange={(e) => setZipFilename(e.target.value)}
                        disabled={isProcessing}
                        placeholder="My-Archive"
                        className="w-full bg-transparent border-none text-sm font-semibold text-white focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 font-mono">.zip</span>
                    </div>
                  </div>

                  {/* Compression Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Compression Level
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setCompressionLevel("STORE")}
                        disabled={isProcessing}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          compressionLevel === "STORE"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold"
                            : "border-white/10 text-slate-400 hover:border-white/20 bg-white/[0.01]"
                        }`}
                      >
                        <div className="text-xs">No Compression (Store)</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Fastest, best for videos/images.</div>
                      </button>

                      <button
                        onClick={() => setCompressionLevel("DEFLATE_FAST")}
                        disabled={isProcessing}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          compressionLevel === "DEFLATE_FAST"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold"
                            : "border-white/10 text-slate-400 hover:border-white/20 bg-white/[0.01]"
                        }`}
                      >
                        <div className="text-xs flex items-center gap-1.5"><Zap className="w-3 h-3"/> Fast Compression</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Balanced speed and size (Recommended).</div>
                      </button>

                      <button
                        onClick={() => setCompressionLevel("DEFLATE_BEST")}
                        disabled={isProcessing}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          compressionLevel === "DEFLATE_BEST"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold"
                            : "border-white/10 text-slate-400 hover:border-white/20 bg-white/[0.01]"
                        }`}
                      >
                        <div className="text-xs">Maximum Compression</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Slowest, best for text/documents.</div>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateZip}
                  disabled={isProcessing || files.length === 0}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Zipping...</>
                  ) : (
                    <><FileArchive className="w-5 h-5" /> Create ZIP File</>
                  )}
                </button>

                {isProcessing && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-xs font-bold text-emerald-400 mb-2">{progress}% Complete</div>
                    <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 truncate px-2">
                      {currentFileProcessing ? `Zipping: ${currentFileProcessing}` : "Building archive..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {actionError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" /> <span className="font-semibold">{actionError}</span>
            </div>
          )}

          {/* Export Success Result */}
          {resultUrl && (
            <div className="mt-8 p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-2xl animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Archive Ready!
                </h3>
                {resultSize && (
                  <span className="text-sm font-mono text-emerald-200 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    Output Size: {formatBytes(resultSize)}
                  </span>
                )}
              </div>
              
              <div className="flex justify-center mt-8">
                <a
                  href={resultUrl}
                  download={`${zipFilename || "Botock-Archive"}.zip`}
                  className="px-10 py-4 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-sm transition-all flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download {zipFilename || "Botock-Archive"}.zip
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}