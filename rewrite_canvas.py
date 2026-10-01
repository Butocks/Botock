import re

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

# 1. Update the Pool ref styles to force hardware acceleration (z-index -10, opacity 0.01)
# 2. Rewrite the render loop to remove forced syncing during playback.

new_component = """import React, { useEffect, useRef } from "react";
import { EditorProject, MediaBinItem, TimelineClip } from "@/lib/editor/types";

interface Props {
  project: EditorProject;
  mediaItems: MediaBinItem[];
  currentTime: number;
  isPlaying: boolean;
  minWidth?: number;
}

export default function PreviewCanvas({ project, mediaItems, currentTime, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const mediaPool = useRef<Record<string, HTMLVideoElement | HTMLImageElement>>({});

  // 1. Maintain media pool per clip (Attached to DOM for hardware acceleration)
  useEffect(() => {
    const requiredClips = new Set<string>();

    project.tracks.forEach(t => t.clips.forEach(c => {
       if (c.type === "video" || c.type === "image") requiredClips.add(c.id);
    }));

    // Cleanup unused
    Object.keys(mediaPool.current).forEach(clipId => {
       if (!requiredClips.has(clipId)) {
          const el = mediaPool.current[clipId];
          if (el instanceof HTMLVideoElement) {
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
       if ((c.type === "video" || c.type === "image") && !mediaPool.current[c.id]) {
          const mediaItem = mediaItems.find(m => m.id === c.sourceId);
          if (mediaItem) {
             if (c.type === "video") {
                const v = document.createElement("video");
                v.src = mediaItem.url;
                v.crossOrigin = "anonymous";
                v.playsInline = true;
                v.preload = "auto";
                v.muted = true; // Muted by default to prevent audio overlap during video preview
                // Essential styles to keep hardware decoding active but hidden from user view
                v.style.position = "absolute";
                v.style.width = "10px";
                v.style.height = "10px";
                v.style.opacity = "0.01";
                v.style.pointerEvents = "none";
                v.style.zIndex = "-10";

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
        if (track.hidden || track.type === "audio") return;

        track.clips.forEach(clip => {
          const isActiveClip = currT >= clip.timelineStart && currT < clip.timelineStart + clip.duration;
          const el = mediaPool.current[clip.id];

          if (!el) return;

          if (isActiveClip) {
            const elapsed = currT - clip.timelineStart;
            const sourceTime = clip.sourceStart + (elapsed * clip.speed);

            if (el instanceof HTMLVideoElement) {
               el.playbackRate = clip.speed || 1;

               if (playing) {
                  // NATIVE PLAYBACK: Let the browser handle the frames.
                  // No forced seeking unless severely drifted (> 1.0s) to prevent stutter.
                  if (Math.abs(el.currentTime - sourceTime) > 1.0) {
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
            const t = clip.transform || { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
            const pxX = (t.x / 100) * canvas.width;
            const pxY = (t.y / 100) * canvas.height;

            const intrinsicW = el instanceof HTMLVideoElement ? el.videoWidth : el.width;
            const intrinsicH = el instanceof HTMLVideoElement ? el.videoHeight : el.height;

            if (intrinsicW > 0 && intrinsicH > 0) {
                const scaleFit = Math.min(canvas.width / intrinsicW, canvas.height / intrinsicH);
                const baseW = intrinsicW * scaleFit;
                const baseH = intrinsicH * scaleFit;

                const finalW = baseW * (t.width / 100) * t.scaleX;
                const finalH = baseH * (t.height / 100) * t.scaleY;

                ctx.translate(pxX, pxY);
                ctx.rotate((t.rotation * Math.PI) / 180);
                ctx.globalAlpha = t.opacity / 100;

                try {
                   ctx.drawImage(el, -finalW / 2, -finalH / 2, finalW, finalH);
                } catch(e) {
                   // Ignore drawImage errors during rapid seek
                }
            }
            ctx.restore();
          } else {
            // Clip is not active (out of bounds)
            if (el instanceof HTMLVideoElement && !el.paused) {
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
"""

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(new_component)
