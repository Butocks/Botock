"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { useMediaStore } from "../../store/useMediaStore";
import {
  Sparkles,
  Scissors,
  Download,
  Image as ImageIcon,
  Film,
  Lock,
  Zap,
  Upload,
  AlertCircle,
  X,
  Play,
  CheckCircle2,
  Dices,
  Camera,
  Layers,
  ArrowRight,
  Maximize2,
  Clock,
  Sliders,
} from "lucide-react";
import AdBanner from "../../components/AdBanner";
import ToolSuggestions from "../../components/ToolSuggestions";

const SAMPLE_PROMPTS = [
  "Majestic snow leopard resting on Himalayan cliff at sunset, ultra realistic 8k, cinematic slow motion",
  "Cyberpunk neon street in heavy rain with glowing reflections and steaming manholes, 35mm film still",
  "Cute baby red panda eating fresh green bamboo in misty Japanese zen garden, soft morning sunlight",
  "Slow motion macro shot of a crystal-clear water droplet creating ripples on purple lavender petal",
  "Futuristic hyperdrive spacecraft leaving warp speed into orbit around a vibrant ringed gas giant",
];

const MOTION_PRESETS = [
  { label: "Zoom In 🔍", value: "Slow cinematic zoom in towards the subject" },
  { label: "Pan Right ➡️", value: "Smooth horizontal camera pan to the right" },
  { label: "Pan Left ⬅️", value: "Smooth horizontal camera pan to the left" },
  { label: "Slow Motion ⏳", value: "Ultra smooth cinematic slow motion 60fps" },
  { label: "Drone Orbit 🔄", value: "Sweeping 360 degree aerial drone orbit" },
  { label: "Tilt Up ⬆️", value: "Dramatic upward camera tilt revealing the sky" },
];

