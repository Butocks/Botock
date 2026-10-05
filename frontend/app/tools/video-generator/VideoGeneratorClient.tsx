"use client";

import { useState, useEffect } from "react";
import GuestCTA from "../../components/GuestCTA";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { useMediaStore } from "../../store/useMediaStore";
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Film,
  Lock,
  Upload,
  AlertCircle,
  X,
  Dices,
  Clock,
  Send,
  Bell,
  CheckCircle2,
} from "lucide-react";

const SAMPLE_PROMPTS = [
  "Majestic snow leopard resting on Himalayan cliff at sunset, cinematic slow motion 8k",
  "Cyberpunk neon street in heavy rain with glowing reflections and steaming manholes, 35mm film",
  "Cute baby red panda eating fresh green bamboo in misty Japanese zen garden, morning light",
  "Slow motion macro shot of a water droplet creating ripples on purple lavender petal",
  "Futuristic spacecraft leaving warp speed into orbit around a vibrant ringed gas giant",
];

export const VIDEO_MODELS = [
  { 
    id: "omni-1.1-flash-360p", 
    label: "Botock Engine Flash (360p - Fast)", 
    resolution: "360p",
    allowedDurations: [4, 6, 8, 10],
    durationCosts: { 4: 8, 6: 10, 8: 12, 10: 14 }
  },
  { 
    id: "omni-1.1-flash-720p", 
    label: "Botock Engine Flash (720p - HD)", 
    resolution: "720p",
    allowedDurations: [4, 6, 8, 10],
    durationCosts: { 4: 14, 6: 20, 8: 24, 10: 30 }
  },
  { 
    id: "veo-3.1-lite", 
    label: "Veo 3.1 - Lite (720p Economy)", 
    resolution: "720p",
    allowedDurations: [8],
    durationCosts: { 8: 20 }
  },
  { 
    id: "veo-3.1-fast", 
    label: "Veo 3.1 - Fast (720p HD)", 
    resolution: "720p",
    allowedDurations: [8],
    durationCosts: { 8: 40 }
  },
  { 
    id: "veo-3.1-quality", 
    label: "Veo 3.1 - Quality (720p Cinema)", 
    resolution: "720p",
    allowedDurations: [8],
    durationCosts: { 8: 120 }
  },
];

