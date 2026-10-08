import React, { useRef, useEffect, useState, useMemo } from "react";
import { Scissors, MousePointer2, ZoomIn, ZoomOut, MoveHorizontal, Undo2, Redo2, Settings, Eye, EyeOff, Lock, Unlock, Volume2, VolumeX, SquareSplitHorizontal as SplitSquareHorizontal } from "lucide-react";
import { EditorProject, MediaBinItem } from "@/lib/editor/types";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "00:00.0";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t % 1) * 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
}

const SOURCE_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-indigo-500", "bg-teal-500"];

const TrackLane = React.memo(function TrackLane({ track, totalDuration, selectedClipId, onSelectClip, startDrag, sourceIndexOf, thumbnailsBySource, waveformsBySource, mediaItems }: any) {
  return (
    <div key={track.id} className="relative flex h-24 border-b border-slate-800 group">
      {/* Track Header (Sticky Left) */}
      <div className="w-[150px] shrink-0 bg-slate-900/95 backdrop-blur border-r border-slate-800 p-2 flex flex-col justify-center gap-2 sticky left-0 z-20 group-hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">{track.name}</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">{track.type}</span>
          </div>
          <div className="flex gap-1.5">
            <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
      </div>

      {/* Track Content Lane */}
      <div className="flex-1 relative overflow-hidden bg-slate-900/20">
          {track.clips.map((clip: any) => {
            const leftPct = totalDuration > 0 ? (clip.timelineStart / totalDuration) * 100 : 0;
            const widthPct = totalDuration > 0 ? (clip.duration / totalDuration) * 100 : 0;
            const selected = clip.id === selectedClipId;
            const colorClass = SOURCE_COLORS[sourceIndexOf(clip.sourceId)];
            const thumbs = thumbnailsBySource[clip.sourceId] || [];

            return (
              <div
                key={clip.id}
                onPointerDown={(e) => { e.stopPropagation(); onSelectClip(clip.id); }}
                className={`absolute top-2 bottom-2 rounded-lg border-2 overflow-hidden transition-all ${
                  selected ? "border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.5)] z-10" : colorClass + "/50 border-transparent hover:border-white/20"
                }`}
                style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "2px" }}
              >
                {/* Filmstrip / Waveform bg */}
                <div className="absolute inset-0 flex bg-slate-800 opacity-60 pointer-events-none">
                    {clip.type === "video" && thumbs.length > 0 && thumbs.slice(0, 10).map((t: string, i: number) => (
                      <div key={i} className="h-full flex-1 min-w-0 border-r border-black/20">
                        {t && <img src={t} alt="" draggable={false} className="h-full w-full object-cover" />}
                      </div>
                    ))}
                </div>

                {/* Trimming Handles */}
                {selected && (
                  <>
                    <button
                      onPointerDown={(e) => startDrag(e, clip.id, "start")}
                      className="absolute left-0 top-0 bottom-0 z-30 flex w-3 cursor-ew-resize items-center justify-center bg-emerald-500/90 hover:bg-emerald-400"
                    >
                      <span className="h-4 w-0.5 rounded-full bg-white" />
                    </button>
                    <button
                      onPointerDown={(e) => startDrag(e, clip.id, "end")}
                      className="absolute right-0 top-0 bottom-0 z-30 flex w-3 cursor-ew-resize items-center justify-center bg-emerald-500/90 hover:bg-emerald-400"
                    >
                      <span className="h-4 w-0.5 rounded-full bg-white" />
                    </button>
                  </>
                )}

                <div className="absolute left-3 top-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white truncate max-w-[80%] backdrop-blur-sm pointer-events-none">
                  {clip.type === "video" ? "Video" : clip.type === "text" ? "Text" : "Audio"} • {fmt(clip.duration)}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
});

const TimeRuler = React.memo(function TimeRuler({ totalDuration }: { totalDuration: number }) {
  return (
    <div className="flex-1 relative h-full pointer-events-none">
      {Array.from({ length: Math.ceil(totalDuration) }).map((_, i) => (
         <div key={i} className="absolute bottom-0 w-px h-2 bg-slate-700" style={{ left: `${(i / totalDuration) * 100}%` }}>
            {i % 5 === 0 && <span className="absolute bottom-3 -translate-x-1/2 text-[9px] text-slate-500 font-mono">{fmt(i)}</span>}
         </div>
      ))}
    </div>
  );
});

type Props = {
  project: EditorProject;
  mediaItems: MediaBinItem[];
  currentTime: number;
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
  onSeek: (t: number) => void;
  onEdgeBegin: () => void;
  onEdgeLive: (id: string, side: "start" | "end", virtualDelta: number, maxSourceDuration: number) => void;
  onEdgeCommit: () => void;
  onSplit: (time: number) => void;
  zoom: number;
  thumbnailsBySource: Record<string, string[]>;
  waveformsBySource: Record<string, number[]>;
};

export default function EditorTimeline({
  project,
  mediaItems,
  currentTime,
  selectedClipId,
  onSelectClip,
  onSeek,
  onEdgeBegin,
  onEdgeLive,
  onEdgeCommit,
  zoom,
  thumbnailsBySource,
  waveformsBySource
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const totalDuration = useMemo(() => {
    let maxT = 10;
    project.tracks.forEach(t => t.clips.forEach(c => {
      if (c.timelineStart + c.duration > maxT) maxT = c.timelineStart + c.duration;
    }));
    return maxT + 5; 
  }, [project]);

  const uniqueSources = useMemo(() => {
    const s = new Set<string>();
    project.tracks.forEach(t => t.clips.forEach(c => s.add(c.sourceId)));
    return Array.from(s);
  }, [project]);

  const sourceIndexOf = (id: string) => {
    const i = uniqueSources.indexOf(id);
    return i >= 0 ? i % SOURCE_COLORS.length : 0;
  };

  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 150; 
    if (x < 0) return;
    const w = rect.width - 150;
    const t = Math.max(0, (x / w) * totalDuration);
    onSeek(t);
  };

  const [dragging, setDragging] = useState<{ id: string; side: "start" | "end"; startX: number; originalT: number } | null>(null);
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);

  const startDrag = (e: React.PointerEvent, id: string, side: "start" | "end") => {
    e.stopPropagation();
    onEdgeBegin();
    setDragging({ id, side, startX: e.clientX, originalT: 0 });
  };

  useEffect(() => {
    const handleTimeUpdate = (e: any) => {
      const t = e.detail;
      const el = document.getElementById("editor-playhead");
      if (el && totalDuration > 0) {
        el.style.left = `${(t / totalDuration) * 100}%`;
      }
    };
    window.addEventListener('editor-time-update', handleTimeUpdate);
    return () => window.removeEventListener('editor-time-update', handleTimeUpdate);
  }, [totalDuration]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const w = rect.width - 150;
      const deltaX = e.clientX - dragging.startX;
      const virtualDeltaT = (deltaX / w) * totalDuration;

      let clipItem = null;
      for (const t of project.tracks) {
        clipItem = t.clips.find(c => c.id === dragging.id);
        if (clipItem) break;
      }
      if (!clipItem) return;

      const media = mediaItems.find(m => m.id === clipItem.sourceId);
      const maxSourceDur = media ? media.duration : clipItem.sourceEnd;

      onEdgeLive(dragging.id, dragging.side, virtualDeltaT, maxSourceDur);
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
  }, [dragging, project, mediaItems, totalDuration, onEdgeLive, onEdgeCommit]);

  useEffect(() => {
    if (!draggingPlayhead) return;
    const move = (e: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const w = rect.width - 150;
      const x = e.clientX - rect.left - 150;
      const t = Math.max(0, Math.min(totalDuration, (x / w) * totalDuration));
      onSeek(t);
    };
    const up = () => {
      setDraggingPlayhead(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [draggingPlayhead, totalDuration, onSeek]);

  const minWidth = Math.max(800, 800 * zoom);

  return (
    <div className="overflow-auto w-full h-full flex flex-col relative bg-[#1a1a20]">
      
      {/* Time Ruler (Top) */}
      <div 
        className="sticky top-0 z-30 h-8 bg-slate-900 border-b border-slate-800 flex items-end select-none cursor-text" 
        style={{ minWidth: `${minWidth}px` }}
        onPointerDown={handleTrackPointerDown}
      >
         <div className="w-[150px] shrink-0 border-r border-slate-800 h-full flex items-center px-4 bg-slate-900/90 backdrop-blur z-40 sticky left-0 cursor-default">
           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tracks</span>
         </div>
         <TimeRuler totalDuration={totalDuration} />
      </div>

      <div 
        ref={trackRef} 
        className="relative flex-1 flex flex-col select-none" 
        style={{ minWidth: `${minWidth}px` }}
        onPointerDown={handleTrackPointerDown}
      >
        {project.tracks.map((track) => (
          <TrackLane 
            key={track.id}
            track={track}
            totalDuration={totalDuration}
            selectedClipId={selectedClipId}
            onSelectClip={onSelectClip}
            startDrag={startDrag}
            sourceIndexOf={sourceIndexOf}
            thumbnailsBySource={thumbnailsBySource}
            waveformsBySource={waveformsBySource}
            mediaItems={mediaItems}
          />
        ))}
        
        {/* Playhead Overlay */}
        <div className="absolute inset-y-0 right-0 z-40 pointer-events-none" style={{ left: '150px' }}>
          {totalDuration > 0 && (
            <div
              id="editor-playhead"
              className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-auto cursor-ew-resize group"
              style={{ left: `${(currentTime / totalDuration) * 100}%`, transform: 'translateX(-50%)', width: '20px' }}
              onPointerDown={(e) => { e.stopPropagation(); setDraggingPlayhead(true); }}
            >
              <div className="w-[2px] h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] relative">
                 <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-emerald-400 shadow pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
