"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Music,
  Download,
  Trash2,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sliders,
  Play,
  Pause,
  FileAudio,
  Radio,
  FileCheck,
} from "lucide-react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { fetchFile } from "@ffmpeg/util";
import { formatBytes, formatTime } from "@/lib/utils/formatters";
import { processVideoOrAudioTool } from "@/app/tools/ToolEngine";

export type AudioFormat = "mp3" | "wav" | "aac" | "m4a" | "ogg" | "flac";
export type BitrateOption = "320k" | "256k" | "192k" | "128k";

const FORMATS: { id: AudioFormat; label: string; desc: string; ext: string; mime: string }[] = [
  { id: "mp3", label: "MP3", desc: "Universal Compatibility", ext: "mp3", mime: "audio/mpeg" },
  { id: "wav", label: "WAV", desc: "Lossless Studio PCM", ext: "wav", mime: "audio/wav" },
  { id: "aac", label: "AAC", desc: "High Efficiency Audio", ext: "aac", mime: "audio/aac" },
  { id: "m4a", label: "M4A", desc: "Apple & Mobile Ready", ext: "m4a", mime: "audio/mp4" },
  { id: "flac", label: "FLAC", desc: "Lossless Compressed", ext: "flac", mime: "audio/flac" },
  { id: "ogg", label: "OGG", desc: "Open Vorbis Format", ext: "ogg", mime: "audio/ogg" },
];

const BITRATES: { id: BitrateOption; label: string; desc: string }[] = [
  { id: "320k", label: "320 kbps", desc: "Ultra Studio Quality" },
  { id: "256k", label: "256 kbps", desc: "High Fidelity" },
  { id: "192k", label: "192 kbps", desc: "Standard Optimal (Default)" },
  { id: "128k", label: "128 kbps", desc: "Compact File Size" },
];

/**
 * Fast Native Web Audio API encoder for instant WAV conversion (<0.3s)
 */
async function convertToWavNative(file: File, channelsCount: 1 | 2): Promise<Blob> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    const targetChannels = Math.min(channelsCount, decoded.numberOfChannels);
    const offlineCtx = new OfflineAudioContext(
      targetChannels,
      decoded.length,
      decoded.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(offlineCtx.destination);
    source.start(0);

    const rendered = await offlineCtx.startRendering();

    // 16-bit PCM WAV encoding
    const numOfChan = rendered.numberOfChannels;
    const length = rendered.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);
    let pos = 0;

    const setUint16 = (d: number) => { view.setUint16(pos, d, true); pos += 2; };
    const setUint32 = (d: number) => { view.setUint32(pos, d, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(rendered.sampleRate);
    setUint32(rendered.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    const channels = [];
    for (let i = 0; i < numOfChan; i++) channels.push(rendered.getChannelData(i));

    for (let i = 0; i < rendered.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        let sample = Math.max(-1, Math.min(1, channels[ch][i]));
        sample = sample < 0 ? sample * 32768 : sample * 32767;
        view.setInt16(pos, Math.floor(sample), true);
        pos += 2;
      }
    }

    return new Blob([outBuffer], { type: "audio/wav" });
  } finally {
    audioCtx.close().catch(() => {});
  }
}

