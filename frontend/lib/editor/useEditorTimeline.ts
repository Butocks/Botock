"use client";

import { useCallback, useRef, useState } from "react";
import { EditorClip, cloneClips, createClip } from "./types";

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

  const initFromDuration = useCallback((duration: number) => {
    const clip = createClip(0, duration);
    setClips([clip]);
    setSelectedClipId(clip.id);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

  const splitAt = useCallback(
    (time: number) => {
      setClips((prev) => {
        const target = prev.find(
          (c) => time > c.start + MIN_CLIP_DURATION && time < c.end - MIN_CLIP_DURATION
        );
        if (!target) return prev;

        pushHistory(prev);

        const first: EditorClip = { ...target, id: `${Date.now()}-a`, end: time, filters: { ...target.filters } };
        const second: EditorClip = { ...target, id: `${Date.now()}-b`, start: time, filters: { ...target.filters } };

        const next = prev.flatMap((c) => (c.id === target.id ? [first, second] : [c]));
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
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex >= prev.length ||
          fromIndex === toIndex
        ) {
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

  // Live edge-drag: no history spam while dragging.
  const updateClipEdgeLive = useCallback((id: string, side: "start" | "end", time: number, duration: number) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (side === "start") return { ...c, start: clampNum(time, 0, c.end - MIN_CLIP_DURATION) };
        return { ...c, end: clampNum(time, c.start + MIN_CLIP_DURATION, duration) };
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
    initFromDuration,
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