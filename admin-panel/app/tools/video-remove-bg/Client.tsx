"use client";

import { useState, useRef } from "react";
import { Upload, Video, Sparkles, Download, AlertCircle, Settings2, Image as ImageIcon } from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";

const MODES = [
  { id: "smart_cutout", label: "✂️ Smart Cutout", desc: "Transparent BG" },
  { id: "green_screen", label: "🟩 AI Green Screen", desc: "Virtual BG" },
  { id: "matting", label: "💇 Background Matting", desc: "Pro Edge Cleanup" }
];

export default function VideoRemoveBgClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState("smart_cutout");
  const [status, setStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage("Video must be under 50MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setVideoUrl(null);
      setStatus("idle");
    }
  };

  const startProcessing = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMessage("");
    setVideoUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", mode);

      const response = await fetch(`${backendUrl}/api/video/remove-bg`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to process video.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus("completed");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during processing.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-violet-500">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">AI Background Remover</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Automatically detect subjects and remove backgrounds instantly.
          </p>
        </div>

        <div className="space-y-6">
          {!selectedFile ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    if (file.size > 50 * 1024 * 1024) {
                        setErrorMessage("File must be under 50MB.");
                        return;
                    }
                    if (!file.name.toLowerCase().match(/\.(mp4|mov|webm)$/)) {
                        setErrorMessage("Please upload a valid video file (.mp4, .mov, .webm)");
                        return;
                    }
                    setSelectedFile(file);
                }
              }}
              className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-muted/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">Upload Video</h3>
              <p className="text-xs text-muted-foreground">MP4, MOV, WEBM (Max 50MB)</p>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-violet-500" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedFile(null); setVideoUrl(null); setStatus("idle"); }}
                className="text-xs font-semibold text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {selectedFile && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-violet-500" /> AI Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      mode === m.id 
                        ? "border-violet-500 bg-violet-500/5" 
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className={`font-semibold text-sm ${mode === m.id ? 'text-violet-600 dark:text-violet-400' : 'text-foreground'}`}>{m.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={startProcessing}
                disabled={status === "uploading"}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
              >
                {status === "uploading" ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing AI...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Magic</>
                )}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {videoUrl && status === "completed" && (
            <div className="pt-6 border-t border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-black/90 rounded-2xl overflow-hidden border border-border mb-4">
                <video controls src={videoUrl} className="w-full max-h-[400px]" />
              </div>
              <div className="flex justify-center">
                <a
                  href={videoUrl}
                  download={`botock_ai_${mode}.mp4`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
