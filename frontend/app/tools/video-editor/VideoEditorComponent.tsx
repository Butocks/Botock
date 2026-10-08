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
import { useWaveforms } from "@/lib/editor/useWaveforms";
import { useMediaBin } from "@/lib/editor/useMediaBin";
import { exportEditorProject } from "@/lib/editor/exportTimeline";
import { formatBytes } from "@/lib/utils/formatters";
import { MediaBinItem } from "@/lib/editor/types";

import EditorTimeline from "./components/EditorTimeline";
import PreviewCanvas from "./components/PreviewCanvas";
import TransformInspector from "./components/TransformInspector";
import TransformOverlay from "./components/TransformOverlay";
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
  const timeRef = useRef(currentTime);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  
  // Format time utility for the direct DOM update
  useEffect(() => {
    const handleTime = (e: any) => {
      const el = document.getElementById("editor-time-display");
      if (el) {
        const t = e.detail;
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        const ms = Math.floor((t % 1) * 10);
        el.innerText = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
      }
    };
    window.addEventListener('editor-time-update', handleTime);
    return () => window.removeEventListener('editor-time-update', handleTime);
  }, []);
  const [zoom, setZoom] = useState(1);
  const [thumbnailsBySource, setThumbnailsBySource] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState("Edit");


  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState("");

  const mediaBin = useMediaBin();
  const timeline = useEditorTimeline();
  const thumbs = useThumbnails();
  const waveformsBySource = useWaveforms(mediaBin.items);
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
    handleAddToTimeline(item);
  };

  const handleAddToTimeline = (item: MediaBinItem) => {
    const isAudio = item.file.type.startsWith("audio/");
    const isImage = item.file.type.startsWith("image/");
    const trackType = isAudio ? "audio" : "video";
    const clipType = isAudio ? "audio" : (isImage ? "image" : "video");
    
    const targetTrack = timeline.project.tracks.find(t => t.type === trackType);
    if (!targetTrack) {
        timeline.addTrack(trackType, trackType === "audio" ? "Audio Track" : "Video Track");
        // Re-find the track after state update? No, state update is asynchronous.
        // We'll just alert or wait for user to add track manually if none exists,
        // but project starts with V1 and A1 so they should exist.
        return;
    }
    const lastClip = targetTrack.clips[targetTrack.clips.length - 1];
    const startTime = lastClip ? lastClip.timelineStart + lastClip.duration : 0;
    timeline.addClip(targetTrack.id, item.id, clipType, startTime, item.duration);
  };

  useEffect(() => {
    const handleAddText = (e: any) => {
    const vTrack = timeline.project.tracks.find(t => t.type === "video");
      if (vTrack) {
         timeline.addClip(vTrack.id, "text_source", "text", currentTime, 3);
         // Find the newly added clip in the next render to select it, or just let the user click it.
         // Wait, we need to update its text immediately.
         setTimeout(() => {
           // Hacky way to dispatch an update if needed, but default text is empty. We could set a default.
         }, 100);
      }
    };
    window.addEventListener('editor-add-text', handleAddText);
    return () => window.removeEventListener('editor-add-text', handleAddText);
  }, [timeline, currentTime]);

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
      const maxTime = allVideoClips.length > 0 ? Math.max(...allVideoClips.map(c => c.timelineStart + c.duration)) : 10;
      // Bypass React state for 60fps playback to prevent crushing the render tree
      let next = timeRef.current + dt;
      if (next >= maxTime && maxTime > 0) {
          next = maxTime;
          setTimeout(() => setIsPlaying(false), 0);
      }
      timeRef.current = next;
      window.dispatchEvent(new CustomEvent('editor-time-update', { detail: next }));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, allVideoClips]);

  const togglePlay = () => {
    const video = videoRef.current;
    const maxTime = allVideoClips.length > 0 ? Math.max(...allVideoClips.map(c => c.timelineStart + c.duration)) : 10;
    
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
     const maxTime = allVideoClips.length > 0 ? Math.max(...allVideoClips.map(c => c.timelineStart + c.duration)) : 10;
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
    { icon: Home, label: "Home", id: "Home" },
    { icon: Sparkles, label: "Animate", id: "Animate" },
    { icon: Scissors, label: "Edit", id: "Edit" },
    { icon: Scissors, label: "Trim", id: "Trim" },
    { icon: Crop, label: "Crop", id: "Crop" },
    { icon: Ghost, label: "Effects", id: "Effects" },
    { icon: Filter, label: "Filters", id: "Filters" },
    { icon: Layers, label: "Chroma Key", id: "Chroma Key" },
    { icon: Volume2, label: "Volume", id: "Volume" },
    { icon: Type, label: "Text", id: "Text" },
  ];

  const selectedClip = timeline.project.tracks.flatMap(t => t.clips).find(c => c.id === timeline.selectedClipId);
  const currentMaxTime = allVideoClips.length > 0 ? allVideoClips[allVideoClips.length - 1].timelineStart + allVideoClips[allVideoClips.length - 1].duration : 0;

  return (
    <div className="h-[100dvh] md:h-[calc(100vh-64px)] w-full bg-[#1e1e24] text-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-[#141419] flex items-center justify-between px-4 shrink-0 border-b border-[#2b2b36]">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/tools/video-generator" className="text-gray-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-sm tracking-wide hidden md:block">My Project</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
           <select 
              value={`${timeline.project.width}x${timeline.project.height}`}
              onChange={(e) => {
                 const [w, h] = e.target.value.split("x").map(Number);
                 timeline.beginLiveUpdate();
                 // Note: we need a way to update the project properties. 
                 // Since there isn't a direct updateProject function exposed by useEditorTimeline, we can use the state patch approach or we can just add a helper.
                 // Actually, useEditorTimeline returns project and setProject? No.
                 // Let's dispatch a custom event and add a listener, or just use a helper if we have one.
                 // Wait, we can just add an updateProject method to useEditorTimeline.
                 window.dispatchEvent(new CustomEvent('editor-update-project', { detail: { width: w, height: h } }));
              }}
              className="bg-[#2b2b36] border border-gray-700 text-white rounded px-2 py-1.5 text-xs focus:outline-none"
           >
              <option value="1280x720">16:9 (Landscape)</option>
              <option value="720x1280">9:16 (Vertical)</option>
              <option value="1080x1080">1:1 (Square)</option>
              <option value="1080x1350">4:5 (Portrait)</option>
           </select>
           <button onClick={doExport} disabled={isExporting} className="bg-[#ff6b4a] hover:bg-[#ff856b] text-white px-3 md:px-6 py-1.5 rounded text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 transition-colors disabled:opacity-50">
             <Download className="w-4 h-4"/> {isExporting ? "Exporting..." : "EXPORT"}
           </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Left Toolbar */}
        <div className="w-full md:w-20 bg-[#141419] flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 gap-2 md:gap-6 shrink-0 border-b md:border-r border-[#2b2b36] overflow-x-auto md:overflow-x-hidden overflow-y-hidden md:overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
             <button 
               key={item.id} 
               onClick={() => setActiveTab(item.id)}
               className={`flex flex-col items-center gap-1.5 w-full ${activeTab === item.id ? 'text-[#ff6b4a]' : 'text-gray-400 hover:text-gray-200'}`}
             >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] text-center w-full">{item.label}</span>
             </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden overflow-y-auto">
          
          {/* Top Panel: Media & Preview */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0">
             
             {/* Media Bin */}
             <div className="w-full md:w-[300px] bg-[#1e1e24] flex border-b md:border-r border-[#2b2b36] flex-col min-h-0 h-[250px] md:h-auto shrink-0">
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
                   <div className="relative max-w-full max-h-full" style={{ aspectRatio: `${timeline.project.width} / ${timeline.project.height}` }}>
                      <PreviewCanvas 
                        project={timeline.project} 
                        mediaItems={mediaBin.items} 
                        currentTime={currentTime} 
                        isPlaying={isPlaying} 
                      />
                      {selectedClip && (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text") && (
                         <TransformOverlay 
                            clip={selectedClip} 
                            project={timeline.project}
                            mediaItem={mediaBin.items.find(m => m.id === selectedClip.sourceId)}
                            onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                            onCommitLive={() => timeline.commitLiveUpdate()}
                         />
                      )}
                   </div>
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


             {/* Inspector Area */}
             <div className="w-full md:w-[280px] flex bg-[#141419] border-t md:border-l md:border-t-0 border-[#2b2b36] flex-col min-h-0 h-[250px] md:h-auto overflow-y-auto shrink-0 shadow-xl">
                {selectedClip && (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text") ? (
                   <TransformInspector 
                       clip={selectedClip} 
                       activeTab={activeTab}
                       onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                       onBeginLive={() => timeline.beginLiveUpdate()}
                       onCommitLive={() => timeline.commitLiveUpdate()}
                       onUpdate={(patch) => {
                           timeline.beginLiveUpdate();
                           timeline.updateClipLive(selectedClip.id, patch);
                           timeline.commitLiveUpdate();
                       }}
                   />
                ) : (
                   <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500">
                      <div className="w-12 h-12 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                         <Scissors className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">No clip selected</p>
                      <p className="text-xs mt-2">Click on a video clip in the timeline below to use {activeTab} tools.</p>
                   </div>
                )}
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
                   <span className="w-px h-4 bg-gray-700 mx-2"></span>
                   <button onClick={() => timeline.addTrack("video", `V${timeline.project.tracks.length + 1}`)} className="hover:text-white flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Video Track</button>
                   <button onClick={() => timeline.addTrack("audio", `A${timeline.project.tracks.length + 1}`)} className="hover:text-white flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Audio Track</button>
                </div>
                <div className="flex items-center gap-4 text-xs">
                   <div className="flex items-center font-mono gap-1">
                      <span id="editor-time-display" className="text-white">{fmtTime(currentTime)}</span>
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
                  waveformsBySource={waveformsBySource}
                />
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}
