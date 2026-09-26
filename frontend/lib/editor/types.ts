export interface ClipFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export type ClipRotation = 0 | 90 | 180 | 270;

export interface EditorClip {
  id: string;
  start: number;
  end: number;
  speed: number;
  muted: boolean;
  volumePercent: number;
  rotation: ClipRotation;
  flipH: boolean;
  flipV: boolean;
  filters: ClipFilters;
}

export const DEFAULT_FILTERS: ClipFilters = { brightness: 0, contrast: 1, saturation: 1 };

export function createClip(start: number, end: number): EditorClip {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    start,
    end,
    speed: 1,
    muted: false,
    volumePercent: 100,
    rotation: 0,
    flipH: false,
    flipV: false,
    filters: { ...DEFAULT_FILTERS },
  };
}

export function cloneClips(clips: EditorClip[]): EditorClip[] {
  return clips.map((c) => ({ ...c, filters: { ...c.filters } }));
}

// ─── Phase 3: Audio tracks ──────────────────────────────────────────────

export type AudioTrackKind = "music" | "sfx";

export interface AudioTrack {
  id: string;
  kind: AudioTrackKind;
  label: string;
  file: File;
  sourceUrl: string;
  /** Where on the main timeline this audio track starts playing */
  timelineStart: number;
  /** Trim in/out points within the source audio file itself */
  trimStart: number;
  trimEnd: number;
  volumePercent: number;
  muted: boolean;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  peaks: number[]; // normalized 0..1 waveform peaks, precomputed
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

// ─── Phase 4: Text overlays ─────────────────────────────────────────────

export type TextOverlayAnchor = "top" | "center" | "bottom";

export interface TextOverlay {
  id: string;
  text: string;
  start: number;
  end: number;
  anchor: TextOverlayAnchor;
  fontSizePercent: number; // relative to video height, e.g. 6 = 6% of height
  color: string; // hex, e.g. #ffffff
  backgroundOpacity: number; // 0..1, box behind text
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