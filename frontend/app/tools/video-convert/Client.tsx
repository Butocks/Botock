"use client";

import { useState } from "react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes } from "@/lib/utils/formatters";
import {
  FileVideo,
  Film,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

const FORMAT_OPTIONS = [
  { ext: "mp4", label: "MP4 (H.264 / AAC)", mime: "video/mp4", vcodec: "libx264", acodec: "aac" },
  { ext: "webm", label: "WebM (VP8 / Vorbis)", mime: "video/webm", vcodec: "libvpx", acodec: "libvorbis" },
  { ext: "mkv", label: "MKV (Matroska)", mime: "video/x-matroska", vcodec: "copy", acodec: "copy" },
  { ext: "mov", label: "MOV (QuickTime)", mime: "video/quicktime", vcodec: "copy", acodec: "copy" },
  { ext: "avi", label: "AVI Container", mime: "video/x-msvideo", vcodec: "libx264", acodec: "mp3" },
];

export default function VideoConvertClient() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [targetExt, setTargetExt] = useState<string>("mp4");

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

  const handleConvert = async () => {
    if (!file) return;
    setErrorMsg(null);
    setResultUrl(null);

    try {
      const selectedOption = FORMAT_OPTIONS.find((f) => f.ext === targetExt) || FORMAT_OPTIONS[0];
      const outputName = `converted.${selectedOption.ext}`;

      const args = [
        "-i", file.name,
        "-preset", "ultrafast",
      ];

      if (selectedOption.vcodec !== "copy") {
        args.push("-c:v", selectedOption.vcodec);
      } else {
        args.push("-c:v", "copy");
      }

      if (selectedOption.acodec !== "copy") {
        args.push("-c:a", selectedOption.acodec);
      } else {
        args.push("-c:a", "copy");
      }

      const outputBlob = await run({
        inputFile: file,
        inputFileName: file.name,
        outputFileName: outputName,
        outputMimeType: selectedOption.mime,
        args,
      });

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultSize(outputBlob.size);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to convert video container format.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <RefreshCw className="w-3.5 h-3.5" />
            Universal Transcoder
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Video Format Converter Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert videos between MP4, WebM, MKV, MOV, and AVI formats directly in your browser with high-speed WASM FFmpeg.
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
              className="relative group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/60 hover:border-rose-500/50 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <FileVideo className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Select video file to convert
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Transcode containers and codecs natively in your browser.
              </p>
              <span className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-600/25 transition">
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

            {/* Target Format Options */}
            <div className="w-full mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Target Output Container
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f.ext}
                    onClick={() => {
                      setTargetExt(f.ext);
                      setResultUrl(null);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      targetExt === f.ext
                        ? "bg-rose-600/20 border-rose-500 text-rose-300 font-bold"
                        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="block font-bold text-sm text-white uppercase">{f.ext}</span>
                    <span className="text-[10px] text-slate-400">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full">
              {!resultUrl ? (
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {statusMessage || `Transcoding Container (${Math.round(progress.percent)}%)...`}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Convert to {targetExt.toUpperCase()}
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Conversion complete! Zero cloud processing used.</span>
                  </div>
                  <a
                    href={resultUrl}
                    download={`converted.${targetExt}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download {targetExt.toUpperCase()} Video ({resultSize ? formatBytes(resultSize) : ""})
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
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Universal Multi-Format</h4>
            <p className="text-xs text-slate-400">
              Convert across standard web formats (MP4, WebM, MOV, MKV, AVI) compatible with YouTube, Instagram, and TikTok.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Zero Server Bandwidth</h4>
            <p className="text-xs text-slate-400">
              Heavy video data is processed locally in browser RAM using WebAssembly FFmpeg. No bandwidth limits.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Lossless Container Remuxing</h4>
            <p className="text-xs text-slate-400">
              Where streams are compatible (like MOV to MP4), remuxing finishes in seconds without transcoding loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
