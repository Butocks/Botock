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

export default function VideoGeneratorClient() {
  const router = useRouter();
  const supabase = createClient();
  const { setActiveMedia, addToLibrary } = useMediaStore();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form State
  const [mode, setMode] = useState<"text-to-video" | "photo-to-video">("text-to-video");
  const [prompt, setPrompt] = useState("");
  const [motionHint, setMotionHint] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [durationSeconds, setDurationSeconds] = useState<number>(4);
  const [resolution, setResolution] = useState<"360p" | "720p">("360p");
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

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setAuthLoading(false);
    };
    initUser();
  }, [supabase.auth]);

  // Enforce limitations based on auth state
  useEffect(() => {
    if (!user) {
      setDurationSeconds(4);
      setResolution("360p");
    } else {
      if (durationSeconds === 8) {
        setResolution("360p");
      }
    }
  }, [user, durationSeconds, resolution]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image must be under 5MB.");
        return;
      }
      setReferenceImage(file);
      const url = URL.createObjectURL(file);
      setReferencePreview(url);
      setMode("photo-to-video");
    }
  };

  const removeImage = () => {
    setReferenceImage(null);
    setReferencePreview(null);
    if (!prompt) setMode("text-to-video");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startGeneration = async () => {
    if (!prompt && !referenceImage) {
      setErrorMessage("Please enter a prompt or upload an image.");
      return;
    }

    setStatus("generating");
    setProgressPercent(2);
    setProgressText("Initializing secure generation environment...");
    setErrorMessage("");
    setVideoUrl(null);
    setVideoBlobUrl(null);

    try {
      const backendBaseUrl = await getBackendUrl();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        headers["X-Guest-ID"] = guestId;
      }

      let imageBase64 = null;
      if (referenceImage) {
        setProgressText("Optimizing reference image...");
        imageBase64 = await fileToBase64(referenceImage);
      }

      setProgressText("Deploying job to Botock Engine...");
      
      const payload = {
        prompt: prompt || "Animate this image.",
        model: `omni-1.1-flash-${resolution}`,
        duration_seconds: durationSeconds,
        aspect_ratio: aspectRatio,
        motion_hint: motionHint || null,
        image_base64: imageBase64,
      };

      const res = await fetch(`${backendBaseUrl}/api/video/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to start generation.");
      }

      const data = await res.json();
      setGenerationId(data.generation_id);
      setStatus("polling");
      pollStatus(data.generation_id, token, guestId);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const pollStatus = async (id: string, token?: string, gid?: string) => {
    try {
      const backendBaseUrl = await getBackendUrl();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      else if (gid) headers["X-Guest-ID"] = gid;

      let intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${backendBaseUrl}/api/video/status/${id}`, { headers });
          if (!res.ok) {
            clearInterval(intervalId);
            setStatus("error");
            setErrorMessage("Failed to fetch generation status.");
            return;
          }
          const data = await res.json();
          if (data.status === "processing") {
            setProgressText(data.message || "Processing in queue...");
          } else if (data.status === "completed") {
            clearInterval(intervalId);
            setProgressPercent(100);
            setStatus("completed");
            
            let finalUrl = data.download_url || `/api/video/download/${id}`;
            if (finalUrl.startsWith("/")) {
              finalUrl = `${backendBaseUrl.replace(/\/$/, "")}${finalUrl}`;
            }
            
            const authUrl = token
              ? `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
              : gid ? `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}guest_id=${encodeURIComponent(gid)}` : finalUrl;
              
            setVideoUrl(authUrl);
            
            // Generate local blob url for caching
            try {
              const videoReq = await fetch(authUrl, { headers });
              const blob = await videoReq.blob();
              setVideoBlobUrl(URL.createObjectURL(blob));
            } catch (e) { }

            if (!user) setShowGuestCTA(true);
          } else if (data.status === "failed") {
            clearInterval(intervalId);
            setStatus("error");
            setErrorMessage(data.error || "Generation failed. Please try again.");
          }
        } catch (e) {
          // keep trying
        }
      }, 5000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#07050e] text-slate-900 dark:text-white select-none">
      
      {/* Main Canvas Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center">
        
        {/* Idle State */}
        {status === "idle" && (
          <div className="w-full max-w-xl aspect-video rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center transition-all my-auto">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 mb-4 shadow-inner">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Video Engine Ready</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Your cinematic AI video will render here. Enter a prompt or upload an image below to begin.
            </p>
          </div>
        )}

        {/* Generating State */}
        {(status === "generating" || status === "polling") && (
          <div className="w-full max-w-xl flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-6 relative mx-auto">
              <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-violet-500">
                {progressPercent}%
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 animate-pulse">Generating your masterpiece...</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{progressText}</p>
          </div>
        )}

        {/* Completed State */}
        {status === "completed" && (
          <div className="w-full flex flex-col items-center space-y-4 max-w-3xl">
            <div className="relative w-full rounded-3xl overflow-hidden bg-black/90 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-2xl aspect-video">
              <video 
                src={videoBlobUrl || videoUrl || ""} 
                controls 
                autoPlay 
                loop 
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-xs text-violet-300 font-bold border border-violet-500/30 flex items-center gap-1.5 shadow-md pointer-events-none">
                <Clock className="w-3.5 h-3.5 text-violet-400" />
                <span>24h Expiry</span>
              </div>
            </div>

            <div className="py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Video successfully generated!</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={videoUrl || "#"}
                download={`botock-video-${generationId || "clip"}.mp4`}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download MP4</span>
              </a>
              <button 
                onClick={() => {
                  setPrompt("");
                  setReferenceImage(null);
                  setReferencePreview(null);
                  setVideoUrl(null);
                  setVideoBlobUrl(null);
                  setStatus("idle");
                  setProgressPercent(0);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Generation Failed</h3>
            <p className="text-sm text-red-500 dark:text-red-400 max-w-sm">{errorMessage || "Failed to generate video."}</p>
            <button
              onClick={() => setStatus("idle")}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 active:scale-95 cursor-pointer mt-2"
            >
              Try Again
            </button>
          </div>
        )}

      </div>

      {/* Pinned Bottom Input Dock */}
      <div className="shrink-0 w-full bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 px-3 sm:px-6 py-2 sm:py-3 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          
          {/* Controls Chips Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {/* Resolution Select */}
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as "360p" | "720p")}
              disabled={!user || status === "generating" || status === "polling"}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 cursor-pointer disabled:opacity-50"
            >
              <option value="360p" className="bg-white dark:bg-[#09090b]">Standard (360p)</option>
              {user && durationSeconds === 4 && <option value="720p" className="bg-white dark:bg-[#09090b]">High Def (720p)</option>}
            </select>

            {/* Duration Select */}
            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              disabled={!user || status === "generating" || status === "polling"}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-violet-500 cursor-pointer disabled:opacity-50"
            >
              <option value={4} className="bg-white dark:bg-[#09090b]">4 Seconds</option>
              {user && resolution === "360p" && <option value={8} className="bg-white dark:bg-[#09090b]">8 Seconds</option>}
            </select>

            {/* Reference Image chip */}
            {referencePreview && (
              <div className="px-2.5 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="truncate max-w-[80px]">Attached</span>
                <button type="button" onClick={removeImage} className="hover:text-violet-300 ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Lock Info / Quota Indicator */}
            {!user && (
              <div className="ml-auto text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-white/10">
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">Login for 720p/8s</span>
                <span className="sm:hidden">Login for HD</span>
              </div>
            )}
            {user && (
              <div className="ml-auto text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                {user.is_pro ? "Unlimited" : "Standard Plan"}
              </div>
            )}
          </div>

          {/* Prompt Input Box */}
          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/90 dark:bg-white/[0.04] focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all flex items-end p-1.5 sm:p-2 gap-2 shadow-inner">
            
            {/* Left Tools */}
            <div className="flex items-center gap-1 pl-1 pb-1 shrink-0">
              <label className="cursor-pointer p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors" title="Attach Reference Image">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              <button
                type="button"
                onClick={() => setPrompt(SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)])}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-violet-500 transition-colors hidden sm:block"
                title="Surprise Me (Random Prompt)"
              >
                <Dices className="w-5 h-5" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene... (e.g. A cinematic drone shot over a neon city)"
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none py-2 px-2 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-500 min-h-[40px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  startGeneration();
                }
              }}
              disabled={status === "generating" || status === "polling"}
            />

            {/* Right Action */}
            <div className="shrink-0 pr-1 pb-1">
              <button
                  type="button"
                  onClick={startGeneration}
                  disabled={status === "generating" || status === "polling" || (!prompt.trim() && !referenceImage)}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {status === "generating" || status === "polling" ? (
                     <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                     <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Generate</span>
                     </>
                  )}
                </button>
            </div>

          </div>
        </div>
      </div>

      <GuestCTA isOpen={showGuestCTA} onClose={() => setShowGuestCTA(false)} />
    </div>
  );
}
