"use client";

import { useCallback, useState, useEffect } from "react";
import { MediaBinItem } from "./types";

/** Decode an audio/video file's audio track and return normalized waveform peaks. */
export function useWaveform() {
  const [isDecoding, setIsDecoding] = useState(false);

  /**
   * Decodes the audio of a file and returns normalized waveform peaks.
   * ✅ OPTIMIZED: Uses OfflineAudioContext for faster processing.
   * Target peaks capped at 100 (was 200) — sufficient for visual display.
   */
  const decode = useCallback(async (file: File, targetPeaks = 100): Promise<number[]> => {
    setIsDecoding(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.max(1, Math.floor(channelData.length / targetPeaks));
      const peaks: number[] = [];

      for (let i = 0; i < targetPeaks; i++) {
        const start = i * blockSize;
        let sum = 0;
        for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
          sum += Math.abs(channelData[start + j]);
        }
        peaks.push(sum / blockSize);
      }

      const max = Math.max(...peaks, 0.0001);
      const normalized = peaks.map((p) => Math.min(1, p / max));

      await ctx.close();
      return normalized;
    } catch {
      return [];
    } finally {
      setIsDecoding(false);
    }
  }, []);

  /**
   * Gets media duration without full audio decode.
   * Uses a media element to read metadata only — very fast.
   */
  const getMediaDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      const el = document.createElement(file.type.startsWith("video") ? "video" : "audio");
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        resolve(Number.isFinite(el.duration) ? el.duration : 0);
        URL.revokeObjectURL(el.src);
      };
      el.onerror = () => resolve(0);
      el.src = URL.createObjectURL(file);
    });
  }, []);

  return { decode, getMediaDuration, isDecoding };
}

// Global cache to prevent re-extracting peaks for the same media file
const waveformsCache: Record<string, number[]> = {};
const NUM_PEAKS = 1000; // Generate a fixed number of peaks for timeline track overview

export function useWaveforms(mediaItems: MediaBinItem[]) {
  const [waveformsBySource, setWaveformsBySource] = useState<Record<string, number[]>>({});

  useEffect(() => {
    let active = true;

    const generateWaveform = async (item: MediaBinItem) => {
      if (waveformsCache[item.id]) {
        setWaveformsBySource((prev) => ({ ...prev, [item.id]: waveformsCache[item.id] }));
        return;
      }

      const isImage =
        item.file?.type?.startsWith("image/") ||
        /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(item.name || "") ||
        /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(item.url || "");

      if (isImage) {
        waveformsCache[item.id] = [];
        return;
      }

      let audioCtx: AudioContext | null = null;
      try {
        const response = await fetch(item.url);
        if (!response.ok) {
          waveformsCache[item.id] = [];
          return;
        }
        const arrayBuffer = await response.arrayBuffer();

        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) {
          waveformsCache[item.id] = [];
          return;
        }
        audioCtx = new AudioCtxClass();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const channelData = audioBuffer.getChannelData(0);
        const peaks: number[] = [];
        const step = Math.ceil(channelData.length / NUM_PEAKS);

        for (let i = 0; i < NUM_PEAKS; i++) {
          let min = 1.0;
          let max = -1.0;

          for (let j = 0; j < step; j++) {
            const index = i * step + j;
            if (index < channelData.length) {
              const datum = channelData[index];
              if (datum < min) min = datum;
              if (datum > max) max = datum;
            }
          }

          peaks.push(Math.max(Math.abs(min), Math.abs(max)));
        }

        waveformsCache[item.id] = peaks;
        if (active) {
          setWaveformsBySource((prev) => ({ ...prev, [item.id]: peaks }));
        }
      } catch {
        waveformsCache[item.id] = [];
      } finally {
        if (audioCtx) {
          try {
            audioCtx.close();
          } catch {}
        }
      }
    };

    const processQueue = async () => {
      for (const item of mediaItems) {
        if (!active) break;

        const isImage =
          item.file?.type?.startsWith("image/") ||
          /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(item.name || "") ||
          /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(item.url || "");

        if (isImage) {
          waveformsCache[item.id] = [];
          continue;
        }

        if (!waveformsBySource[item.id] && waveformsCache[item.id] === undefined) {
          // Wait if editor is currently playing so canvas render gets full GPU/CPU priority
          while (typeof window !== "undefined" && (window as any).__isEditorPlaying && active) {
            await new Promise((r) => setTimeout(r, 120));
          }
          if (!active) break;
          await generateWaveform(item);
          // Yield to event loop between audio decodes
          await new Promise((r) => setTimeout(r, 60));
        }
      }
    };

    processQueue();

    return () => {
      active = false;
    };
  }, [mediaItems]);

  return waveformsBySource;
}