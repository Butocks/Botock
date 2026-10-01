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
      
      try {
        // Fetch the object URL as an array buffer
        const response = await fetch(item.url);
        const arrayBuffer = await response.arrayBuffer();

        // Decode audio data
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      } catch (err) {
        console.error("Failed to generate waveform for", item.name, err);
      }
    };

    mediaItems.forEach(item => {
      // Generate waveforms for both explicit audio files and video files (which might have audio)
      // Since video files can be large, we might want to check the type, but for a web editor 
      // we usually want to see audio waveforms on video clips too!
      if (!waveformsBySource[item.id]) {
        generateWaveform(item);
      }
    });

    return () => {
      active = false;
    };
  }, [mediaItems]);

  return waveformsBySource;
}
