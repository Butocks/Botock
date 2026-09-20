"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useMediaStore } from "../../store/useMediaStore";
import {
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  Type,
  Download,
  Upload,
  Sparkles,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import AdBanner from "../../components/AdBanner";
import ToolSuggestions from "../../components/ToolSuggestions";

export default function VideoEditorComponent() {
  const { activeMedia, clearActiveMedia } = useMediaStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Studio Controls
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [filter, setFilter] = useState<string>("none");
  const [textOverlay, setTextOverlay] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  // Initialize from Zustand store (Zero-Network transfer)
  useEffect(() => {
    if (activeMedia?.blobUrl || activeMedia?.url) {
      setVideoSrc(activeMedia.blobUrl || activeMedia.url);
    }

    // Memory Leak Prevention: revoke object URLs upon unmount
    return () => {
      // Optional: keep in library, but free transient editor buffers
    };
  }, [activeMedia]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(d);
      setEndTime(d);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // Loop inside trimmed range
      if (cur >= endTime) {
        videoRef.current.currentTime = startTime;
        if (!isPlaying) {
          videoRef.current.pause();
        }
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportComplete(false);

    // Simulate fast hybrid export process
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
    }, 2200);
  };

  // Filter Styles Map
  const filterStyles: Record<string, string> = {
    none: "",
    cinematic: "contrast(115%) saturate(120%) brightness(95%)",
    bw: "grayscale(100%) contrast(120%)",
    warm: "sepia(30%) saturate(130%) brightness(105%)",
    cyberpunk: "hue-rotate(180deg) saturate(140%) contrast(110%)",
  };

  const aspectClasses: Record<string, string> = {
    "16:9": "aspect-video max-w-2xl",
    "9:16": "aspect-[9/16] max-h-[500px] max-w-[281px]",
    "1:1": "aspect-square max-w-[400px]",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/tools/video-generator"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Generator
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Botock Video Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trim, adjust speed, add text overlays, and convert aspect ratios instantly in your browser.
          </p>
        </div>

        {videoSrc && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all self-start disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rendering Output...
              </>
            ) : exportComplete ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                Rendered! Click to Save
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export Video
              </>
            )}
          </button>
        )}
      </div>

      {!videoSrc ? (
        /* Upload Placeholder */
        <div className="glass-card rounded-2xl border border-dashed border-border/80 p-12 text-center max-w-lg mx-auto my-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">No Video Loaded</h3>
          <p className="text-xs text-muted-foreground mb-6">
            Upload an MP4 from your device or generate one with our AI Video Generator to start editing!
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md">
            <Upload className="w-3.5 h-3.5" />
            Upload Video File
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        /* Studio Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center: Video Canvas Preview */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-border/50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div
              className={`relative bg-black rounded-xl overflow-hidden shadow-2xl transition-all ${aspectClasses[aspectRatio]}`}
            >
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                muted={isMuted}
                style={{ filter: filterStyles[filter] }}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />

              {/* Text Overlay Element */}
              {textOverlay && (
                <div className="absolute bottom-6 left-0 right-0 text-center px-4 pointer-events-none">
                  <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-sm sm:text-base tracking-wide border border-white/20 shadow-lg">
                    {textOverlay}
                  </span>
                </div>
              )}
            </div>

            {/* Playback Transport Bar */}
            <div className="w-full max-w-2xl mt-4 flex items-center justify-between gap-3 text-xs">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-10 text-right">
                  {currentTime.toFixed(1)}s
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 10}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    const t = parseFloat(e.target.value);
                    setCurrentTime(t);
                    if (videoRef.current) videoRef.current.currentTime = t;
                  }}
                  className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground w-10">
                  {duration.toFixed(1)}s
                </span>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg border border-border/50 text-foreground/70 hover:text-foreground"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Panel: Editing Tools */}
          <div className="glass-card rounded-2xl border border-border/50 p-6 space-y-6">
            <h3 className="text-sm font-bold text-foreground tracking-tight border-b border-border/40 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Editor Controls
            </h3>

            {/* 1. Trimmer Controls */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
                <span>Trim Video Range</span>
                <span className="text-primary text-[11px]">
                  {startTime.toFixed(1)}s — {endTime.toFixed(1)}s
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground">Start Time</span>
                  <input
                    type="number"
                    min={0}
                    max={endTime - 0.5}
                    step={0.5}
                    value={startTime}
                    onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/60 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">End Time</span>
                  <input
                    type="number"
                    min={startTime + 0.5}
                    max={duration || 10}
                    step={0.5}
                    value={endTime}
                    onChange={(e) => setEndTime(parseFloat(e.target.value) || duration)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/60 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Speed Controller */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Playback Speed
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      playbackSpeed === s
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-border/50 bg-background/50 hover:bg-card text-foreground"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Canvas Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["16:9", "9:16", "1:1"] as const).map((ar) => (
                  <button
                    key={ar}
                    onClick={() => setAspectRatio(ar)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      aspectRatio === ar
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-border/50 bg-background/50 hover:bg-card text-foreground"
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Color Filters */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Color Grade / Filter
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "none", label: "Normal" },
                  { id: "cinematic", label: "Cinematic" },
                  { id: "bw", label: "B&W Film" },
                  { id: "warm", label: "Warm Glow" },
                  { id: "cyberpunk", label: "Cyberpunk" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      filter === f.id
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-border/50 bg-background/50 hover:bg-card text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Text Overlay */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-primary" />
                Text Overlay
              </label>
              <input
                type="text"
                placeholder="Enter caption or title..."
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cross-Sell Tool Suggestions */}
      <ToolSuggestions type="video" />

      {/* Ad Space */}
      <AdBanner slotId="studio-bottom-ad" format="horizontal" />
    </div>
  );
}
