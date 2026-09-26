"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Scissors } from "lucide-react";
import { EditorClip } from "@/lib/editor/types";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "00:00";
  const total = Math.floor(t);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface EditorTimelineProps {
  duration: number;
  clips: EditorClip[];
  selectedClipId: string | null;
  currentTime: number;
  thumbnails: string[];
  isGeneratingThumbnails: boolean;
  zoom: number;
  onSeek: (t: number) => void;
  onSelectClip: (id: string) => void;
  onEdgeLive: (id: string, side: "start" | "end", time: number) => void;
  onEdgeBegin: () => void;
  onEdgeCommit: () => void;
}

export default function EditorTimeline({
  duration,
  clips,
  selectedClipId,
  currentTime,
  thumbnails,
  isGeneratingThumbnails,
  zoom,
  onSeek,
  onSelectClip,
  onEdgeLive,
  onEdgeBegin,
  onEdgeCommit,
}: EditorTimelineProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<{ id: string; side: "start" | "end" } | null>(null);

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || duration <= 0) return null;
      const rect = el.getBoundingClientRect();
      const rel = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (rel / rect.width) * duration;
    },
    [duration]
  );

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) return;
    const time = timeFromClientX(e.clientX);
    if (time === null) return;
    onSeek(time);
    const hit = clips.find((c) => time >= c.start && time <= c.end);
    if (hit) onSelectClip(hit.id);
  };

  const startDrag = (e: React.PointerEvent, id: string, side: "start" | "end") => {
    e.preventDefault();
    e.stopPropagation();
    onEdgeBegin();
    setDragging({ id, side });
  };

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) => {
      const time = timeFromClientX(e.clientX);
      if (time === null) return;
      onEdgeLive(dragging.id, dragging.side, time);
    };
    const up = () => {
      setDragging(null);
      onEdgeCommit();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, timeFromClientX, onEdgeLive, onEdgeCommit]);

  const minWidth = Math.max(720, 720 * zoom);

  return (
    <div className="overflow-x-auto pb-2">
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        className="relative h-[128px] select-none cursor-crosshair"
        style={{ minWidth: `${minWidth}px` }}
      >
        {/* Thumbnail strip */}
        <div className="absolute inset-x-0 top-5 h-[82px] overflow-hidden rounded-xl border border-white/[0.1] bg-slate-900">
          {thumbnails.length > 0 ? (
            <div className="flex h-full w-full">
              {thumbnails.map((t, i) => (
                <div key={i} className="h-full min-w-0 flex-1 border-r border-black/20 last:border-r-0">
                  {t ? (
                    <img src={t} alt="" draggable={false} className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <div className="h-full w-full bg-slate-800" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              {isGeneratingThumbnails ? "Generating timeline preview..." : "Timeline"}
            </div>
          )}
        </div>

        {/* Removed gaps between kept clips */}
        {clips.slice(0, -1).map((clip, i) => {
          const next = clips[i + 1];
          const left = (clip.end / duration) * 100;
          const width = ((next.start - clip.end) / duration) * 100;
          if (width <= 0) return null;
          return (
            <div
              key={`gap-${clip.id}`}
              className="absolute top-5 h-[82px] bg-rose-950/70 flex items-center justify-center"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <span className="rotate-[-90deg] whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-rose-300/70">
                Removed
              </span>
            </div>
          );
        })}

        {/* Clips */}
        {clips.map((clip, index) => {
          const left = (clip.start / duration) * 100;
          const width = ((clip.end - clip.start) / duration) * 100;
          const selected = clip.id === selectedClipId;

          return (
            <div key={clip.id}>
              {index > 0 && (
                <div
                  className="absolute top-3 z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                >
                  <div className="bg-emerald-500 rounded-full p-1 shadow-lg">
                    <Scissors className="h-3 w-3 text-white" />
                  </div>
                  <div className="w-px h-[90px] bg-emerald-400/70" />
                </div>
              )}

              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectClip(clip.id);
                }}
                className={`absolute top-5 h-[82px] rounded-lg border-2 transition ${
                  selected ? "border-emerald-400" : "border-white/30"
                }`}
                style={{ left: `${left}%`, width: `${width}%`, minWidth: "8px" }}
              >
                {selected && (
                  <>
                    <button
                      onPointerDown={(e) => startDrag(e, clip.id, "start")}
                      className="absolute left-[-5px] top-[-2px] z-30 flex h-[86px] w-3 cursor-ew-resize items-center justify-center rounded-l-md bg-emerald-400"
                      aria-label="Drag clip start"
                    >
                      <span className="h-7 w-1 rounded-full bg-white/90" />
                    </button>
                    <button
                      onPointerDown={(e) => startDrag(e, clip.id, "end")}
                      className="absolute right-[-5px] top-[-2px] z-30 flex h-[86px] w-3 cursor-ew-resize items-center justify-center rounded-r-md bg-emerald-400"
                      aria-label="Drag clip end"
                    >
                      <span className="h-7 w-1 rounded-full bg-white/90" />
                    </button>
                  </>
                )}

                <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                  Clip {index + 1}
                </div>

                {selected && width > 8 && (
                  <div className="absolute left-1 bottom-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                    {fmt(clip.start)} - {fmt(clip.end)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Playhead */}
        {duration > 0 && (
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-40 w-px bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
          >
            <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-b-sm bg-white" />
          </div>
        )}

        {/* Ruler */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] font-mono text-slate-500">
          <span>00:00</span>
          <span>{fmt(duration / 2)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}