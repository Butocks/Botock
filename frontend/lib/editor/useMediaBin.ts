"use client";

import { useCallback, useState } from "react";
import { MediaBinItem } from "./types";

function readVideoMeta(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
         resolve({ duration: 5, width: img.width, height: img.height }); // default 5s duration for images
         URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ duration: 5, width: 1280, height: 720 });
      img.src = URL.createObjectURL(file);
      return;
    }

    const media = document.createElement(file.type.startsWith("audio/") ? "audio" : "video");
    media.preload = "metadata";
    media.onloadedmetadata = () => {
      resolve({
        duration: Number.isFinite(media.duration) ? media.duration : 0,
        width: (media as HTMLVideoElement).videoWidth || 1280,
        height: (media as HTMLVideoElement).videoHeight || 720,
      });
      URL.revokeObjectURL(media.src);
    };
    media.onerror = () => resolve({ duration: 0, width: 1280, height: 720 });
    media.src = URL.createObjectURL(file);
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
