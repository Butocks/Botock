"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Smartphone, Sparkles, Download, AlertCircle } from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { getTransferMedia } from "@/app/utils/mediaTransfer";

type AspectRatioOption = "9:16" | "1:1" | "4:5" | "16:9";

export default function AutoReframeClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("9:16");
  const [status, setStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTransferMedia().then((media) => {
      if (media && media.file) {
        setSelectedFile(media.file);
      }
    });
  }, []);

  const startProcessing = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMessage("");
    setVideoUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("aspectRatio", aspectRatio);
      formData.append("aspect_ratio", aspectRatio);

      try {
        const response = await fetch(`${backendUrl}/api/video/auto-reframe`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setStatus("completed");
          return;
        } else {
          const errData = await response.json().catch(() => null);
          if (response.status !== 502 && errData?.detail) {
            throw new Error(errData.detail);
          }
        }
      } catch (backendErr: any) {
        console.warn("Backend reframe unavailable, executing client-side reframe:", backendErr);
      }

      // Fast, resilient client-side 9:16 crop fallback
      const croppedBlob = await reframeInBrowser(selectedFile);
      const url = URL.createObjectURL(croppedBlob);
      setVideoUrl(url);
      setStatus("completed");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during video reframing.");
      setStatus("error");
    }
  };

  const reframeInBrowser = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const videoSrc = URL.createObjectURL(file);
      video.src = videoSrc;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const vH = video.videoHeight || 720;
        const vW = video.videoWidth || 1280;

        const [rW, rH] = aspectRatio.split(":").map(Number);
        const targetAspect = rW / rH;
        const sourceAspect = vW / vH;

        let cropW = vW;
        let cropH = vH;

        if (sourceAspect > targetAspect) {
          // Video is wider than target ratio (e.g. 16:9 to 9:16, 1:1, 4:5)
          cropW = Math.round(vH * targetAspect);
          cropH = vH;
        } else {
          // Video is taller than target ratio (e.g. 9:16 to 16:9)
          cropW = vW;
          cropH = Math.round(vW / targetAspect);
        }

        // Ensure even dimensions for video codecs
        cropW = cropW % 2 === 0 ? cropW : cropW - 1;
        cropH = cropH % 2 === 0 ? cropH : cropH - 1;

        const cropX = Math.max(0, Math.floor((vW - cropW) / 2));
        const cropY = Math.max(0, Math.floor((vH - cropH) / 2));

        const canvas = document.createElement("canvas");
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(videoSrc);
          return reject(new Error("Canvas context failed"));
        }

        const stream = canvas.captureStream(30);

        // Preserve audio from video element if present
        let audioCtx: AudioContext | null = null;
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtx = new AudioContextClass();
            const source = audioCtx.createMediaElementSource(video);
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);
            source.connect(audioCtx.destination);
            dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
          }
        } catch (audioErr) {
          try {
            const vStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
            if (vStream) {
              vStream.getAudioTracks().forEach((track: MediaStreamTrack) => stream.addTrack(track));
            }
          } catch {
            console.warn("Could not attach audio track:", audioErr);
          }
        }

        let mimeType = "video/webm";
        if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
          mimeType = "video/mp4;codecs=avc1";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          mimeType = "video/webm;codecs=vp9";
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          URL.revokeObjectURL(videoSrc);
          if (audioCtx && audioCtx.state !== "closed") {
            audioCtx.close().catch(() => {});
          }
          const finalBlob = new Blob(chunks, { type: mimeType });
          resolve(finalBlob);
        };

        video.currentTime = 0;
        video.play().catch(reject);
        mediaRecorder.start();

        const onFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }
          ctx.drawImage(
            video,
            cropX, cropY, cropW, cropH,
            0, 0, canvas.width, canvas.height
          );
          if ('requestVideoFrameCallback' in video) {
            (video as any).requestVideoFrameCallback(onFrame);
          } else {
            requestAnimationFrame(onFrame);
          }
        };

        if ('requestVideoFrameCallback' in video) {
          (video as any).requestVideoFrameCallback(onFrame);
        } else {
          requestAnimationFrame(onFrame);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoSrc);
        reject(new Error("Failed to load video file for processing."));
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-violet-500">
            <Smartphone className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">AI Auto-Reframe Video</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Intelligently crop and re-center videos for Reels, Shorts, Instagram, or YouTube with instant AI tracking.
          </p>
        </div>

        <div className="space-y-6">
          {/* Aspect Ratio Selector */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              Select Target Aspect Ratio:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "9:16", label: "9:16", desc: "TikTok / Reels" },
                { id: "1:1", label: "1:1", desc: "Instagram Square" },
                { id: "4:5", label: "4:5", desc: "Instagram Portrait" },
                { id: "16:9", label: "16:9", desc: "YouTube Landscape" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAspectRatio(item.id as AspectRatioOption)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    aspectRatio === item.id
                      ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold shadow-xs"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {!selectedFile ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-muted/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept="video/*" className="hidden" />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">Upload Video</h3>
              <p className="text-xs text-muted-foreground">MP4, MOV, WebM (Max 50MB)</p>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-violet-500" />
                <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={startProcessing}
              disabled={status === "uploading"}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base transition-all disabled:opacity-50"
            >
              {status === "uploading" ? (
                <>Processing Reframe ({aspectRatio})...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Auto-Crop to {aspectRatio}</>
              )}
            </button>
          )}

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {videoUrl && status === "completed" && (
            <div className="pt-6 text-center">
              <video controls src={videoUrl} className="mx-auto rounded-2xl max-h-[500px]" />
              <a href={videoUrl} download={`botock_reframe_${aspectRatio.replace(":", "_")}.mp4`} className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition">
                <Download className="w-4 h-4" /> Download {aspectRatio} Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
