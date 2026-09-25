"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  ArrowRightLeft,
  Globe,
} from "lucide-react";

export default function TimestampConverterClient() {
  const [currentEpochSec, setCurrentEpochSec] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  );
  const [inputEpoch, setInputEpoch] = useState<string>(() =>
    Math.floor(Date.now() / 1000).toString()
  );
  const [isMilliseconds, setIsMilliseconds] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live timer for current epoch
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpochSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parsedDate = (() => {
    const num = parseFloat(inputEpoch);
    if (isNaN(num)) return null;
    const ms = isMilliseconds ? num : num * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  })();

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSetCurrent = () => {
    const now = Date.now();
    setInputEpoch(isMilliseconds ? now.toString() : Math.floor(now / 1000).toString());
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            Temporal Epoch Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Unix Epoch & Timestamp Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert Unix epoch timestamps to human-readable dates (UTC, ISO 8601, and local timezone) in real-time.
          </p>
        </div>

        {/* Live Current Epoch Banner */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-8 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
              Current Unix Timestamp:
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-white">
              {currentEpochSec}
            </span>
          </div>

          <button
            onClick={() => handleCopy("current", currentEpochSec.toString())}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedKey === "current" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedKey === "current" ? "Copied" : "Copy Epoch"}
          </button>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enter Timestamp
            </span>
            <button
              onClick={handleSetCurrent}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Current Time
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              placeholder="e.g. 1774396800"
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 font-mono text-lg font-bold text-white focus:outline-none focus:border-purple-500 transition"
            />
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700/60 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsMilliseconds(false)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium transition ${
                  !isMilliseconds
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Seconds (s)
              </button>
              <button
                onClick={() => setIsMilliseconds(true)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium transition ${
                  isMilliseconds
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Milliseconds (ms)
              </button>
            </div>
          </div>
        </div>

        {/* Output Time Formats */}
        {parsedDate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "iso",
                label: "ISO 8601 (Universal)",
                val: parsedDate.toISOString(),
              },
              {
                id: "utc",
                label: "UTC String",
                val: parsedDate.toUTCString(),
              },
              {
                id: "local",
                label: "Local Time",
                val: parsedDate.toString(),
              },
              {
                id: "localeDate",
                label: "Locale Date String",
                val: parsedDate.toLocaleString(),
              },
            ].map((fmt) => (
              <div
                key={fmt.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {fmt.label}
                  </span>
                  <button
                    onClick={() => handleCopy(fmt.id, fmt.val)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === fmt.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 font-mono text-xs sm:text-sm text-purple-300 break-all select-all">
                  {fmt.val}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl text-xs text-slate-500">
            Please enter a valid numeric Unix timestamp.
          </div>
        )}
      </div>
    </div>
  );
}
