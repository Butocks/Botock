import React, { useState } from "react";
import { TimelineClip, EditorProject, TransitionType, MotionPath, MotionDirection, AnimationPreset, AnimationOutPreset, AnimationLoopPreset } from "@/lib/editor/types";
import {
  Scissors, Volume2, Type, Image as ImageIcon, Sliders, Play, Settings, Sparkles,
  Layers, Move, Wand2, Trash2, Zap, ArrowRight, Info, Check, Maximize2, Repeat,
  Compass, ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, ArrowDownLeft, ArrowDown, ArrowDownRight, Clock
} from "lucide-react";

type InspectorTab = "Basic" | "Motion" | "Transitions" | "Effects" | "Audio" | "Text" | "Animation";

interface Props {
  clip: TimelineClip;
  project?: EditorProject;
  onUpdateProject?: (patch: Partial<EditorProject>) => void;
  onUpdateLive: (patch: Partial<TimelineClip>) => void;
  onBeginLive: () => void;
  onCommitLive: () => void;
  onUpdate: (patch: Partial<TimelineClip>) => void;
  onActivateTransformOnCanvas?: () => void;
  onAddEffectToTimeline?: (effectType: string) => void;
  onDeleteClip?: (clipId: string) => void;
  onSeek?: (time: number) => void;
  onPreview?: (time: number, duration?: number) => void;
}

