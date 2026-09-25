"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes } from "@/lib/utils/formatters";
import {
  Music,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Sparkles,
  Headphones,
  Play,
  Pause,
} from "lucide-react";

type AudioFormat = "mp3" | "wav" | "aac" | "ogg" | "flac";
type BitrateOption = "320k" | "256k" | "192k" | "128k";

const FORMAT_CONFIG: Record<
  AudioFormat,
  { mime: string; ext: string; codec: string; label: string }
> = {
  mp3: { mime: "audio/mpeg", ext: "mp3", codec: "libmp3lame", label: "MP3 (MPEG-3)" },
  wav: { mime: "audio/wav", ext: "wav", codec: "pcm_s16le", label: "WAV (Uncompressed PCM)" },
  aac: { mime: "audio/aac", ext: "aac", codec: "aac", label: "AAC (Advanced Audio)" },
  ogg: { mime: "audio/ogg", ext: "ogg", codec: "libvorbis", label: "OGG (Vorbis)" },
  flac: { mime: "audio/flac", ext: "flac", codec: "flac", label: "FLAC (Lossless)" },
};

export default function AudioConverterClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [sourceAudioUrl, setSourceAudioUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>("mp3");
  const [bitrate, setBitrate] = useState<BitrateOption>("192k");
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [channels, setChannels] = useState<2 | 1>(2);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { run, isProcessing, progress, statusMessage } = useFFmpeg();

  useEffect(() => {
    return () => {
      if (sourceAudioUrl) URL.revokeObjectURL(sourceAudioUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceAudioUrl, resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setOriginalFile(file);
      setSourceAudioUrl(url);
      setResultUrl(null);
      setResultSize(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".aac", ".ogg", ".flac", ".m4a", ".wma", ".opus"],
      "video/*": [".mp4", ".webm", ".mov", ".mkv"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const resetAll = () => {
    setOriginalFile(null);
    if (sourceAudioUrl) URL.revokeObjectURL(sourceAudioUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setSourceAudioUrl(null);
    setResultUrl(null);
    setResultSize(null);
    setErrorMsg(null);
  };

  const handleConvert = async () => {
    if (!originalFile) return;

    setErrorMsg(null);
    setResultUrl(null);

    const config = FORMAT_CONFIG[targetFormat];
    const outName = `output.${config.ext}`;

    const args: string[] = ["-i", "input_audio"];

    if (config.codec !== "copy") {
      args.push("-c:a", config.codec);
    }

    if (targetFormat === "mp3" || targetFormat === "aac") {
      args.push("-b:a", bitrate);
    }

    args.push("-ar", String(sampleRate));
    args.push("-ac", String(channels));
    args.push(outName);

    if (!run) {
      setErrorMsg("FFmpeg engine is initializing. Please try again in a moment.");
      return;
    }

    try {
      const blob = await run({
        inputFile: originalFile,
        inputFileName: "input_audio",
        outputFileName: outName,
        outputMimeType: config.mime,
        args,
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Failed to convert audio file.");
    }
  };

  const baseName = originalFile
    ? originalFile.name.replace(/\.[^/.]+$/, "")
    : "converted";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!originalFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop Audio file here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Supports MP3, WAV, AAC, OGG, FLAC, M4A, OPUS, and video clips. 100% private in-browser conversion.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header File Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {originalFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(originalFile.size)}
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
            {/* Player Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-md">{originalFile.name}</h4>
                    <p className="text-xs text-slate-400">Source Track Preview</p>
                  </div>
                </div>

                {sourceAudioUrl && (
                  <audio
                    ref={audioRef}
                    src={sourceAudioUrl}
                    controls
                    className="w-full mt-2"
                  />
                )}
              </div>

              {/* Converted Output Preview */}
              {resultUrl && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Conversion Complete!</span>
                    </div>
                    {resultSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatBytes(resultSize)}
                      </span>
                    )}
                  </div>

                  <audio src={resultUrl} controls className="w-full" />

                  <a
                    href={resultUrl}
                    download={`${baseName}-converted.${FORMAT_CONFIG[targetFormat].ext}`}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Converted {targetFormat.toUpperCase()}
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

            {/* Right Settings Panel */}
            <div className="space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-violet-500" />
                <span>Conversion Settings</span>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Target Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(FORMAT_CONFIG) as AudioFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetFormat === fmt
                          ? "border-violet-500 bg-violet-600/10 text-violet-600 dark:text-violet-400 shadow-sm"
                          : "border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bitrate selection (only for MP3/AAC) */}
              {(targetFormat === "mp3" || targetFormat === "aac") && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Bitrate Quality
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["320k", "256k", "192k", "128k"] as BitrateOption[]).map((br) => (
                      <button
                        key={br}
                        type="button"
                        onClick={() => setBitrate(br)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          bitrate === br
                            ? "border-violet-500 bg-violet-600/10 text-violet-600 dark:text-violet-400"
                            : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {br}bps {br === "320k" ? "★" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Channels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Channels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannels(2)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      channels === 2
                        ? "border-violet-500 bg-violet-600/10 text-violet-600 dark:text-violet-400"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Stereo (2ch)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannels(1)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      channels === 1
                        ? "border-violet-500 bg-violet-600/10 text-violet-600 dark:text-violet-400"
                        : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Mono (1ch)
                  </button>
                </div>
              </div>

              {/* Sample Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Sample Rate
                </label>
                <select
                  value={sampleRate}
                  onChange={(e) => setSampleRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value={44100}>44.1 kHz (CD Quality)</option>
                  <option value={48000}>48 kHz (Studio / Film)</option>
                  <option value={96000}>96 kHz (Hi-Res)</option>
                </select>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Converting... {progress.percent ? `${Math.round(progress.percent)}%` : ""}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Convert to {targetFormat.toUpperCase()}</span>
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
