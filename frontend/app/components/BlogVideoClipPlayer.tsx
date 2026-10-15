'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogClip } from '@/lib/blog/blogData';

interface BlogVideoClipPlayerProps {
  clip: BlogClip;
  autoPlayOnHover?: boolean;
  compact?: boolean;
}

export default function BlogVideoClipPlayer({
  clip,
  autoPlayOnHover = false,
  compact = false,
}: BlogVideoClipPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [progress, setProgress] = useState(0);

  // Animated Canvas Clip Fallback if MP4 fails or is blocked by adblock/firewall
  useEffect(() => {
    if (!useCanvasFallback || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const renderFallbackClip = () => {
      frame += 1;
      const w = canvas.width;
      const h = canvas.height;

      // Dynamic gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Animated AI waveform / timeline tracks simulation
      for (let i = 0; i < 28; i++) {
        const barH = 18 + Math.sin(frame * 0.08 + i * 0.45) * 28;
        ctx.fillStyle = i % 2 === 0 ? '#6366f1' : '#22d3ee';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(40 + i * ((w - 80) / 28), h / 2 - barH / 2, 10, barH, 4);
        } else {
          ctx.rect(40 + i * ((w - 80) / 28), h / 2 - barH / 2, 10, barH);
        }
        ctx.fill();
      }

      // Moving Playhead line
      const playheadX = 40 + ((frame * 2.5) % (w - 80));
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 24);
      ctx.lineTo(playheadX, h - 24);
      ctx.stroke();

      animId = requestAnimationFrame(renderFallbackClip);
    };

    renderFallbackClip();
    return () => cancelAnimationFrame(animId);
  }, [useCanvasFallback]);

  const togglePlay = () => {
    if (useCanvasFallback) {
      setIsPlaying((prev) => !prev);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setUseCanvasFallback(true));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleMouseEnter = () => {
    if (autoPlayOnHover && videoRef.current && videoRef.current.paused) {
      videoRef.current.muted = true;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setUseCanvasFallback(true));
    }
  };

  const handleMouseLeave = () => {
    if (autoPlayOnHover && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl transition-all hover:border-indigo-500/60"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Clip Badge */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-slate-700/70 pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        <span>LIVE CLIP • {clip.duration}</span>
      </div>

      {/* Mute/Unmute Toggle */}
      {!useCanvasFallback && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
          className="absolute right-3 top-3 z-20 rounded-full bg-slate-900/80 p-2 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white backdrop-blur-md transition-colors"
          title={isMuted ? 'Unmute Clip' : 'Mute Clip'}
        >
          {isMuted ? '🔇 Muted' : '🔊 Sound On'}
        </button>
      )}

      {/* Video or Interactive Fallback Canvas */}
      <div
        onClick={togglePlay}
        className={`relative w-full cursor-pointer overflow-hidden bg-slate-900 ${
          compact ? 'aspect-video max-h-52' : 'aspect-video'
        }`}
      >
        {!useCanvasFallback ? (
          <video
            ref={videoRef}
            src={clip.videoUrl}
            poster={clip.posterUrl}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onError={() => setUseCanvasFallback(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (videoRef.current && videoRef.current.duration) {
                setProgress(
                  (videoRef.current.currentTime / videoRef.current.duration) * 100
                );
              }
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="h-full w-full object-cover"
          />
        )}

        {/* Play Overlay Button */}
        {!isPlaying && !useCanvasFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity group-hover:bg-black/25">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/95 text-white shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-110">
              ▶
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-150"
            style={{ width: `${useCanvasFallback ? 100 : progress}%` }}
          />
        </div>
      </div>

      {/* Clip Footer & Instant Tool Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/95">
        <div>
          <h4 className="text-sm font-bold text-white">{clip.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-1">{clip.caption}</p>
        </div>
        <Link
          href={clip.toolSlug}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
        >
          <span>⚡ {clip.toolLabel}</span>
        </Link>
      </div>
    </div>
  );
}
