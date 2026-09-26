"use client";

import { Type, AlignStartVertical, AlignCenterVertical, AlignEndVertical } from "lucide-react";
import { TextOverlay, TextOverlayAnchor } from "@/lib/editor/types";

interface TextOverlayInspectorProps {
  overlay: TextOverlay | null;
  duration: number;
  onChange: (patch: Partial<TextOverlay>) => void;
}

const ANCHORS: { id: TextOverlayAnchor; icon: typeof AlignStartVertical; label: string }[] = [
  { id: "top", icon: AlignStartVertical, label: "Top" },
  { id: "center", icon: AlignCenterVertical, label: "Center" },
  { id: "bottom", icon: AlignEndVertical, label: "Bottom" },
];

export default function TextOverlayInspector({ overlay, duration, onChange }: TextOverlayInspectorProps) {
  if (!overlay) {
    return (
      <div className="text-center text-xs text-slate-400 p-4">
        Select a text overlay on the timeline, or add a new one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Type className="w-3.5 h-3.5 text-amber-500" /> Text Overlay
      </h4>

      <textarea
        value={overlay.text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs resize-none"
        placeholder="Enter caption text..."
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] text-slate-400">Start (s)</span>
          <input
            type="number" min={0} max={overlay.end - 0.1} step={0.1}
            value={overlay.start}
            onChange={(e) => onChange({ start: Math.max(0, Number(e.target.value)) })}
            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400">End (s)</span>
          <input
            type="number" min={overlay.start + 0.1} max={duration} step={0.1}
            value={overlay.end}
            onChange={(e) => onChange({ end: Math.min(duration, Number(e.target.value)) })}
            className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs"
          />
        </div>
      </div>

      <div>
        <span className="text-[10px] text-slate-400 block mb-1.5">Position</span>
        <div className="grid grid-cols-3 gap-1.5">
          {ANCHORS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onChange({ anchor: id })}
              className={`py-2 rounded-lg text-[10px] font-bold border flex flex-col items-center gap-1 transition-all ${
                overlay.anchor === id ? "bg-amber-500 text-white border-amber-500" : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Font Size</span>
          <span>{overlay.fontSizePercent}% of height</span>
        </div>
        <input
          type="range" min={2} max={15} step={0.5}
          value={overlay.fontSizePercent}
          onChange={(e) => onChange({ fontSizePercent: Number(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-500">Color</span>
        <input
          type="color"
          value={overlay.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-10 h-7 rounded cursor-pointer border border-slate-200 dark:border-white/[0.08]"
        />
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Background Box Opacity</span>
          <span>{Math.round(overlay.backgroundOpacity * 100)}%</span>
        </div>
        <input
          type="range" min={0} max={1} step={0.05}
          value={overlay.backgroundOpacity}
          onChange={(e) => onChange({ backgroundOpacity: Number(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>
    </div>
  );
}