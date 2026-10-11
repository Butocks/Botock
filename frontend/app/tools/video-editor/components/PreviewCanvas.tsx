import React, { useEffect, useRef, useState } from "react";
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
  const [isBuffering, setIsBuffering] = useState(false);
  const lastBufferingRef = useRef(false);

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
                if (!mediaItem.url.startsWith("blob:")) {
                  a.crossOrigin = "anonymous";
                }
                a.preload = "auto";
                mediaPool.current[c.id] = a;
                if (poolRef.current) poolRef.current.appendChild(a);
                a.load();
             } else if (c.type === "video") {
                const v = document.createElement("video");
                v.src = mediaItem.url;
                if (!mediaItem.url.startsWith("blob:")) {
                  v.crossOrigin = "anonymous";
                }
                v.playsInline = true;
                v.setAttribute("playsinline", "true");
                v.setAttribute("webkit-playsinline", "true");
                v.preload = "auto";
                v.muted = false;
                // Essential styles to keep hardware decoding active but offscreen and hidden
                v.style.position = "absolute";
                v.style.top = "0";
                v.style.left = "0";
                v.style.width = "1px";
                v.style.height = "1px";
                v.style.opacity = "0";
                v.style.pointerEvents = "none";

                mediaPool.current[c.id] = v;
                if (poolRef.current) poolRef.current.appendChild(v);
                v.load();
             } else if (c.type === "image") {
                const img = new Image();
                img.src = mediaItem.url;
                if (!mediaItem.url.startsWith("blob:") && !mediaItem.url.startsWith("data:")) {
                  img.crossOrigin = "anonymous";
                }
                img.style.position = "absolute";
                img.style.top = "0";
                img.style.left = "0";
                img.style.width = "1px";
                img.style.height = "1px";
                img.style.opacity = "0";
                img.style.pointerEvents = "none";
                mediaPool.current[c.id] = img;
                if (poolRef.current) poolRef.current.appendChild(img);
             }
          }
       }
    }));

    // Cleanup removed clips from media pool
    const currentClipIds = new Set<string>();
    project.tracks.forEach((t) => t.clips.forEach((c) => currentClipIds.add(c.id)));
    Object.keys(mediaPool.current).forEach((id) => {
      if (!currentClipIds.has(id)) {
        const el = mediaPool.current[id];
        if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {
          try {
            el.pause();
            el.src = "";
            el.remove();
          } catch (e) {}
        } else if (el instanceof HTMLImageElement) {
          try {
            el.src = "";
            el.remove();
          } catch (e) {}
        }
        delete mediaPool.current[id];
      }
    });
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
    isPlayingRef.current = isPlaying;
    if (!isPlaying) {
      Object.values(mediaPool.current).forEach((el) => {
        if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {
          if (!el.paused) el.pause();
        }
      });
    }
  }, [isPlaying]);

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
      
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
         raf = requestAnimationFrame(render);
         return;
      }

      const currT = currentTimeRef.current;
      const playing = isPlayingRef.current;

      // Clear entire canvas to ensure no ghost / previous frames persist
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = project.backgroundColor || "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const activeVisualClips: { track: typeof project.tracks[0]; clip: TimelineClip; el: any }[] = [];
      const activeTextClips: { track: typeof project.tracks[0]; clip: TimelineClip }[] = [];
      const activeEffectClips: TimelineClip[] = [];
      let anyBuffering = false;

      // Pass 1: Sync media pool elements and collect active clips
      project.tracks.forEach((track) => {
        if (track.hidden) return;

        track.clips.forEach((clip) => {
          const isActiveClip = currT >= clip.timelineStart && currT < clip.timelineStart + clip.duration;
          const el = mediaPool.current[clip.id];

          if (isActiveClip) {
            const elapsed = currT - clip.timelineStart;
            const sourceTime = clip.sourceStart + elapsed * clip.speed;

            if (el && (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement)) {
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
                // Real stall detection: only buffer when video is ACTUALLY stalled/waiting for data
                if (el instanceof HTMLVideoElement) {
                  const now = performance.now();
                  const vTrack = el as any;
                  if (vTrack._lastPlayPos === undefined) {
                    vTrack._lastPlayPos = el.currentTime;
                    vTrack._lastCheckTime = now;
                  }

                  // If video current time is progressing forward, it's NOT buffering!
                  if (Math.abs(el.currentTime - vTrack._lastPlayPos) > 0.005) {
                    vTrack._lastPlayPos = el.currentTime;
                    vTrack._lastCheckTime = now;
                  } else {
                    // Video time has not progressed. Check how long it has been stuck:
                    const stalledMs = now - (vTrack._lastCheckTime || now);
                    // Only trigger buffering if stuck for more than 350ms or readyState is 0/1 (no frame data)
                    if ((stalledMs > 350 && !el.paused) || (el.readyState < 2 && stalledMs > 200)) {
                      anyBuffering = true;
                    }
                  }
                }

                if (el.paused) {
                  // Media needs to start playing!
                  // Seek to initial playhead position only if needed and not already seeking
                  if (!el.seeking && Math.abs(el.currentTime - sourceTime) > 0.08) {
                    try { el.currentTime = sourceTime; } catch (e) {}
                  }
                  el.playbackRate = clip.speed || 1;
                  const playPromise = el.play();
                  if (playPromise !== undefined) {
                    playPromise.catch(() => {
                      // Fallback for browser autoplay policy: mute and play
                      el.muted = true;
                      el.play().catch(() => {});
                    });
                  }
                } else {
                  // Media is actively PLAYING forward!
                  // CRITICAL: DO NOT call el.currentTime = sourceTime every frame!
                  // Constant seeking interrupts video decoding pipeline and causes single-frame freezing!
                  const drift = el.currentTime - sourceTime;

                  if (Math.abs(drift) > 0.6 && !el.seeking) {
                    // Big jump (user scrubbed/jumped far): perform single seek
                    try { el.currentTime = sourceTime; } catch (e) {}
                    el.playbackRate = clip.speed || 1;
                  } else if (Math.abs(drift) > 0.05 && Math.abs(drift) <= 0.6) {
                    // Soft sync: smoothly adjust playback speed to catch up or slow down without interrupting playback
                    const correction = drift < 0 ? 1.05 : 0.95;
                    el.playbackRate = (clip.speed || 1) * correction;
                  } else {
                    el.playbackRate = clip.speed || 1;
                  }
                }
              } else {
                // PAUSED state: ensure media is paused and cleanly seek to current playhead
                const vTrack = el as any;
                vTrack._lastCheckTime = undefined;
                vTrack._lastPlayPos = undefined;
                if (!el.paused) el.pause();
                if (!el.seeking && Math.abs(el.currentTime - sourceTime) > 0.03) {
                  try { el.currentTime = sourceTime; } catch (e) {}
                }
              }
            }

            if (clip.type === "video" || clip.type === "image") {
              if (el) activeVisualClips.push({ track, clip, el });
            } else if (clip.type === "text") {
              activeTextClips.push({ track, clip });
            } else if (clip.type === "effect" || track.type === "effect") {
              activeEffectClips.push(clip);
            }
          } else {
            // Clip is not active (out of bounds)
            if (el && (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) && !el.paused) {
              el.pause();
            }
          }
        });
      });

      // Synchronize buffering status with editor timeline clock
      if (playing) {
        if (lastBufferingRef.current !== anyBuffering) {
          lastBufferingRef.current = anyBuffering;
          setIsBuffering(anyBuffering);
          window.dispatchEvent(new CustomEvent("editor-buffering-state", { detail: anyBuffering }));
        }
      } else {
        if (lastBufferingRef.current) {
          lastBufferingRef.current = false;
          setIsBuffering(false);
          window.dispatchEvent(new CustomEvent("editor-buffering-state", { detail: false }));
        }
      }

      // Pass 2: Draw all Visual Media (Videos & Images)
      // Ensure base video track (V1) draws in background, and overlays (V2, PIP, etc.) draw on top
      const getTrackZ = (name: string) => {
        if (name === "V1") return 0;
        if (name === "V2") return 1;
        if (name === "V3") return 2;
        if (name.toUpperCase().includes("PIP")) return 3;
        return 1;
      };
      activeVisualClips.sort((a, b) => getTrackZ(a.track.name) - getTrackZ(b.track.name));

      let whiteFlashOpacity = 0;
      let drawSpeedLines = false;

      activeVisualClips.forEach(({ clip, el }) => {
        ctx.save();
        const elapsed = currT - clip.timelineStart;
        const t = clip.transform ? { ...clip.transform } : { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
        const crop = clip.crop || { x: 0, y: 0, width: 1, height: 1 };
        const f = clip.filters || { brightness: 0, contrast: 1, saturation: 1 };

        let animScale = 1;
        let animPanX = 0;
        let animPanY = 0;
        let animRotation = 0;
        let isMirrored = false;
        let blurPx = 0;

        // Clip Transitions: Transition-In & Transition-Out
        const inDur = Math.min(clip.duration / 2, clip.transitionInDuration || 0.6);
        const outDur = Math.min(clip.duration / 2, clip.transitionOutDuration || 0.6);

        if (clip.transitionIn && clip.transitionIn !== "none" && elapsed < inDur) {
          const p = Math.min(1, Math.max(0, elapsed / Math.max(0.001, inDur)));
          const smoothP = p * p * (3 - 2 * p);
          switch (clip.transitionIn) {
            case "fade":
            case "dip-black":
              t.opacity *= smoothP;
              break;
            case "dip-white":
              whiteFlashOpacity = Math.max(whiteFlashOpacity, 1 - smoothP);
              break;
            case "slide-left":
              animPanX += (1 - smoothP) * canvas.width * 0.9;
              t.opacity *= (0.2 + 0.8 * smoothP);
              break;
            case "slide-right":
              animPanX -= (1 - smoothP) * canvas.width * 0.9;
              t.opacity *= (0.2 + 0.8 * smoothP);
              break;
            case "zoom-in":
              animScale *= (0.35 + 0.65 * smoothP);
              t.opacity *= smoothP;
              break;
            case "zoom-out":
              animScale *= (1.65 - 0.65 * smoothP);
              t.opacity *= smoothP;
              break;
            case "wipeleft":
              animPanX += (1 - smoothP) * canvas.width * 0.8;
              t.opacity *= smoothP;
              break;
            case "wiperight":
              animPanX -= (1 - smoothP) * canvas.width * 0.8;
              t.opacity *= smoothP;
              break;
            case "mirror":
              isMirrored = smoothP < 0.5;
              animScale *= (0.5 + 0.5 * smoothP);
              t.opacity *= smoothP;
              break;
            case "bounce": {
              const bounceP = Math.sin(smoothP * Math.PI * 1.5);
              animScale *= Math.max(0.1, 0.4 + 0.6 * bounceP);
              t.opacity *= smoothP;
              break;
            }
            case "curtain":
              animScale *= (0.2 + 0.8 * smoothP);
              t.opacity *= smoothP;
              break;
          }
        }

        if (clip.transitionOut && clip.transitionOut !== "none" && elapsed > clip.duration - outDur) {
          const p = Math.min(1, Math.max(0, (elapsed - (clip.duration - outDur)) / Math.max(0.001, outDur)));
          const smoothP = p * p * (3 - 2 * p);
          switch (clip.transitionOut) {
            case "fade":
            case "dip-black":
              t.opacity *= (1 - smoothP);
              break;
            case "dip-white":
              whiteFlashOpacity = Math.max(whiteFlashOpacity, smoothP);
              break;
            case "slide-left":
              animPanX -= smoothP * canvas.width * 0.9;
              t.opacity *= (1 - 0.8 * smoothP);
              break;
            case "slide-right":
              animPanX += smoothP * canvas.width * 0.9;
              t.opacity *= (1 - 0.8 * smoothP);
              break;
            case "zoom-in":
              animScale *= (1 + 0.65 * smoothP);
              t.opacity *= (1 - smoothP);
              break;
            case "zoom-out":
              animScale *= (1 - 0.65 * smoothP);
              t.opacity *= (1 - smoothP);
              break;
            case "wipeleft":
              animPanX -= smoothP * canvas.width * 0.8;
              t.opacity *= (1 - smoothP);
              break;
            case "wiperight":
              animPanX += smoothP * canvas.width * 0.8;
              t.opacity *= (1 - smoothP);
              break;
            case "mirror":
              isMirrored = smoothP > 0.5;
              animScale *= (1 - 0.5 * smoothP);
              t.opacity *= (1 - smoothP);
              break;
            case "bounce": {
              const bounceP = Math.sin((1 - smoothP) * Math.PI * 1.5);
              animScale *= Math.max(0.1, 0.4 + 0.6 * bounceP);
              t.opacity *= (1 - smoothP);
              break;
            }
            case "curtain":
              animScale *= (1 - 0.8 * smoothP);
              t.opacity *= (1 - smoothP);
              break;
          }
        }

        // Combine clip-level effects AND timeline FX track clips
        const allApplicableEffects: { type: string; duration: number; elapsed: number; intensity: number }[] = [
          ...(clip.effects || []).map((e) => ({
            type: e.type.toLowerCase().trim(),
            duration: e.duration || clip.duration,
            elapsed,
            intensity: e.intensity ?? 1,
          })),
          ...activeEffectClips.map((fx) => ({
            type: (fx.effects?.[0]?.type || fx.text || "").toLowerCase().trim(),
            duration: fx.duration,
            elapsed: currT - fx.timelineStart,
            intensity: fx.effects?.[0]?.intensity ?? 1,
          })),
        ];

        if (allApplicableEffects.length > 0) {
          allApplicableEffects.forEach(({ type: eff, duration: dur, elapsed: eTime, intensity = 1 }) => {
            const effDur = Math.max(0.05, dur || 1.0);
            const progress = Math.min(1, Math.max(0, eTime / effDur));
            const smoothP = progress * progress * (3 - 2 * progress);

            if (eff === "zoom-in") {
              // Smooth progressive push-in across full duration (ease-in-out S-curve)
              animScale *= (1 + 0.5 * intensity * smoothP);
            } else if (eff === "zoom-out") {
              // Smooth progressive pull-out (ease-in-out S-curve)
              animScale *= (1 + 0.5 * intensity * (1 - smoothP));
            } else if (eff === "continuous-zoom-in" || eff === "constant-zoom-in" || eff === "linear-zoom-in") {
              // Pure continuous zoom in: keeps constantly zooming deeper for entire effect duration
              animScale *= (1 + progress * 0.85 * intensity);
            } else if (eff === "continuous-zoom-out" || eff === "constant-zoom-out" || eff === "linear-zoom-out") {
              // Pure continuous zoom out: keeps constantly zooming out for entire effect duration
              animScale *= (1 + (1 - progress) * 0.85 * intensity);
            } else if (eff === "pan-left") {
              animPanX -= (canvas.width * 0.28 * intensity) * smoothP;
            } else if (eff === "pan-right") {
              animPanX += (canvas.width * 0.28 * intensity) * smoothP;
            } else if (eff === "pan-zoom-right-to-left") {
              // Dynamic anime camera movement: starts zoomed on right, sweeps smoothly left
              animScale *= (1.25 + 0.1 * intensity);
              const sweep = (0.5 - smoothP) * 2;
              animPanX += sweep * (canvas.width * 0.14) * intensity;
            } else if (eff === "pan-zoom-left-to-right") {
              // Dynamic anime camera movement: starts zoomed on left, sweeps smoothly right
              animScale *= (1.25 + 0.1 * intensity);
              const sweep = (smoothP - 0.5) * 2;
              animPanX += sweep * (canvas.width * 0.14) * intensity;
            } else if (eff === "anime-punch") {
              // Fast impact punch zoom in first 15%, followed by vibration decay
              const snap = progress < 0.15 ? (progress / 0.15) : Math.max(0, 1 - (progress - 0.15) / 0.85);
              animScale *= (1 + 0.45 * intensity * snap);
              const tremor = Math.max(0, 1 - progress) * intensity;
              animPanX += Math.sin(eTime * 50) * 8 * tremor;
              animPanY += Math.cos(eTime * 60) * 6 * tremor;
            } else if (eff === "anime-shake" || eff === "earthquake") {
              const decay = Math.max(0.2, 1 - progress * 0.5) * intensity;
              animPanX += (Math.sin(eTime * 45) + Math.cos(eTime * 28)) * 6 * decay;
              animPanY += (Math.cos(eTime * 40) + Math.sin(eTime * 32)) * 6 * decay;
              animScale *= 1.06;
            } else if (eff === "dutch-tilt") {
              // Dramatic anime camera angle roll
              const tilt = Math.sin(smoothP * Math.PI) * 9 * intensity;
              animRotation += tilt;
              animScale *= 1.12;
            } else if (eff === "pulse-beat") {
              // Heartbeat / aura power pulse
              const pulse = Math.pow(Math.abs(Math.sin(eTime * 5)), 2);
              animScale *= (1 + 0.18 * pulse * intensity);
            } else if (eff === "whip-pan") {
              // Fast directional whip swoosh with motion blur
              const whip = Math.sin(progress * Math.PI);
              animPanX += (progress < 0.5 ? 1 : -1) * (1 - whip) * (canvas.width * 0.22) * intensity;
              blurPx = Math.max(blurPx, whip * 8 * intensity);
            } else if (eff === "white-flash") {
              whiteFlashOpacity = Math.max(whiteFlashOpacity, Math.max(0, 1 - progress * 2.2) * intensity);
            } else if (eff === "mirror") {
              isMirrored = true;
            } else if (eff === "blur") {
              blurPx = Math.max(blurPx, 8 * intensity);
            } else if (eff === "glitch") {
              animPanX += (Math.random() - 0.5) * 14 * intensity;
              animPanY += (Math.random() - 0.5) * 10 * intensity;
            } else if (eff === "fade-in") {
              t.opacity *= smoothP;
            } else if (eff === "fade-out") {
              t.opacity *= (1 - smoothP);
            } else if (eff === "anime-speed-lines") {
              drawSpeedLines = true;
            }
          });
        }

        // Motion Path (PowerPoint-style Point A to Point B animation)
        let motionX = 0;
        let motionY = 0;
        let motionRot = 0;
        if (clip.motionPath && clip.motionPath.enabled) {
          const m = clip.motionPath;
          const motionStart = Number.isFinite(m.startTime) ? m.startTime! : 0;
          const motionDur = Math.max(0.05, Number.isFinite(m.duration) ? m.duration! : clip.duration);
          const motionElapsed = elapsed - motionStart;

          let p = 0;
          if (motionElapsed <= 0) {
            p = 0;
          } else if (motionElapsed >= motionDur) {
            p = 1;
          } else {
            p = motionElapsed / motionDur;
          }
          const smoothP = p * p * (3 - 2 * p);

          const startX = Number.isFinite(m.startX) ? m.startX : t.x;
          const startY = Number.isFinite(m.startY) ? m.startY : t.y;
          const endX = Number.isFinite(m.endX) ? m.endX : (t.x + 30);
          const endY = Number.isFinite(m.endY) ? m.endY : t.y;

          let curX = startX + (endX - startX) * smoothP;
          let curY = startY + (endY - startY) * smoothP;

          if (m.pathType === "arc") {
            const arcH = Math.sin(smoothP * Math.PI) * 18;
            curY -= arcH;
          } else if (m.pathType === "zigzag") {
            const wave = Math.sin(smoothP * Math.PI * 8) * 6;
            const dx = endX - startX;
            const dy = endY - startY;
            const len = Math.hypot(dx, dy) || 1;
            const normX = -dy / len;
            const normY = dx / len;
            curX += normX * wave;
            curY += normY * wave;
          }

          motionX = ((curX - t.x) / 100) * canvas.width;
          motionY = ((curY - t.y) / 100) * canvas.height;

          if (m.rotateWithMotion) {
            const dx = endX - startX;
            const dy = endY - startY;
            motionRot = Math.atan2(dy, dx) * (180 / Math.PI);
          }
        }

        const pxX = (t.x / 100) * canvas.width + animPanX + motionX;
        const pxY = (t.y / 100) * canvas.height + animPanY + motionY;

        const intrinsicW = el instanceof HTMLVideoElement ? el.videoWidth : (el instanceof HTMLImageElement ? (el.naturalWidth || el.width || 480) : 0);
        const intrinsicH = el instanceof HTMLVideoElement ? el.videoHeight : (el instanceof HTMLImageElement ? (el.naturalHeight || el.height || 480) : 0);

        if (intrinsicW > 0 && intrinsicH > 0) {
          const scaleFit = Math.min(canvas.width / intrinsicW, canvas.height / intrinsicH);
          const baseW = intrinsicW * scaleFit;
          const baseH = intrinsicH * scaleFit;

          const finalW = baseW * (t.width / 100) * t.scaleX * crop.width;
          const finalH = baseH * (t.height / 100) * t.scaleY * crop.height;

          ctx.translate(pxX, pxY);
          ctx.rotate(((t.rotation + animRotation + motionRot) * Math.PI) / 180);
          ctx.scale(isMirrored ? -animScale : animScale, animScale);
          ctx.globalAlpha = Math.max(0, Math.min(1, t.opacity / 100));

          // Apply Filters
          const b = Math.round(100 + f.brightness * 100);
          const c = Math.round(f.contrast * 100);
          const s = Math.round(f.saturation * 100);
          let filterStr = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
          if (blurPx > 0) filterStr += ` blur(${blurPx}px)`;
          ctx.filter = filterStr;

          try {
            if (!(el instanceof HTMLAudioElement)) {
              const sx = intrinsicW * crop.x;
              const sy = intrinsicH * crop.y;
              const sw = intrinsicW * crop.width;
              const sh = intrinsicH * crop.height;

              if (clip.chromaKey && clip.chromaKey.enabled && window.chromaCtx) {
                const cc = window.chromaCanvas!;
                const cCtx = window.chromaCtx!;
                cc.width = finalW;
                cc.height = finalH;
                cCtx.clearRect(0, 0, finalW, finalH);
                cCtx.drawImage(el as any, sx, sy, sw, sh, 0, 0, finalW, finalH);

                if (finalW > 0 && finalH > 0) {
                  const frame = cCtx.getImageData(0, 0, finalW, finalH);
                  const data = frame.data;
                  const hex = clip.chromaKey.color;
                  const targetR = parseInt(hex.slice(1, 3), 16) || 0;
                  const targetG = parseInt(hex.slice(3, 5), 16) || 255;
                  const targetB = parseInt(hex.slice(5, 7), 16) || 0;

                  const sim = (clip.chromaKey.similarity || 0.3) * 255;
                  const blnd = (clip.chromaKey.blend || 0.1) * 255;

                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const blue = data[i + 2];
                    const diff = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (blue - targetB) ** 2);

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
          } catch (e) {
            // Ignore drawImage errors during rapid seek
          }
          ctx.filter = "none";
        }
        ctx.restore();
      });

      // Render White Flash Overlay (Hit impacts & Dip-White Transitions)
      if (whiteFlashOpacity > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, Math.max(0, whiteFlashOpacity))})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Render Anime Action Radial Speed Lines
      if (drawSpeedLines) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
        ctx.lineWidth = 2.5;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.hypot(cx, cy);
        const numLines = 40;
        const timeFrame = Math.floor(currT * 24);
        for (let i = 0; i < numLines; i++) {
          const angle = (i / numLines) * Math.PI * 2 + ((timeFrame * 0.17) % 0.25);
          const lineLen = radius * (0.35 + 0.3 * Math.sin(i * 17 + timeFrame));
          const startR = radius - lineLen;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
          ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Pass 3: Draw all Text & Subtitles (ALWAYS ON TOP OF ALL VIDEOS!)
      activeTextClips.forEach(({ clip }) => {
        ctx.save(); // CRITICAL: Isolate context state per clip to prevent coordinate drift
        const elapsed = Math.max(0, currT - clip.timelineStart);
        const dur = Math.max(0.1, clip.duration);
        const t = clip.transform
          ? { ...clip.transform }
          : { x: 50, y: 80, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
        
        let motionX = 0;
        let motionY = 0;
        let motionRot = 0;
        if (clip.motionPath && clip.motionPath.enabled) {
          const m = clip.motionPath;
          const motionStart = Number.isFinite(m.startTime) ? m.startTime! : 0;
          const motionDur = Math.max(0.05, Number.isFinite(m.duration) ? m.duration! : dur);
          const motionElapsed = elapsed - motionStart;

          let p = 0;
          if (motionElapsed <= 0) {
            p = 0;
          } else if (motionElapsed >= motionDur) {
            p = 1;
          } else {
            p = motionElapsed / motionDur;
          }
          const smoothP = p * p * (3 - 2 * p);

          const startX = Number.isFinite(m.startX) ? m.startX : (t.x ?? 50);
          const startY = Number.isFinite(m.startY) ? m.startY : (t.y ?? 80);
          const endX = Number.isFinite(m.endX) ? m.endX : (t.x ?? 50) + 30;
          const endY = Number.isFinite(m.endY) ? m.endY : (t.y ?? 80);

          let curX = startX + (endX - startX) * smoothP;
          let curY = startY + (endY - startY) * smoothP;

          if (m.pathType === "arc") {
            const arcH = Math.sin(smoothP * Math.PI) * 18;
            curY -= arcH;
          } else if (m.pathType === "zigzag") {
            const wave = Math.sin(smoothP * Math.PI * 8) * 6;
            const dx = endX - startX;
            const dy = endY - startY;
            const len = Math.hypot(dx, dy) || 1;
            const normX = -dy / len;
            const normY = dx / len;
            curX += normX * wave;
            curY += normY * wave;
          }

          motionX = ((curX - (t.x ?? 50)) / 100) * canvas.width;
          motionY = ((curY - (t.y ?? 80)) / 100) * canvas.height;

          if (m.rotateWithMotion) {
            const dx = endX - startX;
            const dy = endY - startY;
            motionRot = Math.atan2(dy, dx) * (180 / Math.PI);
          }
        }

        // Text Movement Animation (e.g. Left to Right slide, Right to Left, etc.)
        let moveAnimX = 0;
        let moveAnimY = 0;
        if (clip.textMovement === "slide-left-to-right") {
          const inDur = Math.min(1.0, dur * 0.35);
          const p = Math.min(1, Math.max(0, elapsed / inDur));
          const smoothP = p * p * (3 - 2 * p);
          moveAnimX = -(1 - smoothP) * (canvas.width * 0.5);
        } else if (clip.textMovement === "slide-right-to-left") {
          const inDur = Math.min(1.0, dur * 0.35);
          const p = Math.min(1, Math.max(0, elapsed / inDur));
          const smoothP = p * p * (3 - 2 * p);
          moveAnimX = (1 - smoothP) * (canvas.width * 0.5);
        } else if (clip.textMovement === "slide-bottom-to-top") {
          const inDur = Math.min(1.0, dur * 0.35);
          const p = Math.min(1, Math.max(0, elapsed / inDur));
          const smoothP = p * p * (3 - 2 * p);
          moveAnimY = (1 - smoothP) * (canvas.height * 0.35);
        }

        let animScale = 1;
        if (clip.textAnimation === "pop-in") {
          const popDur = Math.min(0.4, dur * 0.25);
          if (elapsed < popDur) {
            const p = elapsed / popDur;
            animScale = Math.sin(p * Math.PI * 0.8) * 1.25;
          }
        } else if (clip.textAnimation === "fade-in") {
          const fadeDur = Math.min(0.8, dur * 0.3);
          t.opacity *= Math.min(1, Math.max(0, elapsed / fadeDur));
        }

        const posX = ((t.x ?? 50) / 100) * canvas.width + motionX + moveAnimX;
        const posY = ((t.y ?? 80) / 100) * canvas.height + motionY + moveAnimY;

        ctx.translate(posX, posY);
        if (t.rotation || motionRot) ctx.rotate((((t.rotation || 0) + motionRot) * Math.PI) / 180);
        ctx.scale((t.scaleX ?? 1) * animScale, (t.scaleY ?? 1) * animScale);
        ctx.globalAlpha = Math.max(0, Math.min(1, (t.opacity ?? 100) / 100));

        let fontSize = clip.fontSizePercent || 48;
        if (fontSize <= 15) {
          fontSize = Math.round((fontSize / 100) * canvas.height);
        }
        fontSize = Math.max(18, fontSize);

        ctx.font = `900 ${fontSize}px "Inter", "Segoe UI", system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let rawText = clip.text !== undefined && clip.text !== "" ? clip.text : "Subtitle";
        
        // Character-by-character typewriter speed animation
        if (clip.textAnimation === "typewriter") {
          const cps = Math.max(2, clip.typewriterSpeed || 15);
          const charsToShow = Math.floor(elapsed * cps);
          rawText = rawText.slice(0, Math.min(rawText.length, charsToShow));
        }

        const isEmojiOnly = /^\p{Extended_Pictographic}+$/u.test(rawText.trim());
        const lines = rawText.split("\n");
        const lineHeight = fontSize * 1.28;
        const startY = -((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          const curY = startY + i * lineHeight;

          if (!isEmojiOnly) {
            // 1. Thick dark outline for high contrast against any video
            ctx.lineWidth = Math.max(5, fontSize * 0.16);
            ctx.strokeStyle = "#000000";
            ctx.lineJoin = "round";
            ctx.miterLimit = 2;
            ctx.strokeText(line, 0, curY);

            // 2. Drop shadow
            ctx.shadowColor = "rgba(0,0,0,0.85)";
            ctx.shadowBlur = Math.max(6, fontSize * 0.2);
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3;

            // 3. Colored text fill
            ctx.fillStyle = clip.color || "#ffe600";
          }

          ctx.fillText(line, 0, curY);
          ctx.shadowColor = "transparent";
        });

        ctx.restore(); // Cleanly restore isolated state
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
        Off-screen media pool: keeps HTMLVideoElement and HTMLAudioElement active in DOM for hardware decoding
        without rendering inside the visible canvas container.
      */}
      <div
        ref={poolRef}
        aria-hidden="true"
        className="fixed pointer-events-none overflow-hidden"
        style={{
          position: "fixed",
          top: -99999,
          left: -99999,
          width: 1,
          height: 1,
          opacity: 0,
          zIndex: -9999,
        }}
      />
      
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

      {/* Buffering Indicator (YouTube / Facebook style auto-pause spinner) */}
      {isBuffering && isPlaying && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none animate-fade-in">
          <div className="flex flex-col items-center gap-2 bg-[#121218]/90 px-4 py-3 rounded-2xl border border-white/10 shadow-2xl">
            <div className="w-6 h-6 border-2 border-[#ff6b4a] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-medium text-gray-300">Buffering…</span>
          </div>
        </div>
      )}
    </div>
  );
}
