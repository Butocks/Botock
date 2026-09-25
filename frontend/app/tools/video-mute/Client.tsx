"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes, formatTime } from "@/lib/utils/formatters";
import {
  Film,
  VolumeX,
  RotateCcw,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

type MuteMode = "mute" | "reverse";

export default function VideoMuteClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [mode, setMode] = useState<MuteMode>("mute");

  // Output
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { run, isProcessing, progress } = useFFmpeg();

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [videoUrl, resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setOriginalFile(file);
      setVideoUrl(url);
      setDuration(0);
      setResultUrl(null);
      setResultSize(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov", ".mkv"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const resetAll = () => {
    setOriginalFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setVideoUrl(null);
    setResultUrl(null);
    setResultSize(null);
    setErrorMsg(null);
  };

  const handleProcess = async () => {
    if (!originalFile) return;

    setErrorMsg(null);
    setResultUrl(null);

    let args: string[] = [];

    if (mode === "mute") {
      // Fast stream copy without audio track
      args = ["-i", "input.mp4", "-c:v", "copy", "-an", "output.mp4"];
    } else {
      // Reverse video and reverse audio track
      args = [
        "-i",
        "input.mp4",
        "-vf",
        "reverse",
        "-af",
        "areverse",
        "output.mp4",
      ];
    }

    if (!run) {
      setErrorMsg("FFmpeg engine is initializing. Please try again.");
      return;
    }

    try {
      const blob = await run({
        inputFile: originalFile,
        inputFileName: "input.mp4",
        outputFileName: "output.mp4",
        outputMimeType: "video/mp4",
        args,
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to process video.");
    }
  };

  const baseName = originalFile
    ? originalFile.name.replace(/\.[^/.]+$/, "")
    : "processed";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!originalFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-sky-500 bg-sky-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-sky-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <VolumeX className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop Video here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Mute audio track or reverse video footage completely in your browser.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-sky-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {originalFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(originalFile.size)} • Duration: {duration > 0 ? formatTime(duration) : "Loading..."}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  ref={videoRef}
                  src={resultUrl || videoUrl || undefined}
                  controls
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                />
              </div>

              {resultUrl && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Video Processed Successfully!</span>
                    </div>
                    {resultSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatBytes(resultSize)}
                      </span>
                    )}
                  </div>

                  <a
                    href={resultUrl}
                    download={`${baseName}-${mode}.mp4`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download {mode === "mute" ? "Muted Video" : "Reversed Video"}
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

            <div className="space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Action Mode
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMode("mute")}
                  className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    mode === "mute"
                      ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      : "border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <VolumeX className="w-4 h-4" />
                    <span>Mute Audio Track</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Lossless zero-reencode audio removal. Instant download with original video clarity.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("reverse")}
                  className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    mode === "reverse"
                      ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      : "border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <RotateCcw className="w-4 h-4" />
                    <span>Reverse Video & Audio</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Play frames backwards from end to start for rewind/boomerang effects.
                  </p>
                </button>
              </div>

              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing... {progress.percent ? `${Math.round(progress.percent)}%` : ""}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process Video</span>
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
