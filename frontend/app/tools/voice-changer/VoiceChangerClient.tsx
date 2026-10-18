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
  Flame,
  Cpu,
} from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { getTransferMedia } from "@/app/utils/mediaTransfer";
import { getToolStatus, isToolBlocked } from "@/lib/toolAccess";

interface TTSVoice {
  id: string;
  name: string;
  role: string;
  category:
    | "Deep & Narrator"
    | "Female Hosts"
    | "Urdu & Hindi"
    | "International"
    | "Kids & Youth";
  gender: string;
  lang: string;
  defaultPitch: string;
  defaultRate: string;
  desc: string;
}

interface ClonePreset {
  id: string;
  name: string;
  badge: string;
  desc: string;
  sampleScript: string;
}

const CLONE_PRESETS: ClonePreset[] = [
  {
    id: "preset_movie_narrator",
    name: "🎬 Deep Movie Narrator",
    badge: "Cinema Bass",
    desc: "Heavy, resonant Hollywood movie trailer & documentary narrator voice.",
    sampleScript:
      "In a world pushed to the edge of darkness, one forgotten legend will rise from the ashes to rewrite human destiny.",
  },
  {
    id: "preset_anime_heroine",
    name: "🌸 Anime Star / VTuber",
    badge: "Anime Youth",
    desc: "Bright, expressive anime protagonist & VTuber voice with crisp high formants.",
    sampleScript:
      "Sugoi! Did you really build this entire neural AI studio by yourself? Let's test our ultimate power together!",
  },
  {
    id: "preset_studio_podcaster",
    name: "🎙️ Studio Podcast Host",
    badge: "Broadcast Pro",
    desc: "Warm, ultra-close Shure SM7B broadcast mic tone for podcasts and YouTube essays.",
    sampleScript:
      "Welcome back to the podcast. Today we're diving deep into how open-source voice cloning is changing content creation forever.",
  },
  {
    id: "preset_british_detective",
    name: "🕵️‍♂️ British Detective",
    badge: "UK Classic",
    desc: "Refined, razor-sharp British aristocratic narrator for mysteries and audiobooks.",
    sampleScript:
      "Look closely at the evidence on the table. The culprit left behind a single unmistakable trace in the London rain.",
  },
  {
    id: "preset_tech_visionary",
    name: "🚀 Tech Keynote CEO",
    badge: "Silicon Valley",
    desc: "Measured, thoughtful engineering leader cadence for product demos and explainers.",
    sampleScript:
      "From first principles, if we want artificial intelligence to empower everyone, it needs to be fast, open, and completely free.",
  },
  {
    id: "preset_cyberpunk_ai",
    name: "🤖 Cyberpunk AI Core",
    badge: "Sci-Fi Neural",
    desc: "Sleek, futuristic holographic AI assistant with subtle harmonic modulation.",
    sampleScript:
      "Biometric scan confirmed. Welcome aboard the orbital station, Commander. All neural synthesis engines are operating at peak capacity.",
  },
];

const TTS_VOICES: TTSVoice[] = [
  // --- URDU & HINDI NEURAL VOICES ---
  {
    id: "ur-PK-AsadNeural",
    name: "Asad (اسد)",
    role: "Pakistani Urdu Male Narrator",
    category: "Urdu & Hindi",
    gender: "Male",
    lang: "Urdu (Pakistan)",
    defaultPitch: "-2Hz",
    defaultRate: "+0%",
    desc: "Natural Pakistani Urdu male voice for YouTube documentaries, poetry, news, and Islamic stories.",
  },
  {
    id: "ur-PK-UzmaNeural",
    name: "Uzma (عظمیٰ)",
    role: "Pakistani Urdu Female Host",
    category: "Urdu & Hindi",
    gender: "Female",
    lang: "Urdu (Pakistan)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Warm, clear Pakistani Urdu female voice ideal for commercials, storytelling, and educational videos.",
  },
  {
    id: "hi-IN-MadhurNeural",
    name: "Madhur (मधुर)",
    role: "Deep Hindi Documentary Host",
    category: "Urdu & Hindi",
    gender: "Male",
    lang: "Hindi (India)",
    defaultPitch: "-3Hz",
    defaultRate: "-2%",
    desc: "Rich, authoritative Hindi male voiceover for kahaniyan, reels, podcasts, and explainers.",
  },
  {
    id: "hi-IN-SwaraNeural",
    name: "Swara (स्वरा)",
    role: "Expressive Hindi Studio Host",
    category: "Urdu & Hindi",
    gender: "Female",
    lang: "Hindi (India)",
    defaultPitch: "+0Hz",
    defaultRate: "+0%",
    desc: "Crystal-clear studio Hindi female voice for audiobooks, brand promos, and narration.",
  },

  // --- ENGLISH & GLOBAL NEURAL VOICES ---
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
    label: "🇵🇰 Urdu Documentary",
    text: "خوش آمدید! آج کی اس دستاویزی ویڈیو میں ہم کائنات کے ان پراسرار رازوں سے پردہ اٹھائیں گے جنہیں جان کر آپ حیران رہ جائیں گے۔",
  },
  {
    label: "🇮🇳 Hindi Kahani",
    text: "नमस्ते दोस्तों! आज की इस कहानी में हम एक ऐसे रहस्यमयी जंगल के बारे में जानेंगे जहाँ समय बिल्कुल रुक जाता है।",
  },
  {
    label: "🎙️ Deep Podcast",
    text: "Welcome back to the midnight podcast. In tonight's episode, we explore the deep mysteries of the universe that science is only beginning to understand.",
  },
  {
    label: "🎬 Movie Trailer",
    text: "In a world lost to chaos, one warrior will rise to challenge destiny itself. Prepare for the ultimate cinematic journey.",
  },
  {
    label: "🎧 Audiobook Story",
    text: "The library smelled of ancient parchment and rain. Somewhere among the shadowed mahogany shelves, a clock gently ticked away centuries.",
  },
  {
    label: "👦 Kid Story",
    text: "Once upon a time in a sunny green forest, a curious little bunny found a shiny golden key hidden under an old oak tree!",
  },
];

