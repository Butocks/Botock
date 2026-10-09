"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Subtitles,
  Download,
  Copy,
  Check,
  Sliders,
  FileAudio,
  Loader2,
} from "lucide-react";

// Formats ms to timestamp
const formatMsToTimestamp = (ms: number, format: "srt" | "vtt"): string => {
  const validMs = Math.max(0, ms);
  const h = Math.floor(validMs / 3600000);
  const m = Math.floor((validMs % 3600000) / 60000);
  const s = Math.floor((validMs % 60000) / 1000);
  const millis = Math.floor(validMs % 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  const sep = format === "srt" ? "," : ".";

  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(millis, 3)}`;
};

export default function SubtitlesClient() {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("subtitles");
  const [targetFormat, setTargetFormat] = useState<"srt" | "vtt">("srt");
  const [copied, setCopied] = useState(false);
  
  // AI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progress, setProgress] = useState<any>(null);
  
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module'
      });
      
      worker.current.addEventListener('message', (e) => {
        const { status, message, output, progress, error } = e.data;
        
        if (status === 'loading' || status === 'processing') {
          setLoadingMessage(message);
        } else if (status === 'progress') {
          setProgress(progress);
        } else if (status === 'done') {
          setIsProcessing(false);
          setLoadingMessage("");
          if (output && output.chunks) {
             generateSubtitlesFromChunks(output.chunks);
          }
        } else if (status === 'error') {
          setIsProcessing(false);
          setLoadingMessage("");
          alert('Error: ' + error);
        }
      });
    }
    return () => {
      worker.current?.terminate();
    };
  }, []);

  const generateSubtitlesFromChunks = (chunks: any[]) => {
    let srt = "";
    chunks.forEach((chunk, index) => {
      // whisper timestamps are in seconds
      const startTimeMs = chunk.timestamp[0] * 1000;
      const endTimeMs = chunk.timestamp[1] * 1000 || (chunk.timestamp[0] * 1000 + 2000);
      
      const startFmt = formatMsToTimestamp(startTimeMs, targetFormat);
      const endFmt = formatMsToTimestamp(endTimeMs, targetFormat);
      
      srt += `${index + 1}\n`;
      srt += `${startFmt} --> ${endFmt}\n`;
      srt += `${chunk.text.trim()}\n\n`;
    });
    
    if (targetFormat === 'vtt') {
        srt = "WEBVTT\n\n" + srt;
    }
    
    setContent(srt.trim());
  };

  const decodeAudio = async (file: File) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000
    });
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer.getChannelData(0);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFileName(f.name.replace(/\.[^/.]+$/, ""));
      
      if (f.type.startsWith('audio/') || f.type.startsWith('video/') || f.name.match(/\.(mp3|wav|ogg|mp4|webm|m4a)$/i)) {
          // AI Transcription
          try {
              setIsProcessing(true);
              setLoadingMessage("Decoding audio...");
              const audioData = await decodeAudio(f);
              setLoadingMessage("Sending to AI Model...");
              worker.current?.postMessage({
                  type: 'generate',
                  audioData
              });
          } catch (e: any) {
              alert("Could not read audio file: " + e.message);
              setIsProcessing(false);
          }
      } else {
          // Text format
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            setContent(text || "");
          };
          reader.readAsText(f);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [".srt", ".vtt", ".txt", ".sub", ".ass"],
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
      "video/*": [".mp4", ".webm"]
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}-converted.${targetFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor & Input */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              AI Auto-Generate or Upload File
            </label>
            {content && (
              <button
                type="button"
                onClick={() => setContent("")}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
              >
                Clear Text
              </button>
            )}
          </div>

          <div
            {...getRootProps()}
            className={`border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-sky-500 bg-sky-500/5"
                : "border-slate-200 dark:border-white/[0.08] hover:border-sky-500/50 bg-slate-50 dark:bg-white/[0.01]"
            }`}
          >
            <input {...getInputProps()} />
            <FileAudio className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
               Drop Audio/Video to Auto-Generate AI Subtitles
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Supports MP3, WAV, MP4. Perfect line sync across common languages. Or upload existing SRT/VTT.
            </p>
          </div>

          {isProcessing && (
              <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500 mx-auto" />
                  <p className="text-sm font-bold text-sky-700 dark:text-sky-300">{loadingMessage}</p>
                  {progress && progress.status === 'downloading' && (
                      <div className="text-xs text-sky-600 dark:text-sky-400">
                          Downloading Model: {progress.file} ({Math.round(progress.progress)}%)
                      </div>
                  )}
              </div>
          )}

          <textarea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Your generated subtitles will appear here...`}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {content && (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download as {targetFormat.toUpperCase()}
              </button>
              <button
                onClick={handleCopy}
                className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Result"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Tools Panel */}
        <div className="lg:col-span-4 space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Sliders className="w-4 h-4 text-sky-500" />
            <span>Format Settings</span>
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetFormat("vtt")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  targetFormat === "vtt"
                    ? "border-sky-500 bg-sky-600/10 text-sky-600 dark:text-sky-400"
                    : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                }`}
              >
                VTT (WebVTT)
              </button>
              <button
                type="button"
                onClick={() => setTargetFormat("srt")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  targetFormat === "srt"
                    ? "border-sky-500 bg-sky-600/10 text-sky-600 dark:text-sky-400"
                    : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                }`}
              >
                SRT (SubRip)
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
                Format applies to newly generated subtitles or downloaded file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
