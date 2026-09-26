"use client";

import { useCallback, useState } from "react";

export function useThumbnails() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (url: string, duration: number, count = 48) => {
    if (!url || !duration) return;
    setIsGenerating(true);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not load video for thumbnails."));
      });

      const total = Math.min(count, Math.max(8, Math.ceil(duration / 2)));
      const generated: string[] = [];

      for (let i = 0; i < total; i++) {
        const time = total === 1 ? 0 : (i / (total - 1)) * Math.max(0, duration - 0.01);
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = time;
        });

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          generated.push(canvas.toDataURL("image/jpeg", 0.6));
        } catch {
          generated.push("");
        }
      }

      setThumbnails(generated);
    } catch {
      setThumbnails([]);
    } finally {
      video.pause();
      video.removeAttribute("src");
      video.load();
      setIsGenerating(false);
    }
  }, []);

  const clear = useCallback(() => setThumbnails([]), []);

  return { thumbnails, isGenerating, generate, clear };
}