const VOICE_MODES = [
  { id: "man_deep", label: "👨 Deep Voice Man" },
  { id: "deep_villain", label: "😈 Deep Villain" },
  { id: "women", label: "👩 Woman Voice" },
  { id: "kid", label: "👦 Kid Voice" },
  { id: "little_girl", label: "👧 Little Girl" },
  { id: "clone_morgan", label: "🎙️ Deep Narrator (0.81x)" },
  { id: "clone_elon", label: "🚀 Tech CEO Shift" },
  { id: "clone_anime_girl", label: "🌸 Anime Voice" },
  { id: "man_old", label: "👴 Old Man" },
  { id: "old_women", label: "👵 Old Woman" },
  { id: "strict", label: "👔 Strict / Bossy" },
  { id: "robot", label: "🤖 AI Cyborg" },
  { id: "chipmunk", label: "🐿️ Chipmunk" },
  { id: "echo_chamber", label: "⛰️ Cinema Hall Echo" },
  { id: "telephone", label: "📞 Vintage Radio" },
  { id: "privacy_disguiser", label: "🕵️ Anonymous Hacker" },
];

// 🎛️ WebAudio DSP Filter Configurations (Used when Python Backend is Offline)
const WEBAUDIO_DSP_PROFILES: Record<
  string,
  {
    rate: number;
    bassGain: number;
    midFreq?: number;
    midGain?: number;
    trebleGain: number;
    echoDelay?: number;
    echoFeedback?: number;
    tremoloHz?: number;
  }
> = {
  // Voice Changer Modes (Tab 3)
  man_deep: { rate: 0.84, bassGain: 7, trebleGain: 1 },
  deep_villain: { rate: 0.75, bassGain: 10, trebleGain: 2, echoDelay: 0.14, echoFeedback: 0.28 },
  women: { rate: 1.19, bassGain: -4, trebleGain: 5 },
  kid: { rate: 1.26, bassGain: -5, trebleGain: 4 },
  little_girl: { rate: 1.35, bassGain: -6, trebleGain: 5 },
  clone_morgan: { rate: 0.81, bassGain: 8, trebleGain: 3 },
  clone_elon: { rate: 0.92, bassGain: 4, trebleGain: 2 },
  clone_anime_girl: { rate: 1.41, bassGain: -6, trebleGain: 6 },
  man_old: { rate: 0.89, bassGain: 3, trebleGain: -4, tremoloHz: 5.5 },
  old_women: { rate: 1.08, bassGain: -2, trebleGain: -3, tremoloHz: 6.0 },
  strict: { rate: 0.94, bassGain: 3, midFreq: 1800, midGain: 5, trebleGain: 3 },
  robot: { rate: 0.98, bassGain: 2, trebleGain: 6, echoDelay: 0.03, echoFeedback: 0.55 },
  chipmunk: { rate: 1.65, bassGain: -8, trebleGain: 6 },
  echo_chamber: { rate: 1.0, bassGain: 2, trebleGain: 2, echoDelay: 0.28, echoFeedback: 0.45 },
  telephone: { rate: 1.0, bassGain: -12, midFreq: 1600, midGain: 8, trebleGain: -10 },
  privacy_disguiser: { rate: 0.78, bassGain: 6, trebleGain: -4, echoDelay: 0.04, echoFeedback: 0.35 },

  // AI Voice Cloning Presets (Tab 2)
  preset_movie_narrator: { rate: 0.86, bassGain: 8, trebleGain: 2 },
  preset_anime_heroine: { rate: 1.24, bassGain: -4, trebleGain: 6 },
  preset_studio_podcaster: { rate: 0.95, bassGain: 6, trebleGain: 3 },
  preset_british_detective: { rate: 0.96, bassGain: 4, trebleGain: 3 },
  preset_tech_visionary: { rate: 0.98, bassGain: 3, trebleGain: 2 },
  preset_cyberpunk_ai: { rate: 0.94, bassGain: 4, trebleGain: 7, echoDelay: 0.025, echoFeedback: 0.3 },
};

