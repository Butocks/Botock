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
            setVideoUrl(data.url);
            
            // Add to library
            const newItem = {
              id: id,
              title: (prompt || "Generated Video").slice(0, 35) + "...",
              type: "video" as const,
              url: data.url,
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              prompt: prompt || "Generated Video",
            };
            addToLibrary(newItem);
            setActiveMedia(newItem);
            
            // Generate local blob url for caching
            try {
              const videoReq = await fetch(data.url);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {showGuestCTA && <GuestCTA isOpen={true} onClose={() => setShowGuestCTA(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Configure Generation
            </h2>

            <div className="space-y-5">
              
              {/* Prompt Input */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your scene in detail... (e.g. A hyper-realistic drone shot over a glowing cyberpunk city)"
                  rows={4}
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  disabled={status === "generating" || status === "polling"}
                />
                <button
                  type="button"
                  onClick={() => setPrompt(SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)])}
                  className="mt-2 text-xs font-medium text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  Try random prompt
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Reference Image <span className="text-muted-foreground font-normal">(Optional)</span></label>
                {!referencePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">Click to upload photo (Max 5MB)</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={status === "generating" || status === "polling"} />
                  </label>
                ) : (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden group border border-border">
                    <img src={referencePreview} alt="Reference" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={removeImage} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                
                {/* Resolution */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">Resolution</label>
                  <select 
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as "360p" | "720p")}
                    disabled={!user || status === "generating" || status === "polling"}
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50"
                  >
                    <option value="360p">Standard (360p)</option>
                    {user && durationSeconds === 4 && <option value="720p">High Def (720p)</option>}
                  </select>
                  {!user && <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1"><Lock className="w-3 h-3"/> Login to unlock HD</p>}
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">Duration</label>
                  <select 
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    disabled={!user || status === "generating" || status === "polling"}
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50"
                  >
                    <option value={4}>4 Seconds</option>
                    {user && resolution === "360p" && <option value={8}>8 Seconds</option>}
                  </select>
                  {!user && <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1"><Lock className="w-3 h-3"/> Login for 8s videos</p>}
                </div>
              </div>

              <button
                onClick={startGeneration}
                disabled={status === "generating" || status === "polling" || authLoading || (!prompt && !referenceImage)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-base shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {status === "idle" || status === "completed" || status === "error" ? (
                  <>
                    <Send className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    Generate Free Video
                  </>
                ) : (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Initializing Engine...
                  </>
                )}
              </button>

              {errorMessage && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Preview & Status */}
        <div className="lg:col-span-7">
          <div className="bg-[#0a0a0c] border border-border/50 rounded-3xl overflow-hidden shadow-2xl relative aspect-video flex flex-col items-center justify-center">
            
            {status === "idle" && !videoUrl && (
              <div className="text-center p-8 flex flex-col items-center text-muted-foreground">
                <Film className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-foreground mb-2">Ready to Animate</h3>
                <p className="text-sm max-w-sm">Enter a prompt or upload an image on the left. The Botock engine will generate a stunning free video clip.</p>
              </div>
            )}

            {(status === "generating" || status === "polling") && (
              <div className="absolute inset-0 bg-[#0a0a0c] z-10 flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 mb-8 relative">
                  <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-violet-500">
                    {progressPercent}%
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Generating your masterpiece...</h3>
                <p className="text-sm text-slate-400 text-center max-w-sm">{progressText}</p>
              </div>
            )}

            {videoUrl && status === "completed" && (
              <div className="absolute inset-0 w-full h-full bg-black">
                <video 
                  src={videoBlobUrl || videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {status === "error" && !videoUrl && (
              <div className="text-center p-8 flex flex-col items-center text-red-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Generation Failed</h3>
                <p className="text-sm max-w-sm text-red-400">There was an issue processing your request. Please try again or simplify your prompt.</p>
              </div>
            )}
          </div>

          {videoUrl && status === "completed" && (
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <a 
                href={videoUrl}
                download="botock-video.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm border border-border transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Original
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-md transition-colors"
              >
                Create Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
