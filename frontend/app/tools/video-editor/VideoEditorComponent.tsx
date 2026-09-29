"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  ImageIcon,
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
import { useImageOverlays } from "@/lib/editor/useImageOverlays";
import { useWaveform } from "@/lib/editor/useWaveform";
import { useMediaBin } from "@/lib/editor/useMediaBin";
import { exportEditorTimeline } from "@/lib/editor/exportTimeline";
import { formatBytes } from "@/lib/utils/formatters";
import { getTimelinePositions, getTotalTimelineDuration, MediaBinItem } from "@/lib/editor/types";
import EditorTimeline from "./components/EditorTimeline";
import EditorInspector from "./components/EditorInspector";
import AudioTrackLane from "./components/AudioTrackLane";
import AudioInspector from "./components/AudioInspector";
import TextOverlayInspector from "./components/TextOverlayInspector";
import ImageOverlayInspector from "./components/ImageOverlayInspector";
import MediaBin from "./components/MediaBin";
import CropOverlay from "./components/CropOverlay";

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

type InspectorTab = "clip" | "audio" | "text" | "image";

export default function VideoEditorComponent() {
  const { activeMedia } = useMediaStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const loadedSourceIdRef = useRef<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });
  const [zoom, setZoom] = useState(1);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("clip");
  const [thumbnailsBySource, setThumbnailsBySource] = useState<Record<string, string[]>>({});
  const [isCropping, setIsCropping] = useState(false);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState("");

  const mediaBin = useMediaBin();
  const timeline = useEditorTimeline();
  const thumbs = useThumbnails();
  const audioTracks = useAudioTracks();
  const textOverlays = useTextOverlays();
  const imageOverlays = useImageOverlays();
  const waveform = useWaveform();
  const { load, writeFile, readFile, deleteFile, exec, isProcessing } = useFFmpeg();

  const positions = getTimelinePositions(timeline.clips);
  const totalDuration = getTotalTimelineDuration(timeline.clips);
  const hasVideo = timeline.clips.length > 0;

  useEffect(() => {
    if (!activeMedia) return;
    const src = activeMedia.blobUrl || activeMedia.url;
    if (!src) return;

    const importGenerated = async () => {
      const blob = activeMedia.blob || (await (await fetch(src)).blob());
      const file = new File([blob], "generated-video.mp4", { type: blob.type || "video/mp4" });
      const item = await mediaBin.addFile(file);
      setDimensions({ width: nextEven(item.width), height: nextEven(item.height) });
      timeline.initFromSource(item.id, item.duration);
      const generated = await thumbs.generate(item.url, item.duration, 8);
      setThumbnailsBySource((prev) => ({ ...prev, [item.id]: generated }));
    };
    void importGenerated();
  }, [activeMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetAll();
    const item = await mediaBin.addFile(file);
    setDimensions({ width: nextEven(item.width), height: nextEven(item.height) });
    timeline.initFromSource(item.id, item.duration);
    const generated = await thumbs.generate(item.url, item.duration, 8);
    setThumbnailsBySource({ [item.id]: generated });
    e.target.value = "";
  };

  const handleMediaBinUpload = async (file: File) => {
    const item = await mediaBin.addFile(file);
    const generated = await thumbs.generate(item.url, item.duration, 8);
    setThumbnailsBySource((prev) => ({ ...prev, [item.id]: generated }));
  };

  const handleAddToTimeline = (item: MediaBinItem) => {
    if (timeline.clips.length === 0) {
      setDimensions({ width: nextEven(item.width), height: nextEven(item.height) });
      timeline.initFromSource(item.id, item.duration);
    } else {
      timeline.appendClipFromSource(item.id, 0, item.duration);
    }
  };

  const activePosition = positions.find((p) => currentTime >= p.timelineStart && currentTime < p.timelineEnd) || positions[positions.length - 1];
  const activeItem = activePosition ? mediaBin.getItem(activePosition.clip.sourceId) : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeItem || !activePosition) return;

    if (loadedSourceIdRef.current !== activeItem.id) {
      loadedSourceIdRef.current = activeItem.id;
      video.src = activeItem.url;
    }

    const localTime = activePosition.clip.sourceStart + (currentTime - activePosition.timelineStart) * activePosition.clip.speed;
    if (Math.abs(video.currentTime - localTime) > 0.15) {
      video.currentTime = localTime;
    }
    video.playbackRate = Math.min(4, Math.max(0.25, activePosition.clip.speed));
    video.muted = activePosition.clip.muted;
    video.volume = activePosition.clip.muted ? 0 : Math.min(1, activePosition.clip.volumePercent / 100);
  }, [activeItem?.id, activePosition?.clip.id]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    let lastTs = performance.now();
    const tick = (ts: number) => {
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      setCurrentTime((prev) => {
        const pos = positions.find((p) => prev >= p.timelineStart && prev < p.timelineEnd) || positions[positions.length - 1];
        const speed = pos ? Math.min(4, Math.max(0.25, pos.clip.speed)) : 1;
        const next = prev + dt * speed;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, totalDuration]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const seekTo = useCallback((t: number) => setCurrentTime(Math.max(0, Math.min(totalDuration, t))), [totalDuration]);

  const handleSelectClip = (id: string) => {
    setInspectorTab("clip");
    setIsCropping(false);
    timeline.setSelectedClipId(id);
    const pos = positions.find((p) => p.clip.id === id);
    if (pos) seekTo(pos.timelineStart);
  };

  const cutHere = () => timeline.splitAt(currentTime);
  const deleteSelected = () => timeline.selectedClipId && timeline.deleteClip(timeline.selectedClipId);
  const duplicateSelected = () => timeline.selectedClipId && timeline.duplicateClip(timeline.selectedClipId);

  const toggleCropMode = () => {
    if (!timeline.selectedClip) return;
    if (!timeline.selectedClip.crop && !isCropping) {
      timeline.updateClip(timeline.selectedClip.id, {
        crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      });
    }
    setIsCropping((v) => !v);
  };

  // ✅ Non-blocking audio upload: track appears instantly, waveform decodes in background
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sourceDuration = await waveform.getMediaDuration(file);
    const url = URL.createObjectURL(file);

    const trackId = audioTracks.addTrack({
      kind: "music",
      label: file.name.replace(/\.[^/.]+$/, ""),
      file,
      sourceUrl: url,
      sourceDuration: sourceDuration || 5,
      timelineStart: currentTime,
      peaks: [],
    });
    setInspectorTab("audio");
    e.target.value = "";

    waveform.decode(file).then((peaks) => {
      if (peaks.length > 0) {
        audioTracks.updateTrack(trackId, { peaks });
      }
    }).catch(() => {});
  };

  const extractAudioToTrack = async () => {
    if (!activeItem || !writeFile || !exec || !readFile || !deleteFile || !load) return;
    setExportStage("Extracting audio track...");
    try {
      await load();
      const inputName = "botock_extract_in.mp4";
      const outputName = "botock_extract_out.mp3";
      await writeFile(inputName, new Uint8Array(await activeItem.file.arrayBuffer()));
      const exitCode = await exec(["-i", inputName, "-vn", "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", outputName]);
      if (exitCode !== 0) throw new Error("No audio track found in this video.");
      const bytes = await readFile(outputName);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "audio/mpeg" });
      const extractedFile = new File([blob], "extracted-audio.mp3", { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const peaks = await waveform.decode(extractedFile);
      audioTracks.addTrack({ kind: "music", label: "Extracted Audio", file: extractedFile, sourceUrl: url, sourceDuration: activeItem.duration, timelineStart: 0, peaks });
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
    textOverlays.addOverlay(currentTime, Math.min(totalDuration, currentTime + 3));
    setInspectorTab("text");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    imageOverlays.addOverlay(file, currentTime, Math.min(totalDuration, currentTime + 3));
    setInspectorTab("image");
    e.target.value = "";
  };

  const resetAll = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setResultUrl(null);
    setResultSize(null);
    setExportError(null);
    setZoom(1);
    setIsCropping(false);
    loadedSourceIdRef.current = null;
    timeline.reset();
    thumbs.clear();
    audioTracks.reset();
    textOverlays.reset();
    imageOverlays.reset();
    mediaBin.reset();
    setThumbnailsBySource({});
  };

  const handleExport = async () => {
    if (timeline.clips.length === 0) return;
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
        timeline.clips,
        mediaBin.items,
        { load, writeFile, exec, readFile, deleteFile },
        dimensions,
        (msg) => setExportStage(msg),
        audioTracks.tracks,
        textOverlays.overlays,
        imageOverlays.overlays
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

  const activePreviewClip = activePosition?.clip || timeline.selectedClip;
  const previewFilterStyle = activePreviewClip
    ? `brightness(${100 + activePreviewClip.filters.brightness * 100}%) contrast(${activePreviewClip.filters.contrast * 100}%) saturate(${activePreviewClip.filters.saturation * 100}%)`
    : undefined;
  const previewTransformStyle = activePreviewClip
    ? `rotate(${activePreviewClip.rotation}deg) scaleX(${activePreviewClip.flipH ? -1 : 1}) scaleY(${activePreviewClip.flipV ? -1 : 1})`
    : undefined;

  const activeTextOverlay = textOverlays.overlays.find((o) => currentTime >= o.start && currentTime <= o.end);
  const activeImageOverlay = imageOverlays.overlays.find((o) => currentTime >= o.start && currentTime <= o.end);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link href="/tools/video-generator" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mb-1">
            <ArrowLeft className="w-3 h-3" /> Back to Generator
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Botock Video Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full editing suite — crop, pan/zoom, transitions, stickers, music and captions.
          </p>
        </div>

        {hasVideo && (
          <button
            onClick={handleExport}
            disabled={isExporting || isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all self-start disabled:opacity-50 cursor-pointer"
          >
            {isExporting || isProcessing ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />{exportStage || "Rendering..."}</>
            ) : (
              <><Download className="w-3.5 h-3.5" />Export Video</>
            )}
          </button>
        )}
      </div>

      {!hasVideo ? (
        <div className="glass-card rounded-2xl border border-dashed border-border/80 p-12 text-center max-w-lg mx-auto my-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">No Video Loaded</h3>
          <p className="text-xs text-muted-foreground mb-6">Upload an MP4 or generate one with our AI Video Generator to start editing!</p>
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
                <video controlsList="nodownload" onContextMenu={(e) => e.preventDefault()}
                  ref={videoRef}
                  style={{ filter: previewFilterStyle, transform: previewTransformStyle }}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => !isCropping && togglePlay()}
                  playsInline
                />

                {isCropping && timeline.selectedClip?.crop && (
                  <CropOverlay
                    rect={timeline.selectedClip.crop}
                    onChange={(rect) => timeline.updateClip(timeline.selectedClip!.id, { crop: rect })}
                  />
                )}

                {!isCropping && activeTextOverlay && (
                  <div className={`absolute inset-x-0 flex justify-center px-4 pointer-events-none ${activeTextOverlay.anchor === "top" ? "top-4" : activeTextOverlay.anchor === "bottom" ? "bottom-4" : "top-1/2 -translate-y-1/2"}`}>
                    <span className="px-3 py-1 rounded-lg font-bold text-center" style={{ color: activeTextOverlay.color, backgroundColor: `rgba(0,0,0,${activeTextOverlay.backgroundOpacity})`, fontSize: `${activeTextOverlay.fontSizePercent * 3}px` }}>
                      {activeTextOverlay.text}
                    </span>
                  </div>
                )}

                {!isCropping && activeImageOverlay && (
                  <img
                    src={activeImageOverlay.url}
                    alt=""
                    className="absolute pointer-events-none"
                    style={{
                      left: `${activeImageOverlay.xPercent}%`,
                      top: `${activeImageOverlay.yPercent}%`,
                      width: `${activeImageOverlay.widthPercent}%`,
                      opacity: activeImageOverlay.opacity,
                    }}
                  />
                )}
              </div>

              <div className="w-full max-w-2xl mt-4 flex items-center justify-between gap-3 text-xs">
                <button onClick={togglePlay} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-10 text-right">{fmtTime(currentTime)}</span>
                  <input type="range" min={0} max={totalDuration || 10} step={0.05} value={currentTime} onChange={(e) => seekTo(parseFloat(e.target.value))} className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer" />
                  <span className="text-[11px] text-muted-foreground w-10">{fmtTime(totalDuration)}</span>
                </div>
              </div>

              <div className="w-full max-w-2xl mt-4 flex flex-wrap items-center gap-2">
                <button onClick={timeline.undo} disabled={!timeline.canUndo} className="p-2 rounded-lg border border-border/50 text-foreground/70 disabled:opacity-30 cursor-pointer" title="Undo"><Undo2 className="w-4 h-4" /></button>
                <button onClick={timeline.redo} disabled={!timeline.canRedo} className="p-2 rounded-lg border border-border/50 text-foreground/70 disabled:opacity-30 cursor-pointer" title="Redo"><Redo2 className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-border/50 mx-1" />
                <button onClick={cutHere} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 cursor-pointer"><Scissors className="w-3.5 h-3.5" /> Cut Here</button>
                <button onClick={duplicateSelected} disabled={!timeline.selectedClipId} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] text-xs font-bold disabled:opacity-40 cursor-pointer"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
                <button onClick={deleteSelected} disabled={!timeline.selectedClipId || timeline.clips.length <= 1} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold disabled:opacity-40 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete Clip</button>
                <div className="w-px h-6 bg-border/50 mx-1" />
                <button onClick={() => musicInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/10 text-violet-500 text-xs font-bold hover:bg-violet-500/20 cursor-pointer"><Music className="w-3.5 h-3.5" /> Add Music</button>
                <input ref={musicInputRef} type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" />
                <button onClick={extractAudioToTrack} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/10 text-sky-500 text-xs font-bold hover:bg-sky-500/20 cursor-pointer"><Music className="w-3.5 h-3.5" /> Extract Audio</button>
                <button onClick={addTextOverlay} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold hover:bg-amber-500/20 cursor-pointer"><Type className="w-3.5 h-3.5" /> Add Text</button>
                <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-600 text-xs font-bold hover:bg-fuchsia-500/20 cursor-pointer"><ImageIcon className="w-3.5 h-3.5" /> Add Image</button>
                <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="hidden" />

                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="p-1.5 rounded-md text-slate-400 hover:bg-white/[0.06] cursor-pointer"><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="text-[10px] text-slate-500 w-8 text-center">{zoom.toFixed(1)}x</span>
                  <button onClick={() => setZoom((z) => Math.min(4, z + 0.5))} className="p-1.5 rounded-md text-slate-400 hover:bg-white/[0.06] cursor-pointer"><ZoomIn className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>

            {/* Inspector */}
            <div className="glass-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center gap-1 border-b border-border/40 pb-3 mb-4 flex-wrap">
                {([{ id: "clip", label: "Clip" }, { id: "audio", label: "Audio" }, { id: "text", label: "Text" }, { id: "image", label: "Image" }] as { id: InspectorTab; label: string }[]).map((tab) => (
                  <button key={tab.id} onClick={() => { setInspectorTab(tab.id); setIsCropping(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${inspectorTab === tab.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/[0.06]"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {inspectorTab === "clip" && (
                <EditorInspector
                  clip={timeline.selectedClip}
                  isCropping={isCropping}
                  onToggleCropMode={toggleCropMode}
                  onChange={(patch) => timeline.selectedClipId && timeline.updateClip(timeline.selectedClipId, patch)}
                />
              )}
              {inspectorTab === "audio" && (
                <AudioInspector track={audioTracks.selectedTrack} onChange={(patch) => audioTracks.selectedTrackId && audioTracks.updateTrack(audioTracks.selectedTrackId, patch)} />
              )}
              {inspectorTab === "text" && (
                <div className="space-y-3">
                  <button onClick={addTextOverlay} className="w-full py-2 rounded-lg bg-amber-500/10 text-amber-600 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-amber-500/20 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Text at Playhead</button>
                  <TextOverlayInspector overlay={textOverlays.selectedOverlay} duration={totalDuration} onChange={(patch) => textOverlays.selectedOverlayId && textOverlays.updateOverlay(textOverlays.selectedOverlayId, patch)} />
                </div>
              )}
              {inspectorTab === "image" && (
                <div className="space-y-3">
                  <button onClick={() => imageInputRef.current?.click()} className="w-full py-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-600 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-fuchsia-500/20 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Image at Playhead</button>
                  <ImageOverlayInspector overlay={imageOverlays.selectedOverlay} duration={totalDuration} onChange={(patch) => imageOverlays.selectedOverlayId && imageOverlays.updateOverlay(imageOverlays.selectedOverlayId, patch)} />
                </div>
              )}
            </div>
          </div>

          <MediaBin items={mediaBin.items} onUpload={handleMediaBinUpload} onAddToTimeline={handleAddToTimeline} />

          <div className="glass-card rounded-2xl border border-border/50 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{timeline.clips.length} clip{timeline.clips.length === 1 ? "" : "s"} • click ⇄ between clips for transitions</span>
            </div>
            <EditorTimeline
              clips={timeline.clips}
              mediaItems={mediaBin.items}
              selectedClipId={timeline.selectedClipId}
              currentTime={currentTime}
              thumbnailsBySource={thumbnailsBySource}
              zoom={zoom}
              onSeek={seekTo}
              onSelectClip={handleSelectClip}
              onEdgeLive={(id, side, localTime) => timeline.updateClipEdgeLive(id, side, localTime, mediaBin.getItem(timeline.clips.find((c) => c.id === id)?.sourceId || "")?.duration || 0)}
              onEdgeBegin={timeline.beginEdgeDrag}
              onEdgeCommit={timeline.commitEdgeDrag}
              onTransitionChange={(clipId, type, dur) => timeline.updateClip(clipId, { transitionOut: type, transitionDuration: dur })}
            />
          </div>

          {audioTracks.tracks.length > 0 && (
            <div className="glass-card rounded-2xl border border-border/50 p-4">
              <div className="mb-2 text-xs text-muted-foreground">Music / Audio Tracks — drag to reposition</div>
              <div className="relative h-14 rounded-lg bg-slate-950 overflow-hidden" style={{ minWidth: "720px" }}>
                {audioTracks.tracks.map((track) => (
                  <AudioTrackLane key={track.id} track={track} duration={totalDuration} selected={track.id === audioTracks.selectedTrackId} onSelect={() => { audioTracks.setSelectedTrackId(track.id); setInspectorTab("audio"); }} onMove={(newStart) => audioTracks.updateTrack(track.id, { timelineStart: newStart })} onDelete={() => audioTracks.deleteTrack(track.id)} />
                ))}
              </div>
            </div>
          )}

          {textOverlays.overlays.length > 0 && (
            <div className="glass-card rounded-2xl border border-border/50 p-4">
              <div className="mb-2 text-xs text-muted-foreground">Text Overlays</div>
              <div className="relative h-10 rounded-lg bg-slate-950 overflow-hidden" style={{ minWidth: "720px" }}>
                {textOverlays.overlays.map((overlay) => {
                  const left = (overlay.start / totalDuration) * 100;
                  const width = ((overlay.end - overlay.start) / totalDuration) * 100;
                  const selected = overlay.id === textOverlays.selectedOverlayId;
                  return (
                    <button key={overlay.id} onClick={() => { textOverlays.setSelectedOverlayId(overlay.id); setInspectorTab("text"); }} className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-bold truncate transition-all cursor-pointer ${selected ? "bg-amber-500 text-white" : "bg-amber-500/20 text-amber-300"}`} style={{ left: `${left}%`, width: `${Math.max(3, width)}%` }}>
                      {overlay.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {imageOverlays.overlays.length > 0 && (
            <div className="glass-card rounded-2xl border border-border/50 p-4">
              <div className="mb-2 text-xs text-muted-foreground">Image Overlays</div>
              <div className="relative h-10 rounded-lg bg-slate-950 overflow-hidden" style={{ minWidth: "720px" }}>
                {imageOverlays.overlays.map((overlay) => {
                  const left = (overlay.start / totalDuration) * 100;
                  const width = ((overlay.end - overlay.start) / totalDuration) * 100;
                  const selected = overlay.id === imageOverlays.selectedOverlayId;
                  return (
                    <button key={overlay.id} onClick={() => { imageOverlays.setSelectedOverlayId(overlay.id); setInspectorTab("image"); }} className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center gap-1.5 text-[10px] font-bold truncate transition-all cursor-pointer ${selected ? "bg-fuchsia-500 text-white" : "bg-fuchsia-500/20 text-fuchsia-300"}`} style={{ left: `${left}%`, width: `${Math.max(4, width)}%` }}>
                      <img src={overlay.url} alt="" className="w-3.5 h-3.5 object-cover rounded-sm shrink-0" /> Image
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
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm"><CheckCircle2 className="w-5 h-5" /> Timeline rendered successfully</div>
                {resultSize !== null && <span className="text-xs font-mono text-slate-500">{formatBytes(resultSize)}</span>}
              </div>
              <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video">
                <video controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} src={resultUrl} controls className="w-full h-full object-contain" />
              </div>
              <div className="flex justify-center">
                <a href={resultUrl} download="botock-edited-video.mp4" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:opacity-90 cursor-pointer">
                  <Download className="w-4 h-4" /> Download Video
                </a>
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