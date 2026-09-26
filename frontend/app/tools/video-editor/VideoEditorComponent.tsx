"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Loader2,
  Music,
  Pause,
  Play,
  Plus,
  Redo2,
  Scissors,
  Trash2,
  Type,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useMediaStore } from "../../store/useMediaStore";
import AdBanner from "../../components/AdBanner";
import ToolSuggestions from "../../components/ToolSuggestions";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { useEditorTimeline } from "@/lib/editor/useEditorTimeline";
import { useThumbnails } from "@/lib/editor/useThumbnails";
import { useAudioTracks } from "@/lib/editor/useAudioTracks";
import { useTextOverlays } from "@/lib/editor/useTextOverlays";
import { useWaveform } from "@/lib/editor/useWaveform";
import { exportEditorTimeline } from "@/lib/editor/exportTimeline";
import { formatBytes } from "@/lib/utils/formatters";
import EditorTimeline from "./components/EditorTimeline";
import EditorInspector from "./components/EditorInspector";
import AudioTrackLane from "./components/AudioTrackLane";
import AudioInspector from "./components/AudioInspector";
import TextOverlayInspector from "./components/TextOverlayInspector";

function fmtTime(t: number) {
  if (!Number.isFinite(t) || t < 0) return "00:00";
  const total = Math.floor(t);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function nextEven(n: number) {
  const r = Math.round(n);
  return r % 2 === 0 ? r : r + 1;
}

type InspectorTab = "clip" | "audio" | "text";

export default function VideoEditorComponent() {
  const { activeMedia } = useMediaStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeClipIdRef = useRef<string | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });
  const [zoom, setZoom] = useState(1);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("clip");

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState("");

  const timeline = useEditorTimeline();
  const thumbs = useThumbnails();
  const audioTracks = useAudioTracks();
  const textOverlays = useTextOverlays();
  const waveform = useWaveform();
  const { load, writeFile, readFile, deleteFile, exec, isProcessing } = useFFmpeg();

  useEffect(() => {
    if (!activeMedia) return;
    const src = activeMedia.blobUrl || activeMedia.url;
    if (!src) return;
    setVideoSrc(src);

    if (activeMedia.blob) {
      setOriginalFile(new File([activeMedia.blob], "generated-video.mp4", { type: activeMedia.blob.type || "video/mp4" }));
    } else {
      fetch(src)
        .then((r) => r.blob())
        .then((blob) => setOriginalFile(new File([blob], "generated-video.mp4", { type: blob.type || "video/mp4" })))
        .catch(() => {});
    }
  }, [activeMedia]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetAll();
    const url = URL.createObjectURL(file);
    setOriginalFile(file);
    setVideoSrc(url);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const d = video.duration;
    if (!Number.isFinite(d) || d <= 0) return;

    setDuration(d);
    setDimensions({ width: nextEven(video.videoWidth || 1280), height: nextEven(video.videoHeight || 720) });
    timeline.initFromDuration(d);
    void thumbs.generate(videoSrc, d);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || timeline.clips.length === 0) return;
    const t = video.currentTime;
    setCurrentTime(t);

    const active = timeline.clips.find((c) => t >= c.start && t < c.end);
    if (!active) {
      const next = timeline.clips.find((c) => c.start > t);
      if (next) {
        video.currentTime = next.start;
      } else if (isPlaying) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = timeline.clips[0]?.start ?? 0;
      }
      return;
    }

    if (active.id !== activeClipIdRef.current) {
      activeClipIdRef.current = active.id;
      video.playbackRate = Math.min(4, Math.max(0.25, active.speed));
      video.muted = active.muted;
      video.volume = active.muted ? 0 : Math.min(1, active.volumePercent / 100);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = useCallback(
    (t: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, Math.min(duration, t));
      setCurrentTime(video.currentTime);
    },
    [duration]
  );

  const handleSelectClip = (id: string) => {
    setInspectorTab("clip");
    timeline.setSelectedClipId(id);
    const clip = timeline.clips.find((c) => c.id === id);
    if (clip) seekTo(clip.start);
  };

  const cutHere = () => timeline.splitAt(currentTime);
  const deleteSelected = () => timeline.selectedClipId && timeline.deleteClip(timeline.selectedClipId);
  const duplicateSelected = () => timeline.selectedClipId && timeline.duplicateClip(timeline.selectedClipId);

  // ── Audio track upload (music/sfx) ──────────────────────────────────
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sourceDuration = await waveform.getMediaDuration(file);
    const peaks = await waveform.decode(file);
    const url = URL.createObjectURL(file);

    audioTracks.addTrack({
      kind: "music",
      label: file.name.replace(/\.[^/.]+$/, ""),
      file,
      sourceUrl: url,
      sourceDuration: sourceDuration || 5,
      timelineStart: currentTime,
      peaks,
    });
    setInspectorTab("audio");
    e.target.value = "";
  };

  // ── Extract audio from the current video into its own track ────────
  // Reuses the same -vn / libmp3lame approach as video-to-mp3.
  const extractAudioToTrack = async () => {
    if (!originalFile || !writeFile || !exec || !readFile || !deleteFile || !load) return;
    setExportStage("Extracting audio track...");
    try {
      await load();
      const inputName = "botock_extract_in.mp4";
      const outputName = "botock_extract_out.mp3";
      await writeFile(inputName, new Uint8Array(await originalFile.arrayBuffer()));
      const exitCode = await exec([
        "-i", inputName, "-vn", "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", outputName,
      ]);
      if (exitCode !== 0) throw new Error("No audio track found in this video.");
      const bytes = await readFile(outputName);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "audio/mpeg" });
      const extractedFile = new File([blob], "extracted-audio.mp3", { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const peaks = await waveform.decode(extractedFile);

      audioTracks.addTrack({
        kind: "music",
        label: "Extracted Audio",
        file: extractedFile,
        sourceUrl: url,
        sourceDuration: duration,
        timelineStart: 0,
        peaks,
      });
      setInspectorTab("audio");

      try { await deleteFile(inputName); } catch {}
      try { await deleteFile(outputName); } catch {}
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Failed to extract audio.");
    } finally {
      setExportStage("");
    }
  };

  const addTextOverlay = () => {
    const start = currentTime;
    const end = Math.min(duration, currentTime + 3);
    textOverlays.addOverlay(start, end);
    setInspectorTab("text");
  };

  const resetAll = () => {
    setOriginalFile(null);
    setVideoSrc("");
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setResultUrl(null);
    setResultSize(null);
    setExportError(null);
    setZoom(1);
    activeClipIdRef.current = null;
    timeline.reset();
    thumbs.clear();
    audioTracks.reset();
    textOverlays.reset();
  };

  const handleExport = async () => {
    if (!originalFile || timeline.clips.length === 0) return;
    if (!writeFile || !exec || !readFile || !deleteFile || !load) {
      setExportError("The FFmpeg engine is not ready yet. Please try again in a moment.");
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const blob = await exportEditorTimeline(
        originalFile,
        timeline.clips,
        { load, writeFile, exec, readFile, deleteFile },
        dimensions,
        (msg) => setExportStage(msg),
        audioTracks.tracks,
        textOverlays.overlays
      );
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Failed to export video.");
    } finally {
      setIsExporting(false);
      setExportStage("");
    }
  };

  const activePreviewClip =
    timeline.clips.find((c) => currentTime >= c.start && currentTime < c.end) || timeline.selectedClip;

  const previewFilterStyle = activePreviewClip
    ? `brightness(${100 + activePreviewClip.filters.brightness * 100}%) contrast(${activePreviewClip.filters.contrast * 100}%) saturate(${activePreviewClip.filters.saturation * 100}%)`
    : undefined;

  const previewTransformStyle = activePreviewClip
    ? `rotate(${activePreviewClip.rotation}deg) scaleX(${activePreviewClip.flipH ? -1 : 1}) scaleY(${activePreviewClip.flipV ? -1 : 1})`
    : undefined;

  const activeOverlay = textOverlays.overlays.find((o) => currentTime >= o.start && currentTime <= o.end);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/tools/video-generator"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mb-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Generator
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Botock Video Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Split, trim, speed, color, rotate, background music and captions — rendered with the same FFmpeg engine as our individual tools.
          </p>
        </div>

        {videoSrc && (
          <button
            onClick={handleExport}
            disabled={isExporting || isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all self-start disabled:opacity-50"
          >
            {isExporting || isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {exportStage || "Rendering..."}
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
            <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview */}
            <div className="lg:col-span-2 glass-card rounded-2xl border border-border/50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl w-full max-w-2xl aspect-video">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ filter: previewFilterStyle, transform: previewTransformStyle }}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                  playsInline
                />
                {activeOverlay && (
                  <div
                    className={`absolute inset-x-0 flex justify-center px-4 pointer-events-none ${
                      activeOverlay.anchor === "top" ? "top-4" : activeOverlay.anchor === "bottom" ? "bottom-4" : "top-1/2 -translate-y-1/2"
                    }`}
                  >
                    <span
                      className="px-3 py-1 rounded-lg font-bold text-center"
                      style={{
                        color: activeOverlay.color,
                        backgroundColor: `rgba(0,0,0,${activeOverlay.backgroundOpacity})`,
                        fontSize: `${activeOverlay.fontSizePercent * 3}px`,
                      }}
                    >
                      {activeOverlay.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full max-w-2xl mt-4 flex items-center justify-between gap-3 text-xs">
                <button onClick={togglePlay} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-10 text-right">{fmtTime(currentTime)}</span>
                  <input
                    type="range" min={0} max={duration || 10} step={0.05} value={currentTime}
                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-muted-foreground w-10">{fmtTime(duration)}</span>
                </div>
              </div>

              <div className="w-full max-w-2xl mt-4 flex flex-wrap items-center gap-2">
                <button onClick={timeline.undo} disabled={!timeline.canUndo} className="p-2 rounded-lg border border-border/50 text-foreground/70 disabled:opacity-30" title="Undo">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={timeline.redo} disabled={!timeline.canRedo} className="p-2 rounded-lg border border-border/50 text-foreground/70 disabled:opacity-30" title="Redo">
                  <Redo2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border/50 mx-1" />
                <button onClick={cutHere} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400">
                  <Scissors className="w-3.5 h-3.5" /> Cut Here
                </button>
                <button onClick={duplicateSelected} disabled={!timeline.selectedClipId} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] text-xs font-bold disabled:opacity-40">
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button onClick={deleteSelected} disabled={!timeline.selectedClipId || timeline.clips.length <= 1} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold disabled:opacity-40">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Clip
                </button>
                <div className="w-px h-6 bg-border/50 mx-1" />
                <button onClick={() => musicInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/10 text-violet-500 text-xs font-bold hover:bg-violet-500/20">
                  <Music className="w-3.5 h-3.5" /> Add Music
                </button>
                <input ref={musicInputRef} type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" />
                <button onClick={extractAudioToTrack} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/10 text-sky-500 text-xs font-bold hover:bg-sky-500/20">
                  <Music className="w-3.5 h-3.5" /> Extract Audio
                </button>
                <button onClick={addTextOverlay} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold hover:bg-amber-500/20">
                  <Type className="w-3.5 h-3.5" /> Add Text
                </button>

                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="p-1.5 rounded-md text-slate-400 hover:bg-white/[0.06]">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-500 w-8 text-center">{zoom.toFixed(1)}x</span>
                  <button onClick={() => setZoom((z) => Math.min(4, z + 0.5))} className="p-1.5 rounded-md text-slate-400 hover:bg-white/[0.06]">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Inspector with tabs */}
            <div className="glass-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center gap-1 border-b border-border/40 pb-3 mb-4">
                {([
                  { id: "clip", label: "Clip" },
                  { id: "audio", label: "Audio" },
                  { id: "text", label: "Text" },
                ] as { id: InspectorTab; label: string }[]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setInspectorTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inspectorTab === tab.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/[0.06]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {inspectorTab === "clip" && (
                <EditorInspector
                  clip={timeline.selectedClip}
                  onChange={(patch) => {
                    if (timeline.selectedClipId) timeline.updateClip(timeline.selectedClipId, patch);
                  }}
                />
              )}

              {inspectorTab === "audio" && (
                <AudioInspector
                  track={audioTracks.selectedTrack}
                  onChange={(patch) => {
                    if (audioTracks.selectedTrackId) audioTracks.updateTrack(audioTracks.selectedTrackId, patch);
                  }}
                />
              )}

              {inspectorTab === "text" && (
                <div className="space-y-3">
                  <button
                    onClick={addTextOverlay}
                    className="w-full py-2 rounded-lg bg-amber-500/10 text-amber-600 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Text at Playhead
                  </button>
                  <TextOverlayInspector
                    overlay={textOverlays.selectedOverlay}
                    duration={duration}
                    onChange={(patch) => {
                      if (textOverlays.selectedOverlayId) textOverlays.updateOverlay(textOverlays.selectedOverlayId, patch);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Video timeline */}
          <div className="glass-card rounded-2xl border border-border/50 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{timeline.clips.length} clip{timeline.clips.length === 1 ? "" : "s"} on the timeline</span>
              <span>Click timeline to move playhead • Drag green edges to trim</span>
            </div>
            <EditorTimeline
              duration={duration}
              clips={timeline.clips}
              selectedClipId={timeline.selectedClipId}
              currentTime={currentTime}
              thumbnails={thumbs.thumbnails}
              isGeneratingThumbnails={thumbs.isGenerating}
              zoom={zoom}
              onSeek={seekTo}
              onSelectClip={handleSelectClip}
              onEdgeLive={(id, side, t) => timeline.updateClipEdgeLive(id, side, t, duration)}
              onEdgeBegin={timeline.beginEdgeDrag}
              onEdgeCommit={timeline.commitEdgeDrag}
            />
          </div>

          {/* Audio tracks lane */}
          {audioTracks.tracks.length > 0 && (
            <div className="glass-card rounded-2xl border border-border/50 p-4">
              <div className="mb-2 text-xs text-muted-foreground">Music / Audio Tracks — drag to reposition</div>
              <div className="relative h-14 rounded-lg bg-slate-950 overflow-hidden" style={{ minWidth: "720px" }}>
                {audioTracks.tracks.map((track) => (
                  <AudioTrackLane
                    key={track.id}
                    track={track}
                    duration={duration}
                    selected={track.id === audioTracks.selectedTrackId}
                    onSelect={() => {
                      audioTracks.setSelectedTrackId(track.id);
                      setInspectorTab("audio");
                    }}
                    onMove={(newStart) => audioTracks.updateTrack(track.id, { timelineStart: newStart })}
                    onDelete={() => audioTracks.deleteTrack(track.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text overlays lane */}
          {textOverlays.overlays.length > 0 && (
            <div className="glass-card rounded-2xl border border-border/50 p-4">
              <div className="mb-2 text-xs text-muted-foreground">Text Overlays</div>
              <div className="relative h-10 rounded-lg bg-slate-950 overflow-hidden" style={{ minWidth: "720px" }}>
                {textOverlays.overlays.map((overlay) => {
                  const left = (overlay.start / duration) * 100;
                  const width = ((overlay.end - overlay.start) / duration) * 100;
                  const selected = overlay.id === textOverlays.selectedOverlayId;
                  return (
                    <button
                      key={overlay.id}
                      onClick={() => {
                        textOverlays.setSelectedOverlayId(overlay.id);
                        setInspectorTab("text");
                      }}
                      className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-bold truncate transition-all ${
                        selected ? "bg-amber-500 text-white" : "bg-amber-500/20 text-amber-300"
                      }`}
                      style={{ left: `${left}%`, width: `${Math.max(3, width)}%` }}
                    >
                      {overlay.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {exportError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div><span className="font-bold">Error:</span> {exportError}</div>
            </div>
          )}

          {resultUrl && (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Timeline rendered successfully
                </div>
                {resultSize !== null && <span className="text-xs font-mono text-slate-500">{formatBytes(resultSize)}</span>}
              </div>
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video">
                <video src={resultUrl} controls className="w-full h-full object-contain" />
              </div>
              <div className="flex justify-center">
                
                  href={resultUrl}
                  download="botock-edited-video.mp4"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:opacity-90"
                
                  <Download className="w-4 h-4" /> Download Video
               
              </div>
            </div>
          )}
        </div>
      )}

      <ToolSuggestions type="video" />
      <AdBanner slotId="studio-bottom-ad" format="horizontal" />
    </div>
  );
}