"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, Mic, Play, Download, Settings2, Sparkles, AlertCircle, 
  Type, Radio, Volume2, Sliders, Check, RefreshCw, AudioWaveform
} from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { getTransferMedia } from "@/app/utils/mediaTransfer";

interface TTSVoice {
  id: string;
  name: string;
  role: string;
  category: "Deep & Narrator" | "Kids & Youth" | "Female Hosts" | "Regional";
  gender: string;
  lang: string;
  defaultPitch: string;
  defaultRate: string;
  desc: string;
}

const TTS_VOICES: TTSVoice[] = [
  {
    id: "en-US-ChristopherNeural",
    name: "Christopher",
    role: "Deep Podcast Host & Documentary",
    category: "Deep & Narrator",
    gender: "Male",
    lang: "English (US)",
    defaultPitch: "-4Hz",
    defaultRate: "-2%",
    desc: "Ultra-realistic, deep authoritative voice for podcasts, video essays, and documentaries."
  },
  {
    id: "en-US-GuyNeural",
    name: "Guy",
    role: "Confident Storyteller",
    category: "Deep & Narrator",
    gender: "Male",
    lang: "English (US)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Rich, dynamic voice ideal for YouTube shorts, narrations, and explaining concepts."
  },
  {
    id: "en-US-EricNeural",
    name: "Eric",
    role: "Deep Movie Villain & Trailer",
    category: "Deep & Narrator",
    gender: "Male",
    lang: "English (US)",
    defaultPitch: "-8Hz",
    defaultRate: "-6%",
    desc: "Resonant, heavy cinematic voice with gravity, suspense, and presence."
  },
  {
    id: "en-GB-BrianNeural",
    name: "Brian",
    role: "British Documentary Narrator",
    category: "Deep & Narrator",
    gender: "Male",
    lang: "English (UK)",
    defaultPitch: "-2Hz",
    defaultRate: "-2%",
    desc: "Sophisticated British narrator voice with natural BBC-style depth and cadence."
  },
  {
    id: "en-US-AnaNeural",
    name: "Ana",
    role: "Clean Child / Kid Voice",
    category: "Kids & Youth",
    gender: "Child",
    lang: "English (US)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Pure, crystal-clean natural child voice for cartoons, bedtime stories, and youth dialogues."
  },
  {
    id: "en-US-JennyNeural",
    name: "Jenny",
    role: "Studio Host & Audiobooks",
    category: "Female Hosts",
    gender: "Female",
    lang: "English (US)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Warm, professional, crystal-clear studio voice for podcasts and audiobooks."
  },
  {
    id: "en-US-AriaNeural",
    name: "Aria",
    role: "Expressive Social Host",
    category: "Female Hosts",
    gender: "Female",
    lang: "English (US)",
    defaultPitch: "+0Hz",
    defaultRate: "+2%",
    desc: "Modern energetic tone perfect for social media reels, ads, and character dialogues."
  },
  {
    id: "ur-PK-AsadNeural",
    name: "Asad",
    role: "Urdu Deep Male Voiceover",
    category: "Regional",
    gender: "Male",
    lang: "Urdu (Pakistan)",
    defaultPitch: "-2Hz",
    defaultRate: "+0%",
    desc: "Vocal depth and clear pronunciation for Urdu podcasts, poetry, and documentaries."
  },
  {
    id: "ur-PK-UzmaNeural",
    name: "Uzma",
    role: "Urdu Female Narrator",
    category: "Regional",
    gender: "Female",
    lang: "Urdu (Pakistan)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Eloquent, sweet Urdu narration voice for stories, news, and voiceovers."
  },
  {
    id: "hi-IN-MadhurNeural",
    name: "Madhur",
    role: "Hindi Deep Narrator",
    category: "Regional",
    gender: "Male",
    lang: "Hindi (India)",
    defaultPitch: "-2Hz",
    defaultRate: "+0%",
    desc: "Resonant, deep Hindi voice for YouTube videos, podcasts, and explainers."
  },
  {
    id: "hi-IN-SwaraNeural",
    name: "Swara",
    role: "Hindi Studio Female",
    category: "Regional",
    gender: "Female",
    lang: "Hindi (India)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Clear, natural Hindi narration for audiobooks, stories, and social media."
  }
];

const SAMPLE_PROMPTS = [
  {
    label: "🎙️ Deep Podcast",
    text: "Welcome back to the midnight podcast. In tonight's episode, we explore the deep mysteries of the universe that science is only beginning to understand."
  },
  {
    label: "👦 Kid Story",
    text: "Once upon a time in a sunny green forest, a little bunny found a shiny golden key hidden under an old oak tree!"
  },
  {
    label: "🎬 Movie Trailer",
    text: "In a world lost to chaos, one warrior will rise to challenge destiny itself. Prepare for the ultimate battle."
  },
  {
    label: "🇵🇰 Urdu Voiceover",
    text: "خوش آمدید! بوٹوک اسٹوڈیو کے جدید اے آئی وائس انجن کے ساتھ اپنی آواز کو ایک نیا روپ دیں۔"
  }
];

