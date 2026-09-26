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
} from "lucide-react";

interface MatchResult {
  fullMatch: string;
  index: number;
  groups: string[];
}

export default function RegexTesterClient() {
  const [pattern, setPattern] = useState("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
  const [flags, setFlags] = useState({
    g: true,
    i: true,
    m: false,
    s: false,
  });
  const [testString, setTestString] = useState(
    `Contact our enterprise team at support@botock.com or sales@example.org for inquiries. Personal email: user.name+tag@domain.co.uk!`
  );
  const [copied, setCopied] = useState(false);

  // Active flag string
  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([f]) => f)
      .join("");
  }, [flags]);

  // Regex execution & group capture
  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, highlightedHtml: testString };
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
        // Safeguard against infinite loop on zero-width match
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

      // Highlight in test string
      let lastIdx = 0;
      const parts: string[] = [];

      for (const m of matchesList) {
        if (m.index > lastIdx) {
          parts.push(escapeHtml(testString.substring(lastIdx, m.index)));
        }
        parts.push(
          `<mark class="bg-purple-500/30 text-purple-200 border-b-2 border-purple-400 px-0.5 rounded">${escapeHtml(
            m.fullMatch
          )}</mark>`
        );
        lastIdx = m.index + m.fullMatch.length;
      }

      if (lastIdx < testString.length) {
        parts.push(escapeHtml(testString.substring(lastIdx)));
      }

      return {
        matches: matchesList,
        error: null,
        highlightedHtml: parts.join(""),
      };
    } catch (err: any) {
      return {
        matches: [],
        error: err.message || "Invalid regular expression pattern",
        highlightedHtml: escapeHtml(testString),
      };
    }
  }, [pattern, flagString, testString, flags.g]);

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const handleCopyRegex = () => {
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
            Live Regex Debugger
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Online Regular Expression (Regex) Tester
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Real-time JavaScript regex parser with color-coded syntax matching, capture groups table, and flag toggles.
          </p>
        </div>

        {/* Regex Expression Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center flex-1 w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 focus-within:border-purple-500 transition">
              <span className="text-purple-400 font-mono text-lg font-bold select-none pr-1">
                /
              </span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Insert regular expression pattern here..."
                className="w-full bg-transparent text-white font-mono text-sm focus:outline-none placeholder-slate-600"
              />
              <span className="text-purple-400 font-mono text-lg font-bold select-none pl-1">
                /{flagString}
              </span>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-2">
              {(["g", "i", "m", "s"] as const).map((flag) => (
                <button
                  key={flag}
                  onClick={() =>
                    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))
                  }
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold border transition ${
                    flags[flag]
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                  title={`Toggle flag: ${flag}`}
                >
                  {flag}
                </button>
              ))}

              <button
                onClick={handleCopyRegex}
                className="px-3 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Regex
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test String & Highlight */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Test String
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {matches.length} {matches.length === 1 ? "match" : "matches"} found
                </span>
              </div>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter string to test pattern against..."
                className="w-full h-32 bg-transparent text-slate-200 placeholder-slate-600 resize-y focus:outline-none font-mono text-sm leading-relaxed"
              />
            </div>

            {/* Live Highlight Preview */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Highlighted Match Output
                </span>
              </div>
              <div
                className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-all text-slate-300 min-h-[90px] bg-slate-950/60 p-4 rounded-xl border border-slate-800/60"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          </div>

          {/* Group Capture Table */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Match & Group Details
              </h3>

              {matches.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No matches found for the given pattern and test string.
                </p>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-purple-300">
                          Match #{idx + 1}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          index {m.index}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-slate-200 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                        {m.fullMatch}
                      </div>

                      {m.groups.length > 0 && (
                        <div className="pt-1 space-y-1">
                          {m.groups.map((grp, gIdx) => (
                            <div
                              key={gIdx}
                              className="flex items-start gap-2 text-[11px] font-mono"
                            >
                              <span className="text-slate-500 shrink-0">
                                Group {gIdx + 1}:
                              </span>
                              <span className="text-cyan-400 break-all">
                                {grp !== undefined ? grp : "(undefined)"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