export default function VideoGeneratorClient() {
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
  const [durationSeconds, setDurationSeconds] = useState<number>(10);
  const [selectedModel, setSelectedModel] = useState("omni-1.1-flash-360p");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // Status & Progress
  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "completed" | "error">("idle");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showGuestCTA, setShowGuestCTA] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(50);
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      let gid = localStorage.getItem("botock_guest_id");
      if (!gid) {
        gid = "guest_" + Math.random().toString(36).substring(2, 12);
        localStorage.setItem("botock_guest_id", gid);
      }
      setGuestId(gid);
    }
  }, []);

  // Smooth loading percentage counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "generating" || status === "polling") {
      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 35) return prev + 4;
          if (prev < 65) return prev + 3;
          if (prev < 85) return prev + 2;
          if (prev < 96) return prev + 1;
          return prev;
        });
      }, 1100);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Waitlist / Notify Modal
  const [showSubModal, setShowSubModal] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subSubmitted, setSubSubmitted] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const fetchCredits = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const backendBaseUrl = await getBackendUrl();
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
    const handler = (e: any) => {
      if (e.detail?.new_balance !== undefined) {
        setCreditsRemaining(e.detail.new_balance);
      } else {
        fetchCredits();
      }
    };
    window.addEventListener("botock:credits-updated", handler);
    return () => window.removeEventListener("botock:credits-updated", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        setSubEmail(u.email || "");
        const proStatus = u.app_metadata?.is_pro || u.user_metadata?.is_pro || false;
        setIsPro(Boolean(proStatus));
        fetchCredits();
      }
      setAuthLoading(false);
    });
  }, []);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setErrorMessage("");
    const modelObj = VIDEO_MODELS.find((m) => m.id === modelId);
    if (modelObj) {
      if (!modelObj.allowedDurations.includes(durationSeconds)) {
        setDurationSeconds(modelObj.allowedDurations[0]);
      }
    }
  };

  const getActiveModelCost = () => {
    const currentModelObj = VIDEO_MODELS.find((m) => m.id === selectedModel);
    if (!currentModelObj) return 14;
    return (currentModelObj.durationCosts as any)[durationSeconds] || 14;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const url = URL.createObjectURL(file);
      setReferencePreview(url);
      setMode("photo-to-video");
    }
  };

  const removeReferenceImage = () => {
    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
    }
    setReferenceImage(null);
    setReferencePreview(null);
    setMode("text-to-video");
  };

  const applySurprisePrompt = () => {
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
    setErrorMessage("");
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 3) {
      setErrorMessage("Please enter a scene description (at least 3 characters).");
      return;
    }

    const currentModelObj = VIDEO_MODELS.find((m) => m.id === selectedModel);
    const isVeoModel = selectedModel.includes("veo");
    const activeDuration = isVeoModel ? 8 : durationSeconds;
    const neededCredits = currentModelObj 
      ? ((currentModelObj.durationCosts as any)[activeDuration] || 14)
      : 14;

    if (user && !isPro && creditsRemaining < neededCredits) {
      setErrorMessage(`Insufficient credits. ${selectedModel} (${activeDuration}s) costs ${neededCredits} credits, but you have ${creditsRemaining}.`);
      setShowSubModal(true);
      return;
    }

    setErrorMessage("");
    setStatus("generating");
    setProgressPercent(15);
    setProgressText("Initializing cinematic video engine...");
    setVideoUrl(null);
    setVideoBlobUrl(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      const backendBaseUrl = await getBackendUrl();

      let imageBase64: string | undefined = undefined;
      if (referenceImage) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(referenceImage);
        });
      }

      const reqHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true",
      };
      if (token) {
        reqHeaders["Authorization"] = `Bearer ${token}`;
      } else if (guestId) {
        reqHeaders["X-Guest-ID"] = guestId;
      }

      const response = await fetch(`${backendBaseUrl}/api/video/generate`, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
          model: selectedModel,
          duration_seconds: durationSeconds,
          motion_hint: motionHint.trim() || undefined,
          image_base64: imageBase64,
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
      setProgressPercent(30);
      setCreditsRemaining((prev) => Math.max(0, prev - neededCredits));
    } catch (err: any) {
      setStatus("error");
      setProgressPercent(0);
      const msg = err.message || "An unexpected error occurred.";
      setErrorMessage(msg);
      if (!user && (msg.includes("Guest") || msg.includes("limit") || msg.includes("log in") || msg.includes("Unauthorized"))) {
        setShowGuestCTA(true);
      }
    }
  };

  // Status Polling Loop
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (status === "polling" && generationId) {
      pollInterval = setInterval(async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;
          const backendBaseUrl = await getBackendUrl();
          const authHeaders: Record<string, string> = {
            "Bypass-Tunnel-Reminder": "true",
          };
          if (token) {
            authHeaders["Authorization"] = `Bearer ${token}`;
          } else if (guestId) {
            authHeaders["X-Guest-ID"] = guestId;
          }

          const statusUrl = token
            ? `${backendBaseUrl}/api/video/status/${generationId}?token=${encodeURIComponent(token)}`
            : `${backendBaseUrl}/api/video/status/${generationId}`;

          const response = await fetch(statusUrl, { headers: authHeaders });
          if (!response.ok) return;

          const data = await response.json();
          if (data.message) {
            setProgressText(data.message);
          }

          if (data.status === "completed") {
            let finalUrl = data.download_url || `/api/video/download/${generationId}`;
            if (finalUrl.startsWith("/")) {
              finalUrl = `${backendBaseUrl.replace(/\/$/, "")}${finalUrl}`;
            }

            const authenticatedUrl = token
              ? `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
              : finalUrl;

            setVideoUrl(authenticatedUrl);
            setProgressPercent(100);
            setStatus("completed");
            clearInterval(pollInterval);

            // Fetch blob for instant memory preview & library
            fetch(finalUrl, { headers: authHeaders })
              .then((res) => {
                if (!res.ok) throw new Error("Could not fetch video blob");
                return res.blob();
              })
              .then((blob) => {
                const bUrl = URL.createObjectURL(blob);
                setVideoBlobUrl(bUrl);

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
            setProgressPercent(0);
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

  const handleNotifyWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubLoading(true);
    try {
      const backendUrl = await getBackendUrl();
      await fetch(`${backendUrl}/api/subscription/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subEmail,
          plan: "AI Video Pro",
          note: "User requested launch notification for Video Pro subscriptions",
        }),
      });
      setSubSubmitted(true);
    } catch (e) {
      setSubSubmitted(true);
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#07050e] text-slate-900 dark:text-white select-none">
      
      {/* Scrollable Upper Canvas Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-3xl mx-auto px-4 py-2 sm:py-4 flex flex-col items-center justify-center">
        
        {/* Generating / Polling State */}
        {(status === "generating" || status === "polling") && (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md my-auto">
            {/* Circular Ring with Centered Film Icon */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-xl animate-pulse" />
              <div
                className="absolute inset-0 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"
                style={{ animationDuration: "2.5s" }}
              />
              <div
                className="absolute inset-2 border-2 border-fuchsia-500/20 border-b-fuchsia-400 rounded-full animate-spin"
                style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
              />
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)] z-10">
                <Film className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" />
              </div>
            </div>

            {/* Percentage & Progress Bar */}
            <div className="space-y-3 w-full flex flex-col items-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {progressPercent}
                </span>
                <span className="text-base sm:text-lg font-bold text-violet-500 dark:text-violet-400 font-mono">%</span>
              </div>

              <div className="w-64 sm:w-72 h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(139,92,246,0.7)]"
                  style={{ width: `${Math.max(6, Math.min(progressPercent, 100))}%` }}
                />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                <span>{progressText || "Synthesizing Motion Frames..."}</span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI is generating your video. It will appear right here and save to your library.
              </p>
            </div>
          </div>
        )}

        {/* Completed State */}
        {status === "completed" && videoUrl && (
          <div className="w-full flex flex-col items-center space-y-3 max-w-xl">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-2xl max-h-[46vh] w-full">
              <video controlsList="nodownload" onContextMenu={(e) => e.preventDefault()}
                src={videoBlobUrl || videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-auto max-h-[42vh] rounded-xl bg-black"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] text-violet-300 font-bold border border-violet-500/30 flex items-center gap-1 shadow-md">
                <Clock className="w-3 h-3 text-violet-400" />
                <span>24h</span>
              </div>
            </div>

            {/* Notification Banner */}
            <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Your video is in your library</span>
              <Link href="/tools/library" className="underline font-bold ml-1 hover:text-emerald-500">View Library &rarr;</Link>
            </div>

            {/* Download & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={videoUrl}
                download={`botock-video-${generationId || "vid"}.mp4`}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>

              <a
                href={videoUrl}
                download={`botock-video-2k-${generationId || "vid"}.mp4`}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Download 2K</span>
              </a>

              <Link
                href="/tools/video-editor"
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Edit in Studio</span>
              </Link>
            </div>
          </div>
        )}

        {/* Idle Canvas State */}
        {status === "idle" && (
          <div className="w-full max-w-lg aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center space-y-3 transition-all my-auto">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-inner">
              <Film className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Video Canvas Ready</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Your generated video will render right here. Enter a prompt below to synthesize motion.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Generation Failed</h3>
            <p className="text-xs text-red-500 dark:text-red-400 max-w-xs">{errorMessage || "Failed to generate video."}</p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

      </div>

      {/* Pinned Bottom Input Dock */}
      <div className="shrink-0 w-full bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 px-3 sm:px-6 py-2 sm:py-2.5 z-30 shadow-lg">
        <div className="max-w-3xl mx-auto flex flex-col gap-1.5 sm:gap-2">
          
          {/* Controls Chips Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none text-xs">
            {/* Aspect Ratio */}
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="16:9" className="bg-white dark:bg-[#09090b]">16:9 Landscape</option>
              <option value="9:16" className="bg-white dark:bg-[#09090b]">9:16 Portrait</option>
            </select>

            {/* Model Select */}
            <select
              value={selectedModel}
              onChange={(e) => handleModelSelect(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 cursor-pointer"
            >
              {VIDEO_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-[#09090b]">{m.label}</option>
              ))}
            </select>

            {/* Duration Selector (Dynamically matches model capabilities) */}
            {(() => {
              const currentModelObj = VIDEO_MODELS.find((m) => m.id === selectedModel);
              const allowed = currentModelObj?.allowedDurations || [4, 6, 8, 10];
              return (
                <select
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 cursor-pointer"
                >
                  {allowed.map((sec) => {
                    const cost = currentModelObj?.durationCosts ? (currentModelObj.durationCosts as any)[sec] : 14;
                    return (
                      <option key={sec} value={sec} className="bg-white dark:bg-[#09090b]">
                        {sec}s Video ({cost} cr)
                      </option>
                    );
                  })}
                </select>
              );
            })()}

            {/* Reference image chip if attached */}
            {referenceImage && (
              <div className="px-2 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                <ImageIcon className="w-3 h-3" />
                <span className="truncate max-w-[80px]">Photo</span>
                <button type="button" onClick={removeReferenceImage} className="hover:text-violet-300 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Cost & Credits Remaining Badge */}
            <div className="ml-auto text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/20 font-bold">
                Cost: {getActiveModelCost()} cr
              </span>
              <span>⚡ {isPro ? "Unlimited" : `${creditsRemaining} cr`}</span>
              {!isPro && (
                <button
                  type="button"
                  onClick={() => setShowSubModal(true)}
                  className="text-violet-600 dark:text-violet-400 hover:underline font-bold ml-0.5 cursor-pointer"
                >
                  Pro
                </button>
              )}
            </div>
          </div>

          {/* Prompt Input Box */}
          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/90 dark:bg-white/[0.04] focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all flex items-end p-1 sm:p-1.5 gap-1.5 shadow-inner">
            
            {/* Left Tools */}
            <div className="flex items-center gap-0.5 pl-1 pb-1 shrink-0">
              <label className="cursor-pointer p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors" title="Attach Start Photo">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              <button
                type="button"
                onClick={applySurprisePrompt}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-violet-500 transition-colors"
                title="Surprise Me (Random Prompt)"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video scene you want to animate..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none py-1.5 px-1 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[38px] max-h-24"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            {/* Right Action */}
            <div className="shrink-0 pr-0.5 pb-0.5">
              <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={status === "generating" || status === "polling" || prompt.trim().length < 3}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Generate</span>
                </button>
            </div>

          </div>

        </div>
      </div>

      {/* Subscription Waitlist Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => { setShowSubModal(false); setSubSubmitted(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-500 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Pro Subscriptions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">We will notify you when available</p>
              </div>
            </div>

            {subSubmitted ? (
              <div className="py-4 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">You're on the list!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We will notify you when available as soon as subscriptions launch.
                </p>
                <button
                  onClick={() => setShowSubModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold mt-2 cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleNotifyWaitlist} className="space-y-3.5">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pro subscriptions will be launching soon. Enter your email below and we will notify you when available!
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{subLoading ? "Saving..." : "Notify Me When Available"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <GuestCTA isOpen={showGuestCTA} onClose={() => setShowGuestCTA(false)} />
    </div>
  );
}
