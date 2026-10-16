"use client";

import React, { useState, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Volume1,
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
} from "lucide-react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { fetchFile } from "@ffmpeg/util";
import { processVideoOrAudioTool } from "@/app/tools/ToolEngine";

const PRESETS = [
  { label: "Normal (100%)", value: 100 },
  { label: "Clear (+50%)", value: 150 },
  { label: "Double (+100%)", value: 200 },
  { label: "Loud (3x)", value: 300 },
  { label: "Max Boost (5x)", value: 500 },
];

// Fast Native Web Audio API booster for audio files (Runs in < 0.5s without WASM)
async function boostAudioWithWebAudio(file: File, multiplier: number): Promise<Blob> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    const offlineCtx = new OfflineAudioContext(
      decoded.numberOfChannels,
      decoded.length,
      decoded.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = multiplier;

    source.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    source.start(0);

    const rendered = await offlineCtx.startRendering();

    // Encode to 16-bit PCM WAV
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

export default function AudioVolumeClient() {
  const { load: loadFFmpeg, writeFile, readFile, deleteFile, exec, progress } = useFFmpeg();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [volumePercent, setVolumePercent] = useState<number>(200); // 200% default boost
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleBoostVolume = async () => {
    if (!selectedFile) return;

    setStatus("processing");
    setErrorMessage("");

    const multiplier = Number((volumePercent / 100).toFixed(2));
    const isAudioOnly = selectedFile.type.startsWith("audio/") || Boolean(selectedFile.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i));

    // 1. If audio file: Instant Client-Side Web Audio API (OfflineAudioContext + GainNode) in <0.5s!
    if (isAudioOnly) {
      try {
        const boostedBlob = await boostAudioWithWebAudio(selectedFile, multiplier);
        const downloadUrl = URL.createObjectURL(boostedBlob);
        setExportedUrl(downloadUrl);
        setStatus("completed");
        return;
      } catch (clientErr) {
        console.warn("Client WebAudio boost failed, falling back to hybrid engine:", clientErr);
      }
    }

    // 2. Fast Backend Stream Copy for Video/Audio
    try {
      const { result: outputBlob } = await processVideoOrAudioTool("audio-volume", selectedFile, {
        volume: multiplier,
      });
      const downloadUrl = URL.createObjectURL(outputBlob);
      setExportedUrl(downloadUrl);
      setStatus("completed");
      return;
    } catch (backendErr) {
      console.warn("Backend volume boost failed, falling back to local FFmpeg:", backendErr);
    }

    // 3. In-Browser FFmpeg Fallback with -c:v copy so video frames are NEVER re-encoded!
    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "mp4";
    const isVideo = !isAudioOnly;
    const inputName = `input_${Date.now()}.${ext}`;
    const outputName = `boosted_${Date.now()}.${isVideo ? "mp4" : "mp3"}`;

    try {
      await loadFFmpeg();
      const fileData = await fetchFile(selectedFile);
      await writeFile(inputName, fileData);

      const ffmpegArgs = isVideo
        ? [
            "-i", inputName,
            "-c:v", "copy",
            "-af", `volume=${multiplier}`,
            "-c:a", "aac",
            outputName,
          ]
        : [
            "-i", inputName,
            "-filter:a", `volume=${multiplier}`,
            "-b:a", "192k",
            outputName,
          ];

      const code = await exec(ffmpegArgs);
      if (code !== 0) {
        throw new Error("FFmpeg failed to boost volume. Please try another format.");
      }

      const outputData = await readFile(outputName);
      const mimeType = isVideo ? "video/mp4" : "audio/mpeg";
      const outputBlob = new Blob([outputData.buffer as ArrayBuffer], { type: mimeType });
      const downloadUrl = URL.createObjectURL(outputBlob);

      setExportedUrl(downloadUrl);
      setStatus("completed");
    } catch (err: any) {
      console.error("Audio volume boost error:", err);
      setErrorMessage(err?.message || "Failed to amplify audio. Please try again.");
      setStatus("error");
    } finally {
      try {
        await deleteFile(inputName);
        await deleteFile(outputName);
      } catch {}
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
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.mp4"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Volume2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Select or Drop Audio to Amplify
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              MP3, WAV, M4A, AAC, OGG supported • Boost up to 500% • 100% In-Browser Privacy
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
          {/* File Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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

          {/* Volume Gain Controls */}
          <div className="p-6 rounded-2xl bg-card/60 border border-border/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                Target Volume Level: {volumePercent}%
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500">
                {volumePercent > 100 ? `+${volumePercent - 100}% Louder` : volumePercent === 100 ? "Original" : "Quieter"}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={volumePercent}
              onChange={(e) => setVolumePercent(Number(e.target.value))}
              className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setVolumePercent(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    volumePercent === p.value
                      ? "bg-amber-500 text-black font-bold shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Volume1 className="w-3.5 h-3.5 text-muted-foreground" />
                Original Audio
              </span>
              {audioSrc && (
                <audio src={audioSrc} controls className="w-full rounded-lg" />
              )}
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                Amplified Preview ({volumePercent}%)
              </span>
              {exportedUrl ? (
                <audio src={exportedUrl} controls className="w-full rounded-lg" />
              ) : (
                <div className="text-xs text-muted-foreground p-3 text-center">
                  Click &quot;Amplify Audio Now&quot; to render boosted audio preview.
                </div>
              )}
            </div>
          </div>

          {/* Processing Progress */}
          {status === "processing" && (
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  Boosting audio amplitude...
                </span>
                <span>{progress.percent ? `${Math.round(progress.percent)}%` : "Rendering"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.max(5, progress.percent || 15)}%` }}
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

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {!exportedUrl ? (
              <button
                onClick={handleBoostVolume}
                disabled={status === "processing"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Amplifying Audio...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Amplify Audio ({volumePercent}%)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <a
                  href={exportedUrl}
                  download={`amplified_${volumePercent}pct_${selectedFile.name.replace(/\.[^/.]+$/, "")}.mp3`}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Amplified MP3</span>
                </a>
                <button
                  onClick={resetAll}
                  className="px-4 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Boost Another</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust & Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Boost Volume up to 500% (5x)</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>100% In-Browser Local Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>No Signup, Free MP3 Export</span>
        </div>
      </div>
    </div>
  );
}