export default function TransformInspector({
  clip,
  project,
  onUpdateProject,
  onUpdateLive,
  onBeginLive,
  onCommitLive,
  onUpdate,
  onActivateTransformOnCanvas,
  onAddEffectToTimeline,
  onDeleteClip,
  onSeek,
  onPreview,
}: Props) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("Basic");
  const [activeTransitionSide, setActiveTransitionSide] = useState<"in" | "out">("in");

  const handleSliderStart = onBeginLive;
  const handleSliderEnd = onCommitLive;

  const renderTabs = (tabs: InspectorTab[]) => (
    <div className="flex bg-[#0a0a0c] p-1 gap-1 border-b border-[#2b2b36]">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActiveTab(t)}
          className={`flex-1 text-[11px] font-bold py-1.5 rounded transition-colors ${
            activeTab === t ? "bg-[#2b2b36] text-white" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );

  const tForm = {
    x: Number.isFinite(clip.transform?.x) ? clip.transform!.x : 50,
    y: Number.isFinite(clip.transform?.y) ? clip.transform!.y : 50,
    scaleX: Number.isFinite(clip.transform?.scaleX) ? clip.transform!.scaleX : 1,
    scaleY: Number.isFinite(clip.transform?.scaleY) ? clip.transform!.scaleY : 1,
    rotation: Number.isFinite(clip.transform?.rotation) ? clip.transform!.rotation : 0,
    opacity: Number.isFinite(clip.transform?.opacity) ? clip.transform!.opacity : 100,
    width: Number.isFinite(clip.transform?.width) ? clip.transform!.width : 100,
    height: Number.isFinite(clip.transform?.height) ? clip.transform!.height : 100,
  };

  // ─── TAB 1: BASIC (Transform & Speed) ───
  const renderBasic = () => (
    <div className="space-y-5 p-3.5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transform</h4>
            <span title="Scale, rotate, and position the clip on canvas." className="text-gray-500 hover:text-gray-300 cursor-pointer">
              <Info className="w-3 h-3" />
            </span>
          </div>
          {onActivateTransformOnCanvas && (
            <button
              type="button"
              onClick={onActivateTransformOnCanvas}
              className="px-2 py-0.5 rounded bg-[#ff6b4a]/20 hover:bg-[#ff6b4a]/30 text-[#ff6b4a] border border-[#ff6b4a]/40 text-[10px] font-bold flex items-center gap-1 transition-all"
            >
              <Move className="w-2.5 h-2.5" />
              <span>Edit on Video</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Scale</span>
            <input
              type="number"
              value={Number.isFinite(tForm.scaleX) ? Math.round(tForm.scaleX * 100) : 100}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                const val = Number.isFinite(num) ? num / 100 : 1;
                onUpdate({ transform: { ...tForm, scaleX: val, scaleY: val } });
              }}
              className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Rotation</span>
            <input
              type="number"
              value={Number.isFinite(tForm.rotation) ? Math.round(tForm.rotation) : 0}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdate({ transform: { ...tForm, rotation: Number.isFinite(num) ? num : 0 } });
              }}
              className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Position X</span>
            <input
              type="number"
              value={Number.isFinite(tForm.x) ? Math.round(tForm.x) : 50}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdate({ transform: { ...tForm, x: Number.isFinite(num) ? num : 50 } });
              }}
              className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500">Position Y</span>
            <input
              type="number"
              value={Number.isFinite(tForm.y) ? Math.round(tForm.y) : 50}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdate({ transform: { ...tForm, y: Number.isFinite(num) ? num : 50 } });
              }}
              className="w-full bg-[#0a0a0c] text-xs p-1.5 rounded border border-[#2b2b36]"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opacity</span>
          <span className="text-xs font-mono text-gray-300">{Number.isFinite(tForm.opacity) ? Math.round(tForm.opacity) : 100}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={Number.isFinite(tForm.opacity) ? Math.round(tForm.opacity) : 100}
          onPointerDown={handleSliderStart}
          onPointerUp={handleSliderEnd}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            onUpdateLive({ transform: { ...tForm, opacity: Number.isFinite(num) ? num : 100 } });
          }}
          className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Playback Speed</span>
          <span className="text-xs font-mono text-white">{(Number.isFinite(clip.speed) ? clip.speed : 1).toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={Number.isFinite(clip.speed) ? clip.speed : 1}
          onPointerDown={handleSliderStart}
          onPointerUp={handleSliderEnd}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            onUpdateLive({ speed: Number.isFinite(num) ? num : 1 });
          }}
          className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
        />
      </div>

      {onUpdateProject && (
        <div className="pt-3 border-t border-[#2b2b36] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Canvas Fill Mode</span>
            <span className="text-[10px] text-cyan-400 font-semibold">{project?.backgroundMode === "blur-fill" || !project?.backgroundMode ? "Blur Fill" : "Black Bars"}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onUpdateProject({ backgroundMode: "blur-fill" })}
              className={`p-2 rounded-lg border text-left transition-all ${
                project?.backgroundMode === "blur-fill" || !project?.backgroundMode
                  ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-white shadow-sm"
                  : "bg-[#0a0a0c] border-[#2b2b36] text-gray-400 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold">Blur Fill</div>
              <div className="text-[9px] text-gray-400 mt-0.5">TikTok / Reels style</div>
            </button>
            <button
              type="button"
              onClick={() => onUpdateProject({ backgroundMode: "black" })}
              className={`p-2 rounded-lg border text-left transition-all ${
                project?.backgroundMode === "black"
                  ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-white shadow-sm"
                  : "bg-[#0a0a0c] border-[#2b2b36] text-gray-400 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold">Black Bars</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Classic letterbox</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ─── TAB 2: TRANSITIONS (Clip Entrance & Exit Scene Cuts) ───
  const renderTransitions = () => {
    const transitionsList: { type: TransitionType; label: string }[] = [
      { type: "none", label: "None" },
      { type: "fade", label: "Crossfade" },
      { type: "dip-black", label: "Dip to Black" },
      { type: "dip-white", label: "Dip to White" },
      { type: "slide-left", label: "Slide Left" },
      { type: "slide-right", label: "Slide Right" },
      { type: "zoom-in", label: "Zoom In" },
      { type: "zoom-out", label: "Zoom Out" },
      { type: "wipeleft", label: "Wipe Left" },
      { type: "wiperight", label: "Wipe Right" },
      { type: "mirror", label: "Mirror Flip" },
      { type: "bounce", label: "Bouncing Pop" },
      { type: "curtain", label: "Curtain Reveal" },
    ];

    const currentIn = clip.transitionIn || "none";
    const currentInDur = clip.transitionInDuration || 0.6;
    const currentOut = clip.transitionOut || "none";
    const currentOutDur = clip.transitionOutDuration || 0.6;

    return (
      <div className="space-y-4 p-3.5">
        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scene Transitions</h4>
              <span title="Transitions apply strictly at clip entrance (In) or cut exit (Out)." className="text-gray-500 hover:text-gray-300 cursor-pointer">
                <Info className="w-3 h-3" />
              </span>
            </div>
            {/* Toggle In / Out */}
            <div className="flex bg-[#0c0c12] p-0.5 rounded-lg border border-[#2b2b36]">
              <button
                type="button"
                onClick={() => setActiveTransitionSide("in")}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeTransitionSide === "in" ? "bg-emerald-500 text-black shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                In ({currentIn.toUpperCase()})
              </button>
              <button
                type="button"
                onClick={() => setActiveTransitionSide("out")}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeTransitionSide === "out" ? "bg-blue-500 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                Out ({currentOut.toUpperCase()})
              </button>
            </div>
          </div>

          {/* Transition Presets Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {transitionsList.map((t) => {
              const active = activeTransitionSide === "in" ? currentIn === t.type : currentOut === t.type;
              return (
                <button
                  key={`${activeTransitionSide}-${t.type}`}
                  onClick={() => {
                    if (activeTransitionSide === "in") {
                      onUpdate({ transitionIn: t.type });
                      if (t.type !== "none") {
                        if (onPreview) onPreview(clip.timelineStart, currentInDur + 0.3);
                        else if (onSeek) onSeek(clip.timelineStart);
                      }
                    } else {
                      onUpdate({ transitionOut: t.type });
                      if (t.type !== "none") {
                        const outStart = Math.max(0, clip.timelineStart + clip.duration - currentOutDur);
                        if (onPreview) onPreview(outStart, currentOutDur + 0.3);
                        else if (onSeek) onSeek(outStart);
                      }
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-left text-[11px] font-semibold border transition-all truncate ${
                    active
                      ? activeTransitionSide === "in"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-sm"
                      : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white"
                  }`}
                >
                  {active ? "✓ " : ""}{t.label}
                </button>
              );
            })}
          </div>

          {/* Duration & Preview Controls */}
          {((activeTransitionSide === "in" && currentIn !== "none") ||
            (activeTransitionSide === "out" && currentOut !== "none")) && (
            <div className="pt-2 border-t border-[#2b2b36] space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">
                  {activeTransitionSide === "in" ? "In Duration" : "Out Duration"}
                </span>
                <span className="text-white font-mono">
                  {(activeTransitionSide === "in" ? currentInDur : currentOutDur).toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max={Math.min(3, Math.max(0.5, clip.duration / 2))}
                step="0.1"
                value={activeTransitionSide === "in" ? currentInDur : currentOutDur}
                onPointerDown={handleSliderStart}
                onPointerUp={handleSliderEnd}
                onChange={(e) => {
                  const num = parseFloat(e.target.value);
                  const val = Number.isFinite(num) ? num : 0.6;
                  if (activeTransitionSide === "in") onUpdateLive({ transitionInDuration: val });
                  else onUpdateLive({ transitionOutDuration: val });
                }}
                className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
              />
              <button
                type="button"
                onClick={() => {
                  if (activeTransitionSide === "in") {
                    if (onPreview) onPreview(clip.timelineStart, currentInDur + 0.3);
                    else if (onSeek) onSeek(clip.timelineStart);
                  } else {
                    const outStart = Math.max(0, clip.timelineStart + clip.duration - currentOutDur);
                    if (onPreview) onPreview(outStart, currentOutDur + 0.3);
                    else if (onSeek) onSeek(outStart);
                  }
                }}
                className="w-full py-1 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#2b2b36]"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Preview Transition</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── DEDICATED TAB: MOTION (Move, Direction Dropdown, Compass, Timer, Styles) ───
  const renderMotion = () => {
    const m = clip.motionPath || {
      enabled: false,
      action: "none",
      direction: "right",
      distance: 40,
      startTime: 0,
      duration: Math.min(1.5, clip.duration),
      startX: tForm.x,
      startY: tForm.y,
      endX: Math.min(95, tForm.x + 30),
      endY: tForm.y,
      pathType: "line",
      rotateWithMotion: false,
    };

    const isEnabled = !!m.enabled;
    const currentAction = m.action || (isEnabled ? "move" : "none");
    const currentDirection: MotionDirection = m.direction || "right";
    const currentDistance = m.distance ?? 40;
    const motionDuration = Number.isFinite(m.duration) ? m.duration! : Math.min(1.5, clip.duration);
    const motionStartTime = Number.isFinite(m.startTime) ? m.startTime! : 0;

    const calcDirectionPoints = (dir: MotionDirection, dist: number) => {
      const cx = tForm.x;
      const cy = tForm.y;
      const half = dist / 2;
      let sx = cx;
      let sy = cy;
      let ex = cx;
      let ey = cy;

      switch (dir) {
        case "right":
          sx = Math.max(5, cx - half);
          ex = Math.min(95, cx + half);
          sy = cy;
          ey = cy;
          break;
        case "left":
          sx = Math.min(95, cx + half);
          ex = Math.max(5, cx - half);
          sy = cy;
          ey = cy;
          break;
        case "up":
          sx = cx;
          ex = cx;
          sy = Math.min(95, cy + half);
          ey = Math.max(5, cy - half);
          break;
        case "down":
          sx = cx;
          ex = cx;
          sy = Math.max(5, cy - half);
          ey = Math.min(95, cy + half);
          break;
        case "up_right":
          sx = Math.max(5, cx - half);
          ex = Math.min(95, cx + half);
          sy = Math.min(95, cy + half);
          ey = Math.max(5, cy - half);
          break;
        case "up_left":
          sx = Math.min(95, cx + half);
          ex = Math.max(5, cx - half);
          sy = Math.min(95, cy + half);
          ey = Math.max(5, cy - half);
          break;
        case "down_right":
          sx = Math.max(5, cx - half);
          ex = Math.min(95, cx + half);
          sy = Math.max(5, cy - half);
          ey = Math.min(95, cy + half);
          break;
        case "down_left":
          sx = Math.min(95, cx + half);
          ex = Math.max(5, cx - half);
          sy = Math.max(5, cy - half);
          ey = Math.min(95, cy + half);
          break;
        case "custom":
          sx = Number.isFinite(m.startX) ? m.startX : cx;
          sy = Number.isFinite(m.startY) ? m.startY : cy;
          ex = Number.isFinite(m.endX) ? m.endX : Math.min(95, cx + 30);
          ey = Number.isFinite(m.endY) ? m.endY : cy;
          break;
      }
      return { startX: Math.round(sx), startY: Math.round(sy), endX: Math.round(ex), endY: Math.round(ey) };
    };

    const updateMotion = (patch: Partial<MotionPath>) => {
      onBeginLive();
      onUpdateLive({
        motionPath: {
          ...m,
          ...patch,
        },
      });
      onCommitLive();
    };

    const handleActionChange = (action: "move" | "none") => {
      if (action === "none") {
        updateMotion({ enabled: false, action: "none" });
      } else {
        const pts = calcDirectionPoints(currentDirection, currentDistance);
        updateMotion({
          enabled: true,
          action: "move",
          direction: currentDirection,
          distance: currentDistance,
          duration: motionDuration,
          startTime: motionStartTime,
          pathType: m.pathType || "line",
          ...pts,
        });
      }
    };

    const handleDirectionSelect = (dir: MotionDirection) => {
      const pts = calcDirectionPoints(dir, currentDistance);
      updateMotion({
        enabled: true,
        action: "move",
        direction: dir,
        ...pts,
      });
      if (onPreview) onPreview(clip.timelineStart + motionStartTime, motionDuration);
      else if (onSeek) onSeek(clip.timelineStart + motionStartTime);
    };

    const handleDistanceChange = (dist: number) => {
      const pts = calcDirectionPoints(currentDirection, dist);
      updateMotion({
        distance: dist,
        ...pts,
      });
    };

    const directionOptions: { id: MotionDirection; label: string; icon: string }[] = [
      { id: "right", label: "Move Right (Left ➔ Right)", icon: "👉" },
      { id: "left", label: "Move Left (Right ➔ Left)", icon: "👈" },
      { id: "up", label: "Move Up (Bottom ➔ Top)", icon: "👆" },
      { id: "down", label: "Move Down (Top ➔ Bottom)", icon: "👇" },
      { id: "up_right", label: "Move Up-Right (Diagonal ↗)", icon: "↗" },
      { id: "up_left", label: "Move Up-Left (Diagonal ↖)", icon: "↖" },
      { id: "down_right", label: "Move Down-Right (Diagonal ↘)", icon: "↘" },
      { id: "down_left", label: "Move Down-Left (Diagonal ↙)", icon: "↙" },
      { id: "custom", label: "Custom Arrow (Drag on Canvas)", icon: "🎯" },
    ];

    return (
      <div className="space-y-4 p-3.5">
        {/* Header & Action Selection */}
        <div className="bg-[#181822] rounded-xl border border-amber-500/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Motion</h4>
              <span title="Animate movement across screen in customizable directions." className="text-gray-500 hover:text-gray-300 cursor-pointer">
                <Info className="w-3 h-3" />
              </span>
            </div>
            {isEnabled && (
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ACTIVE
              </span>
            )}
          </div>

          {/* Action Choice: Move / None */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Motion Action
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleActionChange("move")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  isEnabled && currentAction === "move"
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white"
                }`}
              >
                <span>🏃</span>
                <span>Move</span>
              </button>
              <button
                type="button"
                onClick={() => handleActionChange("none")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  !isEnabled || currentAction === "none"
                    ? "bg-white/10 text-white border-gray-500"
                    : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white"
                }`}
              >
                <span>⏹</span>
                <span>None (Off)</span>
              </button>
            </div>
          </div>
        </div>

        {isEnabled && (
          <>
            {/* Direction Selection: Dropdown & Compass Pad */}
            <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Direction
                </span>
                <span className="text-[10px] text-amber-400 font-mono capitalize">
                  {currentDirection.replace("_", "-")}
                </span>
              </div>

              {/* Dropdown Menu */}
              <div>
                <select
                  value={currentDirection}
                  onChange={(e) => handleDirectionSelect(e.target.value as MotionDirection)}
                  className="w-full bg-[#0a0a0c] border border-[#2b2b36] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {directionOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#181822] text-white">
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Compass 3x3 Button Pad */}
              <div>
                <span className="text-[9px] font-medium text-gray-500 block mb-1">Quick Compass Selector:</span>
                <div className="grid grid-cols-3 gap-1 max-w-[170px] mx-auto bg-[#0a0a0c] p-1.5 rounded-xl border border-[#2b2b36]">
                  {[
                    { id: "up_left" as MotionDirection, icon: <ArrowUpLeft className="w-3.5 h-3.5" />, title: "Up-Left" },
                    { id: "up" as MotionDirection, icon: <ArrowUp className="w-3.5 h-3.5" />, title: "Up" },
                    { id: "up_right" as MotionDirection, icon: <ArrowUpRight className="w-3.5 h-3.5" />, title: "Up-Right" },
                    { id: "left" as MotionDirection, icon: <ArrowLeft className="w-3.5 h-3.5" />, title: "Left" },
                    { id: "custom" as MotionDirection, icon: <span className="text-xs">🎯</span>, title: "Custom" },
                    { id: "right" as MotionDirection, icon: <ArrowRight className="w-3.5 h-3.5" />, title: "Right" },
                    { id: "down_left" as MotionDirection, icon: <ArrowDownLeft className="w-3.5 h-3.5" />, title: "Down-Left" },
                    { id: "down" as MotionDirection, icon: <ArrowDown className="w-3.5 h-3.5" />, title: "Down" },
                    { id: "down_right" as MotionDirection, icon: <ArrowDownRight className="w-3.5 h-3.5" />, title: "Down-Right" },
                  ].map((btn) => {
                    const active = currentDirection === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => handleDirectionSelect(btn.id)}
                        title={btn.title}
                        className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                          active
                            ? "bg-amber-500 text-black shadow-md scale-105 font-bold"
                            : "bg-[#181824] hover:bg-[#202030] text-gray-400 hover:text-white"
                        }`}
                      >
                        {btn.icon}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Motion Timer Controls (Duration & Start Offset) */}
            <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Motion Timer</h5>
              </div>

              {/* Duration Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-amber-400 font-mono font-bold">{motionDuration.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max={Math.max(10, clip.duration)}
                  step="0.1"
                  value={motionDuration}
                  onPointerDown={handleSliderStart}
                  onPointerUp={handleSliderEnd}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 1.0;
                    updateMotion({ duration: val });
                  }}
                  className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Start Delay Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">Start Delay</span>
                  <span className="text-gray-300 font-mono">{motionStartTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, clip.duration - 0.2)}
                  step="0.1"
                  value={motionStartTime}
                  onPointerDown={handleSliderStart}
                  onPointerUp={handleSliderEnd}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    updateMotion({ startTime: val });
                  }}
                  className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Travel Distance */}
              <div className="space-y-1 pt-1 border-t border-[#2b2b36]/70">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">Travel Distance</span>
                  <span className="text-gray-300 font-mono">{currentDistance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={currentDistance}
                  onPointerDown={handleSliderStart}
                  onPointerUp={handleSliderEnd}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 40;
                    handleDistanceChange(val);
                  }}
                  className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex gap-1 pt-1">
                  {[
                    { label: "Subtle (20%)", val: 20 },
                    { label: "Normal (40%)", val: 40 },
                    { label: "Wide (70%)", val: 70 },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => handleDistanceChange(chip.val)}
                      className={`flex-1 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                        currentDistance === chip.val
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                          : "bg-[#0a0a0c] text-gray-500 border-[#2b2b36] hover:text-white"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trajectory & Options */}
            <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Trajectory Curve
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "line" as const, label: "Line" },
                  { id: "arc" as const, label: "Arc ↷" },
                  { id: "zigzag" as const, label: "Zigzag ⚡" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateMotion({ pathType: item.id })}
                    className={`py-1 rounded text-center text-[10px] font-bold border transition-all ${
                      (m.pathType || "line") === item.id
                        ? "bg-amber-500 text-black border-amber-500 shadow-sm"
                        : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!m.rotateWithMotion}
                  onChange={(e) => updateMotion({ rotateWithMotion: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span className="text-[10px] text-gray-300">Rotate in flight direction</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onPreview) onPreview(clip.timelineStart + motionStartTime, motionDuration);
                  else if (onSeek) onSeek(clip.timelineStart + motionStartTime);
                }}
                className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Test Play</span>
              </button>
              {onActivateTransformOnCanvas && (
                <button
                  type="button"
                  onClick={onActivateTransformOnCanvas}
                  className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Move className="w-3 h-3" />
                  <span>Drag on Canvas</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── TAB: EFFECTS (Visual & Camera FX, Color Adjustments, Chroma Key) ───
  const renderEffects = () => {
    const effects = clip.effects || [];

    const stylisticFx = [
      { type: "zoom-in", label: "Smooth Zoom In" },
      { type: "zoom-out", label: "Smooth Zoom Out" },
      { type: "continuous-zoom-in", label: "Continuous Zoom In" },
      { type: "continuous-zoom-out", label: "Continuous Zoom Out" },
      { type: "pan-left", label: "Pan Left" },
      { type: "pan-right", label: "Pan Right" },
      { type: "blur", label: "Blur Defocus" },
      { type: "glitch", label: "Glitch Shake" },
      { type: "anime-shake", label: "Impact Shake" },
      { type: "mirror", label: "Mirror Flip" },
      { type: "dutch-tilt", label: "Dutch Tilt Roll" },
      { type: "white-flash", label: "White Hit Flash" },
      { type: "anime-speed-lines", label: "Speed Lines" },
      { type: "pulse-beat", label: "Pulse Beat" },
    ];

    const handleApplyEffect = (type: string) => {
      if (onAddEffectToTimeline) {
        onAddEffectToTimeline(type);
      } else {
        const has = effects.some((e) => e.type === type);
        if (has) onUpdate({ effects: effects.filter((e) => e.type !== type) });
        else onUpdate({ effects: [...effects, { id: `eff-${Date.now()}`, type, intensity: 1, duration: clip.duration }] });
      }
    };

    const chromaPresets = [
      { color: "#00ff00", label: "Green" },
      { color: "#0000ff", label: "Blue" },
      { color: "#ffffff", label: "White" },
      { color: "#000000", label: "Black" },
    ];

    const f: { brightness: number; contrast: number; saturation: number; vignette: number; hueRotate: number } = {
      brightness: typeof clip.filters?.brightness === "number" ? clip.filters.brightness : 0,
      contrast: typeof clip.filters?.contrast === "number" ? clip.filters.contrast : 1,
      saturation: typeof clip.filters?.saturation === "number" ? clip.filters.saturation : 1,
      vignette: typeof clip.filters?.vignette === "number" ? clip.filters.vignette : 0,
      hueRotate: typeof clip.filters?.hueRotate === "number" ? clip.filters.hueRotate : 0,
    };

    return (
      <div className="space-y-4 p-3.5">
        {/* 1. VISUAL & CAMERA EFFECTS ON TIMELINE FX TRACK */}
        <div className="bg-[#181822] rounded-xl border border-pink-500/30 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Visual & Camera FX</h4>
            </div>
            <span title="Click an effect to create an adjustable effect block on the FX track on the timeline." className="text-gray-500 hover:text-gray-300 cursor-pointer">
              <Info className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Click any effect to place an adjustable 2.0s block on the FX track on the timeline.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {stylisticFx.map(({ type, label }) => {
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleApplyEffect(type)}
                  className="p-2 rounded-lg text-left text-[11px] font-semibold border transition-all truncate bg-[#0a0a0c] border-[#2b2b36] hover:border-pink-500/60 hover:bg-pink-500/10 text-gray-300 hover:text-white flex items-center justify-between group"
                >
                  <span className="truncate">{label}</span>
                  <span className="text-[9px] text-pink-400 font-bold opacity-75 group-hover:opacity-100">+ FX</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. COLOR ADJUSTMENTS & COLOR GRADING PRESETS */}
        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Color Grading & Pro LUTs</h4>
            </div>
            <button
              type="button"
              onClick={() => onUpdate({ filters: { brightness: 0, contrast: 1, saturation: 1, vignette: 0, hueRotate: 0 } })}
              className="text-[10px] text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>

          {/* 1-Click Pro Color Grading & LUT Presets */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 pb-1">
            {[
              { id: "normal", label: "Normal", b: 0, c: 1, s: 1, v: 0, h: 0 },
              { id: "vibrant", label: "Vibrant", b: 0.05, c: 1.2, s: 1.4, v: 0, h: 0 },
              { id: "cinematic", label: "Cinematic", b: -0.05, c: 1.25, s: 0.85, v: 15, h: 0 },
              { id: "warm", label: "Warm Sun", b: 0.08, c: 1.1, s: 1.25, v: 0, h: -10 },
              { id: "cool", label: "Cool Blue", b: 0, c: 1.15, s: 0.85, v: 0, h: 15 },
              { id: "noir", label: "B&W Noir", b: 0.05, c: 1.4, s: 0, v: 25, h: 0 },
              { id: "cyberpunk", label: "Cyberpunk", b: 0.06, c: 1.35, s: 1.6, v: 20, h: 45 },
              { id: "vintage-90s", label: "Vintage 90s", b: 0.08, c: 0.95, s: 0.75, v: 40, h: -5 },
              { id: "golden-hour", label: "Golden Hour", b: 0.1, c: 1.15, s: 1.3, v: 10, h: -20 },
              { id: "matrix-green", label: "Matrix Green", b: 0.02, c: 1.3, s: 1.1, v: 15, h: 90 },
              { id: "high-contrast", label: "High Contrast", b: -0.02, c: 1.6, s: 1.2, v: 0, h: 0 },
              { id: "dreamy-glow", label: "Dreamy Glow", b: 0.15, c: 0.9, s: 1.15, v: 0, h: 5 },
              { id: "muted-film", label: "Muted Film", b: -0.04, c: 1.1, s: 0.65, v: 30, h: 0 },
            ].map((p) => {
              const isSelected =
                Math.abs(f.brightness - p.b) < 0.02 &&
                Math.abs(f.contrast - p.c) < 0.02 &&
                Math.abs(f.saturation - p.s) < 0.02 &&
                Math.abs(f.vignette - p.v) < 5 &&
                Math.abs(f.hueRotate - p.h) < 5;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    onUpdate({
                      filters: {
                        brightness: p.b,
                        contrast: p.c,
                        saturation: p.s,
                        vignette: p.v,
                        hueRotate: p.h,
                      },
                    })
                  }
                  className={`py-1.5 px-2 rounded-lg text-left text-[10px] font-semibold border transition-all truncate ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm"
                      : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-gray-400">Brightness</span>
              <span className="text-gray-300 font-mono">{Math.round(f.brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={f.brightness}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdateLive({ filters: { ...f, brightness: Number.isFinite(num) ? num : 0 } });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-gray-400">Contrast</span>
              <span className="text-gray-300 font-mono">{Math.round(f.contrast * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={f.contrast}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdateLive({ filters: { ...f, contrast: Number.isFinite(num) ? num : 1 } });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-gray-400">Saturation</span>
              <span className="text-gray-300 font-mono">{Math.round(f.saturation * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={f.saturation}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdateLive({ filters: { ...f, saturation: Number.isFinite(num) ? num : 1 } });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-gray-400">Vignette</span>
              <span className="text-gray-300 font-mono">{Math.round(f.vignette)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={f.vignette}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdateLive({ filters: { ...f, vignette: Number.isFinite(num) ? num : 0 } });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-gray-400">Hue Rotate</span>
              <span className="text-gray-300 font-mono">{Math.round(f.hueRotate)}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={f.hueRotate}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdateLive({ filters: { ...f, hueRotate: Number.isFinite(num) ? num : 0 } });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>
        </div>

        {/* 4. CHROMA KEY */}
        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Chroma Key</h4>
            </div>
            <div
              onClick={() =>
                onUpdate({
                  chromaKey: {
                    ...(clip.chromaKey || { color: "#00ff00", similarity: 0.3, blend: 0.1, spillReduction: 0 }),
                    enabled: !clip.chromaKey?.enabled,
                  },
                })
              }
              className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${
                clip.chromaKey?.enabled ? "bg-[#ff6b4a]" : "bg-[#2b2b36]"
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${
                  clip.chromaKey?.enabled ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </div>
          {clip.chromaKey?.enabled && (
            <div className="space-y-2 pt-1 border-t border-[#2b2b36]">
              <div className="flex gap-1.5">
                {chromaPresets.map(({ color, label }) => (
                  <button
                    key={color}
                    title={label}
                    onClick={() =>
                      onUpdate({
                        chromaKey: {
                          ...(clip.chromaKey || { similarity: 0.3, blend: 0.1, spillReduction: 0 }),
                          color,
                          enabled: true,
                        },
                      })
                    }
                    className={`flex-1 h-5 rounded border ${
                      clip.chromaKey?.color === color ? "border-[#ff6b4a] scale-105" : "border-[#2b2b36]"
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── TAB 4: AUDIO ───
  const renderAudio = () => {
    const vol = Number.isFinite(clip.audio?.volumePercent) ? clip.audio!.volumePercent : 100;
    const fadeI = Number.isFinite(clip.audio?.fadeInSeconds) ? clip.audio!.fadeInSeconds : 0;
    const fadeO = Number.isFinite(clip.audio?.fadeOutSeconds) ? clip.audio!.fadeOutSeconds : 0;
    const isMuted = clip.audio?.muted ?? false;

    return (
      <div className="space-y-4 p-3.5">
        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Volume</h4>
            <span className="text-xs font-mono text-gray-300">{isMuted ? "Muted" : `${vol}%`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={isMuted ? 0 : vol}
            onPointerDown={handleSliderStart}
            onPointerUp={handleSliderEnd}
            onChange={(e) => {
              const num = parseFloat(e.target.value);
              onUpdateLive({
                audio: {
                  ...(clip.audio || { muted: false, fadeInSeconds: 0, fadeOutSeconds: 0 }),
                  volumePercent: Number.isFinite(num) ? num : 100,
                  muted: false,
                },
              });
            }}
            className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
          />
          <button
            onClick={() =>
              onUpdate({
                audio: {
                  ...(clip.audio || { volumePercent: 100, fadeInSeconds: 0, fadeOutSeconds: 0 }),
                  muted: !isMuted,
                },
              })
            }
            className={`w-full py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              isMuted ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-[#0a0a0c] text-gray-300 border-[#2b2b36]"
            }`}
          >
            {isMuted ? "Unmute Audio" : "Mute Audio"}
          </button>
        </div>

        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fades</h4>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Fade In</span>
              <span className="text-gray-300 font-mono">{fadeI.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={fadeI}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdateLive({
                  audio: {
                    ...(clip.audio || { volumePercent: 100, muted: false, fadeOutSeconds: 0 }),
                    fadeInSeconds: Number.isFinite(num) ? num : 0,
                  },
                });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Fade Out</span>
              <span className="text-gray-300 font-mono">{fadeO.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={fadeO}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onUpdateLive({
                  audio: {
                    ...(clip.audio || { volumePercent: 100, muted: false, fadeInSeconds: 0 }),
                    fadeOutSeconds: Number.isFinite(num) ? num : 0,
                  },
                });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>
        </div>
      </div>
    );
  };

  // ─── TAB FOR TEXT / SUBTITLES ───
  const renderText = () => (
    <div className="space-y-4 p-3.5">
      <div>
        <h4 className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Text / Sticker Content</h4>
        <textarea
          value={clip.text || ""}
          placeholder="Type subtitle or emoji sticker here..."
          onChange={(e) => onUpdateLive({ text: e.target.value })}
          onBlur={onCommitLive}
          className="w-full bg-[#0a0a0c] text-white rounded-lg p-2 text-xs border border-[#2b2b36] focus:border-[#ff6b4a] outline-none resize-none font-medium"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] text-gray-400 block mb-1">Color</span>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={clip.color || "#ffe600"}
              onChange={(e) => onUpdateLive({ color: e.target.value })}
              onBlur={onCommitLive}
              className="w-6 h-6 bg-transparent cursor-pointer rounded border-0"
            />
            <span className="text-[10px] font-mono text-gray-300">{clip.color || "#ffe600"}</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-gray-400 block mb-1">Font Size</span>
          <input
            type="number"
            value={clip.fontSizePercent || 48}
            onChange={(e) => onUpdateLive({ fontSizePercent: parseFloat(e.target.value) || 48 })}
            onBlur={onCommitLive}
            className="w-full bg-[#0a0a0c] text-xs p-1 rounded border border-[#2b2b36]"
          />
        </div>
      </div>
    </div>
  );

  // ─── TAB: 60FPS KEYFRAME ENTRANCE, EXIT & LOOP ANIMATIONS ───
  const renderAnimation = () => {
    const currentAnim = clip.animationIn || "none";
    const animDur = clip.animationDuration ?? 0.6;
    const currentAnimOut = clip.animationOut || "none";
    const animOutDur = clip.animationOutDuration ?? 0.6;
    const currentLoop = clip.animationLoop || "none";
    const loopSpeed = clip.animationLoopSpeed ?? 1.0;
    const isTypewriter = clip.textAnimation === "typewriter";
    const typewriterSpeed = clip.typewriterSpeed || 15;
    const movement = clip.textMovement || "none";

    const animationPresets: { id: AnimationPreset; label: string; desc: string; icon: string }[] = [
      { id: "none", label: "None", desc: "No entrance animation", icon: "⏹️" },
      { id: "fade-in", label: "Fade In", desc: "Smooth opacity fade", icon: "✨" },
      { id: "zoom-in", label: "Zoom In", desc: "Scale up into frame", icon: "🔍" },
      { id: "zoom-out", label: "Zoom Out", desc: "Dramatic scale-down reveal", icon: "🔎" },
      { id: "slide-up", label: "Slide Up", desc: "Smooth bottom-up entrance", icon: "⬆️" },
      { id: "slide-down", label: "Slide Down", desc: "Drop from top", icon: "⬇️" },
      { id: "slide-left", label: "Slide Left", desc: "Glide from right", icon: "⬅️" },
      { id: "slide-right", label: "Slide Right", desc: "Swoop in from left", icon: "➡️" },
      { id: "pop-bounce", label: "Pop Bounce", desc: "Snappy punch overshoot", icon: "💥" },
      { id: "spin-in", label: "Spin In", desc: "Rotate & scale reveal", icon: "💫" },
      { id: "whip-pan", label: "Whip Pan", desc: "Fast swoosh with blur", icon: "⚡" },
      { id: "elastic-scale", label: "Elastic Scale", desc: "Springy overshoot bounce", icon: "🌀" },
      { id: "blur-reveal", label: "Blur Reveal", desc: "Cinematic focal unblur", icon: "🌫️" },
    ];

    const animationOutPresets: { id: AnimationOutPreset; label: string; desc: string; icon: string }[] = [
      { id: "none", label: "None", desc: "No exit animation", icon: "⏹️" },
      { id: "fade-out", label: "Fade Out", desc: "Smooth opacity fade", icon: "✨" },
      { id: "zoom-out", label: "Zoom Out", desc: "Scale down departure", icon: "🔎" },
      { id: "zoom-in-out", label: "Zoom Punch", desc: "Zoom punch & vanish", icon: "🔍" },
      { id: "slide-down", label: "Slide Down", desc: "Drop out of frame", icon: "⬇️" },
      { id: "slide-up", label: "Slide Up", desc: "Fly up out of frame", icon: "⬆️" },
      { id: "slide-left", label: "Slide Left", desc: "Slide out to left", icon: "⬅️" },
      { id: "slide-right", label: "Slide Right", desc: "Slide out to right", icon: "➡️" },
      { id: "pop-out", label: "Pop Out", desc: "Punch & shrink exit", icon: "💥" },
      { id: "spin-out", label: "Spin Out", desc: "Whirl away & disappear", icon: "💫" },
    ];

    const animationLoopPresets: { id: AnimationLoopPreset; label: string; desc: string; icon: string }[] = [
      { id: "none", label: "None", desc: "No loop motion", icon: "⏹️" },
      { id: "pulse-beat", label: "Pulse Beat", desc: "Rhythmic heartbeat pulse", icon: "💓" },
      { id: "floating", label: "Floating Hover", desc: "Gentle levitation drift", icon: "🎈" },
      { id: "handheld-shake", label: "Handheld Shake", desc: "Organic camera wobble", icon: "📱" },
      { id: "pendulum-swing", label: "Pendulum Swing", desc: "Harmonic pendulum tilt", icon: "🕰️" },
      { id: "glitch-jitter", label: "Glitch Jitter", desc: "Cyberpunk micro-jitter", icon: "👾" },
      { id: "slow-ken-burns", label: "Ken Burns", desc: "Slow cinematic push-in", icon: "🎬" },
      { id: "spin-continuous", label: "Continuous 360", desc: "Smooth endless rotation", icon: "🔄" },
      { id: "breathe", label: "Gentle Breathe", desc: "Calm inhaling scale", icon: "🌊" },
    ];

    return (
      <div className="space-y-4 p-3.5">
        {/* 1. 1-Click Keyframe Entrance Animation Presets */}
        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b4a]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Entrance (In)</h4>
            </div>
            <span
              title="Real-time 60fps keyframe entrance animations calculated instantly on canvas."
              className="text-gray-500 hover:text-gray-300 cursor-pointer"
            >
              <Info className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Choose a dynamic entrance preset with zero-lag 60fps canvas playback.
          </p>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {animationPresets.map(({ id, label, desc, icon }) => {
              const isSelected = currentAnim === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ animationIn: id })}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    isSelected
                      ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-white shadow-sm"
                      : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white hover:border-[#3b3b4a]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">{icon}</span>
                    <span className="text-[11px] font-bold text-gray-200">{label}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 truncate">{desc}</div>
                </button>
              );
            })}
          </div>

          {currentAnim !== "none" && (
            <div className="pt-2 border-t border-[#2b2b36] space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Animation Duration</span>
                <span className="text-[#ff6b4a] font-mono font-bold">{animDur.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={animDur}
                onPointerDown={handleSliderStart}
                onPointerUp={handleSliderEnd}
                onChange={(e) => {
                  const num = parseFloat(e.target.value);
                  onUpdateLive({ animationDuration: Number.isFinite(num) ? num : 0.6 });
                }}
                className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
              />
            </div>
          )}

          {/* Test Play Animation */}
          <button
            type="button"
            onClick={() => {
              if (onPreview) onPreview(clip.timelineStart, animDur + 0.3);
              else if (onSeek) onSeek(clip.timelineStart);
            }}
            className="w-full py-1.5 mt-1 rounded bg-[#ff6b4a]/15 hover:bg-[#ff6b4a]/25 text-[#ff6b4a] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#ff6b4a]/30"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test Play Entrance</span>
          </button>
        </div>

        {/* 2. 1-Click Keyframe Exit Animation Presets */}
        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Exit (Out)</h4>
            </div>
            <span
              title="Real-time 60fps keyframe exit animations calculated on canvas as clip ends."
              className="text-gray-500 hover:text-gray-300 cursor-pointer"
            >
              <Info className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Choose an exit preset to transition smoothly into the next scene.
          </p>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {animationOutPresets.map(({ id, label, desc, icon }) => {
              const isSelected = currentAnimOut === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ animationOut: id })}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    isSelected
                      ? "bg-rose-500/20 border-rose-500 text-white shadow-sm"
                      : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white hover:border-[#3b3b4a]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">{icon}</span>
                    <span className="text-[11px] font-bold text-gray-200">{label}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 truncate">{desc}</div>
                </button>
              );
            })}
          </div>

          {currentAnimOut !== "none" && (
            <div className="pt-2 border-t border-[#2b2b36] space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Exit Duration</span>
                <span className="text-rose-400 font-mono font-bold">{animOutDur.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={animOutDur}
                onPointerDown={handleSliderStart}
                onPointerUp={handleSliderEnd}
                onChange={(e) => {
                  const num = parseFloat(e.target.value);
                  onUpdateLive({ animationOutDuration: Number.isFinite(num) ? num : 0.6 });
                }}
                className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          )}

          {/* Test Play Exit Animation */}
          <button
            type="button"
            onClick={() => {
              const previewStart = Math.max(clip.timelineStart, clip.timelineStart + clip.duration - animOutDur - 0.2);
              if (onPreview) onPreview(previewStart, animOutDur + 0.3);
              else if (onSeek) onSeek(previewStart);
            }}
            className="w-full py-1.5 mt-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test Play Exit</span>
          </button>
        </div>

        {/* 3. Continuous Loop Animation Presets */}
        <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Loop Motion</h4>
            </div>
            <span
              title="Continuous looping motion applied seamlessly across the entire clip duration."
              className="text-gray-500 hover:text-gray-300 cursor-pointer"
            >
              <Info className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Choose an endless loop motion (Ken Burns, Shake, Pulse, Float) that plays smoothly for the entire clip.
          </p>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {animationLoopPresets.map(({ id, label, desc, icon }) => {
              const isSelected = currentLoop === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ animationLoop: id })}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500 text-white shadow-sm"
                      : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white hover:border-[#3b3b4a]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">{icon}</span>
                    <span className="text-[11px] font-bold text-gray-200">{label}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 truncate">{desc}</div>
                </button>
              );
            })}
          </div>

          {currentLoop !== "none" && (
            <div className="pt-2 border-t border-[#2b2b36] space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400">Loop Speed</span>
                <span className="text-emerald-400 font-mono font-bold">{loopSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={loopSpeed}
                onPointerDown={handleSliderStart}
                onPointerUp={handleSliderEnd}
                onChange={(e) => {
                  const num = parseFloat(e.target.value);
                  onUpdateLive({ animationLoopSpeed: Number.isFinite(num) ? num : 1.0 });
                }}
                className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          {/* Test Play Loop Animation */}
          <button
            type="button"
            onClick={() => {
              if (onPreview) onPreview(clip.timelineStart, Math.min(3, clip.duration));
              else if (onSeek) onSeek(clip.timelineStart);
            }}
            className="w-full py-1.5 mt-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/30"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test Play Loop</span>
          </button>
        </div>

        {/* Text-specific animations if clip is text */}
        {clip.type === "text" && (
          <>
            {/* Typewriter Effect */}
            <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Typewriter Effect</h4>
                  <span title="Animates text character by character progressively." className="text-gray-500 hover:text-gray-300 cursor-pointer">
                    <Info className="w-3 h-3" />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({
                      textAnimation: isTypewriter ? "none" : "typewriter",
                      typewriterSpeed: isTypewriter ? undefined : 15,
                    })
                  }
                  className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                    isTypewriter ? "bg-amber-500" : "bg-[#2b2b36]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                      isTypewriter ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {isTypewriter && (
                <div className="pt-2 border-t border-[#2b2b36] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">Typing Speed</span>
                    <span className="text-amber-400 font-mono font-bold">{typewriterSpeed} chars/s</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="1"
                    value={typewriterSpeed}
                    onPointerDown={handleSliderStart}
                    onPointerUp={handleSliderEnd}
                    onChange={(e) => onUpdateLive({ typewriterSpeed: parseInt(e.target.value) || 15 })}
                    className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Text Movement */}
            <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Text Movement</h4>
                  <span title="Moves the text box across screen." className="text-gray-500 hover:text-gray-300 cursor-pointer">
                    <Info className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "none", label: "Static" },
                  { id: "slide-left-to-right", label: "👉 Left to Right" },
                  { id: "slide-right-to-left", label: "👈 Right to Left" },
                  { id: "slide-bottom-to-top", label: "👆 Bottom to Top" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdate({ textMovement: id as any })}
                    className={`p-1.5 rounded-lg text-left text-[11px] font-semibold border transition-all truncate ${
                      movement === id
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-sm"
                        : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white"
                    }`}
                  >
                    {movement === id ? "✓ " : ""}{label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── DEDICATED PANEL FOR TIMELINE EFFECT CLIPS ───
  const renderEffectClip = () => {
    const eff = clip.effects?.[0] || { id: `eff-${clip.id}`, type: clip.text?.toLowerCase() || "zoom-in", intensity: 1, duration: clip.duration };
    const effType = (eff.type || clip.text?.toLowerCase() || "zoom-in").trim();
    const intensity = eff.intensity ?? 1;

    const effectOptions = [
      { id: "zoom-in", label: "Smooth Zoom In" },
      { id: "zoom-out", label: "Smooth Zoom Out" },
      { id: "continuous-zoom-in", label: "Continuous Zoom In" },
      { id: "continuous-zoom-out", label: "Continuous Zoom Out" },
      { id: "pan-left", label: "Pan Left" },
      { id: "pan-right", label: "Pan Right" },
      { id: "blur", label: "Blur Defocus" },
      { id: "glitch", label: "Glitch Shake" },
      { id: "anime-shake", label: "Impact Shake" },
      { id: "mirror", label: "Mirror Flip" },
      { id: "dutch-tilt", label: "Dutch Tilt Roll" },
      { id: "anime-speed-lines", label: "Speed Lines" },
      { id: "white-flash", label: "White Hit Flash" },
      { id: "pulse-beat", label: "Pulse Beat" },
    ];

    return (
      <div className="flex flex-col h-full bg-[#141419]">
        <div className="p-2.5 border-b border-[#2b2b36] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Effect Block Settings</h2>
          </div>
          {onDeleteClip && (
            <button
              onClick={() => onDeleteClip(clip.id)}
              className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete Effect Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Effect Type Switcher */}
          <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Effect Type
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {effectOptions.map((opt) => {
                const active = effType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onUpdate({
                        text: opt.id.toUpperCase(),
                        effects: [{ id: `eff-${Date.now()}`, type: opt.id, intensity, duration: clip.duration }],
                      });
                    }}
                    className={`p-1.5 rounded-lg text-left text-[11px] font-semibold border transition-all truncate ${
                      active
                        ? "bg-pink-500/20 text-pink-300 border-pink-500/60 shadow-sm"
                        : "bg-[#0a0a0c] text-gray-400 border-[#2b2b36] hover:text-white"
                    }`}
                  >
                    {active ? "✓ " : ""}{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Slider (Direct Effect Handles Controller) */}
          <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 uppercase tracking-wider font-semibold">Effect Duration</span>
              <span className="text-pink-400 font-mono font-bold">{clip.duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="10"
              step="0.1"
              value={clip.duration}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 2.0;
                onUpdateLive({
                  duration: val,
                  sourceEnd: val,
                  effects: [{ ...eff, duration: val }],
                });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <p className="text-[9px] text-gray-500">
              Drag the handles on the timeline effect block to increase or decrease duration directly.
            </p>
          </div>

          {/* Intensity Slider */}
          <div className="bg-[#181822] rounded-xl border border-[#2b2b36] p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 uppercase tracking-wider font-semibold">Intensity</span>
              <span className="text-white font-mono">{Math.round(intensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={intensity}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 1;
                onUpdateLive({
                  effects: [{ ...eff, intensity: val }],
                });
              }}
              className="w-full h-1 bg-[#2b2b36] rounded-lg appearance-none cursor-pointer accent-[#ff6b4a]"
            />
          </div>

          {/* Test Play & Delete */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onPreview) onPreview(clip.timelineStart, clip.duration);
                else if (onSeek) onSeek(clip.timelineStart);
              }}
              className="w-full py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Test Play Effect</span>
            </button>

            {onDeleteClip && (
              <button
                type="button"
                onClick={() => onDeleteClip(clip.id)}
                className="w-full py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Effect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── TAB ROUTING ───
  if (clip.type === "effect") {
    return renderEffectClip();
  }

  let tabs: InspectorTab[] = ["Basic"];
  if (clip.type === "video" || clip.type === "image") tabs = ["Basic", "Animation", "Motion", "Effects", "Transitions", "Audio"];
  if (clip.type === "text") tabs = ["Text", "Animation", "Motion", "Basic"];
  if (clip.type === "audio") tabs = ["Audio"];

  if (!tabs.includes(activeTab)) {
    setTimeout(() => setActiveTab(tabs[0]), 0);
  }

  return (
    <div className="flex flex-col h-full bg-[#141419]">
      <div className="p-2.5 border-b border-[#2b2b36] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {clip.type === "video" && <Scissors className="w-3.5 h-3.5 text-[#ff6b4a]" />}
          {clip.type === "audio" && <Volume2 className="w-3.5 h-3.5 text-[#ff6b4a]" />}
          {clip.type === "image" && <ImageIcon className="w-3.5 h-3.5 text-[#ff6b4a]" />}
          {clip.type === "text" && <Type className="w-3.5 h-3.5 text-[#ff6b4a]" />}
          <h2 className="text-xs font-bold text-white capitalize">{clip.type} Properties</h2>
        </div>
        {onDeleteClip && (
          <button
            onClick={() => onDeleteClip(clip.id)}
            className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete Clip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {renderTabs(tabs)}

      <div className="flex-1 overflow-y-auto">
        {activeTab === "Basic" && renderBasic()}
        {activeTab === "Animation" && renderAnimation()}
        {activeTab === "Motion" && renderMotion()}
        {activeTab === "Transitions" && renderTransitions()}
        {activeTab === "Effects" && renderEffects()}
        {activeTab === "Audio" && renderAudio()}
        {activeTab === "Text" && renderText()}
      </div>
    </div>
  );
}
