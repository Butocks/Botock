"use client";

import { useCallback, useState } from "react";
import { ImageOverlay, createImageOverlay } from "./types";

export function useImageOverlays() {
  const [overlays, setOverlays] = useState<ImageOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  const addOverlay = useCallback((file: File, start: number, end: number) => {
    const url = URL.createObjectURL(file);
    const overlay = createImageOverlay(file, url, start, end);
    setOverlays((prev) => [...prev, overlay]);
    setSelectedOverlayId(overlay.id);
    return overlay.id;
  }, []);

  const updateOverlay = useCallback((id: string, patch: Partial<ImageOverlay>) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const deleteOverlay = useCallback((id: string) => {
    setOverlays((prev) => {
      const target = prev.find((o) => o.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((o) => o.id !== id);
    });
    setSelectedOverlayId((cur) => (cur === id ? null : cur));
  }, []);

  const reset = useCallback(() => {
    setOverlays((prev) => {
      prev.forEach((o) => URL.revokeObjectURL(o.url));
      return [];
    });
    setSelectedOverlayId(null);
  }, []);

  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId) || null;

  return { overlays, selectedOverlayId, setSelectedOverlayId, selectedOverlay, addOverlay, updateOverlay, deleteOverlay, reset };
}
