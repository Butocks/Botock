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
  Lock,
  Upload,
  AlertCircle,
  X,
  Dices,
  Layers,
  Clock,
  Send,
  Bell,
  CheckCircle2,
} from "lucide-react";

const SAMPLE_IMAGE_PROMPTS = [
  "Majestic snow leopard on Himalayan cliff at golden hour, 8k resolution, National Geographic style",
  "Cyberpunk samurai in neon Tokyo back alley, reflective rain puddles, volumetric mist, 35mm film",
  "Cute fluffy baby red panda holding a small lantern in bamboo forest, soft rim light, 3D render",
  "Futuristic organic city with hanging vertical gardens and waterfalls, golden hour lighting",
  "Macro photography of chameleon eye with iridescent jewel scales and reflections",
];

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 Landscape" },
  { id: "4:3", label: "4:3 Standard" },
  { id: "1:1", label: "1:1 Square" },
  { id: "3:4", label: "3:4 Portrait" },
  { id: "9:16", label: "9:16 Story" },
];

const IMAGE_MODELS = [
  { id: "nano-banana-2", label: "Nano Banana 2 (Standard)" },
  { id: "nano-banana-pro", label: "Nano Banana Pro (2K Ultra HD)" },
  { id: "nano-banana-lite", label: "Nano Banana 2 Lite (Speed)" },
];

const STYLE_PRESETS = [
  { label: "Default Style", value: "" },
  { label: "Photorealistic 📷", value: "photorealistic hyper-detailed cinematic lighting 8k" },
  { label: "Cinematic Movie 🎬", value: "35mm film still, anamorphic bokeh, cinematic color grading" },
  { label: "Anime / Manga 🎨", value: "vibrant anime aesthetic, Makoto Shinkai style, studio ghibli lighting" },
  { label: "3D Render 💎", value: "Unreal Engine 5 render, octane render, smooth surfaces, raytracing" },
  { label: "Cyberpunk ⚡", value: "neon glow, rainy cyberpunk street, futuristic reflections, dark mood" },
];

