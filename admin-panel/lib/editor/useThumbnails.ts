"use client";

import { useCallback, useRef, useState } from "react";

export function useThumbnails() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationAbortRef = useRef<boolean>(false);

  const generate = useCallback(async (url: string, duration: number, count = 12): Promise<string[]> => {
    if (!url || !duration) return [];

    // Cancel any in-progress generation
    generationAbortRef.current = true;
    await new Promise((r) => setTimeout(r, 0)); // yield to let previous run observe abort
    generationAbortRef.current = false;

    setIsGenerating(true);
    setThumbnails([]);

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
      return [];
    }

    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not load video for thumbnails."));
      });

      // Clamp total count. First batch of up to 6 is shown immediately for fast UX.
      const INITIAL_BATCH = Math.min(6, count);
      const total = Math.min(count, Math.max(INITIAL_BATCH, Math.ceil(duration / 2)));

      const captureFrame = (time: number): Promise<string> =>
        new Promise((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL("image/jpeg", 0.6));
            } catch {
              resolve("");
            }
          };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = time;
        });

      const timeAt = (i: number) =>
        total === 1 ? 0 : (i / (total - 1)) * Math.max(0, duration - 0.01);

      // ── Phase 1: Generate initial batch and show them immediately ──
      const initialBatch = Math.min(INITIAL_BATCH, total);
      const initialResults: string[] = [];

      for (let i = 0; i < initialBatch; i++) {
        if (generationAbortRef.current) return initialResults;
        const frame = await captureFrame(timeAt(i));
        initialResults.push(frame);
      }

      if (generationAbortRef.current) return initialResults;
      setThumbnails([...initialResults]);

      // ── Phase 2: Generate remaining thumbnails in background ──
      if (total > initialBatch) {
        const remaining = [...initialResults];
        for (let i = initialBatch; i < total; i++) {
          if (generationAbortRef.current) return remaining;
          const frame = await captureFrame(timeAt(i));
          remaining.push(frame);
          if ((i - initialBatch + 1) % 4 === 0 || i === total - 1) {
            if (!generationAbortRef.current) {
              setThumbnails([...remaining]);
            }
          }
        }
        return remaining;
      }
      return initialResults;
    } catch {
      setThumbnails([]);
      return [];
    } finally {
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (!generationAbortRef.current) {
        setIsGenerating(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    generationAbortRef.current = true;
    setThumbnails([]);
    setIsGenerating(false);
  }, []);

  return { thumbnails, isGenerating, generate, clear };
}