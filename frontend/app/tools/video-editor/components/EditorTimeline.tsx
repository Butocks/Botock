"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Scissors } from "lucide-react";
import { EditorClip, getTimelinePositions, MediaBinItem } from "@/lib/editor/types";
import TransitionPicker from "./TransitionPicker";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "00:00";
  const total = Math.floor(t);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const SOURCE_COLORS = [
  "border-emerald-400",
  "border-sky-400",
  "border-violet-400",
  "border-amber-400",
  "border-rose-400",
  "border-teal-400",
];

interface EditorTimelineProps {
  clips: EditorClip[];
  mediaItems: MediaBinItem[];
  selectedClipId: string | null;
  currentTime: number; // virtual timeline time
  thumbnailsBySource: Record<string, string[]>;
  zoom: number;
  onSeek: (t: number) => void;
  onSelectClip: (id: string) => void;
  onEdgeLive: (id: string, side: "start" | "end", localTime: number) => void;
  onEdgeBegin: () => void;
  onEdgeCommit: () => void;
  onTransitionChange: (clipId: string, type: EditorClip["transitionOut"], duration: number) => void;
}

export default function EditorTimeline({
  clips,
  mediaItems,
  selectedClipId,
  currentTime,
  thumbnailsBySource,
  zoom,
  onSeek,
  onSelectClip,
  onEdgeLive,
  onEdgeBegin,
  onEdgeCommit,
  onTransitionChange,
}: EditorTimelineProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<{ id: string; side: "start" | "end" } | null>(null);

  const positions = getTimelinePositions(clips);
  const totalDuration = positions.length > 0 ? positions[positions.length - 1].timelineEnd : 0;

  const sourceIndexOf = (sourceId: string) => {
    const idx = mediaItems.findIndex((m) => m.id === sourceId);
    return idx === -1 ? 0 : idx % SOURCE_COLORS.length;
  };

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || totalDuration <= 0) return null;
      const rect = el.getBoundingClientRect();
      const rel = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (rel / rect.width) * totalDuration;
    },
    [totalDuration]
  );

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) return;
    const time = timeFromClientX(e.clientX);
    if (time === null) return;
    onSeek(time);
    const hit = positions.find((p) => time >= p.timelineStart && time <= p.timelineEnd);
    if (hit) onSelectClip(hit.clip.id);
  };

  const startDrag = (e: React.PointerEvent, id: string, side: "start" | "end") => {
    e.preventDefault();
    e.stopPropagation();
    onEdgeBegin();
    setDragging({ id, side });
  };

  useEffect(() => {
    if (!dragging) return;
    const activePos = positions.find((p) => p.clip.id === dragging.id);
    if (!activePos) return;

    const move = (e: PointerEvent) => {
      const virtualTime = timeFromClientX(e.clientX);
      if (virtualTime === null) return;
      // Convert virtual timeline time to local source time for this clip.
      const localTime = activePos.clip.sourceStart + (virtualTime - activePos.timelineStart) * activePos.clip.speed;
      onEdgeLive(dragging.id, dragging.side, localTime);
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
  }, [dragging, positions, timeFromClientX, onEdgeLive, onEdgeCommit]);

  const minWidth = Math.max(720, 720 * zoom);

  return (
    <div className="overflow-x-auto pb-2">
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        className="relative h-[128px] select-none cursor-crosshair"
        style={{ minWidth: `${minWidth}px` }}
      >
        {/* Background Filmstrip */}
        <div className="absolute inset-x-0 top-5 h-[82px] overflow-hidden rounded-xl border border-white/[0.1] bg-slate-900 flex">
          {positions.map(({ clip, timelineStart, timelineEnd }) => {
            const widthPct = totalDuration > 0 ? ((timelineEnd - timelineStart) / totalDuration) * 100 : 0;
            const thumbs = thumbnailsBySource[clip.sourceId] || [];
            return (
              <div key={clip.id} className="h-full flex border-r border-black/40 overflow-hidden" style={{ width: `${widthPct}%` }}>
                {thumbs.length > 0 ? (
                  thumbs.slice(0, 6).map((t, i) => (
                    <div key={i} className="h-full flex-1 min-w-0">
                      {t ? (
                        <img src={t} alt="" draggable={false} className="h-full w-full object-cover opacity-70" />
                      ) : (
                        <div className="h-full w-full bg-slate-800" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full w-full bg-slate-800" />
                )}
              </div>
            );
          })}
        </div>

        {/* Clip Overlays & Controls */}
        {positions.map(({ clip, timelineStart, timelineEnd }, index) => {
          const left = totalDuration > 0 ? (timelineStart / totalDuration) * 100 : 0;
          const width = totalDuration > 0 ? ((timelineEnd - timelineStart) / totalDuration) * 100 : 0;
          const selected = clip.id === selectedClipId;
          const colorClass = SOURCE_COLORS[sourceIndexOf(clip.sourceId)];

          return (
            <div key={clip.id}>
              {index > 0 && (
                <div
                  className="absolute top-3 z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: `${left}%`, transform: "translateX(-50%)" }}
                >
                  <div className="bg-emerald-500 rounded-full p-1 shadow-lg pointer-events-auto">
                    <Scissors className="h-3 w-3 text-white" />
                  </div>
                  <div className="w-px h-[90px] bg-emerald-400/70" />
                </div>
              )}

              {/* Transition picker sits at the END of every clip except the last */}
              {index < positions.length - 1 && (
                <div className="pointer-events-auto">
                  <TransitionPicker
                    leftPercent={(timelineEnd / totalDuration) * 100}
                    value={clip.transitionOut}
                    duration={clip.transitionDuration}
                    onChange={(type, dur) => onTransitionChange(clip.id, type, dur)}
                  />
                </div>
              )}

              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectClip(clip.id);
                }}
                className={`absolute top-5 h-[82px] rounded-lg border-2 transition ${
                  selected ? "border-emerald-400 shadow-md ring-1 ring-emerald-400/50" : colorClass + "/50"
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

                <div className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-white">
                  Clip {index + 1}
                </div>

                {selected && width > 8 && (
                  <div className="absolute left-1 bottom-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-white">
                    {fmt(timelineStart)} - {fmt(timelineEnd)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Playhead */}
        {totalDuration > 0 && (
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-40 w-px bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            style={{ left: `${Math.min(100, Math.max(0, (currentTime / totalDuration) * 100))}%` }}
          >
            <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-b-sm bg-white shadow" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] font-mono text-slate-500">
          <span>00:00</span>
          <span>{fmt(totalDuration / 2)}</span>
          <span>{fmt(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}