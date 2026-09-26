"use client";

import { useCallback, useState } from "react";
import { TextOverlay, createTextOverlay } from "./types";

export function useTextOverlays() {
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  const addOverlay = useCallback((start: number, end: number) => {
    const overlay = createTextOverlay(start, end);
    setOverlays((prev) => [...prev, overlay]);
    setSelectedOverlayId(overlay.id);
    return overlay.id;
  }, []);

  const updateOverlay = useCallback((id: string, patch: Partial<TextOverlay>) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const deleteOverlay = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    setSelectedOverlayId((cur) => (cur === id ? null : cur));
  }, []);

  const reset = useCallback(() => {
    setOverlays([]);
    setSelectedOverlayId(null);
  }, []);

  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId) || null;

  return { overlays, selectedOverlayId, setSelectedOverlayId, selectedOverlay, addOverlay, updateOverlay, deleteOverlay, reset };
}