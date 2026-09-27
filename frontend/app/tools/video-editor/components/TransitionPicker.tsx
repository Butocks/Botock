"use client";

import { useState, useRef, useEffect } from "react";
import { Shuffle } from "lucide-react";
import { TransitionType } from "@/lib/editor/types";

const OPTIONS: { id: TransitionType; label: string }[] = [
  { id: "none", label: "Cut (None)" },
  { id: "fade", label: "Crossfade" },
  { id: "wipeleft", label: "Wipe Left ←" },
  { id: "wiperight", label: "Wipe Right →" },
  { id: "slideup", label: "Slide Up ↑" },
];

interface TransitionPickerProps {
  leftPercent: number;
  value: TransitionType;
  duration: number;
  onChange: (type: TransitionType, duration: number) => void;
}

export default function TransitionPicker({ leftPercent, value, duration, onChange }: TransitionPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="absolute top-2 z-30 pointer-events-auto"
      style={{ left: `${leftPercent}%`, transform: "translateX(-50%)" }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`flex items-center justify-center h-6 w-6 rounded-full shadow-lg transition-all cursor-pointer ${
          value === "none"
            ? "bg-slate-700/80 hover:bg-slate-600 text-slate-300"
            : "bg-amber-500 hover:bg-amber-400 text-white ring-2 ring-amber-400/50"
        }`}
        title={`Transition: ${value === "none" ? "None (Cut)" : value}`}
      >
        <Shuffle className="h-3 w-3" />
      </button>

      {open && (
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-44 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[9px] text-slate-400 uppercase font-bold mb-1.5 px-1 tracking-wider">
            Clip Transition
          </p>
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id, duration);
                setOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold mb-0.5 transition-colors cursor-pointer flex items-center justify-between ${
                value === opt.id
                  ? "bg-amber-500 text-white font-bold"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.id && <span className="text-[10px]">✓</span>}
            </button>
          ))}
          {value !== "none" && (
            <div className="px-1 pt-2 mt-1.5 border-t border-white/10">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                <span>Duration</span>
                <span className="text-amber-400 font-bold">{duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.1}
                value={duration}
                onChange={(e) => onChange(value, Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
