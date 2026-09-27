"use client";

import { ImageIcon } from "lucide-react";
import { ImageOverlay } from "@/lib/editor/types";

interface ImageOverlayInspectorProps {
  overlay: ImageOverlay | null;
  duration: number;
  onChange: (patch: Partial<ImageOverlay>) => void;
}

export default function ImageOverlayInspector({ overlay, duration, onChange }: ImageOverlayInspectorProps) {
  if (!overlay) {
    return (
      <div className="text-center text-xs text-slate-400 p-4">
        Select an image overlay on the timeline, or add a new one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <ImageIcon className="w-3.5 h-3.5 text-fuchsia-500" /> Image Overlay
      </h4>

      <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#18181b] p-2 flex justify-center">
        <img src={overlay.url} alt="Overlay preview" className="max-h-24 object-contain" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] text-slate-400">Start (s)</span>
          <input
            type="number"
            min={0}
            max={overlay.end - 0.1}
            step={0.1}
            value={overlay.start}
            onChange={(e) => onChange({ start: Math.max(0, Number(e.target.value)) })}
            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-mono"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400">End (s)</span>
          <input
            type="number"
            min={overlay.start + 0.1}
            max={duration}
            step={0.1}
            value={overlay.end}
            onChange={(e) => onChange({ end: Math.min(duration, Number(e.target.value)) })}
            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
            <span>Position X</span>
            <span>{overlay.xPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={1}
            value={overlay.xPercent}
            onChange={(e) => onChange({ xPercent: Number(e.target.value) })}
            className="w-full accent-fuchsia-500 cursor-pointer"
          />
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
            <span>Position Y</span>
            <span>{overlay.yPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={1}
            value={overlay.yPercent}
            onChange={(e) => onChange({ yPercent: Number(e.target.value) })}
            className="w-full accent-fuchsia-500 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
          <span>Size</span>
          <span>{overlay.widthPercent}% width</span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          step={1}
          value={overlay.widthPercent}
          onChange={(e) => onChange({ widthPercent: Number(e.target.value) })}
          className="w-full accent-fuchsia-500 cursor-pointer"
        />
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
          <span>Opacity</span>
          <span>{Math.round(overlay.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={overlay.opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) })}
          className="w-full accent-fuchsia-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
