"use client";

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";
export type MediaKind = "video" | "image" | "audio";

export interface FilterPreset {
  id: string;
  name: string;
  css: string;
  ffmpeg: string | null;
}

export interface EditorClip {
  id: string;
  name: string;
  type: MediaKind;
  src: string;
  sourceFile?: Blob;
  sourceStart: number;
  sourceEnd: number;
  duration: number;
  timelineStart: number;
  hasAudio?: boolean;
}

export interface TimelineTrack {
  id: string;
  name: string;
  kind: "video" | "audio" | "overlay";
  muted: boolean;
  locked: boolean;
  clips: EditorClip[];
}

export interface EditorSettings {
  aspectRatio: AspectRatio;
  fitMode: "contain" | "cover";
  speed: number;
  volume: number;
  muted: boolean;
  filter: string;
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  zoom: number;
  background: string;
}

export interface EditorProject {
  id: string;
  name: string;
  version: 1;
  tracks: TimelineTrack[];
  settings: EditorSettings;
}

export interface HistoryState {
  past: EditorProject[];
  present: EditorProject;
  future: EditorProject[];
}

export type FFmpegRunner = (options: {
  inputFile: File | Blob;
  inputFileName?: string;
  outputFileName: string;
  outputMimeType: string;
  args: string[];
}) => Promise<Blob>;

export const makeId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const formatTimecode = (seconds: number) => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  const frames = Math.floor((safe % 1) * 10);
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${frames}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${frames}`;
};

export const createClip = (input: {
  src: string;
  name: string;
  type?: MediaKind;
  sourceFile?: Blob;
  duration?: number;
  hasAudio?: boolean;
}): EditorClip => {
  const duration = Math.max(0.05, input.duration ?? 10);
  return {
    id: makeId("clip"),
    name: input.name,
    type: input.type ?? "video",
    src: input.src,
    sourceFile: input.sourceFile,
    sourceStart: 0,
    sourceEnd: duration,
    duration,
    timelineStart: 0,
    hasAudio: input.hasAudio,
  };
};

export const createProject = (): EditorProject => ({
  id: makeId("project"),
  name: "Untitled Botock Project",
  version: 1,
  settings: {
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
  },
  tracks: [
    {
      id: "video-1",
      name: "Video 1",
      kind: "video",
      muted: false,
      locked: false,
      clips: [],
    },
  ],
});

/**
 * JSON.stringify/parse is deliberately NOT used here. EditorClip.sourceFile is a Blob/File
 * reference and JSON cloning silently deletes it, which made undo/redo break later exports.
 */
export const cloneProject = (project: EditorProject): EditorProject => ({
  ...project,
  settings: { ...project.settings },
  tracks: project.tracks.map((track) => ({
    ...track,
    clips: track.clips.map((clip) => ({ ...clip })),
  })),
});

export const snapshotProject = cloneProject;

export const getTimelineEnd = (clips: EditorClip[]) =>
  clips.reduce((max, clip) => Math.max(max, clip.timelineStart + clip.duration), 0);

export const getProjectDuration = (project: EditorProject) =>
  Math.max(0, ...project.tracks.map((track) => getTimelineEnd(track.clips)));
