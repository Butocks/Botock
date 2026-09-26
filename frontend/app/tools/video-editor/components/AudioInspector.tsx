"use client";

import { Volume2, VolumeX, Music } from "lucide-react";
import { AudioTrack } from "@/lib/editor/types";

interface AudioInspectorProps {
  track: AudioTrack | null;
  onChange: (patch: Partial<AudioTrack>) => void;
}

export default function AudioInspector({ track, onChange }: AudioInspectorProps) {
  if (!track) {
    return (
      <div className="text-center text-xs text-slate-400 p-4">
        Select an audio/music clip on the timeline to edit it.
      </div>
    );
  }

  const trackDuration = track.trimEnd - track.trimStart;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Music className="w-3.5 h-3.5 text-violet-500" /> {track.label}
      </h4>

      <button
        onClick={() => onChange({ muted: !track.muted })}
        className={`w-full py-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-2 ${
          track.muted ? "bg-rose-500/10 border-rose-400 text-rose-500" : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
        }`}
      >
        {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        {track.muted ? "Unmute" : "Mute"}
      </button>

      {!track.muted && (
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Volume</span>
            <span>{track.volumePercent}%</span>
          </div>
          <input
            type="range" min={0} max={300} step={5}
            value={track.volumePercent}
            onChange={(e) => onChange({ volumePercent: Number(e.target.value) })}
            className="w-full accent-violet-500"
          />
        </div>
      )}

      <div>
        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Fade In</span>
          <span>{track.fadeInSeconds.toFixed(1)}s</span>
        </div>
        <input
          type="range" min={0} max={Math.min(5, trackDuration / 2)} step={0.1}
          value={track.fadeInSeconds}
          onChange={(e) => onChange({ fadeInSeconds: Number(e.target.value) })}
          className="w-full accent-violet-500"
        />
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Fade Out</span>
          <span>{track.fadeOutSeconds.toFixed(1)}s</span>
        </div>
        <input
          type="range" min={0} max={Math.min(5, trackDuration / 2)} step={0.1}
          value={track.fadeOutSeconds}
          onChange={(e) => onChange({ fadeOutSeconds: Number(e.target.value) })}
          className="w-full accent-violet-500"
        />
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Trim within source</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Start (s)</span>
            <input
              type="number" min={0} max={track.trimEnd - 0.2} step={0.1}
              value={track.trimStart}
              onChange={(e) => onChange({ trimStart: Math.max(0, Number(e.target.value)) })}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">End (s)</span>
            <input
              type="number" min={track.trimStart + 0.2} max={track.sourceDuration} step={0.1}
              value={track.trimEnd}
              onChange={(e) => onChange({ trimEnd: Math.min(track.sourceDuration, Number(e.target.value)) })}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}