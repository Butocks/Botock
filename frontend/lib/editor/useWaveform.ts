"use client";

import { useCallback, useState } from "react";

/** Decode an audio/video file's audio track and return normalized waveform peaks. */
export function useWaveform() {
  const [isDecoding, setIsDecoding] = useState(false);

  const decode = useCallback(async (file: File, targetPeaks = 200): Promise<number[]> => {
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