export default function ImageGeneratorClient() {
  const router = useRouter();
  const supabase = createClient();
  const { addToLibrary, setActiveMedia } = useMediaStore();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Form State
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("nano-banana-2");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // Status & Progress
  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "completed" | "error">("idle");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showGuestCTA, setShowGuestCTA] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [dailyImagesLeft, setDailyImagesLeft] = useState(5);
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
          if (prev < 40) return prev + 5;
          if (prev < 70) return prev + 3;
          if (prev < 88) return prev + 2;
          if (prev < 96) return prev + 1;
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Waitlist / Notify Modal
  const [showSubModal, setShowSubModal] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subSubmitted, setSubSubmitted] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        setSubEmail(u.email || "");
        const proStatus = u.app_metadata?.is_pro || u.user_metadata?.is_pro || false;
        setIsPro(Boolean(proStatus));
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
    const random = SAMPLE_IMAGE_PROMPTS[Math.floor(Math.random() * SAMPLE_IMAGE_PROMPTS.length)];
    setPrompt(random);
    setErrorMessage("");
  };

  const handleModelSelect = (model: string) => {
    if (model === "nano-banana-pro" && !isPro) {
      setShowSubModal(true);
      return;
    }
    setErrorMessage("");
    setSelectedModel(model);
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 3) {
      setErrorMessage("Please enter an image description (at least 3 characters).");
      return;
    }

    setErrorMessage("");
    setStatus("generating");
    setProgressPercent(15);
    setProgressText("Synthesizing artwork latents...");
    setImageUrl(null);
    setImageBlobUrl(null);

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

      const response = await fetch(`${backendBaseUrl}/api/image/generate`, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
          model: selectedModel,
          style: selectedStyle || undefined,
          image_base64: imageBase64,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errMsg = "Failed to start image generation.";
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
      setDailyImagesLeft((prev) => Math.max(0, prev - 1));
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
            ? `${backendBaseUrl}/api/image/status/${generationId}?token=${encodeURIComponent(token)}`
            : `${backendBaseUrl}/api/image/status/${generationId}`;

          const response = await fetch(statusUrl, { headers: authHeaders });
          if (!response.ok) return;

          const data = await response.json();
          if (data.message) {
            setProgressText(data.message);
          }

          if (data.status === "completed") {
            let finalUrl = data.download_url || `/api/image/download/${generationId}`;
            if (finalUrl.startsWith("/")) {
              finalUrl = `${backendBaseUrl.replace(/\/$/, "")}${finalUrl}`;
            }

            const authenticatedUrl = token
              ? `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
              : finalUrl;

            setImageUrl(authenticatedUrl);
            setProgressPercent(100);
            setStatus("completed");
            clearInterval(pollInterval);

            // Fetch blob for instant memory preview & library
            fetch(finalUrl, { headers: authHeaders })
              .then((res) => {
                if (!res.ok) throw new Error("Could not fetch image blob");
                return res.blob();
              })
              .then((blob) => {
                const bUrl = URL.createObjectURL(blob);
                setImageBlobUrl(bUrl);

                const item = {
                  id: generationId,
                  title: prompt.slice(0, 35) + "...",
                  type: "image" as const,
                  url: authenticatedUrl,
                  createdAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                  prompt,
                };
                addToLibrary(item);
                setActiveMedia(item);
              })
              .catch((err) => {
                console.error("Blob load note:", err);
                setImageBlobUrl(authenticatedUrl);
              });
          } else if (data.status === "failed") {
            setStatus("error");
            setProgressPercent(0);
            setErrorMessage(data.message || "Image generation failed.");
            clearInterval(pollInterval);
          }
        } catch (error) {
          // Keep polling
        }
      }, 2500);
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
          plan: "AI Image & Video Pro",
          note: "User requested launch notification for Pro subscriptions",
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
        
        {/* Generating State */}
        {(status === "generating" || status === "polling") && (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md my-auto">
            {/* Circular Ring with Centered Image Icon */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-xl animate-pulse" />
              <div
                className="absolute inset-0 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"
                style={{ animationDuration: "2.5s" }}
              />
              <div
                className="absolute inset-2 border-2 border-orange-500/20 border-b-orange-400 rounded-full animate-spin"
                style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
              />
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] z-10">
                <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-black animate-pulse" />
              </div>
            </div>

            {/* Percentage & Progress Bar */}
            <div className="space-y-3 w-full flex flex-col items-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                  {progressPercent}
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-500 dark:text-amber-400 font-mono">%</span>
              </div>

              <div className="w-64 sm:w-72 h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                  style={{ width: `${Math.max(6, Math.min(progressPercent, 100))}%` }}
                />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>{progressText || "Rendering Diffusion Pixels..."}</span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI is generating your photo. It will appear right here and save to your library.
              </p>
            </div>
          </div>
        )}

        {/* Completed State */}
        {status === "completed" && imageUrl && (
          <div className="w-full flex flex-col items-center space-y-3 max-w-xl">
            <div className="relative rounded-2xl overflow-hidden bg-black/90 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-2xl p-2 max-h-[46vh]">
              <img
                src={imageBlobUrl || imageUrl}
                alt="Generated Artwork"
                className="max-w-full max-h-[42vh] object-contain rounded-xl"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 shadow-md">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>24h</span>
              </div>
            </div>

            {/* Notification Banner */}
            <div className="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Your photo is in your library</span>
              <Link href="/tools/library" className="underline font-bold ml-1 hover:text-emerald-500">View Library &rarr;</Link>
            </div>

            {/* Download & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={imageUrl}
                download={`botock-image-${generationId || "art"}.png`}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </a>

              <a
                href={imageUrl}
                download={`botock-image-2k-${generationId || "art"}.png`}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Download 2K</span>
              </a>

              <Link
                href="/tools?cat=image"
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Edit in Studio</span>
              </Link>
            </div>
          </div>
        )}

        {/* Idle Canvas State */}
        {status === "idle" && (
          <div className="w-full max-w-lg aspect-square sm:aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center space-y-3 transition-all my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Image Canvas Ready</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Your generated artwork will render right here. Enter a prompt below to synthesize artwork.
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
            <p className="text-xs text-red-500 dark:text-red-400 max-w-xs">{errorMessage || "Failed to generate image."}</p>
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
              onChange={(e) => setAspectRatio(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
            >
              {ASPECT_RATIOS.map((r) => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-[#09090b]">{r.label}</option>
              ))}
            </select>

            {/* Model Select */}
            <select
              value={selectedModel}
              onChange={(e) => handleModelSelect(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-[#09090b]">{m.label}</option>
              ))}
            </select>

            {/* Style Preset */}
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 cursor-pointer hidden sm:block"
            >
              {STYLE_PRESETS.map((s, idx) => (
                <option key={idx} value={s.value} className="bg-white dark:bg-[#09090b]">{s.label}</option>
              ))}
            </select>

            {/* Reference Image chip if attached */}
            {referenceImage && (
              <div className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                <ImageIcon className="w-3 h-3" />
                <span className="truncate max-w-[80px]">Photo</span>
                <button type="button" onClick={removeReferenceImage} className="hover:text-amber-300 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quota Indicator */}
            <div className="ml-auto text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              {isPro ? "Unlimited" : "Standard Plan"}
            </div>
          </div>

          {/* Prompt Input Box */}
          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/90 dark:bg-white/[0.04] focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all flex items-end p-1 sm:p-1.5 gap-1.5 shadow-inner">
            
            {/* Left Tools */}
            <div className="flex items-center gap-0.5 pl-1 pb-1 shrink-0">
              <label className="cursor-pointer p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors" title="Attach Reference Image">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              <button
                type="button"
                onClick={applySurprisePrompt}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-amber-500 transition-colors"
                title="Surprise Me (Random Prompt)"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
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
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
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
