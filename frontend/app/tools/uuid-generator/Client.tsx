"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState } from "react";
import {
  Fingerprint,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Sliders,
} from "lucide-react";

export default function UuidGeneratorClient() {
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [wrapQuotes, setWrapQuotes] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);

  const generateUuid = (): string => {
    let uuid = "";
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      // Fallback
      uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    if (!hyphens) {
      uuid = uuid.replace(/-/g, "");
    }

    if (uppercase) {
      uuid = uuid.toUpperCase();
    }

    if (wrapQuotes) {
      uuid = `"${uuid}"`;
    }

    return uuid;
  };

  const generateBatch = (count: number): string[] => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generateUuid());
    }
    return list;
  };

  const [uuids, setUuids] = useState<string[]>(() => generateBatch(5));

  const handleRegenerate = () => {
    setUuids(generateBatch(quantity));
  };

  const handleCopyAll = () => {
    copyToClipboard(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (u: string) => {
    copyToClipboard(u);
    setCopiedSingle(u);
    setTimeout(() => setCopiedSingle(null), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${uuids.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Fingerprint className="w-3.5 h-3.5" />
            RFC 4122 Compliant v4 UUID
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bulk UUID v4 Generator Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Generate cryptographically secure Universally Unique Identifiers (UUID v4) directly in your browser.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Quantity Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                  Quantity
                </label>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {quantity} UUIDs
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => {
                  const q = parseInt(e.target.value);
                  setQuantity(q);
                  setUuids(generateBatch(q));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Formatting Options */}
            <div className="flex flex-wrap items-center gap-5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => {
                    setUppercase(e.target.checked);
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Uppercase
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={hyphens}
                  onChange={(e) => {
                    setHyphens(e.target.checked);
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Include Hyphens (-)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={wrapQuotes}
                  onChange={(e) => {
                    setWrapQuotes(e.target.checked);
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                Wrap in Quotes ("")
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800/60">
            <button
              onClick={handleRegenerate}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Regenerate Batch
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Generated Identifiers ({uuids.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? "Copied All!" : "Copy All"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download List
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {uuids.map((u, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition group"
              >
                <span className="font-mono text-xs sm:text-sm text-purple-300 select-all">
                  {u}
                </span>
                <button
                  onClick={() => handleCopySingle(u)}
                  className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-slate-800 text-slate-500 group-hover:text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedSingle === u ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
