 
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Film,
  FolderOpen,
  GripVertical,
  Layers3,
  Minus,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Scissors,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from "lucide-react";
import AdBanner from "../../components/AdBanner";
import ToolSuggestions from "../../components/ToolSuggestions";
import { useMediaStore } from "../../store/useMediaStore";
import { useEditorFFmpeg } from "./editorFFmpeg";
import {
  AspectRatio,
  EditorClip,
  EditorProject,
  EditorSettings,
  FilterPreset,
  HistoryState,
  TimelineTrack,
  createClip,
  createProject,
  formatTimecode,
  clamp,
  cloneProject,
  getProjectDuration,
  getTimelineEnd,
  makeId,
  snapshotProject,
} from "./editorTypes";
import { exportProject } from "./editorExport";

const FILTERS: FilterPreset[] = [
  { id: "none", name: "Original", css: "none", ffmpeg: null },
  { id: "cinematic", name: "Cinematic", css: "contrast(1.12) saturate(1.18) brightness(.96)", ffmpeg: "eq=contrast=1.12:saturation=1.18:brightness=-0.02" },
  { id: "bw", name: "B&W", css: "grayscale(1) contrast(1.08)", ffmpeg: "hue=s=0,eq=contrast=1.08" },
  { id: "warm", name: "Warm", css: "sepia(.25) saturate(1.18) brightness(1.04)", ffmpeg: "colorbalance=rs=.08:gs=.02:bs=-.06,eq=saturation=1.12:brightness=.02" },
  { id: "cool", name: "Cool", css: "saturate(.95) hue-rotate(8deg) brightness(1.02)", ffmpeg: "colorbalance=rs=-.04:gs=.01:bs=.08,eq=saturation=.96:brightness=.01" },
  { id: "vivid", name: "Vivid", css: "contrast(1.12) saturate(1.35)", ffmpeg: "eq=contrast=1.12:saturation=1.35" },
];

const ASPECTS: Array<{ id: AspectRatio; label: string; className: string }> = [
  { id: "16:9", label: "16:9", className: "aspect-video" },
  { id: "9:16", label: "9:16", className: "aspect-[9/16]" },
  { id: "1:1", label: "1:1", className: "aspect-square" },
  { id: "4:5", label: "4:5", className: "aspect-[4/5]" },
];

const DEFAULT_SETTINGS: EditorSettings = {
  aspectRatio: "16:9",
  fitMode: "contain",
  speed: 1,
  volume: 1,
  muted: false,
  filter: "none",
  brightness: 0,
  contrast: 0,
  saturation: 0,
  rotation: 0,
  zoom: 1,
  background: "#000000",
};

function initialHistory(project: EditorProject): HistoryState {
  return { past: [], present: snapshotProject(project), future: [] };
}

function pushHistory(history: HistoryState, project: EditorProject): HistoryState {
  return {
    past: [...history.past, history.present].slice(-60),
    present: snapshotProject(project),
    future: [],
  };
}

function detectVideoHasAudio(video: HTMLVideoElement): boolean {
  const candidate = video as HTMLVideoElement & {
    mozHasAudio?: boolean;
    webkitAudioDecodedByteCount?: number;
    audioTracks?: { length: number };
  };
  if (typeof candidate.audioTracks?.length === "number") return candidate.audioTracks.length > 0;
  if (candidate.mozHasAudio === true) return true;
  if (typeof candidate.webkitAudioDecodedByteCount === "number") return candidate.webkitAudioDecodedByteCount > 0;
  // Chromium may not expose an audio-track count before playback. Treat unknown files as
  // audio-bearing, which is safer than silently dropping sound from a real video.
  return true;
}

