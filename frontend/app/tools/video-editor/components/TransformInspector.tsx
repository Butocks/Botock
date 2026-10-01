import React from "react";
import { TimelineClip } from "@/lib/editor/types";

interface Props {
  clip: TimelineClip;
  onUpdate: (patch: Partial<TimelineClip>) => void;
  onUpdateLive: (patch: Partial<TimelineClip>) => void;
  onBeginLive: () => void;
  onCommitLive: () => void;
}

export default function TransformInspector({ clip, onUpdate, onUpdateLive, onBeginLive, onCommitLive }: Props) {
  const t = clip.transform || { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };

  const handleSliderChange = (key: string, val: number) => {
    onUpdateLive({ transform: { ...t, [key]: val } });
  };

  const handleSliderEnd = () => {
    onCommitLive();
  };

  const handleSliderStart = () => {
    onBeginLive();
  };

  return (
    <div className="space-y-4 p-4 border-b border-white/5">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Transform & Layout</h3>
      
      {/* Position X */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Position X</span>
          <span className="text-white font-mono">{t.x.toFixed(1)}%</span>
        </div>
        <input 
          type="range" min="0" max="100" step="0.1" value={t.x}
          onPointerDown={handleSliderStart}
          onPointerUp={handleSliderEnd}
          onChange={e => handleSliderChange("x", parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Position Y */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Position Y</span>
          <span className="text-white font-mono">{t.y.toFixed(1)}%</span>
        </div>
        <input 
          type="range" min="0" max="100" step="0.1" value={t.y}
          onPointerDown={handleSliderStart}
          onPointerUp={handleSliderEnd}
          onChange={e => handleSliderChange("y", parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Scale</span>
          <span className="text-white font-mono">{t.scaleX.toFixed(2)}x</span>
        </div>
        <input 
          type="range" min="0.1" max="3" step="0.05" value={t.scaleX}
          onPointerDown={handleSliderStart}
          onPointerUp={handleSliderEnd}
          onChange={e => {
             const v = parseFloat(e.target.value);
             onUpdateLive({ transform: { ...t, scaleX: v, scaleY: v } });
          }}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Rotation</span>
          <span className="text-white font-mono">{t.rotation.toFixed(0)}°</span>
        </div>
        <input 
          type="range" min="-180" max="180" step="1" value={t.rotation}
          onPointerDown={handleSliderStart}
          onPointerUp={handleSliderEnd}
          onChange={e => handleSliderChange("rotation", parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Opacity</span>
          <span className="text-white font-mono">{t.opacity.toFixed(0)}%</span>
        </div>
        <input 
          type="range" min="0" max="100" step="1" value={t.opacity}
          onPointerDown={handleSliderStart}
          onPointerUp={handleSliderEnd}
          onChange={e => handleSliderChange("opacity", parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
      </div>

      {/* Audio Settings */}
      {(clip.type === "video" || clip.type === "audio") && (
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Audio</h3>
            <button
              onClick={() => onUpdateLive({ audio: { ...clip.audio, muted: !(clip.audio?.muted ?? false) } as any })}
              className={`p-1.5 rounded ${clip.audio?.muted ? "bg-red-500/20 text-red-400" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {clip.audio?.muted ? (
                   <>
                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                     <line x1="23" y1="9" x2="17" y2="15"></line>
                     <line x1="17" y1="9" x2="23" y2="15"></line>
                   </>
                ) : (
                   <>
                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                     <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                     <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                   </>
                )}
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Volume</span>
                <span>{Math.round(clip.audio?.volumePercent ?? 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={clip.audio?.volumePercent ?? 100}
                onChange={(e) => onUpdateLive({ audio: { ...clip.audio, volumePercent: parseFloat(e.target.value) } as any })}
                onPointerUp={onCommitLive}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
