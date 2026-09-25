"use client";

import { useState } from "react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes } from "@/lib/utils/formatters";
import {
  VolumeX,
  Volume2,
  Music,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
} from "lucide-react";

export default function AudioVolumeClient() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Settings
  const [volumePercent, setVolumePercent] = useState<number>(150); // 0 to 500%

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
      setAudioUrl(URL.createObjectURL(selected));
    }
  };

  const handleAdjustVolume = async () => {
    if (!file) return;
    setErrorMsg(null);
    setResultUrl(null);

    try {
      const volumeFactor = (volumePercent / 100).toFixed(2);
      const outputName = `adjusted_${file.name.replace(/\.[^/.]+$/, "")}.mp3`;

      const outputBlob = await run({
        inputFile: file,
        inputFileName: file.name,
        outputFileName: outputName,
        outputMimeType: "audio/mpeg",
        args: [
          "-i", file.name,
          "-filter:a", `volume=${volumeFactor}`,
          outputName,
        ],
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to adjust audio volume.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Volume2 className="w-3.5 h-3.5" />
            Audio Gain & Normalization
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Adjust Audio Volume Online Free (Boost up to 500%)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Increase low MP3 or WAV audio levels or reduce overpowering tracks directly in your browser with zero server uploads.
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
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-emerald-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Music className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select audio file (MP3, WAV, AAC, FLAC)
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Fast client-side audio volume boost with zero quality loss.
              </p>
              <span className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 transition">
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
            </div>

            {/* Volume Control */}
            <div className="w-full space-y-4 mb-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  Target Audio Level
                </span>
                <span className="text-emerald-400 font-bold text-sm">{volumePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={volumePercent}
                onChange={(e) => {
                  setVolumePercent(parseInt(e.target.value));
                  setResultUrl(null);
                }}
                className="w-full accent-emerald-500"
              />

              <div className="flex justify-between gap-2">
                {[
                  { label: "50%", val: 50 },
                  { label: "100%", val: 100 },
                  { label: "150%", val: 150 },
                  { label: "250%", val: 250 },
                  { label: "400%", val: 400 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setVolumePercent(item.val);
                      setResultUrl(null);
                    }}
                    className={`py-1.5 px-3 text-xs rounded-lg border transition ${
                      volumePercent === item.val
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full">
              {!resultUrl ? (
                <button
                  onClick={handleAdjustVolume}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {statusMessage || `Applying Volume (${Math.round(progress.percent)}%)...`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Boost & Export Audio
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Volume adjusted successfully!</span>
                  </div>
                  <a
                    href={resultUrl}
                    download={`volume_${file?.name || "audio.mp3"}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Audio ({resultSize ? formatBytes(resultSize) : ""})
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Volume2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">500% Amplitude Boost</h4>
            <p className="text-xs text-slate-400">
              Easily enhance faint voice recordings, quiet podcast dialogue, and muffled voice notes.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% In-Browser WASM</h4>
            <p className="text-xs text-slate-400">
              Zero cloud latency or file privacy leaks. Audio normalization is computed natively on your CPU.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Multi-Format Compatible</h4>
            <p className="text-xs text-slate-400">
              Supports MP3, WAV, AAC, M4A, OGG, and FLAC audio files with instant playback preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
