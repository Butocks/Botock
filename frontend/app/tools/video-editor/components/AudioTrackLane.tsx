"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX, X } from "lucide-react";
import { AudioTrack } from "@/lib/editor/types";

interface AudioTrackLaneProps {
  track: AudioTrack;
  duration: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (newStart: number) => void;
  onDelete: () => void;
}

function drawWaveform(canvas: HTMLCanvasElement, peaks: number[], color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx || peaks.length === 0) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  const barWidth = width / peaks.length;
  const mid = height / 2;
  peaks.forEach((p, i) => {
    const barHeight = Math.max(1, p * (height - 4));
    ctx.fillRect(i * barWidth, mid - barHeight / 2, Math.max(1, barWidth - 1), barHeight);
  });
}

export default function AudioTrackLane({ track, duration, selected, onSelect, onMove, onDelete }: AudioTrackLaneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const laneRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef(0);

  const trackDuration = track.trimEnd - track.trimStart;

  useEffect(() => {
    if (canvasRef.current) {
      drawWaveform(canvasRef.current, track.peaks, track.kind === "music" ? "#a78bfa" : "#38bdf8");
    }
  }, [track.peaks, track.kind]);

  const startDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    const lane = laneRef.current?.parentElement;
    if (!lane) return;
    const rect = lane.getBoundingClientRect();
    const clickTime = ((e.clientX - rect.left) / rect.width) * duration;
    dragOffsetRef.current = clickTime - track.timelineStart;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const lane = laneRef.current?.parentElement;

    const move = (e: PointerEvent) => {
      if (!lane) return;
      const rect = lane.getBoundingClientRect();
      const time = ((e.clientX - rect.left) / rect.width) * duration;
      const newStart = Math.max(0, Math.min(duration - trackDuration, time - dragOffsetRef.current));
      onMove(newStart);
    };
    const up = () => setDragging(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, duration, trackDuration, onMove]);

  const left = (track.timelineStart / duration) * 100;
  const width = (trackDuration / duration) * 100;

  return (
    <div
      ref={laneRef}
      onPointerDown={startDrag}
      className={`absolute top-0 h-full rounded-lg border-2 overflow-hidden cursor-grab active:cursor-grabbing ${
        selected ? "border-violet-400" : "border-white/20"
      } ${track.muted ? "opacity-40" : ""}`}
      style={{
        left: `${left}%`,
        width: `${Math.max(2, width)}%`,
        background: track.kind === "music" ? "rgba(167,139,250,0.15)" : "rgba(56,189,248,0.15)",
      }}
    >
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/50 text-[9px] text-white font-bold truncate">
        <Music className="w-2.5 h-2.5 shrink-0" />
        <span className="truncate">{track.label}</span>
        {track.muted ? <VolumeX className="w-2.5 h-2.5 shrink-0 text-rose-400" /> : <Volume2 className="w-2.5 h-2.5 shrink-0" />}
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-auto shrink-0 hover:text-rose-400"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
      <canvas ref={canvasRef} width={300} height={40} className="w-full h-[calc(100%-16px)]" />

      {/* Fade indicators */}
      {track.fadeInSeconds > 0 && (
        <div
          className="absolute left-0 top-4 bottom-0 bg-gradient-to-r from-black/60 to-transparent pointer-events-none"
          style={{ width: `${(track.fadeInSeconds / trackDuration) * 100}%` }}
        />
      )}
      {track.fadeOutSeconds > 0 && (
        <div
          className="absolute right-0 top-4 bottom-0 bg-gradient-to-l from-black/60 to-transparent pointer-events-none"
          style={{ width: `${(track.fadeOutSeconds / trackDuration) * 100}%` }}
        />
      )}
    </div>
  );
}