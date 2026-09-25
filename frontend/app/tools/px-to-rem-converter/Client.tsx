"use client";

import { useState } from "react";
import {
  Ruler,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Table,
} from "lucide-react";

export default function PxToRemConverterClient() {
  const [baseSize, setBaseSize] = useState<number>(16);
  const [pxValue, setPxValue] = useState<string>("16");
  const [remValue, setRemValue] = useState<string>("1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handlePxChange = (val: string) => {
    setPxValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && baseSize > 0) {
      setRemValue((num / baseSize).toFixed(4).replace(/\.?0+$/, ""));
    } else {
      setRemValue("");
    }
  };

  const handleRemChange = (val: string) => {
    setRemValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPxValue((num * baseSize).toFixed(2).replace(/\.?0+$/, ""));
    } else {
      setPxValue("");
    }
  };

  const handleBaseChange = (newBase: number) => {
    setBaseSize(newBase);
    const num = parseFloat(pxValue);
    if (!isNaN(num) && newBase > 0) {
      setRemValue((num / newBase).toFixed(4).replace(/\.?0+$/, ""));
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Standard sizes table
  const standardPxSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64, 80, 96];

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Ruler className="w-3.5 h-3.5" />
            Responsive Typography Calculator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            PX to REM & EM Converter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Bidirectional real-time conversion between pixels and relative REM units with configurable base root font size.
          </p>
        </div>

        {/* Base Font Size Configuration Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-8 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
              Root Font Size (Base):
            </span>
            <div className="flex items-center gap-1.5">
              {[14, 16, 18].map((b) => (
                <button
                  key={b}
                  onClick={() => handleBaseChange(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    baseSize === b
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {b}px
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Custom Base:</label>
            <input
              type="number"
              min="1"
              max="64"
              value={baseSize}
              onChange={(e) => handleBaseChange(parseFloat(e.target.value) || 16)}
              className="w-16 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono text-xs text-purple-400 focus:outline-none focus:border-purple-500"
            />
            <span className="text-xs text-slate-500 font-mono">px</span>
          </div>
        </div>

        {/* Live Two-Way Converter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-center">
          {/* PX Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                Pixels (PX)
              </span>
              <button
                onClick={() => handleCopy("px", `${pxValue}px`)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === "px" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === "px" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={pxValue}
                onChange={(e) => handlePxChange(e.target.value)}
                placeholder="16"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-white focus:outline-none focus:border-purple-500 transition"
              />
              <span className="text-sm font-mono text-slate-500 font-bold">PX</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              CSS: <span className="font-mono text-purple-300">font-size: {pxValue || 0}px;</span>
            </p>
          </div>

          {/* REM Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                Relative REM
              </span>
              <button
                onClick={() => handleCopy("rem", `${remValue}rem`)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === "rem" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === "rem" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.0625"
                value={remValue}
                onChange={(e) => handleRemChange(e.target.value)}
                placeholder="1"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-purple-300 focus:outline-none focus:border-purple-500 transition"
              />
              <span className="text-sm font-mono text-slate-500 font-bold">REM</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              CSS: <span className="font-mono text-purple-300">font-size: {remValue || 0}rem;</span>
            </p>
          </div>
        </div>

        {/* Conversion Cheat Sheet Table */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-purple-400" />
              Standard Typography Scale (Base {baseSize}px)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {standardPxSizes.map((px) => {
              const rem = (px / baseSize).toFixed(4).replace(/\.?0+$/, "");
              return (
                <button
                  key={px}
                  onClick={() => handlePxChange(px.toString())}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center transition group cursor-pointer"
                >
                  <span className="text-xs text-slate-400 group-hover:text-purple-300 font-mono">
                    {px}px
                  </span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5">
                    {rem}rem
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
