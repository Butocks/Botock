import React, { useEffect, useRef } from "react";
import { EditorProject, MediaBinItem, TimelineClip } from "@/lib/editor/types";

interface Props {
  project: EditorProject;
  mediaItems: MediaBinItem[];
  currentTime: number;
  isPlaying: boolean;
  minWidth?: number;
}

declare global {
  interface Window {
    chromaCanvas?: HTMLCanvasElement;
    chromaCtx?: CanvasRenderingContext2D;
  }
}

if (typeof window !== "undefined" && !window.chromaCanvas) {
  window.chromaCanvas = document.createElement("canvas");
  window.chromaCtx = window.chromaCanvas.getContext("2d", { willReadFrequently: true }) || undefined;
}

export default function PreviewCanvas({ project, mediaItems, currentTime, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const mediaPool = useRef<Record<string, HTMLVideoElement | HTMLImageElement | HTMLAudioElement>>({});

  // 1. Maintain media pool per clip (Attached to DOM for hardware acceleration)
  useEffect(() => {
    const requiredClips = new Set<string>();
    
    project.tracks.forEach(t => t.clips.forEach(c => {
       if (c.type === "video" || c.type === "image" || c.type === "audio") requiredClips.add(c.id);
    }));

    // Cleanup unused
    Object.keys(mediaPool.current).forEach(clipId => {
       if (!requiredClips.has(clipId)) {
          const el = mediaPool.current[clipId];
          if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {
             el.pause();
             el.removeAttribute("src");
             el.load();
          }
          if (el.parentNode) el.parentNode.removeChild(el);
          delete mediaPool.current[clipId];
       }
    });

    // Create newly needed
    project.tracks.forEach(t => t.clips.forEach(c => {
       if ((c.type === "video" || c.type === "image" || c.type === "audio") && !mediaPool.current[c.id]) {
          const mediaItem = mediaItems.find(m => m.id === c.sourceId);
          if (mediaItem) {
             if (c.type === "audio") {
                const a = document.createElement("audio");
                a.src = mediaItem.url;
                a.crossOrigin = "anonymous";
                a.preload = "auto";
                mediaPool.current[c.id] = a;
                if (poolRef.current) poolRef.current.appendChild(a);
                a.load();
             } else if (c.type === "video") {
                const v = document.createElement("video");
                v.src = mediaItem.url;
                v.crossOrigin = "anonymous";
                v.playsInline = true;
                v.preload = "auto";
                v.muted = true; // Muted by default to prevent audio overlap during video preview
                // Essential styles to keep hardware decoding active but hidden from user view
                // Make video fully sized and opaque so Chrome does NOT suspend it.
                // It will be hidden behind the z-10 Canvas.
                v.style.position = "absolute";
                v.style.top = "0";
                v.style.left = "0";
                v.style.width = "100%";
                v.style.height = "100%";
                v.style.opacity = "1";
                v.style.pointerEvents = "none";

                mediaPool.current[c.id] = v;
                if (poolRef.current) poolRef.current.appendChild(v);
                v.load();
             } else if (c.type === "image") {
                const img = new Image();
                img.src = mediaItem.url;
                img.crossOrigin = "anonymous";
                mediaPool.current[c.id] = img;
             }
          }
       }
    }));
  }, [project, mediaItems]);

  // 2. Render Loop (Buttery smooth 60fps, no micro-stuttering)
  const currentTimeRef = useRef(currentTime);
  const isPlayingRef = useRef(isPlaying);
  
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => {
    const handleTimeUpdate = (e: any) => { currentTimeRef.current = e.detail; };
    window.addEventListener('editor-time-update', handleTimeUpdate);
    return () => window.removeEventListener('editor-time-update', handleTimeUpdate);
  }, []);
  
  useEffect(() => {
    const handleTime = (e: any) => { currentTimeRef.current = e.detail; };
    window.addEventListener('editor-time-update', handleTime);
    return () => window.removeEventListener('editor-time-update', handleTime);
  }, []);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    let raf: number;
    let isActive = true;

    const render = () => {
      if (!isActive) return;
      
      const canvas = canvasRef.current;
      if (!canvas) {
         raf = requestAnimationFrame(render);
         return;
      }
      
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      if (!ctx) {
         raf = requestAnimationFrame(render);
         return;
      }

      const currT = currentTimeRef.current;
      const playing = isPlayingRef.current;

      // Clear background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sortedTracks = [...project.tracks].reverse();
      
      sortedTracks.forEach(track => {
        if (track.hidden) return;

        track.clips.forEach(clip => {
          const isActiveClip = currT >= clip.timelineStart && currT < clip.timelineStart + clip.duration;
          const el = mediaPool.current[clip.id];
          
          if (!el && clip.type !== "text") return;

          if (isActiveClip) {
            const elapsed = currT - clip.timelineStart;
            const sourceTime = clip.sourceStart + (elapsed * clip.speed);

            if (el && (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement)) {
               el.playbackRate = clip.speed || 1;
               
               const isMuted = clip.audio?.muted ?? false;
               const baseVolume = clip.audio?.volumePercent ?? 100;
               const fadeIn = clip.audio?.fadeInSeconds ?? 0;
               const fadeOut = clip.audio?.fadeOutSeconds ?? 0;
               
               let currentVolume = baseVolume / 100;
               
               if (fadeIn > 0 && elapsed < fadeIn) {
                   currentVolume = currentVolume * (elapsed / fadeIn);
               }
               if (fadeOut > 0 && elapsed > clip.duration - fadeOut) {
                   currentVolume = currentVolume * (1 - (elapsed - (clip.duration - fadeOut)) / fadeOut);
               }
               
               el.muted = isMuted;
               el.volume = isMuted ? 0 : Math.min(1, Math.max(0, currentVolume));
               
               if (playing) {
                  // If video is not advancing naturally (e.g. browser suspended it), force it.
                  // We check if it's drifting by > 0.1s. If it is, we force it. 
                  // Wait, if we force it > 0.1s, we get micro-stuttering.
                  // Let's use 0.15s. If it's truly suspended, it will stutter but at least play.
                  if (Math.abs(el.currentTime - sourceTime) > 0.15) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
                  if (el.paused) el.play().catch(()=>{});
               } else {
                  // SCRUBBING/PAUSED: Exact frame accuracy required.
                  if (!el.paused) el.pause();
                  if (Math.abs(el.currentTime - sourceTime) > 0.05) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
               }
            }

            // Draw to Canvas
            ctx.save();
            const t = clip.transform ? { ...clip.transform } : { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
            const crop = clip.crop || { x: 0, y: 0, width: 1, height: 1 };
            const f = clip.filters || { brightness: 0, contrast: 1, saturation: 1 };
            
            let animScale = 1;
            let animPanX = 0;
            if (clip.effects && clip.effects.length > 0) {
               const effect = clip.effects[0];
               const eff = effect.type;
               const dur = effect.duration || 1.0;
               const progress = Math.min(1, Math.max(0, elapsed / dur));
               
               if (eff === "zoom-in") animScale = 1 + (0.5 * progress);
               if (eff === "zoom-out") animScale = 1.5 - (0.5 * progress);
               if (eff === "pan-left") animPanX = (canvas.width * 0.1) * progress;
               if (eff === "pan-right") animPanX = -(canvas.width * 0.1) * progress;
               
               let effectOpacity = 1;
               if (eff === "fade-in") effectOpacity = Math.min(1, Math.max(0, elapsed / dur));
               if (eff === "fade-out") {
                  const out_start = Math.max(0, clip.duration - dur);
                  effectOpacity = Math.max(0, Math.min(1, 1 - (elapsed - out_start) / dur));
               }
               t.opacity = t.opacity * effectOpacity;
            }

            const pxX = (t.x / 100) * canvas.width + animPanX;
            const pxY = (t.y / 100) * canvas.height;
            
            const intrinsicW = el instanceof HTMLVideoElement ? el.videoWidth : (el instanceof HTMLImageElement ? el.width : 0);
            const intrinsicH = el instanceof HTMLVideoElement ? el.videoHeight : (el instanceof HTMLImageElement ? el.height : 0);
            
            if (clip.type === "text" && clip.text) {
                ctx.translate(pxX, pxY);
                ctx.rotate((t.rotation * Math.PI) / 180);
                ctx.scale(animScale, animScale);
                ctx.globalAlpha = t.opacity / 100;
                ctx.font = `bold ${clip.fontSizePercent || 50}px sans-serif`;
                ctx.fillStyle = clip.color || "#ffffff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                
                // Add some basic shadow for visibility
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                ctx.fillText(clip.text, 0, 0);
                
                ctx.shadowColor = "transparent"; // reset
            } else if (intrinsicW > 0 && intrinsicH > 0) {
                const scaleFit = Math.min(canvas.width / intrinsicW, canvas.height / intrinsicH);
                const baseW = intrinsicW * scaleFit;
                const baseH = intrinsicH * scaleFit;
                
                const finalW = baseW * (t.width / 100) * t.scaleX * crop.width;
                const finalH = baseH * (t.height / 100) * t.scaleY * crop.height;

                ctx.translate(pxX, pxY);
                ctx.rotate((t.rotation * Math.PI) / 180);
                ctx.scale(animScale, animScale);
                ctx.globalAlpha = t.opacity / 100;
                
                // Apply Filters
                const b = Math.round(100 + f.brightness * 100);
                const c = Math.round(f.contrast * 100);
                const s = Math.round(f.saturation * 100);
                ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
                
                try {
                   if (!(el instanceof HTMLAudioElement)) {
                       const sx = intrinsicW * crop.x;
                       const sy = intrinsicH * crop.y;
                       const sw = intrinsicW * crop.width;
                       const sh = intrinsicH * crop.height;
                       
                       if (clip.chromaKey && clip.chromaKey.enabled && window.chromaCtx) {
                           const cc = window.chromaCanvas!;
                           const cCtx = window.chromaCtx!;
                           // Limit resolution for performance if needed, but finalW/finalH is usually ok
                           cc.width = finalW;
                           cc.height = finalH;
                           cCtx.clearRect(0, 0, finalW, finalH);
                           cCtx.drawImage(el as any, sx, sy, sw, sh, 0, 0, finalW, finalH);
                           
                           // Apply Chroma Key
                           if (finalW > 0 && finalH > 0) {
                              const frame = cCtx.getImageData(0, 0, finalW, finalH);
                              const data = frame.data;
                              const hex = clip.chromaKey.color;
                              const targetR = parseInt(hex.slice(1,3), 16) || 0;
                              const targetG = parseInt(hex.slice(3,5), 16) || 255;
                              const targetB = parseInt(hex.slice(5,7), 16) || 0;
                              
                              const sim = (clip.chromaKey.similarity || 0.3) * 255;
                              const blnd = (clip.chromaKey.blend || 0.1) * 255;

                              for (let i = 0; i < data.length; i += 4) {
                                const r = data[i];
                                const g = data[i + 1];
                                const blue = data[i + 2];
                                
                                const diff = Math.sqrt((r - targetR)**2 + (g - targetG)**2 + (blue - targetB)**2);
                                
                                if (diff < sim) {
                                  data[i + 3] = 0;
                                } else if (blnd > 0 && diff < sim + blnd) {
                                  const alpha = (diff - sim) / blnd;
                                  data[i + 3] = data[i + 3] * alpha;
                                }
                              }
                              cCtx.putImageData(frame, 0, 0);
                           }
                           
                           ctx.drawImage(cc, -finalW / 2, -finalH / 2, finalW, finalH);
                       } else {
                           ctx.drawImage(el as any, sx, sy, sw, sh, -finalW / 2, -finalH / 2, finalW, finalH);
                       }
                   }
                } catch(e) {
                   // Ignore drawImage errors during rapid seek
                }
                ctx.filter = "none"; // reset
            }
            ctx.restore();
          } else {
            // Clip is not active (out of bounds)
            if (el && (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) && !el.paused) {
               el.pause();
            }
          }
        });
      });

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      isActive = false;
      cancelAnimationFrame(raf);
    };
  }, [project]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {/* 
        The Hidden Video Pool. 
        Critical for Hardware Acceleration: Videos must be in DOM and visually present 
        (opacity 0.01) so Chrome doesn't throttle their decoding to 1 FPS. 
      */}
      <div ref={poolRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden" />
      
      {/* The visible Canvas */}
      <canvas
        ref={canvasRef}
        width={project.width}
        height={project.height}
        className="relative z-10 max-w-full max-h-full shadow-2xl ring-1 ring-white/10 bg-black"
        style={{
          aspectRatio: `${project.width} / ${project.height}`,
          objectFit: "contain"
        }}
      />
    </div>
  );
}
