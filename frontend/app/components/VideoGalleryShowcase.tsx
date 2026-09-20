"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Sparkles,
  Film,
  Wand2,
  Copy,
  Check,
  ArrowRight,
  Maximize2,
  Clock,
  Zap,
} from "lucide-react";

interface ShowcaseItem {
  id: string;
  title: string;
  type: "video" | "image";
  model: string;
  duration?: string;
  ratio: string;
  prompt: string;
  previewGradient: string;
  badge: string;
  badgeColor: string;
  targetUrl: string;
}

const SHOWCASES: ShowcaseItem[] = [
  {
    id: "sc-1",
    title: "Cyberpunk Neo-Tokyo Rain",
    type: "video",
    model: "Omni 1.1 Flash 360p",
    duration: "10s",
    ratio: "16:9",
    prompt: "Cinematic 4K hyperlapse through a neon-lit Tokyo street during heavy rain, futuristic flying vehicles reflected in wet asphalt, anamorphic lens flare.",
    previewGradient: "from-blue-950 via-indigo-900 to-violet-950",
    badge: "Omni 1.1 Flash",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    targetUrl: "/tools/video-generator?prompt=Cinematic+4K+hyperlapse+through+a+neon-lit+Tokyo+street+during+heavy+rain",
  },
  {
    id: "sc-2",
    title: "Cybernetic Cyber-Samurai",
    type: "image",
    model: "Nano Banana Pro",
    ratio: "1:1",
    prompt: "Ultra-detailed portrait of a cybernetic warrior in obsidian armor, glowing blue circuit lines, hyper-realistic skin texture, volumetric studio lighting.",
    previewGradient: "from-amber-950 via-zinc-900 to-amber-900",
    badge: "Nano Banana Pro",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    targetUrl: "/tools/image-generator?prompt=Ultra-detailed+portrait+of+a+cybernetic+warrior+in+obsidian+armor",
  },
  {
    id: "sc-3",
    title: "Vertical TikTok Fashion Glow",
    type: "video",
    model: "Omni 1.1 Flash",
    duration: "8s",
    ratio: "9:16",
    prompt: "Vertical 9:16 mobile reel of a high-fashion model walking in Paris at golden hour, silk fabric floating in slow motion, soft cinematic backlight.",
    previewGradient: "from-pink-950 via-purple-900 to-zinc-950",
    badge: "9:16 Reels",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    targetUrl: "/tools/video-generator?prompt=Vertical+mobile+reel+of+a+high-fashion+model+walking+at+golden+hour",
  },
  {
    id: "sc-4",
    title: "Fjord Drone Hyperlapse",
    type: "video",
    model: "Omni 1.1 Flash 360p",
    duration: "6s",
    ratio: "16:9",
    prompt: "Sweeping cinematic drone shot gliding through mystical misty Norwegian fjords at sunrise, crystal clear waterfalls tumbling down jagged green cliffs.",
    previewGradient: "from-emerald-950 via-teal-950 to-cyan-950",
    badge: "Google Flow",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    targetUrl: "/tools/video-generator?prompt=Sweeping+cinematic+drone+shot+gliding+through+mystical+misty+fjords",
  },
  {
    id: "sc-5",
    title: "Neon Sports Car Drift",
    type: "video",
    model: "Omni 1.1 Flash",
    duration: "4s",
    ratio: "16:9",
    prompt: "Sleek metallic electric sports car drifting around a wet mountain hairpin curve at midnight, glowing purple taillight trails, sparks flying.",
    previewGradient: "from-violet-950 via-slate-900 to-blue-950",
    badge: "Omni 1.1 Flash",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    targetUrl: "/tools/video-generator?prompt=Sleek+metallic+electric+sports+car+drifting+around+mountain+curve",
  },
  {
    id: "sc-6",
    title: "Bioluminescent Crystal Cave",
    type: "image",
    model: "Nano Banana 2",
    ratio: "16:9",
    prompt: "Underground cavern glowing with floating blue spores and giant violet crystal spires, pristine subterranean lake reflecting cosmic light.",
    previewGradient: "from-cyan-950 via-indigo-950 to-blue-900",
    badge: "Nano Banana 2",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    targetUrl: "/tools/image-generator?prompt=Underground+cavern+glowing+with+floating+blue+spores+and+crystal+spires",
  },
];

export default function VideoGalleryShowcase() {
  const [activeFilter, setActiveFilter] = useState<"all" | "video" | "image">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = activeFilter === "all" ? SHOWCASES : SHOWCASES.filter((item) => item.type === activeFilter);

  const handleCopyPrompt = (id: string, text: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real AI Output Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Generative Video & Image Gallery
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sample high-fidelity outputs generated with Omni 1.1 Flash 360p and Nano Banana. Click to launch with prompt.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08] self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === "all" ? "bg-white text-zinc-950 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            All Works
          </button>
          <button
            onClick={() => setActiveFilter("video")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "video" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>AI Videos</span>
          </button>
          <button
            onClick={() => setActiveFilter("image")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "image" ? "bg-amber-500 text-zinc-950 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Images</span>
          </button>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-[#111114] border border-white/[0.08] hover:border-violet-500/40 overflow-hidden flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-violet-950/20"
          >
            {/* Visual Cinema Screen Preview */}
            <div className={`relative w-full aspect-video bg-gradient-to-br ${item.previewGradient} flex items-center justify-center overflow-hidden`}>
              {/* Subtle grid pattern inside */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Play / Inspect overlay button */}
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-violet-600 group-hover:border-violet-500 transition-all shadow-lg">
                {item.type === "video" ? (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
              </div>

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md ${item.badgeColor}`}>
                  {item.badge}
                </span>
                {item.duration && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/50 text-white border border-white/10 backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.duration}</span>
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/60 text-slate-300 border border-white/10 backdrop-blur-md">
                  {item.ratio}
                </span>
              </div>
            </div>

            {/* Content & Prompt */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-violet-300 transition-colors flex items-center justify-between">
                  <span>{item.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{item.model}</span>
                </h3>

                {/* Prompt Box */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.05] relative mb-4">
                  <p className="text-[11px] text-slate-300 font-mono line-clamp-3 leading-relaxed">
                    "{item.prompt}"
                  </p>
                  <button
                    onClick={(e) => handleCopyPrompt(item.id, item.prompt, e)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy Prompt"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Launch CTA */}
              <Link
                href={item.targetUrl}
                className="w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-violet-600 border border-white/[0.08] hover:border-violet-500 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group/btn"
              >
                <span>Use This Prompt in Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
