"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CalendarClock,
} from "lucide-react";

interface Preset {
  category: string;
  label: string;
  exp: string;
}

const PRESETS: Preset[] = [
  { category: "Minutes", label: "Every minute", exp: "* * * * *" },
  { category: "Minutes", label: "Every 5 minutes", exp: "*/5 * * * *" },
  { category: "Minutes", label: "Every 15 minutes", exp: "*/15 * * * *" },
  { category: "Minutes", label: "Every 30 minutes", exp: "*/30 * * * *" },
  { category: "Hourly", label: "Hourly at minute 0", exp: "0 * * * *" },
  { category: "Hourly", label: "Every 2 hours", exp: "0 */2 * * *" },
  { category: "Hourly", label: "Every 6 hours", exp: "0 */6 * * *" },
  { category: "Daily", label: "Daily at midnight (00:00)", exp: "0 0 * * *" },
  { category: "Daily", label: "Daily at 09:00 AM", exp: "0 9 * * *" },
  { category: "Daily", label: "Daily at 12:00 PM (Noon)", exp: "0 12 * * *" },
  { category: "Daily", label: "Weekdays (Mon-Fri) at 09:00", exp: "0 9 * * 1-5" },
  { category: "Weekly", label: "Every Sunday at midnight", exp: "0 0 * * 0" },
  { category: "Weekly", label: "Every Monday at 08:00 AM", exp: "0 8 * * 1" },
  { category: "Monthly", label: "1st of every month at midnight", exp: "0 0 1 * *" },
  { category: "Monthly", label: "Quarterly (Jan, Apr, Jul, Oct)", exp: "0 0 1 1,4,7,10 *" },
];

function matchPart(val: number, expr: string, min: number, max: number): boolean {
  if (expr === "*") return true;
  const parts = expr.split(",");
  for (const part of parts) {
    if (part.includes("/")) {
      const [range, stepStr] = part.split("/");
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) return false;
      const start = range === "*" ? min : parseInt(range, 10);
      if (val >= start && (val - start) % step === 0 && val <= max) return true;
    } else if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (val >= start && val <= end) return true;
    } else {
      if (parseInt(part, 10) === val) return true;
    }
  }
  return false;
}

