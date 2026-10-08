"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { 
  EditorProject, 
  TimelineTrack, 
  TimelineClip, 
  cloneProject, 
  createProject, 
  createTrack, 
  createClip 
} from "./types";

const MIN_CLIP_DURATION = 0.05;

function clampNum(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function useEditorTimeline() {
  const [project, setProject] = useState<EditorProject>(createProject());
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  
  const [undoStack, setUndoStack] = useState<EditorProject[]>([]);
  const [redoStack, setRedoStack] = useState<EditorProject[]>([]);
  
  const dragSnapshotRef = useRef<EditorProject | null>(null);
  const livePatchSnapshotRef = useRef<EditorProject | null>(null);

  const pushHistory = useCallback((prev: EditorProject) => {
    setUndoStack((u) => [...u, cloneProject(prev)]);
    setRedoStack([]);
  }, []);

  const reset = useCallback(() => {
    setProject(createProject());
    setSelectedClipId(null);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const addTrack = useCallback((type: TimelineTrack["type"], name: string) => {
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      next.tracks.push(createTrack(type, name));
      return next;
    });
  }, [pushHistory]);

  const deleteTrack = useCallback((trackId: string) => {
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      next.tracks = next.tracks.filter(t => t.id !== trackId);
      return next;
    });
  }, [pushHistory]);

  const updateTrack = useCallback((trackId: string, patch: Partial<TimelineTrack>) => {
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      const track = next.tracks.find(t => t.id === trackId);
      if (track) Object.assign(track, patch);
      return next;
    });
  }, [pushHistory]);

  const addClip = useCallback((trackId: string, sourceId: string, type: TimelineClip["type"], timelineStart: number, sourceDuration: number) => {
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      const track = next.tracks.find(t => t.id === trackId);
      if (track) {
         const clip = createClip(sourceId, trackId, type, timelineStart, sourceDuration);
         track.clips.push(clip);
         track.clips.sort((a, b) => a.timelineStart - b.timelineStart);
         setSelectedClipId(clip.id);
      }
      return next;
    });
  }, [pushHistory]);

  const deleteClip = useCallback((clipId: string) => {
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      for (const track of next.tracks) {
        track.clips = track.clips.filter(c => c.id !== clipId);
      }
      if (selectedClipId === clipId) setSelectedClipId(null);
      return next;
    });
  }, [pushHistory, selectedClipId]);

  const splitAt = useCallback((virtualTime: number) => {
    setProject(prev => {
      let madeChanges = false;
      const next = cloneProject(prev);
      
      for (const track of next.tracks) {
        const newClips: TimelineClip[] = [];
        for (const clip of track.clips) {
          const clipEnd = clip.timelineStart + clip.duration;
          if (virtualTime > clip.timelineStart + MIN_CLIP_DURATION && virtualTime < clipEnd - MIN_CLIP_DURATION) {
            // Split it
            madeChanges = true;
            const splitRatio = (virtualTime - clip.timelineStart) / clip.duration;
            const localSplitTime = clip.sourceStart + (clip.sourceEnd - clip.sourceStart) * splitRatio;
            
            const first: TimelineClip = {
              ...clip,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}a`,
              duration: virtualTime - clip.timelineStart,
              sourceEnd: localSplitTime
            };
            const second: TimelineClip = {
              ...clip,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}b`,
              timelineStart: virtualTime,
              duration: clipEnd - virtualTime,
              sourceStart: localSplitTime
            };
            newClips.push(first, second);
            if (selectedClipId === clip.id) setSelectedClipId(second.id);
          } else {
            newClips.push(clip);
          }
        }
        track.clips = newClips;
      }
      
      if (madeChanges) {
        pushHistory(prev);
        return next;
      }
      return prev;
    });
  }, [pushHistory, selectedClipId]);

  const duplicateClip = useCallback((clipId: string) => {
    setProject(prev => {
      const next = cloneProject(prev);
      for (const track of next.tracks) {
        const idx = track.clips.findIndex(c => c.id === clipId);
        if (idx !== -1) {
          pushHistory(prev);
          const source = track.clips[idx];
          const copy: TimelineClip = {
            ...source,
            id: `${Date.now()}-copy`,
            timelineStart: source.timelineStart + source.duration, // place right after
          };
          track.clips.splice(idx + 1, 0, copy);
          // Shift subsequent clips
          for (let i = idx + 2; i < track.clips.length; i++) {
             track.clips[i].timelineStart += copy.duration;
          }
          setSelectedClipId(copy.id);
          break;
        }
      }
      return next;
    });
  }, [pushHistory]);

  const beginLiveUpdate = useCallback(() => {
    livePatchSnapshotRef.current = cloneProject(project);
  }, [project]);

  const commitLiveUpdate = useCallback(() => {
    if (livePatchSnapshotRef.current) {
      pushHistory(livePatchSnapshotRef.current);
      livePatchSnapshotRef.current = null;
    }
  }, [pushHistory]);

  const updateClipLive = useCallback((clipId: string, patch: Partial<TimelineClip>) => {
    setProject(prev => {
      const next = cloneProject(prev);
      for (const track of next.tracks) {
        const clip = track.clips.find(c => c.id === clipId);
        if (clip) {
          Object.assign(clip, patch);
          if (patch.speed !== undefined) {
             const newSpeed = clampNum(patch.speed, 0.25, 4);
             clip.speed = newSpeed;
             clip.duration = (clip.sourceEnd - clip.sourceStart) / newSpeed;
          }
          break;
        }
      }
      return next;
    });
  }, []);

  const updateClipEdgeLive = useCallback((clipId: string, side: "start" | "end", virtualDelta: number, maxSourceDuration: number) => {
    setProject(prev => {
      const next = cloneProject(prev);
      for (const track of next.tracks) {
        const clipIdx = track.clips.findIndex(c => c.id === clipId);
        if (clipIdx !== -1) {
          const clip = track.clips[clipIdx];
          const previousClip = clipIdx > 0 ? track.clips[clipIdx - 1] : null;
          const nextClip = clipIdx < track.clips.length - 1 ? track.clips[clipIdx + 1] : null;

          if (side === "start") {
             const minTimelineStart = previousClip ? previousClip.timelineStart + previousClip.duration : 0;
             const maxTimelineStart = clip.timelineStart + clip.duration - MIN_CLIP_DURATION;
             
             const newTimelineStart = clampNum(clip.timelineStart + virtualDelta, minTimelineStart, maxTimelineStart);
             const timeShift = newTimelineStart - clip.timelineStart;
             
             const speedAdjustedShift = timeShift * clip.speed;
             const newSourceStart = clampNum(clip.sourceStart + speedAdjustedShift, 0, clip.sourceEnd - MIN_CLIP_DURATION);
             
             // Recalculate accurate timeline start based on clamped source
             const accurateTimeShift = (newSourceStart - clip.sourceStart) / clip.speed;
             clip.timelineStart = clip.timelineStart + accurateTimeShift;
             clip.duration = clip.duration - accurateTimeShift;
             clip.sourceStart = newSourceStart;
             
          } else {
             const maxTimelineEnd = nextClip ? nextClip.timelineStart : 999999;
             const minTimelineEnd = clip.timelineStart + MIN_CLIP_DURATION;
             
             const newTimelineEnd = clampNum(clip.timelineStart + clip.duration + virtualDelta, minTimelineEnd, maxTimelineEnd);
             const timeShift = newTimelineEnd - (clip.timelineStart + clip.duration);
             
             const speedAdjustedShift = timeShift * clip.speed;
             const newSourceEnd = clampNum(clip.sourceEnd + speedAdjustedShift, clip.sourceStart + MIN_CLIP_DURATION, maxSourceDuration);
             
             const accurateTimeShift = (newSourceEnd - clip.sourceEnd) / clip.speed;
             clip.duration = clip.duration + accurateTimeShift;
             clip.sourceEnd = newSourceEnd;
          }
          break;
        }
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setProject((current) => {
        setRedoStack((r) => [...r, cloneProject(current)]);
        return cloneProject(last);
      });
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setProject((current) => {
        setUndoStack((u) => [...u, cloneProject(current)]);
        return cloneProject(last);
      });
      return prev.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const handleUpdateProject = (e: any) => {
      setProject(prev => {
        pushHistory(prev);
        const next = cloneProject(prev);
        if (e.detail.width) next.width = e.detail.width;
        if (e.detail.height) next.height = e.detail.height;
        if (e.detail.fps) next.fps = e.detail.fps;
        return next;
      });
    };
    const handleDeleteTrack = (e: any) => {
      deleteTrack(e.detail.id);
    };
    window.addEventListener('editor-delete-track', handleDeleteTrack);
    window.addEventListener('editor-update-project', handleUpdateProject);
    return () => {
       window.removeEventListener('editor-update-project', handleUpdateProject);
       window.removeEventListener('editor-delete-track', handleDeleteTrack);
    };
  }, [pushHistory, deleteTrack]);

  return {
    project,
    selectedClipId,
    setSelectedClipId,
    addTrack,
    deleteTrack,
    updateTrack,
    addClip,
    splitAt,
    deleteClip,
    duplicateClip,
    updateClipLive,
    updateClipEdgeLive,
    beginLiveUpdate,
    commitLiveUpdate,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    reset,
  };
}
