export type TrackType = "video" | "audio" | "text" | "graphics" | "effect";

export interface Transform {
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

export interface CropRect {
  x: number; // normalized 0..1, top-left
  y: number;
  width: number; // normalized 0..1
  height: number;
}

export interface ClipFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export type TransitionType = 
  | "none" 
  | "fade" 
  | "dip-black" 
  | "dip-white" 
  | "slide-left" 
  | "slide-right" 
  | "zoom-in" 
  | "zoom-out" 
  | "wipeleft" 
  | "wiperight"
  | "mirror"
  | "bounce"
  | "curtain";

export type SpeedPoint = {
  time: number; // local time 0-1 (normalized within the clip)
  speed: number;
};

export interface AudioSettings {
  volumePercent: number;
  muted: boolean;
  fadeInSeconds: number;
  fadeOutSeconds: number;
}

// Stub for Phase 5+
export interface Effect {
  id: string;
  type: string;
  intensity?: number;
  duration?: number;
  direction?: string;
}

// Stub for Phase 7
export interface Keyframe {
  id: string;
  property: string;
  time: number;
  value: number;
}

export interface ChromaKeySettings {
  enabled: boolean;
  color: string;
  similarity: number;
  blend: number;
  spillReduction: number;
}

export type MotionDirection =
  | "left"
  | "right"
  | "up"
  | "down"
  | "up_left"
  | "up_right"
  | "down_left"
  | "down_right"
  | "custom";

export interface MotionPath {
  enabled: boolean;
  action?: "move" | "none";
  direction?: MotionDirection;
  distance?: number; // 10 to 100 percentage
  startTime?: number; // offset in seconds from clip start
  duration?: number; // duration of motion in seconds
  startX: number; // percentage 0-100
  startY: number; // percentage 0-100
  endX: number; // percentage 0-100
  endY: number; // percentage 0-100
  pathType?: "line" | "arc" | "zigzag";
  rotateWithMotion?: boolean;
}

// Canonical Media Layer / Timeline Clip
export interface TimelineClip {
  id: string;
  trackId: string;
  sourceId: string;
  type: "video" | "audio" | "image" | "text" | "effect"; // source type
  
  // Timing
  timelineStart: number;
  duration: number; // duration on timeline
  sourceStart: number; // starting point in the source media
  sourceEnd: number; // ending point in the source media
  speed: number;
  speedCurve?: SpeedPoint[];
  
  // Spatial
  transform?: Transform;
  crop?: CropRect;
  motionPath?: MotionPath;
  
  // Audio
  audio?: AudioSettings;
  
  // Visuals
  filters?: ClipFilters;
  effects?: Effect[];
  transitions?: TransitionType; // Simplified for Phase 1
  transitionDuration?: number;
  transitionIn?: TransitionType;
  transitionInDuration?: number;
  transitionOut?: TransitionType;
  transitionOutDuration?: number;
  keyframes?: Keyframe[];
  chromaKey?: ChromaKeySettings;
  
  // Extra specific properties
  text?: string;
  color?: string;
  fontSizePercent?: number;
  textAnimation?: "none" | "typewriter" | "fade-in" | "pop-in";
  typewriterSpeed?: number;
  textMovement?: "none" | "slide-left-to-right" | "slide-right-to-left" | "slide-bottom-to-top" | "motion-path";
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  name: string;
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
  hidden: boolean;
}

export interface EditorProject {
  id: string;
  width: number;
  height: number;
  fps: number;
  backgroundColor?: string;
  tracks: TimelineTrack[];
  duration: number; // project total duration
}

export const DEFAULT_TRANSFORM: Transform = {
  x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100
};

export const DEFAULT_FILTERS: ClipFilters = { brightness: 0, contrast: 1, saturation: 1 };

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volumePercent: 100,
  muted: false,
  fadeInSeconds: 0,
  fadeOutSeconds: 0
};

export function createClip(
  sourceId: string, 
  trackId: string,
  type: TimelineClip["type"],
  timelineStart: number, 
  sourceDuration: number
): TimelineClip {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    trackId,
    sourceId,
    type,
    timelineStart,
    duration: sourceDuration,
    sourceStart: 0,
    sourceEnd: sourceDuration,
    speed: 1,
    audio: type === "video" || type === "audio" ? { ...DEFAULT_AUDIO_SETTINGS } : undefined,
    transform: type === "video" || type === "image" || type === "text" ? { ...DEFAULT_TRANSFORM } : undefined,
    filters: type === "video" || type === "image" ? { ...DEFAULT_FILTERS } : undefined,
    text: type === "text" ? "New Text" : undefined,
  };
}

export function createTrack(type: TrackType, name: string): TimelineTrack {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    name,
    clips: [],
    muted: false,
    locked: false,
    hidden: false
  };
}

export function createProject(width = 1280, height = 720, fps = 30): EditorProject {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    width,
    height,
    fps,
    backgroundColor: "#000000",
    tracks: [
      createTrack("effect", "FX"),
      createTrack("video", "V1")
    ],
    duration: 0
  };
}

export function getProjectDuration(project: EditorProject): number {
  let max = 0;
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      const end = clip.timelineStart + clip.duration;
      if (end > max) max = end;
    }
  }
  return max;
}

export function cloneProject(project: EditorProject): EditorProject {
  return {
    ...project,
    tracks: project.tracks.map(t => ({
      ...t,
      clips: t.clips.map(c => ({
        ...c,
        transform: c.transform ? { ...c.transform } : undefined,
        crop: c.crop ? { ...c.crop } : undefined,
        audio: c.audio ? { ...c.audio } : undefined,
        filters: c.filters ? { ...c.filters } : undefined,
        effects: c.effects ? [...c.effects] : undefined,
        keyframes: c.keyframes ? [...c.keyframes] : undefined,
        chromaKey: c.chromaKey ? { ...c.chromaKey } : undefined,
        motionPath: c.motionPath ? { ...c.motionPath } : undefined,
      }))
    }))
  };
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
