"use client";

import React, { useState, useRef } from "react";
import { Upload, Mic, Play, Download, Settings2, Sparkles, AlertCircle } from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";

const VOICE_MODES = [
  // Original
  { id: "kid", label: "👦 Kid" },
  { id: "little_girl", label: "👧 Little Girl" },
  { id: "women", label: "👩 Woman" },
  { id: "man_deep", label: "👨 Deep Voice Man" },
  { id: "deep_villain", label: "😈 Deep Villain" },
  { id: "man_old", label: "👴 Old Man" },
  { id: "old_women", label: "👵 Old Woman" },
  { id: "weak_man", label: "🤕 Weak Man" },
  { id: "strict", label: "👔 Strict/Bossy" },
  
  // AI Voice Filters (Requested)
  { id: "robot", label: "🤖 AI Robot" },
  { id: "chipmunk", label: "🐿️ Chipmunk" },
  { id: "echo_chamber", label: "⛰️ Echo Chamber" },
  { id: "telephone", label: "📞 Telephone" },
  
  // Privacy & Disguiser (Requested)
  { id: "privacy_disguiser", label: "🕵️ Privacy Disguiser" },
  
  // AI Voice Cloning Mock (Requested)
  { id: "clone_elon", label: "🚀 Elon (Clone)" },
  { id: "clone_morgan", label: "🎙️ Morgan (Clone)" },
  { id: "clone_anime_girl", label: "🌸 Anime Girl (Clone)" },
];

export default function VoiceChangerClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<string>("man_deep");
  const [status, setStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setErrorMessage("Audio file must be under 20MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setAudioUrl(null);
      setStatus("idle");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage("Audio file must be under 20MB.");
        return;
      }
      if (!file.name.toLowerCase().match(/\.(mp3|wav|m4a|ogg|aac)$/)) {
        setErrorMessage("Please upload a valid audio file (.mp3, .wav, .m4a)");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setAudioUrl(null);
      setStatus("idle");
    }
  };

  const startConversion = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    setErrorMessage("");
    setAudioUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", mode);

      const response = await fetch(`${backendUrl}/api/convert/voice-changer`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to convert audio.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStatus("completed");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during conversion.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-violet-500">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">AI Voice Changer</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Upload any audio file and apply high-quality, natural-sounding voice effects using Botock's advanced Pitch & Time engine.
          </p>
        </div>

        <div className="space-y-6">
          {/* Uploader */}
          {!selectedFile ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-muted/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">Upload Audio File</h3>
              <p className="text-xs text-muted-foreground">Supported formats: MP3, WAV, M4A, OGG (Max 20MB)</p>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5 text-violet-500" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setAudioUrl(null);
                  setStatus("idle");
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {/* Settings */}
          {selectedFile && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-violet-500" />
                Select Voice Effect
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VOICE_MODES.map((vm) => (
                  <button
                    key={vm.id}
                    onClick={() => setMode(vm.id)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      mode === vm.id 
                        ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400" 
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {vm.label}
                  </button>
                ))}
              </div>

              <button
                onClick={startConversion}
                disabled={status === "uploading"}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
              >
                {status === "uploading" ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing Audio...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Transform Voice
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Result */}
          {audioUrl && status === "completed" && (
            <div className="pt-6 border-t border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500" />
                Preview & Download
              </h3>
              
              <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center space-y-6">
                <audio controls src={audioUrl} className="w-full max-w-md mx-auto" />
                
                <a
                  href={audioUrl}
                  download={`botock_voice_${mode}.mp3`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download MP3
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
