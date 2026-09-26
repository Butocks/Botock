"use client";

import { useState, useEffect } from "react";
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
  Zap,
  Upload,
  AlertCircle,
  X,
  CheckCircle2,
  Crown,
  Dices,
  Layers,
  Scissors,
  Clock,
  Sliders,
} from "lucide-react";
import AdBanner from "../../components/AdBanner";

const SAMPLE_IMAGE_PROMPTS = [
  "A majestic snow leopard perched on Himalayan mountain cliffs at golden hour, sharp focus, 8k resolution, National Geographic style",
  "Cyberpunk samurai in neon-lit Tokyo back alley, reflective rain puddles, volumetric mist, 35mm photograph, octane render",
  "Cute fluffy baby red panda holding a small lantern in enchanted bamboo forest, soft morning rim light, unreal engine 5",
  "Futuristic organic architecture city with hanging gardens and waterfalls, sunset lighting, raytracing, Hasselblad masterwork",
  "Hyper-realistic macro photography of a chameleon eye with iridescent jewel scales and complex reflections",
];

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9", sub: "Landscape", iconClass: "w-6 h-3.5" },
  { id: "4:3", label: "4:3", sub: "Standard", iconClass: "w-5 h-4" },
  { id: "1:1", label: "1:1", sub: "Square", iconClass: "w-4 h-4" },
  { id: "3:4", label: "3:4", sub: "Portrait", iconClass: "w-4 h-5" },
  { id: "9:16", label: "9:16", sub: "Story/Reels", iconClass: "w-3.5 h-6" },
];

const STYLE_PRESETS = [
  { label: "Photorealistic 📷", value: "photorealistic hyper-detailed cinematic lighting 8k" },
  { label: "Cinematic Movie 🎬", value: "35mm film still, anamorphic bokeh, cinematic color grading" },
  { label: "Anime / Manga 🎨", value: "vibrant anime aesthetic, Makoto Shinkai style, studio ghibli lighting" },
  { label: "3D Render 💎", value: "Unreal Engine 5 render, octane render, smooth surfaces, raytracing" },
  { label: "Cyberpunk ⚡", value: "neon glow, rainy cyberpunk street, futuristic reflections, dark mood" },
  { label: "Digital Art 🖌️", value: "trending on Artstation, detailed digital painting, rich color palette" },
];

