"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { 
  EditorProject, 
  TimelineTrack, 
  TimelineClip, 
  cloneProject, 
  createProject, 
  createTrack, 
  createClip,
  MediaBinItem,
  Transform
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

  const importSRT = useCallback((srtText: string) => {
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      const track = createTrack("video", "Captions");
      next.tracks.push(track);
      
      const blocks = srtText.trim().replace(/\r\n/g, "\n").split("\n\n");
      blocks.forEach(block => {
          const lines = block.split("\n");
          if (lines.length >= 3) {
              const timeLine = lines[1];
              const textLines = lines.slice(2).join("\n");
              const times = timeLine.split(" --> ");
              if (times.length === 2) {
                  const parseTime = (ts: string) => {
                      const p = ts.split(/[:,]/);
                      if (p.length !== 4) return 0;
                      return parseInt(p[0]) * 3600 + parseInt(p[1]) * 60 + parseInt(p[2]) + parseInt(p[3]) / 1000;
                  };
                  const start = parseTime(times[0]);
                  const end = parseTime(times[1]);
                  if (end > start) {
                      const clip = createClip(track.id, "text_source", "text", start, end - start);
                      clip.text = textLines;
                      if (clip.transform) {
                          clip.transform.y = 80;
                          clip.transform.x = 50;
                      }
                      clip.fontSizePercent = 5;
                      track.clips.push(clip);
                  }
              }
          }
      });
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
    const clip = createClip(sourceId, trackId, type, timelineStart, sourceDuration);
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      let track = next.tracks.find(t => t.id === trackId);
      if (!track) {
        track = next.tracks.find(t => t.type === type);
      }
      if (!track) {
        const defaultName = type === "effect" ? "FX" : type === "text" ? "Sub" : type === "audio" ? "A1" : "V1";
        track = createTrack(type === "text" ? "text" : type === "effect" ? "effect" : type === "audio" ? "audio" : "video", defaultName);
        next.tracks.push(track);
      }
      clip.trackId = track.id;
      track.clips.push(clip);
      track.clips.sort((a, b) => a.timelineStart - b.timelineStart);
      return next;
    });
    setSelectedClipId(clip.id);
    return clip.id;
  }, [pushHistory]);

  const addEffectClip = useCallback((effectType: string, atTime: number, duration = 2.0, targetTrackId?: string) => {
    const newClipId = `fx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSelectedClipId(newClipId);
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      let track = targetTrackId 
        ? next.tracks.find(t => t.id === targetTrackId)
        : next.tracks.find(t => t.type === "effect" || t.name === "FX");
      
      if (!track) {
        track = createTrack("effect", "FX");
        // Place FX track directly above video tracks (above V1 or at top)
        const v1Idx = next.tracks.findIndex(t => t.name === "V1");
        if (v1Idx >= 0) {
          next.tracks.splice(v1Idx, 0, track);
        } else {
          next.tracks.unshift(track);
        }
      }

      const clip = createClip("fx_source", track.id, "effect", atTime, duration);
      clip.id = newClipId;
      clip.text = effectType.toUpperCase();
      clip.effects = [{ id: `eff-${Date.now()}`, type: effectType, intensity: 1, duration }];

      track.clips.push(clip);
      track.clips.sort((a, b) => a.timelineStart - b.timelineStart);
      return next;
    });
    return newClipId;
  }, [pushHistory]);

  const addTextClip = useCallback((text: string, atTime: number, duration = 3.0, extra?: Partial<TimelineClip>, targetTrackId?: string) => {
    const newClipId = `txt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSelectedClipId(newClipId);
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      let track = targetTrackId 
        ? next.tracks.find(t => t.id === targetTrackId)
        : next.tracks.find(t => t.type === "text" || t.name.toLowerCase().includes("sub") || t.name.toLowerCase().includes("caption"));
      
      if (!track) {
        track = createTrack("text", "Sub");
        // Place Sub track above video tracks
        const v1Idx = next.tracks.findIndex(t => t.name === "V1");
        if (v1Idx >= 0) {
          next.tracks.splice(v1Idx, 0, track);
        } else {
          next.tracks.unshift(track);
        }
      }

      const clip = createClip("text_source", track.id, "text", atTime, duration);
      clip.id = newClipId;
      clip.text = text;
      if (extra) Object.assign(clip, extra);

      track.clips.push(clip);
      track.clips.sort((a, b) => a.timelineStart - b.timelineStart);
      return next;
    });
    return newClipId;
  }, [pushHistory]);

  const addMediaClip = useCallback((item: MediaBinItem, atTime?: number, targetTrackId?: string) => {
    const newClipId = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSelectedClipId(newClipId);
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      const isAudio = item.file.type.startsWith("audio/");
      const isImage = item.file.type.startsWith("image/");
      const trackType = isAudio ? "audio" : "video";
      const clipType = isAudio ? "audio" : isImage ? "image" : "video";

      let track = targetTrackId 
        ? next.tracks.find(t => t.id === targetTrackId)
        : next.tracks.find(t => t.type === trackType);

      if (!track) {
        track = createTrack(trackType, isAudio ? "A1" : "V1");
        next.tracks.push(track);
      }

      let startTime = atTime;
      if (startTime === undefined) {
        const lastClip = track.clips[track.clips.length - 1];
        startTime = lastClip ? lastClip.timelineStart + lastClip.duration : 0;
      }

      const clip = createClip(item.id, track.id, clipType, startTime, item.duration);
      clip.id = newClipId;

      track.clips.push(clip);
      track.clips.sort((a, b) => a.timelineStart - b.timelineStart);
      return next;
    });
    return newClipId;
  }, [pushHistory]);

  const addOverlayClip = useCallback((
    item: MediaBinItem,
    atTime?: number,
    initialTransform?: Partial<Transform>
  ) => {
    const newClipId = `ovl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSelectedClipId(newClipId);
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      const isAudio = item.file.type.startsWith("audio/");
      const isImage = item.file.type.startsWith("image/");
      const clipType = isAudio ? "audio" : isImage ? "image" : "video";

      // Look for an existing overlay track (named V2 or PIP)
      let track = next.tracks.find(t => (t.name === "V2" || t.name === "PIP") && t.type === "video");

      if (!track) {
        track = createTrack("video", "V2");
        // Insert right after V1 if present
        const v1Idx = next.tracks.findIndex(t => t.name === "V1");
        if (v1Idx >= 0) {
          next.tracks.splice(v1Idx + 1, 0, track);
        } else {
          next.tracks.push(track);
        }
      }

      const startTime = atTime !== undefined ? atTime : 0;
      const duration = item.duration > 0 ? item.duration : 3.0;

      const clip = createClip(item.id, track.id, clipType, startTime, duration);
      clip.id = newClipId;
      clip.transform = {
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        rotation: 0,
        scaleX: 0.45,
        scaleY: 0.45,
        opacity: 100,
        ...(initialTransform || {})
      };

      track.clips.push(clip);
      track.clips.sort((a, b) => a.timelineStart - b.timelineStart);
      return next;
    });
    return newClipId;
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

  const splitAt = useCallback((virtualTime: number, targetClipId?: string | null) => {
    setProject(prev => {
      let madeChanges = false;
      const next = cloneProject(prev);
      const activeClipId = targetClipId !== undefined ? targetClipId : selectedClipId;
      
      for (const track of next.tracks) {
        const newClips: TimelineClip[] = [];
        for (const clip of track.clips) {
          const clipEnd = clip.timelineStart + clip.duration;
          // If a clip is selected, ONLY split that selected clip!
          // If no clip is selected, split any clip that crosses the playhead.
          const isTarget = activeClipId ? clip.id === activeClipId : true;

          if (isTarget && virtualTime > clip.timelineStart + MIN_CLIP_DURATION && virtualTime < clipEnd - MIN_CLIP_DURATION) {
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
            if (activeClipId === clip.id) setSelectedClipId(second.id);
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

  const setDimensions = useCallback((width: number, height: number) => {
    setProject(prev => {
      pushHistory(prev);
      const next = cloneProject(prev);
      next.width = width;
      next.height = height;
      return next;
    });
  }, [pushHistory]);

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

  const updateClipEdgeLive = useCallback((
    clipId: string,
    side: "start" | "end",
    cumulativeDelta: number,
    initialClipParam?: TimelineClip,
    maxSourceDurationParam?: number
  ) => {
    setProject(prev => {
      const next = cloneProject(prev);
      for (const track of next.tracks) {
        const clipIdx = track.clips.findIndex(c => c.id === clipId);
        if (clipIdx !== -1) {
          const clip = track.clips[clipIdx];
          const previousClip = clipIdx > 0 ? track.clips[clipIdx - 1] : null;
          const nextClip = clipIdx < track.clips.length - 1 ? track.clips[clipIdx + 1] : null;

          // Obtain initial clip state from parameter, live snapshot, or current
          let initialClip = initialClipParam;
          if (!initialClip && livePatchSnapshotRef.current) {
            for (const snapTrack of livePatchSnapshotRef.current.tracks) {
              const found = snapTrack.clips.find(c => c.id === clipId);
              if (found) { initialClip = found; break; }
            }
          }
          if (!initialClip) initialClip = clip;

          const speed = initialClip.speed || 1;
          const isSynthetic =
            initialClip.type === "text" ||
            initialClip.type === "effect" ||
            initialClip.type === "image" ||
            track.type === "effect" ||
            track.type === "text";

          const maxSourceDuration =
            maxSourceDurationParam !== undefined
              ? maxSourceDurationParam
              : isSynthetic
              ? 999999
              : Math.max(initialClip.sourceEnd, 10);

          if (side === "end") {
            // Dragging RIGHT edge (modifying duration / trim out)
            const maxTimelineEnd = nextClip ? nextClip.timelineStart : 999999;
            const minTimelineEnd = initialClip.timelineStart + MIN_CLIP_DURATION;

            const targetTimelineEnd = initialClip.timelineStart + initialClip.duration + cumulativeDelta;
            const clampedTimelineEnd = clampNum(targetTimelineEnd, minTimelineEnd, maxTimelineEnd);
            const newDuration = clampedTimelineEnd - initialClip.timelineStart;

            if (isSynthetic) {
              // Synthetic text / effects / images: no media file limit!
              clip.duration = Math.max(MIN_CLIP_DURATION, newDuration);
              clip.sourceEnd = initialClip.sourceStart + clip.duration * speed;
            } else {
              // Video / Audio: bound by media source duration
              const targetSourceEnd = initialClip.sourceStart + newDuration * speed;
              const clampedSourceEnd = clampNum(
                targetSourceEnd,
                initialClip.sourceStart + MIN_CLIP_DURATION * speed,
                maxSourceDuration
              );
              clip.sourceEnd = clampedSourceEnd;
              clip.duration = (clampedSourceEnd - initialClip.sourceStart) / speed;
            }
          } else {
            // Dragging LEFT edge (trimming / restoring beginning)
            const minTimelineStart = previousClip ? previousClip.timelineStart + previousClip.duration : 0;
            const maxTimelineStart = initialClip.timelineStart + initialClip.duration - MIN_CLIP_DURATION;

            const targetTimelineStart = initialClip.timelineStart + cumulativeDelta;
            const clampedTimelineStart = clampNum(targetTimelineStart, minTimelineStart, maxTimelineStart);
            const timelineShift = clampedTimelineStart - initialClip.timelineStart;

            if (isSynthetic) {
              // Synthetic text / effects: adjust start and duration
              clip.timelineStart = clampedTimelineStart;
              clip.duration = Math.max(MIN_CLIP_DURATION, initialClip.duration - timelineShift);
              clip.sourceStart = initialClip.sourceStart + timelineShift * speed;
            } else {
              // Video / Audio: cannot start before source start = 0
              const targetSourceStart = initialClip.sourceStart + timelineShift * speed;
              const clampedSourceStart = clampNum(
                targetSourceStart,
                0,
                initialClip.sourceEnd - MIN_CLIP_DURATION * speed
              );
              const actualShift = (clampedSourceStart - initialClip.sourceStart) / speed;
              clip.timelineStart = initialClip.timelineStart + actualShift;
              clip.sourceStart = clampedSourceStart;
              clip.duration = (initialClip.sourceEnd - clampedSourceStart) / speed;
            }
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

  const setBackgroundColor = useCallback((color: string) => {
    setProject((prev) => {
      pushHistory(prev);
      const next = cloneProject(prev);
      next.backgroundColor = color;
      return next;
    });
  }, [pushHistory]);

  return {
    project,
    selectedClipId,
    setSelectedClipId,
    addTrack,
    importSRT,
    deleteTrack,
    updateTrack,
    addClip,
    addEffectClip,
    addTextClip,
    addMediaClip,
    addOverlayClip,
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
    setDimensions,
    setBackgroundColor,
    reset,
  };
}