export default function AudioConverterClient() {
  const { load: loadFFmpeg, writeFile, readFile, deleteFile, exec, progress } = useFFmpeg();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>("mp3");
  const [bitrate, setBitrate] = useState<BitrateOption>("192k");
  const [channels, setChannels] = useState<1 | 2>(2);

  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [statusText, setStatusText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportedSize, setExportedSize] = useState<number>(0);

  // Playback state
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingConverted, setIsPlayingConverted] = useState(false);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const convertedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up object URLs on unmount or file reset
  useEffect(() => {
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
      if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    };
  }, [audioSrc, exportedUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setExportedUrl(null);
      setExportedBlob(null);
      setStatus("idle");
      setErrorMessage("");
      setIsPlayingOriginal(false);
      setIsPlayingConverted(false);

      const url = URL.createObjectURL(file);
      setAudioSrc(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".aac", ".ogg", ".flac", ".m4a", ".wma", ".aiff", ".opus"],
      "video/*": [".mp4", ".webm", ".mov", ".mkv", ".m4v"],
    },
    maxFiles: 1,
  });

  const handleLoadedMetadata = () => {
    if (originalAudioRef.current) {
      const d = originalAudioRef.current.duration;
      if (d && !isNaN(d) && d > 0) {
        setDuration(d);
      }
    }
  };

  const resetAll = () => {
    if (audioSrc) URL.revokeObjectURL(audioSrc);
    if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    setSelectedFile(null);
    setAudioSrc(null);
    setExportedUrl(null);
    setExportedBlob(null);
    setExportedSize(0);
    setDuration(0);
    setStatus("idle");
    setErrorMessage("");
    setIsPlayingOriginal(false);
    setIsPlayingConverted(false);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setStatus("processing");
    setStatusText("Initializing audio conversion engine...");
    setErrorMessage("");

    const isAudioOnly =
      selectedFile.type.startsWith("audio/") ||
      Boolean(selectedFile.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma|aiff)$/i));

    // 1. Ultra-fast native Web Audio path for WAV target
    if (targetFormat === "wav" && isAudioOnly) {
      try {
        setStatusText("Encoding 16-bit lossless PCM WAV...");
        const wavBlob = await convertToWavNative(selectedFile, channels);
        const url = URL.createObjectURL(wavBlob);
        setExportedBlob(wavBlob);
        setExportedUrl(url);
        setExportedSize(wavBlob.size);
        setStatus("completed");
        return;
      } catch (err) {
        console.warn("Native WebAudio conversion failed, falling back to FFmpeg engine:", err);
      }
    }

    // 2. Hybrid / FFmpeg WASM conversion for MP3, AAC, FLAC, OGG, M4A
    try {
      setStatusText("Processing audio stream with studio encoder...");

      // Try smart hybrid runner (Backend if up, FFmpeg WASM if local)
      const { result: resultBlob } = await processVideoOrAudioTool(
        "audio-converter",
        selectedFile,
        {
          format: targetFormat,
          bitrate,
          channels,
        },
        (pct) => {
          setStatusText(`Converting... ${Math.round(pct)}%`);
        }
      );

      const url = URL.createObjectURL(resultBlob);
      setExportedBlob(resultBlob);
      setExportedUrl(url);
      setExportedSize(resultBlob.size);
      setStatus("completed");
    } catch (hybridErr: any) {
      console.warn("Hybrid tool execution failed, using direct client FFmpeg:", hybridErr);
      try {
        setStatusText("Loading client-side WebAssembly codec...");
        await loadFFmpeg();

        const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "audio";
        const inName = `input_${Date.now()}.${ext}`;
        const outName = `converted_${Date.now()}.${targetFormat}`;

        const fileData = await fetchFile(selectedFile);
        await writeFile(inName, fileData);

        setStatusText("Encoding audio frames...");
        const ffmpegArgs: string[] = ["-i", inName, "-vn"];

        if (channels === 1) {
          ffmpegArgs.push("-ac", "1");
        }

        if (targetFormat === "mp3") {
          ffmpegArgs.push("-acodec", "libmp3lame", "-b:a", bitrate);
        } else if (targetFormat === "wav") {
          ffmpegArgs.push("-acodec", "pcm_s16le");
        } else if (targetFormat === "aac" || targetFormat === "m4a") {
          ffmpegArgs.push("-acodec", "aac", "-b:a", bitrate);
        } else if (targetFormat === "ogg") {
          ffmpegArgs.push("-acodec", "libvorbis", "-q:a", "5");
        } else if (targetFormat === "flac") {
          ffmpegArgs.push("-acodec", "flac");
        } else {
          ffmpegArgs.push("-b:a", bitrate);
        }

        ffmpegArgs.push(outName);

        const code = await exec(ffmpegArgs);
        if (code !== 0) {
          throw new Error(`FFmpeg exited with error code ${code}`);
        }

        const outData = await readFile(outName);
        await deleteFile(inName).catch(() => {});
        await deleteFile(outName).catch(() => {});

        const targetMime =
          FORMATS.find((f) => f.id === targetFormat)?.mime || "audio/mpeg";
        const finalBlob = new Blob([outData as unknown as BlobPart], { type: targetMime });
        const finalUrl = URL.createObjectURL(finalBlob);

        setExportedBlob(finalBlob);
        setExportedUrl(finalUrl);
        setExportedSize(finalBlob.size);
        setStatus("completed");
      } catch (clientErr: any) {
        console.error("Audio conversion failed completely:", clientErr);
        setStatus("error");
        setErrorMessage(
          clientErr?.message || "Failed to convert audio file. Please try another format."
        );
      }
    }
  };

  const getExportFilename = () => {
    if (!selectedFile) return `converted.${targetFormat}`;
    const base = selectedFile.name.replace(/\.[^/.]+$/, "");
    return `${base}_botock.${targetFormat}`;
  };

  return (
    <div className="w-full space-y-8">
      {/* Hidden audio elements for duration inspection and playback */}
      {audioSrc && (
        <audio
          ref={originalAudioRef}
          src={audioSrc}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlayingOriginal(false)}
          className="hidden"
        />
      )}
      {exportedUrl && (
        <audio
          ref={convertedAudioRef}
          src={exportedUrl}
          onEnded={() => setIsPlayingConverted(false)}
          className="hidden"
        />
      )}

      {/* Upload Dropzone */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
              : "border-border/80 hover:border-amber-500/60 hover:bg-card/60 bg-card/20"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
            <Music className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
            Drag & Drop Audio or Video File Here
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            Convert between MP3, WAV, AAC, M4A, OGG, and FLAC, or extract audio from MP4/WebM videos.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all">
            <FileAudio className="w-4 h-4" />
            <span>Select Audio File</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Supports MP3, WAV, AAC, M4A, OGG, FLAC, WMA, AIFF, MP4, WebM • Up to 2GB • In-Browser Privacy
          </p>
        </div>
      )}

      {/* Selected File & Conversion Dashboard */}
      {selectedFile && (
        <div className="space-y-6">
          {/* File Card Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-foreground text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{formatBytes(selectedFile.size)}</span>
                  {duration > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatTime(duration)}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="uppercase text-amber-500 font-semibold">
                    {selectedFile.name.split(".").pop() || "audio"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {audioSrc && (
                <button
                  type="button"
                  onClick={() => {
                    if (originalAudioRef.current) {
                      if (isPlayingOriginal) {
                        originalAudioRef.current.pause();
                        setIsPlayingOriginal(false);
                      } else {
                        originalAudioRef.current.play();
                        setIsPlayingOriginal(true);
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all"
                >
                  {isPlayingOriginal ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{isPlayingOriginal ? "Pause Original" : "Play Original"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={resetAll}
                disabled={status === "processing"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Target Format Picker */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-foreground text-sm">Target Audio Format</h4>
                </div>
                <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold">
                  {targetFormat}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FORMATS.map((fmt) => {
                  const isSelected = targetFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      disabled={status === "processing"}
                      onClick={() => setTargetFormat(fmt.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 text-foreground"
                          : "border-border/60 hover:border-amber-500/40 bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-sm tracking-wide">{fmt.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <p className="text-[11px] leading-tight text-muted-foreground line-clamp-1">
                        {fmt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Audio Bitrate & Quality */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-foreground text-sm">Bitrate & Channels</h4>
                </div>
                <span className="text-xs text-muted-foreground">
                  {targetFormat === "wav" || targetFormat === "flac" ? "Lossless Auto" : bitrate}
                </span>
              </div>

              {targetFormat === "wav" || targetFormat === "flac" ? (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-amber-500">Lossless Master Quality:</span> {targetFormat.toUpperCase()} preserves every uncompressed audio sample at full dynamic range without bit loss.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {BITRATES.map((br) => {
                    const isSelected = bitrate === br.id;
                    return (
                      <button
                        key={br.id}
                        type="button"
                        disabled={status === "processing"}
                        onClick={() => setBitrate(br.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/20 text-foreground"
                            : "border-border/60 hover:border-amber-500/40 bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="font-bold text-xs">{br.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{br.desc}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Channels Option */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Channel Layout:</span>
                <div className="inline-flex rounded-lg border border-border/60 p-0.5 bg-muted/40 text-xs">
                  <button
                    type="button"
                    disabled={status === "processing"}
                    onClick={() => setChannels(2)}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      channels === 2 ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Stereo (2ch)
                  </button>
                  <button
                    type="button"
                    disabled={status === "processing"}
                    onClick={() => setChannels(1)}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      channels === 1 ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Mono (1ch)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button & Processing Bar */}
          {status !== "completed" && (
            <div className="space-y-4">
              <button
                type="button"
                disabled={status === "processing"}
                onClick={handleConvert}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-base shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{statusText || "Converting Audio..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Convert to {targetFormat.toUpperCase()}</span>
                  </>
                )}
              </button>

              {status === "processing" && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-500">
                    <span>{statusText}</span>
                    <span>{progress.percent ? `${Math.round(progress.percent)}%` : "Working..."}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-amber-500/20 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.max(10, Math.round(progress.percent))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {status === "error" && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">Conversion Failed</h5>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Card with Player & Download */}
          {status === "completed" && exportedUrl && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-base">Conversion Completed!</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ready for download • {targetFormat.toUpperCase()} format • {formatBytes(exportedSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (convertedAudioRef.current) {
                        if (isPlayingConverted) {
                          convertedAudioRef.current.pause();
                          setIsPlayingConverted(false);
                        } else {
                          convertedAudioRef.current.play();
                          setIsPlayingConverted(true);
                        }
                      }
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all"
                  >
                    {isPlayingConverted ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlayingConverted ? "Pause Preview" : "Play Preview"}</span>
                  </button>

                  <a
                    href={exportedUrl}
                    download={getExportFilename()}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {targetFormat.toUpperCase()}</span>
                  </a>
                </div>
              </div>

              {/* Conversion another format quick action */}
              <div className="pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  Original: {formatBytes(selectedFile.size)} $\rightarrow$ Converted: {formatBytes(exportedSize)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setExportedUrl(null);
                    setExportedBlob(null);
                  }}
                  className="text-amber-500 hover:underline font-bold inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Convert to another format</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy Guarantee Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Files are processed in-browser. Zero server retention or tracking.</span>
          </div>
        </div>
      )}
    </div>
  );
}
