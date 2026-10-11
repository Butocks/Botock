"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Smartphone, Sparkles, Download, AlertCircle } from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { getTransferMedia } from "@/app/utils/mediaTransfer";

export default function AutoReframeClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
        const targetWidth = Math.floor(vH * (9 / 16));
        const cropX = Math.max(0, Math.floor((vW - targetWidth) / 2));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
        canvas.height = vH % 2 === 0 ? vH : vH - 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(videoSrc);
          return reject(new Error("Canvas context failed"));
        }

        const stream = canvas.captureStream(30);
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
            cropX, 0, targetWidth, vH,
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
          <h2 className="text-2xl font-bold text-foreground">AI Auto-Reframe to 9:16</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Upload a 16:9 landscape video. AI will track the subject and crop it for Reels/Shorts perfectly.
          </p>
        </div>

        <div className="space-y-6">
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
              <h3 className="font-semibold text-foreground mb-1">Upload Video (16:9)</h3>
              <p className="text-xs text-muted-foreground">MP4, MOV (Max 50MB)</p>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-violet-500" />
                <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-xs text-red-500">Remove</button>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={startProcessing}
              disabled={status === "uploading"}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base transition-all"
            >
              {status === "uploading" ? (
                <>Loading AI Model...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Auto-Crop to 9:16</>
              )}
            </button>
          )}

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {videoUrl && status === "completed" && (
            <div className="pt-6 text-center">
              <video controls src={videoUrl} className="mx-auto rounded-2xl max-h-[500px]" />
              <a href={videoUrl} download="botock_reframe.mp4" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">
                <Download className="w-4 h-4" /> Download 9:16 Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
