"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import React, { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Download,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function PasswordGeneratorClient() {
  const [length, setLength] = useState<number>(16);
  const [useUppercase, setUseUppercase] = useState<boolean>(true);
  const [useLowercase, setUseLowercase] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);

  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let charset = "";
    if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    if (!charset) {
      setPassword("");
      return;
    }

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    setPassword(result);
  };

  React.useEffect(() => {
    generatePassword();
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols]);

  const handleCopy = () => {
    if (!password) return;
    copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthScore = () => {
    let score = 0;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (useUppercase) score += 1;
    if (useNumbers) score += 1;
    if (useSymbols) score += 1;
    return score;
  };

  const strength = getStrengthScore();

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            Cryptographic Entropy Generator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Secure Password Generator Online Free
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Generate strong, unbreakable passwords using high-entropy crypto random byte generation directly in your browser.
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-6">
          {/* Generated Password Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="relative flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <span className="font-mono text-base sm:text-lg text-emerald-300 font-bold tracking-wider select-all break-all">
                {password || "Select options below"}
              </span>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  onClick={generatePassword}
                  className="p-2 text-slate-400 hover:text-white transition"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Strength Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-full flex-1 rounded-full transition-colors ${
                      strength >= s
                        ? strength >= 4
                          ? "bg-emerald-500"
                          : strength >= 3
                          ? "bg-amber-500"
                          : "bg-red-500"
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {strength >= 4 ? "Very Strong" : strength >= 3 ? "Good" : "Weak"}
              </span>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Password Length</span>
                  <span className="text-white font-bold">{length} characters</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { label: "Uppercase (A-Z)", state: useUppercase, set: setUseUppercase },
                  { label: "Lowercase (a-z)", state: useLowercase, set: setUseLowercase },
                  { label: "Numbers (0-9)", state: useNumbers, set: setUseNumbers },
                  { label: "Symbols (!@#$)", state: useSymbols, set: setUseSymbols },
                ].map((opt, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300 cursor-pointer hover:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={opt.state}
                      onChange={(e) => opt.set(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Hardware Random Entropy</h4>
            <p className="text-xs text-slate-400">
              Generates non-deterministic cryptographically secure bytes using your operating system's CSPRNG via `crypto.getRandomValues`.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">100% In-Memory Generation</h4>
            <p className="text-xs text-slate-400">
              Your passwords never traverse a server or database. Absolute privacy is maintained locally in browser memory.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">High Customizability</h4>
            <p className="text-xs text-slate-400">
              Generate 8 to 64 character keys with custom toggles for symbols, digits, and upper/lower character sets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
