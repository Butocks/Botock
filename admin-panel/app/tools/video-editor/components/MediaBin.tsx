"use client";

import { useRef } from "react";
import { Film, Plus, Upload, Mic, Square } from "lucide-react";
import React, { useState } from "react";
import { MediaBinItem } from "@/lib/editor/types";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MediaBinProps {
  items: MediaBinItem[];
  onUpload: (file: File) => void;
  onAddToTimeline: (item: MediaBinItem) => void;
}

export default React.memo(function MediaBin({ items, onUpload, onAddToTimeline }: MediaBinProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `Voiceover_${new Date().toLocaleTimeString().replace(/:/g, "-")}.webm`, { type: "audio/webm" });
        onUpload(file);
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Microphone access denied. Please allow microphone permissions.");
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-primary" /> Media Bin
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${isRecording ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
          >
            {isRecording ? <><Square className="w-3 h-3 fill-current" /> Stop</> : <><Mic className="w-3 h-3" /> Record Voice</>}
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-colors"
          >
            <Upload className="w-3 h-3" /> Import Media
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Import extra video files here, then add them to the timeline to build a multi-clip sequence.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onAddToTimeline(item)}
              className="group relative rounded-xl overflow-hidden border border-border/50 bg-black aspect-video flex items-center justify-center hover:border-primary transition-all cursor-pointer"
              title={`Add "${item.name}" to timeline`}
            >
              <video controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} src={item.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" muted playsInline />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 rounded-full bg-primary text-white shadow-md">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              <span className="absolute bottom-1 left-1 right-1 truncate text-[9px] font-bold text-white bg-black/70 rounded px-1.5 py-0.5 text-left">
                {item.name} • {fmt(item.duration)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
