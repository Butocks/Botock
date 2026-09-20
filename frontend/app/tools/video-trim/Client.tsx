"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import {
  Film,
  Scissors,
  Download,
  Trash2,
  Play,
  RotateCcw,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
} from "lucide-react";

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00.000";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}

export default function VideoTrimClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Settings
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [mode, setMode] = useState<"fast" | "accurate">("fast");

  // Output
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resultVideoRef = useRef<HTMLVideoElement | null>(null);

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
      setStartTime(0);
      setEndTime(0);
      setDuration(0);
      setCurrentTime(0);
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
        setStartTime(0);
        setEndTime(vidDuration);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const setStartToCurrent = () => {
    if (videoRef.current) {
      const cur = Math.min(videoRef.current.currentTime, Math.max(0, endTime - 0.1));
      setStartTime(Number(cur.toFixed(2)));
    }
  };

  const setEndToCurrent = () => {
    if (videoRef.current) {
      const cur = Math.max(videoRef.current.currentTime, startTime + 0.1);
      setEndTime(Number(Math.min(duration, cur).toFixed(2)));
    }
  };

  const playSegment = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
      const checkEnd = () => {
        if (videoRef.current && videoRef.current.currentTime >= endTime) {
          videoRef.current.pause();
          videoRef.current.removeEventListener("timeupdate", checkEnd);
        }
      };
      videoRef.current.addEventListener("timeupdate", checkEnd);
    }
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setResultSize(null);
    setStartTime(0);
    setEndTime(0);
    setDuration(0);
    setErrorMsg(null);
  };

  const handleTrim = async () => {
    if (!originalFile || duration <= 0) return;

    const clampedStart = Math.max(0, Math.min(startTime, duration - 0.1));
    const clampedEnd = Math.min(duration, Math.max(endTime, clampedStart + 0.1));

    if (clampedStart >= clampedEnd) {
      setErrorMsg("Start time must be strictly less than end time.");
      return;
    }

    setErrorMsg(null);

    // Build FFmpeg command arguments
    let args: string[] = [];
    if (mode === "fast") {
      args = [
        "-ss",
        clampedStart.toFixed(3),
        "-to",
        clampedEnd.toFixed(3),
        "-i",
        "input.mp4",
        "-c",
        "copy",
        "-avoid_negative_ts",
        "make_zero",
        "output.mp4",
      ];
    } else {
      args = [
        "-ss",
        clampedStart.toFixed(3),
        "-to",
        clampedEnd.toFixed(3),
        "-i",
        "input.mp4",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "22",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "output.mp4",
      ];
    }

    const runFn = run;
    if (!runFn) {
      setErrorMsg("Video processing engine is currently unavailable.");
      return;
    }

    try {
      const outputBlob = await runFn({
        inputFile: originalFile,
        inputFileName: "input.mp4",
        outputFileName: "output.mp4",
        outputMimeType: "video/mp4",
        args,
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trim video.";
      setErrorMsg(msg);
    }
  };

  const trimDuration = Math.max(0, endTime - startTime);
  const isLargeFile = originalFile ? originalFile.size > 100 * 1024 * 1024 : false;

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
            <Film className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop a Video here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports MP4, WebM, MOV, MKV. Processed 100% locally in your browser.
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

          {/* Large File Advisory */}
          {isLargeFile && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Large Video Detected ({formatBytes(originalFile.size)}):</span>{" "}
                Browser WebAssembly operates within a 2GB linear memory limit. For large files, we recommend using{" "}
                <span className="font-semibold underline">Fast Lossless Cut</span> mode to minimize memory usage.
              </div>
            </div>
          )}

          {/* Main Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Video Player & Seek Timeline */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  ref={videoRef}
                  src={videoUrl || undefined}
                  controls
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>

              {/* Video Timeline & Helper Actions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Current: {formatTime(currentTime)}</span>
                  <span>Total: {formatTime(duration)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={setStartToCurrent}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Set Current as Start
                  </button>
                  <button
                    onClick={setEndToCurrent}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Set Current as End
                  </button>
                  <button
                    onClick={playSegment}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.15] text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Preview Selected Segment
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Controls & Execution */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Sliders className="w-4 h-4 text-emerald-500" /> Trim Settings
                </h3>

                {/* Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Trimming Engine Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode("fast")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        mode === "fast"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                        <Zap className="w-3.5 h-3.5" /> Fast Lossless
                      </div>
                      <p className="text-[10px] opacity-80 leading-tight">
                        Stream copy, near-instant cut.
                      </p>
                    </button>

                    <button
                      onClick={() => setMode("accurate")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        mode === "accurate"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                          : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                        <Sparkles className="w-3.5 h-3.5" /> Accurate Cut
                      </div>
                      <p className="text-[10px] opacity-80 leading-tight">
                        Frame-accurate re-encode.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Start Time Control */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Start Time
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatTime(startTime)} ({startTime.toFixed(2)}s)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, endTime - 0.1)}
                    step={0.1}
                    value={startTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStartTime(val);
                      seekTo(val);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={Math.max(0, endTime - 0.1)}
                      step={0.1}
                      value={startTime}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(Number(e.target.value), endTime - 0.1));
                        setStartTime(val);
                        seekTo(val);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121215] text-xs font-mono text-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-400">sec</span>
                  </div>
                </div>

                {/* End Time Control */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      End Time
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatTime(endTime)} ({endTime.toFixed(2)}s)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={Math.min(duration, startTime + 0.1)}
                    max={duration || 100}
                    step={0.1}
                    value={endTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEndTime(val);
                      seekTo(val);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={startTime + 0.1}
                      max={duration || 100}
                      step={0.1}
                      value={endTime}
                      onChange={(e) => {
                        const val = Math.min(duration, Math.max(Number(e.target.value), startTime + 0.1));
                        setEndTime(val);
                        seekTo(val);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121215] text-xs font-mono text-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-400">sec</span>
                  </div>
                </div>

                {/* Trimmed Duration Summary */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Selected Clip Duration:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {trimDuration.toFixed(2)}s ({formatTime(trimDuration)})
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleTrim}
                  disabled={isProcessing || trimDuration <= 0}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing Video...
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" /> Trim Video Clip
                    </>
                  )}
                </button>
              </div>

              {/* Progress & Status */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{statusMessage || "Processing video..."}</span>
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
                    <span className="font-bold">Error:</span> {errorMsg || error}
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
                  <CheckCircle2 className="w-5 h-5" /> Video Trimmed Successfully!
                </div>
                {resultSize && (
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
                    Output Size: {formatBytes(resultSize)}
                  </span>
                )}
              </div>

              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  ref={resultVideoRef}
                  src={resultUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={resultUrl}
                  download={`trimmed_${originalFile.name}`}
                  className="px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Trimmed Clip
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
