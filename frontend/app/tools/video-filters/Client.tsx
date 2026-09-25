"use client";

import { useState } from "react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes } from "@/lib/utils/formatters";
import {
  Sparkles,
  Film,
  Download,
  Trash2,
  Sliders,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
} from "lucide-react";

export default function VideoFiltersClient() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Filter settings
  const [brightness, setBrightness] = useState<number>(0); // -1.0 to 1.0 (0 is normal)
  const [contrast, setContrast] = useState<number>(1.0); // 0.0 to 2.0 (1.0 is normal)
  const [saturation, setSaturation] = useState<number>(1.0); // 0.0 to 3.0 (1.0 is normal)
  const [preset, setPreset] = useState<string>("normal");

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

  const applyPreset = (p: string) => {
    setPreset(p);
    setResultUrl(null);
    if (p === "normal") {
      setBrightness(0);
      setContrast(1.0);
      setSaturation(1.0);
    } else if (p === "vibrant") {
      setBrightness(0.05);
      setContrast(1.2);
      setSaturation(1.5);
    } else if (p === "noir") {
      setBrightness(0.05);
      setContrast(1.3);
      setSaturation(0);
    } else if (p === "warm") {
      setBrightness(0.08);
      setContrast(1.05);
      setSaturation(1.2);
    } else if (p === "cinematic") {
      setBrightness(-0.05);
      setContrast(1.35);
      setSaturation(1.15);
    }
  };

  const handleApplyFilter = async () => {
    if (!file) return;
    setErrorMsg(null);
    setResultUrl(null);

    try {
      // FFmpeg eq filter: eq=brightness=B:contrast=C:saturation=S
      const eqFilter = `eq=brightness=${brightness.toFixed(2)}:contrast=${contrast.toFixed(2)}:saturation=${saturation.toFixed(2)}`;

      const outputBlob = await run({
        inputFile: file,
        inputFileName: file.name,
        outputFileName: "filtered.mp4",
        outputMimeType: "video/mp4",
        args: [
          "-i", file.name,
          "-vf", eqFilter,
          "-c:a", "copy",
          "-preset", "ultrafast",
          "filtered.mp4",
        ],
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process video color grading.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-pink-500/20 selection:text-pink-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sliders className="w-3.5 h-3.5" />
            Video Color Grading Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Video Filters & Color Effects Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Adjust video brightness, contrast, and saturation, or apply cinematic presets using in-browser WASM FFmpeg.
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
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-pink-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <Sliders className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select video file for color grading
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Fast client-side color adjustments with 0ms server latency.
              </p>
              <span className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs shadow-lg shadow-pink-600/25 transition">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Player View */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 mb-4 flex items-center justify-center">
                  <video
                    src={resultUrl || videoUrl}
                    controls
                    className="max-h-96 w-full object-contain"
                  />
                </div>

                {/* Presets strip */}
                <div className="flex gap-2 overflow-x-auto w-full pb-2">
                  {[
                    { id: "normal", label: "Normal" },
                    { id: "vibrant", label: "Vibrant Pop" },
                    { id: "cinematic", label: "Cinematic Teal" },
                    { id: "noir", label: "B&W Noir" },
                    { id: "warm", label: "Sunset Warmth" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        preset === p.id
                          ? "bg-pink-600 text-white font-bold"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="w-full flex items-center justify-between mt-4 text-xs text-slate-400">
                  <span>{file?.name}</span>
                  <button
                    onClick={() => {
                      setFile(null);
                      setVideoUrl(null);
                      setResultUrl(null);
                    }}
                    className="hover:text-red-400 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Change video
                  </button>
                </div>
              </div>
            </div>

            {/* Adjustment Sliders */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 text-xs">
              <h3 className="font-semibold text-white tracking-wide uppercase">
                Color Adjustments
              </h3>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Brightness</span>
                  <span>{Math.round(brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={-0.5}
                  max={0.5}
                  step={0.05}
                  value={brightness}
                  onChange={(e) => {
                    setBrightness(parseFloat(e.target.value));
                    setResultUrl(null);
                  }}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Contrast</span>
                  <span>{Math.round(contrast * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={contrast}
                  onChange={(e) => {
                    setContrast(parseFloat(e.target.value));
                    setResultUrl(null);
                  }}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Saturation</span>
                  <span>{Math.round(saturation * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2.5}
                  step={0.1}
                  value={saturation}
                  onChange={(e) => {
                    setSaturation(parseFloat(e.target.value));
                    setResultUrl(null);
                  }}
                  className="w-full accent-pink-500"
                />
              </div>

              {!resultUrl ? (
                <button
                  onClick={handleApplyFilter}
                  disabled={isProcessing}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {statusMessage || `Grading Video (${Math.round(progress.percent)}%)...`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Apply Color Effects
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <a
                    href={resultUrl}
                    download={`filtered-${file?.name || "video.mp4"}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Graded Video ({resultSize ? formatBytes(resultSize) : ""})
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
              <Sun className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Hardware EQ Engine</h4>
            <p className="text-xs text-slate-400">
              Uses FFmpeg's vectorized `eq` processing filter to calculate smooth frame color transitions without artifacts.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% In-Browser Privacy</h4>
            <p className="text-xs text-slate-400">
              No cloud rendering queues or watermarks. Videos are processed directly inside your browser's WebAssembly sandbox.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Audio Stream Preservation</h4>
            <p className="text-xs text-slate-400">
              Audio tracks are copied bit-for-bit to prevent sound degradation during video color adjustment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
