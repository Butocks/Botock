"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, Download, Play, Pause, Upload,
  ZoomIn, ZoomOut, Scissors, Trash2, Undo2, Redo2, Plus,
  Home, Film, Type, Volume2, Settings, Layers,
  SkipBack, SkipForward, Sliders, Wand2, Ghost,
  ChevronDown, Image as ImageIcon, Music, Video, X, Move,
  Mic, Square, Sparkles, Smile, Dog, Popcorn, Wind, Bell, Disc
} from "lucide-react";

import { useMediaStore } from "../../store/useMediaStore";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { useEditorTimeline } from "@/lib/editor/useEditorTimeline";
import { useThumbnails } from "@/lib/editor/useThumbnails";
import { useWaveforms } from "@/lib/editor/useWaveform";
import { useMediaBin } from "@/lib/editor/useMediaBin";
import { exportEditorProject } from "@/lib/editor/exportTimeline";
import { MediaBinItem } from "@/lib/editor/types";
import { generateSoundEffect, SoundEffectType } from "@/lib/editor/soundEffects";

import EditorTimeline from "./components/EditorTimeline";
import PreviewCanvas from "./components/PreviewCanvas";
import TransformInspector from "./components/TransformInspector";
import TransformOverlay from "./components/TransformOverlay";
import MediaBin from "./components/MediaBin";

function fmtTime(t: number) {
  if (!Number.isFinite(t) || t < 0) return "00:00.0";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t % 1) * 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
}

type ActiveDrawer = "subtitles" | "stickers" | "pip" | "effects" | "filters" | "audio" | "media" | "properties" | null;
type ToolDropdown = "subtitles" | "stickers" | "pip" | "audio" | "filters" | "effects" | null;

// Preset Filters
const FILTER_PRESETS = [
  { name: "Original", b: 0, c: 1, s: 1, icon: "✨" },
  { name: "Cinematic", b: 0, c: 1.3, s: 0.85, icon: "🎬" },
  { name: "Warm Glow", b: 0.05, c: 1.15, s: 1.35, icon: "🌅" },
  { name: "Cool Nordic", b: -0.05, c: 1.1, s: 0.7, icon: "❄️" },
  { name: "Vintage 90s", b: 0.1, c: 0.9, s: 0.75, icon: "📼" },
  { name: "B & W", b: 0, c: 1.3, s: 0, icon: "🖤" },
  { name: "Sepia Tone", b: 0.05, c: 0.95, s: 0.45, icon: "📜" },
  { name: "Cyberpunk", b: 0, c: 1.45, s: 1.85, icon: "⚡" },
  { name: "Moody Dark", b: -0.1, c: 1.35, s: 0.9, icon: "🌿" },
];

// Complete Video & Camera Effects Catalog
const VIDEO_EFFECTS_CATALOG = [
  { id: "zoom-in", name: "Smooth Zoom In", desc: "Gradual cinematic push in", category: "camera" },
  { id: "zoom-out", name: "Smooth Zoom Out", desc: "Gradual cinematic pull out", category: "camera" },
  { id: "continuous-zoom-in", name: "Continuous Zoom In", desc: "Steady constant zoom in for entire effect duration", category: "camera" },
  { id: "continuous-zoom-out", name: "Continuous Zoom Out", desc: "Steady constant zoom out for entire effect duration", category: "camera" },
  { id: "pan-zoom-right-to-left", name: "Right-to-Left Pan Zoom", desc: "Anime dynamic angle sweep", category: "anime" },
  { id: "pan-zoom-left-to-right", name: "Left-to-Right Pan Zoom", desc: "Anime dynamic angle sweep", category: "anime" },
  { id: "anime-punch", name: "Anime Punch Snap", desc: "Fast impact zoom + vibration", category: "anime" },
  { id: "anime-shake", name: "Action Shake", desc: "Tremor impact shake", category: "anime" },
  { id: "dutch-tilt", name: "Dutch Tilt Roll", desc: "Dramatic camera roll tilt", category: "anime" },
  { id: "pulse-beat", name: "Pulse Beat", desc: "Heartbeat aura pulse", category: "anime" },
  { id: "whip-pan", name: "Whip Pan", desc: "Fast swoosh + motion blur", category: "anime" },
  { id: "anime-speed-lines", name: "Anime Speed Lines", desc: "Dynamic radial action lines", category: "anime" },
  { id: "white-flash", name: "White Hit Flash", desc: "Action hit impact flash", category: "anime" },
  { id: "glitch", name: "Glitch Shake", desc: "Digital glitch distortion", category: "visual" },
  { id: "blur", name: "Blur Focus", desc: "Cinematic soft defocus", category: "visual" },
  { id: "mirror", name: "Mirror / Flip", desc: "Horizontal flip", category: "visual" },
  { id: "pan-left", name: "Pan Left", desc: "Slide camera left", category: "camera" },
  { id: "pan-right", name: "Pan Right", desc: "Slide camera right", category: "camera" },
  { id: "fade-in", name: "Fade In", desc: "Opacity fade from black", category: "visual" },
  { id: "fade-out", name: "Fade Out", desc: "Opacity fade to black", category: "visual" },
];

// Preset Subtitle Styles
const SUBTITLE_STYLES = [
  { name: "Classic Yellow", color: "#ffe600", fontSize: 50, label: "Yellow (TikTok/Shorts style)" },
  { name: "Clean White", color: "#ffffff", fontSize: 48, label: "Pure White Bold" },
  { name: "Neon Cyan", color: "#00f0ff", fontSize: 50, label: "Cyber Neon Glow" },
  { name: "Fiery Red", color: "#ff2a2a", fontSize: 52, label: "Punchy Red Headline" },
  { name: "Lime Green", color: "#39ff14", fontSize: 48, label: "High-Vis Neon Green" },
  { name: "Pastel Pink", color: "#ff77e9", fontSize: 50, label: "Vibrant Aesthetic Pink" },
];

// Stickers Library
const STICKER_LIST = [
  "🔥", "❤️", "😂", "⭐", "💥", "🎬", "💯", "👍", "🎉", "🚀",
  "👑", "⚡", "🍕", "🕶️", "🎯", "⚠️", "🔔", "💎", "🌈", "💀",
  "🤖", "🎵", "☕", "👏", "🤩", "🐱", "🐶", "✨", "🍿", "🏆",
  "🥊", "🎮", "🏎️", "⚽", "🍔", "🍦", "🥑", "💡", "💣", "🪄"
];

function createSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

