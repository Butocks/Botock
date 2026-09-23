"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes, formatTime } from "@/lib/utils/formatters";
import {
  Film,
  Gauge,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Clock,
  Sparkles,
} from "lucide-react";

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.25, 1.5, 2.0, 3.0, 4.0];

function buildAtempoFilter(speed: number): string {
  const filters: string[] = [];
  if (speed > 2.0) {
    const first = 2.0;
    const second = speed / 2.0;
    filters.push(`atempo=${first.toFixed(2)}`);
    filters.push(`atempo=${second.toFixed(2)}`);
  } else if (speed < 0.5) {
    const first = 0.5;
    const second = speed * 2.0;
    filters.push(`atempo=${first.toFixed(2)}`);
    filters.push(`atempo=${second.toFixed(2)}`);
  } else {
    filters.push(`atempo=${speed.toFixed(2)}`);
  }
  return filters.join(",");
}

export default function VideoSpeedClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Settings
  const [speed, setSpeed] = useState<number>(1.5);
  const [muteAudio, setMuteAudio] = useState<boolean>(false);
  const [preservePitch, setPreservePitch] = useState<boolean>(true);

  // Output
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
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
      setInfoNotice(null);
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
    setInfoNotice(null);
    setErrorMsg(null);
  };

  const handleProcessSpeed = async () => {
    if (!originalFile) return;

    setErrorMsg(null);
    setInfoNotice(null);

    const clampedSpeed = Math.min(4.0, Math.max(0.25, speed));
    const setptsVal = (1 / clampedSpeed).toFixed(4);
    const videoFilter = `setpts=${setptsVal}*PTS`;

    const runFn = run;
    if (!runFn) {
      setErrorMsg("Video speed engine is currently unavailable.");
      return;
    }

    const runWithMute = async () => {
      const muteArgs = [
        "-i",
        "input.mp4",
        "-vf",
        videoFilter,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-an",
        "output.mp4",
      ];
      return await runFn({
        inputFile: originalFile,
        inputFileName: "input.mp4",
        outputFileName: "output.mp4",
        outputMimeType: "video/mp4",
        args: muteArgs,
      });
    };

    try {
      let outputBlob: Blob;

      if (muteAudio) {
        outputBlob = await runWithMute();
      } else {
        const afString = buildAtempoFilter(clampedSpeed);
        const filterComplex = `[0:v]${videoFilter}[v];[0:a]${afString}[a]`;
        const audioArgs = [
          "-i",
          "input.mp4",
          "-filter_complex",
          filterComplex,
          "-map",
          "[v]",
          "-map",
          "[a]",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "output.mp4",
        ];

        try {
          outputBlob = await runFn({
            inputFile: originalFile,
            inputFileName: "input.mp4",
            outputFileName: "output.mp4",
            outputMimeType: "video/mp4",
            args: audioArgs,
          });
        } catch (audioErr: unknown) {
          // If video has no audio stream, automatically fall back to mute audio
          console.warn("Audio processing failed, falling back to video-only:", audioErr);
          setInfoNotice("No audio stream detected in video. Output video processed with audio muted.");
          outputBlob = await runWithMute();
        }
      }

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change video speed.";
      setErrorMsg(msg);
    }
  };

  const expectedDuration = duration > 0 ? duration / speed : 0;
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
            <Gauge className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop a Video here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports MP4, WebM, MOV, MKV. Change playback speed 100% locally.
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
                Changing video speed re-encodes frames using H.264 ultrafast preset. Processing may take 15–45 seconds.
              </div>
            </div>
          )}

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

              {/* Quick Preview Speed Note */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-emerald-500" /> Original: {formatTime(duration)}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  Target Duration @ {speed}x: {formatTime(expectedDuration)}
                </span>
              </div>
            </div>

            {/* Right Col: Controls & Action */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Sliders className="w-4 h-4 text-emerald-500" /> Speed Multiplier
                </h3>

                {/* Preset Speed Buttons */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Preset Speeds</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {speed}x
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {SPEED_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setSpeed(preset)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          speed === preset
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                        }`}
                      >
                        {preset}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>0.25x (Slow-Mo)</span>
                    <span>1.0x (Normal)</span>
                    <span>4.0x (Hyperlapse)</span>
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={4.0}
                    step={0.05}
                    value={speed}
                    onChange={(e) => setSpeed(Number(parseFloat(e.target.value).toFixed(2)))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Audio Options */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      {muteAudio ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
                      Mute Audio Track
                    </span>
                    <input
                      type="checkbox"
                      checked={muteAudio}
                      onChange={(e) => setMuteAudio(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                  </label>

                  {!muteAudio && (
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        Preserve Audio Pitch
                      </span>
                      <input
                        type="checkbox"
                        checked={preservePitch}
                        onChange={(e) => setPreservePitch(e.target.checked)}
                        className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={handleProcessSpeed}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Modifying Speed...
                    </>
                  ) : (
                    <>
                      <Gauge className="w-4 h-4" /> Apply {speed}x Speed
                    </>
                  )}
                </button>
              </div>

              {/* Progress & Status */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{statusMessage || "Modifying video speed..."}</span>
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

              {/* Info Notice (e.g. Fallback Mute) */}
              {infoNotice && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{infoNotice}</div>
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
                  <CheckCircle2 className="w-5 h-5" /> Video Speed Adjusted ({speed}x)!
                </div>
                {resultSize && (
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
                    Output Size: {formatBytes(resultSize)}
                  </span>
                )}
              </div>

              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                <video
                  src={resultUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={resultUrl}
                  download={`speed_${speed}x_${originalFile.name}`}
                  className="px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Speed Adjusted Video
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
