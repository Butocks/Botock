"use client";

import { useState, useRef, useCallback } from "react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes } from "@/lib/utils/formatters";
import {
  RotateCw,
  Film,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";

export default function VideoRotateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Settings
  const [rotation, setRotation] = useState<number>(90); // 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

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

  const handleRotate = async () => {
    if (!file) return;
    setErrorMsg(null);
    setResultUrl(null);

    try {
      // Build FFmpeg video transpose / rotate filter
      const vFilters: string[] = [];

      if (rotation === 90) {
        vFilters.push("transpose=1"); // 90 degrees clockwise
      } else if (rotation === 180) {
        vFilters.push("transpose=1,transpose=1");
      } else if (rotation === 270) {
        vFilters.push("transpose=2"); // 90 degrees counter-clockwise
      }

      if (flipH) vFilters.push("hflip");
      if (flipV) vFilters.push("vflip");

      const vfParam = vFilters.length > 0 ? vFilters.join(",") : "null";

      const outputBlob = await run({
        inputFile: file,
        inputFileName: file.name,
        outputFileName: "rotated.mp4",
        outputMimeType: "video/mp4",
        args: [
          "-i", file.name,
          "-vf", vfParam,
          "-c:a", "copy",
          "-preset", "ultrafast",
          "rotated.mp4",
        ],
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to rotate video file.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <RotateCw className="w-3.5 h-3.5" />
            Video Orientation Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Rotate & Flip Video Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Fix sideways or upside-down smartphone recordings with fast in-browser WASM FFmpeg processing.
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
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-purple-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select video file to rotate
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Rotates MP4, MOV, and WebM videos natively in your browser.
              </p>
              <span className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition">
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
            {/* Video Player */}
            <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 mb-6 flex items-center justify-center">
              <video
                src={resultUrl || videoUrl}
                controls
                className="max-h-96 w-full object-contain"
              />
            </div>

            {/* Transform Controls Toolbar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
              {[
                { deg: 90, label: "Rotate 90°" },
                { deg: 180, label: "Rotate 180°" },
                { deg: 270, label: "Rotate 270°" },
                { deg: 0, label: "Reset" },
              ].map((r) => (
                <button
                  key={r.deg}
                  onClick={() => {
                    setRotation(r.deg);
                    setResultUrl(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                    rotation === r.deg
                      ? "bg-purple-600 text-white font-bold border-purple-500"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full mb-6">
              <button
                onClick={() => {
                  setFlipH((prev) => !prev);
                  setResultUrl(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition ${
                  flipH
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <FlipHorizontal className="w-4 h-4 text-purple-400" />
                Flip Horizontal
              </button>
              <button
                onClick={() => {
                  setFlipV((prev) => !prev);
                  setResultUrl(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition ${
                  flipV
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <FlipVertical className="w-4 h-4 text-purple-400" />
                Flip Vertical
              </button>
            </div>

            {/* Action buttons */}
            <div className="w-full">
              {!resultUrl ? (
                <button
                  onClick={handleRotate}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {statusMessage || `Rotating Video (${Math.round(progress.percent)}%)...`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Rotate Video Now
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Rotation complete! Preserved original audio and quality.</span>
                  </div>
                  <a
                    href={resultUrl}
                    download={`rotated-${file?.name || "video.mp4"}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Rotated Video ({resultSize ? formatBytes(resultSize) : ""})
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <RotateCw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Lossless Audio Stream Copy</h4>
            <p className="text-xs text-slate-400">
              Only video frames are rotated; audio streams are copied without re-encoding to preserve fidelity.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% Client-Side Privacy</h4>
            <p className="text-xs text-slate-400">
              WebAssembly multi-threaded processing runs in your browser. Video files are never uploaded to a cloud server.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Mirror & Orientation Flip</h4>
            <p className="text-xs text-slate-400">
              Correct mirror-inverted webcam footage or flipped front-facing mobile clips easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
