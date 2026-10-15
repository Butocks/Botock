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
  vignette?: number; // 0 to 100 percentage
  hueRotate?: number; // -180 to 180 degrees
}

export type AspectRatioPreset = "16:9" | "9:16" | "1:1" | "4:5";

export type AnimationPreset =
  | "none"
  | "fade-in"
  | "zoom-in"
  | "zoom-out"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "pop-bounce"
  | "spin-in"
  | "whip-pan"
  | "elastic-scale"
  | "blur-reveal";

export interface AnimationMatrix {
  scale: number;
  offsetX: number; // percentage offset: -100 to 100
  offsetY: number; // percentage offset: -100 to 100
  opacity: number; // 0 to 1
  rotation?: number; // degrees
  blur?: number; // blur px
}

export interface ClipColorFilter {
  brightness: number;
  contrast: number;
  saturation: number;
  blur?: number;
  vignette?: number;
  hueRotate?: number;
}

export function computeAnimationMatrix(
  preset?: AnimationPreset,
  elapsedInClip: number = 0,
  animDuration: number = 0.6
): AnimationMatrix {
  if (!preset || preset === "none" || elapsedInClip >= animDuration || animDuration <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0, blur: 0 };
  }

  const p = Math.max(0, Math.min(1, elapsedInClip / animDuration));
  // Cubic ease-out
  const easeOut = 1 - Math.pow(1 - p, 3);

  switch (preset) {
    case "fade-in":
      return {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        opacity: easeOut,
      };

    case "zoom-in":
      return {
        scale: 0.35 + 0.65 * easeOut,
        offsetX: 0,
        offsetY: 0,
        opacity: Math.min(1, p * 2.5),
      };

    case "zoom-out":
      return {
        scale: 1.5 - 0.5 * easeOut,
        offsetX: 0,
        offsetY: 0,
        opacity: Math.min(1, p * 2.5),
      };

    case "slide-up":
      return {
        scale: 1,
        offsetX: 0,
        offsetY: (1 - easeOut) * 40,
        opacity: Math.min(1, p * 2.5),
      };

    case "slide-down":
      return {
        scale: 1,
        offsetX: 0,
        offsetY: -(1 - easeOut) * 40,
        opacity: Math.min(1, p * 2.5),
      };

    case "slide-left":
      return {
        scale: 1,
        offsetX: (1 - easeOut) * 40,
        offsetY: 0,
        opacity: Math.min(1, p * 2.5),
      };

    case "slide-right":
      return {
        scale: 1,
        offsetX: -(1 - easeOut) * 40,
        offsetY: 0,
        opacity: Math.min(1, p * 2.5),
      };

    case "pop-bounce": {
      let bounceScale = 1;
      if (p < 0.65) {
        bounceScale = (p / 0.65) * 1.15;
      } else {
        const settle = (p - 0.65) / 0.35;
        bounceScale = 1.15 - 0.15 * (1 - Math.pow(1 - settle, 2));
      }
      return {
        scale: Math.max(0.01, bounceScale),
        offsetX: 0,
        offsetY: 0,
        opacity: Math.min(1, p * 3),
      };
    }

    case "spin-in":
      return {
        scale: 0.2 + 0.8 * easeOut,
        offsetX: 0,
        offsetY: 0,
        opacity: easeOut,
        rotation: (1 - easeOut) * -180,
      };

    case "whip-pan":
      return {
        scale: 1,
        offsetX: -(1 - easeOut) * 60,
        offsetY: 0,
        opacity: Math.min(1, p * 3),
        blur: (1 - easeOut) * 8,
      };

    case "elastic-scale": {
      const decay = Math.pow(2, -10 * p);
      const elastic = 1 - decay * Math.cos((p * 10 - 0.75) * ((2 * Math.PI) / 3));
      return {
        scale: Math.max(0.01, elastic),
        offsetX: 0,
        offsetY: 0,
        opacity: Math.min(1, p * 3),
      };
    }

    case "blur-reveal":
      return {
        scale: 1.15 - 0.15 * easeOut,
        offsetX: 0,
        offsetY: 0,
        opacity: easeOut,
        blur: (1 - easeOut) * 12,
      };

    default:
      return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0, blur: 0 };
  }
}

export type AnimationOutPreset =
  | "none"
  | "fade-out"
  | "zoom-out"
  | "zoom-in-out"
  | "slide-down"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "pop-out"
  | "spin-out";

