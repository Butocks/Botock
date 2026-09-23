"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes, formatTime } from "@/lib/utils/formatters";
import {
  Film,
  Music,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
  Headphones,
} from "lucide-react";

type BitrateOption = "320k" | "192k" | "128k" | "vbr";

export default function VideoToMp3Client() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Settings
  const [bitrate, setBitrate] = useState<BitrateOption>("192k");
  const [channels, setChannels] = useState<2 | 1>(2);

  // Output
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { run, cancel, isProcessing, progress, statusMessage, error } = useFFmpeg();

  // Cleanup object URLs on unmount or file reset
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
      "video/*": [".mp4", ".webm", ".mov", ".mkv", ".m4v"],
    },
    maxFiles: 1,
  });

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (vidDuration && !isNaN(vidDuration) && vidDuration > 0) {
        setDuration(vidDuration);
      }
    }
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setResultSize(null);
    setDuration(0);
    setErrorMsg(null);
  };

  const handleExtractAudio = async () => {
    if (!originalFile) return;
    setErrorMsg(null);

    const qualityArgs =
      bitrate === "vbr" ? ["-q:a", "2"] : ["-b:a", bitrate];

    const args = [
      "-i",
      "input.mp4",
      "-vn",
      "-c:a",
      "libmp3lame",
      ...qualityArgs,
      "-ar",
      "44100",
      "-ac",
      String(channels),
      "output.mp3",
    ];

    const runFn = run;
    if (!runFn) {
      setErrorMsg("Audio extraction engine is currently unavailable.");
      return;
    }

    try {
      const outputBlob = await runFn({
        inputFile: originalFile,
        inputFileName: "input.mp4",
        outputFileName: "output.mp3",
        outputMimeType: "audio/mpeg",
        args,
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: unknown) {
      const rawError = err instanceof Error ? err.message : String(err);
      if (
        rawError.includes("does not contain any stream") ||
        rawError.includes("matches no streams") ||
        rawError.includes("no audio")
      ) {
        setErrorMsg(
          "This video does not contain an audio track to extract. Please upload a video with an audio track."
        );
      } else {
        setErrorMsg(rawError || "Failed to extract MP3 audio.");
      }
    }
  };

  const baseName = originalFile
    ? originalFile.name.replace(/\.[^/.]+$/, "")
    : "audio";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!originalFile ? (
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
            <Music className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop a Video here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports MP4, WebM, MOV, MKV. Extract MP3 audio 100% locally.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info Bar & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-emerald-500" />
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

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Video Player Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  ref={videoRef}
                  src={videoUrl || undefined}
                  controls
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Headphones className="w-4 h-4 text-emerald-500" /> High-fidelity MP3 encoding with libmp3lame
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Fast -vn Video Stripping
                </span>
              </div>
            </div>

            {/* Right Col: Controls & Action */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Sliders className="w-4 h-4 text-emerald-500" /> Audio Bitrate Quality
                </h3>

                {/* Bitrate Options */}
                <div className="space-y-2">
                  {[
                    {
                      id: "320k" as BitrateOption,
                      label: "High Quality (320 kbps)",
                      desc: "Studio audio fidelity, larger file",
                    },
                    {
                      id: "192k" as BitrateOption,
                      label: "Standard Quality (192 kbps)",
                      desc: "Optimal balance of quality & size (Default)",
                    },
                    {
                      id: "128k" as BitrateOption,
                      label: "Medium Quality (128 kbps)",
                      desc: "Compact file size, good for voice/podcasts",
                    },
                    {
                      id: "vbr" as BitrateOption,
                      label: "Variable Bitrate (VBR ~190 kbps)",
                      desc: "Dynamic bitrate allocation (-q:a 2)",
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setBitrate(option.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        bitrate === option.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                        <span>{option.label}</span>
                        {bitrate === option.id && <Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{option.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Channel Selector */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Audio Channels
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setChannels(2)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        channels === 2
                          ? "bg-emerald-600 text-white"
                          : "bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                      }`}
                    >
                      Stereo (2 Channels)
                    </button>
                    <button
                      onClick={() => setChannels(1)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        channels === 1
                          ? "bg-emerald-600 text-white"
                          : "bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                      }`}
                    >
                      Mono (1 Channel)
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleExtractAudio}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Extracting MP3 Audio...
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" /> Extract MP3 Audio
                    </>
                  )}
                </button>
              </div>

              {/* Progress & Status */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{statusMessage || "Extracting audio track..."}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {progress.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.1] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <button
                    onClick={() => cancel?.()}
                    className="w-full py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel Operation
                  </button>
                </div>
              )}

              {/* Error Message */}
              {(errorMsg || error) && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Notice:</span> {errorMsg || error}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Card */}
          {resultUrl && (
            <div className="mt-8 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Audio Extracted Successfully!
                </div>
                {resultSize && (
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
                    MP3 File Size: {formatBytes(resultSize)}
                  </span>
                )}
              </div>

              {/* HTML5 Audio Player */}
              <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08] shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {baseName}.mp3
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      MP3 • {bitrate === "vbr" ? "VBR ~190 kbps" : bitrate} • 44.1 kHz • {channels === 2 ? "Stereo" : "Mono"}
                    </p>
                  </div>
                </div>
                <audio src={resultUrl} controls className="w-full" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={resultUrl}
                  download={`${baseName}.mp3`}
                  className="px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download MP3 Audio
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