const VOICE_MODES = [
  { id: "kid", label: "👦 Kid Voice" },
  { id: "little_girl", label: "👧 Little Girl" },
  { id: "women", label: "👩 Woman Voice" },
  { id: "man_deep", label: "👨 Deep Voice Man" },
  { id: "deep_villain", label: "😈 Deep Villain" },
  { id: "man_old", label: "👴 Old Man" },
  { id: "old_women", label: "👵 Old Woman" },
  { id: "weak_man", label: "🤕 Weak Man" },
  { id: "strict", label: "👔 Strict/Bossy" },
  { id: "robot", label: "🤖 AI Robot" },
  { id: "chipmunk", label: "🐿️ Chipmunk" },
  { id: "echo_chamber", label: "⛰️ Echo Chamber" },
  { id: "telephone", label: "📞 Telephone" },
  { id: "privacy_disguiser", label: "🕵️ Privacy Disguiser" },
  { id: "clone_elon", label: "🚀 Elon (Clone)" },
  { id: "clone_morgan", label: "🎙️ Morgan (Clone)" },
  { id: "clone_anime_girl", label: "🌸 Anime Girl (Clone)" },
];

export default function VoiceChangerClient() {
  // Default to TTS mode as requested by user
  const [activeTab, setActiveTab] = useState<"tts" | "v2v">("tts");

  // TTS State
  const [ttsText, setTtsText] = useState(
    "Welcome to the deep voice AI studio. This sounds like a professional podcast narrator, completely free with zero robotic artifacts."
  );
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>(TTS_VOICES[0]);
  const [pitchOffset, setPitchOffset] = useState<number>(-4); // in Hz
  const [rateOffset, setRateOffset] = useState<number>(-2); // in %
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<"idle" | "generating" | "completed" | "error">("idle");
  const [ttsError, setTtsError] = useState("");

  // Voice-to-Voice State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [v2vMode, setV2vMode] = useState<string>("man_deep");
  const [v2vStatus, setV2vStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [v2vError, setV2vError] = useState("");
  const [v2vAudioUrl, setV2vAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const checkTransfer = async () => {
      try {
        const media = await getTransferMedia();
        if (mounted && media && media.file) {
          setSelectedFile(media.file);
          setActiveTab("v2v");
        }
      } catch (err) {
        console.error("Error auto-loading transfer media in voice changer:", err);
      }
    };
    checkTransfer();
    return () => { mounted = false; };
  }, []);

  const handleVoiceSelect = (voice: TTSVoice) => {
    setSelectedVoice(voice);
    const p = parseInt(voice.defaultPitch) || 0;
    const r = parseInt(voice.defaultRate) || 0;
    setPitchOffset(p);
    setRateOffset(r);
  };

  const generateTTS = async () => {
    if (!ttsText.trim()) {
      setTtsError("Please enter some text to generate audio.");
      return;
    }

    setTtsStatus("generating");
    setTtsError("");
    setTtsAudioUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const pitchStr = `${pitchOffset >= 0 ? "+" : ""}${pitchOffset}Hz`;
      const rateStr = `${rateOffset >= 0 ? "+" : ""}${rateOffset}%`;

      const response = await fetch(`${backendUrl}/api/convert/text-to-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ttsText,
          voice: selectedVoice.id,
          pitch: pitchStr,
          rate: rateStr
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.detail || "Failed to generate speech.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setTtsAudioUrl(url);
      setTtsStatus("completed");
    } catch (err: any) {
      setTtsError(err.message || "Failed to generate voiceover. Please try again.");
      setTtsStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 60 * 1024 * 1024) {
        setV2vError("File must be under 60MB.");
        return;
      }
      setSelectedFile(file);
      setV2vError("");
      setV2vAudioUrl(null);
      setV2vStatus("idle");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 60 * 1024 * 1024) {
        setV2vError("File must be under 60MB.");
        return;
      }
      if (!file.name.toLowerCase().match(/\.(mp3|wav|m4a|ogg|aac|mp4|mov|webm)$/)) {
        setV2vError("Please upload a valid audio or video file (.mp3, .wav, .m4a, .mp4, .mov)");
        return;
      }
      setSelectedFile(file);
      setV2vError("");
      setV2vAudioUrl(null);
      setV2vStatus("idle");
    }
  };

  const startV2VConversion = async () => {
    if (!selectedFile) return;

    setV2vStatus("uploading");
    setV2vError("");
    setV2vAudioUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", v2vMode);

      const response = await fetch(`${backendUrl}/api/convert/voice-changer`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to convert audio.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setV2vAudioUrl(url);
      setV2vStatus("completed");
    } catch (err: any) {
      setV2vError(err.message || "An error occurred during conversion.");
      setV2vStatus("error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            AI Voiceover & Voice Changer Studio
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Generate ultra-realistic, deep podcast narrator voices, clean child voices, or convert existing voice recordings with studio clarity.
          </p>

          {/* Mode Tabs */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="inline-flex p-1.5 rounded-2xl bg-muted/60 border border-border/80">
              <button
                onClick={() => setActiveTab("tts")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "tts"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Type className="w-4 h-4" />
                Text to Voice (AI Voiceover)
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-violet-400/20 text-violet-200">
                  New & Neural
                </span>
              </button>

              <button
                onClick={() => setActiveTab("v2v")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "v2v"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="w-4 h-4" />
                Voice to Voice (Audio Changer)
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: TEXT TO VOICE (TTS) */}
        {activeTab === "tts" && (
          <div className="space-y-6">
            {/* Quick Sample Prompts */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                Quick Prompts:
              </label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTtsText(sample.text)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 text-foreground transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Type className="w-4 h-4 text-violet-500" />
                  Your Voiceover Script
                </label>
                <span className="text-xs text-muted-foreground">
                  {ttsText.length} / 4,000 characters
                </span>
              </div>
              <textarea
                rows={4}
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Type or paste the script you want the AI voice to speak..."
                className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none shadow-sm"
              />
            </div>

            {/* Voice Presets */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Radio className="w-4 h-4 text-violet-500" />
                Select AI Voice Preset
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TTS_VOICES.map((v) => {
                  const isSelected = selectedVoice.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVoiceSelect(v)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "border-violet-500 bg-violet-500/10 shadow-sm"
                          : "border-border/70 bg-card hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            {v.name}
                            <span className="text-[10px] font-semibold text-muted-foreground">({v.gender})</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            isSelected ? "bg-violet-500 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {v.category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">
                          {v.role}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {v.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{v.lang}</span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning Controls */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-violet-500" />
                  Voice Depth & Speed Controls
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPitchOffset(parseInt(selectedVoice.defaultPitch) || 0);
                    setRateOffset(parseInt(selectedVoice.defaultRate) || 0);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted-foreground">Pitch (Deepness):</span>
                    <span className="font-bold text-foreground">{pitchOffset >= 0 ? `+${pitchOffset}` : pitchOffset} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    value={pitchOffset}
                    onChange={(e) => setPitchOffset(parseInt(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Deeper (-15Hz)</span>
                    <span>Natural (0Hz)</span>
                    <span>Higher (+15Hz)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted-foreground">Speed (Speaking Rate):</span>
                    <span className="font-bold text-foreground">{rateOffset >= 0 ? `+${rateOffset}` : rateOffset}%</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="2"
                    value={rateOffset}
                    onChange={(e) => setRateOffset(parseInt(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Slower (-30%)</span>
                    <span>Normal (0%)</span>
                    <span>Faster (+30%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {ttsError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{ttsError}</p>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              onClick={generateTTS}
              disabled={ttsStatus === "generating"}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50"
            >
              {ttsStatus === "generating" ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Synthesizing Neural Speech...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {selectedVoice.name} Voiceover
                </>
              )}
            </button>

            {/* Result Audio Player */}
            {ttsAudioUrl && ttsStatus === "completed" && (
              <div className="pt-6 border-t border-border/60 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    AI Voiceover Ready!
                  </div>

                  <audio controls src={ttsAudioUrl} className="w-full max-w-md mx-auto" autoPlay />

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={ttsAudioUrl}
                      download={`botock_${selectedVoice.name.toLowerCase()}_voiceover.mp3`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download High-Quality MP3
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VOICE TO VOICE (AUDIO FILE CHANGER) */}
        {activeTab === "v2v" && (
          <div className="space-y-6">
            {!selectedFile ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-muted/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="audio/*,video/*,.mp4,.mov,.webm,.m4a,.wav,.mp3" 
                  className="hidden" 
                />
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">Upload Audio or Video File</h3>
                <p className="text-xs text-muted-foreground">Supported: MP3, WAV, M4A, MP4, MOV, WebM (Max 60MB)</p>
              </div>
            ) : (
              <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setV2vAudioUrl(null);
                    setV2vStatus("idle");
                  }}
                  className="text-xs font-semibold text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            )}

            {selectedFile && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-violet-500" />
                  Select Voice Filter
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VOICE_MODES.map((vm) => (
                    <button
                      key={vm.id}
                      onClick={() => setV2vMode(vm.id)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        v2vMode === vm.id 
                          ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold" 
                          : "border-border bg-card hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      {vm.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startV2VConversion}
                  disabled={v2vStatus === "uploading"}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
                >
                  {v2vStatus === "uploading" ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Transforming Voice...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Transform Voice
                    </>
                  )}
                </button>
              </div>
            )}

            {v2vError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{v2vError}</p>
              </div>
            )}

            {v2vAudioUrl && v2vStatus === "completed" && (
              <div className="pt-6 border-t border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" />
                  Preview & Download
                </h3>
                
                <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center space-y-6">
                  <audio controls src={v2vAudioUrl} className="w-full max-w-md mx-auto" />
                  
                  <a
                    href={v2vAudioUrl}
                    download={`botock_voice_${v2vMode}.mp3`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Converted Audio
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
