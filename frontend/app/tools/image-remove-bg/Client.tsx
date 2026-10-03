"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import UploadDropzone from "../../components/tool-ui/UploadDropzone";
import { getBackendUrl } from "@/utils/runtime-urls";

interface BatchFile {
  id: string;
  file: File;
  status: "pending" | "processing" | "done" | "error";
  resultUrl?: string;
  error?: string;
}

export default function Client() {
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    
    const newFiles = acceptedFiles.map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      status: "pending" as const,
    }));
    
    setBatchFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setBatchFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const processSingleFile = async (bf: BatchFile) => {
    try {
      // Update status to processing
      setBatchFiles((prev) => 
        prev.map((f) => f.id === bf.id ? { ...f, status: "processing" } : f)
      );

      const formData = new FormData();
      formData.append("file", bf.file);

      const backendUrl = await getBackendUrl();
      const response = await fetch(`${backendUrl}/api/image/remove-bg`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to remove background");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setBatchFiles((prev) => 
        prev.map((f) => f.id === bf.id ? { ...f, status: "done", resultUrl: url } : f)
      );
    } catch (err: any) {
      setBatchFiles((prev) => 
        prev.map((f) => f.id === bf.id ? { ...f, status: "error", error: err.message } : f)
      );
    }
  };

  const processAll = async () => {
    setIsProcessingAll(true);
    const pending = batchFiles.filter((f) => f.status === "pending" || f.status === "error");
    
    // We process sequentially or with slight concurrency to not overload the browser/API
    for (const bf of pending) {
      await processSingleFile(bf);
    }
    
    setIsProcessingAll(false);
  };

  const downloadAll = () => {
    batchFiles.forEach((bf) => {
      if (bf.status === "done" && bf.resultUrl) {
        const a = document.createElement("a");
        a.href = bf.resultUrl;
        a.download = `nobg_${bf.file.name.replace(/\.[^/.]+$/, ".png")}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <UploadDropzone
        accept={{
          "image/jpeg": [".jpeg", ".jpg"],
          "image/png": [".png"],
          "image/webp": [".webp"],
        }}
        icon={<ImageIcon className="w-8 h-8 text-slate-400" />}
        title="Upload Images"
        subtitle="Drag & drop multiple images here to remove backgrounds in batch"
        onDrop={onDrop}
        multiple={true}
        accentClass="violet"
      />

      {/* Batch List */}
      {batchFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Batch Queue</p>
              <p className="text-xs text-slate-500">{batchFiles.length} files selected</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={processAll}
                disabled={isProcessingAll || batchFiles.every(f => f.status === "done")}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition"
              >
                {isProcessingAll ? "Processing..." : "Process All"}
              </button>
              {batchFiles.some(f => f.status === "done") && (
                <button
                  onClick={downloadAll}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition"
                >
                  Download All Done
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {batchFiles.map((bf) => (
              <div key={bf.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col gap-3 relative group">
                <button
                  onClick={() => removeFile(bf.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                  {bf.resultUrl ? (
                    <img src={bf.resultUrl} className="w-full h-full object-contain [background:url(/checkered.png)]" alt="Result" />
                  ) : (
                    <img src={URL.createObjectURL(bf.file)} className="w-full h-full object-cover opacity-50" alt="Original" />
                  )}
                  
                  {bf.status === "processing" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {bf.status === "error" && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm" title={bf.error}>
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold truncate flex-1" title={bf.file.name}>{bf.file.name}</p>
                  {bf.status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>
                
                {bf.status === "done" && bf.resultUrl && (
                  <a
                    href={bf.resultUrl}
                    download={`nobg_${bf.file.name.replace(/\.[^/.]+$/, ".png")}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
