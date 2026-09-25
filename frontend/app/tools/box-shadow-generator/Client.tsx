"use client";

import { useState, useMemo } from "react";
import {
  Layers,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
} from "lucide-react";

export default function BoxShadowGeneratorClient() {
  const [hOffset, setHOffset] = useState<number>(0);
  const [vOffset, setVOffset] = useState<number>(10);
  const [blur, setBlur] = useState<number>(25);
  const [spread, setSpread] = useState<number>(-5);
  const [shadowColor, setShadowColor] = useState<string>("#9333ea");
  const [opacity, setOpacity] = useState<number>(0.35);
  const [isInset, setIsInset] = useState<boolean>(false);
  const [boxColor, setBoxColor] = useState<string>("#1e293b");
  const [copied, setCopied] = useState<boolean>(false);

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    let c = hex.replace("#", "");
    if (c.length === 3) {
      c = c
        .split("")
        .map((x) => x + x)
        .join("");
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const shadowCss = useMemo(() => {
    const rgba = hexToRgba(shadowColor, opacity);
    const insetStr = isInset ? "inset " : "";
    return `${insetStr}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${rgba}`;
  }, [hOffset, vOffset, blur, spread, shadowColor, opacity, isInset]);

  const fullCssRule = `box-shadow: ${shadowCss};\n-webkit-box-shadow: ${shadowCss};\n-moz-box-shadow: ${shadowCss};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCssRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setHOffset(0);
    setVOffset(10);
    setBlur(25);
    setSpread(-5);
    setShadowColor("#9333ea");
    setOpacity(0.35);
    setIsInset(false);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Visual CSS Shadow Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CSS Box Shadow Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Visually design soft realistic drop shadows, elevation layers, and inner glow effects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                Shadow Parameters
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Horizontal Offset */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Horizontal Offset (X)</span>
                <span className="font-mono text-purple-400">{hOffset}px</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={hOffset}
                onChange={(e) => setHOffset(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Vertical Offset */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Vertical Offset (Y)</span>
                <span className="font-mono text-purple-400">{vOffset}px</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={vOffset}
                onChange={(e) => setVOffset(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Blur Radius */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Blur Radius</span>
                <span className="font-mono text-purple-400">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={blur}
                onChange={(e) => setBlur(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Spread Radius */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Spread Radius</span>
                <span className="font-mono text-purple-400">{spread}px</span>
              </div>
              <input
                type="range"
                min="-40"
                max="60"
                value={spread}
                onChange={(e) => setSpread(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Color & Opacity */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Shadow Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer p-0.5"
                  />
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {shadowColor}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Opacity</span>
                  <span className="font-mono text-purple-400">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
                />
              </div>
            </div>

            {/* Inset toggle */}
            <div className="pt-2 border-t border-slate-800/60">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={isInset}
                  onChange={(e) => setIsInset(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Inset Shadow (Inner Shadow)
              </label>
            </div>
          </div>

          {/* Interactive Preview & CSS Output Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visual Canvas Box */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 flex items-center justify-center min-h-[320px] shadow-xl overflow-hidden relative">
              <div
                style={{
                  boxShadow: shadowCss,
                  backgroundColor: boxColor,
                }}
                className="w-48 h-48 rounded-3xl flex items-center justify-center text-center p-4 transition-all duration-150 cursor-pointer group select-none"
              >
                <div className="text-xs font-semibold text-slate-300 group-hover:text-white transition">
                  Interactive Object
                </div>
              </div>
            </div>

            {/* Generated CSS Box */}
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
