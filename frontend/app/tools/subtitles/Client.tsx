"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Subtitles,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Copy,
  Check,
  Search,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function SubtitlesClient() {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("subtitles");
  const [targetFormat, setTargetFormat] = useState<"srt" | "vtt">("vtt");
  const [timeShiftMs, setTimeShiftMs] = useState<number>(0);
  const [searchWord, setSearchWord] = useState("");
  const [replaceWord, setReplaceWord] = useState("");
  const [stripTags, setStripTags] = useState(false);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFileName(f.name.replace(/\.[^/.]+$/, ""));
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text || "");
      };
      reader.readAsText(f);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [".srt", ".vtt", ".txt", ".sub", ".ass"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const parseTimestampToMs = (str: string): number => {
    // Matches 00:01:23,456 or 00:01:23.456
    const clean = str.replace(",", ".");
    const parts = clean.split(":");
    if (parts.length === 3) {
      const h = parseFloat(parts[0]);
      const m = parseFloat(parts[1]);
      const s = parseFloat(parts[2]);
      return h * 3600000 + m * 60000 + s * 1000;
    }
    return 0;
  };

  const formatMsToTimestamp = (ms: number, format: "srt" | "vtt"): string => {
    const validMs = Math.max(0, ms);
    const h = Math.floor(validMs / 3600000);
    const m = Math.floor((validMs % 3600000) / 60000);
    const s = Math.floor((validMs % 60000) / 1000);
    const millis = Math.floor(validMs % 1000);

    const pad = (n: number, z = 2) => String(n).padStart(z, "0");
    const sep = format === "srt" ? "," : ".";

    return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(millis, 3)}`;
  };

  const getProcessedSubtitles = (): string => {
    if (!content.trim()) return "";

    let text = content;

    // Search and replace
    if (searchWord) {
      text = text.replaceAll(searchWord, replaceWord);
    }

    // Strip HTML/styling tags
    if (stripTags) {
      text = text.replace(/<[^>]*>/g, "");
    }

    // Time shifting and format conversion
    const isSourceVtt = text.includes("WEBVTT");
    const lines = text.split(/\r?\n/);
    const outputLines: string[] = [];

    if (targetFormat === "vtt" && !isSourceVtt) {
      outputLines.push("WEBVTT\n");
    }

    const timestampRegex = /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/;

    for (let line of lines) {
      if (line.includes("WEBVTT") && targetFormat === "srt") {
        continue; // Strip WEBVTT header for SRT
      }

      const match = line.match(timestampRegex);
      if (match) {
        const startMs = parseTimestampToMs(match[1]) + timeShiftMs;
        const endMs = parseTimestampToMs(match[2]) + timeShiftMs;
        const newStart = formatMsToTimestamp(startMs, targetFormat);
        const newEnd = formatMsToTimestamp(endMs, targetFormat);
        outputLines.push(`${newStart} --> ${newEnd}`);
      } else {
        outputLines.push(line);
      }
    }

    return outputLines.join("\n").trim();
  };

  const handleDownload = () => {
    const result = getProcessedSubtitles();
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}-converted.${targetFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getProcessedSubtitles());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor & Input */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subtitle Text / File
            </label>
            {content && (
              <button
                type="button"
                onClick={() => setContent("")}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
              >
                Clear Text
              </button>
            )}
          </div>

          <div
            {...getRootProps()}
            className={`border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-sky-500 bg-sky-500/5"
                : "border-slate-200 dark:border-white/[0.08] hover:border-sky-500/50 bg-slate-50 dark:bg-white/[0.01]"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drop an SRT or VTT file here, or type/paste captions below.
            </p>
          </div>

          <textarea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`1\n00:00:01,000 --> 00:00:04,000\nHello and welcome to Botock!\n\n2\n00:00:04,500 --> 00:00:07,000\nEdit and convert subtitles easily.`}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {content && (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download as {targetFormat.toUpperCase()}
              </button>
              <button
                onClick={handleCopy}
                className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Result"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Tools Panel */}
        <div className="lg:col-span-4 space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Sliders className="w-4 h-4 text-sky-500" />
            <span>Tools & Format</span>
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetFormat("vtt")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  targetFormat === "vtt"
                    ? "border-sky-500 bg-sky-600/10 text-sky-600 dark:text-sky-400"
                    : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                }`}
              >
                VTT (WebVTT)
              </button>
              <button
                type="button"
                onClick={() => setTargetFormat("srt")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  targetFormat === "srt"
                    ? "border-sky-500 bg-sky-600/10 text-sky-600 dark:text-sky-400"
                    : "border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                }`}
              >
                SRT (SubRip)
              </button>
            </div>
          </div>

          {/* Time Sync / Offset */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Time Shift / Sync (ms)</span>
              <span className="font-mono text-sky-500">{timeShiftMs > 0 ? `+${timeShiftMs}` : timeShiftMs}ms</span>
            </div>
            <input
              type="number"
              step={100}
              value={timeShiftMs}
              onChange={(e) => setTimeShiftMs(Number(e.target.value))}
              placeholder="+500 or -1000 ms"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Synchronize subtitles by shifting all cue timings forward or backward.
            </p>
          </div>

          {/* Find & Replace */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Find & Replace Text
            </label>
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Find word..."
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs"
            />
            <input
              type="text"
              value={replaceWord}
              onChange={(e) => setReplaceWord(e.target.value)}
              placeholder="Replace with..."
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs"
            />
          </div>

          {/* Cleanup Options */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={stripTags}
              onChange={(e) => setStripTags(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Strip HTML & color tags</span>
          </label>
        </div>
      </div>
    </div>
  );
}