export default function ImageGeneratorPage() {
  const router = useRouter();
  const supabase = createClient();
  const { addToLibrary, setActiveMedia } = useMediaStore();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Form State
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<"nano-banana-lite" | "nano-banana-2" | "nano-banana-pro">("nano-banana-2");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // Status & Progress
  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "completed" | "error">("idle");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [dailyImagesLeft, setDailyImagesLeft] = useState(5);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
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

  const handleModelSelect = (model: "nano-banana-lite" | "nano-banana-2" | "nano-banana-pro") => {
    if (model === "nano-banana-pro" && !isPro) {
      setErrorMessage("Nano Banana Pro is reserved for Pro members. Switched to Nano Banana 2.");
      setSelectedModel("nano-banana-2");
      return;
    }
    setErrorMessage("");
    setSelectedModel(model);
  };

  const handleGenerate = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (prompt.trim().length < 3) {
      setErrorMessage("Please enter an image description (at least 3 characters).");
      return;
    }

    setErrorMessage("");
    setStatus("generating");
    setProgressText("Synthesizing Nano Banana pixels...");
    setImageUrl(null);
    setImageBlobUrl(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      const backendBaseUrl = getBackendUrl();

      const response = await fetch(`${backendBaseUrl}/api/image/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
          model: selectedModel,
          style: selectedStyle || undefined,
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
      setDailyImagesLeft((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
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
          const authHeaders: Record<string, string> = {};
          if (token) {
            authHeaders["Authorization"] = `Bearer ${token}`;
          }

          const backendBaseUrl = getBackendUrl();
          const authHeaders: Record<string, string> = {
            "Bypass-Tunnel-Reminder": "true",
          };
          if (token) {
            authHeaders["Authorization"] = `Bearer ${token}`;
          }

          const statusUrl = token
            ? `${backendBaseUrl}/api/image/status/${generationId}?token=${encodeURIComponent(token)}`
            : `${backendBaseUrl}/api/image/status/${generationId}`;

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
              : `${backendBaseUrl}/api/image/download/${generationId}`;

            const authenticatedUrl = token
              ? `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
              : rawUrl;

            setImageUrl(authenticatedUrl);
            setStatus("completed");
            clearInterval(pollInterval);

            // Fetch blob for instant memory preview & library
            fetch(rawUrl, { headers: authHeaders })
              .then((res) => res.blob())
              .then((blob) => {
                const bUrl = URL.createObjectURL(blob);
                setImageBlobUrl(bUrl);

                const item = {
                  id: generationId,
                  title: prompt.slice(0, 35) + "...",
                  type: "image" as const,
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
                  type: "image" as const,
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

  return (
    <div className="flex-1 flex flex-col max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Quota Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Photorealistic Synthesis
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">• Google Flow Nano Banana Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            AI Image Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Synthesize masterwork photorealistic artwork and digital designs with custom aspect ratios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-[#140e06] border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2 shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Quota: {user ? `${dailyImagesLeft} / 5 Free Left` : "5 Free / Day"}</span>
          </div>
          <Link
            href="/pricing"
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            Upgrade Plan →
          </Link>
        </div>
      </div>

      {/* Guest Lock Banner */}
      {!user && !authLoading && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#191107] to-purple-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sign In Required to Generate AI Images</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Join Botock for free to generate 5 high-resolution Nano Banana images daily with full aspect ratio freedom.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Sign In Free →
          </Link>
        </div>
      )}

      {/* 2-Column AI Image Studio (Runway ML Architecture: 35% Controls, 65% Canvas) */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[640px]">
        {/* Left Panel: Studio Controls (35% Width) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          <div className="rounded-2xl p-6 flex-1 flex flex-col justify-between studio-panel shadow-2xl">
            <div className="space-y-5">
              {/* Model Selection (Nano Banana Lite, 2, Pro) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Nano Banana Engine
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Nano Banana Lite */}
                  <button
                    type="button"
                    onClick={() => handleModelSelect("nano-banana-lite")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-95 ${
                      selectedModel === "nano-banana-lite"
                        ? "border-emerald-500 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/20"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080512] hover:border-emerald-500/40 text-slate-600 dark:text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Lite</span>
                      <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">Free</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">
                      Fast 1K render
                    </p>
                  </button>

                  {/* Nano Banana 2 */}
                  <button
                    type="button"
                    onClick={() => handleModelSelect("nano-banana-2")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-95 ${
                      selectedModel === "nano-banana-2"
                        ? "border-amber-500 bg-amber-500/15 text-white shadow-md shadow-amber-500/20"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080512] hover:border-amber-500/40 text-slate-600 dark:text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Banana 2</span>
                      <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">Popular</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">
                      Photorealism
                    </p>
                  </button>

                  {/* Nano Banana Pro */}
                  <button
                    type="button"
                    onClick={() => handleModelSelect("nano-banana-pro")}
                    className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer active:scale-95 ${
                      selectedModel === "nano-banana-pro"
                        ? "border-violet-500 bg-violet-600/15 text-white shadow-md shadow-violet-500/20"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080512] hover:border-violet-500/40 text-slate-600 dark:text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Pro</span>
                      {isPro ? (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-violet-500/20 text-violet-300 font-bold">Active</span>
                      ) : (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold flex items-center gap-0.5 border border-purple-500/30">
                          <Crown className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">
                      8K Hasselblad
                    </p>
                  </button>
                </div>
              </div>

              {/* Prompt Box with Dice */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Image Prompt Description
                  </label>
                  <button
                    type="button"
                    onClick={applySurprisePrompt}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Surprise Me 🎲</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  className={`w-full bg-slate-50 dark:bg-[#080512] border rounded-xl p-3.5 text-white text-xs sm:text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none transition-all placeholder:text-slate-500 dark:text-slate-400 ${
                    errorMessage && prompt.trim().length < 3 ? "border-red-500/60" : "border-slate-300 dark:border-white/[0.1]"
                  }`}
                  placeholder="Describe your visual concept... E.g. A majestic snow leopard perched on Himalayan mountain cliffs at golden hour, sharp focus, 8k resolution..."
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  disabled={status === "generating" || status === "polling"}
                />

                {/* Inspiration Chips */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex-shrink-0">Ideas:</span>
                  {SAMPLE_IMAGE_PROMPTS.slice(0, 2).map((s, idx) => (
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

              {/* Style Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                  Artistic Style (Optional)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STYLE_PRESETS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedStyle((prev) => (prev === s.value ? "" : s.value))}
                      className={`text-[10px] font-semibold py-1.5 px-2 rounded-lg border transition-all cursor-pointer active:scale-95 truncate ${
                        selectedStyle === s.value
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                          : "bg-slate-50 dark:bg-[#080512] hover:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selector (16:9, 4:3, 1:1, 3:4, 9:16) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                  Aspect Ratio Size
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setAspectRatio(ratio.id)}
                      disabled={status === "generating" || status === "polling"}
                      className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                        aspectRatio === ratio.id
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20"
                          : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080512] hover:border-amber-500/40 text-slate-600 dark:text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className={`border border-current rounded-sm mb-1 ${ratio.iconClass}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{ratio.label}</span>
                      <span className="text-[8px] text-slate-600 dark:text-slate-400">{ratio.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Image Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
                  <span>Reference Image (Optional)</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">JPG, PNG</span>
                </label>

                {!referencePreview ? (
                  <label className="border border-dashed border-white/[0.12] hover:border-amber-500/50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-50 dark:bg-[#080512] hover:bg-[#120e24] transition-all text-xs text-slate-600 dark:text-slate-400 hover:text-white">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload style reference image</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#080512] border border-amber-500/30">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-white/[0.1] flex-shrink-0">
                      <img src={referencePreview} alt="Ref" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{referenceImage?.name}</div>
                      <div className="text-[10px] text-emerald-400">Attached as style reference</div>
                    </div>
                    <button
                      type="button"
                      onClick={removeReferenceImage}
                      className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Bottom Generate Action */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/[0.08] mt-6">
              {user ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={status === "generating" || status === "polling"}
                  className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                    status === "generating" || status === "polling"
                      ? "bg-amber-500/40 text-black/60 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {status === "generating" || status === "polling"
                      ? "Synthesizing Nano Banana Image..."
                      : `Generate Image (${selectedModel.replace('-', ' ').toUpperCase()})`}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-xl shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Generate Image Free</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: The Cinema Hero Canvas (65% Width) */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6">
          <div className="rounded-2xl p-6 flex-1 flex flex-col justify-center items-center obsidian-card shadow-2xl relative overflow-hidden min-h-[520px]">
            {/* Generating State with Orbital Amber Loader */}
            {(status === "generating" || status === "polling") && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-2 border-2 border-orange-500/20 border-b-orange-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-pulse">
                    <ImageIcon className="w-7 h-7 text-black" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Synthesizing Nano Banana Pixels</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Rendering High-Resolution Artwork</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {progressText || "Computing diffusion latents with chosen aspect ratio..."}
                  </p>
                </div>
              </div>
            )}

            {/* Completed State */}
            {status === "completed" && imageUrl && (
              <div className="w-full h-full flex flex-col justify-between space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-slate-300 dark:border-white/[0.1] flex items-center justify-center shadow-2xl max-h-[460px] p-2">
                  <img
                    src={imageBlobUrl || imageUrl}
                    alt="Generated Artwork"
                    className="w-full h-full object-contain max-h-[440px] rounded-xl"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Expires in 24h</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={imageUrl}
                      download={`botock-image-${generationId || "art"}.png`}
                      className="py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG (High-Res)</span>
                    </a>
                    <Link
                      href="/tools?cat=image"
                      className="py-3.5 rounded-xl bg-slate-50 dark:bg-[#080512] hover:bg-white/[0.08] border border-white/[0.12] text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Edit with Image Tools</span>
                    </Link>
                  </div>

                  <Link
                    href="/tools/library"
                    className="text-center text-xs text-slate-600 dark:text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    Saved to My Library (24h Retention) →
                  </Link>
                </div>
              </div>
            )}

            {/* Idle State */}
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-[#140e06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shadow-inner group">
                  <ImageIcon className="w-9 h-9 text-amber-400/70 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Live AI Canvas</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Select a Nano Banana model and your preferred aspect ratio ({aspectRatio}), then click Generate to synthesize photorealistic artwork.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> 5 Aspect Ratios</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> 1-Click High-Res PNG</span>
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
                    {errorMessage || "Failed to generate image."}
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

          <AdBanner slot="image-generator-sidebar" />
        </div>
      </div>
    </div>
  );
}