export default function VideoEditorComponent() {
  const { activeMedia } = useMediaStore();
  const { runMulti, isProcessing, progress, statusMessage, error: ffmpegError } = useEditorFFmpeg();

  const [project, setProject] = useState<EditorProject>(() => createProject());
  const [history, setHistory] = useState<HistoryState>(() => initialHistory(createProject()));
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("video-1");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportName, setExportName] = useState("botock-edit.mp4");
  const [dragClipId, setDragClipId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"media" | "properties" | "settings">("media");
  const [notice, setNotice] = useState("");
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [exportPreset, setExportPreset] = useState<"1080p" | "720p" | "source">("1080p");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const videoTrack = project.tracks.find((t) => t.kind === "video") ?? project.tracks[0];
  const selectedClip = useMemo(
    () => project.tracks.flatMap((t) => t.clips).find((c) => c.id === selectedClipId) ?? null,
    [project, selectedClipId]
  );

  const selectedTrack = project.tracks.find((t) => t.id === selectedTrackId) ?? videoTrack;
  const projectDuration = Math.max(0.1, getProjectDuration(project));

  const updateProject = useCallback((mutator: (draft: EditorProject) => EditorProject) => {
    setProject((current) => {
      const next = mutator(current);
      setHistory((h) => pushHistory(h, next));
      return next;
    });
  }, []);

  const replaceWithoutHistory = useCallback((next: EditorProject) => {
    setProject(next);
    setHistory((h) => ({ ...h, present: snapshotProject(next) }));
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      const nextHistory = {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future].slice(0, 60),
      };
      setProject(cloneProject(previous));
      return nextHistory;
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      const nextHistory = {
        past: [...h.past, h.present].slice(-60),
        present: next,
        future: h.future.slice(1),
      };
      setProject(cloneProject(next));
      return nextHistory;
    });
  }, []);

  useEffect(() => {
    if (!activeMedia?.url && !activeMedia?.blobUrl && !activeMedia?.blob) return;
    const url = activeMedia.blobUrl || activeMedia.url;
    if (!url) return;

    setProject((current) => {
      if (current.tracks.some((track) => track.clips.some((clip) => clip.src === url))) {
        return current;
      }
      const clip = createClip({
        src: url,
        name: activeMedia.title || "Generated video",
        type: "video",
        sourceFile: activeMedia.blob,
      });
      const next = {
        ...current,
        name: activeMedia.title || "Botock Video Project",
        tracks: current.tracks.map((track) =>
          track.id === "video-1" ? { ...track, clips: [clip] } : track
        ),
      };
      setHistory(initialHistory(next));
      setSelectedClipId(clip.id);
      return next;
    });
  }, [activeMedia]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (exportUrl) URL.revokeObjectURL(exportUrl);
    };
  }, [exportUrl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;

      const meta = event.ctrlKey || event.metaKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setIsPlaying((v) => !v);
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedClipId) {
        event.preventDefault();
        deleteSelectedClip();
        return;
      }
      if (event.key.toLowerCase() === "s" && selectedClipId) {
        event.preventDefault();
        splitSelectedClip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const video = mediaRef.current;
    if (!video || !selectedClip) return;
    const relative = currentTime - selectedClip.timelineStart + selectedClip.sourceStart;
    if (relative >= selectedClip.sourceStart && relative <= selectedClip.sourceEnd + 0.02) {
      if (Math.abs(video.currentTime - relative) > 0.15) video.currentTime = relative;
    }
  }, [currentTime, selectedClip]);

  useEffect(() => {
    const video = mediaRef.current;
    if (!video) return;
    video.playbackRate = project.settings.speed;
    video.volume = project.settings.muted ? 0 : project.settings.volume;
  }, [project.settings.speed, project.settings.volume, project.settings.muted]);

  useEffect(() => {
    if (!isPlaying) return;
    const tick = () => {
      setCurrentTime((time) => {
        const next = time + 1 / 30;
        if (next >= projectDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, projectDuration]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files).filter((file) =>
      file.type.startsWith("video/")
    );
    if (!incoming.length) {
      setNotice("Please choose a video file.");
      return;
    }

    setAssetFiles((prev) => [...incoming, ...prev]);
    incoming.forEach((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);

      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.src = url;
      probe.onloadedmetadata = () => {
        const duration = Number.isFinite(probe.duration) && probe.duration > 0 ? probe.duration : 10;
        const hasAudio = detectVideoHasAudio(probe);
        const clip = createClip({
          src: url,
          name: file.name,
          type: "video",
          sourceFile: file,
          duration,
          hasAudio,
        });

        updateProject((current) => {
          const track = current.tracks.find((t) => t.id === selectedTrackId) ?? current.tracks[0];
          const end = getTimelineEnd(track.clips);
          return {
            ...current,
            tracks: current.tracks.map((t) =>
              t.id === track.id
                ? { ...t, clips: [...t.clips, { ...clip, timelineStart: end }] }
                : t
            ),
          };
        });
        setSelectedClipId(clip.id);
        probe.remove();
      };
      probe.onerror = () => {
        const clip = createClip({
          src: url,
          name: file.name,
          type: "video",
          sourceFile: file,
          duration: 10,
          hasAudio: true,
        });
        updateProject((current) => {
          const track = current.tracks.find((t) => t.id === selectedTrackId) ?? current.tracks[0];
          const end = getTimelineEnd(track.clips);
          return {
            ...current,
            tracks: current.tracks.map((t) =>
              t.id === track.id
                ? { ...t, clips: [...t.clips, { ...clip, timelineStart: end }] }
                : t
            ),
          };
        });
        setSelectedClipId(clip.id);
        probe.remove();
      };
    });
    setPanel("media");
    setNotice(`${incoming.length} video${incoming.length > 1 ? "s" : ""} added to timeline.`);
  }, [selectedTrackId, updateProject]);

  const addAsset = (file: File) => {
    handleFiles([file]);
  };

  const selectClip = (clip: EditorClip) => {
    setSelectedClipId(clip.id);
    setSelectedTrackId(
      project.tracks.find((track) => track.clips.some((c) => c.id === clip.id))?.id ?? "video-1"
    );
    setPanel("properties");
    setCurrentTime(clamp(clip.timelineStart, 0, projectDuration));
  };

  const splitSelectedClip = useCallback(() => {
    if (!selectedClip) return;
    const local = currentTime - selectedClip.timelineStart;
    if (local <= 0.05 || local >= selectedClip.duration - 0.05) {
      setNotice("Move the playhead inside the selected clip before splitting.");
      return;
    }

    const firstDuration = local;
    const first: EditorClip = {
      ...selectedClip,
      id: makeId("clip"),
      sourceEnd: selectedClip.sourceStart + firstDuration * project.settings.speed,
      duration: firstDuration,
    };
    const second: EditorClip = {
      ...selectedClip,
      id: makeId("clip"),
      sourceStart: selectedClip.sourceStart + firstDuration * project.settings.speed,
      timelineStart: selectedClip.timelineStart + firstDuration,
      duration: selectedClip.duration - firstDuration,
    };

    updateProject((current) => ({
      ...current,
      tracks: current.tracks.map((track) => ({
        ...track,
        clips: track.clips.flatMap((clip) =>
          clip.id === selectedClip.id ? [first, second] : [clip]
        ),
      })),
    }));
    setSelectedClipId(second.id);
    setNotice("Clip split.");
  }, [currentTime, project.settings.speed, selectedClip, updateProject]);

  const deleteSelectedClip = useCallback(() => {
    if (!selectedClipId) return;
    updateProject((current) => {
      const nextTracks = current.tracks.map((track) => {
        if (!track.clips.some((c) => c.id === selectedClipId)) return track;
        const remaining = track.clips.filter((c) => c.id !== selectedClipId);
        let cursor = 0;
        const compacted = remaining.map((clip) => {
          const next = { ...clip, timelineStart: cursor };
          cursor += clip.duration;
          return next;
        });
        return { ...track, clips: compacted };
      });
      return { ...current, tracks: nextTracks };
    });
    setSelectedClipId(null);
    setNotice("Clip removed.");
  }, [selectedClipId, updateProject]);

  const duplicateSelectedClip = () => {
    if (!selectedClip) return;
    const copy: EditorClip = {
      ...selectedClip,
      id: makeId("clip"),
      name: `${selectedClip.name} copy`,
      timelineStart: selectedClip.timelineStart + selectedClip.duration,
    };
    updateProject((current) => ({
      ...current,
      tracks: current.tracks.map((track) => {
        if (!track.clips.some((c) => c.id === selectedClip.id)) return track;
        const clips = [...track.clips];
        const index = clips.findIndex((c) => c.id === selectedClip.id);
        clips.splice(index + 1, 0, copy);
        return {
          ...track,
          clips: clips.map((clip, i) => ({
            ...clip,
            timelineStart: clips.slice(0, i).reduce((sum, item) => sum + item.duration, 0),
          })),
        };
      }),
    }));
    setSelectedClipId(copy.id);
  };

  const moveSelected = (direction: -1 | 1) => {
    if (!selectedClip) return;
    updateProject((current) => ({
      ...current,
      tracks: current.tracks.map((track) => {
        const index = track.clips.findIndex((c) => c.id === selectedClip.id);
        if (index < 0) return track;
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= track.clips.length) return track;
        const clips = [...track.clips];
        [clips[index], clips[nextIndex]] = [clips[nextIndex], clips[index]];
        let cursor = 0;
        return {
          ...track,
          clips: clips.map((clip) => {
            const next = { ...clip, timelineStart: cursor };
            cursor += clip.duration;
            return next;
          }),
        };
      }),
    }));
  };

  const trimStart = (value: number) => {
    if (!selectedClip) return;
    const next = clamp(value, 0, selectedClip.sourceEnd - 0.05);
    const delta = next - selectedClip.sourceStart;
    updateProject((current) => ({
      ...current,
      tracks: current.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === selectedClip.id
            ? {
                ...clip,
                sourceStart: next,
                duration: Math.max(0.05, clip.duration - delta),
              }
            : clip
        ),
      })),
    }));
  };

  const trimEnd = (value: number) => {
    if (!selectedClip) return;
    const next = clamp(value, selectedClip.sourceStart + 0.05, selectedClip.sourceEnd);
    const duration = Math.max(0.05, next - selectedClip.sourceStart);
    updateProject((current) => ({
      ...current,
      tracks: current.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === selectedClip.id
            ? { ...clip, sourceEnd: next, duration }
            : clip
        ),
      })),
    }));
  };

  const updateSettings = (patch: Partial<EditorSettings>) => {
    updateProject((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  };

  const previewFilter = FILTERS.find((f) => f.id === project.settings.filter) ?? FILTERS[0];
  const previewTransform = `rotate(${project.settings.rotation}deg) scale(${project.settings.zoom})`;

  const handleExport = async () => {
    if (!videoTrack?.clips.length) {
      setNotice("Add at least one video clip before exporting.");
      return;
    }

    setShowExport(true);
    setExportUrl(null);
    try {
      const blob = await exportProject(project, exportPreset, runMulti);
      const url = URL.createObjectURL(blob);
      objectUrlsRef.current.push(url);
      setExportUrl(url);
      setExportName(`${project.name.replace(/\.[^/.]+$/, "") || "botock-edit"}.mp4`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Export failed.");
    }
  };

  const downloadExport = () => {
    if (!exportUrl) return;
    const anchor = document.createElement("a");
    anchor.href = exportUrl;
    anchor.download = exportName;
    anchor.click();
  };

  const timelineWidth = Math.max(900, projectDuration * 100 * zoom);

  const renderClip = (clip: EditorClip, track: TimelineTrack) => {
    const width = Math.max(70, clip.duration * 100 * zoom);
    const left = clip.timelineStart * 100 * zoom;
    const selected = selectedClipId === clip.id;
    return (
      <div
        key={clip.id}
        draggable
        onDragStart={() => setDragClipId(clip.id)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => {
          if (!dragClipId || dragClipId === clip.id) return;
          updateProject((current) => {
            const clips = [...track.clips];
            const from = clips.findIndex((c) => c.id === dragClipId);
            const to = clips.findIndex((c) => c.id === clip.id);
            if (from < 0 || to < 0) return current;
            const [moved] = clips.splice(from, 1);
            clips.splice(to, 0, moved);
            let cursor = 0;
            const nextClips = clips.map((c) => {
              const next = { ...c, timelineStart: cursor };
              cursor += c.duration;
              return next;
            });
            return {
              ...current,
              tracks: current.tracks.map((t) => (t.id === track.id ? { ...t, clips: nextClips } : t)),
            };
          });
          setDragClipId(null);
        }}
        onClick={() => selectClip(clip)}
        className={`absolute top-2 bottom-2 rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing group ${
          selected ? "border-primary ring-2 ring-primary/30" : "border-white/10"
        }`}
        style={{ left, width }}
        title={clip.name}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="relative h-full px-2 py-1 flex flex-col justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <GripVertical className="w-3 h-3 text-white/40 shrink-0" />
            <span className="text-[10px] text-white font-medium truncate">{clip.name}</span>
          </div>
          <div className="flex gap-[2px] items-end h-6 opacity-70">
            {Array.from({ length: Math.min(28, Math.max(6, Math.floor(width / 10))) }).map((_, i) => (
              <span
                key={i}
                className="flex-1 bg-white/35 rounded-sm"
                style={{ height: `${20 + ((i * 17) % 70)}%` }}
              />
            ))}
          </div>
          <span className="text-[9px] text-white/60">{formatTimecode(clip.duration)}</span>
        </div>
      </div>
    );
  };

  const hasProject = project.tracks.some((track) => track.clips.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/tools/video-generator"
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary grid place-items-center">
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">Botock Video Studio</div>
                <div className="text-[10px] text-muted-foreground">Local browser editing</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <button onClick={undo} disabled={!history.past.length} className="p-2 rounded-md hover:bg-muted disabled:opacity-30" title="Undo">
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={redo} disabled={!history.future.length} className="p-2 rounded-md hover:bg-muted disabled:opacity-30" title="Redo">
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notice && <span className="hidden lg:block text-[11px] text-muted-foreground max-w-xs truncate">{notice}</span>}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={handleExport}
              disabled={!hasProject || isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />

      <main className="max-w-[1600px] mx-auto p-3 lg:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-3">
          <aside className="rounded-xl border border-border/60 bg-card/70 overflow-hidden min-h-[580px]">
            <div className="flex border-b border-border/50">
              {[
                ["media", "Media", FolderOpen],
                ["properties", "Edit", Settings2],
                ["settings", "Project", Layers3],
              ].map(([id, label, Icon]) => (
                <button
                  key={id as string}
                  onClick={() => setPanel(id as typeof panel)}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wide ${
                    panel === id ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                  }`}
                >
                  {React.createElement(Icon as React.ElementType, { className: "w-3.5 h-3.5 mx-auto mb-1" })}
                  {label as string}
                </button>
              ))}
            </div>

            {panel === "media" && (
              <div className="p-3 space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-border rounded-xl p-5 hover:border-primary/60 hover:bg-primary/5 transition-colors text-center"
                >
                  <Upload className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-xs font-semibold">Import media</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Video files stay in your browser</div>
                </button>

                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assets</div>
                {assetFiles.length === 0 && !activeMedia ? (
                  <div className="text-[11px] text-muted-foreground text-center py-8">No imported assets yet.</div>
                ) : (
                  <div className="space-y-2">
                    {activeMedia && (
                      <button
                        onClick={() => activeMedia.blob && addAsset(activeMedia.blob instanceof File ? activeMedia.blob : new File([activeMedia.blob], activeMedia.title || "generated.mp4", { type: activeMedia.blob.type || "video/mp4" }))}
                        className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted text-left"
                      >
                        <div className="w-10 h-8 rounded bg-black grid place-items-center"><Film className="w-3 h-3" /></div>
                        <span className="text-[10px] truncate">{activeMedia.title || "Generated video"}</span>
                      </button>
                    )}
                    {assetFiles.map((file) => (
                      <button key={`${file.name}-${file.lastModified}`} onClick={() => addAsset(file)} className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted text-left">
                        <div className="w-10 h-8 rounded bg-black grid place-items-center"><Film className="w-3 h-3" /></div>
                        <span className="text-[10px] truncate">{file.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-primary font-bold mb-1"><Sparkles className="w-3 h-3" /> Studio principle</div>
                  Import, arrange and export locally. Nothing is uploaded by this editor for processing.
                </div>
              </div>
            )}

            {panel === "properties" && (
              <div className="p-3 space-y-4">
                {!selectedClip ? (
                  <div className="text-center text-[11px] text-muted-foreground py-12">Select a clip on the timeline.</div>
                ) : (
                  <>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Selected clip</div>
                      <div className="text-xs font-semibold truncate">{selectedClip.name}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Start in source</label>
                      <input type="range" min={0} max={Math.max(selectedClip.sourceEnd, 0.1)} step={0.01} value={selectedClip.sourceStart} onChange={(e) => trimStart(Number(e.target.value))} className="w-full accent-primary" />
                      <div className="text-[10px] flex justify-between"><span>{formatTimecode(selectedClip.sourceStart)}</span><span>{formatTimecode(selectedClip.sourceEnd)}</span></div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">End in source</label>
                      <input type="range" min={selectedClip.sourceStart + 0.01} max={Math.max(selectedClip.sourceEnd, selectedClip.sourceStart + 0.01)} step={0.01} value={selectedClip.sourceEnd} onChange={(e) => trimEnd(Number(e.target.value))} className="w-full accent-primary" />
                      <div className="text-[10px]">{formatTimecode(selectedClip.duration)} clip duration</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => moveSelected(-1)} className="px-2 py-2 rounded-lg border border-border text-[10px]"><ChevronLeft className="w-3 h-3 inline" /> Move left</button>
                      <button onClick={() => moveSelected(1)} className="px-2 py-2 rounded-lg border border-border text-[10px]">Move right <ChevronRight className="w-3 h-3 inline" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={splitSelectedClip} className="p-2 rounded-lg border border-border text-[10px]"><Scissors className="w-3.5 h-3.5 mx-auto mb-1" />Split</button>
                      <button onClick={duplicateSelectedClip} className="p-2 rounded-lg border border-border text-[10px]"><Copy className="w-3.5 h-3.5 mx-auto mb-1" />Copy</button>
                      <button onClick={deleteSelectedClip} className="p-2 rounded-lg border border-destructive/40 text-destructive text-[10px]"><Trash2 className="w-3.5 h-3.5 mx-auto mb-1" />Delete</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {panel === "settings" && (
              <div className="p-3 space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground">Project name</label>
                  <input value={project.name} onChange={(e) => updateProject((p) => ({ ...p, name: e.target.value }))} className="w-full mt-1 px-2.5 py-2 rounded-lg bg-background border border-border text-xs" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-2">Canvas</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ASPECTS.map((item) => (
                      <button key={item.id} onClick={() => updateSettings({ aspectRatio: item.id })} className={`py-2 rounded-lg border text-[10px] ${project.settings.aspectRatio === item.id ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{item.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-2">Playback speed</div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0.5, 1, 1.5, 2].map((speed) => (
                      <button key={speed} onClick={() => updateSettings({ speed })} className={`py-1.5 rounded-md text-[10px] border ${project.settings.speed === speed ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{speed}x</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          <section className="rounded-xl border border-border/60 bg-card/40 min-h-[580px] flex flex-col overflow-hidden">
            <div className="flex-1 min-h-[420px] bg-black/30 relative grid place-items-center p-5">
              {!selectedClip ? (
                <button onClick={() => fileInputRef.current?.click()} className="max-w-sm text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="font-bold text-sm">Drop a video into your studio</div>
                  <div className="text-xs text-muted-foreground mt-1">Then cut, rearrange, grade and export it locally.</div>
                </button>
              ) : (
                <div className={`relative ${ASPECTS.find((a) => a.id === project.settings.aspectRatio)?.className ?? "aspect-video"} max-h-[500px] max-w-full w-full bg-black rounded-lg overflow-hidden shadow-2xl`}>
                  <video
                    ref={mediaRef}
                    src={selectedClip.src}
                    className="absolute inset-0 w-full h-full"
                    style={{
                      objectFit: project.settings.fitMode,
                      filter: previewFilter.css,
                      transform: previewTransform,
                      background: project.settings.background,
                    }}
                    muted={project.settings.muted}
                    playsInline
                    onClick={() => setIsPlaying((v) => !v)}
                    onLoadedMetadata={() => {
                      const video = mediaRef.current;
                      if (video) video.currentTime = selectedClip.sourceStart;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                    <div className="flex items-center justify-between text-white text-[10px]">
                      <span>{formatTimecode(currentTime)}</span>
                      <span>{formatTimecode(projectDuration)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/50 px-3 py-2 flex items-center justify-center gap-2">
              <button onClick={() => setCurrentTime(0)} className="p-2 rounded-md hover:bg-muted" title="Go to start"><RotateCcw className="w-3.5 h-3.5" /></button>
              <button onClick={() => setIsPlaying((v) => !v)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={() => setCurrentTime(clamp(currentTime + 1, 0, projectDuration))} className="p-2 rounded-md hover:bg-muted" title="Step forward"><ChevronRight className="w-3.5 h-3.5" /></button>
              <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">{formatTimecode(currentTime)} / {formatTimecode(projectDuration)}</span>
            </div>

            <div className="border-t border-border/50 bg-background/60">
              <div className="h-7 flex items-center justify-between px-3 border-b border-border/40">
                <div className="flex items-center gap-1">
                  <button onClick={splitSelectedClip} disabled={!selectedClip} className="px-2 py-1 rounded-md hover:bg-muted disabled:opacity-30 text-[10px]"><Scissors className="w-3 h-3 inline mr-1" />Split</button>
                  <button onClick={duplicateSelectedClip} disabled={!selectedClip} className="px-2 py-1 rounded-md hover:bg-muted disabled:opacity-30 text-[10px]"><Copy className="w-3 h-3 inline mr-1" />Duplicate</button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setZoom((z) => clamp(z / 1.25, 0.5, 4))} className="p-1 rounded hover:bg-muted"><Minus className="w-3 h-3" /></button>
                  <span className="text-[9px] text-muted-foreground w-8 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom((z) => clamp(z * 1.25, 0.5, 4))} className="p-1 rounded hover:bg-muted"><Plus className="w-3 h-3" /></button>
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-hidden">
                <div style={{ width: timelineWidth }} className="min-w-full">
                  <div className="h-7 border-b border-border/40 relative">
                    {Array.from({ length: Math.ceil(projectDuration) + 1 }).map((_, i) => (
                      <div key={i} className="absolute top-0 bottom-0 border-l border-border/30" style={{ left: i * 100 * zoom }}>
                        <span className="absolute top-1 left-1 text-[8px] text-muted-foreground">{i}s</span>
                      </div>
                    ))}
                    <div className="absolute top-0 bottom-0 w-px bg-red-500 z-20" style={{ left: currentTime * 100 * zoom }} />
                  </div>

                  {project.tracks.map((track) => (
                    <div key={track.id} className="h-20 border-b border-border/40 flex">
                      <div className="sticky left-0 z-10 w-20 shrink-0 bg-card border-r border-border/40 p-2">
                        <div className="text-[9px] font-bold truncate">{track.name}</div>
                        <div className="text-[8px] text-muted-foreground mt-1">{track.clips.length} clip{track.clips.length === 1 ? "" : "s"}</div>
                      </div>
                      <div
                        className="relative flex-1"
                        onClick={(event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          const x = event.clientX - rect.left + event.currentTarget.scrollLeft;
                          setCurrentTime(clamp(x / (100 * zoom), 0, projectDuration));
                        }}
                      >
                        {track.clips.map((clip) => renderClip(clip, track))}
                      </div>
                    </div>
                  ))}

                  <div className="relative h-2">
                    <div className="absolute top-0 bottom-0 w-px bg-red-500 z-20" style={{ left: currentTime * 100 * zoom }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-border/60 bg-card/70 min-h-[580px] overflow-hidden">
            <div className="p-3 border-b border-border/50">
              <div className="text-xs font-bold">Inspector</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Clip and project controls</div>
            </div>

            <div className="p-3 space-y-5">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Canvas</div>
                <div className="grid grid-cols-4 gap-1">
                  {ASPECTS.map((item) => (
                    <button key={item.id} onClick={() => updateSettings({ aspectRatio: item.id })} className={`py-2 rounded-md border text-[9px] ${project.settings.aspectRatio === item.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>{item.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Look</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {FILTERS.map((filter) => (
                    <button key={filter.id} onClick={() => updateSettings({ filter: filter.id })} className={`px-2 py-2 rounded-md border text-left text-[9px] ${project.settings.filter === filter.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                      <span className="block font-semibold">{filter.name}</span>
                      <span className="block text-[8px] opacity-60 mt-0.5">{filter.id === "none" ? "No grade" : "Preview + export"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Transform</div>
                <div className="space-y-3">
                  <label className="block text-[10px]">
                    Zoom <span className="float-right text-muted-foreground">{project.settings.zoom.toFixed(2)}x</span>
                    <input type="range" min="0.5" max="2.5" step="0.01" value={project.settings.zoom} onChange={(e) => updateSettings({ zoom: Number(e.target.value) })} className="w-full accent-primary" />
                  </label>
                  <label className="block text-[10px]">
                    Rotation <span className="float-right text-muted-foreground">{project.settings.rotation}°</span>
                    <input type="range" min="-180" max="180" step="1" value={project.settings.rotation} onChange={(e) => updateSettings({ rotation: Number(e.target.value) })} className="w-full accent-primary" />
                  </label>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Audio</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateSettings({ muted: !project.settings.muted })} className="p-2 rounded-lg border border-border">
                    {project.settings.muted ? <VolumeX className="w-3.5 h-3.5 text-destructive" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <input type="range" min="0" max="2" step="0.01" value={project.settings.volume} onChange={(e) => updateSettings({ volume: Number(e.target.value) })} className="flex-1 accent-primary" />
                  <span className="text-[9px] w-7 text-right">{Math.round(project.settings.volume * 100)}%</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Playback</div>
                <div className="grid grid-cols-4 gap-1">
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <button key={speed} onClick={() => updateSettings({ speed })} className={`py-1.5 rounded-md border text-[9px] ${project.settings.speed === speed ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{speed}x</button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="text-[10px] font-bold mb-1">Shortcuts</div>
                <div className="space-y-1 text-[9px] text-muted-foreground">
                  <div className="flex justify-between"><span>Play / pause</span><kbd>Space</kbd></div>
                  <div className="flex justify-between"><span>Split</span><kbd>S</kbd></div>
                  <div className="flex justify-between"><span>Delete clip</span><kbd>Del</kbd></div>
                  <div className="flex justify-between"><span>Undo</span><kbd>Ctrl/Cmd Z</kbd></div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <ToolSuggestions type="video" />
        <AdBanner slotId="studio-bottom-ad" format="horizontal" />
      </main>

      {showExport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Export Video</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">FFmpeg WebAssembly, processed locally</div>
              </div>
              {!isProcessing && <button onClick={() => setShowExport(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>}
            </div>

            <div className="p-5">
              {!isProcessing && !exportUrl ? (
                <>
                  <div className="text-xs font-semibold mb-2">Quality preset</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["1080p", "720p", "source"] as const).map((preset) => (
                      <button key={preset} onClick={() => setExportPreset(preset)} className={`p-3 rounded-lg border text-left ${exportPreset === preset ? "border-primary bg-primary/10" : "border-border"}`}>
                        <div className="text-xs font-bold">{preset === "source" ? "Source" : preset}</div>
                        <div className="text-[9px] text-muted-foreground mt-1">{preset === "1080p" ? "Balanced" : preset === "720p" ? "Smaller file" : "Keep source size"}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={handleExport} className="w-full mt-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Start local render</button>
                </>
              ) : isProcessing ? (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div className="font-semibold text-sm mt-4">Rendering your timeline</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{statusMessage || "Encoding..."}</div>
                  <div className="mt-5 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">{progress.percent}%</div>
                  {ffmpegError && <div className="mt-3 text-[10px] text-destructive">{ffmpegError}</div>}
                </div>
              ) : exportUrl ? (
                <div className="py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center mx-auto"><Download className="w-5 h-5" /></div>
                  <div className="text-center font-bold text-sm mt-3">Export complete</div>
                  <div className="text-center text-[10px] text-muted-foreground mt-1">{exportName}</div>
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <button onClick={downloadExport} className="py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Download MP4</button>
                    <button onClick={() => setShowExport(false)} className="py-2.5 rounded-lg border border-border text-xs font-semibold">Close</button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
