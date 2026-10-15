"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Scissors, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Plus, Upload, Music, Film, Type, X } from "lucide-react";
import { EditorProject, MediaBinItem, TimelineClip } from "@/lib/editor/types";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "00:00.0";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t % 1) * 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
}

const SOURCE_COLORS = ["bg-emerald-600", "bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-orange-600", "bg-indigo-600", "bg-teal-600"];

interface EditorTimelineProps {
  project: EditorProject;
  mediaItems: MediaBinItem[];
  currentTime: number;
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
  onOpenClipProperties?: (id: string) => void;
  onMoveClipBegin?: () => void;
  onMoveClipLive?: (id: string, newStart: number) => void;
  onMoveClipCommit?: () => void;
  onSeek: (t: number) => void;
  onSplit: (time: number) => void;
  onDeleteClip?: (id: string) => void;
  onEdgeBegin: () => void;
  onEdgeLive: (
    id: string,
    side: "start" | "end",
    virtualDelta: number,
    initialClip?: TimelineClip,
    maxSourceDuration?: number
  ) => void;
  onEdgeCommit: () => void;
  zoom: number;
  setZoom?: (z: number) => void;
  thumbnailsBySource: Record<string, string[]>;
  waveformsBySource: Record<string, number[]>;
  onAddMediaToTrack?: (trackId: string, item: MediaBinItem) => void;
  onAddSubtitleToTrack?: (trackId: string) => void;
  onAddEffectToTrack?: (trackId: string, effectType: string) => void;
  onUploadAndAddToTrack?: (trackId: string, file: File) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

function getTrackHeightClass(track: { type: string; name: string }) {
  const isVideo = track.type === "video";
  const isAudio = track.type === "audio";
  const isEffect = track.type === "effect" || track.name.toUpperCase().includes("FX");
  const isText = track.type === "text" || track.name.toLowerCase().includes("caption") || track.name.toLowerCase().includes("sub");

  if (isVideo) return "h-14 md:h-16"; // Video track: taller for thumbnails
  if (isAudio) return "h-11 md:h-12"; // Audio track: medium height for waveforms
  if (isEffect || isText) return "h-7 md:h-8"; // FX and Subtitle: very slim & compact
  return "h-9 md:h-10";
}

export default function EditorTimeline({
  project,
  mediaItems,
  currentTime,
  selectedClipId,
  onSelectClip,
  onOpenClipProperties,
  onMoveClipBegin,
  onMoveClipLive,
  onMoveClipCommit,
  onSeek,
  onSplit,
  onDeleteClip,
  onEdgeBegin,
  onEdgeLive,
  onEdgeCommit,
  zoom,
  setZoom,
  thumbnailsBySource,
  waveformsBySource,
  onAddMediaToTrack,
  onAddSubtitleToTrack,
  onAddEffectToTrack,
  onUploadAndAddToTrack,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorTimelineProps) {
  const trackAreaRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTrackForUpload, setActiveTrackForUpload] = useState<string | null>(null);
  const [mediaPickerTrackId, setMediaPickerTrackId] = useState<string | null>(null);

  const totalDuration = useMemo(() => {
    let maxT = 10;
    project.tracks.forEach((t) =>
      t.clips.forEach((c) => {
        if (c.timelineStart + c.duration > maxT) maxT = c.timelineStart + c.duration;
      })
    );
    return maxT + 4;
  }, [project]);

  const uniqueSources = useMemo(() => {
    const s = new Set<string>();
    project.tracks.forEach((t) => t.clips.forEach((c) => s.add(c.sourceId)));
    return Array.from(s);
  }, [project]);

  const visibleTracks = useMemo(() => {
    // Natural power-stacking hierarchy:
    // 1. Text/Subtitles (Topmost visual layer)
    // 2. FX (Visual Effects layer right above video)
    // 3. V2 / Overlays
    // 4. V1 (Base video)
    // 5. Audio tracks
    const getTrackRank = (t: { type: string; name: string }) => {
      if (t.type === "text" || t.name.toLowerCase().includes("sub")) return 1;
      if (t.type === "effect" || t.name.toUpperCase().includes("FX")) return 2;
      if (t.type === "video") {
        if (t.name === "V1") return 4;
        return 3;
      }
      return 5;
    };
    return [...project.tracks]
      .filter((t) => t.type === "video" || t.type === "effect" || t.name === "FX" || t.clips.length > 0)
      .sort((a, b) => getTrackRank(a) - getTrackRank(b));
  }, [project.tracks]);

  // Keyboard shortcut: Delete or Backspace to delete selected clip/effect
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedClipId && onDeleteClip) {
          onDeleteClip(selectedClipId);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedClipId, onDeleteClip]);

  const sourceIndexOf = (id: string) => {
    const i = uniqueSources.indexOf(id);
    return i >= 0 ? i % SOURCE_COLORS.length : 0;
  };

  // Pointer drag for Playhead, Trimming Edge, and Clip Position Moving
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  const [draggingEdge, setDraggingEdge] = useState<{
    id: string;
    side: "start" | "end";
    startX: number;
    initialClip: TimelineClip;
    maxSourceDuration: number;
  } | null>(null);
  const [draggingClip, setDraggingClip] = useState<{
    id: string;
    startX: number;
    originalStart: number;
    duration: number;
  } | null>(null);
  const clipHasMovedRef = useRef(false);
  const lastTapRef = useRef<{ id: string; time: number }>({ id: "", time: 0 });

  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (draggingClip || draggingEdge || draggingPlayhead) return;
    // Don't seek if clicking on a button (e.g. Add, +, Trim, Split) or directly on a timeline clip
    const target = e.target as HTMLElement | null;
    if (target && (target.closest("button") || target.closest("[data-timeline-clip]"))) {
      return;
    }
    if (!trackAreaRef.current) return;
    const rect = trackAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < 0) return;
    const t = Math.max(0, Math.min(totalDuration, (x / rect.width) * totalDuration));
    onSeek(t);
  };

  // Fast direct playhead positioning via CustomEvent
  useEffect(() => {
    const handleTimeUpdate = (e: any) => {
      const t = e.detail;
      const el = document.getElementById("editor-playhead");
      if (el && totalDuration > 0) {
        el.style.left = `${(t / totalDuration) * 100}%`;
      }
    };
    window.addEventListener("editor-time-update", handleTimeUpdate);
    return () => window.removeEventListener("editor-time-update", handleTimeUpdate);
  }, [totalDuration]);

  // Mobile Pinch-to-Zoom gesture on timeline
  const pinchRef = useRef<{ initialDist: number; initialZoom: number } | null>(null);

  useEffect(() => {
    const el = trackAreaRef.current;
    if (!el || !setZoom) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        pinchRef.current = { initialDist: dist, initialZoom: zoom };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (pinchRef.current.initialDist > 0) {
          const factor = dist / pinchRef.current.initialDist;
          const newZoom = Math.max(0.2, Math.min(3.5, pinchRef.current.initialZoom * factor));
          setZoom(Math.round(newZoom * 100) / 100);
        }
      }
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [setZoom, zoom]);

  // Edge trimming drag
  useEffect(() => {
    if (!draggingEdge) return;
    const move = (e: PointerEvent) => {
      if (!trackAreaRef.current) return;
      const rect = trackAreaRef.current.getBoundingClientRect();
      const deltaX = e.clientX - draggingEdge.startX;
      const virtualDeltaT = (deltaX / rect.width) * totalDuration;

      onEdgeLive(
        draggingEdge.id,
        draggingEdge.side,
        virtualDeltaT,
        draggingEdge.initialClip,
        draggingEdge.maxSourceDuration
      );
    };

    const up = () => {
      setDraggingEdge(null);
      onEdgeCommit();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [draggingEdge, totalDuration, onEdgeLive, onEdgeCommit]);

  // Playhead dragging
  useEffect(() => {
    if (!draggingPlayhead) return;
    const move = (e: PointerEvent) => {
      if (!trackAreaRef.current) return;
      const rect = trackAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = Math.max(0, Math.min(totalDuration, (x / rect.width) * totalDuration));
      onSeek(t);
    };
    const up = () => setDraggingPlayhead(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [draggingPlayhead, totalDuration, onSeek]);

  // Clip position moving drag with magnetic snapping
  useEffect(() => {
    if (!draggingClip) return;
    const move = (e: PointerEvent) => {
      if (!trackAreaRef.current) return;
      const rect = trackAreaRef.current.getBoundingClientRect();
      const deltaX = e.clientX - draggingClip.startX;

      if (!clipHasMovedRef.current) {
        if (Math.abs(deltaX) > 3) {
          clipHasMovedRef.current = true;
          onMoveClipBegin?.();
        } else {
          return;
        }
      }

      const deltaT = (deltaX / rect.width) * totalDuration;
      let newStart = Math.max(0, draggingClip.originalStart + deltaT);

      // Magnetic snapping
      if (newStart < 0.15) {
        newStart = 0;
      } else if (Math.abs(newStart - currentTime) < 0.15) {
        newStart = currentTime;
      }

      // Snap to adjacent clips in the same track
      const track = project.tracks.find((t) => t.clips.some((c) => c.id === draggingClip.id));
      if (track) {
        for (const other of track.clips) {
          if (other.id === draggingClip.id) continue;
          const otherEnd = other.timelineStart + other.duration;
          if (Math.abs(newStart - otherEnd) < 0.2) {
            newStart = otherEnd;
            break;
          }
          if (Math.abs(newStart + draggingClip.duration - other.timelineStart) < 0.2) {
            newStart = Math.max(0, other.timelineStart - draggingClip.duration);
            break;
          }
        }
      }

      onMoveClipLive?.(draggingClip.id, newStart);
    };

    const up = () => {
      if (clipHasMovedRef.current) {
        onMoveClipCommit?.();
      }
      clipHasMovedRef.current = false;
      setDraggingClip(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [draggingClip, totalDuration, currentTime, project.tracks, onMoveClipBegin, onMoveClipLive, onMoveClipCommit]);

  const minWidth = Math.max(700, 700 * zoom);

  return (
    <div className="flex flex-col w-full h-full bg-[#0d0d12] border-t border-[#2b2b36] overflow-hidden select-none">
      {/* ─── Timeline Top Toolbar ─── */}
      <div className="h-9 bg-[#111118] border-b border-[#2b2b36] flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Scissor / Split button */}
          <button
            onClick={() => onSplit(currentTime)}
            title="Split clip at playhead"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#ff6b4a] hover:bg-[#ff856b] active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          {/* Delete clip */}
          {onDeleteClip && (
            <button
              onClick={() => selectedClipId && onDeleteClip(selectedClipId)}
              disabled={!selectedClipId}
              title="Delete selected clip"
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/15 text-gray-400 hover:text-red-400 disabled:opacity-30 transition-colors text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          <span className="w-px h-4 bg-[#2b2b36] mx-1" />

          {/* Undo / Redo */}
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo"
              className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onRedo && (
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo"
              className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Zoom Slider */}
        {setZoom && (
          <div className="flex items-center gap-1.5">
            <ZoomOut className="w-3 h-3 text-gray-500" />
            <input
              type="range"
              min="0.2"
              max="3.5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-16 sm:w-24 accent-[#ff6b4a] h-1 bg-gray-800 rounded appearance-none cursor-pointer"
            />
            <ZoomIn className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* ─── Timeline Tracks Layout ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* LEFT COLUMN: Clean Minimal Track Badges (w-12 only!) */}
        <div className="w-12 md:w-14 shrink-0 bg-[#0d0d12] border-r border-[#2b2b36] flex flex-col z-20">
          {/* Header ruler label */}
          <div className="h-7 border-b border-[#2b2b36] flex items-center justify-center bg-[#111118]">
            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase">Track</span>
          </div>

          {/* Track Badges */}
          {visibleTracks.map((track) => {
            const isVideo = track.type === "video";
            const isAudio = track.type === "audio";
            const isEffect = track.type === "effect" || track.name.toUpperCase().includes("FX");
            const isText = track.type === "text" || track.name.toLowerCase().includes("caption") || track.name.toLowerCase().includes("sub");
            const isSlim = isEffect || isText;

            return (
              <div
                key={track.id}
                className={`${getTrackHeightClass(track)} border-b border-[#2b2b36] flex ${
                  isSlim ? "flex-row" : "flex-col"
                } items-center justify-center bg-[#0d0d12]/90`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded ${isSlim ? "text-[9px]" : "text-[10px]"} font-bold font-mono tracking-wider ${
                    isVideo
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : isEffect
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : isAudio
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                  }`}
                >
                  {track.name}
                </span>
                {!isSlim && (
                  <span className="text-[8px] font-mono text-gray-500 uppercase mt-0.5">
                    {track.type}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Scrollable Timeline (Ruler + Tracks + Playhead) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#13131a] touch-pan-x">
          <div
            ref={trackAreaRef}
            className="relative h-full flex flex-col"
            style={{ minWidth: `${minWidth}px` }}
            onPointerDown={handleTrackPointerDown}
          >
            {/* Time Ruler (00:00, 00:05, etc.) */}
            <div
              className="h-7 border-b border-[#2b2b36] bg-[#0f0f15] relative select-none cursor-pointer touch-none"
              onPointerDown={(e) => {
                try {
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                } catch (_) {}
                if (!trackAreaRef.current) return;
                const rect = trackAreaRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < 0) return;
                const t = Math.max(0, Math.min(totalDuration, (x / rect.width) * totalDuration));
                onSeek(t);
                setDraggingPlayhead(true);
              }}
            >
              <TimeRuler totalDuration={totalDuration} />
            </div>

            {/* Tracks */}
            {visibleTracks.map((track) => {
              const isVideo = track.type === "video";
              const isAudio = track.type === "audio";
              const isEffectTrack = track.type === "effect" || track.name.toUpperCase().includes("FX");
              const isTextTrack = track.type === "text" || track.name.toLowerCase().includes("caption") || track.name.toLowerCase().includes("sub");
              const isSlim = isEffectTrack || isTextTrack;

              const lastEnd = track.clips.length > 0
                ? Math.max(...track.clips.map((c) => c.timelineStart + c.duration))
                : 0;
              const addBtnLeftPct = totalDuration > 0 ? (lastEnd / totalDuration) * 100 : 0;

              return (
                <div
                  key={track.id}
                  className={`relative ${getTrackHeightClass(track)} border-b border-[#2b2b36]/70 bg-[#121218]/40 hover:bg-white/[0.01] transition-colors`}
                >
                  {/* Clips */}
                  {track.clips.map((clip) => {
                    const leftPct = totalDuration > 0 ? (clip.timelineStart / totalDuration) * 100 : 0;
                    const widthPct = totalDuration > 0 ? (clip.duration / totalDuration) * 100 : 0;
                    const selected = clip.id === selectedClipId;
                    const isDragging = draggingClip?.id === clip.id;
                    const colorClass = SOURCE_COLORS[sourceIndexOf(clip.sourceId)];
                    const thumbs = thumbnailsBySource[clip.sourceId] || [];

                    const isEffect = clip.type === "effect" || isEffectTrack;

                    return (
                      <div
                        key={clip.id}
                        data-timeline-clip="true"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          try {
                            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                          } catch (_) {}
                          onSelectClip(clip.id);

                          // Double tap / click detection
                          const now = Date.now();
                          if (lastTapRef.current.id === clip.id && now - lastTapRef.current.time < 320) {
                            onOpenClipProperties?.(clip.id);
                            lastTapRef.current = { id: "", time: 0 };
                          } else {
                            lastTapRef.current = { id: clip.id, time: now };
                          }

                          // Start drag
                          clipHasMovedRef.current = false;
                          setDraggingClip({
                            id: clip.id,
                            startX: e.clientX,
                            originalStart: clip.timelineStart,
                            duration: clip.duration,
                          });
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          onOpenClipProperties?.(clip.id);
                        }}
                        className={`absolute ${
                          isSlim ? "top-1 bottom-1 rounded-md border" : "top-1.5 bottom-1.5 rounded-lg border-2"
                        } overflow-hidden transition-all touch-none select-none ${
                          isEffect
                            ? isDragging
                              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 border-white ring-2 ring-pink-400 shadow-[0_0_16px_rgba(236,72,153,0.8)] z-30 cursor-grabbing opacity-90 scale-[1.01]"
                              : selected
                              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 border-white ring-2 ring-pink-400 shadow-[0_0_16px_rgba(236,72,153,0.8)] z-20 cursor-grab"
                              : "bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-rose-600/90 border-pink-400/60 shadow-md shadow-pink-500/20 hover:border-pink-300 cursor-pointer"
                            : isDragging
                            ? "border-white ring-2 ring-[#ff6b4a] shadow-[0_0_16px_rgba(255,107,74,0.7)] z-30 cursor-grabbing opacity-90 scale-[1.01]"
                            : selected
                            ? `${colorClass} border-[#ff6b4a] shadow-[0_0_12px_rgba(255,107,74,0.4)] z-20 cursor-grab`
                            : `${colorClass}/60 border-transparent hover:border-white/30 cursor-pointer`
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "4px" }}
                      >
                        {/* Filmstrip / Waveform background */}
                        <div className="absolute inset-0 flex bg-black/40 opacity-70 pointer-events-none">
                          {clip.type === "video" &&
                            thumbs.length > 0 &&
                            thumbs.slice(0, 8).map((t: string, i: number) => (
                              <div key={i} className="h-full flex-1 min-w-0 border-r border-black/30">
                                {t && <img src={t} alt="" draggable={false} className="h-full w-full object-cover" />}
                              </div>
                            ))}
                          {clip.type === "audio" && waveformsBySource?.[clip.sourceId] && (
                            <div className="h-full w-full flex items-center gap-0.5 px-2 overflow-hidden opacity-60">
                              {waveformsBySource[clip.sourceId].slice(0, 60).map((v, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-blue-300 rounded-full"
                                  style={{ height: `${Math.max(15, Math.min(100, v * 100))}%` }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Trim / Duration Handles */}
                        {(selected || isEffect) && (
                          <>
                            <button
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                try {
                                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                } catch (_) {}
                                onEdgeBegin();
                                const media = mediaItems.find((m) => m.id === clip.sourceId);
                                const isSynthetic =
                                  clip.type === "text" ||
                                  clip.type === "effect" ||
                                  clip.type === "image" ||
                                  track.type === "effect" ||
                                  track.type === "text";
                                const maxSourceDur = isSynthetic
                                  ? 999999
                                  : (media ? media.duration : Math.max(clip.sourceEnd, 10));
                                setDraggingEdge({
                                  id: clip.id,
                                  side: "start",
                                  startX: e.clientX,
                                  initialClip: { ...clip },
                                  maxSourceDuration: maxSourceDur,
                                });
                              }}
                              title={isEffect ? "Drag Effect Start Handle" : "Trim Start"}
                              className={`absolute left-0 top-0 bottom-0 z-30 flex w-3 md:w-3.5 cursor-ew-resize items-center justify-center ${
                                isEffect ? "bg-pink-500 hover:bg-pink-400" : "bg-[#ff6b4a] hover:bg-[#ff856b]"
                              } shadow-md transition-colors before:absolute before:-inset-x-2 before:inset-y-0`}
                            >
                              <span className="h-3.5 w-0.5 rounded-full bg-white" />
                            </button>
                            <button
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                try {
                                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                                } catch (_) {}
                                onEdgeBegin();
                                const media = mediaItems.find((m) => m.id === clip.sourceId);
                                const isSynthetic =
                                  clip.type === "text" ||
                                  clip.type === "effect" ||
                                  clip.type === "image" ||
                                  track.type === "effect" ||
                                  track.type === "text";
                                const maxSourceDur = isSynthetic
                                  ? 999999
                                  : (media ? media.duration : Math.max(clip.sourceEnd, 10));
                                setDraggingEdge({
                                  id: clip.id,
                                  side: "end",
                                  startX: e.clientX,
                                  initialClip: { ...clip },
                                  maxSourceDuration: maxSourceDur,
                                });
                              }}
                              title={isEffect ? "Drag Effect Duration Handle" : "Trim End"}
                              className={`absolute right-0 top-0 bottom-0 z-30 flex w-3 md:w-3.5 cursor-ew-resize items-center justify-center ${
                                isEffect ? "bg-pink-500 hover:bg-pink-400" : "bg-[#ff6b4a] hover:bg-[#ff856b]"
                              } shadow-md transition-colors before:absolute before:-inset-x-2 before:inset-y-0`}
                            >
                              <span className="h-3.5 w-0.5 rounded-full bg-white" />
                            </button>
                          </>
                        )}

                        {/* Clip label */}
                        <div
                          className={`absolute left-1.5 ${
                            isSlim ? "top-1/2 -translate-y-1/2" : "top-1"
                          } rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] text-white truncate max-w-[85%] backdrop-blur-sm pointer-events-none flex items-center gap-1`}
                        >
                          {isEffect
                            ? `✨ ${clip.text || "Effect"}`
                            : clip.type === "video"
                            ? "Video"
                            : clip.type === "image"
                            ? (clip.sourceId?.toLowerCase().includes("gif") || (clip as any).name?.toLowerCase().includes("gif") ? "🔥 GIF" : "🖼️ Image")
                            : clip.type === "text"
                            ? `💬 ${clip.text || "Sub"}`
                            : "Audio"} • {fmt(clip.duration)}
                        </div>

                        {/* Attached Effect Indicator Strip on Video Clip */}
                        {clip.type === "video" && clip.effects && clip.effects.length > 0 && (
                          <div
                            className="absolute right-1.5 top-1 z-20 px-1.5 py-0.5 rounded bg-pink-500/90 text-[8px] font-bold text-white shadow pointer-events-none flex items-center gap-1"
                            title={`Active Effect: ${clip.effects[0].type}`}
                          >
                            ✨ {clip.effects[0].type.toUpperCase()}
                          </div>
                        )}

                        {/* Transition In Badge */}
                        {clip.transitionIn && clip.transitionIn !== "none" && (
                          <div
                            className="absolute left-1.5 bottom-1 z-20 px-1 rounded bg-emerald-500/90 text-[8px] font-bold text-white shadow pointer-events-none"
                            title={`Transition In: ${clip.transitionIn}`}
                          >
                            ⧗ IN
                          </div>
                        )}

                        {/* Transition Out Badge */}
                        {clip.transitionOut && clip.transitionOut !== "none" && (
                          <div
                            className="absolute right-1.5 bottom-1 z-20 px-1 rounded bg-blue-500/90 text-[8px] font-bold text-white shadow pointer-events-none"
                            title={`Transition Out: ${clip.transitionOut}`}
                          >
                            ⧗ OUT
                          </div>
                        )}

                        {/* Motion Strip & Badge with Timer */}
                        {clip.motionPath && clip.motionPath.enabled && (
                          <>
                            {/* Motion Timer Range Strip at bottom of clip */}
                            <div
                              className="absolute left-0 bottom-0 right-0 h-1 bg-amber-500/30 border-t border-amber-400/50 pointer-events-none overflow-hidden"
                              title={`Motion: ${clip.motionPath.direction || "Move"} • Timer: ${(clip.motionPath.duration || clip.duration).toFixed(1)}s`}
                            >
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-sm"
                                style={{
                                  marginLeft: `${((clip.motionPath.startTime || 0) / Math.max(0.1, clip.duration)) * 100}%`,
                                  width: `${((clip.motionPath.duration || clip.duration) / Math.max(0.1, clip.duration)) * 100}%`,
                                }}
                              />
                            </div>
                            <div
                              className="absolute left-1/2 -translate-x-1/2 bottom-1.5 z-20 px-1.5 py-0.5 rounded bg-amber-500/95 text-[8px] font-bold text-black shadow pointer-events-none flex items-center gap-1"
                              title={`Motion: ${clip.motionPath.direction || "Move"} • Timer: ${(clip.motionPath.duration || clip.duration).toFixed(1)}s`}
                            >
                              <span>🏃</span>
                              <span>Motion: {(clip.motionPath.direction || "move").replace("_", "-").toUpperCase()}</span>
                              <span className="font-mono text-[7px] bg-black/20 px-1 rounded">{(clip.motionPath.duration || clip.duration).toFixed(1)}s</span>
                            </div>
                          </>
                        )}

                        {/* Live Dragging Tooltip */}
                        {isDragging && (
                          <div className="absolute top-1 right-2 bg-black/90 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#ff6b4a] font-bold z-40 pointer-events-none border border-[#ff6b4a]/50">
                            {fmt(clip.timelineStart)}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ─── ADD MEDIA BUTTON ON TRACK ─── */}
                  {/* If track is empty: show Add Media right at start */}
                  {track.clips.length === 0 ? (
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaPickerTrackId(track.id);
                      }}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isSlim ? "h-5 px-2 text-[10px]" : "h-7 md:h-8 px-2.5 text-xs"
                      } rounded-md border border-dashed border-[#ff6b4a]/50 hover:border-[#ff6b4a] bg-[#ff6b4a]/5 hover:bg-[#ff6b4a]/15 text-[#ff6b4a] font-semibold flex items-center gap-1 transition-all cursor-pointer z-10`}
                    >
                      <Plus className={isSlim ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
                      <span>Add</span>
                    </button>
                  ) : (
                    /* If track has clips: show (+) button directly at the end of the last clip */
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaPickerTrackId(track.id);
                      }}
                      title="Add next media clip here"
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        isSlim ? "w-5 h-5" : "w-6 h-6"
                      } rounded-full bg-[#1c1c24] hover:bg-[#ff6b4a] border border-[#ff6b4a]/60 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 cursor-pointer z-10`}
                      style={{ left: `calc(${addBtnLeftPct}% + 8px)` }}
                    >
                      <Plus className={isSlim ? "w-3 h-3" : "w-3.5 h-3.5"} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* ─── PLAYHEAD (SUI) ─── */}
            {/* Strictly positioned 0% to 100% of this track area. NEVER collides with left track labels! */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-30">
              {totalDuration > 0 && (
                <div
                  id="editor-playhead"
                  className="absolute top-0 bottom-0 pointer-events-auto cursor-ew-resize -translate-x-1/2 flex flex-col items-center z-30"
                  style={{ left: `${(currentTime / totalDuration) * 100}%`, width: "18px" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    try {
                      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    } catch (_) {}
                    setDraggingPlayhead(true);
                  }}
                >
                  {/* Top diamond needle head */}
                  <div className="w-3.5 h-3.5 rotate-45 bg-[#ff6b4a] shadow-[0_0_8px_rgba(255,107,74,0.9)] border border-white/60 -mt-0.5" />
                  {/* Vertical needle line */}
                  <div className="w-[2px] flex-1 bg-[#ff6b4a] shadow-[0_0_6px_rgba(255,107,74,0.7)]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for uploading directly to track */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeTrackForUpload && onUploadAndAddToTrack) {
            onUploadAndAddToTrack(activeTrackForUpload, file);
          }
          e.target.value = "";
          setActiveTrackForUpload(null);
          setMediaPickerTrackId(null);
        }}
      />

      {/* ─── Media Picker Modal for Track (+) Button ─── */}
      {mediaPickerTrackId && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMediaPickerTrackId(null)}
        >
          <div
            className="bg-[#14141c] border border-[#2b2b36] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2b2b36] pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#ff6b4a]" />
                <h3 className="text-sm font-bold text-white">Add Media to Timeline</h3>
              </div>
              <button
                onClick={() => setMediaPickerTrackId(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle track quick add */}
            {(() => {
              const pickerTrack = project.tracks.find((t) => t.id === mediaPickerTrackId);
              const isTextTrack = pickerTrack?.type === "text" || pickerTrack?.name.toLowerCase().includes("sub");
              if (!isTextTrack) return null;
              return (
                <div className="pb-3 border-b border-[#2b2b36]">
                  <p className="text-[11px] text-gray-400 mb-2 font-medium">Add text or captions to this track:</p>
                  <button
                    onClick={() => {
                      if (onAddSubtitleToTrack && mediaPickerTrackId) {
                        onAddSubtitleToTrack(mediaPickerTrackId);
                      }
                      setMediaPickerTrackId(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#ff856b] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Type className="w-4 h-4" />
                    <span>+ Add Subtitle / Text Clip</span>
                  </button>
                </div>
              );
            })()}

            {/* Effect track quick add */}
            {(() => {
              const pickerTrack = project.tracks.find((t) => t.id === mediaPickerTrackId);
              const isEffectTrack = pickerTrack?.type === "effect" || pickerTrack?.name.toUpperCase().includes("FX");
              if (!isEffectTrack) return null;
              const FX_OPTIONS = [
                { id: "zoom-in", label: "Smooth Zoom In", icon: "🔍" },
                { id: "zoom-out", label: "Smooth Zoom Out", icon: "🔎" },
                { id: "continuous-zoom-in", label: "Continuous Zoom In", icon: "⚡" },
                { id: "continuous-zoom-out", label: "Continuous Zoom Out", icon: "🔄" },
                { id: "pan-left", label: "Pan Left", icon: "⬅️" },
                { id: "pan-right", label: "Pan Right", icon: "➡️" },
                { id: "blur", label: "Blur Defocus", icon: "💧" },
                { id: "mirror", label: "Mirror Flip", icon: "🪞" },
                { id: "glitch", label: "Glitch Shake", icon: "👾" },
                { id: "anime-shake", label: "Impact Shake", icon: "💥" },
              ];
              return (
                <div className="pb-3 border-b border-[#2b2b36]">
                  <p className="text-[11px] text-gray-400 mb-2 font-medium">Select an effect to place on timeline:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FX_OPTIONS.map((fx) => (
                      <button
                        key={fx.id}
                        onClick={() => {
                          if (onAddEffectToTrack && mediaPickerTrackId) {
                            onAddEffectToTrack(mediaPickerTrackId, fx.id);
                          }
                          setMediaPickerTrackId(null);
                        }}
                        className="p-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#ff6b4a]/20 border border-[#2b2b36] hover:border-[#ff6b4a] text-center transition-all cursor-pointer group"
                      >
                        <span className="text-base block mb-0.5">{fx.icon}</span>
                        <span className="text-[10px] font-semibold text-gray-200 group-hover:text-white block truncate">{fx.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Media Bin Items List */}
            <div>
              <p className="text-[11px] text-gray-400 mb-2 font-medium">Select from your uploaded media:</p>
              {mediaItems.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-xs border border-dashed border-[#2b2b36] rounded-xl">
                  No media in Media Bin yet.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {mediaItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (onAddMediaToTrack && mediaPickerTrackId) {
                          onAddMediaToTrack(mediaPickerTrackId, item);
                        }
                        setMediaPickerTrackId(null);
                      }}
                      className="group relative rounded-xl overflow-hidden border border-[#2b2b36] hover:border-[#ff6b4a] aspect-video bg-black flex items-center justify-center transition-all cursor-pointer"
                    >
                      {item.file.type.startsWith("audio/") ? (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <Music className="w-4 h-4 text-blue-400" />
                          <span className="text-[8px] text-blue-300 font-mono mt-0.5">{fmt(item.duration)}</span>
                        </div>
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white px-1 truncate">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Or upload new file from computer */}
            <div className="border-t border-[#2b2b36] pt-3">
              <button
                onClick={() => {
                  setActiveTrackForUpload(mediaPickerTrackId);
                  fileInputRef.current?.click();
                }}
                className="w-full py-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#ff856b] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Video / Audio File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Time Ruler Component ───────────────────────────────────────────────────
const TimeRuler = React.memo(function TimeRuler({ totalDuration }: { totalDuration: number }) {
  const step = totalDuration > 60 ? 10 : totalDuration > 30 ? 5 : totalDuration > 10 ? 2 : 1;
  const count = Math.ceil(totalDuration);

  return (
    <div className="flex-1 relative h-full pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        if (i % step !== 0) return null;
        return (
          <div
            key={i}
            className="absolute bottom-0 w-px h-2.5 bg-slate-700"
            style={{ left: `${(i / totalDuration) * 100}%` }}
          >
            <span className="absolute bottom-3 -translate-x-1/2 text-[9px] text-slate-400 font-mono font-medium">
              {fmt(i)}
            </span>
          </div>
        );
      })}
    </div>
  );
});
