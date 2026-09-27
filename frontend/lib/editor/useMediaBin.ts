"use client";

import { useCallback, useState } from "react";
import { MediaBinItem } from "./types";

function readVideoMeta(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve({ duration: 0, width: 1280, height: 720 });
    video.src = URL.createObjectURL(file);
  });
}

export function useMediaBin() {
  const [items, setItems] = useState<MediaBinItem[]>([]);

  const addFile = useCallback(async (file: File): Promise<MediaBinItem> => {
    const meta = await readVideoMeta(file);
    const item: MediaBinItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      duration: meta.duration,
      width: meta.width,
      height: meta.height,
    };
    setItems((prev) => [...prev, item]);
    return item;
  }, []);

  const getItem = useCallback((id: string) => items.find((i) => i.id === id) || null, [items]);

  const reset = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.url));
      return [];
    });
  }, []);

  return { items, addFile, getItem, reset };
}
