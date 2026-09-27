export interface ClipFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export type ClipRotation = 0 | 90 | 180 | 270;
export type TransitionType = "none" | "fade" | "wipeleft" | "wiperight" | "slideup";

export interface CropRect {
  x: number; // normalized 0..1, top-left
  y: number;
  width: number; // normalized 0..1
  height: number;
}

export type KenBurnsDirection = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface KenBurnsConfig {
  enabled: boolean;
  startZoom: number; // e.g. 1.0
  endZoom: number;   // e.g. 1.15
  direction: KenBurnsDirection;
}

export const DEFAULT_KEN_BURNS: KenBurnsConfig = {
  enabled: false,
  startZoom: 1.0,
  endZoom: 1.15,
  direction: "center",
};

export interface EditorClip {
  id: string;
  sourceId: string;
  sourceStart: number;
  sourceEnd: number;
  speed: number;
  muted: boolean;
  volumePercent: number;
  rotation: ClipRotation;
  flipH: boolean;
  flipV: boolean;
  filters: ClipFilters;
  transitionOut: TransitionType;
  transitionDuration: number;
  crop: CropRect | null;
  kenBurns: KenBurnsConfig;
}

export const DEFAULT_FILTERS: ClipFilters = { brightness: 0, contrast: 1, saturation: 1 };

export function createClip(sourceId: string, sourceStart: number, sourceEnd: number): EditorClip {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sourceId,
    sourceStart,
    sourceEnd,
    speed: 1,
    muted: false,
    volumePercent: 100,
    rotation: 0,
    flipH: false,
    flipV: false,
    filters: { ...DEFAULT_FILTERS },
    transitionOut: "none",
    transitionDuration: 0.6,
    crop: null,
    kenBurns: { ...DEFAULT_KEN_BURNS },
  };
}

export function cloneClips(clips: EditorClip[]): EditorClip[] {
  return clips.map((c) => ({
    ...c,
    filters: { ...c.filters },
    crop: c.crop ? { ...c.crop } : null,
    kenBurns: { ...c.kenBurns },
  }));
}

export function clipTimelineDuration(clip: EditorClip): number {
  const speed = Math.min(4, Math.max(0.25, clip.speed));
  return Math.max(0, (clip.sourceEnd - clip.sourceStart) / speed);
}

export interface TimelinePosition {
  clip: EditorClip;
  timelineStart: number;
  timelineEnd: number;
}

export function getTimelinePositions(clips: EditorClip[]): TimelinePosition[] {
  let cursor = 0;
  return clips.map((clip) => {
    const dur = clipTimelineDuration(clip);
    const pos: TimelinePosition = { clip, timelineStart: cursor, timelineEnd: cursor + dur };
    cursor += dur;
    return pos;
  });
}

export function getTotalTimelineDuration(clips: EditorClip[]): number {
  return clips.reduce((sum, c) => sum + clipTimelineDuration(c), 0);
}

// ─── Media Bin ───────────────────────────────────────────────────────────

export interface MediaBinItem {
  id: string;
  name: string;
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

// ─── Audio tracks ────────────────────────────────────────────────────────

export type AudioTrackKind = "music" | "sfx";

export interface AudioTrack {
  id: string;
  kind: AudioTrackKind;
  label: string;
  file: File;
  sourceUrl: string;
  timelineStart: number;
  trimStart: number;
  trimEnd: number;
  volumePercent: number;
  muted: boolean;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  peaks: number[];
  sourceDuration: number;
}

export function createAudioTrack(params: {
  kind: AudioTrackKind;
  label: string;
  file: File;
  sourceUrl: string;
  sourceDuration: number;
  timelineStart: number;
}): AudioTrack {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    kind: params.kind,
    label: params.label,
    file: params.file,
    sourceUrl: params.sourceUrl,
    timelineStart: params.timelineStart,
    trimStart: 0,
    trimEnd: params.sourceDuration,
    volumePercent: 100,
    muted: false,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
    peaks: [],
    sourceDuration: params.sourceDuration,
  };
}

// ─── Text overlays ───────────────────────────────────────────────────────

export type TextOverlayAnchor = "top" | "center" | "bottom";

export interface TextOverlay {
  id: string;
  text: string;
  start: number;
  end: number;
  anchor: TextOverlayAnchor;
  fontSizePercent: number;
  color: string;
  backgroundOpacity: number;
}

export function createTextOverlay(start: number, end: number): TextOverlay {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: "Your text here",
    start,
    end,
    anchor: "bottom",
    fontSizePercent: 6,
    color: "#ffffff",
    backgroundOpacity: 0.35,
  };
}

// ─── Image overlays ──────────────────────────────────────────────────────

export interface ImageOverlay {
  id: string;
  file: File;
  url: string;
  start: number;
  end: number;
  xPercent: number; // top-left, 0-100 of canvas width
  yPercent: number; // top-left, 0-100 of canvas height
  widthPercent: number; // relative to canvas width, 5-100
  opacity: number; // 0-1
}

export function createImageOverlay(file: File, url: string, start: number, end: number): ImageOverlay {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    url,
    start,
    end,
    xPercent: 10,
    yPercent: 10,
    widthPercent: 30,
    opacity: 1,
  };
}