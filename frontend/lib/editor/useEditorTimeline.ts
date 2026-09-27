"use client";

import { useCallback, useRef, useState } from "react";
import { EditorClip, cloneClips, createClip, getTimelinePositions } from "./types";

const MIN_CLIP_DURATION = 0.05;

function clampNum(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function useEditorTimeline() {
  const [clips, setClips] = useState<EditorClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<EditorClip[][]>([]);
  const [redoStack, setRedoStack] = useState<EditorClip[][]>([]);
  const dragSnapshotRef = useRef<EditorClip[] | null>(null);

  const pushHistory = useCallback((prev: EditorClip[]) => {
    setUndoStack((u) => [...u, cloneClips(prev)]);
    setRedoStack([]);
  }, []);

  /** Start a brand-new timeline from a single source's full duration. */
  const initFromSource = useCallback((sourceId: string, duration: number) => {
    const clip = createClip(sourceId, 0, duration);
    setClips([clip]);
    setSelectedClipId(clip.id);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  /** Append a new clip (from any media-bin source) to the end of the timeline. */
  const appendClipFromSource = useCallback(
    (sourceId: string, sourceStart: number, sourceEnd: number) => {
      setClips((prev) => {
        pushHistory(prev);
        const clip = createClip(sourceId, sourceStart, sourceEnd);
        setSelectedClipId(clip.id);
        return [...prev, clip];
      });
    },
    [pushHistory]
  );

  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

  /** Split whichever clip contains `virtualTime` (timeline seconds). */
  const splitAt = useCallback(
    (virtualTime: number) => {
      setClips((prev) => {
        const positions = getTimelinePositions(prev);
        const hit = positions.find(
          (p) => virtualTime > p.timelineStart + MIN_CLIP_DURATION && virtualTime < p.timelineEnd - MIN_CLIP_DURATION
        );
        if (!hit) return prev;

        pushHistory(prev);

        const localSplit = hit.clip.sourceStart + (virtualTime - hit.timelineStart) * hit.clip.speed;

        const first: EditorClip = { ...hit.clip, id: `${Date.now()}-a`, sourceEnd: localSplit, filters: { ...hit.clip.filters }, transitionOut: "none" };
        const second: EditorClip = { ...hit.clip, id: `${Date.now()}-b`, sourceStart: localSplit, filters: { ...hit.clip.filters } };

        const next = prev.flatMap((c) => (c.id === hit.clip.id ? [first, second] : [c]));
        setSelectedClipId(second.id);
        return next;
      });
    },
    [pushHistory]
  );

  const deleteClip = useCallback(
    (id: string) => {
      setClips((prev) => {
        if (prev.length <= 1) return prev;
        pushHistory(prev);
        const next = prev.filter((c) => c.id !== id);
        setSelectedClipId(next[0]?.id ?? null);
        return next;
      });
    },
    [pushHistory]
  );

  const duplicateClip = useCallback(
    (id: string) => {
      setClips((prev) => {
        const idx = prev.findIndex((c) => c.id === id);
        if (idx === -1) return prev;
        pushHistory(prev);
        const source = prev[idx];
        const copy: EditorClip = { ...source, id: `${Date.now()}-copy`, filters: { ...source.filters } };
        const next = [...prev];
        next.splice(idx + 1, 0, copy);
        setSelectedClipId(copy.id);
        return next;
      });
    },
    [pushHistory]
  );

  const reorderClip = useCallback(
    (fromIndex: number, toIndex: number) => {
      setClips((prev) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length || fromIndex === toIndex) {
          return prev;
        }
        pushHistory(prev);
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [pushHistory]
  );

  const updateClip = useCallback(
    (id: string, patch: Partial<EditorClip>) => {
      setClips((prev) => {
        pushHistory(prev);
        return prev.map((c) =>
          c.id === id ? { ...c, ...patch, filters: { ...c.filters, ...(patch.filters || {}) } } : c
        );
      });
    },
    [pushHistory]
  );

  /** Live edge-drag in LOCAL source time (since clip may not start the timeline at 0). */
  const updateClipEdgeLive = useCallback((id: string, side: "start" | "end", localTime: number, sourceDuration: number) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (side === "start") return { ...c, sourceStart: clampNum(localTime, 0, c.sourceEnd - MIN_CLIP_DURATION) };
        return { ...c, sourceEnd: clampNum(localTime, c.sourceStart + MIN_CLIP_DURATION, sourceDuration) };
      })
    );
  }, []);

  const beginEdgeDrag = useCallback(() => {
    dragSnapshotRef.current = cloneClips(clips);
  }, [clips]);

  const commitEdgeDrag = useCallback(() => {
    if (dragSnapshotRef.current) {
      pushHistory(dragSnapshotRef.current);
      dragSnapshotRef.current = null;
    }
  }, [pushHistory]);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setClips((current) => {
        setRedoStack((r) => [...r, cloneClips(current)]);
        return cloneClips(last);
      });
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setClips((current) => {
        setUndoStack((u) => [...u, cloneClips(current)]);
        return cloneClips(last);
      });
      return prev.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    setClips([]);
    setSelectedClipId(null);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    clips,
    selectedClipId,
    setSelectedClipId,
    selectedClip,
    initFromSource,
    appendClipFromSource,
    splitAt,
    deleteClip,
    duplicateClip,
    reorderClip,
    updateClip,
    updateClipEdgeLive,
    beginEdgeDrag,
    commitEdgeDrag,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    reset,
  };
}