"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Replace,
  BookOpen,
  Layers,
} from "lucide-react";

interface MatchResult {
  fullMatch: string;
  index: number;
  groups: string[];
}

const PRESET_PATTERNS = [
  {
    name: "Email Address",
    pattern: "([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})",
    flags: { g: true, i: true, m: false, s: false },
    test: "Contact us at support@botock.com or sales@enterprise.org. Personal: john.doe+dev@gmail.com",
    desc: "Extracts email usernames and domains",
  },
  {
    name: "HTTP / HTTPS URL",
    pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    flags: { g: true, i: true, m: false, s: false },
    test: "Check out https://botock.com/tools and http://example.org:8080/path?query=1#sec",
    desc: "Matches web URLs with protocols, domain, path, and query params",
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: { g: true, i: false, m: false, s: false },
    test: "Primary DNS: 8.8.8.8, router at 192.168.1.1, invalid: 999.12.3.4",
    desc: "Validates IPv4 numbers from 0.0.0.0 to 255.255.255.255",
  },
  {
    name: "Hex Color Code",
    pattern: "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b",
    flags: { g: true, i: true, m: false, s: false },
    test: "Theme colors: #FFFFFF (pure white), #10B981 (emerald), #a855f7 (purple), and shorthand #fff.",
    desc: "Matches 3-digit and 6-digit hex color strings",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b",
    flags: { g: true, i: false, m: false, s: false },
    test: "Project launched on 2026-09-27 and next milestone is 2026-12-31.",
    desc: "Matches ISO 8601 calendar dates with year, month, and day groups",
  },
  {
    name: "Strong Password Check",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: { g: false, i: false, m: true, s: false },
    test: "P@ssword123\nweakpass\nStrongP@ss2026",
    desc: "Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special symbol",
  },
];

