"use client";

import { useState, useMemo } from "react";
import {
  Palette,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
} from "lucide-react";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const PRESETS = [
  { name: "Neon Purple", colors: ["#9333ea", "#3b82f6"] },
  { name: "Sunset Blaze", colors: ["#f43f5e", "#fb923c"] },
  { name: "Cyberpunk", colors: ["#ec4899", "#8b5cf6", "#06b6d4"] },
  { name: "Emerald Mint", colors: ["#10b981", "#06b6d4"] },
  { name: "Midnight Sky", colors: ["#0f172a", "#1e1b4b", "#312e81"] },
  { name: "Gold Luxury", colors: ["#f59e0b", "#d97706", "#78350f"] },
];

export default function GradientGeneratorClient() {
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState<number>(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: "1", color: "#9333ea", position: 0 },
    { id: "2", color: "#3b82f6", position: 100 },
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  const gradientCssValue = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");

    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else {
      return `radial-gradient(circle, ${stopsStr})`;
    }
  }, [gradientType, angle, stops]);

  const fullCssRule = `background: ${gradientCssValue};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCssRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddStop = () => {
    if (stops.length >= 5) return;
    const newStop: ColorStop = {
      id: Math.random().toString(),
      color: "#ec4899",
      position: 50,
    };
    setStops([...stops, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleUpdateStop = (id: string, updates: Partial<ColorStop>) => {
    setStops(
      stops.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleApplyPreset = (presetColors: string[]) => {
    const step = 100 / (presetColors.length - 1);
    const newStops = presetColors.map((color, idx) => ({
      id: Math.random().toString(),
      color,
      position: Math.round(idx * step),
    }));
    setStops(newStops);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Palette className="w-3.5 h-3.5" />
            CSS Gradient Lab
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CSS Gradient Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Design stunning multi-stop linear and radial gradients with live previews and one-click CSS exports.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 backdrop-blur-sm">
            {/* Type & Angle */}
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-2">
                  Gradient Type
                </label>
                <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
                  <button
                    onClick={() => setGradientType("linear")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                      gradientType === "linear"
                        ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Linear Gradient
                  </button>
                  <button
                    onClick={() => setGradientType("radial")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                      gradientType === "radial"
                        ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Radial Gradient
                  </button>
                </div>
              </div>

              {gradientType === "linear" && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-300">Angle Direction</span>
                    <span className="font-mono text-purple-400">{angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Color Stops */}
            <div className="space-y-3 pt-3 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Color Stops ({stops.length}/5)
                </span>
                <button
                  onClick={handleAddStop}
                  disabled={stops.length >= 5}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Color
                </button>
              </div>

              <div className="space-y-2.5">
                {stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
                  >
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) =>
                        handleUpdateStop(stop.id, { color: e.target.value })
                      }
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer p-0 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                        <span className="font-mono uppercase">{stop.color}</span>
                        <span>{stop.position}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) =>
                          handleUpdateStop(stop.id, {
                            position: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                    {stops.length > 2 && (
                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="pt-3 border-t border-slate-800/60">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                Quick Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(p.colors)}
                    style={{
                      background: `linear-gradient(135deg, ${p.colors.join(", ")})`,
                    }}
                    className="h-10 rounded-xl border border-white/10 hover:scale-105 transition shadow text-xs font-semibold text-white flex items-center justify-center text-center px-1"
                  >
                    <span className="drop-shadow-md text-[10px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview & Output Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visual Canvas Box */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <div
                style={{ background: gradientCssValue }}
                className="w-full h-72 rounded-2xl shadow-2xl flex items-center justify-center p-4 transition-all duration-200"
              />
            </div>

            {/* CSS Code Box */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  CSS Code
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied CSS!" : "Copy CSS"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 font-mono text-xs text-purple-300 whitespace-pre-wrap select-all">
                {fullCssRule}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
