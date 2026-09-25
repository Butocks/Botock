"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";

const PRESETS = [
  { label: "Every minute", exp: "* * * * *" },
  { label: "Every 5 minutes", exp: "*/5 * * * *" },
  { label: "Every 15 minutes", exp: "*/15 * * * *" },
  { label: "Every hour at minute 0", exp: "0 * * * *" },
  { label: "Every day at midnight (00:00)", exp: "0 0 * * *" },
  { label: "Every day at noon (12:00)", exp: "0 12 * * *" },
  { label: "Every Sunday at midnight", exp: "0 0 * * 0" },
  { label: "1st day of every month at midnight", exp: "0 0 1 * *" },
  { label: "Every weekday (Mon-Fri) at 09:00", exp: "0 9 * * 1-5" },
];

export default function CronGeneratorClient() {
  const [minute, setMinute] = useState<string>("0");
  const [hour, setHour] = useState<string>("0");
  const [dayOfMonth, setDayOfMonth] = useState<string>("*");
  const [month, setMonth] = useState<string>("*");
  const [dayOfWeek, setDayOfWeek] = useState<string>("*");
  const [copied, setCopied] = useState<boolean>(false);

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  // Human readable description builder
  const humanReadable = useMemo(() => {
    let desc = "Runs ";

    // Schedule frequency
    if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      return "Runs every minute, every day.";
    }

    if (minute.startsWith("*/")) {
      const step = minute.substring(2);
      desc += `every ${step} minutes `;
    } else if (minute === "*") {
      desc += "every minute ";
    } else {
      desc += `at minute ${minute} `;
    }

    if (hour.startsWith("*/")) {
      const step = hour.substring(2);
      desc += `past every ${step} hours `;
    } else if (hour !== "*") {
      desc += `past hour ${hour}:00 `;
    }

    if (dayOfMonth !== "*") {
      desc += `on day ${dayOfMonth} of the month `;
    }

    if (month !== "*") {
      desc += `in month ${month} `;
    }

    if (dayOfWeek !== "*") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (/^[0-6]$/.test(dayOfWeek)) {
        desc += `on ${days[parseInt(dayOfWeek)]} `;
      } else if (dayOfWeek === "1-5") {
        desc += `on weekdays (Monday through Friday) `;
      } else {
        desc += `on day-of-week ${dayOfWeek} `;
      }
    }

    return desc.trim() + ".";
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const handleApplyPreset = (exp: string) => {
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
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            Visually compose 5-part cron syntax with real-time plain English explanations and schedule presets.
          </p>
        </div>

        {/* Expression Banner */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Generated Cron Expression
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-purple-300 tracking-wider">
                {cronExpression}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Expression"}
            </button>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs sm:text-sm text-emerald-300 font-medium">
              {humanReadable}
            </p>
          </div>
        </div>

        {/* 5-Field Grid Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
          {[
            {
              label: "Minute",
              sub: "0-59, *, */n",
              val: minute,
              set: setMinute,
              placeholder: "0 or *",
            },
            {
              label: "Hour",
              sub: "0-23, *, */n",
              val: hour,
              set: setHour,
              placeholder: "0 or *",
            },
            {
              label: "Day of Month",
              sub: "1-31, *",
              val: dayOfMonth,
              set: setDayOfMonth,
              placeholder: "*",
            },
            {
              label: "Month",
              sub: "1-12, *",
              val: month,
              set: setMonth,
              placeholder: "*",
            },
            {
              label: "Day of Week",
              sub: "0-6 (Sun-Sat), 1-5",
              val: dayOfWeek,
              set: setDayOfWeek,
              placeholder: "*",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">
                  {f.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mb-2">
                  {f.sub}
                </span>
              </div>
              <input
                type="text"
                value={f.val}
                onChange={(e) => f.set(e.target.value.trim() || "*")}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-center font-mono text-sm font-bold text-purple-300 focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
        </div>

        {/* Quick Presets */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">
            Common Schedule Presets
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p.exp)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between transition group text-left cursor-pointer"
              >
                <div>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white block">
                    {p.label}
                  </span>
                  <span className="text-[11px] font-mono text-purple-400">
                    {p.exp}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
