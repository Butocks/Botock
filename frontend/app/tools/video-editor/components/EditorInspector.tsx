"use client";

import { RotateCw, FlipHorizontal, FlipVertical, Volume2, VolumeX, Gauge, Sliders } from "lucide-react";
import { EditorClip, ClipRotation } from "@/lib/editor/types";

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];

const COLOR_PRESETS = [
  { id: "normal", label: "Normal", brightness: 0, contrast: 1, saturation: 1 },
  { id: "vibrant", label: "Vibrant", brightness: 0.05, contrast: 1.2, saturation: 1.5 },
  { id: "cinematic", label: "Cinematic", brightness: -0.05, contrast: 1.35, saturation: 1.15 },
  { id: "noir", label: "B&W Noir", brightness: 0.05, contrast: 1.3, saturation: 0 },
  { id: "warm", label: "Warm", brightness: 0.08, contrast: 1.05, saturation: 1.2 },
];

interface EditorInspectorProps {
  clip: EditorClip | null;
  onChange: (patch: Partial<EditorClip>) => void;
}

export default function EditorInspector({ clip, onChange }: EditorInspectorProps) {
  if (!clip) {
    return (
      <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-400 p-6">
        Select a clip on the timeline to edit it.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transform */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-emerald-500" /> Transform
        </h4>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {([0, 90, 180, 270] as ClipRotation[]).map((r) => (
            <button
              key={r}
              onClick={() => onChange({ rotation: r })}
              className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${
                clip.rotation === r
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
              }`}
            >
              {r}°
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onChange({ flipH: !clip.flipH })}
            className={`py-2 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
              clip.flipH ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
          </button>
          <button
            onClick={() => onChange({ flipV: !clip.flipV })}
            className={`py-2 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
              clip.flipV ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" /> Flip V
          </button>
        </div>
      </div>

      {/* Speed */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-emerald-500" /> Speed ({clip.speed.toFixed(2)}x)
        </h4>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {SPEED_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ speed: s })}
              className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                clip.speed === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.05}
          value={clip.speed}
          onChange={(e) => onChange({ speed: Number(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      {/* Color */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Color
        </h4>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                onChange({ filters: { brightness: p.brightness, contrast: p.contrast, saturation: p.saturation } })
              }
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-2.5 text-[11px]">
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Brightness</span>
              <span>{Math.round(clip.filters.brightness * 100)}%</span>
            </div>
            <input
              type="range" min={-0.5} max={0.5} step={0.05}
              value={clip.filters.brightness}
              onChange={(e) => onChange({ filters: { ...clip.filters, brightness: Number(e.target.value) } })}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Contrast</span>
              <span>{Math.round(clip.filters.contrast * 100)}%</span>
            </div>
            <input
              type="range" min={0.5} max={2} step={0.05}
              value={clip.filters.contrast}
              onChange={(e) => onChange({ filters: { ...clip.filters, contrast: Number(e.target.value) } })}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Saturation</span>
              <span>{Math.round(clip.filters.saturation * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={2.5} step={0.1}
              value={clip.filters.saturation}
              onChange={(e) => onChange({ filters: { ...clip.filters, saturation: Number(e.target.value) } })}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Audio */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          {clip.muted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
          Audio ({clip.muted ? "Muted" : `${clip.volumePercent}%`})
        </h4>
        <button
          onClick={() => onChange({ muted: !clip.muted })}
          className={`w-full mb-2 py-2 rounded-lg text-[11px] font-bold border transition-all ${
            clip.muted ? "bg-rose-500/10 border-rose-400 text-rose-500" : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
          }`}
        >
          {clip.muted ? "Unmute Clip" : "Mute Clip"}
        </button>
        {!clip.muted && (
          <input
            type="range" min={0} max={500} step={10}
            value={clip.volumePercent}
            onChange={(e) => onChange({ volumePercent: Number(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        )}
      </div>
    </div>
  );
}