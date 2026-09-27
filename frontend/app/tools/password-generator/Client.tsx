"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import React, { useState, useMemo } from "react";
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
  Cpu,
  Server,
  Zap,
} from "lucide-react";

const DICEWARE_WORDS = [
  "apple", "anchor", "arrow", "badge", "banana", "beacon", "breeze", "bridge",
  "cabin", "cactus", "canyon", "castle", "cedar", "cipher", "comet", "coral",
  "crane", "crystal", "desert", "dolphin", "dragon", "falcon", "feather", "flame",
  "forest", "galaxy", "glacier", "granite", "harbor", "horizon", "island", "jaguar",
  "jungle", "lantern", "legend", "meadow", "meteor", "mirage", "mountain", "nebula",
  "oasis", "ocean", "orbit", "panther", "pebble", "phoenix", "planet", "pyramid",
  "quartz", "radar", "river", "rocket", "safari", "shadow", "summit", "timber",
  "tiger", "tornado", "tulip", "valley", "vortex", "walnut", "wizard", "zenith"
];

function formatTime(seconds: number): string {
  if (seconds < 1) return "Instant (under 1 second)";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} days`;
  const years = days / 365;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)} thousand years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years`;
  return "Centuries (Virtually Unbreakable)";
}

export default function PasswordGeneratorClient() {
  const [activeTab, setActiveTab] = useState<"generator" | "analyzer">("generator");
  const [genMode, setGenMode] = useState<"random" | "passphrase">("random");

  // Random Password State
  const [length, setLength] = useState<number>(16);
  const [useUppercase, setUseUppercase] = useState<boolean>(true);
  const [useLowercase, setUseLowercase] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);

  // Passphrase State
  const [wordCount, setWordCount] = useState<number>(4);
  const [passSeparator, setPassSeparator] = useState<string>("-");

  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Password Analyzer State
  const [testPassword, setTestPassword] = useState<string>("");

  const generatePassword = () => {
    if (genMode === "passphrase") {
      const selectedWords: string[] = [];
      const randValues = new Uint32Array(wordCount);
      crypto.getRandomValues(randValues);
      for (let i = 0; i < wordCount; i++) {
        selectedWords.push(DICEWARE_WORDS[randValues[i] % DICEWARE_WORDS.length]);
      }
      setPassword(selectedWords.join(passSeparator));
      return;
    }

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
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, genMode, wordCount, passSeparator]);

  // Calculate Entropy and Time to Crack for given string
  const evaluateSecurity = (pwd: string) => {
    if (!pwd) {
      return {
        entropy: 0,
        charsetSize: 0,
        onlineTime: "0 seconds",
        gpuTime: "0 seconds",
        supercomputerTime: "0 seconds",
        rating: "None",
        scorePercent: 0,
      };
    }

    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;
    if (pool === 0) pool = 26;

    // Entropy: E = L * log2(pool)
    const entropy = Math.round(pwd.length * (Math.log(pool) / Math.log(2)));

    // Total combinations: N = pool ^ L
    // 1. Online: 1,000 guesses / sec
    // 2. GPU rig (8x RTX 4090): 100,000,000,000 (1e11) guesses / sec
    // 3. Supercomputer: 100,000,000,000,000 (1e14) guesses / sec
    const combinations = Math.pow(pool, pwd.length);
    const onlineSec = combinations / 1000;
    const gpuSec = combinations / 1e11;
    const superSec = combinations / 1e14;

    let rating = "Weak";
    let scorePercent = 25;
    if (entropy >= 80) {
      rating = "Military Grade (Unbreakable)";
      scorePercent = 100;
    } else if (entropy >= 60) {
      rating = "Very Strong";
      scorePercent = 80;
    } else if (entropy >= 45) {
      rating = "Moderate";
      scorePercent = 50;
    }

    return {
      entropy,
      charsetSize: pool,
      onlineTime: formatTime(onlineSec),
      gpuTime: formatTime(gpuSec),
      supercomputerTime: formatTime(superSec),
      rating,
      scorePercent,
    };
  };

  const currentSecurity = useMemo(() => {
    const target = activeTab === "generator" ? password : testPassword;
    return evaluateSecurity(target);
  }, [password, testPassword, activeTab]);

  const handleCopy = (text: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            Cryptographic Entropy & Crack Time Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Password Generator & Hacker Time-to-Crack Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Generate cryptographically secure passwords or memorable passphrases with real-time brute-force time estimates across GPU clusters and supercomputers.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
            <button
              onClick={() => setActiveTab("generator")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "generator"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Generate Strong Password
            </button>
            <button
              onClick={() => setActiveTab("analyzer")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analyzer"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Test Your Own Password & Crack Time
            </button>
          </div>
        </div>

        {/* Tab 1: Generator */}
        {activeTab === "generator" && (
          <div className="space-y-6">
            {/* Generated Password Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                <span className="font-mono text-lg sm:text-xl text-emerald-300 font-bold tracking-wider select-all break-all">
                  {password || "Select options below"}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleCopy(password)}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition cursor-pointer shadow-md shadow-emerald-600/25"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={generatePassword}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                    title="Generate New"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mode switch: Random vs Passphrase */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setGenMode("random")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    genMode === "random"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  Random Characters
                </button>
                <button
                  onClick={() => setGenMode("passphrase")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    genMode === "passphrase"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  Memorable Passphrase (Diceware)
                </button>
              </div>

              {/* Settings Controls */}
              {genMode === "random" ? (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                      <span>Length: {length} characters</span>
                      <span>Min 8 • Max 64</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="64"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { state: useUppercase, set: setUseUppercase, label: "A-Z (Uppercase)" },
                      { state: useLowercase, set: setUseLowercase, label: "a-z (Lowercase)" },
                      { state: useNumbers, set: setUseNumbers, label: "0-9 (Numbers)" },
                      { state: useSymbols, set: setUseSymbols, label: "!@# (Symbols)" },
                    ].map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={opt.state}
                          onChange={(e) => opt.set(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-emerald-600"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                      <span>Word Count: {wordCount} words</span>
                      <span>Min 3 • Max 8</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="8"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">Separator:</span>
                    {["-", "_", ".", " "].map((sep) => (
                      <button
                        key={sep}
                        onClick={() => setPassSeparator(sep)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                          passSeparator === sep
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        &quot;{sep}&quot;
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Password Analyzer */}
        {activeTab === "analyzer" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Test Existing Password Security
            </label>
            <input
              type="text"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Type any password to calculate how long a hacker would take to crack it..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-base text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              Evaluated 100% locally in browser memory. Nothing is sent to any server.
            </p>
          </div>
        )}

        {/* Hacker Time-to-Crack Calculator Results */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 mt-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Password Security & Entropy Rating
              </span>
              <span className="text-xl font-extrabold text-white">
                {currentSecurity.rating}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">
                Information Entropy
              </span>
              <span className="text-xl font-mono font-extrabold text-emerald-400">
                {currentSecurity.entropy} bits
              </span>
            </div>
          </div>

          {/* Time to Crack Scenarios */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Estimated Time for Hacker to Crack (Brute Force Exhaustion)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Online Attack */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Online Web Attack</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-emerald-300">
                  {currentSecurity.onlineTime}
                </div>
                <p className="text-[10px] text-slate-500">
                  1,000 guesses/sec (Rate-limited web login attempts)
                </p>
              </div>

              {/* Offline GPU Rig */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>High-End GPU Rig</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-amber-300">
                  {currentSecurity.gpuTime}
                </div>
                <p className="text-[10px] text-slate-500">
                  100 Billion guesses/sec (8x RTX 4090 Hashcat cluster)
                </p>
              </div>

              {/* Supercomputer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Nation-State Supercomputer</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-purple-300">
                  {currentSecurity.supercomputerTime}
                </div>
                <p className="text-[10px] text-slate-500">
                  100 Trillion guesses/sec (Advanced dedicated ASIC / HPC)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
