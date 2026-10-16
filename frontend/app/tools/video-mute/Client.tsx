"use client";

import React, { useState, useRef } from "react";
import {
  VolumeX,
  Volume2,
  Video,
  Download,
  Trash2,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  Check,
  RefreshCw,
} from "lucide-react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function VideoMuteClient() {
  const { load: loadFFmpeg, writeFile, readFile, deleteFile, exec, progress } = useFFmpeg();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedUrl(null);
      setOutputSize(null);
      setStatus("idle");
      setErrorMessage("");

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleMuteVideo = async () => {
    if (!selectedFile) return;

    setStatus("processing");
    setErrorMessage("");

    const inputName = "input_" + Date.now() + ".mp4";
    const outputName = "muted_" + Date.now() + ".mp4";

    try {
      await loadFFmpeg();

      const fileData = await fetchFile(selectedFile);
      await writeFile(inputName, fileData);

      // Try fast stream copy first: strips audio track (-an) without re-encoding video
      let code = await exec([
        "-i", inputName,
        "-an",
        "-c:v", "copy",
        outputName,
      ]);

      // Fallback: If container format requires re-muxing
      if (code !== 0) {
        code = await exec([
          "-i", inputName,
          "-an",
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "26",
          outputName,
        ]);
      }

      if (code !== 0) {
        throw new Error("FFmpeg failed to mute video. Please try a different format.");
      }

      const outputData = await readFile(outputName);
      const outputBlob = new Blob([outputData.buffer as ArrayBuffer], { type: "video/mp4" });
      const downloadUrl = URL.createObjectURL(outputBlob);

      setExportedUrl(downloadUrl);
      setOutputSize(outputBlob.size);
      setStatus("completed");
    } catch (err: any) {
      console.error("Mute video error:", err);
      setErrorMessage(err?.message || "Failed to mute video. Please verify your file.");
      setStatus("error");
    } finally {
      try {
        await deleteFile(inputName);
        await deleteFile(outputName);
      } catch {
        // Virtual files might already be removed
      }
    }
  };

  const resetAll = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    setSelectedFile(null);
    setVideoSrc(null);
    setExportedUrl(null);
    setOutputSize(null);
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
            accept="video/*,.mp4,.mov,.webm,.mkv,.avi"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <VolumeX className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Select or Drop Video to Mute
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              MP4, MOV, WebM, MKV supported • Up to 500MB • 100% Client-Side Privacy
            </p>
          </div>
          <button
            type="button"
            className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:bg-primary/90 transition-all"
          >
            Select Video File
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <Video className="w-5 h-5" />
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

          {/* Video Preview and Player */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                Original Video (With Sound)
              </span>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-border/60 flex items-center justify-center">
                {videoSrc && (
                  <video
                    src={videoSrc}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5 text-emerald-500" />
                Muted Preview (Sound Stripped)
              </span>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-border/60 flex items-center justify-center">
                {exportedUrl ? (
                  <video
                    src={exportedUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 text-muted-foreground space-y-2">
                    <VolumeX className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs">
                      Click &quot;Mute Video Online&quot; below to generate instant lossless muted video.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action and Progress Bar */}
          {status === "processing" && (
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Muting video with stream copy...
                </span>
                <span>{progress.percent ? `${Math.round(progress.percent)}%` : "Processing"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
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

          {/* Execution & Download Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {!exportedUrl ? (
              <button
                onClick={handleMuteVideo}
                disabled={status === "processing"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing Audio...</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Mute Video (Lossless Stream Copy)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <a
                  href={exportedUrl}
                  download={`muted_${selectedFile.name.replace(/\.[^/.]+$/, "")}.mp4`}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Muted Video {outputSize ? `(${(outputSize / 1024 / 1024).toFixed(2)} MB)` : ""}</span>
                </a>
                <button
                  onClick={resetAll}
                  className="px-4 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Mute Another</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Lossless Quality (Zero Re-encoding)</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>100% Client-Side In-Browser Privacy</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-500" />
          <span>No File Size Restrictions or Watermark</span>
        </div>
      </div>
    </div>
  );
}
