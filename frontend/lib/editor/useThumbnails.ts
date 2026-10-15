"use client";

import { useCallback, useRef, useState } from "react";

export function useThumbnails() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationAbortRef = useRef<boolean>(false);

  const generate = useCallback(async (url: string, duration: number, count = 12): Promise<string[]> => {
    if (!url) return [];

    // If item is an image, the image itself is its thumbnail!
    if (/\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(url) || url.startsWith("data:image")) {
      return [url];
    }

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
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => resolve();
      });

      if (!video.videoWidth || !video.videoHeight) {
        setIsGenerating(false);
        return [url];
      }

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

      const waitIfPlaying = async () => {
        while (typeof window !== "undefined" && (window as any).__isEditorPlaying && !generationAbortRef.current) {
          await new Promise((r) => setTimeout(r, 120));
        }
      };

      // ── Phase 1: Generate initial batch and show them immediately ──
      const initialBatch = Math.min(INITIAL_BATCH, total);
      const initialResults: string[] = [];

      for (let i = 0; i < initialBatch; i++) {
        if (generationAbortRef.current) return initialResults;
        await waitIfPlaying();
        if (generationAbortRef.current) return initialResults;
        const frame = await captureFrame(timeAt(i));
        initialResults.push(frame);
        // Yield to browser event loop so UI / playback never drops frames
        await new Promise((r) => setTimeout(r, 30));
      }

      if (generationAbortRef.current) return initialResults;
      setThumbnails([...initialResults]);

      // ── Phase 2: Generate remaining thumbnails in background ──
      if (total > initialBatch) {
        const remaining = [...initialResults];
        for (let i = initialBatch; i < total; i++) {
          if (generationAbortRef.current) return remaining;
          await waitIfPlaying();
          if (generationAbortRef.current) return remaining;
          const frame = await captureFrame(timeAt(i));
          remaining.push(frame);
          if ((i - initialBatch + 1) % 4 === 0 || i === total - 1) {
            if (!generationAbortRef.current) {
              setThumbnails([...remaining]);
            }
          }
          // Yield to browser event loop
          await new Promise((r) => setTimeout(r, 40));
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