"use client";

import { useState, useRef } from "react";
import { Upload, Headphones, Sparkles, Download, AlertCircle } from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";

export default function AudioEnhanceClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startProcessing = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMessage("");
    setAudioUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${backendUrl}/api/convert/audio-enhance`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
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
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
            <Headphones className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">AI Audio Enhancer</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Upload your audio or video file to remove background noise and enhance speech.
          </p>
        </div>

        <div className="space-y-6">
          {!selectedFile ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-muted/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept="audio/*,video/*" className="hidden" />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">Upload Audio/Video</h3>
              <p className="text-xs text-muted-foreground">MP3, WAV, MP4, MOV (Max 50MB)</p>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-xs text-red-500">Remove</button>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={startProcessing}
              disabled={status === "uploading"}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all"
            >
              {status === "uploading" ? (
                <>Removing Noise...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Enhance Audio</>
              )}
            </button>
          )}

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {audioUrl && status === "completed" && (
            <div className="pt-6 text-center">
              <audio controls src={audioUrl} className="w-full mx-auto max-w-md mb-4" />
              <a href={audioUrl} download="botock_enhanced.wav" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">
                <Download className="w-4 h-4" /> Download Enhanced Audio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