function computeNextRuns(expr: string, count = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minE, hrE, domE, monE, dowE] = parts;
  const results: Date[] = [];
  
  const current = new Date();
  // Move to next clean minute
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  // Search forward up to 500,000 minutes (~1 year)
  for (let step = 0; step < 500000 && results.length < count; step++) {
    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1; // 1-12
    const dow = current.getDay(); // 0-6 (Sun-Sat)

    const mOk = matchPart(m, minE, 0, 59);
    const hOk = matchPart(h, hrE, 0, 23);
    const domOk = matchPart(dom, domE, 1, 31);
    const monOk = matchPart(mon, monE, 1, 12);
    const dowOk = matchPart(dow, dowE, 0, 6);

    if (mOk && hOk && domOk && monOk && dowOk) {
      results.push(new Date(current.getTime()));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

export default function CronGeneratorClient() {
  const [rawInput, setRawInput] = useState<string>("0 0 * * *");
  const [minute, setMinute] = useState<string>("0");
  const [hour, setHour] = useState<string>("0");
  const [dayOfMonth, setDayOfMonth] = useState<string>("*");
  const [month, setMonth] = useState<string>("*");
  const [dayOfWeek, setDayOfWeek] = useState<string>("*");
  const [copied, setCopied] = useState<boolean>(false);

  // Sync from rawInput to 5 parts
  const handleRawChange = (val: string) => {
    setRawInput(val);
    const parts = val.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  // Sync from 5 parts to rawInput
  const handlePartChange = (idx: number, val: string) => {
    const current = [minute, hour, dayOfMonth, month, dayOfWeek];
    current[idx] = val.trim() || "*";
    setMinute(current[0]);
    setHour(current[1]);
    setDayOfMonth(current[2]);
    setMonth(current[3]);
    setDayOfWeek(current[4]);
    setRawInput(current.join(" "));
  };

  const handleApplyPreset = (exp: string) => {
    setRawInput(exp);
    const parts = exp.split(" ");
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  const handleCopy = () => {
    copyToClipboard(rawInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Human readable description
  const humanReadable = useMemo(() => {
    const parts = rawInput.trim().split(/\s+/);
    if (parts.length !== 5) return "Invalid cron format (must have exactly 5 space-separated parts).";

    const [minP, hrP, domP, monP, dowP] = parts;

    if (minP === "*" && hrP === "*" && domP === "*" && monP === "*" && dowP === "*") {
      return "Runs every single minute of every hour, every day.";
    }

    const segments: string[] = [];

    // Minute & Hour
    if (minP.startsWith("*/") && hrP === "*") {
      segments.push(`every ${minP.slice(2)} minutes`);
    } else if (minP === "*" && hrP === "*") {
      segments.push("every minute");
    } else if (minP === "0" && hrP.startsWith("*/")) {
      segments.push(`every ${hrP.slice(2)} hours on the hour`);
    } else if (hrP === "*" && minP !== "*") {
      segments.push(`at minute ${minP} of every hour`);
    } else if (hrP !== "*" && minP !== "*") {
      segments.push(`at ${hrP.padStart(2, "0")}:${minP.padStart(2, "0")}`);
    }

    // Day of Month
    if (domP !== "*") {
      if (domP.startsWith("*/")) segments.push(`every ${domP.slice(2)} days`);
      else segments.push(`on day ${domP} of the month`);
    }

    // Month
    if (monP !== "*") {
      const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monNum = parseInt(monP, 10);
      if (monthNames[monNum]) segments.push(`in ${monthNames[monNum]}`);
      else segments.push(`in month ${monP}`);
    }

    // Day of Week
    if (dowP !== "*") {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dowP === "1-5") {
        segments.push("on weekdays (Monday through Friday)");
      } else if (dowP === "0,6" || dowP === "6,0") {
        segments.push("on weekends (Saturday & Sunday)");
      } else {
        const dNum = parseInt(dowP, 10);
        if (dayNames[dNum]) segments.push(`on ${dayNames[dNum]}`);
        else segments.push(`on day ${dowP} of the week`);
      }
    }

    return `Runs ${segments.join(", ")}.`;
  }, [rawInput]);

  // Next run times
  const nextRuns = useMemo(() => {
    return computeNextRuns(rawInput, 5);
  }, [rawInput]);

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            Task Scheduling Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cron Expression Generator & Explainer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Visually compose, parse, and verify 5-part cron schedules with real-time English explanations and upcoming execution timestamps.
          </p>
        </div>

        {/* Master Expression Input Bar */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Type or Paste 5-Part Cron Expression
              </label>
              <input
                type="text"
                value={rawInput}
                onChange={(e) => handleRawChange(e.target.value)}
                placeholder="* * * * *"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl font-mono text-xl sm:text-2xl font-extrabold text-purple-300 focus:outline-none focus:border-purple-500 tracking-wider transition-colors"
              />
            </div>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied to Clipboard" : "Copy Expression"}
            </button>
          </div>

          {/* Real-time English Explanation */}
          <div className="pt-3 border-t border-slate-800/80 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mr-2">Meaning:</span>
              <span className="text-sm font-semibold text-emerald-300">{humanReadable}</span>
            </div>
          </div>
        </div>

        {/* 5-Field Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Minute", range: "0-59", val: minute, idx: 0, examples: "*, */5, 0, 15,30" },
            { label: "Hour", range: "0-23", val: hour, idx: 1, examples: "*, */2, 0, 9-17" },
            { label: "Day of Month", range: "1-31", val: dayOfMonth, idx: 2, examples: "*, 1, 15, 1-15" },
            { label: "Month", range: "1-12", val: month, idx: 3, examples: "*, 1-6, 12" },
            { label: "Day of Week", range: "0-6 (Sun-Sat)", val: dayOfWeek, idx: 4, examples: "*, 1-5, 0" },
          ].map((f) => (
            <div
              key={f.idx}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">{f.label}</span>
                <span className="text-[10px] text-purple-400/80 font-mono block mb-2">{f.range}</span>
              </div>
              <input
                type="text"
                value={f.val}
                onChange={(e) => handlePartChange(f.idx, e.target.value)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono text-sm font-bold text-purple-200 focus:outline-none focus:border-purple-500 mb-1"
              />
              <span className="text-[9px] text-slate-500 font-mono truncate" title={`e.g. ${f.examples}`}>
                e.g. {f.examples}
              </span>
            </div>
          ))}
        </div>

        {/* Next 5 Upcoming Execution Times */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Next 5 Scheduled Executions (Local Browser Timezone)
            </span>
          </div>

          {nextRuns.length > 0 ? (
            <div className="space-y-2">
              {nextRuns.map((date, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {date.toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-purple-300 font-bold">
                      {date.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    {Math.round((date.getTime() - Date.now()) / 60000)} mins from now
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-500 text-center">
              No upcoming dates found within 1 year for this schedule. Please verify your cron syntax.
            </div>
          )}
        </div>

        {/* Categorized Schedule Presets */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">
            Common Production Schedule Presets
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p.exp)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 flex items-center justify-between transition group text-left cursor-pointer"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                    {p.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white block">
                    {p.label}
                  </span>
                  <span className="text-[11px] font-mono text-purple-400 font-bold">
                    {p.exp}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
