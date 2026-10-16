"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Mic,
  Square,
  Download,
  Settings2,
  Sparkles,
  AlertCircle,
  Type,
  Radio,
  Sliders,
  Check,
  RefreshCw,
  Wand2,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { getTransferMedia } from "@/app/utils/mediaTransfer";

interface TTSVoice {
  id: string;
  name: string;
  role: string;
  category: "Deep & Narrator" | "Female Hosts" | "International" | "Kids & Youth";
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
    desc: "Ultra-realistic, deep authoritative voice for podcasts, video essays, and documentaries.",
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
    desc: "Rich, dynamic voice ideal for YouTube shorts, narrations, and explaining concepts.",
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
    desc: "Resonant, heavy cinematic voice with gravity, suspense, and presence.",
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
    desc: "Sophisticated British narrator voice with natural BBC-style depth and cadence.",
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
    desc: "Warm, professional, crystal-clear studio voice for podcasts and audiobooks.",
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
    desc: "Modern energetic tone perfect for social media reels, ads, and character dialogues.",
  },
  {
    id: "en-GB-SoniaNeural",
    name: "Sonia",
    role: "British Literary & Voiceover",
    category: "Female Hosts",
    gender: "Female",
    lang: "English (UK)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Refined, articulate British English voice perfect for audiobooks and luxury ads.",
  },
  {
    id: "en-AU-WilliamNeural",
    name: "William",
    role: "Australian Natural Narrator",
    category: "International",
    gender: "Male",
    lang: "English (AUS)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Clean, natural Australian accent with genuine warmth and conversational clarity.",
  },
  {
    id: "es-ES-AlvaroNeural",
    name: "Alvaro",
    role: "Spanish Global Voiceover",
    category: "International",
    gender: "Male",
    lang: "Spanish (ES)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Professional Spanish narrator voice for international commercials and presentations.",
  },
  {
    id: "fr-FR-HenriNeural",
    name: "Henri",
    role: "European French Narrator",
    category: "International",
    gender: "Male",
    lang: "French (FR)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Sophisticated, smooth European French narration for documentaries and audiobooks.",
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
    desc: "Pure, crystal-clean natural child voice for cartoons, bedtime stories, and youth dialogues.",
  },
];

const SAMPLE_PROMPTS = [
  {
    label: "🎙️ Deep Podcast",
    text: "Welcome back to the midnight podcast. In tonight's episode, we explore the deep mysteries of the universe that science is only beginning to understand.",
  },
  {
    label: "🎬 Movie Trailer",
    text: "In a world lost to chaos, one warrior will rise to challenge destiny itself. Prepare for the ultimate cinematic journey.",
  },
  {
    label: "🌍 Global Commercial",
    text: "Empowering visionary creators and enterprises across the globe with cutting-edge artificial intelligence, designed for tomorrow.",
  },
  {
    label: "🎧 Audiobook Story",
    text: "The library smelled of ancient parchment and rain. Somewhere among the shadowed mahogany shelves, a clock gently ticked away centuries.",
  },
  {
    label: "🚀 Tech Explainer",
    text: "Meet the future of automated workflows. Lightning fast, ultra-reliable, and built from the ground up for modern teams worldwide.",
  },
  {
    label: "👦 Kid Story",
    text: "Once upon a time in a sunny green forest, a curious little bunny found a shiny golden key hidden under an old oak tree!",
  },
];