const CHEAT_SHEET = [
  { token: "\\d", meaning: "Any digit [0-9]" },
  { token: "\\w", meaning: "Word char [a-zA-Z0-9_]" },
  { token: "\\s", meaning: "Whitespace (space, tab, newline)" },
  { token: "^ / $", meaning: "Start / End of string" },
  { token: "+", meaning: "1 or more times" },
  { token: "*", meaning: "0 or more times" },
  { token: "?", meaning: "0 or 1 time (optional)" },
  { token: "{n,m}", meaning: "Between n and m times" },
  { token: "[...]", meaning: "Character set (e.g. [a-z])" },
  { token: "(...)", meaning: "Capture group (accessible via $1)" },
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function RegexTesterClient() {
  const [pattern, setPattern] = useState(PRESET_PATTERNS[0].pattern);
  const [flags, setFlags] = useState(PRESET_PATTERNS[0].flags);
  const [testString, setTestString] = useState(PRESET_PATTERNS[0].test);
  const [replaceString, setReplaceString] = useState("[$1]");
  const [mode, setMode] = useState<"match" | "replace">("match");
  const [copied, setCopied] = useState(false);

  // Active flag string
  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([f]) => f)
      .join("");
  }, [flags]);

  // Regex execution & match extraction
  const { matches, error, highlightedHtml, replacedText } = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, highlightedHtml: escapeHtml(testString), replacedText: testString };
    }

    try {
      const re = new RegExp(pattern, flagString);
      const matchesList: MatchResult[] = [];

      if (!flags.g) {
        const single = re.exec(testString);
        if (single) {
          matchesList.push({
            fullMatch: single[0],
            index: single.index,
            groups: single.slice(1),
          });
        }
      } else {
        let m: RegExpExecArray | null;
        let count = 0;
        while ((m = re.exec(testString)) !== null && count < 1000) {
          matchesList.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m.index === re.lastIndex) re.lastIndex++;
          count++;
        }
      }

      // Highlight matches in test string
      let lastIdx = 0;
      const parts: string[] = [];

      for (const m of matchesList) {
        if (m.index > lastIdx) {
          parts.push(escapeHtml(testString.substring(lastIdx, m.index)));
        }
        parts.push(
          `<mark class="bg-purple-500/30 text-purple-200 border-b-2 border-purple-400 px-0.5 rounded font-mono">${escapeHtml(
            m.fullMatch
          )}</mark>`
        );
        lastIdx = m.index + m.fullMatch.length;
      }

      if (lastIdx < testString.length) {
        parts.push(escapeHtml(testString.substring(lastIdx)));
      }

      // Compute replacement preview
      let replaced = "";
      try {
        replaced = testString.replace(re, replaceString);
      } catch {
        replaced = "Error applying replacement tokens.";
      }

      return {
        matches: matchesList,
        error: null,
        highlightedHtml: parts.join(""),
        replacedText: replaced,
      };
    } catch (err: any) {
      return {
        matches: [],
        error: err.message,
        highlightedHtml: escapeHtml(testString),
        replacedText: testString,
      };
    }
  }, [pattern, flagString, testString, replaceString, flags.g]);

  const handleApplyPreset = (p: typeof PRESET_PATTERNS[0]) => {
    setPattern(p.pattern);
    setFlags(p.flags);
    setTestString(p.test);
  };

  const handleCopyPattern = () => {
    copyToClipboard(`/${pattern}/${flagString}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Code2 className="w-3.5 h-3.5" />
            Regular Expression Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Regular Expression (Regex) Tester & Debugger
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Real-time JavaScript regex parser with color-coded syntax matching, capture groups table, find & replace, and verified presets.
          </p>
        </div>

        {/* Preset Carousel */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Verified Production Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PATTERNS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pattern & Flags Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Regular Expression Pattern
            </span>
            <button
              onClick={handleCopyPattern}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Regex"}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 font-mono">
              <span className="text-purple-400 font-bold text-lg mr-1 select-none">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="w-full py-3 bg-transparent text-sm sm:text-base font-bold text-purple-200 focus:outline-none"
              />
              <span className="text-purple-400 font-bold text-lg ml-1 select-none">/</span>
              <span className="text-emerald-400 font-bold text-sm ml-1">{flagString}</span>
            </div>

            {/* Flag Toggles */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[
                { id: "g", label: "Global (g)" },
                { id: "i", label: "Insensitive (i)" },
                { id: "m", label: "Multiline (m)" },
                { id: "s", label: "DotAll (s)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    setFlags((prev: any) => ({ ...prev, [f.id]: !prev[f.id] }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    (flags as any)[f.id]
                      ? "bg-purple-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f.id}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Regex Syntax Error: {error}</span>
            </div>
          )}
        </div>

        {/* View Mode: Match vs Replace */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode("match")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === "match" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Match & Highlight
            </button>
            <button
              onClick={() => setMode("replace")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === "replace" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Find & Replace
            </button>
          </div>

          <span className="text-xs font-mono text-purple-400 font-bold">
            {matches.length} {matches.length === 1 ? "match" : "matches"} found
          </span>
        </div>

        {/* Test String Box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input text */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Test String
            </label>
            <textarea
              rows={8}
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Mode Result: Highlight or Replace */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              {mode === "match" ? "Live Matched Highlights" : "Replacement Output"}
            </label>

            {mode === "replace" && (
              <div className="mb-2">
                <input
                  type="text"
                  value={replaceString}
                  onChange={(e) => setReplaceString(e.target.value)}
                  placeholder="Replace with... (e.g. [$1] or REDACTED)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-purple-300 mb-2 focus:outline-none"
                />
              </div>
            )}

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm min-h-[170px] overflow-y-auto whitespace-pre-wrap select-all">
              {mode === "match" ? (
                <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
              ) : (
                <div className="text-emerald-300">{replacedText}</div>
              )}
            </div>
          </div>
        </div>

        {/* Capture Groups Table & Quick Cheat Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Capture Groups (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
              Extracted Matches & Capture Groups ({matches.length})
            </span>

            {matches.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold font-mono">Match #{idx + 1}</span>
                      <span className="text-slate-500 font-mono text-[11px]">Index: {m.index}</span>
                    </div>
                    <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                      {m.fullMatch}
                    </div>
                    {m.groups.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        {m.groups.map((g, gIdx) => (
                          <div key={gIdx} className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-slate-500">Group ${gIdx + 1}:</span>
                            <span className="text-emerald-300">{g || "undefined"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No regex matches found in test string.
              </div>
            )}
          </div>

          {/* Quick Cheat Sheet (1 Col) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Regex Quick Reference</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {CHEAT_SHEET.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <span className="font-mono font-bold text-purple-300">{item.token}</span>
                  <span className="text-slate-400 text-[11px] text-right">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