// 🌊 WebAudio Synthesized Background Ambience Generator
async function mixAmbienceIntoBlob(voiceBlob: Blob, mode: string, volume: number): Promise<Blob> {
  if (mode === "none") return voiceBlob;

  try {
    const arrayBuffer = await voiceBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const voiceBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const offlineCtx = new OfflineAudioContext(
      voiceBuffer.numberOfChannels,
      voiceBuffer.length,
      voiceBuffer.sampleRate
    );

    // 1. Play Voice Buffer
    const voiceSource = offlineCtx.createBufferSource();
    voiceSource.buffer = voiceBuffer;
    voiceSource.connect(offlineCtx.destination);
    voiceSource.start(0);

    // 2. Synthesize Background Ambience Buffer
    const sampleRate = voiceBuffer.sampleRate;
    const duration = voiceBuffer.duration;
    const ambBuffer = offlineCtx.createBuffer(2, Math.ceil(sampleRate * duration), sampleRate);
    const left = ambBuffer.getChannelData(0);
    const right = ambBuffer.getChannelData(1);

    for (let i = 0; i < left.length; i++) {
      const t = i / sampleRate;
      if (mode === "rain") {
        // Pink/White noise for soft rain
        const noise = (Math.random() * 2 - 1) * 0.08;
        left[i] = noise;
        right[i] = noise;
      } else if (mode === "lofi_beat") {
        // Soft pulsing lofi rhythm & warm sub-bass hum
        const beat = Math.sin(t * Math.PI * 1.8) > 0.8 ? 0.12 : 0.02;
        const hum = Math.sin(t * 110 * Math.PI * 2) * 0.03;
        left[i] = beat + hum;
        right[i] = beat + hum;
      } else if (mode === "cinematic_drone") {
        // Deep cinematic suspense drone
        const drone = Math.sin(t * 55 * Math.PI * 2) * 0.08 + Math.sin(t * 82.5 * Math.PI * 2) * 0.05;
        left[i] = drone;
        right[i] = drone;
      }
    }

    const ambSource = offlineCtx.createBufferSource();
    ambSource.buffer = ambBuffer;
    ambSource.loop = true;

    const ambGain = offlineCtx.createGain();
    ambGain.gain.value = volume;

    ambSource.connect(ambGain);
    ambGain.connect(offlineCtx.destination);
    ambSource.start(0);

    const rendered = await offlineCtx.startRendering();
    await audioCtx.close();

    // Export to WAV Blob
    const numOfChan = rendered.numberOfChannels;
    const length = rendered.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(rendered.sampleRate);
    setUint32(rendered.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) {
      channels.push(rendered.getChannelData(i));
    }
    let offset = 0;
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([buffer], { type: "audio/wav" });
  } catch {
    return voiceBlob;
  }
}

