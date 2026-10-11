import { useState, useEffect } from 'react';
import { MediaBinItem } from './types';

// Cache to prevent re-extracting peaks for the same media file
const waveformsCache: Record<string, number[]> = {};

const NUM_PEAKS = 1000; // Generate a fixed number of peaks for the entire duration

export function useWaveforms(mediaItems: MediaBinItem[]) {
  const [waveformsBySource, setWaveformsBySource] = useState<Record<string, number[]>>({});

  useEffect(() => {
    let active = true;

    const generateWaveform = async (item: MediaBinItem) => {
      if (waveformsCache[item.id]) {
        setWaveformsBySource(prev => ({ ...prev, [item.id]: waveformsCache[item.id] }));
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
        // Fetch the object URL as an array buffer
        const response = await fetch(item.url);
        if (!response.ok) {
          waveformsCache[item.id] = [];
          return;
        }
        const arrayBuffer = await response.arrayBuffer();

        // Decode audio data
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) {
          waveformsCache[item.id] = [];
          return;
        }
        audioCtx = new AudioCtxClass();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        // We only care about the first channel for the waveform overview
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
          
          // Use the absolute max peak for this chunk
          peaks.push(Math.max(Math.abs(min), Math.abs(max)));
        }

        waveformsCache[item.id] = peaks;
        if (active) {
          setWaveformsBySource(prev => ({ ...prev, [item.id]: peaks }));
        }
      } catch {
        // Silent video (no audio track) or non-audio media: cache empty peak array to avoid retrying
        waveformsCache[item.id] = [];
      } finally {
        if (audioCtx) {
          try {
            audioCtx.close();
          } catch {}
        }
      }
    };

    mediaItems.forEach(item => {
      const isImage =
        item.file?.type?.startsWith("image/") ||
        /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(item.name || "") ||
        /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(item.url || "");

      if (isImage) {
        waveformsCache[item.id] = [];
        return;
      }

      if (!waveformsBySource[item.id] && waveformsCache[item.id] === undefined) {
        generateWaveform(item);
      }
    });

    return () => {
      active = false;
    };
  }, [mediaItems]);

  return waveformsBySource;
}
