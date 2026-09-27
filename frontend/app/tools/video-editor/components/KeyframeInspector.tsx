"use client";

import { Move3d } from "lucide-react";
import { KenBurnsConfig, KenBurnsDirection } from "@/lib/editor/types";

const DIRECTIONS: { id: KenBurnsDirection; label: string }[] = [
  { id: "center", label: "Center" },
  { id: "top-left", label: "↖ Top-Left" },
  { id: "top-right", label: "↗ Top-Right" },
  { id: "bottom-left", label: "↙ Bottom-Left" },
  { id: "bottom-right", label: "↘ Bottom-Right" },
];

interface KeyframeInspectorProps {
  config: KenBurnsConfig;
  onChange: (patch: Partial<KenBurnsConfig>) => void;
}

export default function KeyframeInspector({ config, onChange }: KeyframeInspectorProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Move3d className="w-3.5 h-3.5 text-cyan-500" /> Ken Burns Pan &amp; Zoom
        </h4>
        <button
          type="button"
          onClick={() => onChange({ enabled: !config.enabled })}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
            config.enabled ? "bg-cyan-500 text-white" : "bg-slate-100 dark:bg-white/[0.06] text-slate-500"
          }`}
        >
          {config.enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {config.enabled && (
        <>
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
              <span>Start Zoom</span>
              <span>{config.startZoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={2}
              step={0.05}
              value={config.startZoom}
              onChange={(e) => onChange({ startZoom: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
              <span>End Zoom</span>
              <span>{config.endZoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={2}
              step={0.05}
              value={config.endZoom}
              onChange={(e) => onChange({ endZoom: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Pan Direction</span>
            <div className="grid grid-cols-3 gap-1.5">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onChange({ direction: d.id })}
                  className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                    config.direction === d.id
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-white/[0.05]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
