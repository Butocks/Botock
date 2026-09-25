"use client";

import { useState, useMemo } from "react";
import {
  Pipette,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
} from "lucide-react";

export default function HexToRgbClient() {
  const [hex, setHex] = useState<string>("#8b5cf6");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const conversions = useMemo(() => {
    let cleanHex = hex.replace("#", "").trim();
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split("")
        .map((x) => x + x)
        .join("");
    }

    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return null;
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    // RGB to CMYK
    let k = 1 - Math.max(rNorm, gNorm, bNorm);
    let c = (1 - rNorm - k) / (1 - k) || 0;
    let m = (1 - gNorm - k) / (1 - k) || 0;
    let y = (1 - bNorm - k) / (1 - k) || 0;

    const cPct = Math.round(c * 100);
    const mPct = Math.round(m * 100);
    const yPct = Math.round(y * 100);
    const kPct = Math.round(k * 100);

    return [
      { id: "hex", name: "HEX", value: `#${cleanHex.toUpperCase()}` },
      { id: "rgb", name: "RGB", value: `rgb(${r}, ${g}, ${b})` },
      { id: "rgba", name: "RGBA", value: `rgba(${r}, ${g}, ${b}, 1)` },
      { id: "hsl", name: "HSL", value: `hsl(${hDeg}, ${sPct}%, ${lPct}%)` },
      { id: "cmyk", name: "CMYK", value: `cmyk(${cPct}%, ${mPct}%, ${yPct}%, ${kPct}%)` },
      { id: "cssVar", name: "CSS RGB Channels", value: `${r} ${g} ${b}` },
    ];
  }, [hex]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Pipette className="w-3.5 h-3.5" />
            Color Space Conversion
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            HEX to RGB, HSL & CMYK Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert color codes between HEX, RGB, HSL, and print-ready CMYK formats in real-time.
          </p>
        </div>

        {/* Input & Swatch Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
              style={{ backgroundColor: conversions ? conversions[0].value : "#8b5cf6" }}
              className="w-24 h-24 rounded-2xl border border-white/20 shadow-2xl shrink-0 transition-colors"
            />
            <div className="flex-1 w-full">
              <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block mb-2">
                Enter HEX Color Code
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={conversions ? conversions[0].value : "#8b5cf6"}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-0.5 shrink-0"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="#8B5CF6"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl font-mono text-lg font-bold text-white focus:outline-none focus:border-purple-500 uppercase transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formats Grid */}
        {conversions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversions.map((conv) => (
              <div
                key={conv.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {conv.name}
                  </span>
                  <button
                    onClick={() => handleCopy(conv.id, conv.value)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === conv.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 font-mono text-xs sm:text-sm text-purple-300 break-all select-all">
                  {conv.value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl text-xs text-rose-400">
            Please enter a valid 3-digit or 6-digit hex color code (e.g. #8b5cf6).
          </div>
        )}
      </div>
    </div>
  );
}