export default function VoiceChangerClient() {
  const [activeTab, setActiveTab] = useState<"tts" | "clone" | "v2v">("tts");
  const [lastEngineUsed, setLastEngineUsed] = useState<string>("");

  // --- Background Ambience State ---
  const [selectedAmbience, setSelectedAmbience] = useState<string>("none");
  const [ambienceVolume, setAmbienceVolume] = useState<number>(0.15);

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
  const [refSourceType, setRefSourceType] = useState<"preset" | "custom">("preset");
  const [selectedClonePreset, setSelectedClonePreset] = useState<ClonePreset>(CLONE_PRESETS[0]);
  const [cloneMode, setCloneMode] = useState<"text" | "audio">("text");
  const [refVoiceFile, setRefVoiceFile] = useState<File | null>(null);
  const [cloneText, setCloneText] = useState(CLONE_PRESETS[0].sampleScript);
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

  // =========================================================================
  // 🎛️ UNIVERSAL WEBAUDIO DSP ENGINE (Fast Client-Side Fallback)
  // =========================================================================
  const processAudioWithWebAudioDSP = async (
    inputBlob: Blob,
    profileKey: string,
    customRateOverride?: number
  ): Promise<Blob> => {
    const arrayBuffer = await inputBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    const cfg = WEBAUDIO_DSP_PROFILES[profileKey] || {
      rate: customRateOverride || 1.0,
      bassGain: 3,
      trebleGain: 2,
    };

    const effectiveRate = customRateOverride || cfg.rate;
    const extraTailSeconds = cfg.echoDelay ? 1.2 : 0.1;
    const newLength = Math.ceil(decoded.length / effectiveRate) + Math.ceil(decoded.sampleRate * extraTailSeconds);

    const offlineCtx = new OfflineAudioContext(
      decoded.numberOfChannels,
      newLength,
      decoded.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;
    source.playbackRate.value = effectiveRate;

    // 1. Bass Shelf Filter
    const bassFilter = offlineCtx.createBiquadFilter();
    bassFilter.type = "lowshelf";
    bassFilter.frequency.value = 140;
    bassFilter.gain.value = cfg.bassGain;

    // 2. Mid Peaking Filter
    const midFilter = offlineCtx.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.frequency.value = cfg.midFreq || 1500;
    midFilter.Q.value = 1.0;
    midFilter.gain.value = cfg.midGain || 0;

    // 3. Treble Shelf Filter
    const trebleFilter = offlineCtx.createBiquadFilter();
    trebleFilter.type = "highshelf";
    trebleFilter.frequency.value = 3200;
    trebleFilter.gain.value = cfg.trebleGain;

    // 4. Studio Compressor
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 20;
    compressor.ratio.value = 3.5;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.15;

    source.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);

    // Optional Tremolo (Old Man / Old Woman vibrato)
    if (cfg.tremoloHz) {
      const tremoloGain = offlineCtx.createGain();
      tremoloGain.gain.value = 0.8;
      const lfo = offlineCtx.createOscillator();
      lfo.frequency.value = cfg.tremoloHz;
      const lfoDepth = offlineCtx.createGain();
      lfoDepth.gain.value = 0.2;
      lfo.connect(lfoDepth);
      lfoDepth.connect(tremoloGain.gain);
      lfo.start(0);

      trebleFilter.connect(tremoloGain);
      tremoloGain.connect(compressor);
    } else {
      trebleFilter.connect(compressor);
    }

    // Optional Echo / Cyborg Delay
    if (cfg.echoDelay && cfg.echoFeedback) {
      const delay = offlineCtx.createDelay(2.0);
      delay.delayTime.value = cfg.echoDelay;
      const feedback = offlineCtx.createGain();
      feedback.gain.value = cfg.echoFeedback;

      compressor.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(offlineCtx.destination);
    }

    compressor.connect(offlineCtx.destination);
    source.start(0);

    const rendered = await offlineCtx.startRendering();
    await audioCtx.close();

    // Encode Rendered AudioBuffer into 16-bit PCM WAV Blob
    const numOfChan = rendered.numberOfChannels;
    const length = rendered.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(rendered.sampleRate);
    setUint32(rendered.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) {
      channels.push(rendered.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  // --- Microphone Recording Logic ---
  const startMicRecording = async (target: "v2v" | "ref") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const recordedFile = new File([blob], `mic_recording_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        if (target === "v2v") {
          setSelectedFile(recordedFile);
          setV2vStatus("idle");
        } else {
          setRefVoiceFile(recordedFile);
          setRefSourceType("custom");
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

  const handleVoiceSelect = (voice: TTSVoice) => {
    setSelectedVoice(voice);
    setPitchOffset(parseInt(voice.defaultPitch) || 0);
    setRateOffset(parseInt(voice.defaultRate) || 0);
  };

  const handleClonePresetSelect = (preset: ClonePreset) => {
    setSelectedClonePreset(preset);
    setRefSourceType("preset");
    setCloneText(preset.sampleScript);
  };

  // =========================================================================
  // 1. GENERATE TTS (Python Backend First -> Next.js Neural Fallback Second)
  // =========================================================================
  const generateTTS = async () => {
    try {
      const toolStatus = await getToolStatus("voice-changer");
      const { blocked, reason } = isToolBlocked(toolStatus);
      if (blocked) {
        setTtsError(reason);
        setTtsStatus("idle");
        return;
      }
    } catch {}

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

      const payload = JSON.stringify({
        text: ttsText,
        voice: selectedVoice.id,
        pitch: pitchStr,
        rate: rateStr,
      });

      let response: Response | null = null;

      // Step A: Try Direct Python Backend First (if configured) for fastest native Edge-TTS
      if (backendUrl && backendUrl !== "" && backendUrl !== "/api/proxy") {
        try {
          const directRes = await fetch(`${backendUrl}/api/convert/text-to-speech`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            signal: AbortSignal.timeout(8000),
          });
          if (directRes.ok) {
            response = directRes;
            setLastEngineUsed("Python Neural Backend (Online)");
          }
        } catch {
          response = null;
        }
      }

      // Step B: Try Next.js Proxy Route (which automatically talks to Python Backend OR Serverless Multi-Voice Fallback)
      if (!response || !response.ok) {
        response = await fetch("/api/convert/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      }

      if (!response || !response.ok) {
        const errJson = response ? await response.json().catch(() => null) : null;
        throw new Error(errJson?.detail || "Voiceover synthesis failed. Please try again.");
      }

      let blob = await response.blob();
      const engineHeader = response.headers.get("X-Voice-Engine");

      // If served by Serverless Fallback and user adjusted Pitch/Speed sliders, apply instant WebAudio pitch/rate
      if (engineHeader === "Botock-Serverless-TTS-Fallback") {
        setLastEngineUsed("Serverless Neural Engine + WebAudio DSP");
        // If user selected Male Urdu/Hindi voice (Asad/Madhur) on fallback, shift pitch deeper so it sounds naturally male
        const isMaleSouthAsianFallback =
          selectedVoice.id === "ur-PK-AsadNeural" ||
          selectedVoice.id === "hi-IN-MadhurNeural";
        const baseMaleShift = isMaleSouthAsianFallback ? -7 : 0;
        const totalPitch = pitchOffset + baseMaleShift;

        if (totalPitch !== 0 || rateOffset !== 0) {
          const customRate = Math.max(
            0.72,
            Math.min(1.45, 1.0 + totalPitch * 0.014 + rateOffset * 0.005)
          );
          blob = await processAudioWithWebAudioDSP(blob, "man_deep", customRate);
        }
      } else if (!lastEngineUsed) {
        setLastEngineUsed("Python Neural Backend (Online)");
      }

      // 🌊 Apply Optional Background Ambience Mix
      let finalBlob = blob;
      if (selectedAmbience !== "none") {
        finalBlob = await mixAmbienceIntoBlob(finalBlob, selectedAmbience, ambienceVolume);
      }

      if (ttsAudioUrl) URL.revokeObjectURL(ttsAudioUrl);
      setTtsAudioUrl(URL.createObjectURL(finalBlob));
      setTtsStatus("completed");
    } catch (err: any) {
      setTtsError(err.message || "Failed to generate voiceover. Please try again.");
      setTtsStatus("error");
    }
  };

  // =========================================================================
  // 2. AI VOICE CLONING (Python F5-TTS/Seed-VC First -> Serverless + WebAudio Second)
  // =========================================================================
  const startVoiceCloning = async () => {
    try {
      const toolStatus = await getToolStatus("voice-changer");
      const { blocked, reason } = isToolBlocked(toolStatus);
      if (blocked) {
        setCloneError(reason);
        setCloneStatus("idle");
        return;
      }
    } catch {}

    if (refSourceType === "custom" && !refVoiceFile) {
      setCloneError(
        "Please upload or record a 5-15 second reference voice sample, or switch to Built-in Presets."
      );
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

      if (refSourceType === "preset") {
        formData.append("preset_id", selectedClonePreset.id);
      } else if (refVoiceFile) {
        formData.append("reference_voice", refVoiceFile);
      }

      formData.append("clone_type", cloneMode);
      if (cloneMode === "text") {
        formData.append("text", cloneText);
      } else if (cloneSourceFile) {
        formData.append("source_audio", cloneSourceFile);
      }

      let response: Response | null = null;

      // Step A: Try Direct Python Backend First
      if (backendUrl && backendUrl !== "" && backendUrl !== "/api/proxy") {
        try {
          const directRes = await fetch(`${backendUrl}/api/convert/voice-clone`, {
            method: "POST",
            body: formData,
          });
          if (directRes.ok) {
            response = directRes;
            setLastEngineUsed("Python Zero-Shot GPU Cloner (Online)");
          }
        } catch {
          response = null;
        }
      }

      // Step B: Try Next.js Proxy Route (with automatic Serverless Fallback)
      if (!response || !response.ok) {
        try {
          response = await fetch("/api/convert/voice-clone", {
            method: "POST",
            body: formData,
          });
        } catch {
          response = null;
        }
      }

      // Step C: If Python Backend is Offline AND user chose "Convert Another Audio (Audio Mode)", run Instant Browser DSP!
      if ((!response || !response.ok) && cloneMode === "audio" && cloneSourceFile) {
        const profileId =
          refSourceType === "preset" ? selectedClonePreset.id : "preset_studio_podcaster";
        let dspBlob = await processAudioWithWebAudioDSP(cloneSourceFile, profileId);
        if (selectedAmbience !== "none") {
          dspBlob = await mixAmbienceIntoBlob(dspBlob, selectedAmbience, ambienceVolume);
        }
        if (cloneAudioUrl) URL.revokeObjectURL(cloneAudioUrl);
        setCloneAudioUrl(URL.createObjectURL(dspBlob));
        setLastEngineUsed("Instant Browser WebAudio DSP (Backend Offline Mode)");
        setCloneStatus("completed");
        return;
      }

      if (!response || !response.ok) {
        const errJson = response ? await response.json().catch(() => null) : null;
        throw new Error(errJson?.detail || "Voice cloning failed. Please try again.");
      }

      let blob = await response.blob();
      const engineHeader = response.headers.get("X-Voice-Engine");

      if (engineHeader === "Botock-Serverless-Clone-Fallback") {
        const profileId =
          refSourceType === "preset" ? selectedClonePreset.id : "preset_studio_podcaster";
        blob = await processAudioWithWebAudioDSP(blob, profileId);
        setLastEngineUsed("Serverless Neural + WebAudio Mastering");
      } else {
        setLastEngineUsed("Python Zero-Shot AI Cloner (Online)");
      }

      // 🌊 Apply Optional Background Ambience Mix
      let finalBlob = blob;
      if (selectedAmbience !== "none") {
        finalBlob = await mixAmbienceIntoBlob(finalBlob, selectedAmbience, ambienceVolume);
      }

      if (cloneAudioUrl) URL.revokeObjectURL(cloneAudioUrl);
      setCloneAudioUrl(URL.createObjectURL(finalBlob));
      setCloneStatus("completed");
    } catch (err: any) {
      setCloneError(err.message || "An error occurred during AI voice cloning.");
      setCloneStatus("error");
    }
  };

  // =========================================================================
  // 3. VOICE CHANGER & FILTERS (Python FFmpeg First -> Instant WebAudio Second)
  // =========================================================================
  const startV2VConversion = async () => {
    try {
      const toolStatus = await getToolStatus("voice-changer");
      const { blocked, reason } = isToolBlocked(toolStatus);
      if (blocked) {
        setV2vError(reason);
        setV2vStatus("idle");
        return;
      }
    } catch {}

    if (!selectedFile) return;

    setV2vStatus("uploading");
    setV2vError("");
    setV2vAudioUrl(null);

    try {
      // 1. Instant Browser WebAudio DSP Engine (Zero Server Latency, 100% Reliable, Instant <1s execution)
      try {
        let dspBlob = await processAudioWithWebAudioDSP(selectedFile, v2vMode);
        if (selectedAmbience !== "none") {
          dspBlob = await mixAmbienceIntoBlob(dspBlob, selectedAmbience, ambienceVolume);
        }
        if (v2vAudioUrl) URL.revokeObjectURL(v2vAudioUrl);
        setV2vAudioUrl(URL.createObjectURL(dspBlob));
        setLastEngineUsed("Instant Browser WebAudio DSP (100% Client-Side)");
        setV2vStatus("completed");
        return;
      } catch (clientDspErr) {
        console.warn("Client DSP failed, falling back to backend FFmpeg:", clientDspErr);
      }

      // 2. Python Backend Studio Fallback (using valid /api/video/voice-changer route)
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", v2vMode);

      let response: Response | null = null;
      if (backendUrl && backendUrl !== "" && backendUrl !== "/api/proxy") {
        try {
          const directRes = await fetch(`${backendUrl}/api/video/voice-changer`, {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(6000),
          });
          if (directRes.ok) {
            response = directRes;
          }
        } catch {
          response = null;
        }
      }

      if (response && response.ok) {
        let blob = await response.blob();
        if (selectedAmbience !== "none") {
          blob = await mixAmbienceIntoBlob(blob, selectedAmbience, ambienceVolume);
        }
        if (v2vAudioUrl) URL.revokeObjectURL(v2vAudioUrl);
        setV2vAudioUrl(URL.createObjectURL(blob));
        setLastEngineUsed("Python FFmpeg Studio Backend (Online)");
        setV2vStatus("completed");
        return;
      }

      throw new Error("Could not process this file format. Please try an MP3 or WAV file.");
    } catch (err: any) {
      setV2vError(
        err.message || "Could not process this file format. Please try an MP3 or WAV file."
      );
      setV2vStatus("error");
    }
  };

  // --- Background Ambience Mixer Component ---
  const renderAmbienceMixer = () => (
    <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          Background Studio Ambience Mixer
        </span>
        {selectedAmbience !== "none" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-400">
            Active: {selectedAmbience.toUpperCase()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: "none", label: "🔇 Clean Voice" },
          { id: "lofi_beat", label: "🎧 Lofi Podcast Beat" },
          { id: "rain", label: "🌧️ Soft Cinema Rain" },
          { id: "cinematic_drone", label: "🛸 Sci-Fi Space Drone" },
        ].map((amb) => (
          <button
            key={amb.id}
            type="button"
            onClick={() => setSelectedAmbience(amb.id)}
            className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
              selectedAmbience === amb.id
                ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold"
                : "border-border bg-card hover:bg-muted/50 text-foreground"
            }`}
          >
            {amb.label}
          </button>
        ))}
      </div>

      {selectedAmbience !== "none" && (
        <div className="pt-2 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Ambience Volume:</span>
          <input
            type="range"
            min="0.05"
            max="0.4"
            step="0.05"
            value={ambienceVolume}
            onChange={(e) => setAmbienceVolume(parseFloat(e.target.value))}
            className="w-full accent-violet-600 cursor-pointer"
          />
          <span className="text-xs font-mono text-muted-foreground">
            {Math.round(ambienceVolume * 100)}%
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            AI Voice Studio, Cloning & Changer
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            Generate distinct neural voiceovers (English, Urdu & Hindi), clone built-in character voices or custom samples, or modulate audio pitch & formants with automatic hybrid cloud + browser acceleration.
          </p>

          {lastEngineUsed && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Cpu className="w-3.5 h-3.5" />
              Active Engine: {lastEngineUsed}
            </div>
          )}

          {/* 3 Mode Tabs */}
          <div className="flex items-center justify-center mt-6">
            <div className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-2xl bg-muted/60 border border-border/80">
              <button
                onClick={() => setActiveTab("tts")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "tts"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Type className="w-4 h-4" />
                Neural Text to Speech
              </button>

              <button
                onClick={() => setActiveTab("clone")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "clone"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                AI Voice Cloning
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Zero-Shot
                </span>
              </button>

              <button
                onClick={() => setActiveTab("v2v")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "v2v"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="w-4 h-4" />
                Voice Changer & Filters
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            TAB 1: NEURAL TEXT TO SPEECH
        ========================================================= */}
        {activeTab === "tts" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                Quick Studio Scripts:
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
                placeholder="Type or paste the script you want the AI voice to speak (Urdu, Hindi, English supported)..."
                className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none shadow-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Radio className="w-4 h-4 text-violet-500" />
                Select Distinct Neural Voice Model
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
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              ({v.gender})
                            </span>
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                              isSelected
                                ? "bg-violet-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
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
                    <span className="font-bold text-foreground">
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
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Deeper (-15Hz)</span>
                    <span>Natural (0Hz)</span>
                    <span>Higher (+15Hz)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted-foreground">Speed (Speaking Rate):</span>
                    <span className="font-bold text-foreground">
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
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Slower (-30%)</span>
                    <span>Normal (0%)</span>
                    <span>Faster (+30%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🎛️ Background Ambience Mixer */}
            {renderAmbienceMixer()}

            {ttsError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
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
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
              <div className="pt-6 border-t border-border/60">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    {selectedVoice.name} Voiceover Ready!
                  </div>
                  <audio controls src={ttsAudioUrl} className="w-full max-w-md mx-auto" autoPlay />
                  <div>
                    <a
                      href={ttsAudioUrl}
                      download={`botock_${selectedVoice.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_voiceover.wav`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download Studio Audio
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: AI ZERO-SHOT VOICE CLONING (WITH BUILT-IN PRESETS)
        ========================================================= */}
        {activeTab === "clone" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-violet-500" />
                  1. Choose Target Voice to Clone
                </label>

                <div className="inline-flex p-1 rounded-xl bg-muted border border-border/70 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRefSourceType("preset")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      refSourceType === "preset"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ⚡ Built-in Voice Presets (Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefSourceType("custom")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      refSourceType === "custom"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🎙️ Upload / Record Your Own
                  </button>
                </div>
              </div>

              {refSourceType === "preset" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CLONE_PRESETS.map((preset) => {
                    const isSelected = selectedClonePreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleClonePresetSelect(preset)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-violet-500 bg-violet-500/10 shadow-sm"
                            : "border-border/70 bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-bold text-sm text-foreground">
                              {preset.name}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                                isSelected
                                  ? "bg-violet-600 text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {preset.desc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">No upload needed</span>
                          {isSelected && (
                            <span className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Active Model
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  {!refVoiceFile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        onClick={() => refVoiceInputRef.current?.click()}
                        className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-muted/20 flex flex-col items-center justify-center"
                      >
                        <input
                          type="file"
                          ref={refVoiceInputRef}
                          onChange={(e) => {
                            if (e.target.files?.[0]) setRefVoiceFile(e.target.files[0]);
                          }}
                          accept="audio/*,.mp3,.wav,.m4a,.webm"
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-violet-500 mb-2" />
                        <span className="font-bold text-sm text-foreground">
                          Upload Reference Audio
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          5–15 sec clean voice clip (MP3/WAV)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isRecording && recordingTarget === "ref"
                            ? stopMicRecording()
                            : startMicRecording("ref")
                        }
                        className={`border-2 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center ${
                          isRecording && recordingTarget === "ref"
                            ? "border-red-500 bg-red-500/10 text-red-500 animate-pulse"
                            : "border-border hover:border-violet-500/50 bg-muted/20 text-foreground"
                        }`}
                      >
                        {isRecording && recordingTarget === "ref" ? (
                          <>
                            <Square className="w-8 h-8 mb-2 fill-current" />
                            <span className="font-bold text-sm">Stop Recording Sample</span>
                            <span className="text-xs mt-1">Speak naturally for 10 seconds...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-8 h-8 text-emerald-500 mb-2" />
                            <span className="font-bold text-sm">Record Your Voice Live</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              Clone your own voice via Mic
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCheck className="w-6 h-6 text-emerald-500" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{refVoiceFile.name}</p>
                          <p className="text-xs text-muted-foreground">Custom Reference Voice Loaded</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setRefVoiceFile(null)}
                        className="text-xs font-semibold text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg"
                      >
                        Change Sample
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Step 2: Choose Clone Output Mode */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground">
                2. How do you want to use this Cloned Voice?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCloneMode("text")}
                  className={`p-3.5 rounded-xl border text-sm font-bold transition-all ${
                    cloneMode === "text"
                      ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  📝 Speak Text (F5-TTS Zero-Shot)
                </button>
                <button
                  type="button"
                  onClick={() => setCloneMode("audio")}
                  className={`p-3.5 rounded-xl border text-sm font-bold transition-all ${
                    cloneMode === "audio"
                      ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  🎙️ Convert Another Audio (Seed-VC)
                </button>
              </div>
            </div>

            {cloneMode === "text" ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  3. Script for{" "}
                  {refSourceType === "preset" ? selectedClonePreset.name : "Cloned Voice"} to Speak
                </label>
                <textarea
                  rows={3}
                  value={cloneText}
                  onChange={(e) => setCloneText(e.target.value)}
                  placeholder="Enter text for the cloned voice to say..."
                  className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  3. Upload Source Audio (Speech to Convert into{" "}
                  {refSourceType === "preset" ? selectedClonePreset.name : "Target Voice"})
                </label>
                {!cloneSourceFile ? (
                  <div
                    onClick={() => cloneSourceInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-2xl p-6 text-center cursor-pointer bg-muted/20"
                  >
                    <input
                      type="file"
                      ref={cloneSourceInputRef}
                      onChange={(e) => {
                        if (e.target.files?.[0]) setCloneSourceFile(e.target.files[0]);
                      }}
                      accept="audio/*,.mp3,.wav,.m4a,.webm"
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">
                      Select Source Audio Recording
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {cloneSourceFile.name}
                    </span>
                    <button
                      onClick={() => setCloneSourceFile(null)}
                      className="text-xs font-semibold text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 🎛️ Background Ambience Mixer */}
            {renderAmbienceMixer()}

            {cloneError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
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
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Cloning{" "}
                  {refSourceType === "preset" ? selectedClonePreset.name : "Custom Voice"}...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Clone{" "}
                  {refSourceType === "preset" ? selectedClonePreset.name : "Custom Voice"} &
                  Generate Audio
                </>
              )}
            </button>

            {cloneAudioUrl && cloneStatus === "completed" && (
              <div className="pt-6 border-t border-border/60">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Cloned AI Voice Ready!
                  </div>
                  <audio controls src={cloneAudioUrl} className="w-full max-w-md mx-auto" autoPlay />
                  <div>
                    <a
                      href={cloneAudioUrl}
                      download={`botock_cloned_${
                        refSourceType === "preset" ? selectedClonePreset.id : "custom"
                      }.wav`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Cloned Audio
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: VOICE TO VOICE (STUDIO FILTERS + LIVE MIC)
        ========================================================= */}
        {activeTab === "v2v" && (
          <div className="space-y-6">
            {!selectedFile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-muted/20 flex flex-col items-center justify-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                    accept="audio/*,video/*,.mp4,.mov,.webm,.m4a,.wav,.mp3"
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-violet-500 mb-3" />
                  <h3 className="font-bold text-foreground mb-1">Upload Audio or Video</h3>
                  <p className="text-xs text-muted-foreground">
                    MP3, WAV, M4A, MP4, MOV (Max 60MB)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    isRecording && recordingTarget === "v2v"
                      ? stopMicRecording()
                      : startMicRecording("v2v")
                  }
                  className={`border-2 rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center ${
                    isRecording && recordingTarget === "v2v"
                      ? "border-red-500 bg-red-500/10 text-red-500 animate-pulse"
                      : "border-border hover:border-violet-500/50 bg-muted/20 text-foreground"
                  }`}
                >
                  {isRecording && recordingTarget === "v2v" ? (
                    <>
                      <Square className="w-10 h-10 mb-3 fill-current" />
                      <h3 className="font-bold">Stop Recording</h3>
                      <p className="text-xs mt-1">Recording microphone audio...</p>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 text-emerald-500 mb-3" />
                      <h3 className="font-bold text-foreground mb-1">Record Live Microphone</h3>
                      <p className="text-xs text-muted-foreground">
                        Speak directly & transform your voice
                      </p>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
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
                  Select Studio Voice Filter
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {VOICE_MODES.map((vm) => (
                    <button
                      key={vm.id}
                      onClick={() => setV2vMode(vm.id)}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        v2vMode === vm.id
                          ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold"
                          : "border-border bg-card hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      {vm.label}
                    </button>
                  ))}
                </div>

                {/* 🎛️ Background Ambience Mixer */}
                {renderAmbienceMixer()}

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
                      Transform Voice Now
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
              <div className="pt-6 border-t border-border/50">
                <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center space-y-6">
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
      </div>
    </div>
  );
}
