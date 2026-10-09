const fs = require('fs');

let code = `import React, { useState } from "react";
import { TimelineClip } from "@/lib/editor/types";
import { Scissors, Volume2, Type, Image as ImageIcon, Sliders, Play, Settings, Sparkles, Layers } from "lucide-react";

interface Props {
  clip: TimelineClip;
  onUpdateLive: (patch: Partial<TimelineClip>) => void;
  onBeginLive: () => void;
  onCommitLive: () => void;
  onUpdate: (patch: Partial<TimelineClip>) => void;
}

export default function TransformInspector({ clip, onUpdateLive, onBeginLive, onCommitLive, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<"Basic" | "Audio" | "Effects" | "Adjust">("Basic");

  const handleSliderStart = onBeginLive;
  const handleSliderEnd = onCommitLive;

  const renderTabs = (tabs: typeof activeTab[]) => (
    <div className="flex bg-[#0a0a0c] p-1 gap-1 border-b border-[#2b2b36]">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => setActiveTab(t)}
          className={\`flex-1 text-[11px] font-bold py-1.5 rounded \${activeTab === t ? 'bg-[#2b2b36] text-white' : 'text-gray-400 hover:text-gray-200'}\`}
        >
          {t}
        </button>
      ))}
    </div>
  );

  const tForm = clip.transform || { x: 50, y: 50, scaleX: 1, scaleY: 1, rotation: 0, opacity: 100, width: 100, height: 100 };

  const renderBasicVideo = () => (
    <div className="space-y-6 p-4">
      <div>
        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Transform</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Scale</span>
            <input type="number" value={Math.round(tForm.scaleX * 100)} onChange={e => {
               const val = parseFloat(e.target.value) / 100;
               onUpdate({ transform: { ...tForm, scaleX: val, scaleY: val } });
            }} className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Rotation</span>
            <input type="number" value={tForm.rotation} onChange={e => {
               onUpdate({ transform: { ...tForm, rotation: parseFloat(e.target.value) } });
            }} className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Position X</span>
            <input type="number" value={Math.round(tForm.x)} onChange={e => {
               onUpdate({ transform: { ...tForm, x: parseFloat(e.target.value) } });
            }} className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Position Y</span>
            <input type="number" value={Math.round(tForm.y)} onChange={e => {
               onUpdate({ transform: { ...tForm, y: parseFloat(e.target.value) } });
            }} className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]" />
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opacity</h4>
           <span className="text-xs text-gray-300">{Math.round(tForm.opacity)}%</span>
        </div>
        <input type="range" min="0" max="100" value={tForm.opacity} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ transform: { ...tForm, opacity: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
      </div>
      <div>
         <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider mt-4">Speed & Duration</h4>
         <div className="space-y-2">
           <div className="flex justify-between text-xs">
             <span className="text-gray-400">Playback Speed</span>
             <span className="text-white font-mono">{clip.speed.toFixed(2)}x</span>
           </div>
           <input type="range" min="0.25" max="4" step="0.25" value={clip.speed} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ speed: parseFloat(e.target.value) })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
         </div>
      </div>
    </div>
  );

  const renderAudio = () => {
    const vol = clip.audio?.volumePercent ?? 100;
    const fadeI = clip.audio?.fadeInSeconds ?? 0;
    const fadeO = clip.audio?.fadeOutSeconds ?? 0;
    const isMuted = clip.audio?.muted ?? false;

    return (
      <div className="space-y-6 p-4">
        <div>
          <div className="flex justify-between items-center mb-2">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume</h4>
             <span className="text-xs text-gray-300">{vol}%</span>
          </div>
          <input type="range" min="0" max="500" value={vol} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ audio: { ...clip.audio, volumePercent: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
          <button onClick={() => onUpdate({ audio: { ...clip.audio, muted: !isMuted } })} className={\`mt-4 w-full py-1.5 rounded text-xs font-bold transition-colors \${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-[#2b2b36] text-white hover:bg-gray-700'}\`}>
             {isMuted ? "Unmute Audio" : "Mute Audio"}
          </button>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fade In</h4>
             <span className="text-xs text-gray-300">{fadeI.toFixed(1)}s</span>
          </div>
          <input type="range" min="0" max="5" step="0.1" value={fadeI} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ audio: { ...clip.audio, fadeInSeconds: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fade Out</h4>
             <span className="text-xs text-gray-300">{fadeO.toFixed(1)}s</span>
          </div>
          <input type="range" min="0" max="5" step="0.1" value={fadeO} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ audio: { ...clip.audio, fadeOutSeconds: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
        </div>
      </div>
    );
  };

  const renderEffects = () => {
    const eff = clip.effects?.[0] || { type: "none", intensity: 1, duration: 1 };
    
    return (
      <div className="space-y-6 p-4">
        <div>
          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Animation</h4>
          <select 
             value={eff.type}
             onChange={e => onUpdate({ effects: e.target.value === "none" ? [] : [{ ...eff, id: Date.now().toString(), type: e.target.value }] })}
             className="w-full bg-[#0a0a0c] text-xs p-2 rounded border border-[#2b2b36] text-white outline-none"
          >
             <option value="none">None</option>
             <option value="zoom-in">Zoom In</option>
             <option value="zoom-out">Zoom Out</option>
             <option value="pan-left">Pan Left</option>
             <option value="pan-right">Pan Right</option>
             <option value="fade-in">Fade In</option>
             <option value="fade-out">Fade Out</option>
          </select>
        </div>
        {eff.type !== "none" && (
          <div>
            <div className="flex justify-between items-center mb-2">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</h4>
               <span className="text-xs text-gray-300">{(eff.duration || 1).toFixed(1)}s</span>
            </div>
            <input type="range" min="0.1" max="5" step="0.1" value={eff.duration || 1} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ effects: [{ ...eff, duration: parseFloat(e.target.value) }] })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
          </div>
        )}
        <div>
          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider mt-6">Chroma Key (Green Screen)</h4>
          <label className="flex items-center gap-2 mb-3 text-xs text-white">
            <input type="checkbox" checked={clip.chromaKey?.enabled || false} onChange={e => onUpdate({ chromaKey: { ...(clip.chromaKey || { color: "#00ff00", similarity: 0.3, blend: 0.1 }), enabled: e.target.checked } })} />
            Enable Chroma Key
          </label>
          {clip.chromaKey?.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-[#2b2b36]">
               <div className="flex items-center justify-between">
                 <span className="text-xs text-gray-400">Key Color</span>
                 <input type="color" value={clip.chromaKey.color || "#00ff00"} onChange={e => onUpdate({ chromaKey: { ...clip.chromaKey!, color: e.target.value } })} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
               </div>
               <div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] text-gray-400 uppercase tracking-wider">Intensity</span>
                     <span className="text-xs text-gray-300">{((clip.chromaKey.similarity || 0.3)*100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min="0.01" max="1" step="0.01" value={clip.chromaKey.similarity || 0.3} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ chromaKey: { ...clip.chromaKey!, similarity: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdjust = () => {
    const f = clip.filters || { brightness: 0, contrast: 1, saturation: 1 };
    return (
      <div className="space-y-6 p-4">
        <div>
          <div className="flex justify-between items-center mb-2">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brightness</h4>
             <span className="text-xs text-gray-300">{Math.round(f.brightness * 100)}%</span>
          </div>
          <input type="range" min="-1" max="1" step="0.05" value={f.brightness} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ filters: { ...f, brightness: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contrast</h4>
             <span className="text-xs text-gray-300">{Math.round(f.contrast * 100)}%</span>
          </div>
          <input type="range" min="0" max="2" step="0.05" value={f.contrast} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ filters: { ...f, contrast: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saturation</h4>
             <span className="text-xs text-gray-300">{Math.round(f.saturation * 100)}%</span>
          </div>
          <input type="range" min="0" max="2" step="0.05" value={f.saturation} onPointerDown={handleSliderStart} onPointerUp={handleSliderEnd} onChange={e => onUpdateLive({ filters: { ...f, saturation: parseFloat(e.target.value) } })} className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]" />
        </div>
      </div>
    );
  };

  const renderTextBasic = () => (
    <div className="space-y-6 p-4">
      <div>
        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Content</h4>
        <textarea
          value={clip.text || ""}
          onChange={e => onUpdateLive({ text: e.target.value })}
          onBlur={onCommitLive}
          className="w-full bg-[#0a0a0c] text-white rounded p-2 text-sm border border-[#2b2b36] focus:border-[#ff6b4a] outline-none"
          rows={3}
        />
      </div>
      <div>
        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Style</h4>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-gray-500">Color</span>
          <input 
            type="color" value={clip.color || "#ffffff"}
            onChange={e => onUpdateLive({ color: e.target.value })}
            onBlur={onCommitLive}
            className="w-8 h-8 bg-transparent cursor-pointer rounded"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-500">Font Size</span>
            <span className="text-xs text-gray-300">{clip.fontSizePercent || 50}px</span>
          </div>
          <input 
            type="range" min="10" max="200" step="1" value={clip.fontSizePercent || 50}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={e => onUpdateLive({ fontSizePercent: parseFloat(e.target.value) })}
            className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
          />
        </div>
      </div>
      {renderBasicVideo()}
    </div>
  );

  let tabs: typeof activeTab[] = ["Basic"];
  if (clip.type === "video") tabs = ["Basic", "Audio", "Effects", "Adjust"];
  if (clip.type === "image") tabs = ["Basic", "Effects", "Adjust"];
  if (clip.type === "audio") tabs = ["Audio"];
  if (clip.type === "text") tabs = ["Basic", "Effects"];

  // Fallback if activeTab is not in current tabs
  if (!tabs.includes(activeTab)) {
    setTimeout(() => setActiveTab(tabs[0]), 0);
  }

  return (
    <div className="flex flex-col h-full bg-[#141419]">
       <div className="p-3 border-b border-[#2b2b36] flex items-center gap-2">
         {clip.type === "video" && <Scissors className="w-4 h-4 text-[#ff6b4a]" />}
         {clip.type === "audio" && <Volume2 className="w-4 h-4 text-[#ff6b4a]" />}
         {clip.type === "image" && <ImageIcon className="w-4 h-4 text-[#ff6b4a]" />}
         {clip.type === "text" && <Type className="w-4 h-4 text-[#ff6b4a]" />}
         <h2 className="text-xs font-bold text-white capitalize">{clip.type} Properties</h2>
       </div>
       {renderTabs(tabs)}
       <div className="flex-1 overflow-y-auto">
         {activeTab === "Basic" && clip.type !== "text" && renderBasicVideo()}
         {activeTab === "Basic" && clip.type === "text" && renderTextBasic()}
         {activeTab === "Audio" && renderAudio()}
         {activeTab === "Effects" && renderEffects()}
         {activeTab === "Adjust" && renderAdjust()}
       </div>
    </div>
  );
}
`;

fs.writeFileSync('frontend/app/tools/video-editor/components/TransformInspector.tsx', code);