export default function VideoGeneratorPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setActiveMedia, addToLibrary } = useMediaStore();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Form State
  const [mode, setMode] = useState<"text-to-video" | "photo-to-video">("text-to-video");
  const [prompt, setPrompt] = useState("");
  const [motionHint, setMotionHint] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [durationSeconds, setDurationSeconds] = useState<number>(8);
  const [selectedModel, setSelectedModel] = useState("omni-1.1-flash-360p");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // Status & Progress
  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "completed" | "error">("idle");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(50);
  const [showGenerateMore, setShowGenerateMore] = useState<boolean>(false);

  const fetchCredits = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const backendBaseUrl = getBackendUrl();
      const res = await fetch(`${backendBaseUrl}/api/video/credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCreditsRemaining(data.credits_remaining);
      }
    } catch (e) {}
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        const proStatus = u.app_metadata?.is_pro || u.user_metadata?.is_pro || false;
        setIsPro(Boolean(proStatus));
        fetchCredits();
      }
      setAuthLoading(false);
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const url = URL.createObjectURL(file);
      setReferencePreview(url);
    }
  };

  const removeReferenceImage = () => {
    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
    }
    setReferenceImage(null);
    setReferencePreview(null);
  };

  const applySurprisePrompt = () => {
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
    setErrorMessage("");
  };

  const applyMotionPreset = (val: string) => {
    setMotionHint((prev) => (prev ? `${prev}, ${val}` : val));
  };

  const handleGenerate = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (prompt.trim().length < 5) {
      setErrorMessage("Please enter a scene description (at least 5 characters).");
      return;
    }

    setErrorMessage("");
    setStatus("generating");
    setProgressText("Connecting to Google Flow AI pipeline...");
    setVideoUrl(null);
    setVideoBlobUrl(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      const backendBaseUrl = getBackendUrl();

      const response = await fetch(`${backendBaseUrl}/api/video/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
          model: isPro ? selectedModel : "omni-1.1-flash-360p",
          duration_seconds: durationSeconds,
          motion_hint: motionHint.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errMsg = `Server returned ${response.status}: Failed to start generation.`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.detail) errMsg = parsed.detail;
        } catch (e) {
          if (errText && errText.length < 200) errMsg = errText;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setGenerationId(data.generation_id);
      setStatus("polling");
      setCreditsRemaining((prev) => Math.max(0, prev - 15));
      setShowGenerateMore(false);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const handleCloseSession = async () => {
    setShowGenerateMore(false);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const backendBaseUrl = getBackendUrl();
      await fetch(`${backendBaseUrl}/api/video/close-session`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {}
  };

  const handleKeepSessionForMore = () => {
    setShowGenerateMore(false);
    setStatus("idle");
    setPrompt("");
  };

  // Status Polling Loop
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (status === "polling" && generationId) {
      pollInterval = setInterval(async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;
          const authHeaders: Record<string, string> = {
            "Bypass-Tunnel-Reminder": "true",
          };
          if (token) {
            authHeaders["Authorization"] = `Bearer ${token}`;
          }

          const backendBaseUrl = getBackendUrl();
          const statusUrl = token
            ? `${backendBaseUrl}/api/video/status/${generationId}?token=${encodeURIComponent(token)}`
            : `${backendBaseUrl}/api/video/status/${generationId}`;

          const response = await fetch(statusUrl, {
            headers: authHeaders,
          });
          if (!response.ok) return;

          const data = await response.json();
          if (data.message) {
            setProgressText(data.message);
          }

          if (data.status === "completed") {
            const rawUrl = data.download_url
              ? new URL(data.download_url, backendBaseUrl).toString()
              : `${backendBaseUrl}/api/video/download/${generationId}`;

            const authenticatedUrl = token
              ? `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
              : rawUrl;

            setVideoUrl(authenticatedUrl);
            setStatus("completed");
            setShowGenerateMore(true);
            fetchCredits();
            clearInterval(pollInterval);

            // Fetch blob for Zero-Network Studio Bridge & caching
            fetch(rawUrl, { headers: authHeaders })
              .then((res) => res.blob())
              .then((blob) => {
                const bUrl = URL.createObjectURL(blob);
                setVideoBlobUrl(bUrl);

                const item = {
                  id: generationId,
                  title: prompt.slice(0, 35) + "...",
                  type: "video" as const,
                  url: authenticatedUrl,
                  blob,
                  blobUrl: bUrl,
                  createdAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                  prompt,
                };

                addToLibrary(item);
                setActiveMedia(item);
              })
              .catch(() => {
                const item = {
                  id: generationId,
                  title: prompt.slice(0, 35) + "...",
                  type: "video" as const,
                  url: authenticatedUrl,
                  createdAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                  prompt,
                };
                addToLibrary(item);
                setActiveMedia(item);
              });
          } else if (data.status === "failed") {
            setStatus("error");
            setErrorMessage(data.message || "Video generation failed.");
            clearInterval(pollInterval);
          }
        } catch (error) {
          // Keep polling
        }
      }, 3500);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [status, generationId, prompt]);

  return (
    <div className="flex-1 flex flex-col max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-violet-600/20 text-violet-300 border border-violet-500/30">
              Runway-Grade AI Studio
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">• Google Flow Engine (Omni 1.1 Flash)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Film className="w-6 h-6 text-violet-400" />
            AI Video Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Turn prompts and photos into realistic cinematic videos with precision duration and camera controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-[#120e26] border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center gap-2 shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
            <span>Balance: {user ? `${creditsRemaining} / 50 Credits` : "50 Free Credits / Day"}</span>
          </div>
          <Link
            href="/pricing"
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            Upgrade Plan →
          </Link>
        </div>
      </div>

      {/* Guest Lock Notice */}
      {!user && !authLoading && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#130d2a] to-cyan-950/30 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sign In Required to Generate AI Videos</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Sign in with 1-click Google or Email to unlock 3 free daily video generations and 24-hour cloud storage.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/30 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Sign In with Google / Email →
          </Link>
        </div>
      )}

      {/* 2-Column AI Studio (Runway ML Architecture: 35% Controls, 65% Canvas) */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[640px]">
        {/* Left Panel: Studio Controls (35% Width) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          <div className="rounded-2xl p-6 flex-1 flex flex-col justify-between studio-panel shadow-2xl">
            <div className="space-y-5">
              {/* Mode Switcher Pills */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Generation Mode
                </label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-[#080512] rounded-xl border border-slate-200 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setMode("text-to-video")}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      mode === "text-to-video"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/40"
                        : "text-slate-600 dark:text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    Text to Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("photo-to-video")}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      mode === "photo-to-video"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/40"
                        : "text-slate-600 dark:text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Photo to Video
                  </button>
                </div>
              </div>

              {/* Photo to Video Dropzone */}
              {mode === "photo-to-video" && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-violet-400" />
                      <span>Start-Frame Reference Photo</span>
                      <span className="text-violet-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">PNG, JPG (10MB)</span>
                  </div>

                  {!referencePreview ? (
                    <label className="border border-dashed border-slate-300 dark:border-white/[0.14] hover:border-violet-500/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#080512] hover:bg-[#120d26] transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform mb-2">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Click to upload starting frame</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Used as initial visual anchor
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#080512] border border-violet-500/30 relative">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-white/[0.1] flex-shrink-0 relative">
                        <img src={referencePreview} alt="Ref" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{referenceImage?.name}</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Ready as start frame
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeReferenceImage}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Prompt Textarea Header with Dice */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Scene Prompt
                  </label>
                  <button
                    type="button"
                    onClick={applySurprisePrompt}
                    className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Surprise Me 🎲</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  className={`w-full bg-slate-50 dark:bg-[#080512] border rounded-xl p-3.5 text-white text-xs sm:text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none transition-all placeholder:text-slate-500 dark:text-slate-400 ${
                    errorMessage && prompt.trim().length < 5 ? "border-red-500/60" : "border-slate-300 dark:border-white/[0.1]"
                  }`}
                  placeholder={
                    mode === "photo-to-video"
                      ? "Describe how the photo should animate... E.g. The subject smiles gently, camera zooms out revealing cinematic sunset landscape..."
                      : "Describe your scene in detail. E.g. A majestic white owl gliding over a misty snow-covered pine forest in golden dawn sunlight..."
                  }
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  disabled={status === "generating" || status === "polling"}
                />

                {/* Prompt Ideas Chips */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex-shrink-0">Inspiration:</span>
                  {SAMPLE_PROMPTS.slice(0, 2).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-white/[0.06] whitespace-nowrap truncate max-w-[180px] transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Motion Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Camera & Motion Direction
                  </label>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">Optional</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {MOTION_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyMotionPreset(p.value)}
                      className="text-[10px] font-semibold py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-[#080512] hover:bg-violet-600/20 hover:text-violet-300 border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer text-slate-700 dark:text-slate-300 truncate"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={motionHint}
                  onChange={(e) => setMotionHint(e.target.value)}
                  placeholder="E.g. Slow cinematic zoom in, 60fps slow motion..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080512] border border-slate-300 dark:border-white/[0.1] rounded-xl text-xs text-white focus:ring-1 focus:ring-violet-500 placeholder:text-slate-500 dark:text-slate-400"
                  disabled={status === "generating" || status === "polling"}
                />
              </div>

              {/* Duration Segmented Pills & Aspect Ratio */}
              <div className="space-y-4 pt-1">
                {/* Duration */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Duration
                    </label>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      Costs 15 Credits
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 8, 10].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDurationSeconds(sec)}
                        disabled={status === "generating" || status === "polling" || (!isPro && sec !== 8)}
                        className={`py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                          durationSeconds === sec
                            ? "border-violet-500 bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]"
                            : (!isPro && sec !== 8)
                            ? "border-slate-200 dark:border-white/[0.04] bg-slate-100 dark:bg-[#080512]/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                            : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080512] hover:border-violet-500/40 text-slate-600 dark:text-slate-400 hover:text-white"
                        }`}
                        title={!isPro && sec !== 8 ? "Free tier is optimized for 8s videos" : ""}
                      >
                        {sec}s {!isPro && sec === 8 ? "★" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio("16:9")}
                      disabled={status === "generating" || status === "polling"}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                        aspectRatio === "16:9"
                          ? "border-violet-500 bg-violet-600/20 text-violet-300"
                          : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080512] hover:border-violet-500/40 text-slate-600 dark:text-slate-400 hover:text-white"
                      }`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio("9:16")}
                      disabled={status === "generating" || status === "polling"}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                        aspectRatio === "9:16"
                          ? "border-violet-500 bg-violet-600/20 text-violet-300"
                          : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080512] hover:border-violet-500/40 text-slate-600 dark:text-slate-400 hover:text-white"
                      }`}
                    >
                      9:16 Reels / Shorts
                    </button>
                  </div>
                </div>
              </div>

              {/* Model Info Badge */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080512] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Engine: {isPro ? "Omni 1.1 High & Veo" : "Omni 1.1 Flash 360p"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">
                  {isPro ? "Pro Active" : "Free Tier (15 Cr / Gen)"}
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Main Action Button */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/[0.08] mt-6">
              {user ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={status === "generating" || status === "polling" || creditsRemaining < 15}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                    status === "generating" || status === "polling"
                      ? "bg-violet-600/40 text-white/70 cursor-not-allowed"
                      : creditsRemaining < 15
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-violet-600/40 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {status === "generating" || status === "polling"
                      ? "Rendering Video..."
                      : creditsRemaining < 15
                      ? "Insufficient Daily Credits (15 Needed)"
                      : "Generate Video (15 Credits)"}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-xl shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Generate Video Free</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: The Cinema Hero Canvas (65% Width) */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6">
          <div className="rounded-2xl p-6 flex-1 flex flex-col justify-center items-center obsidian-card shadow-2xl relative overflow-hidden min-h-[520px]">
            {/* Generating State with Futuristic Multi-Ring Orbital Loader */}
            {(status === "generating" || status === "polling") && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 border-2 border-violet-500/20 border-t-violet-400 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                  {/* Middle reverse spinning ring */}
                  <div className="absolute inset-2 border-2 border-cyan-500/20 border-b-cyan-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                  {/* Center glowing core */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)] animate-pulse">
                    <Film className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rendering Frame Sequence</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Synthesizing Video on Google Flow</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {progressText || "Connecting to headless Chrome cluster..."}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2">
                    Generating {durationSeconds} seconds at 360p resolution. Typically takes 35–55s.
                  </p>
                </div>
              </div>
            )}

            {/* Completed State: Prominent Cinema Display */}
            {status === "completed" && videoUrl && (
              <div className="w-full h-full flex flex-col justify-between space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-slate-300 dark:border-white/[0.1] aspect-video flex items-center justify-center shadow-2xl">
                  <video
                    src={videoBlobUrl || videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] text-violet-300 font-bold border border-violet-500/30 flex items-center gap-1.5 shadow-lg">
                    <Clock className="w-3 h-3 text-violet-400" />
                    <span>Expires in 24h</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => router.push("/tools/video-editor")}
                      className="py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>Edit in Video Studio (0ms Bridge)</span>
                    </button>
                    <a
                      href={videoUrl}
                      download={`botock-${generationId || "video"}.mp4`}
                      className="py-3.5 rounded-xl bg-slate-50 dark:bg-[#080512] hover:bg-white/[0.08] border border-white/[0.12] text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Video (MP4)</span>
                    </a>
                  </div>

                  <Link
                    href="/tools/library"
                    className="text-center text-xs text-slate-600 dark:text-slate-400 hover:text-violet-400 transition-colors cursor-pointer"
                  >
                    Saved to My Library (24h Retention) →
                  </Link>
                </div>

                {/* Prompt: Do you want to generate more? */}
                {showGenerateMore && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-[#120d2a] to-slate-900 border border-violet-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Do you want to generate another video?</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {creditsRemaining >= 15
                            ? `You have ${creditsRemaining} credits remaining. Keep the studio active for instant rendering!`
                            : "Daily credits used up. Wait 24h or upgrade to Pro."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {creditsRemaining >= 15 && (
                        <button
                          type="button"
                          onClick={handleKeepSessionForMore}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          Yes, Generate More
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleCloseSession}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-white/[0.08] transition-all cursor-pointer"
                      >
                        No, Close Session
                      </button>
                    </div>
                  </div>
                )}

                <ToolSuggestions />
              </div>
            )}

            {/* Idle State: High-Tech Creative Canvas */}
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-[#100b24] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shadow-inner group">
                  <Film className="w-9 h-9 text-violet-400/70 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Live AI Cinema Stage</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Set your scene prompt and duration ({durationSeconds}s) on the left, then click Generate to watch your scene stream here in high fidelity.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Omni 1.1 Engine</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 0ms Studio Bridge</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generation Stalled</h3>
                  <p className="text-xs text-red-400 mt-1 max-w-xs">
                    {errorMessage || "An error occurred during video processing."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#080512] border border-slate-300 dark:border-white/[0.1] text-white hover:bg-white/[0.08] active:scale-95 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <AdBanner slot="video-generator-sidebar" />
        </div>
      </div>
    </div>
  );
}
