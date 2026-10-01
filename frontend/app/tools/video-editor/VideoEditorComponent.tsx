"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Download, Play, Pause, Upload, ZoomIn, ZoomOut, Scissors, Trash2, Copy, Undo2, Redo2, Plus, Home, Film, Sparkles, Filter, Settings, Type, Volume2, Crop, Ghost, Layers
} from "lucide-react";

import { useMediaStore } from "../../store/useMediaStore";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { useEditorTimeline } from "@/lib/editor/useEditorTimeline";
import { useThumbnails } from "@/lib/editor/useThumbnails";
import { useMediaBin } from "@/lib/editor/useMediaBin";
import { exportEditorProject } from "@/lib/editor/exportTimeline";
import { formatBytes } from "@/lib/utils/formatters";
import { MediaBinItem } from "@/lib/editor/types";

import EditorTimeline from "./components/EditorTimeline";
import MediaBin from "./components/MediaBin";

function fmtTime(t: number) {
  if (!Number.isFinite(t) || t < 0) return "00:00:00:00";
  const total = Math.floor(t);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const frames = Math.floor((t - total) * 30);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
}

export default function VideoEditorComponent() {
  const { activeMedia } = useMediaStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [thumbnailsBySource, setThumbnailsBySource] = useState<Record<string, string[]>>({});

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState("");

  const mediaBin = useMediaBin();
  const timeline = useEditorTimeline();
  const thumbs = useThumbnails();
  const { load, writeFile, readFile, deleteFile, exec } = useFFmpeg();

  const allVideoClips = React.useMemo(() => timeline.project.tracks
    .filter(t => t.type === "video" && !t.hidden)
    .flatMap(t => t.clips)
    .sort((a, b) => a.timelineStart - b.timelineStart), [timeline.project.tracks]);
    
  const activeClip = allVideoClips.find((c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration) || null;
  const activeItem = activeClip ? (mediaBin as any).getItem(activeClip.sourceId) : (allVideoClips.length > 0 ? (mediaBin as any).getItem(allVideoClips[allVideoClips.length - 1].sourceId) : null);
  const loadedSourceIdRef = useRef<string | null>(null);
  const lastClipIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeMedia) return;
    const src = activeMedia.blobUrl || activeMedia.url;
    if (!src) return;

    const importGenerated = async () => {
      const blob = activeMedia.blob || (await (await fetch(src)).blob());
      const file = new File([blob], "generated-video.mp4", { type: blob.type || "video/mp4" });
      const item = await mediaBin.addFile(file);
      
      const vTrack = timeline.project.tracks.find(t => t.type === "video");
      if (vTrack) {
        timeline.addClip(vTrack.id, item.id, "video", 0, item.duration);
      }
      const generated = await thumbs.generate(item.url, item.duration, 8);
      setThumbnailsBySource((prev) => ({ ...prev, [item.id]: generated }));
    };
    void importGenerated();
  }, [activeMedia]);

  const handleMediaBinUpload = async (file: File) => {
    const item = await mediaBin.addFile(file);
    const generated = await thumbs.generate(item.url, item.duration, 8);
    setThumbnailsBySource((prev) => ({ ...prev, [item.id]: generated }));
  };

  const handleAddToTimeline = (item: MediaBinItem) => {
    const vTrack = timeline.project.tracks.find(t => t.type === "video");
    if (!vTrack) return;
    const lastClip = vTrack.clips[vTrack.clips.length - 1];
    const startTime = lastClip ? lastClip.timelineStart + lastClip.duration : 0;
    timeline.addClip(vTrack.id, item.id, "video", startTime, item.duration);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!activeClip || !activeItem) {
      if (video.style.opacity !== "0") video.style.opacity = "0";
      if (!video.paused) video.pause();
      return;
    }

    if (video.style.opacity !== "1") video.style.opacity = "1";

    let needsSeek = false;
    let sourceSwapped = false;
    if (loadedSourceIdRef.current !== activeItem.id) {
      loadedSourceIdRef.current = activeItem.id;
      video.src = activeItem.url;
      sourceSwapped = true;
      needsSeek = true;
    }

    if (lastClipIdRef.current !== activeClip.id) {
      lastClipIdRef.current = activeClip.id;
      needsSeek = true;
    }

    const localTime = activeClip.sourceStart + ((currentTime - activeClip.timelineStart) * activeClip.speed);
    const tolerance = isPlaying ? 0.3 : 0.05;

    if (needsSeek || Math.abs(video.currentTime - localTime) > tolerance) {
      video.currentTime = localTime;
    }

    if (isPlaying) {
      if (video.paused) video.play().catch(() => {});
    } else {
      if (!video.paused) video.pause();
    }

    video.playbackRate = Math.min(4, Math.max(0.25, activeClip.speed));
    const isMuted = activeClip.audio?.muted ?? false;
    const volumePercent = activeClip.audio?.volumePercent ?? 100;
    video.muted = isMuted;
    video.volume = isMuted ? 0 : Math.min(1, volumePercent / 100);
  }, [activeItem?.id, activeClip?.id, currentTime, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    let lastTs: number | null = null;
    const tick = (ts: number) => {
      if (lastTs === null) {
         lastTs = ts;
         rafRef.current = requestAnimationFrame(tick);
         return;
      }
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      setCurrentTime((prev) => {
        const next = prev + dt;
        const maxTime = allVideoClips.length > 0 ? allVideoClips[allVideoClips.length - 1].timelineStart + allVideoClips[allVideoClips.length - 1].duration : 10;
        
        if (next >= maxTime && maxTime > 0) {
          setIsPlaying(false);
          return maxTime;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, allVideoClips]);

  const togglePlay = () => {
    const video = videoRef.current;
    const maxTime = allVideoClips.length > 0 ? allVideoClips[allVideoClips.length - 1].timelineStart + allVideoClips[allVideoClips.length - 1].duration : 10;
    
    if (isPlaying) {
      if (video) video.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= maxTime - 0.1) {
         setCurrentTime(0);
      }
      setIsPlaying(true);
    }
  };

  const seekTo = useCallback((t: number) => {
     const maxTime = allVideoClips.length > 0 ? allVideoClips[allVideoClips.length - 1].timelineStart + allVideoClips[allVideoClips.length - 1].duration : 10;
     setCurrentTime(Math.max(0, Math.min(maxTime, t)));
  }, [allVideoClips]);

  const doExport = async () => {
    if (isExporting) return;
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
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
      setExportStage("");
    }
  };

  const SIDEBAR_ITEMS = [
    { icon: Home, label: "Home" },
    { icon: Sparkles, label: "Animate" },
    { icon: Scissors, label: "Edit" },
    { icon: Scissors, label: "Trim" },
    { icon: Crop, label: "Crop" },
    { icon: Ghost, label: "Effects" },
    { icon: Filter, label: "Filters" },
    { icon: Layers, label: "Chroma Key" },
    { icon: Volume2, label: "Volume" },
    { icon: Type, label: "Text" },
  ];

  const currentMaxTime = allVideoClips.length > 0 ? allVideoClips[allVideoClips.length - 1].timelineStart + allVideoClips[allVideoClips.length - 1].duration : 0;

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#1e1e24] text-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-[#141419] flex items-center justify-between px-4 shrink-0 border-b border-[#2b2b36]">
        <div className="flex items-center gap-4">
          <Link href="/tools/video-generator" className="text-gray-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-sm tracking-wide">My Project</h1>
        </div>
        <div className="flex items-center gap-4">
           <button className="text-gray-400 hover:text-white"><Settings className="w-5 h-5"/></button>
           <button onClick={doExport} disabled={isExporting} className="bg-[#ff6b4a] hover:bg-[#ff856b] text-white px-6 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
             <Download className="w-4 h-4"/> {isExporting ? "Exporting..." : "EXPORT"}
           </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left Toolbar */}
        <div className="w-20 bg-[#141419] flex flex-col items-center py-4 gap-6 shrink-0 border-r border-[#2b2b36] overflow-y-auto overflow-x-hidden">
          {SIDEBAR_ITEMS.map((item, i) => (
             <button key={i} className={`flex flex-col items-center gap-1.5 w-full ${i === 2 ? 'text-[#ff6b4a]' : 'text-gray-400 hover:text-gray-200'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] text-center w-full">{item.label}</span>
             </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Panel: Media & Preview */}
          <div className="flex-1 flex min-h-0">
             
             {/* Media Bin */}
             <div className="w-[300px] bg-[#1e1e24] border-r border-[#2b2b36] flex flex-col min-h-0">
                <div className="p-4 border-b border-[#2b2b36]">
                   <h2 className="text-sm font-bold">Media Bin</h2>
                </div>
                <div className="flex-1 overflow-auto">
                   <MediaBin 
                     items={mediaBin.items} 
                     onUpload={handleMediaBinUpload} 
                     onAddToTimeline={handleAddToTimeline}
                   />
                </div>
             </div>

             {/* Preview Area */}
             <div className="flex-1 bg-black relative flex flex-col min-w-0">
                <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-xs font-semibold z-10 backdrop-blur-md border border-white/10">
                   Video Preview
                </div>
                
                {/* Result Overlay */}
                {resultUrl && !isExporting && (
                  <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    <h3 className="text-xl font-bold">Export Complete!</h3>
                    <a href={resultUrl} download="botock-video.mp4" className="bg-[#ff6b4a] px-6 py-2 rounded font-bold">Download MP4</a>
                    <button onClick={() => setResultUrl(null)} className="text-gray-400 underline">Close</button>
                  </div>
                )}
                {isExporting && (
                  <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-[#ff6b4a] border-t-transparent rounded-full animate-spin" />
                    <h3 className="text-sm font-bold text-[#ff6b4a]">{exportStage || "Processing..."}</h3>
                  </div>
                )}

                <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0a0a0c] p-4" onClick={togglePlay}>
                   <video controlsList="nodownload" onContextMenu={(e) => e.preventDefault()}
                     ref={videoRef}
                     className="max-w-full max-h-full bg-black shadow-2xl ring-1 ring-white/10"
                     style={{ 
                        aspectRatio: `${timeline.project.width} / ${timeline.project.height}`,
                        objectFit: "contain"
                     }}
                     playsInline
                   />
                </div>

                {/* Player Controls */}
                <div className="h-14 bg-[#141419] flex items-center justify-center gap-6 px-4 border-t border-[#2b2b36]">
                   <button onClick={() => seekTo(0)} className="text-gray-400 hover:text-white"><div className="w-3 h-3 border-l-2 border-current flex items-center"><Play className="w-3 h-3 fill-current rotate-180"/></div></button>
                   <button onClick={() => seekTo(currentTime - 5)} className="text-gray-400 hover:text-white"><Play className="w-4 h-4 fill-current rotate-180"/></button>
                   <button onClick={togglePlay} className="text-white bg-[#2b2b36] p-2 rounded-full hover:bg-white hover:text-black transition-colors">
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                   </button>
                   <button onClick={() => seekTo(currentTime + 5)} className="text-gray-400 hover:text-white"><Play className="w-4 h-4 fill-current"/></button>
                   <button onClick={() => seekTo(currentMaxTime)} className="text-gray-400 hover:text-white"><div className="w-3 h-3 border-r-2 border-current flex items-center justify-end"><Play className="w-3 h-3 fill-current"/></div></button>
                </div>
             </div>
          </div>

          {/* Bottom Panel: Timeline */}
          <div className="h-[250px] bg-[#1e1e24] flex flex-col shrink-0 border-t border-[#2b2b36]">
             
             {/* Timeline Toolbar */}
             <div className="h-10 bg-[#141419] flex items-center justify-between px-4 border-b border-[#2b2b36]">
                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                   <button onClick={timeline.undo} disabled={!timeline.canUndo} className="hover:text-white disabled:opacity-30 flex items-center gap-1"><Undo2 className="w-3.5 h-3.5"/> Undo</button>
                   <button onClick={timeline.redo} disabled={!timeline.canRedo} className="hover:text-white disabled:opacity-30 flex items-center gap-1"><Redo2 className="w-3.5 h-3.5"/> Redo</button>
                   <span className="w-px h-4 bg-gray-700 mx-2"></span>
                   <button onClick={() => timeline.splitAt(currentTime)} className="hover:text-white flex items-center gap-1"><Scissors className="w-3.5 h-3.5"/> Split</button>
                   <button onClick={() => timeline.selectedClipId && timeline.deleteClip(timeline.selectedClipId)} disabled={!timeline.selectedClipId} className="hover:text-red-400 disabled:opacity-30 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5"/> Delete</button>
                </div>
                <div className="flex items-center gap-4 text-xs">
                   <div className="flex items-center font-mono gap-1">
                      <span className="text-white">{fmtTime(currentTime)}</span>
                      <span className="text-gray-600">/</span>
                      <span className="text-gray-500">{fmtTime(currentMaxTime)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <ZoomOut className="w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="range" min="0.1" max="3" step="0.1" value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-24 accent-[#ff6b4a] h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <ZoomIn className="w-3.5 h-3.5 text-gray-500" />
                   </div>
                </div>
             </div>

             {/* Timeline Track Engine */}
             <div className="flex-1 relative overflow-hidden bg-[#1a1a20]">
                <EditorTimeline
                  project={timeline.project}
                  mediaItems={mediaBin.items}
                  currentTime={currentTime}
                  selectedClipId={timeline.selectedClipId}
                  onSelectClip={timeline.setSelectedClipId}
                  onSeek={seekTo}
                  onSplit={(t) => timeline.splitAt(t)}
                  onEdgeBegin={timeline.beginLiveUpdate}
                  onEdgeLive={timeline.updateClipEdgeLive}
                  onEdgeCommit={timeline.commitLiveUpdate}
                  zoom={zoom}
                  thumbnailsBySource={thumbnailsBySource}
                />
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}
