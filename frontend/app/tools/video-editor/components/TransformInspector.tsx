import React from "react";
import { TimelineClip } from "@/lib/editor/types";

interface Props {
  clip: TimelineClip;
  activeTab?: string;
  onUpdate: (patch: Partial<TimelineClip>) => void;
  onUpdateLive: (patch: Partial<TimelineClip>) => void;
  onBeginLive: () => void;
  onCommitLive: () => void;
}

export default function TransformInspector({ clip, activeTab = "Edit", onUpdate, onUpdateLive, onBeginLive, onCommitLive }: Props) {
  const t = clip.transform || { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
  const f = clip.filters || { brightness: 0, contrast: 1, saturation: 1 };
  const chroma = clip.chromaKey || { enabled: false, color: "#00ff00", similarity: 0.4, blend: 0.1, spillReduction: 0.1 };
  const crop = clip.crop || { x: 0, y: 0, width: 1, height: 1 };

  const handleSliderChange = (key: string, val: number) => {
    onUpdateLive({ transform: { ...t, [key]: val } });
  };

  const handleSliderEnd = () => {
    onCommitLive();
  };

  const handleSliderStart = () => {
    onBeginLive();
  };

  const renderEdit = () => (
    <>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Transform & Layout</h3>
      <div className="space-y-4">
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
      </div>
    </>
  );

  const renderFilters = () => (
    <>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Filters</h3>
      <div className="space-y-4">
        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Brightness</span>
            <span className="text-white font-mono">{f.brightness > 0 ? "+" : ""}{Math.round(f.brightness * 100)}%</span>
          </div>
          <input 
            type="range" min="-1" max="1" step="0.05" value={f.brightness}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => onUpdateLive({ filters: { ...f, brightness: parseFloat(e.target.value) } })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
        {/* Contrast */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Contrast</span>
            <span className="text-white font-mono">{Math.round(f.contrast * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="2" step="0.05" value={f.contrast}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => onUpdateLive({ filters: { ...f, contrast: parseFloat(e.target.value) } })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
        {/* Saturation */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Saturation</span>
            <span className="text-white font-mono">{Math.round(f.saturation * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="3" step="0.1" value={f.saturation}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => onUpdateLive({ filters: { ...f, saturation: parseFloat(e.target.value) } })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>
    </>
  );

  const renderVolume = () => {
    if (clip.type !== "video" && clip.type !== "audio") return <p className="text-xs text-slate-500">Audio not available for this clip.</p>;
    return (
      <>
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
              type="range" min="0" max="200" value={clip.audio?.volumePercent ?? 100}
              onChange={(e) => onUpdateLive({ audio: { ...clip.audio, volumePercent: parseFloat(e.target.value) } as any })}
              onPointerUp={onCommitLive}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Fade In</span>
              <span>{clip.audio?.fadeInSeconds?.toFixed(1) || "0.0"}s</span>
            </div>
            <input
              type="range" min="0" max="5" step="0.1" value={clip.audio?.fadeInSeconds ?? 0}
              onChange={(e) => onUpdateLive({ audio: { ...clip.audio, fadeInSeconds: parseFloat(e.target.value) } as any })}
              onPointerUp={onCommitLive}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Fade Out</span>
              <span>{clip.audio?.fadeOutSeconds?.toFixed(1) || "0.0"}s</span>
            </div>
            <input
              type="range" min="0" max="5" step="0.1" value={clip.audio?.fadeOutSeconds ?? 0}
              onChange={(e) => onUpdateLive({ audio: { ...clip.audio, fadeOutSeconds: parseFloat(e.target.value) } as any })}
              onPointerUp={onCommitLive}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </>
    );
  };

  const renderChroma = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Chroma Key</h3>
        <button
          onClick={() => onUpdateLive({ chromaKey: { ...chroma, enabled: !chroma.enabled } })}
          className={`px-2 py-1 rounded text-xs font-bold ${chroma.enabled ? "bg-violet-500 text-white" : "bg-slate-700 text-slate-300"}`}
        >
          {chroma.enabled ? "ON" : "OFF"}
        </button>
      </div>
      {chroma.enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Color</span>
            </div>
            <input 
              type="color" value={chroma.color}
              onChange={e => onUpdateLive({ chromaKey: { ...chroma, color: e.target.value } })}
              className="w-full h-8 bg-transparent cursor-pointer rounded"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Similarity</span>
              <span className="text-white font-mono">{Math.round(chroma.similarity * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" value={chroma.similarity}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={e => onUpdateLive({ chromaKey: { ...chroma, similarity: parseFloat(e.target.value) } })}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>
        </div>
      )}
    </>
  );

  const renderCrop = () => (
    <>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Crop</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Top</span>
            <span className="text-white font-mono">{Math.round(crop.y * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="0.5" step="0.01" value={crop.y}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => onUpdateLive({ crop: { ...crop, y: parseFloat(e.target.value), height: 1 - parseFloat(e.target.value) - (1 - crop.y - crop.height) } })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Bottom</span>
            <span className="text-white font-mono">{Math.round((1 - crop.y - crop.height) * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="0.5" step="0.01" value={1 - crop.y - crop.height}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => {
              const bottom = parseFloat(e.target.value);
              onUpdateLive({ crop: { ...crop, height: 1 - crop.y - bottom } });
            }}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Left</span>
            <span className="text-white font-mono">{Math.round(crop.x * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="0.5" step="0.01" value={crop.x}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => onUpdateLive({ crop: { ...crop, x: parseFloat(e.target.value), width: 1 - parseFloat(e.target.value) - (1 - crop.x - crop.width) } })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Right</span>
            <span className="text-white font-mono">{Math.round((1 - crop.x - crop.width) * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="0.5" step="0.01" value={1 - crop.x - crop.width}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => {
              const right = parseFloat(e.target.value);
              onUpdateLive({ crop: { ...crop, width: 1 - crop.x - right } });
            }}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>
    </>
  );

  const renderText = () => {
    if (clip.type !== "text") return (
      <div className="flex flex-col gap-4">
         <p className="text-xs text-slate-500">Select a text clip or create a new one.</p>
         <button 
           onClick={() => {
              // We'll dispatch a custom event to add a text clip to the project
              window.dispatchEvent(new CustomEvent('editor-add-text', { detail: { time: 0, text: "New Text" } }));
           }}
           className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded text-xs"
         >
           + Add Text Clip
         </button>
      </div>
    );
    return (
      <>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Text Properties</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs">Content</span>
            <textarea
              value={clip.text || ""}
              onChange={e => onUpdateLive({ text: e.target.value })}
              onBlur={onCommitLive}
              className="w-full bg-slate-800 text-white rounded p-2 text-sm"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <span className="text-slate-400 text-xs">Color</span>
            <input 
              type="color" value={clip.color || "#ffffff"}
              onChange={e => onUpdateLive({ color: e.target.value })}
              onBlur={onCommitLive}
              className="w-full h-8 bg-transparent cursor-pointer rounded"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Font Size</span>
              <span className="text-white font-mono">{clip.fontSizePercent || 50}px</span>
            </div>
            <input 
              type="range" min="10" max="200" step="1" value={clip.fontSizePercent || 50}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={e => onUpdateLive({ fontSizePercent: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>
        </div>
      </>
    );
  };

  const renderTrim = () => (
    <>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Trim & Speed</h3>
      <p className="text-xs text-slate-400 mb-4">Drag the edges of the clip in the timeline below to trim.</p>
      <div className="space-y-4">
         <div className="flex justify-between text-xs">
           <span className="text-slate-400">Duration</span>
           <span className="text-white font-mono">{clip.duration.toFixed(2)}s</span>
         </div>
         <div className="space-y-2">
           <div className="flex justify-between text-xs">
             <span className="text-slate-400">Speed</span>
             <span className="text-white font-mono">{clip.speed.toFixed(2)}x</span>
           </div>
           <input 
             type="range" min="0.25" max="4" step="0.25" value={clip.speed}
             onPointerDown={handleSliderStart}
             onPointerUp={handleSliderEnd}
             onChange={e => onUpdateLive({ speed: parseFloat(e.target.value) })}
             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
           />
         </div>
      </div>
    </>
  );

  const renderEffects = () => (
     <>
       <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Effects & Animation</h3>
       <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs">Animation (Pan & Zoom)</span>
            <select 
               value={clip.effects?.[0]?.type || "none"}
               onChange={(e) => {
                  const val = e.target.value;
                  onUpdateLive({ effects: val === "none" ? [] : [{ id: Date.now().toString(), type: val }] });
                  onCommitLive();
               }}
               className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:border-violet-500"
            >
               <option value="none">None</option>
               <option value="zoom-in">Zoom In</option>
               <option value="zoom-out">Zoom Out</option>
               <option value="pan-left">Pan Left</option>
               <option value="pan-right">Pan Right</option>
               <option value="fade-in">Fade In</option>
               <option value="fade-out">Fade Out</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-2">Applies a dynamic movement or fade effect over the duration of the clip.</p>
          </div>
       </div>
     </>
  );

  return (
    <div className="space-y-4 p-4 border-b border-white/5 h-full overflow-y-auto">
      {activeTab === "Edit" && renderEdit()}
      {activeTab === "Filters" && renderFilters()}
      {activeTab === "Volume" && renderVolume()}
      {activeTab === "Chroma Key" && renderChroma()}
      {activeTab === "Crop" && renderCrop()}
      {activeTab === "Text" && renderText()}
      {activeTab === "Trim" && renderTrim()}
      {(activeTab === "Effects" || activeTab === "Animate") && renderEffects()}
      {activeTab !== "Edit" && activeTab !== "Filters" && activeTab !== "Volume" && activeTab !== "Chroma Key" && activeTab !== "Crop" && activeTab !== "Text" && activeTab !== "Trim" && activeTab !== "Effects" && activeTab !== "Animate" && renderEdit()}
    </div>
  );
}