export function computeAnimationOutMatrix(
  preset?: AnimationOutPreset,
  elapsedInClip: number = 0,
  clipDuration: number = 0,
  animDuration: number = 0.6
): AnimationMatrix {
  if (!preset || preset === "none" || animDuration <= 0 || clipDuration <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0, blur: 0 };
  }

  const remaining = clipDuration - elapsedInClip;
  if (remaining >= animDuration) {
    return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0, blur: 0 };
  }

  const p = Math.max(0, Math.min(1, 1 - Math.max(0, remaining) / animDuration));
  const easeIn = p * p * p;

  switch (preset) {
    case "fade-out":
      return {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        opacity: Math.max(0, 1 - easeIn),
      };

    case "zoom-out":
      return {
        scale: Math.max(0.05, 1 - 0.65 * easeIn),
        offsetX: 0,
        offsetY: 0,
        opacity: Math.max(0, 1 - p * 1.5),
      };

    case "zoom-in-out":
      return {
        scale: 1 + 0.8 * easeIn,
        offsetX: 0,
        offsetY: 0,
        opacity: Math.max(0, 1 - p * 1.5),
      };

    case "slide-down":
      return {
        scale: 1,
        offsetX: 0,
        offsetY: easeIn * 40,
        opacity: Math.max(0, 1 - p * 1.5),
      };

    case "slide-up":
      return {
        scale: 1,
        offsetX: 0,
        offsetY: -easeIn * 40,
        opacity: Math.max(0, 1 - p * 1.5),
      };

    case "slide-left":
      return {
        scale: 1,
        offsetX: -easeIn * 40,
        offsetY: 0,
        opacity: Math.max(0, 1 - p * 1.5),
      };

    case "slide-right":
      return {
        scale: 1,
        offsetX: easeIn * 40,
        offsetY: 0,
        opacity: Math.max(0, 1 - p * 1.5),
      };

    case "pop-out": {
      let popScale = 1;
      if (p < 0.25) {
        popScale = 1 + (p / 0.25) * 0.15;
      } else {
        popScale = 1.15 - ((p - 0.25) / 0.75) * 1.15;
      }
      return {
        scale: Math.max(0.01, popScale),
        offsetX: 0,
        offsetY: 0,
        opacity: Math.max(0, 1 - p * 1.5),
      };
    }

    case "spin-out":
      return {
        scale: Math.max(0.01, 1 - 0.8 * easeIn),
        offsetX: 0,
        offsetY: 0,
        opacity: Math.max(0, 1 - easeIn),
        rotation: easeIn * 180,
      };

    default:
      return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0, blur: 0 };
  }
}

export type AnimationLoopPreset =
  | "none"
  | "pulse-beat"
  | "floating"
  | "handheld-shake"
  | "pendulum-swing"
  | "glitch-jitter"
  | "slow-ken-burns"
  | "spin-continuous"
  | "breathe";

export function computeAnimationLoopMatrix(
  preset?: AnimationLoopPreset,
  elapsedInClip: number = 0,
  clipDuration: number = 0,
  speed: number = 1
): AnimationMatrix {
  if (!preset || preset === "none") {
    return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0, blur: 0 };
  }

  const s = Math.max(0.1, speed || 1);
  const t = elapsedInClip * s;

  switch (preset) {
    case "pulse-beat": {
      const beat = Math.pow(Math.abs(Math.sin(t * 3.5)), 3);
      return { scale: 1 + 0.12 * beat, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0 };
    }
    case "floating": {
      const offsetY = Math.sin(t * 2) * 5;
      const offsetX = Math.cos(t * 1.2) * 2.5;
      return { scale: 1, offsetX, offsetY, opacity: 1, rotation: Math.sin(t) * 1.5 };
    }
    case "handheld-shake": {
      const offsetX = (Math.sin(t * 7) + Math.cos(t * 11)) * 1.8;
      const offsetY = (Math.cos(t * 8) + Math.sin(t * 13)) * 1.5;
      const rot = Math.sin(t * 5) * 1.2;
      return { scale: 1.04, offsetX, offsetY, opacity: 1, rotation: rot };
    }
    case "pendulum-swing": {
      const rot = Math.sin(t * 2.5) * 8;
      return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: rot };
    }
    case "glitch-jitter": {
      const cycle = Math.floor(t * 15);
      const isGlitch = cycle % 7 === 0;
      const offsetX = isGlitch ? Math.sin(cycle * 33) * 6 : 0;
      const offsetY = isGlitch ? Math.cos(cycle * 47) * 4 : 0;
      return {
        scale: isGlitch ? 1.03 : 1,
        offsetX,
        offsetY,
        opacity: 1,
        rotation: isGlitch ? (Math.random() - 0.5) * 2 : 0,
      };
    }
    case "slow-ken-burns": {
      const dur = Math.max(0.1, clipDuration);
      const p = Math.min(1, Math.max(0, elapsedInClip / dur));
      return { scale: 1 + 0.18 * p, offsetX: p * 2, offsetY: -p * 1.5, opacity: 1, rotation: 0 };
    }
    case "spin-continuous": {
      const rot = (t * 60) % 360;
      return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: rot };
    }
    case "breathe": {
      const breathe = (Math.sin(t * 1.8) + 1) / 2;
      return { scale: 0.96 + 0.08 * breathe, offsetX: 0, offsetY: 0, opacity: 0.95 + 0.05 * breathe, rotation: 0 };
    }
    default:
      return { scale: 1, offsetX: 0, offsetY: 0, opacity: 1, rotation: 0, blur: 0 };
  }
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
  
  // Animation Presets
  animationIn?: AnimationPreset;
  animationDuration?: number;
  animationOut?: AnimationOutPreset;
  animationOutDuration?: number;
  animationLoop?: AnimationLoopPreset;
  animationLoopSpeed?: number;

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

export const DEFAULT_FILTERS: ClipFilters = { brightness: 0, contrast: 1, saturation: 1, vignette: 0, hueRotate: 0 };

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
