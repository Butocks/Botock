"use client";

import { useCallback, useState } from "react";
import { AudioTrack, AudioTrackKind, createAudioTrack } from "./types";

export function useAudioTracks() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const addTrack = useCallback(
    (params: { kind: AudioTrackKind; label: string; file: File; sourceUrl: string; sourceDuration: number; timelineStart: number; peaks: number[] }) => {
      const track = { ...createAudioTrack(params), peaks: params.peaks };
      setTracks((prev) => [...prev, track]);
      setSelectedTrackId(track.id);
      return track.id;
    },
    []
  );

  const updateTrack = useCallback((id: string, patch: Partial<AudioTrack>) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTrack = useCallback((id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTrackId((cur) => (cur === id ? null : cur));
  }, []);

  const reset = useCallback(() => {
    setTracks([]);
    setSelectedTrackId(null);
  }, []);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || null;

  return { tracks, selectedTrackId, setSelectedTrackId, selectedTrack, addTrack, updateTrack, deleteTrack, reset };
}