const VOICE_MODES = [
  { id: "man_deep",         label: "👨 Deep Voice Man",         category: "Natural" },
  { id: "women",            label: "👩 Woman Voice",             category: "Natural" },
  { id: "kid",              label: "👦 Kid Voice",               category: "Natural" },
  { id: "little_girl",      label: "👧 Little Girl",             category: "Natural" },
  { id: "man_old",          label: "👴 Old Man",                 category: "Natural" },
  { id: "old_women",        label: "👵 Old Woman",               category: "Natural" },
  { id: "strict",           label: "👔 Strict / Bossy",          category: "Natural" },
  { id: "deep_villain",     label: "😈 Deep Villain",            category: "Cinematic" },
  { id: "clone_morgan",     label: "🎙️ Deep Narrator Style",    category: "Cinematic" },
  { id: "clone_elon",       label: "🚀 Tech CEO Shift",          category: "Cinematic" },
  { id: "clone_anime_girl", label: "🌸 Anime Voice",             category: "Cinematic" },
  { id: "robot",            label: "🤖 AI Cyborg",               category: "FX" },
  { id: "chipmunk",         label: "🐿️ Chipmunk",               category: "FX" },
  { id: "echo_chamber",     label: "⛰️ Cinema Hall Echo",        category: "FX" },
  { id: "telephone",        label: "📞 Vintage Radio",           category: "FX" },
  { id: "privacy_disguiser",label: "🕵️ Anonymous Hacker",       category: "FX" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Natural:   "text-emerald-600 dark:text-emerald-400",
  Cinematic: "text-violet-600 dark:text-violet-400",
  FX:        "text-amber-600 dark:text-amber-400",
};

export default function VoiceChangerClient() {
  const [activeTab, setActiveTab] = useState<"tts" | "clone" | "v2v">("tts");

  // --- TAB 1: TTS State ---
  const [ttsText, setTtsText] = useState(
    "Welcome to the deep voice AI studio. Every voice preset now uses its own unique neural speaker model with zero robotic repetition."
  );
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>(TTS_VOICES[0]);
  const [pitchOffset, setPitchOffset] = useState<number>(-4);
  const [rateOffset, setRateOffset] = useState<number>(-2);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<"idle" | "generating" | "completed" | "error">("idle");
  const [ttsError, setTtsError] = useState("");

  // --- TAB 2: AI Zero-Shot Voice Cloning State ---
  const [cloneMode, setCloneMode] = useState<"text" | "audio">("text");
  const [refVoiceFile, setRefVoiceFile] = useState<File | null>(null);
  const [cloneText, setCloneText] = useState(
    "Hello! This is my cloned AI voice generated in real time using zero-shot neural synthesis."
  );
  const [cloneSourceFile, setCloneSourceFile] = useState<File | null>(null);
  const [cloneStatus, setCloneStatus] = useState<"idle" | "cloning" | "completed" | "error">("idle");
  const [cloneError, setCloneError] = useState("");
  const [cloneAudioUrl, setCloneAudioUrl] = useState<string | null>(null);

  // --- TAB 3: Voice-to-Voice State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [v2vMode, setV2vMode] = useState<string>("man_deep");
  const [v2vStatus, setV2vStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [v2vError, setV2vError] = useState("");
  const [v2vAudioUrl, setV2vAudioUrl] = useState<string | null>(null);

  // --- Live Microphone Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<"v2v" | "ref" | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refVoiceInputRef = useRef<HTMLInputElement>(null);
  const cloneSourceInputRef = useRef<HTMLInputElement>(null);

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
    return () => {
      mounted = false;
      if (ttsAudioUrl) URL.revokeObjectURL(ttsAudioUrl);
      if (v2vAudioUrl) URL.revokeObjectURL(v2vAudioUrl);
      if (cloneAudioUrl) URL.revokeObjectURL(cloneAudioUrl);
    };
  }, [ttsAudioUrl, v2vAudioUrl, cloneAudioUrl]);

  const startMicRecording = async (target: "v2v" | "ref") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const recordedFile = new File([blob], `mic_recording_${Date.now()}.webm`, { type: "audio/webm" });
        if (target === "v2v") {
          setSelectedFile(recordedFile);
          setV2vStatus("idle");
        } else {
          setRefVoiceFile(recordedFile);
          setCloneStatus("idle");
        }
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setRecordingTarget(null);
      };

      mr.start();
      setIsRecording(true);
      setRecordingTarget(target);
    } catch {
      alert("Microphone permission denied or unavailable.");
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    const voice = TTS_VOICES.find((v) => v.id === voiceId);
    if (!voice) return;
    setSelectedVoice(voice);
    setPitchOffset(parseInt(voice.defaultPitch) || 0);
    setRateOffset(parseInt(voice.defaultRate) || 0);
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

      const payload = JSON.stringify({ text: ttsText, voice: selectedVoice.id, pitch: pitchStr, rate: rateStr });

      let response: Response | null = null;
      try {
        response = await fetch("/api/convert/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      } catch { response = null; }

      if (!response || !response.ok) {
        if (backendUrl && backendUrl !== "" && backendUrl !== "/api/proxy") {
          const directRes = await fetch(`${backendUrl}/api/convert/text-to-speech`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          }).catch(() => null);
          if (directRes && directRes.ok) response = directRes;
        }
      }

      if (!response || !response.ok) {
        const errJson = response ? await response.json().catch(() => null) : null;
        throw new Error(errJson?.detail || "Voiceover synthesis failed. Please try again.");
      }

      const blob = await response.blob();
      if (ttsAudioUrl) URL.revokeObjectURL(ttsAudioUrl);
      setTtsAudioUrl(URL.createObjectURL(blob));
      setTtsStatus("completed");
    } catch (err: any) {
      setTtsError(err.message || "Failed to generate voiceover. Please try again.");
      setTtsStatus("error");
    }
  };

  const startVoiceCloning = async () => {
    if (!refVoiceFile) {
      setCloneError("Please upload or record a 5-15 second reference voice sample first.");
      return;
    }
    if (cloneMode === "text" && !cloneText.trim()) {
      setCloneError("Please enter text for the cloned voice to speak.");
      return;
    }
    if (cloneMode === "audio" && !cloneSourceFile) {
      setCloneError("Please upload the source audio you want to convert into the target voice.");
      return;
    }

    setCloneStatus("cloning");
    setCloneError("");
    setCloneAudioUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("reference_voice", refVoiceFile);
      formData.append("clone_type", cloneMode);
      if (cloneMode === "text") formData.append("text", cloneText);
      else if (cloneSourceFile) formData.append("source_audio", cloneSourceFile);

      let response: Response | null = null;
      try {
        response = await fetch("/api/convert/voice-clone", { method: "POST", body: formData });
      } catch { response = null; }

      if (!response || !response.ok) {
        if (backendUrl && backendUrl !== "" && backendUrl !== "/api/proxy") {
          const directRes = await fetch(`${backendUrl}/api/convert/voice-clone`, {
            method: "POST", body: formData,
          }).catch(() => null);
          if (directRes && directRes.ok) response = directRes;
        }
      }

      if (!response || !response.ok) {
        const errJson = response ? await response.json().catch(() => null) : null;
        throw new Error(errJson?.detail || "Voice cloning failed. Ensure the Python backend is running with gradio_client installed.");
      }

      const blob = await response.blob();
      if (cloneAudioUrl) URL.revokeObjectURL(cloneAudioUrl);
      setCloneAudioUrl(URL.createObjectURL(blob));
      setCloneStatus("completed");
    } catch (err: any) {
      setCloneError(err.message || "An error occurred during AI voice cloning.");
      setCloneStatus("error");
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

      let response: Response | null = null;
      try {
        response = await fetch("/api/convert/voice-changer", { method: "POST", body: formData });
      } catch { response = null; }

      if (!response || !response.ok) {
        if (backendUrl && backendUrl !== "" && backendUrl !== "/api/proxy") {
          const directRes = await fetch(`${backendUrl}/api/convert/voice-changer`, {
            method: "POST", body: formData,
          }).catch(() => null);
          if (directRes && directRes.ok) response = directRes;
        }
      }

      if (!response || !response.ok) {
        const errorData = response ? await response.json().catch(() => null) : null;
        throw new Error(errorData?.detail || "Failed to transform audio.");
      }

      const blob = await response.blob();
      if (v2vAudioUrl) URL.revokeObjectURL(v2vAudioUrl);
      setV2vAudioUrl(URL.createObjectURL(blob));
      setV2vStatus("completed");
    } catch (err: any) {
      setV2vError(err.message || "An error occurred during conversion.");
      setV2vStatus("error");
    }
  };

  const selectedMode = VOICE_MODES.find((m) => m.id === v2vMode);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Voiceover & Voice Changer Studio
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            Generate ultra-realistic, deep podcast narrator voices, clean child voices, or convert existing voice recordings with studio clarity.
          </p>

          {/* ── Tabs ── */}
          <div className="flex items-center justify-center mt-6">
            <div className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]">
              <button
                onClick={() => setActiveTab("tts")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "tts"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Type className="w-4 h-4" />
                Text to Voice (AI Voiceover)
                {activeTab !== "tts" && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-500 dark:text-violet-300">
                    NEW & NEURAL
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("v2v")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "v2v"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Wand2 className="w-4 h-4" />
                Voice to Voice (Audio Changer)
              </button>

              <button
                onClick={() => setActiveTab("clone")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "clone"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                AI Voice Cloning
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-300">
                  Zero-Shot
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TAB 1: NEURAL TEXT TO SPEECH
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "tts" && (
          <div className="space-y-6">

            {/* Quick Prompts */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                QUICK PROMPTS:
              </label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTtsText(sample.text)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-300 dark:hover:border-violet-500/40 text-slate-700 dark:text-slate-300 transition-all"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Script textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Type className="w-4 h-4 text-violet-500" />
                  Your Voiceover Script
                </label>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {ttsText.length} / 4,000 characters
                </span>
              </div>
              <textarea
                rows={4}
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Type or paste the script you want the AI voice to speak..."
                className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none shadow-sm"
              />
            </div>

            {/* Voice Select Dropdown */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-violet-500" />
                Select AI Voice Preset
              </label>

              <div className="relative">
                <select
                  value={selectedVoice.id}
                  onChange={(e) => handleVoiceSelect(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3.5 pr-10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer shadow-sm"
                >
                  <optgroup label="🎙️ Deep & Narrator">
                    {TTS_VOICES.filter((v) => v.category === "Deep & Narrator").map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.role} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="👩 Female Hosts">
                    {TTS_VOICES.filter((v) => v.category === "Female Hosts").map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.role} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌍 International">
                    {TTS_VOICES.filter((v) => v.category === "International").map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.role} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="👦 Kids & Youth">
                    {TTS_VOICES.filter((v) => v.category === "Kids & Youth").map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.role} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>

              {/* Selected Voice Info Card */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 text-sm font-black">
                  {selectedVoice.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedVoice.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-semibold">{selectedVoice.category}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{selectedVoice.lang}</span>
                  </div>
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-0.5">{selectedVoice.role}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{selectedVoice.desc}</p>
                </div>
              </div>
            </div>

            {/* Pitch & Rate Sliders */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-violet-500" />
                  Voice Depth & Speed Controls
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPitchOffset(parseInt(selectedVoice.defaultPitch) || 0);
                    setRateOffset(parseInt(selectedVoice.defaultRate) || 0);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Pitch (Deepness):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {pitchOffset >= 0 ? `+${pitchOffset}` : pitchOffset} Hz
                    </span>
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
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>Deeper (-15Hz)</span>
                    <span>Natural (0Hz)</span>
                    <span>Higher (+15Hz)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Speed (Speaking Rate):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rateOffset >= 0 ? `+${rateOffset}` : rateOffset}%
                    </span>
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
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>Slower (-30%)</span>
                    <span>Normal (0%)</span>
                    <span>Faster (+30%)</span>
                  </div>
                </div>
              </div>
            </div>

            {ttsError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{ttsError}</p>
              </div>
            )}

            <button
              onClick={generateTTS}
              disabled={ttsStatus === "generating"}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50"
            >
              {ttsStatus === "generating" ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synthesizing {selectedVoice.name} Neural Speech...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {selectedVoice.name} Voiceover
                </>
              )}
            </button>

            {ttsAudioUrl && ttsStatus === "completed" && (
              <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    {selectedVoice.name} Voiceover Ready!
                  </div>
                  <audio controls src={ttsAudioUrl} className="w-full max-w-md mx-auto" autoPlay />
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
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 3: VOICE TO VOICE (STUDIO FILTERS + LIVE MIC)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "v2v" && (
          <div className="space-y-6">
            {!selectedFile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-white/[0.1] hover:border-violet-400 dark:hover:border-violet-500/50 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-slate-50 dark:bg-white/[0.03] flex flex-col items-center justify-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }}
                    accept="audio/*,video/*,.mp4,.mov,.webm,.m4a,.wav,.mp3"
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-violet-500 mb-3" />
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Upload Audio or Video</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">MP3, WAV, M4A, MP4, MOV (Max 60MB)</p>
                </div>

                <button
                  type="button"
                  onClick={() => isRecording && recordingTarget === "v2v" ? stopMicRecording() : startMicRecording("v2v")}
                  className={`border-2 rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center ${
                    isRecording && recordingTarget === "v2v"
                      ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500 animate-pulse"
                      : "border-slate-200 dark:border-white/[0.1] hover:border-violet-400 dark:hover:border-violet-500/50 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white"
                  }`}
                >
                  {isRecording && recordingTarget === "v2v" ? (
                    <>
                      <Square className="w-10 h-10 mb-3 fill-current" />
                      <h3 className="font-bold">Stop Recording</h3>
                      <p className="text-xs mt-1 text-red-400">Recording microphone audio...</p>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 text-emerald-500 mb-3" />
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">Record Live Microphone</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Speak directly & transform your voice</p>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedFile(null); setV2vAudioUrl(null); setV2vStatus("idle"); }}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            )}

            {selectedFile && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-violet-500" />
                  Select AI Voice Preset
                </label>

                {/* Dropdown for voice mode */}
                <div className="relative">
                  <select
                    value={v2vMode}
                    onChange={(e) => setV2vMode(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3.5 pr-10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer shadow-sm"
                  >
                    <optgroup label="👤 Natural Voices">
                      {VOICE_MODES.filter((m) => m.category === "Natural").map((vm) => (
                        <option key={vm.id} value={vm.id}>{vm.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🎬 Cinematic & AI">
                      {VOICE_MODES.filter((m) => m.category === "Cinematic").map((vm) => (
                        <option key={vm.id} value={vm.id}>{vm.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🎛️ Special FX">
                      {VOICE_MODES.filter((m) => m.category === "FX").map((vm) => (
                        <option key={vm.id} value={vm.id}>{vm.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                </div>

                {/* Selected mode badge */}
                {selectedMode && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                    <span className="text-lg">{selectedMode.label.split(" ")[0]}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedMode.label.slice(selectedMode.label.indexOf(" ") + 1)}</p>
                      <p className={`text-[11px] font-semibold ${CATEGORY_COLORS[selectedMode.category]}`}>{selectedMode.category} Filter</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={startV2VConversion}
                  disabled={v2vStatus === "uploading"}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
                >
                  {v2vStatus === "uploading" ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Transforming Voice...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Transform Voice Now
                    </>
                  )}
                </button>
              </div>
            )}

            {v2vError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{v2vError}</p>
              </div>
            )}

            {v2vAudioUrl && v2vStatus === "completed" && (
              <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" /> Voice Transformed!
                  </div>
                  <audio controls src={v2vAudioUrl} className="w-full max-w-md mx-auto" autoPlay />
                  <a
                    href={v2vAudioUrl}
                    download={`botock_voice_${v2vMode}.wav`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Transformed Audio
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: AI ZERO-SHOT VOICE CLONING
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "clone" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/5 border border-violet-200 dark:border-violet-500/20 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Open-Source Zero-Shot AI Voice Cloning:</strong>{" "}
              Upload or record a clear <strong>5 to 15 second voice clip</strong> of any speaker (no background music). Our AI will clone the exact vocal timbre, accent, and cadence for free!
            </div>

            {/* Step 1: Reference Voice */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                1. Reference Voice Sample (Target Voice to Clone)
              </label>
              {!refVoiceFile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => refVoiceInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-white/[0.1] hover:border-violet-400 dark:hover:border-violet-500/50 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-slate-50 dark:bg-white/[0.03] flex flex-col items-center justify-center"
                  >
                    <input
                      type="file"
                      ref={refVoiceInputRef}
                      onChange={(e) => { if (e.target.files?.[0]) setRefVoiceFile(e.target.files[0]); }}
                      accept="audio/*,.mp3,.wav,.m4a,.webm"
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-violet-500 mb-2" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Upload Reference Audio</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">5–15 sec clean voice clip (MP3/WAV)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => isRecording && recordingTarget === "ref" ? stopMicRecording() : startMicRecording("ref")}
                    className={`border-2 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center ${
                      isRecording && recordingTarget === "ref"
                        ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500 animate-pulse"
                        : "border-slate-200 dark:border-white/[0.1] hover:border-violet-400 dark:hover:border-violet-500/50 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white"
                    }`}
                  >
                    {isRecording && recordingTarget === "ref" ? (
                      <>
                        <Square className="w-8 h-8 mb-2 fill-current" />
                        <span className="font-bold text-sm">Stop Recording Sample</span>
                        <span className="text-xs mt-1 text-red-400">Speak naturally for 10 seconds...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-8 h-8 text-emerald-500 mb-2" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Record Your Voice Live</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clone your own voice via Mic</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{refVoiceFile.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Reference Voice Loaded</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRefVoiceFile(null)}
                    className="text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Change Sample
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Clone Mode */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                2. How do you want to use the Cloned Voice?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCloneMode("text")}
                  className={`p-3.5 rounded-xl border text-sm font-bold transition-all ${
                    cloneMode === "text"
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
                      : "border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-500/30"
                  }`}
                >
                  📝 Speak Text (F5-TTS Zero-Shot)
                </button>
                <button
                  type="button"
                  onClick={() => setCloneMode("audio")}
                  className={`p-3.5 rounded-xl border text-sm font-bold transition-all ${
                    cloneMode === "audio"
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
                      : "border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-500/30"
                  }`}
                >
                  🎙️ Convert Another Audio (Seed-VC)
                </button>
              </div>
            </div>

            {cloneMode === "text" ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  3. Script for Cloned Voice to Speak
                </label>
                <textarea
                  rows={3}
                  value={cloneText}
                  onChange={(e) => setCloneText(e.target.value)}
                  placeholder="Enter text for the cloned voice to say..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  3. Upload Source Audio (Speech to Convert into Reference Voice)
                </label>
                {!cloneSourceFile ? (
                  <div
                    onClick={() => cloneSourceInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-white/[0.1] hover:border-violet-400 dark:hover:border-violet-500/50 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-white/[0.03]"
                  >
                    <input
                      type="file"
                      ref={cloneSourceInputRef}
                      onChange={(e) => { if (e.target.files?.[0]) setCloneSourceFile(e.target.files[0]); }}
                      accept="audio/*,.mp3,.wav,.m4a,.webm"
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Select Source Audio Recording</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cloneSourceFile.name}</span>
                    <button
                      onClick={() => setCloneSourceFile(null)}
                      className="text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {cloneError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{cloneError}</p>
              </div>
            )}

            <button
              onClick={startVoiceCloning}
              disabled={cloneStatus === "cloning"}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50"
            >
              {cloneStatus === "cloning" ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cloning Voice Characteristics (Takes ~15-25s)...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Clone Voice & Synthesize Audio
                </>
              )}
            </button>

            {cloneAudioUrl && cloneStatus === "completed" && (
              <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Cloned AI Voice Ready!
                  </div>
                  <audio controls src={cloneAudioUrl} className="w-full max-w-md mx-auto" autoPlay />
                  <a
                    href={cloneAudioUrl}
                    download="botock_cloned_voice.mp3"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Cloned MP3
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