// Curated Animated GIFs for Stickers
const GIF_STICKERS_LIST = [
  {
    id: "anime-speed",
    name: "Anime Speed Lines",
    tag: "Action",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.c{transform-origin:100px 100px;animation:spin 1s linear infinite}</style><g class='c'><path d='M100 100 L0 0 M100 100 L50 0 M100 100 L100 0 M100 100 L150 0 M100 100 L200 0 M100 100 L200 50 M100 100 L200 100 M100 100 L200 150 M100 100 L200 200 M100 100 L150 200 M100 100 L100 200 M100 100 L50 200 M100 100 L0 200 M100 100 L0 150 M100 100 L0 100 M100 100 L0 50' stroke='white' stroke-width='4' stroke-dasharray='15,20'/></g><circle cx='100' cy='100' r='35' fill='black' opacity='0.7'/></svg>`),
  },
  {
    id: "fire-aura",
    name: "Super Saiyan Flame",
    tag: "Aura",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 200' width='160' height='200'><style>@keyframes flame{0%{transform:scaleY(1) translateY(0);opacity:0.9}50%{transform:scaleY(1.15) translateY(-5px);opacity:1}100%{transform:scaleY(1) translateY(0);opacity:0.9}}.f{transform-origin:80px 180px;animation:flame 0.6s ease-in-out infinite}</style><g class='f'><path d='M80 10 C50 60 20 100 30 160 C40 200 120 200 130 160 C140 100 110 60 80 10 Z' fill='#ff9900'/><path d='M80 50 C60 85 40 115 50 160 C60 190 100 190 110 160 C120 115 100 85 80 50 Z' fill='#ffe600'/><path d='M80 90 C70 115 60 135 65 160 C70 175 90 175 95 160 C100 135 90 115 80 90 Z' fill='#ffffff'/></g></svg>`),
  },
  {
    id: "anime-anger",
    name: "Anime Anger Vein",
    tag: "Anime",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><style>@keyframes pop{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}.a{transform-origin:50px 50px;animation:pop 0.5s ease-in-out infinite}</style><g class='a'><path d='M30 30 Q50 35 70 30 M30 70 Q50 65 70 70 M30 30 Q35 50 30 70 M70 30 Q65 50 70 70' stroke='#ff2222' stroke-width='8' fill='none' stroke-linecap='round'/></g></svg>`),
  },
  {
    id: "deal-with-it",
    name: "Thug Life Glasses",
    tag: "Meme",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60' width='200' height='60'><style>@keyframes drop{0%{transform:translateY(-40px);opacity:0}60%{transform:translateY(0);opacity:1}100%{transform:translateY(0);opacity:1}}.g{animation:drop 1s cubic-bezier(0.1,0.9,0.2,1) infinite}</style><g class='g'><rect x='20' y='15' width='60' height='30' fill='black'/><rect x='120' y='15' width='60' height='30' fill='black'/><rect x='80' y='20' width='40' height='8' fill='black'/><rect x='25' y='20' width='10' height='10' fill='white'/><rect x='125' y='20' width='10' height='10' fill='white'/></g></svg>`),
  },
  {
    id: "sparkle-wow",
    name: "Sparkle Eyes / WOW",
    tag: "Effect",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' width='120' height='120'><style>@keyframes pulse{0%,100%{transform:scale(0.8) rotate(0deg)}50%{transform:scale(1.25) rotate(90deg)}}.s{transform-origin:60px 60px;animation:pulse 0.7s ease-in-out infinite}</style><g class='s'><polygon points='60,0 72,48 120,60 72,72 60,120 48,72 0,60 48,48' fill='#ffe600'/><polygon points='60,25 65,55 95,60 65,65 60,95 55,65 25,60 55,55' fill='white'/></g></svg>`),
  },
  {
    id: "sweat-drop",
    name: "Anime Sweat Drop",
    tag: "Anime",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 120' width='80' height='120'><style>@keyframes drip{0%{transform:translateY(-10px) scale(0.9);opacity:0.8}50%{transform:translateY(5px) scale(1.05);opacity:1}100%{transform:translateY(-10px) scale(0.9);opacity:0.8}}.d{transform-origin:40px 60px;animation:drip 0.8s ease-in-out infinite}</style><g class='d'><path d='M40 10 C20 40 5 70 5 90 C5 108 20 120 40 120 C60 120 75 108 75 90 C75 70 60 40 40 10 Z' fill='#00d0ff'/><ellipse cx='30' cy='85' rx='6' ry='12' fill='white' opacity='0.7'/></g></svg>`),
  },
  {
    id: "alert-siren",
    name: "Alert Warning",
    tag: "Reaction",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' width='120' height='120'><style>@keyframes flash{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.1)}}.r{transform-origin:60px 60px;animation:flash 0.4s ease-in-out infinite}</style><g class='r'><circle cx='60' cy='60' r='50' fill='#ff2222'/><polygon points='60,20 100,90 20,90' fill='#ffe600'/><text x='60' y='82' font-family='sans-serif' font-weight='900' font-size='42' fill='black' text-anchor='middle'>!</text></g></svg>`),
  },
  {
    id: "target-crosshair",
    name: "Action Lock-On",
    tag: "Overlay",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' width='120' height='120'><style>@keyframes rot{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.t{transform-origin:60px 60px;animation:rot 2s linear infinite}</style><g class='t'><circle cx='60' cy='60' r='45' stroke='#39ff14' stroke-width='4' fill='none' stroke-dasharray='15,8'/><circle cx='60' cy='60' r='12' stroke='#39ff14' stroke-width='3' fill='none'/><line x1='60' y1='0' x2='60' y2='30' stroke='#39ff14' stroke-width='3'/><line x1='60' y1='90' x2='60' y2='120' stroke='#39ff14' stroke-width='3'/><line x1='0' y1='60' x2='30' y2='60' stroke='#39ff14' stroke-width='3'/><line x1='90' y1='60' x2='120' y2='60' stroke='#39ff14' stroke-width='3'/></g></svg>`),
  },
  {
    id: "anime-shout",
    name: "NANI?! Shock",
    tag: "Anime",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 80' width='160' height='80'><style>@keyframes shake{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(-3px,2px) scale(1.05)}75%{transform:translate(3px,-2px) scale(1.08)}}.n{transform-origin:80px 40px;animation:shake 0.25s infinite}</style><g class='n'><polygon points='10,10 40,5 80,12 120,5 155,15 145,50 155,75 110,68 80,78 40,68 15,75 5,45' fill='#ffe600' stroke='#000000' stroke-width='4'/><text x='80' y='52' font-family='sans-serif' font-weight='900' font-size='30' fill='#ff1111' stroke='#000000' stroke-width='1.5' text-anchor='middle'>NANI?!</text></g></svg>`),
  },
  {
    id: "boom-impact",
    name: "BOOM! Comic Hit",
    tag: "Action",
    url: createSvgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 100' width='140' height='100'><style>@keyframes boom{0%,100%{transform:scale(0.95)}50%{transform:scale(1.15)}}.b{transform-origin:70px 50px;animation:boom 0.35s ease-in-out infinite}</style><g class='b'><polygon points='70,5 88,32 120,25 105,52 135,72 100,78 95,98 70,82 45,98 40,78 5,72 35,52 20,25 52,32' fill='#ff4400' stroke='#ffe600' stroke-width='4'/><text x='70' y='60' font-family='sans-serif' font-weight='900' font-size='24' fill='white' stroke='black' stroke-width='2' text-anchor='middle'>BOOM!</text></g></svg>`),
  },
];

// Sound Effects definitions
const SOUND_EFFECTS: { id: SoundEffectType; name: string; icon: any; desc: string }[] = [
  { id: "laughter", name: "Laughing Crowd", icon: Smile, desc: "Hilarious crowd chuckle" },
  { id: "applause", name: "Crowd Applause", icon: Sparkles, desc: "Audience cheering & clapping" },
  { id: "dog_bark", name: "Dog Bark", icon: Dog, desc: "Alert dog bark" },
  { id: "eating_crunch", name: "Eating / Crunch", icon: Popcorn, desc: "Crispy crunch bite" },
  { id: "whoosh", name: "Dramatic Whoosh", icon: Wind, desc: "Cinematic transition whoosh" },
  { id: "bell_chime", name: "Bell Chime", icon: Bell, desc: "Clear notification ding" },
  { id: "upbeat_loop", name: "Upbeat Beat", icon: Disc, desc: "Drum beat loop" },
];

// Canvas Aspect Ratio Presets
const ASPECT_RATIOS = [
  { label: "16:9", sub: "YouTube / Landscape", width: 1280, height: 720, icon: "🖥️" },
  { label: "9:16", sub: "TikTok / Reels / Shorts", width: 720, height: 1280, icon: "📱" },
  { label: "1:1", sub: "Square / Feed", width: 1080, height: 1080, icon: "⬛" },
  { label: "4:5", sub: "Portrait", width: 1080, height: 1350, icon: "🖼️" },
  { label: "4:3", sub: "Standard", width: 1440, height: 1080, icon: "📺" },
  { label: "21:9", sub: "Cinematic Ultrawide", width: 1920, height: 820, icon: "🎬" },
];

