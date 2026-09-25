"use client";

import { useState } from "react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes } from "@/lib/utils/formatters";
import {
  Volume2,
  Film,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume1,
  Sliders,
} from "lucide-react";

export default function VideoVolumeClient() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

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
      setVideoUrl(URL.createObjectURL(selected));
    }
  };

  const handleAdjustVolume = async () => {
    if (!file) return;
    setErrorMsg(null);
    setResultUrl(null);

    try {
      // FFmpeg volume filter: volume=1.5
      const volumeFactor = (volumePercent / 100).toFixed(2);

      const outputBlob = await run({
        inputFile: file,
        inputFileName: file.name,
        outputFileName: "volume_adjusted.mp4",
        outputMimeType: "video/mp4",
        args: [
          "-i", file.name,
          "-c:v", "copy", // Lossless video stream copy
          "-filter:a", `volume=${volumeFactor}`,
          "volume_adjusted.mp4",
        ],
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to adjust video volume.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Volume2 className="w-3.5 h-3.5" />
            Audio Gain & Attenuation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Adjust Video Volume Online Free (Boost up to 500%)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Boost quiet dialogue or reduce loud background music with lossless video stream copy in your browser.
          </p>
        </div>

        {(errorMsg || error) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg || error}</span>
          </div>
        )}

        {!videoUrl ? (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="video-upload"
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-cyan-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Volume2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select video to boost or lower volume
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Lossless video pass-through: Re-encodes only audio in milliseconds.
              </p>
              <span className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/25 transition">
                Choose Video File
              </span>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            {/* Player View */}
            <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 mb-6 flex items-center justify-center">
              <video
                src={resultUrl || videoUrl}
                controls
                className="max-h-96 w-full object-contain"
              />
            </div>

            {/* Slider Settings */}
            <div className="w-full space-y-4 mb-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  Target Audio Level
                </span>
                <span className="text-cyan-400 font-bold text-sm">{volumePercent}%</span>
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
                className="w-full accent-cyan-500"
              />

              <div className="flex justify-between gap-2">
                {[
                  { label: "Mute (0%)", val: 0 },
                  { label: "50% (Quiet)", val: 50 },
                  { label: "100% (Normal)", val: 100 },
                  { label: "200% (Boost)", val: 200 },
                  { label: "400% (Max)", val: 400 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setVolumePercent(item.val);
                      setResultUrl(null);
                    }}
                    className={`py-1.5 px-2 text-[10px] rounded-lg border transition ${
                      volumePercent === item.val
                        ? "bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold"
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {statusMessage || `Applying Volume (${Math.round(progress.percent)}%)...`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Adjust Volume Now
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Volume adjusted! Video stream copied losslessly in 0ms.</span>
                  </div>
                  <a
                    href={resultUrl}
                    download={`volume-${file?.name || "video.mp4"}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Video ({resultSize ? formatBytes(resultSize) : ""})
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setFile(null);
                setVideoUrl(null);
                setResultUrl(null);
              }}
              className="mt-4 text-xs text-slate-400 hover:text-red-400 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Choose different video
            </button>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <Volume2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Lossless Video Stream Copy</h4>
            <p className="text-xs text-slate-400">
              Only the audio channel is modified. Video frames are copied directly with zero re-encoding time.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% In-Browser WASM</h4>
            <p className="text-xs text-slate-400">
              Audio normalization and gain run directly inside your browser without uploading to external servers.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Up to 500% Volume Boost</h4>
            <p className="text-xs text-slate-400">
              Rescue recordings with quiet microphones or reduce overpowering music volume instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
