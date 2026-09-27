"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  ArrowRightLeft,
  Globe,
  MapPin,
  CalendarDays,
} from "lucide-react";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function TimestampConverterClient() {
  const [userTz, setUserTz] = useState<string>("UTC");
  const [selectedTz, setSelectedTz] = useState<string>("UTC");

  const [currentEpochSec, setCurrentEpochSec] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  );

  // Tab: "epoch-to-date" or "date-to-epoch"
  const [activeTab, setActiveTab] = useState<"epoch-to-date" | "date-to-epoch">("epoch-to-date");

  // Mode 1: Epoch to Date
  const [inputEpoch, setInputEpoch] = useState<string>(() =>
    Math.floor(Date.now() / 1000).toString()
  );
  const [isMilliseconds, setIsMilliseconds] = useState<boolean>(false);

  // Mode 2: Date to Epoch
  const [inputDate, setInputDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto-detect browser timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setUserTz(detected);
        setSelectedTz(detected);
      }
    } catch {
      // fallback to UTC
    }
  }, []);

  // Live timer for current epoch
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpochSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (id: string, text: string) => {
    copyToClipboard(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSetCurrent = () => {
    const now = Date.now();
    setInputEpoch(isMilliseconds ? now.toString() : Math.floor(now / 1000).toString());
  };

  // Parsed date from epoch
  const parsedDate = useMemo(() => {
    const num = parseFloat(inputEpoch.trim());
    if (isNaN(num)) return null;
    const ms = isMilliseconds ? num : num * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }, [inputEpoch, isMilliseconds]);

  // Relative time string
  const relativeTime = useMemo(() => {
    if (!parsedDate) return "";
    const diffSec = Math.round((parsedDate.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
    const diffHr = Math.round(diffMin / 60);
    if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
    const diffDays = Math.round(diffHr / 24);
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
    return rtf.format(Math.round(diffDays / 30), "month");
  }, [parsedDate]);

  // Date to Epoch calculation
  const calculatedEpoch = useMemo(() => {
    if (!inputDate) return null;
    const d = new Date(inputDate);
    if (isNaN(d.getTime())) return null;
    return {
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    };
  }, [inputDate]);

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
            Two-way bidirectional conversion between timestamps and human dates with automatic local timezone detection.
          </p>
        </div>

        {/* Live Current Epoch Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Detected Timezone: <strong>{userTz}</strong></span>
            </div>

            <button
              onClick={() => handleCopy("current", currentEpochSec.toString())}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === "current" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedKey === "current" ? "Copied" : "Copy Epoch"}
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
            <button
              onClick={() => setActiveTab("epoch-to-date")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "epoch-to-date"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Timestamp → Human Date
            </button>
            <button
              onClick={() => setActiveTab("date-to-epoch")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "date-to-epoch"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Human Date → Timestamp
            </button>
          </div>
        </div>

        {/* Tab 1: Timestamp to Date */}
        {activeTab === "epoch-to-date" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                  Enter Unix Epoch Timestamp
                </span>
                <button
                  onClick={handleSetCurrent}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Set to Current Time
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="text"
                  value={inputEpoch}
                  onChange={(e) => setInputEpoch(e.target.value)}
                  placeholder="e.g. 1774850000"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl font-mono text-xl text-purple-300 font-bold focus:outline-none focus:border-purple-500"
                />
                <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => setIsMilliseconds(false)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${
                      !isMilliseconds ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Seconds (s)
                  </button>
                  <button
                    onClick={() => setIsMilliseconds(true)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${
                      isMilliseconds ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Milliseconds (ms)
                  </button>
                </div>
              </div>

              {/* Timezone Selector for comparisons */}
              <div className="pt-2 flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-400">Target Timezone:</span>
                <select
                  value={selectedTz}
                  onChange={(e) => setSelectedTz(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz} {tz === userTz ? "(Your Detected Timezone)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {parsedDate ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "local_detected",
                    label: `Your Local Time (${userTz})`,
                    val: parsedDate.toLocaleString("en-US", { timeZone: userTz }),
                  },
                  {
                    id: "target_tz",
                    label: `Selected Timezone (${selectedTz})`,
                    val: parsedDate.toLocaleString("en-US", { timeZone: selectedTz }),
                  },
                  {
                    id: "utc",
                    label: "UTC (Coordinated Universal Time)",
                    val: parsedDate.toUTCString(),
                  },
                  {
                    id: "iso",
                    label: "ISO 8601 (Universal)",
                    val: parsedDate.toISOString(),
                  },
                  {
                    id: "relative",
                    label: "Relative Time",
                    val: relativeTime,
                  },
                  {
                    id: "epoch_seconds",
                    label: "Epoch Seconds / Milliseconds",
                    val: `${Math.floor(parsedDate.getTime() / 1000)}s / ${parsedDate.getTime()}ms`,
                  },
                ].map((fmt) => (
                  <div
                    key={fmt.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
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
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-purple-300 break-all select-all">
                      {fmt.val}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
                Please enter a valid numeric timestamp.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Date to Timestamp */}
        {activeTab === "date-to-epoch" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider block">
                Select Date and Time
              </span>

              <input
                type="datetime-local"
                step="1"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {calculatedEpoch && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Unix Timestamp (Seconds)
                    </span>
                    <button
                      onClick={() => handleCopy("sec", calculatedEpoch.seconds.toString())}
                      className="px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-white"
                    >
                      {copiedKey === "sec" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xl font-bold text-purple-300">
                    {calculatedEpoch.seconds}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Unix Timestamp (Milliseconds)
                    </span>
                    <button
                      onClick={() => handleCopy("ms", calculatedEpoch.milliseconds.toString())}
                      className="px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-white"
                    >
                      {copiedKey === "ms" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xl font-bold text-emerald-300">
                    {calculatedEpoch.milliseconds}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