export default function VideoEditorComponent() {
  const { activeMedia } = useMediaStore();
  const rafRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const timeRef = useRef(currentTime);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__isEditorPlaying = isPlaying;
    }
  }, [isPlaying]);

  const [isMobile, setIsMobile] = useState(false);
  const [openTool, setOpenTool] = useState<ToolDropdown>(null);
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(false);
  const [isTransformActive, setIsTransformActive] = useState(false);

  // Voice recording & AI Subtitles state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isAutoCaptioning, setIsAutoCaptioning] = useState(false);
  const [autoCaptionProgress, setAutoCaptionProgress] = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [zoom, setZoom] = useState(1);
  const [thumbnailsBySource, setThumbnailsBySource] = useState<Record<string, string[]>>({});
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState("");
  const [exportError, setExportError] = useState<string | null>(null);
  const [stickerTab, setStickerTab] = useState<"stickers" | "gifs">("stickers");

  const mediaBin = useMediaBin();
  const timeline = useEditorTimeline();
  const thumbs = useThumbnails();
  const waveformsBySource = useWaveforms(mediaBin.items);
  const { load, writeFile, readFile, deleteFile, exec } = useFFmpeg();

  // 60fps smooth playback DOM clock
  useEffect(() => {
    const h = (e: any) => {
      const el = document.getElementById("editor-playback-time");
      if (el) el.innerText = fmtTime(e.detail);
    };
    window.addEventListener("editor-time-update", h);
    return () => window.removeEventListener("editor-time-update", h);
  }, []);

  const allClips = React.useMemo(
    () => timeline.project.tracks.flatMap((t) => t.clips),
    [timeline.project.tracks]
  );

  // Prevent accidental data loss on refresh or close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allClips.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [allClips.length]);

  const currentMaxTime =
    allClips.length > 0
      ? Math.max(...allClips.map((c) => c.timelineStart + c.duration))
      : 0;

  const selectedClip = allClips.find((c) => c.id === timeline.selectedClipId);
  const v1Track = timeline.project.tracks.find((t) => t.name === "V1" && t.type === "video");

  const currentRatio =
    ASPECT_RATIOS.find((r) => r.width === timeline.project.width && r.height === timeline.project.height) || {
      label: `${timeline.project.width}:${timeline.project.height}`,
      sub: "Custom",
      width: timeline.project.width,
      height: timeline.project.height,
      icon: "📐",
    };

  // Auto-import active media from AI generator
  useEffect(() => {
    if (!activeMedia) return;
    const src = activeMedia.blobUrl || activeMedia.url;
    if (!src) return;
    const importGenerated = async () => {
      const blob = activeMedia.blob || (await (await fetch(src)).blob());
      const file = new File([blob], "generated-video.mp4", { type: blob.type || "video/mp4" });
      const item = await mediaBin.addFile(file);
      const vTrack = timeline.project.tracks.find((t) => t.type === "video");
      if (vTrack) timeline.addClip(vTrack.id, item.id, "video", 0, item.duration);
      const generated = await thumbs.generate(item.url, item.duration, 8);
      setThumbnailsBySource((prev) => ({ ...prev, [item.id]: generated }));
    };
    void importGenerated();
  }, [activeMedia]);

  // Upload handler
  const handleMediaBinUpload = async (file: File) => {
    const item = await mediaBin.addFile(file);
    if (file.type.startsWith("image/")) {
      setThumbnailsBySource((prev) => ({ ...prev, [item.id]: [item.url] }));
    } else if (file.type.startsWith("video/")) {
      const generated = await thumbs.generate(item.url, item.duration, 8);
      setThumbnailsBySource((prev) => ({ ...prev, [item.id]: generated }));
    }
    showToast(`Added "${item.name}" to Media Bin`);
  };

  const addItemToTimeline = (item: MediaBinItem, targetTrackId?: string) => {
    timeline.addMediaClip(item, undefined, targetTrackId);
    showToast(`Added "${item.name}" to timeline`);
  };

  const handleUploadAndAddToTrack = async (trackId: string, file: File) => {
    const item = await mediaBin.addFile(file);
    if (file.type.startsWith("image/")) {
      setThumbnailsBySource((prev) => ({ ...prev, [item.id]: [item.url] }));
    } else if (file.type.startsWith("video/")) {
      const generated = await thumbs.generate(item.url, item.duration, 8);
      setThumbnailsBySource((prev) => ({ ...prev, [item.id]: generated }));
    }
    addItemToTimeline(item, trackId);
  };

  // Buffering state listener (Pauses timeline clock when media is buffering / waiting for data)
  const isBufferingRef = useRef(false);
  useEffect(() => {
    const handleBuffering = (e: any) => {
      isBufferingRef.current = !!e.detail;
    };
    window.addEventListener("editor-buffering-state", handleBuffering);
    return () => window.removeEventListener("editor-buffering-state", handleBuffering);
  }, []);

  // Playback RAF
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    let lastTs: number | null = null;
    let lastStateUpdateTs = 0;
    const tick = (ts: number) => {
      if (lastTs === null) {
        lastTs = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      // Facebook / YouTube style auto-pause: if media is currently buffering, wait for it!
      if (isBufferingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const maxTime = currentMaxTime;

      let next = timeRef.current + dt;
      if (next >= maxTime && maxTime > 0) {
        next = maxTime;
        timeRef.current = maxTime;
        window.dispatchEvent(new CustomEvent("editor-time-update", { detail: maxTime }));
        setIsPlaying(false);
        setCurrentTime(maxTime);
        return;
      }
      timeRef.current = next;
      window.dispatchEvent(new CustomEvent("editor-time-update", { detail: next }));

      // Throttle React state setCurrentTime to ~12.5fps (every 80ms) during active playback
      // to eliminate React tree re-rendering lag while PreviewCanvas renders at full 60fps via refs
      if (ts - lastStateUpdateTs >= 80) {
        lastStateUpdateTs = ts;
        setCurrentTime(next);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, currentMaxTime]);

  // TOGGLE PLAY (Validation: Does NOT play if no media on timeline)
  const togglePlay = () => {
    if (allClips.length === 0 || currentMaxTime <= 0) {
      showToast("Please add video or audio to the timeline first!");
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentTime(timeRef.current);
    } else {
      let startT = timeRef.current;
      if (startT >= currentMaxTime - 0.1) {
        startT = 0;
        setCurrentTime(0);
      }
      timeRef.current = startT;
      window.dispatchEvent(new CustomEvent("editor-time-update", { detail: startT }));
      setIsPlaying(true);
    }
  };

  const seekTo = useCallback(
    (t: number) => {
      const maxTime = Math.max(1, currentMaxTime);
      setCurrentTime(Math.max(0, Math.min(maxTime, t)));
    },
    [currentMaxTime]
  );

  const handlePreviewClipRange = useCallback(
    (startTime: number, duration?: number) => {
      seekTo(startTime);
      setIsPlaying(true);
      const playDur = Math.max(600, Math.min(15000, (duration || 2) * 1000));
      setTimeout(() => {
        setIsPlaying(false);
      }, playDur);
    },
    [seekTo]
  );

  const doExport = async () => {
    if (isExporting) return;
    if (allClips.length === 0) {
      showToast("Cannot export empty project. Add media first!");
      return;
    }
    setIsExporting(true);
    setExportError(null);
    setResultUrl(null);
    try {
      const blob = await exportEditorProject(
        timeline.project,
        mediaBin as any,
        { load, writeFile, exec, readFile, deleteFile },
        (msg) => setExportStage(msg)
      );
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      // Auto-trigger browser download
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = `botock-video-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("Export complete! Download started.");
      } catch (_) {}
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
      setExportStage("");
    }
  };

  // ─── Tool Actions ──────────────────────────────────────────────────────────
  const addEffectToTimeline = (effectType: string, explicitTrackId?: string) => {
    timeline.addEffectClip(effectType, currentTime, 2.0, explicitTrackId);
    showToast(`Added "${effectType}" effect track on timeline!`);
    setOpenTool(null);
    setActiveDrawer(null);
  };

  const handleToggleMuteAll = (muted: boolean) => {
    timeline.beginLiveUpdate();
    timeline.project.tracks.forEach((t) => {
      t.clips.forEach((c) => {
        if (c.type === "video" || c.type === "audio") {
          timeline.updateClipLive(c.id, {
            audio: {
              ...(c.audio || { volumePercent: 100, fadeInSeconds: 0, fadeOutSeconds: 0 }),
              muted,
            },
          });
        }
      });
    });
    timeline.commitLiveUpdate();
    showToast(muted ? "Muted all clips on timeline" : "Unmuted all clips on timeline");
  };

  const applyEffect = (type: string) => {
    if (selectedClip && selectedClip.type === "effect") {
      timeline.beginLiveUpdate();
      timeline.updateClipLive(selectedClip.id, {
        text: type.toUpperCase(),
        effects: [{ id: `eff-${Date.now()}`, type, intensity: 1, duration: selectedClip.duration }],
      });
      timeline.commitLiveUpdate();
      showToast(`Updated effect clip to ${type}`);
      return;
    }
    // Add effect clip onto timeline FX track so user can stretch, trim, and move it directly!
    addEffectToTimeline(type);
  };

  const applyChromaKey = (color: string) => {
    if (!selectedClip) {
      showToast("Click a video clip on the timeline first");
      return;
    }
    const isSameColorAndEnabled = selectedClip.chromaKey?.color === color && selectedClip.chromaKey?.enabled;
    timeline.beginLiveUpdate();
    timeline.updateClipLive(selectedClip.id, {
      chromaKey: {
        color,
        similarity: 0.3,
        blend: 0.1,
        spillReduction: 0,
        enabled: !isSameColorAndEnabled,
      },
    });
    timeline.commitLiveUpdate();
    showToast(!isSameColorAndEnabled ? `Chroma Key enabled (${color})` : "Chroma Key disabled");
    setOpenTool(null);
    setActiveDrawer(null);
  };

  const applyFilterPreset = (preset: typeof FILTER_PRESETS[0]) => {
    if (!selectedClip) {
      showToast("Click a video clip on the timeline first");
      return;
    }
    timeline.beginLiveUpdate();
    timeline.updateClipLive(selectedClip.id, {
      filters: { brightness: preset.b, contrast: preset.c, saturation: preset.s },
    });
    timeline.commitLiveUpdate();
    showToast(`Applied filter: ${preset.name}`);
    setOpenTool(null);
    setActiveDrawer(null);
  };

  const addSubtitleClip = (style?: typeof SUBTITLE_STYLES[0], explicitTrackId?: string) => {
    const newId = timeline.addTextClip(
      "New Subtitle",
      currentTime,
      3,
      {
        color: style ? style.color : "#ffe600",
        fontSizePercent: style ? style.fontSize : 48,
        transform: {
          x: 50,
          y: 80,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 100,
        },
      },
      explicitTrackId
    );
    timeline.setSelectedClipId(newId);
    setIsTransformActive(true);
    showToast("Added subtitle at playhead");
    setOpenTool(null);
    setActiveDrawer(null);
  };

  const handleGenerateAutoCaptions = async () => {
    const sourceClip = allClips.find((c) => c.type === "video" || c.type === "audio");
    const mediaItem = mediaBin.items.find((m) => m.id === sourceClip?.sourceId) || mediaBin.items[0];

    if (!mediaItem || !mediaItem.file) {
      showToast("Please upload a video or audio file first to generate auto-captions!");
      return;
    }

    try {
      setIsAutoCaptioning(true);
      setAutoCaptionProgress("Decoding audio for AI transcription...");

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      let channelData: Float32Array;
      try {
        const arrayBuffer = await mediaItem.file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        channelData = audioBuffer.getChannelData(0);
      } finally {
        try {
          await audioContext.close();
        } catch (_) {}
      }

      setAutoCaptionProgress("AI Whisper model transcribing speech...");

      const worker = new Worker(new URL("../subtitles/worker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (e) => {
        const { status, message, output, error } = e.data;
        if (status === "loading" || status === "processing") {
          setAutoCaptionProgress(message || "Processing speech...");
        } else if (status === "done") {
          setIsAutoCaptioning(false);
          setAutoCaptionProgress("");
          worker.terminate();

          if (output && output.chunks && output.chunks.length > 0) {
            let srt = "";
            output.chunks.forEach((chunk: any, index: number) => {
              const startMs = (chunk.timestamp?.[0] || 0) * 1000;
              const endMs = (chunk.timestamp?.[1] || ((chunk.timestamp?.[0] || 0) + 2.5)) * 1000;
              const pad = (n: number, z = 2) => String(n).padStart(z, "0");
              const formatTime = (ms: number) => {
                const h = Math.floor(ms / 3600000);
                const m = Math.floor((ms % 3600000) / 60000);
                const s = Math.floor((ms % 60000) / 1000);
                const millis = Math.floor(ms % 1000);
                return `${pad(h)}:${pad(m)}:${pad(s)},${pad(millis, 3)}`;
              };
              srt += `${index + 1}\n${formatTime(startMs)} --> ${formatTime(endMs)}\n${(chunk.text || "").trim()}\n\n`;
            });
            timeline.importSRT(srt);
            showToast(`✨ Generated ${output.chunks.length} AI auto-captions!`);
            setOpenTool(null);
            setActiveDrawer(null);
          } else {
            showToast("No spoken words detected in audio.");
          }
        } else if (status === "error") {
          setIsAutoCaptioning(false);
          setAutoCaptionProgress("");
          worker.terminate();
          showToast(`Auto-captions error: ${error || "Model failed to load"}`);
        }
      };

      worker.onerror = () => {
        setIsAutoCaptioning(false);
        setAutoCaptionProgress("");
        worker.terminate();
        showToast("AI worker failed to initialize.");
      };

      worker.postMessage({
        type: "generate",
        audioData: channelData,
      });
    } catch (err: any) {
      setIsAutoCaptioning(false);
      setAutoCaptionProgress("");
      showToast(`Could not decode audio: ${err?.message || "Unknown error"}`);
    }
  };

  const addStickerClip = (sticker: string) => {
    const newId = timeline.addTextClip(
      sticker,
      currentTime,
      2.5,
      {
        fontSizePercent: 85,
        transform: {
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 100,
        },
      }
    );
    timeline.setSelectedClipId(newId);
    setIsTransformActive(true);
    showToast(`Added sticker ${sticker}`);
    setOpenTool(null);
    setActiveDrawer(null);
  };

  const addGifClip = (gif: { name: string; url: string }) => {
    const mediaId = `gif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const mediaItem: MediaBinItem = {
      id: mediaId,
      name: gif.name,
      file: new File([""], `${gif.name}.gif`, { type: "image/gif" }),
      url: gif.url,
      duration: 3.0,
      width: 480,
      height: 480,
    };
    mediaBin.addItem(mediaItem);

    const newClipId = timeline.addOverlayClip(mediaItem, currentTime, {
      scaleX: 0.45,
      scaleY: 0.45,
      x: 50,
      y: 50,
    });
    timeline.setSelectedClipId(newClipId);
    setIsTransformActive(true);
    showToast(`Added GIF "${gif.name}" overlay`);
    setOpenTool(null);
    setActiveDrawer(null);
  };

  const addPipClip = (item: MediaBinItem) => {
    const newClipId = timeline.addOverlayClip(item, currentTime, {
      x: 75,
      y: 28,
      width: 36,
      height: 36,
      scaleX: 1,
      scaleY: 1,
    });
    timeline.setSelectedClipId(newClipId);
    setIsTransformActive(true);
    showToast(`Added PIP overlay!`);
    setOpenTool(null);
    setActiveDrawer(null);
  };

  // Sound Effect generation & insertion into audio track
  const handleInsertSoundEffect = async (sfx: typeof SOUND_EFFECTS[0]) => {
    try {
      showToast(`Generating ${sfx.name}…`);
      const file = await generateSoundEffect(sfx.id);
      const item = await mediaBin.addFile(file);
      timeline.addMediaClip(item, currentTime);
      showToast(`Inserted "${sfx.name}" at playhead!`);
      setOpenTool(null);
      setActiveDrawer(null);
    } catch (e) {
      console.error(e);
      showToast("Error generating sound effect");
    }
  };

  // Voice recording toggle
  const toggleVoiceRecording = async () => {
    if (isRecordingVoice) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File(
          [blob],
          `Voiceover_${new Date().toLocaleTimeString().replace(/:/g, "-")}.webm`,
          { type: "audio/webm" }
        );
        const item = await mediaBin.addFile(file);
        timeline.addMediaClip(item, currentTime);
        stream.getTracks().forEach((t) => t.stop());
        setIsRecordingVoice(false);
        showToast("Voiceover recorded and added to timeline!");
        setOpenTool(null);
        setActiveDrawer(null);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVoice(true);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const handleSelectClip = useCallback(
    (id: string | null) => {
      timeline.setSelectedClipId(id);
      if (id) {
        const clip = allClips.find((c) => c.id === id);
        const isOverlayOrText = clip && (clip.type === "text" || clip.trackId !== v1Track?.id);
        if (isOverlayOrText) {
          setIsTransformActive(true);
        }
      } else {
        setIsTransformActive(false);
      }
    },
    [allClips, timeline, v1Track]
  );

  const handleSelectClipAtPlayhead = useCallback(() => {
    // Top-to-bottom search (tracks in reverse order so topmost overlay track is selected first)
    for (const track of [...timeline.project.tracks].reverse()) {
      if (track.hidden) continue;
      const clipAtPlayhead = track.clips.find(
        (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
      );
      if (
        clipAtPlayhead &&
        (clipAtPlayhead.type === "video" || clipAtPlayhead.type === "image" || clipAtPlayhead.type === "text")
      ) {
        timeline.setSelectedClipId(clipAtPlayhead.id);
        setIsTransformActive(true);
        return;
      }
    }
  }, [currentTime, timeline, v1Track]);

  return (
    <div className="h-screen w-screen bg-[#09090e] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[200] bg-[#ff6b4a] text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TOP HEADER
      ═════════════════════════════════════════════════════════════════════ */}
      <header className="h-12 bg-[#0d0d14] border-b border-[#242430] flex items-center justify-between px-3 md:px-4 shrink-0 z-40">
        {/* Left: Brand title */}
        <div className="flex items-center gap-2">
          <Link
            href="/tools/video-generator"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff6b4a] shadow-[0_0_8px_#ff6b4a]" />
            <h1 className="text-xs md:text-sm font-black tracking-wide bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Botock Video Editor
            </h1>
            <button
              onClick={() => setIsAspectRatioOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#181824] hover:bg-[#222232] border border-[#2b2b36] hover:border-[#ff6b4a] text-xs font-semibold text-gray-200 transition-all shadow-sm active:scale-95 ml-1"
              title="Change Canvas Aspect Ratio"
            >
              <span className="text-xs">{currentRatio.icon}</span>
              <span className="font-bold text-white text-[11px] md:text-xs">{currentRatio.label}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Center: Desktop Tools Dropdowns */}
        <div className="hidden md:flex items-center gap-1">
          {/* 1. Subtitles */}
          <HeaderDropdown
            id="subtitles"
            label="Subtitles"
            icon={<Type className="w-3.5 h-3.5 text-[#ff6b4a]" />}
            openTool={openTool}
            setOpenTool={setOpenTool}
          >
            <div className="w-64 p-3 space-y-3">
              {/* 1-Click AI Auto Captions Button */}
              <button
                onClick={handleGenerateAutoCaptions}
                disabled={isAutoCaptioning}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-[#ff6b4a]/20 to-purple-500/20 hover:from-amber-500/30 hover:via-[#ff6b4a]/30 hover:to-purple-500/30 border border-[#ff6b4a]/50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="truncate">{isAutoCaptioning ? (autoCaptionProgress || "Transcribing...") : "✨ 1-Click AI Auto Captions"}</span>
              </button>

              <div className="flex items-center justify-between border-b border-[#2b2b36] pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#ff6b4a]" /> Subtitle Styles
                </span>
                <button
                  onClick={() => addSubtitleClip()}
                  className="text-[10px] font-bold text-[#ff6b4a] hover:underline"
                >
                  + Add at Playhead
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {SUBTITLE_STYLES.map((st) => (
                  <button
                    key={st.name}
                    onClick={() => addSubtitleClip(st)}
                    className="p-2 rounded-lg bg-[#181822] hover:bg-[#222230] border border-[#2b2b36] text-left transition-all group"
                  >
                    <span className="block text-[11px] font-extrabold truncate" style={{ color: st.color }}>
                      {st.name}
                    </span>
                    <span className="text-[9px] text-gray-500 block truncate">{st.label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-[#2b2b36] pt-2">
                <label className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-[#242430] hover:bg-[#2e2e3e] text-xs font-semibold text-gray-300 hover:text-white cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import .SRT Subtitles</span>
                  <input
                    type="file"
                    accept=".srt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          timeline.importSRT(ev.target.result as string);
                          showToast("Imported .SRT subtitles track!");
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                      setOpenTool(null);
                    }}
                  />
                </label>
              </div>
            </div>
          </HeaderDropdown>

          {/* 2. Stickers */}
          <HeaderDropdown
            id="stickers"
            label="Stickers"
            icon={<Smile className="w-3.5 h-3.5 text-yellow-400" />}
            openTool={openTool}
            setOpenTool={setOpenTool}
          >
            <div className="w-80 p-3 space-y-3">
              {/* Tab Switcher */}
              <div className="flex bg-[#0a0a0e] p-1 rounded-lg border border-[#2b2b36] gap-1">
                <button
                  onClick={() => setStickerTab("stickers")}
                  className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                    stickerTab === "stickers" ? "bg-[#2b2b36] text-white shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  😊 Stickers
                </button>
                <button
                  onClick={() => setStickerTab("gifs")}
                  className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                    stickerTab === "gifs" ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/40 shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  👾 GIFs
                </button>
              </div>

              {stickerTab === "stickers" ? (
                <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto pr-1">
                  {STICKER_LIST.map((stk) => (
                    <button
                      key={stk}
                      onClick={() => addStickerClip(stk)}
                      className="h-9 rounded-xl bg-[#181822] hover:bg-[#ff6b4a]/20 border border-[#2b2b36] hover:border-[#ff6b4a] flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {/* Upload GIF / Sticker File from Device */}
                  <label className="flex items-center justify-center gap-2 p-2 rounded-xl border border-dashed border-[#ff6b4a]/60 bg-[#ff6b4a]/10 hover:bg-[#ff6b4a]/20 text-[#ff6b4a] text-xs font-bold cursor-pointer transition-all active:scale-98">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload GIF from Device</span>
                    <input
                      type="file"
                      accept="image/gif,image/webp,image/png,image/jpeg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const item = await mediaBin.addFile(file);
                          const newClipId = timeline.addOverlayClip(item, currentTime, {
                            x: 50,
                            y: 50,
                            scaleX: 0.5,
                            scaleY: 0.5,
                          });
                          timeline.setSelectedClipId(newClipId);
                          setIsTransformActive(true);
                          showToast(`Added ${file.name} to video!`);
                          setOpenTool(null);
                        } catch (err) {
                          console.error(err);
                          showToast("Error adding GIF");
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {GIF_STICKERS_LIST.map((gif) => (
                      <div
                        key={gif.id}
                        onClick={() => addGifClip(gif)}
                        className="group relative rounded-xl overflow-hidden border border-[#2b2b36] hover:border-[#ff6b4a] bg-[#0c0c12] aspect-video flex items-center justify-center cursor-pointer transition-all p-2 text-center"
                      >
                        <img
                          src={gif.url}
                          alt={gif.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-1 py-0.5 pointer-events-none">
                          <span className="text-[9px] font-semibold text-white truncate block">{gif.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </HeaderDropdown>

          {/* 3. PIP (Picture-in-Picture) */}
          <HeaderDropdown
            id="pip"
            label="PIP"
            icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
            openTool={openTool}
            setOpenTool={setOpenTool}
          >
            <div className="w-72 p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-[#2b2b36] pb-1.5">
                <span className="text-xs font-bold text-white">Picture-in-Picture</span>
                <span className="text-[10px] text-gray-500">Overlay on video</span>
              </div>
              <p className="text-[11px] text-gray-400">Select video or image to overlay:</p>
              {mediaBin.items.length === 0 ? (
                <div className="py-4 text-center text-gray-500 text-xs border border-dashed border-[#2b2b36] rounded-xl">
                  Import media first to use as PIP overlay
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                  {mediaBin.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addPipClip(item)}
                      className="group relative rounded-xl overflow-hidden border border-[#2b2b36] hover:border-[#ff6b4a] aspect-video bg-black flex items-center justify-center transition-all"
                    >
                      {item.file.type.startsWith("image/") ? (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </HeaderDropdown>

          {/* 4. Audio */}
          <HeaderDropdown
            id="audio"
            label="Audio"
            icon={<Volume2 className="w-3.5 h-3.5 text-blue-400" />}
            openTool={openTool}
            setOpenTool={setOpenTool}
          >
            <div className="w-72 p-3 space-y-3">
              <div>
                <button
                  onClick={toggleVoiceRecording}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                    isRecordingVoice
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-[#ff6b4a] hover:bg-[#ff856b] text-white"
                  }`}
                >
                  {isRecordingVoice ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>🎙️ Record Voiceover</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-[#2b2b36] pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Sound Effects Library (One-Click)
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {SOUND_EFFECTS.map((sfx) => {
                    const Icon = sfx.icon;
                    return (
                      <button
                        key={sfx.id}
                        onClick={() => handleInsertSoundEffect(sfx)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="text-xs font-semibold text-gray-200 block">{sfx.name}</span>
                            <span className="text-[9px] text-gray-500">{sfx.desc}</span>
                          </div>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </HeaderDropdown>

          {/* 5. Filters */}
          <HeaderDropdown
            id="filters"
            label="Filters"
            icon={<Sliders className="w-3.5 h-3.5 text-purple-400" />}
            openTool={openTool}
            setOpenTool={setOpenTool}
          >
            <div className="w-72 p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-[#2b2b36] pb-1.5">
                <span className="text-xs font-bold text-white">Video Filter Presets</span>
                <span className="text-[10px] text-gray-500">Applies to selected clip</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {FILTER_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyFilterPreset(p)}
                    className="p-2 rounded-lg bg-[#181822] hover:bg-[#242434] border border-[#2b2b36] text-center transition-all group"
                  >
                    <span className="text-base block mb-0.5">{p.icon}</span>
                    <span className="text-[10px] font-semibold text-gray-300 group-hover:text-white truncate block">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </HeaderDropdown>

          {/* 6. Effects */}
          <HeaderDropdown
            id="effects"
            label="Effects"
            icon={<Wand2 className="w-3.5 h-3.5 text-pink-400" />}
            openTool={openTool}
            setOpenTool={setOpenTool}
          >
            <div className="w-84 p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-[#2b2b36] pb-1.5">
                <span className="text-xs font-bold text-white">Visual & Camera Effects</span>
                <span className="text-[10px] text-gray-500">Adds FX track to timeline</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                {VIDEO_EFFECTS_CATALOG.map((eff) => {
                  const isActive = selectedClip?.effects?.some((e) => e.type === eff.id);
                  return (
                    <button
                      key={eff.id}
                      onClick={() => applyEffect(eff.id)}
                      className={`p-2 rounded-lg text-left border transition-all ${
                        isActive
                          ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-[#ff6b4a]"
                          : "bg-[#181822] border-[#2b2b36] text-gray-300 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      <span className="text-[11px] font-bold block truncate">
                        {isActive ? "✓ " : ""}
                        {eff.name}
                      </span>
                      <span className="text-[9px] text-gray-500 block truncate">{eff.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chroma Key */}
              <div className="border-t border-[#2b2b36] pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Chroma Key (Green / Blue Background Remover)
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { color: "#00ff00", label: "Green" },
                    { color: "#0000ff", label: "Blue" },
                    { color: "#ffffff", label: "White" },
                    { color: "#000000", label: "Black" },
                    { color: "#ff00ff", label: "Magenta" },
                  ].map(({ color, label }) => {
                    const isSelected = selectedClip?.chromaKey?.enabled && selectedClip.chromaKey.color === color;
                    return (
                      <button
                        key={color}
                        title={label}
                        onClick={() => applyChromaKey(color)}
                        className={`w-7 h-7 rounded-lg border-2 transition-all ${
                          isSelected ? "border-[#ff6b4a] scale-110 shadow-md" : "border-[#2b2b36] hover:border-gray-400"
                        }`}
                        style={{ background: color }}
                      />
                    );
                  })}
                  <label className="text-[10px] text-gray-400 flex items-center gap-1 cursor-pointer ml-auto">
                    <span>Custom:</span>
                    <input
                      type="color"
                      value={selectedClip?.chromaKey?.color || "#00ff00"}
                      onChange={(e) => applyChromaKey(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          </HeaderDropdown>
        </div>

        {/* Right: Export Button + Mobile Undo/Redo */}
        <div className="flex items-center gap-2">
          {isMobile && (
            <>
              <button
                onClick={timeline.undo}
                disabled={!timeline.canUndo}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={timeline.redo}
                disabled={!timeline.canRedo}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </>
          )}

          {exportError && (
            <span className="text-red-400 text-[10px] hidden sm:block max-w-[120px] truncate">{exportError}</span>
          )}
          <button
            onClick={doExport}
            disabled={isExporting}
            className="bg-[#ff6b4a] hover:bg-[#ff856b] active:scale-95 text-white px-3 md:px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? exportStage || "Exporting…" : "EXPORT"}</span>
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN WORKSPACE LAYOUT
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">

        {/* ─── DESKTOP VIEW (Media Bin Left | Video Preview Middle | Inspector Right | Timeline Bottom) ─── */}
        {!isMobile && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Top Row */}
            <div className="flex flex-1 min-h-0 overflow-hidden border-b border-[#242430]">
              {/* LEFT: Media Bin */}
              <div className="w-[185px] lg:w-[200px] bg-[#0f0f16] border-r border-[#242430] flex flex-col shrink-0 overflow-hidden">
                <div className="p-2.5 border-b border-[#242430] flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-[#ff6b4a]" /> Media Bin
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{mediaBin.items.length} files</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <MediaBin
                    items={mediaBin.items}
                    onUpload={handleMediaBinUpload}
                    onAddToTimeline={addItemToTimeline}
                    onRemoveItem={(id) => {
                      mediaBin.removeItem(id);
                      showToast("Removed media from bin");
                    }}
                  />
                </div>
              </div>

              {/* MIDDLE: Video Preview + Center Playback Controls */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#06060a] overflow-hidden">
                <div
                  className="flex-1 flex items-center justify-center p-3 relative overflow-hidden"
                  onClick={handleSelectClipAtPlayhead}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (selectedClip && (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text")) {
                      setIsTransformActive((prev) => !prev);
                    }
                  }}
                >
                  <div
                    className="relative max-w-full max-h-full flex items-center justify-center"
                    style={{ aspectRatio: `${timeline.project.width} / ${timeline.project.height}` }}
                  >
                    <PreviewCanvas
                      project={timeline.project}
                      mediaItems={mediaBin.items}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      onSelectClip={(id) => {
                        if (id) {
                          handleSelectClip(id);
                          setIsTransformActive(true);
                        } else {
                          timeline.setSelectedClipId(null);
                          setIsTransformActive(false);
                        }
                      }}
                    />
                    {selectedClip &&
                      (isTransformActive || selectedClip.type === "text") &&
                      (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text") && (
                        <TransformOverlay
                          clip={selectedClip}
                          project={timeline.project}
                          mediaItem={mediaBin.items.find((m) => m.id === selectedClip.sourceId)}
                          onBeginLive={timeline.beginLiveUpdate}
                          onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                          onCommitLive={() => timeline.commitLiveUpdate()}
                          onDeselect={() => {
                            setIsTransformActive(false);
                            timeline.setSelectedClipId(null);
                          }}
                          onDone={() => {
                            setIsTransformActive(false);
                            timeline.setSelectedClipId(null);
                          }}
                          onSeek={seekTo}
                          onPreview={handlePreviewClipRange}
                        />
                      )}
                  </div>

                  {!isPlaying && allClips.length > 0 && !selectedClip && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-20 pointer-events-auto"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Playback Controls Bar */}
                <div className="h-12 bg-[#0c0c12] border-t border-[#242430] flex items-center justify-between px-6 shrink-0">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                    <span id="editor-playback-time" className="text-white font-bold tabular-nums">
                      {fmtTime(currentTime)}
                    </span>
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-500 tabular-nums">{fmtTime(currentMaxTime)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => seekTo(0)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button onClick={() => seekTo(currentTime - 5)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <Play className="w-4 h-4 fill-current rotate-180" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-[#ff6b4a] hover:bg-[#ff856b] active:scale-95 text-white flex items-center justify-center transition-all shadow-lg"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <button onClick={() => seekTo(currentTime + 5)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button onClick={() => seekTo(currentMaxTime)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-24 text-right">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {timeline.project.width}x{timeline.project.height}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Inspector */}
              <div className="w-[260px] lg:w-[280px] bg-[#0d0d14] border-l border-[#242430] flex flex-col shrink-0 overflow-hidden">
                {selectedClip ? (
                  <TransformInspector
                    clip={selectedClip}
                    project={timeline.project}
                    onUpdateProject={(patch) => timeline.updateProject(patch)}
                    onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                    onBeginLive={timeline.beginLiveUpdate}
                    onCommitLive={timeline.commitLiveUpdate}
                    onUpdate={(patch) => {
                      timeline.beginLiveUpdate();
                      timeline.updateClipLive(selectedClip.id, patch);
                      timeline.commitLiveUpdate();
                    }}
                    onActivateTransformOnCanvas={() => setIsTransformActive(true)}
                    onAddEffectToTimeline={(effectType) => addEffectToTimeline(effectType)}
                    onDeleteClip={(id) => timeline.deleteClip(id)}
                    onSeek={seekTo}
                    onPreview={handlePreviewClipRange}
                    onMuteAll={handleToggleMuteAll}
                  />
                ) : (
                  <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                    <div className="border-b border-[#242430] pb-3">
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Canvas Settings</h4>
                      <p className="text-[10px] text-gray-500">Configure canvas aspect ratio and background fill mode.</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-gray-300">Background Fill Mode</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => timeline.updateProject({ backgroundMode: "blur-fill" })}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            timeline.project.backgroundMode === "blur-fill" || !timeline.project.backgroundMode
                              ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-white shadow-sm"
                              : "bg-[#14141e] border-[#2b2b38] text-gray-400 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-bold">Blur Fill</div>
                          <div className="text-[9px] text-gray-400 mt-0.5">TikTok / Reels style blurred video</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => timeline.updateProject({ backgroundMode: "black" })}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            timeline.project.backgroundMode === "black"
                              ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-white shadow-sm"
                              : "bg-[#14141e] border-[#2b2b38] text-gray-400 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-bold">Black Bars</div>
                          <div className="text-[9px] text-gray-400 mt-0.5">Classic letterbox</div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-gray-300">Canvas Aspect Ratio</span>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => timeline.updateProject({ width: 1280, height: 720 })}
                          className={`py-1.5 px-2 rounded border text-xs font-bold transition-all ${
                            timeline.project.width === 1280 && timeline.project.height === 720
                              ? "bg-white/10 border-white text-white"
                              : "bg-[#14141e] border-[#2b2b38] text-gray-400 hover:text-white"
                          }`}
                        >
                          16:9
                        </button>
                        <button
                          type="button"
                          onClick={() => timeline.updateProject({ width: 720, height: 1280 })}
                          className={`py-1.5 px-2 rounded border text-xs font-bold transition-all ${
                            timeline.project.width === 720 && timeline.project.height === 1280
                              ? "bg-white/10 border-white text-white"
                              : "bg-[#14141e] border-[#2b2b38] text-gray-400 hover:text-white"
                          }`}
                        >
                          9:16
                        </button>
                        <button
                          type="button"
                          onClick={() => timeline.updateProject({ width: 1080, height: 1080 })}
                          className={`py-1.5 px-2 rounded border text-xs font-bold transition-all ${
                            timeline.project.width === 1080 && timeline.project.height === 1080
                              ? "bg-white/10 border-white text-white"
                              : "bg-[#14141e] border-[#2b2b38] text-gray-400 hover:text-white"
                          }`}
                        >
                          1:1
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#242430] flex flex-col items-center justify-center text-center text-gray-500">
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        Tip: Click any video, image, or text on the canvas to move, rotate, resize, or animate.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom 100% Full-Width Timeline */}
            <div className="h-[240px] lg:h-[260px] flex flex-col shrink-0 bg-[#0d0d12]">
              <EditorTimeline
                project={timeline.project}
                mediaItems={mediaBin.items}
                currentTime={currentTime}
                selectedClipId={timeline.selectedClipId}
                onSelectClip={handleSelectClip}
                onOpenClipProperties={(id) => {
                  handleSelectClip(id);
                }}
                onMoveClipBegin={timeline.beginLiveUpdate}
                onMoveClipLive={(id, newStart) => timeline.updateClipLive(id, { timelineStart: newStart })}
                onMoveClipCommit={timeline.commitLiveUpdate}
                onSeek={seekTo}
                onSplit={(t) => timeline.splitAt(t, timeline.selectedClipId)}
                onDeleteClip={(id) => timeline.deleteClip(id)}
                onEdgeBegin={timeline.beginLiveUpdate}
                onEdgeLive={timeline.updateClipEdgeLive}
                onEdgeCommit={timeline.commitLiveUpdate}
                zoom={zoom}
                setZoom={setZoom}
                thumbnailsBySource={thumbnailsBySource}
                waveformsBySource={waveformsBySource}
                onAddMediaToTrack={(trackId, item) => addItemToTimeline(item, trackId)}
                onAddSubtitleToTrack={(trackId) => addSubtitleClip(undefined, trackId)}
                onAddEffectToTrack={(trackId, effectType) => addEffectToTimeline(effectType, trackId)}
                onUploadAndAddToTrack={handleUploadAndAddToTrack}
                canUndo={timeline.canUndo}
                canRedo={timeline.canRedo}
                onUndo={timeline.undo}
                onRedo={timeline.redo}
              />
            </div>
          </div>
        )}

        {/* ─── MOBILE VIEW: VIDEO PREVIEW (TOP) + QUICK TOOLS (MIDDLE) + TIMELINE (BOTTOM) TOGETHER! ─── */}
        {isMobile && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#09090e]">
            {/* 1. TOP: Video Preview (Always visible while editing!) */}
            <div className="h-[34vh] max-h-[250px] min-h-[170px] bg-black flex flex-col relative shrink-0">
              <div
                className="flex-1 flex items-center justify-center p-1.5 relative overflow-hidden"
                onClick={handleSelectClipAtPlayhead}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (selectedClip && (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text")) {
                    setIsTransformActive((prev) => !prev);
                  }
                }}
              >
                <div
                  className="relative max-w-full max-h-full"
                  style={{ aspectRatio: `${timeline.project.width} / ${timeline.project.height}` }}
                >
                  <PreviewCanvas
                    project={timeline.project}
                    mediaItems={mediaBin.items}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    onSelectClip={(id) => {
                      if (id) {
                        handleSelectClip(id);
                        setIsTransformActive(true);
                      } else {
                        timeline.setSelectedClipId(null);
                        setIsTransformActive(false);
                      }
                    }}
                  />
                  {selectedClip &&
                    (isTransformActive || selectedClip.type === "text") &&
                    (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text") && (
                      <TransformOverlay
                        clip={selectedClip}
                        project={timeline.project}
                        mediaItem={mediaBin.items.find((m) => m.id === selectedClip.sourceId)}
                        onBeginLive={timeline.beginLiveUpdate}
                        onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                        onCommitLive={() => timeline.commitLiveUpdate()}
                        onDeselect={() => {
                          setIsTransformActive(false);
                          timeline.setSelectedClipId(null);
                        }}
                        onDone={() => {
                          setIsTransformActive(false);
                          timeline.setSelectedClipId(null);
                        }}
                        onSeek={seekTo}
                        onPreview={handlePreviewClipRange}
                      />
                    )}
                </div>

                {!isPlaying && allClips.length > 0 && !selectedClip && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity z-20 pointer-events-auto"
                  >
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Playback transport bar directly under video */}
              <div className="h-9 bg-[#0c0c12] border-t border-[#242430] flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                  <span id="editor-playback-time" className="text-white font-bold tabular-nums">
                    {fmtTime(currentTime)}
                  </span>
                  <span className="text-gray-600">/</span>
                  <span className="text-gray-500 tabular-nums">{fmtTime(currentMaxTime)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => seekTo(0)} className="text-gray-400 hover:text-white p-1">
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => seekTo(currentTime - 5)} className="text-gray-400 hover:text-white p-1">
                    <Play className="w-3.5 h-3.5 fill-current rotate-180" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-7 h-7 rounded-full bg-[#ff6b4a] text-white flex items-center justify-center shadow-md active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                  <button onClick={() => seekTo(currentTime + 5)} className="text-gray-400 hover:text-white p-1">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button onClick={() => seekTo(currentMaxTime)} className="text-gray-400 hover:text-white p-1">
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE: Mobile Quick Tools Strip (Scrollable) */}
            <div className="h-11 bg-[#101018] border-y border-[#242430] flex items-center px-2 gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
              <button
                onClick={() => timeline.splitAt(currentTime, timeline.selectedClipId)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ff6b4a] text-white text-xs font-bold shrink-0 shadow-sm active:scale-95"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>

              <button
                onClick={() => setActiveDrawer("subtitles")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-semibold shrink-0 border border-[#2b2b36]"
              >
                <Type className="w-3.5 h-3.5 text-[#ff6b4a]" />
                <span>Subtitle</span>
              </button>

              <button
                onClick={() => setActiveDrawer("stickers")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-semibold shrink-0 border border-[#2b2b36]"
              >
                <Smile className="w-3.5 h-3.5 text-yellow-400" />
                <span>Stickers</span>
              </button>

              <button
                onClick={() => setActiveDrawer("pip")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-semibold shrink-0 border border-[#2b2b36]"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>PIP</span>
              </button>

              <button
                onClick={() => setActiveDrawer("effects")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-semibold shrink-0 border border-[#2b2b36]"
              >
                <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Effects</span>
              </button>

              <button
                onClick={() => setActiveDrawer("filters")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-semibold shrink-0 border border-[#2b2b36]"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Filters</span>
              </button>

              <button
                onClick={() => setActiveDrawer("audio")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-semibold shrink-0 border border-[#2b2b36]"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Audio</span>
              </button>

              <button
                onClick={() => setActiveDrawer("media")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-gray-200 text-xs font-semibold shrink-0 border border-[#2b2b36]"
              >
                <Film className="w-3.5 h-3.5 text-emerald-400" />
                <span>Media</span>
              </button>

              {selectedClip && (
                <button
                  onClick={() => setActiveDrawer("properties")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ff6b4a]/20 text-[#ff6b4a] text-xs font-bold shrink-0 border border-[#ff6b4a]/40"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Clip</span>
                </button>
              )}

              {selectedClip && (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text") && (
                <button
                  onClick={() => setIsTransformActive(!isTransformActive)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 border transition-all ${
                    isTransformActive
                      ? "bg-[#ff6b4a] text-white border-[#ff6b4a] shadow-[0_0_12px_rgba(255,107,74,0.4)]"
                      : "bg-[#181824] hover:bg-[#202030] text-gray-200 border-[#2b2b36]"
                  }`}
                >
                  <Move className="w-3.5 h-3.5 text-[#ff6b4a]" />
                  <span>{isTransformActive ? "Done Transforming" : "Transform Video"}</span>
                </button>
              )}
            </div>

            {/* 3. BOTTOM: Timeline (Always visible!) */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
              <EditorTimeline
                project={timeline.project}
                mediaItems={mediaBin.items}
                currentTime={currentTime}
                selectedClipId={timeline.selectedClipId}
                onSelectClip={handleSelectClip}
                onOpenClipProperties={(id) => {
                  handleSelectClip(id);
                  setActiveDrawer("properties");
                }}
                onMoveClipBegin={timeline.beginLiveUpdate}
                onMoveClipLive={(id, newStart) => timeline.updateClipLive(id, { timelineStart: newStart })}
                onMoveClipCommit={timeline.commitLiveUpdate}
                onSeek={seekTo}
                onSplit={(t) => timeline.splitAt(t, timeline.selectedClipId)}
                onDeleteClip={(id) => timeline.deleteClip(id)}
                onEdgeBegin={timeline.beginLiveUpdate}
                onEdgeLive={timeline.updateClipEdgeLive}
                onEdgeCommit={timeline.commitLiveUpdate}
                zoom={zoom}
                setZoom={setZoom}
                thumbnailsBySource={thumbnailsBySource}
                waveformsBySource={waveformsBySource}
                onAddMediaToTrack={(trackId, item) => addItemToTimeline(item, trackId)}
                onAddSubtitleToTrack={(trackId) => addSubtitleClip(undefined, trackId)}
                onAddEffectToTrack={(trackId, effectType) => addEffectToTimeline(effectType, trackId)}
                onUploadAndAddToTrack={handleUploadAndAddToTrack}
                canUndo={timeline.canUndo}
                canRedo={timeline.canRedo}
                onUndo={timeline.undo}
                onRedo={timeline.redo}
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE SLIDE-UP DRAWER (Bottom Sheet for any active tool)
        ═══════════════════════════════════════════════════════════════════ */}
        {isMobile && activeDrawer && (
          <>
            <div
              className="absolute inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setActiveDrawer(null)}
            />
            <div className="absolute inset-x-0 bottom-0 top-[30vh] z-50 bg-[#12121a]/98 backdrop-blur-md border-t border-[#2b2b36] flex flex-col rounded-t-3xl shadow-2xl animate-fade-in">
              {/* Drag Handle indicator */}
              <div
                className="w-full flex justify-center pt-2 pb-1 cursor-pointer shrink-0"
                onClick={() => setActiveDrawer(null)}
              >
                <div className="w-12 h-1 bg-white/25 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="h-10 border-b border-[#2b2b36] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ff6b4a]" />
                  <span className="text-xs font-bold text-white capitalize">
                    {activeDrawer === "properties" ? `${selectedClip?.type || "Clip"} Properties` : activeDrawer}
                  </span>
                </div>
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Drawer: Subtitles */}
              {activeDrawer === "subtitles" && (
                <div className="space-y-3">
                  {/* 1-Click AI Auto Captions Button */}
                  <button
                    onClick={handleGenerateAutoCaptions}
                    disabled={isAutoCaptioning}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-[#ff6b4a]/20 to-purple-500/20 active:scale-95 border border-[#ff6b4a]/50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                    <span className="truncate">{isAutoCaptioning ? (autoCaptionProgress || "Transcribing...") : "✨ 1-Click AI Auto Captions"}</span>
                  </button>

                  <div className="flex items-center justify-between pb-2 border-b border-[#2b2b36]">
                    <span className="text-xs font-bold text-white">Choose Subtitle Style</span>
                    <button
                      onClick={() => addSubtitleClip()}
                      className="px-2.5 py-1 rounded bg-[#ff6b4a] text-white text-xs font-bold"
                    >
                      + Add at Playhead
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBTITLE_STYLES.map((st) => (
                      <button
                        key={st.name}
                        onClick={() => addSubtitleClip(st)}
                        className="p-2.5 rounded-xl bg-[#181824] border border-[#2b2b36] text-left active:scale-95 transition-all"
                      >
                        <span className="block text-xs font-black truncate" style={{ color: st.color }}>
                          {st.name}
                        </span>
                        <span className="text-[10px] text-gray-400 block truncate">{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Drawer: Stickers & GIFs */}
              {activeDrawer === "stickers" && (
                <div className="space-y-3">
                  <div className="flex bg-[#0a0a0e] p-1 rounded-lg border border-[#2b2b36] gap-1">
                    <button
                      onClick={() => setStickerTab("stickers")}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                        stickerTab === "stickers" ? "bg-[#2b2b36] text-white shadow-sm" : "text-gray-400"
                      }`}
                    >
                      😊 Stickers
                    </button>
                    <button
                      onClick={() => setStickerTab("gifs")}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                        stickerTab === "gifs" ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/40 shadow-sm" : "text-gray-400"
                      }`}
                    >
                      👾 GIFs
                    </button>
                  </div>

                  {stickerTab === "stickers" ? (
                    <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                      {STICKER_LIST.map((stk) => (
                        <button
                          key={stk}
                          onClick={() => addStickerClip(stk)}
                          className="h-11 rounded-xl bg-[#181824] border border-[#2b2b36] flex items-center justify-center text-2xl active:scale-90 transition-transform"
                        >
                          {stk}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto">
                      <label className="flex items-center justify-center gap-2 p-2 rounded-xl border border-dashed border-[#ff6b4a]/60 bg-[#ff6b4a]/10 hover:bg-[#ff6b4a]/20 text-[#ff6b4a] text-xs font-bold cursor-pointer transition-all active:scale-98">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload GIF from Device</span>
                        <input
                          type="file"
                          accept="image/gif,image/webp,image/png,image/jpeg"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const item = await mediaBin.addFile(file);
                              const newClipId = timeline.addOverlayClip(item, currentTime, {
                                x: 50,
                                y: 50,
                                scaleX: 0.5,
                                scaleY: 0.5,
                              });
                              timeline.setSelectedClipId(newClipId);
                              setIsTransformActive(true);
                              showToast(`Added ${file.name} to video!`);
                              setActiveDrawer(null);
                            } catch (err) {
                              console.error(err);
                              showToast("Error adding GIF");
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        {GIF_STICKERS_LIST.map((gif) => (
                          <div
                            key={gif.id}
                            onClick={() => addGifClip(gif)}
                            className="group relative rounded-xl overflow-hidden border border-[#2b2b36] bg-[#0c0c12] aspect-video flex items-center justify-center p-2 text-center active:scale-95 transition-all cursor-pointer"
                          >
                            <img
                              src={gif.url}
                              alt={gif.name}
                              className="max-h-full max-w-full object-contain"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-1 py-0.5 pointer-events-none">
                              <span className="text-[9px] font-semibold text-white truncate block">{gif.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Drawer: PIP (Picture-in-Picture) */}
              {activeDrawer === "pip" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">Select video or photo to overlay as Picture-in-Picture:</p>
                  {mediaBin.items.length === 0 ? (
                    <div className="py-6 text-center text-gray-500 text-xs border border-dashed border-[#2b2b36] rounded-xl">
                      No media available. Upload to Media Bin first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {mediaBin.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addPipClip(item)}
                          className="relative rounded-xl overflow-hidden border border-[#2b2b36] aspect-video bg-black flex items-center justify-center active:scale-95 transition-all"
                        >
                          {item.file.type.startsWith("image/") ? (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <video src={item.url} className="w-full h-full object-cover" muted />
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Drawer: Effects */}
              {activeDrawer === "effects" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">Tap to toggle video & camera effects:</p>
                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {VIDEO_EFFECTS_CATALOG.map((eff) => {
                      const isActive = selectedClip?.effects?.some((e) => e.type === eff.id);
                      return (
                        <button
                          key={eff.id}
                          onClick={() => applyEffect(eff.id)}
                          className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                            isActive
                              ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-[#ff6b4a]"
                              : "bg-[#181824] border-[#2b2b36] text-gray-300 hover:border-gray-500"
                          }`}
                        >
                          <span className="block truncate">{isActive ? "✓ " : ""}{eff.name}</span>
                          <span className="text-[9px] text-gray-500 block truncate font-normal">{eff.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Chroma Key */}
                  <div className="border-t border-[#2b2b36] pt-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Chroma Key (Remove Green / Blue Screen)
                    </span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: "#00ff00", label: "Green" },
                        { color: "#0000ff", label: "Blue" },
                        { color: "#ffffff", label: "White" },
                        { color: "#000000", label: "Black" },
                        { color: "#ff00ff", label: "Magenta" },
                      ].map(({ color, label }) => {
                        const isSelected = selectedClip?.chromaKey?.enabled && selectedClip.chromaKey.color === color;
                        return (
                          <button
                            key={color}
                            title={label}
                            onClick={() => applyChromaKey(color)}
                            className={`w-8 h-8 rounded-xl border-2 transition-all ${
                              isSelected ? "border-[#ff6b4a] scale-110 shadow-md" : "border-[#2b2b36]"
                            }`}
                            style={{ background: color }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Drawer: Filters */}
              {activeDrawer === "filters" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">Select filter preset for current clip:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => applyFilterPreset(p)}
                        className="p-2.5 rounded-xl bg-[#181824] border border-[#2b2b36] text-center active:scale-95 transition-all"
                      >
                        <span className="text-lg block mb-0.5">{p.icon}</span>
                        <span className="text-[10px] font-semibold text-gray-300 truncate block">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Drawer: Audio */}
              {activeDrawer === "audio" && (
                <div className="space-y-3">
                  <button
                    onClick={toggleVoiceRecording}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                      isRecordingVoice
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-[#ff6b4a] hover:bg-[#ff856b] text-white"
                    }`}
                  >
                    {isRecordingVoice ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>Stop Voice Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>🎙️ Record Voiceover</span>
                      </>
                    )}
                  </button>

                  <div className="border-t border-[#2b2b36] pt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Sound Effects Library
                    </span>
                    <div className="space-y-1.5">
                      {SOUND_EFFECTS.map((sfx) => {
                        const Icon = sfx.icon;
                        return (
                          <button
                            key={sfx.id}
                            onClick={() => handleInsertSoundEffect(sfx)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#181824] border border-[#2b2b36] text-left active:scale-[0.98] transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-blue-400" />
                              <div>
                                <span className="text-xs font-semibold text-white block">{sfx.name}</span>
                                <span className="text-[9px] text-gray-400">{sfx.desc}</span>
                              </div>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Drawer: Media Bin */}
              {activeDrawer === "media" && (
                <div className="h-full">
                  <MediaBin
                    items={mediaBin.items}
                    onUpload={handleMediaBinUpload}
                    onAddToTimeline={(item) => {
                      addItemToTimeline(item);
                      setActiveDrawer(null);
                    }}
                    onRemoveItem={(id) => {
                      mediaBin.removeItem(id);
                      showToast("Removed media from bin");
                    }}
                  />
                </div>
              )}

              {/* Drawer: Properties / Edit Clip */}
              {activeDrawer === "properties" && (
                <div>
                  {selectedClip ? (
                    <TransformInspector
                      clip={selectedClip}
                      project={timeline.project}
                      onUpdateProject={(patch) => timeline.updateProject(patch)}
                      onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                      onBeginLive={timeline.beginLiveUpdate}
                      onCommitLive={timeline.commitLiveUpdate}
                      onUpdate={(patch) => {
                        timeline.beginLiveUpdate();
                        timeline.updateClipLive(selectedClip.id, patch);
                        timeline.commitLiveUpdate();
                      }}
                      onActivateTransformOnCanvas={() => {
                        setIsTransformActive(true);
                        setActiveDrawer(null);
                      }}
                      onAddEffectToTimeline={(effectType) => addEffectToTimeline(effectType)}
                      onDeleteClip={(id) => timeline.deleteClip(id)}
                      onSeek={seekTo}
                      onPreview={handlePreviewClipRange}
                      onMuteAll={handleToggleMuteAll}
                    />
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p className="text-xs font-semibold text-gray-400">No clip selected</p>
                      <p className="text-[10px] text-gray-600 mt-1">Tap a clip in the timeline below to edit.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </>
        )}
      </div>

      {/* ─── ASPECT RATIO SELECTION MODAL ─── */}
      {isAspectRatioOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAspectRatioOpen(false)}
        >
          <div
            className="bg-[#14141c] border border-[#2b2b36] rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2b2b36] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📐</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Select Aspect Ratio</h3>
                  <p className="text-[11px] text-gray-400">Choose canvas format for your video</p>
                </div>
              </div>
              <button
                onClick={() => setIsAspectRatioOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ASPECT_RATIOS.map((ar) => {
                const isSelected = timeline.project.width === ar.width && timeline.project.height === ar.height;
                return (
                  <button
                    key={ar.label}
                    onClick={() => {
                      timeline.setDimensions(ar.width, ar.height);
                      showToast(`Canvas changed to ${ar.label} (${ar.width}×${ar.height})`);
                      setIsAspectRatioOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 active:scale-95 ${
                      isSelected
                        ? "bg-[#ff6b4a]/20 border-[#ff6b4a] shadow-[0_0_12px_rgba(255,107,74,0.3)]"
                        : "bg-[#181824] border-[#2b2b36] hover:border-gray-500 hover:bg-[#202030]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{ar.icon}</span>
                      <span className="text-[10px] font-mono text-gray-500">{ar.width}×{ar.height}</span>
                    </div>
                    <span className={`text-sm font-extrabold ${isSelected ? "text-[#ff6b4a]" : "text-white"}`}>
                      {ar.label}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">{ar.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Canvas Background Color Selection */}
            <div className="pt-3 border-t border-[#2b2b36] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Canvas Background</span>
                <span className="text-[10px] text-gray-400">Empty area color around rotated video</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    timeline.setBackgroundColor("#000000");
                    showToast("Canvas background set to Solid Black");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    (timeline.project.backgroundColor || "#000000") === "#000000"
                      ? "bg-black text-white border-[#ff6b4a] shadow-md ring-1 ring-[#ff6b4a]"
                      : "bg-[#181824] text-gray-400 border-[#2b2b36] hover:text-white"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-gray-600" />
                  <span>Black</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    timeline.setBackgroundColor("#ffffff");
                    showToast("Canvas background set to Solid White");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    timeline.project.backgroundColor === "#ffffff"
                      ? "bg-white text-black border-[#ff6b4a] shadow-md ring-1 ring-[#ff6b4a]"
                      : "bg-[#181824] text-gray-400 border-[#2b2b36] hover:text-white"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300" />
                  <span>White</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EXPORT RESULT MODAL ─── */}
      {resultUrl && !isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-[#2b2b36] rounded-2xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Video Export Complete!</h3>
            <p className="text-xs text-gray-400">Your video is ready to download in high quality MP4 format.</p>
            <a
              href={resultUrl}
              download="botock-video.mp4"
              className="block w-full py-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#ff856b] font-bold text-white transition-colors shadow-lg"
            >
              Download MP4
            </a>
            <button
              onClick={() => setResultUrl(null)}
              className="text-xs text-gray-500 hover:text-white underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── EXPORT PROGRESS MODAL ─── */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-[#2b2b36] rounded-2xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 border-4 border-[#ff6b4a] border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-[#ff6b4a]">{exportStage || "Rendering video…"}</h3>
            <p className="text-xs text-gray-400">
              {exportStage?.toLowerCase().includes("local")
                ? "Processing in browser (local fallback engine)"
                : "⚡ Accelerated Cloud Rendering Engine"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsExporting(false);
                setExportStage("");
                showToast("Export cancelled");
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Header Dropdown Wrapper (Desktop) ───
function HeaderDropdown({
  id,
  label,
  icon,
  openTool,
  setOpenTool,
  children,
}: {
  id: ToolDropdown;
  label: string;
  icon: React.ReactNode;
  openTool: ToolDropdown;
  setOpenTool: (id: ToolDropdown) => void;
  children: React.ReactNode;
}) {
  const isOpen = openTool === id;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenTool(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setOpenTool]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpenTool(isOpen ? null : id)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isOpen
            ? "bg-[#ff6b4a] text-white shadow-md"
            : "text-gray-300 hover:text-white hover:bg-white/5"
        }`}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 bg-[#14141c] border border-[#2b2b36] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
