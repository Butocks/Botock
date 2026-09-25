"use client";

import { useState } from "react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes } from "@/lib/utils/formatters";
import {
  Scissors,
  Music,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
} from "lucide-react";

export default function AudioTrimClient() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Settings
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(30);

  // Output
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { run, cancel, isProcessing, progress, statusMessage, error } = useFFmpeg();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setResultUrl(null);
      setErrorMsg(null);
      const url = URL.createObjectURL(selected);
      setAudioUrl(url);

      const audio = new Audio();
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setStartTime(0);
        setEndTime(Math.min(audio.duration, 30));
      };
      audio.src = url;
    }
  };

  const handleTrim = async () => {
    if (!file) return;
    setErrorMsg(null);
    setResultUrl(null);

    try {
      const trimDuration = Math.max(0.1, endTime - startTime);
      const outputName = `trimmed_${file.name.replace(/\.[^/.]+$/, "")}.mp3`;

      const outputBlob = await run({
        inputFile: file,
        inputFileName: file.name,
        outputFileName: outputName,
        outputMimeType: "audio/mpeg",
        args: [
          "-ss", startTime.toFixed(2),
          "-i", file.name,
          "-t", trimDuration.toFixed(2),
          "-c", "copy", // Fast stream copy
          outputName,
        ],
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to trim audio file.");
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Scissors className="w-3.5 h-3.5" />
            Audio Cutter & Trimmer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trim Audio Online Free - Cut MP3, WAV, AAC
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Extract clips, make ringtones, and cut audio tracks with fast lossless stream copy directly in your browser.
          </p>
        </div>

        {(errorMsg || error) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg || error}</span>
          </div>
        )}

        {!audioUrl ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="audio-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-rose-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select audio file to trim or cut
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Fast lossless audio cutting without re-encoding quality loss.
              </p>
              <span className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-600/25 transition">
                Choose Audio File
              </span>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            {/* Audio Player */}
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col items-center">
              <audio src={resultUrl || audioUrl} controls className="w-full" />
              <div className="text-xs text-slate-400 mt-2">
                Track Length: {formatSeconds(duration)}
              </div>
            </div>

            {/* Trimming Controls */}
            <div className="w-full space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Start Time ({formatSeconds(startTime)})
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={startTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setStartTime(Math.min(val, endTime - 0.5));
                      setResultUrl(null);
                    }}
                    className="w-full accent-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    End Time ({formatSeconds(endTime)})
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={endTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEndTime(Math.max(val, startTime + 0.5));
                      setResultUrl(null);
                    }}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between text-xs text-slate-300">
                <span>Selected Clip Duration:</span>
                <span className="font-bold text-rose-400">{formatSeconds(endTime - startTime)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full">
              {!resultUrl ? (
                <button
                  onClick={handleTrim}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {statusMessage || `Cutting Audio (${Math.round(progress.percent)}%)...`}
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      Cut & Export Audio Clip
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Audio cut successfully! Lossless stream copy applied.</span>
                  </div>
                  <a
                    href={resultUrl}
                    download={`trimmed_${file?.name || "clip.mp3"}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Trimmed Audio ({resultSize ? formatBytes(resultSize) : ""})
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setFile(null);
                setAudioUrl(null);
                setResultUrl(null);
              }}
              className="mt-4 text-xs text-slate-400 hover:text-red-400 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Choose different audio file
            </button>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
              <Scissors className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Lossless Stream Copy</h4>
            <p className="text-xs text-slate-400">
              Audio samples are sliced at exact packet boundaries without re-compressing or degrading sound clarity.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              Personal voice memos, ringtones, and music remain in your device memory with zero server uploads.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Precision Ringtones</h4>
            <p className="text-xs text-slate-400">
              Extract exact hook segments, choruses, or ringtones from any audio file in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
