"use client";

import { useState } from "react";
import {
  Palette,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Lock,
  Unlock,
  Sliders,
} from "lucide-react";

interface ColorItem {
  id: string;
  hex: string;
  isLocked: boolean;
}

export default function ColorPaletteGeneratorClient() {
  const getRandomHex = () =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  const [colors, setColors] = useState<ColorItem[]>([
    { id: "1", hex: "#0f172a", isLocked: false },
    { id: "2", hex: "#3b82f6", isLocked: false },
    { id: "3", hex: "#8b5cf6", isLocked: false },
    { id: "4", hex: "#ec4899", isLocked: false },
    { id: "5", hex: "#f43f5e", isLocked: false },
  ]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [exportModal, setExportModal] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  const handleGenerate = () => {
    setColors(
      colors.map((c) => (c.isLocked ? c : { ...c, hex: getRandomHex() }))
    );
  };

  const toggleLock = (id: string) => {
    setColors(
      colors.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c))
    );
  };

  const updateColor = (id: string, hex: string) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, hex } : c)));
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const cssVariables = `:root {\n${colors
    .map((c, idx) => `  --color-${idx + 1}: ${c.hex};`)
    .join("\n")}\n}`;

  const handleCopyExport = () => {
    navigator.clipboard.writeText(cssVariables);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Palette className="w-3.5 h-3.5" />
            Harmonic Color Theory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Color Palette Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Generate gorgeous color schemes and export instantly to CSS variables and Tailwind palettes.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Generate New Scheme
          </button>

          <button
            onClick={() => setExportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Palette
          </button>
        </div>

        {/* Palette Canvas Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {colors.map((c, idx) => (
            <div
              key={c.id}
              className="group relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col h-96 transition-transform hover:-translate-y-1"
            >
              {/* Swatch */}
              <div
                style={{ backgroundColor: c.hex }}
                className="flex-1 w-full relative flex items-center justify-center p-4 cursor-pointer"
                onClick={() => handleCopyHex(c.hex)}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-black/40 backdrop-blur-md text-white text-xs flex items-center gap-1">
                  {copiedHex === c.hex ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedHex === c.hex ? "Copied" : "Click to Copy"}
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="bg-slate-950/90 p-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateColor(c.id, e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0 block mb-1"
                  />
                  <span className="font-mono text-xs uppercase font-bold text-white tracking-wider">
                    {c.hex}
                  </span>
                </div>

                <button
                  onClick={() => toggleLock(c.id)}
                  title={c.isLocked ? "Unlock Color" : "Lock Color"}
                  className={`p-2 rounded-xl transition ${
                    c.isLocked
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                      : "text-slate-500 hover:text-white bg-slate-900"
                  }`}
                >
                  {c.isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Export Modal / Drawer */}
        {exportModal && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Export CSS Custom Properties
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyExport}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25"
                >
                  {copiedExport ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedExport ? "Copied!" : "Copy CSS"}
                </button>
                <button
                  onClick={() => setExportModal(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-purple-300 whitespace-pre">
              {cssVariables}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
