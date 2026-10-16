"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Scissors,
  Music,
  Download,
  Trash2,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Play,
  Pause,
} from "lucide-react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function AudioTrimClient() {
  const { load: loadFFmpeg, writeFile, readFile, deleteFile, exec, progress } = useFFmpeg();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedUrl(null);
      setStatus("idle");
      setErrorMessage("");

      const url = URL.createObjectURL(file);
      setAudioSrc(url);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      setDuration(d);
      setStartTime(0);
      setEndTime(Math.min(30, d)); // default first 30s or full duration
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.currentTime >= endTime && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.currentTime < startTime || audioRef.current.currentTime >= endTime) {
        audioRef.current.currentTime = startTime;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s < 10 ? "0" : ""}${s}.${ms}`;
  };

  const handleTrimAudio = async () => {
    if (!selectedFile || endTime <= startTime) return;

    setStatus("processing");
    setErrorMessage("");

    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "mp3";
    const inputName = `input_${Date.now()}.${ext}`;
    const outputName = `trimmed_${Date.now()}.mp3`;

    try {
      await loadFFmpeg();

      const fileData = await fetchFile(selectedFile);
      await writeFile(inputName, fileData);

      // Fast stream copy mode first
      let code = await exec([
        "-ss", startTime.toFixed(2),
        "-to", endTime.toFixed(2),
        "-i", inputName,
        "-c", "copy",
        outputName,
      ]);

      // Fallback: If format requires re-encoding
      if (code !== 0) {
        code = await exec([
          "-ss", startTime.toFixed(2),
          "-to", endTime.toFixed(2),
          "-i", inputName,
          "-b:a", "192k",
          outputName,
        ]);
      }

      if (code !== 0) {
        throw new Error("FFmpeg failed to trim audio segment.");
      }

      const outputData = await readFile(outputName);
      const outputBlob = new Blob([outputData.buffer as ArrayBuffer], { type: "audio/mpeg" });
      const downloadUrl = URL.createObjectURL(outputBlob);

      setExportedUrl(downloadUrl);
      setStatus("completed");
    } catch (err: any) {
      console.error("Audio trim error:", err);
      setErrorMessage(err?.message || "Failed to trim audio. Please try again.");
      setStatus("error");
    } finally {
      try {
        await deleteFile(inputName);
        await deleteFile(outputName);
      } catch {
        // cleanup virtual files
      }
    }
  };

  const resetAll = () => {
    if (audioSrc) URL.revokeObjectURL(audioSrc);
    if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    setSelectedFile(null);
    setAudioSrc(null);
    setExportedUrl(null);
    setStatus("idle");
    setErrorMessage("");
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Upload Dropzone */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/80 hover:border-primary/80 bg-card/40 hover:bg-card/70 transition-all rounded-3xl p-10 sm:p-14 text-center cursor-pointer flex flex-col items-center justify-center gap-4 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
            <Scissors className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Select or Drop Audio to Cut & Trim
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              MP3, WAV, M4A, AAC supported • Lossless stream copy • Millisecond precision
            </p>
          </div>
          <button
            type="button"
            className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:bg-primary/90 transition-all"
          >
            Select Audio File
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hidden audio element for metadata and preview */}
          {audioSrc && (
            <audio
              ref={audioRef}
              src={audioSrc}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* File Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Duration: {formatSeconds(duration)} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors self-end sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>

          {/* Trimming Range Controls */}
          <div className="p-6 rounded-2xl bg-card/60 border border-border/60 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={togglePlay}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow hover:bg-primary/90"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? "Pause Preview" : "Play Segment"}</span>
              </button>
              <div className="text-xs text-muted-foreground">
                Cut Length: <strong className="text-foreground">{formatSeconds(Math.max(0, endTime - startTime))}</strong>
              </div>
            </div>

            {/* Time Range Input Boxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Start Time (seconds)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={endTime}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => setStartTime(Math.max(0, Math.min(Number(e.target.value), endTime)))}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground font-mono text-sm"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{formatSeconds(startTime)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  End Time (seconds)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={startTime}
                    max={duration || 1000}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => setEndTime(Math.min(duration || 1000, Math.max(Number(e.target.value), startTime)))}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground font-mono text-sm"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{formatSeconds(endTime)}</span>
                </div>
              </div>
            </div>

            {/* Quick Trim Slider */}
            {duration > 0 && (
              <div className="space-y-2 pt-2">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>0:00</span>
                  <span>Cut end marker: {formatSeconds(endTime)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Export Preview */}
          {exportedUrl && (
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-cyan-500" />
                Trimmed Audio Result
              </span>
              <audio src={exportedUrl} controls className="w-full rounded-lg" />
            </div>
          )}

          {/* Status and Progress */}
          {status === "processing" && (
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                  Trimming audio losslessly...
                </span>
                <span>{progress.percent ? `${Math.round(progress.percent)}%` : "Cutting"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${Math.max(5, progress.percent || 20)}%` }}
                />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action and Download Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {!exportedUrl ? (
              <button
                onClick={handleTrimAudio}
                disabled={status === "processing" || endTime <= startTime}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cutting Audio...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>Cut & Export MP3 Segment</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <a
                  href={exportedUrl}
                  download={`trimmed_${selectedFile.name.replace(/\.[^/.]+$/, "")}.mp3`}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Trimmed MP3</span>
                </a>
                <button
                  onClick={resetAll}
                  className="px-4 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Cut Another</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust & Guarantee */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span>Lossless Audio Stream Copy</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>100% Client-Side In-Browser Security</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>Free Ringtone & Audio Cutter</span>
        </div>
      </div>
    </div>
  );
}
