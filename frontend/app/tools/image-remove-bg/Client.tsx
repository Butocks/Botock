"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, Edit2, Palette } from "lucide-react";
import UploadDropzone from "../../components/tool-ui/UploadDropzone";
import { getBackendUrl } from "@/utils/runtime-urls";
import ManualEditor from "./ManualEditor";

interface BatchFile {
  id: string;
  file: File;
  status: "pending" | "processing" | "done" | "error";
  resultUrl?: string;
  error?: string;
}

const BG_COLORS = [
  { label: "Transparent", value: "transparent" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Red", value: "#ef4444" },
  { label: "Green", value: "#22c55e" },
  { label: "Yellow", value: "#eab308" },
  { label: "Purple", value: "#a855f7" }
];

export default function Client() {
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

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
    
    for (const bf of pending) {
      await processSingleFile(bf);
    }
    
    setIsProcessingAll(false);
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadImageWithBg = (bf: BatchFile) => {
    if (!bf.resultUrl) return;
    const filename = `nobg_${bf.file.name.replace(/\.[^/.]+$/, ".png")}`;
    
    if (bgColor === "transparent") {
      triggerDownload(bf.resultUrl, filename);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const newUrl = URL.createObjectURL(blob);
        triggerDownload(newUrl, filename);
        setTimeout(() => URL.revokeObjectURL(newUrl), 1000);
      }, "image/png");
    };
    img.src = bf.resultUrl;
  };

  const downloadAll = () => {
    batchFiles.forEach((bf) => {
      if (bf.status === "done" && bf.resultUrl) {
        downloadImageWithBg(bf);
      }
    });
  };

  const saveEditedImage = (newUrl: string) => {
    if (!editingFileId) return;
    setBatchFiles((prev) => 
      prev.map((f) => f.id === editingFileId ? { ...f, resultUrl: newUrl } : f)
    );
    setEditingFileId(null);
  };

  const editingFile = batchFiles.find(f => f.id === editingFileId);

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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">Your Images</p>
              <p className="text-xs text-slate-500">{batchFiles.length} files selected</p>
            </div>
            
            {/* Background Color Picker */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 px-2 shrink-0">
                <Palette className="w-4 h-4" />
                Background Theme:
              </div>
              <div className="flex items-center gap-2">
                {BG_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setBgColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 shrink-0 ${bgColor === color.value ? 'border-violet-500 scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                    style={color.value === 'transparent' ? { backgroundImage: 'url(/checkered.png)', backgroundSize: 'cover' } : { backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
                {/* Custom Color Input */}
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={bgColor !== 'transparent' && !BG_COLORS.some(c => c.value === bgColor) ? bgColor : '#ffffff'}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-all cursor-pointer p-0 opacity-0 absolute inset-0 z-10"
                    title="Custom Color"
                  />
                  <div className={`w-8 h-8 rounded-full border-2 ${!BG_COLORS.some(c => c.value === bgColor) && bgColor !== 'transparent' ? 'border-violet-500 scale-110' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center text-xs font-bold overflow-hidden bg-gradient-to-tr from-red-500 via-green-500 to-blue-500`}>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={processAll}
                disabled={isProcessingAll || batchFiles.every(f => f.status === "done")}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition"
              >
                {isProcessingAll ? "Processing..." : "Process"}
              </button>
              {batchFiles.some(f => f.status === "done") && (
                <button
                  onClick={downloadAll}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition"
                >
                  Download All Done
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {batchFiles.map((bf) => (
              <div key={bf.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col gap-3 relative group bg-white dark:bg-slate-900 shadow-sm">
                <button
                  onClick={() => removeFile(bf.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {bf.status === "done" && (
                  <button
                    onClick={() => setEditingFileId(bf.id)}
                    className="absolute top-2 left-2 p-1.5 bg-violet-100 text-violet-600 rounded-lg opacity-0 group-hover:opacity-100 transition z-10 flex items-center gap-1 text-xs font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}

                <div 
                  className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative transition-colors"
                  style={bgColor !== 'transparent' ? { backgroundColor: bgColor } : { backgroundImage: 'url(/checkered.png)' }}
                >
                  {bf.resultUrl ? (
                    <img src={bf.resultUrl} className="w-full h-full object-contain" alt="Result" />
                  ) : (
                    <img src={URL.createObjectURL(bf.file)} className="w-full h-full object-cover opacity-50" alt="Original" />
                  )}
                  
                  {bf.status === "processing" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-20">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {bf.status === "error" && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm z-20" title={bf.error}>
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold truncate flex-1" title={bf.file.name}>{bf.file.name}</p>
                  {bf.status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>
                
                {bf.status === "done" && bf.resultUrl && (
                  <button
                    onClick={() => downloadImageWithBg(bf)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Editor Modal */}
      {editingFileId && editingFile && editingFile.resultUrl && (
        <ManualEditor
          originalFile={editingFile.file}
          processedUrl={editingFile.resultUrl}
          onSave={saveEditedImage}
          onCancel={() => setEditingFileId(null)}
        />
      )}
    </div>
  );
}
