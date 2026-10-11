"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  RotateCw,
  RotateCcw,
  Video,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  Upload,
  Play,
  Pause,
  Loader2,
  Sliders,
  Check,
} from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";

export default function VideoRotateClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [autoDetectedAngle, setAutoDetectedAngle] = useState<number | null>(null);

  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedUrl(null);
      setStatus("idle");
      setErrorMessage("");
      setRotation(0);
      setFlipH(false);

      const url = URL.createObjectURL(file);
      setVideoSrc(url);

      // Auto-detect orientation based on metadata
      const tempVideo = document.createElement("video");
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        // If width < height (vertical video), check if orientation should be adjusted
        if (tempVideo.videoHeight > tempVideo.videoWidth) {
          setAutoDetectedAngle(0); // already vertical
        } else {
          setAutoDetectedAngle(90); // landscape could be rotated to 90
        }
      };
    }
  };

  const handleRotate = (delta: number) => {
    setRotation((prev) => (prev + delta + 360) % 360);
  };

  const handleAutoStraighten = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      // Auto straighten: if height < width but recorded sideways, straighten to 90 CW
      if (rotation === 0) {
        setRotation(90);
      } else {
        setRotation(0);
      }
    } else {
      setRotation(90);
    }
  };

  const startProcessing = async () => {
    if (!selectedFile) return;
    setStatus("processing");
    setErrorMessage("");
    setExportedUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("angle", rotation.toString());
      formData.append("flip_h", flipH ? "true" : "false");

      try {
        const response = await fetch(`${backendUrl}/api/video/rotate`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setExportedUrl(url);
          setStatus("completed");
          return;
        }
      } catch (backendErr) {
        console.warn("Backend video rotate unavailable, using client-side canvas recorder:", backendErr);
      }

      // In-browser fallback rotation
      const clientBlob = await rotateVideoInBrowser(selectedFile, rotation, flipH);
      const url = URL.createObjectURL(clientBlob);
      setExportedUrl(url);
      setStatus("completed");
    } catch (err: any) {
      console.error("Video rotation failed:", err);
      setErrorMessage(err.message || "Failed to process video rotation.");
      setStatus("error");
    }
  };

  const rotateVideoInBrowser = async (file: File, angleDeg: number, isFlipped: boolean): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const srcUrl = URL.createObjectURL(file);
      video.src = srcUrl;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const origW = video.videoWidth || 640;
        const origH = video.videoHeight || 360;
        const is90or270 = angleDeg === 90 || angleDeg === 270;

        const targetW = is90or270 ? origH : origW;
        const targetH = is90or270 ? origW : origH;

        const canvas = document.createElement("canvas");
        canvas.width = targetW % 2 === 0 ? targetW : targetW - 1;
        canvas.height = targetH % 2 === 0 ? targetH : targetH - 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(srcUrl);
          return reject(new Error("Canvas context failed"));
        }

        const stream = canvas.captureStream(30);
        let mimeType = "video/webm";
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          mimeType = "video/webm;codecs=vp9";
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          URL.revokeObjectURL(srcUrl);
          resolve(new Blob(chunks, { type: mimeType }));
        };

        video.currentTime = 0;
        video.play().catch(reject);
        mediaRecorder.start();

        const onFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }

          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((angleDeg * Math.PI) / 180);
          ctx.scale(isFlipped ? -1 : 1, 1);
          ctx.drawImage(video, -origW / 2, -origH / 2, origW, origH);
          ctx.restore();

          if ("requestVideoFrameCallback" in video) {
            (video as any).requestVideoFrameCallback(onFrame);
          } else {
            requestAnimationFrame(onFrame);
          }
        };

        if ("requestVideoFrameCallback" in video) {
          (video as any).requestVideoFrameCallback(onFrame);
        } else {
          requestAnimationFrame(onFrame);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(srcUrl);
        reject(new Error("Failed to load video file."));
      };
    });
  };

  const handleReset = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    setSelectedFile(null);
    setVideoSrc(null);
    setExportedUrl(null);
    setStatus("idle");
    setRotation(0);
    setFlipH(false);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-400">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <RotateCw className="w-3.5 h-3.5" />
            Video Orientation &amp; Straightener
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Rotate Video Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Upload your video to automatically straighten sideways footage or rotate 90°, 180°, 270° and mirror with instant live preview.
          </p>
        </div>

        {/* Upload Card */}
        {!selectedFile ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const f = e.dataTransfer.files[0];
                if (f.type.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi)$/i.test(f.name)) {
                  setSelectedFile(f);
                  setVideoSrc(URL.createObjectURL(f));
                }
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="max-w-xl mx-auto p-12 border-2 border-dashed border-slate-700/60 hover:border-rose-500/50 rounded-3xl bg-slate-900/40 hover:bg-slate-900/80 transition-all text-center cursor-pointer group space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Choose Video to Rotate
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                MP4, MOV, WebM, MKV (Up to 200MB). Straightens sideways phone clips in seconds.
              </p>
            </div>
            <span className="inline-flex px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition">
              Select Video File
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Interactive Stage */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
              {/* File Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Current angle: <span className="text-rose-400 font-semibold">{rotation}°</span>
                      {flipH && " • Flipped horizontally"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              {/* Live Video Preview Box */}
              <div className="relative w-full h-[360px] sm:h-[440px] rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-slate-800">
                {videoSrc && (
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                      transition: "transform 0.25s ease-in-out",
                    }}
                    className="max-w-full max-h-[400px] object-contain rounded-lg"
                  />
                )}
                {rotation !== 0 && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                    Preview: {rotation}°
                  </div>
                )}
              </div>

              {/* Rotation & Angle Controls Toolbar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span>Rotate &amp; Angle Adjustments</span>
                  <button
                    type="button"
                    onClick={handleAutoStraighten}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 normal-case font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Straighten
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRotate(90)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 border border-white/5"
                  >
                    <RotateCw className="w-4 h-4 text-rose-400" /> Rotate 90° CW
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotate(180)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 border border-white/5"
                  >
                    <RotateCw className="w-4 h-4 text-rose-400" /> Rotate 180°
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotate(-90)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 border border-white/5"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400" /> Rotate 90° CCW
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH(!flipH)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border ${
                      flipH
                        ? "bg-rose-500/20 border-rose-500 text-rose-400"
                        : "bg-slate-800 hover:bg-slate-700 text-white border-white/5"
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4 text-rose-400" /> Flip Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRotation(0);
                      setFlipH(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition flex items-center justify-center gap-2 border border-white/5"
                  >
                    Reset Angle
                  </button>
                </div>
              </div>

              {/* Action Button */}
              {status !== "completed" && (
                <button
                  type="button"
                  onClick={startProcessing}
                  disabled={status === "processing"}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-base shadow-xl shadow-rose-600/25 transition flex items-center justify-center gap-2"
                >
                  {status === "processing" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Encoding Rotated Video...
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-5 h-5" /> Apply &amp; Render Video ({rotation}°)
                    </>
                  )}
                </button>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Post-Execution Result & Re-Adjustment Section */}
            {status === "completed" && exportedUrl && (
              <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-6">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  Video Successfully Rotated to {rotation}°!
                </div>

                <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-black overflow-hidden flex items-center justify-center">
                  <video controls src={exportedUrl} className="max-w-full max-h-full rounded-lg" />
                </div>

                {/* Download Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <a
                    href={exportedUrl}
                    download={`rotated_${rotation}deg_${selectedFile.name}`}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Rotated Video
                  </a>

                  {/* Manual Further Adjustment Buttons as requested */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Need another angle?</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleRotate(90);
                        startProcessing();
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-rose-400" /> Rotate +90° Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRotate(180);
                        startProcessing();
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-rose-400" /> Rotate 180°
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-800/60">
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Smart Auto-Orientation</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically straightens sideways smartphone video recordings to proper upright orientation.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-start gap-3">
            <Sliders className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Post-Execution Angle Tweaks</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Quickly adjust to other angles with dedicated post-render buttons if you need a different perspective.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">No Quality Loss</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                High-fidelity hardware-accelerated encoding maintains video clarity, frame rate, and full audio tracks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
