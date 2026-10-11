"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film,
  Scissors,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Layers,
  Wand2,
  FileCheck,
  Lock,
  Music,
  Minimize2,
  Cpu,
  Layers3,
  Split,
  Crop,
  Sliders,
  BookOpen,
  Eye,
} from "lucide-react";
import AdBanner from "./components/AdBanner";
import ToolsSlider from "./components/ToolsSlider";
import ToolGlideTicker from "./components/ToolGlideTicker";

const TOP_USED_TOOLS = [
  {
    id: "pdf-merge",
    name: "Merge PDF Documents",
    desc: "Combine multiple PDF files into one clean document with custom page reordering.",
    category: "PDF Suite",
    badge: "Most Used",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/20",
    href: "/tools/pdf-merge",
    icon: FileText,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "ai-video",
    name: "AI Video Generator",
    desc: "Generate 4–10s realistic scenes from text prompts and photos via Cinematic AI AI.",
    category: "AI Studio",
    badge: "Daily Credits",
    badgeColor: "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/20",
    href: "/tools/video-generator",
    icon: Film,
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "remove-bg",
    name: "Remove Photo Background",
    desc: "Cut out backgrounds instantly from portraits and product photos with AI edge precision.",
    category: "Image Suite",
    badge: "Instant AI",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
    href: "/tools/image-remove-bg",
    icon: Sparkles,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "video-trimmer",
    name: "Video Cutter & Trimmer",
    desc: "Cut unwanted footage with frame-level accuracy in your browser with zero latency.",
    category: "Video Suite",
    badge: "0ms Lag",
    badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/20",
    href: "/tools/video-trim",
    icon: Scissors,
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word (DOCX)",
    desc: "Convert static PDF documents and contracts into fully editable Microsoft Word files.",
    category: "PDF Suite",
    badge: "OCR Enabled",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/20",
    href: "/tools/pdf-to-word",
    icon: FileCheck,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "ai-image",
    name: "AI Image Studio",
    desc: "Generate hyper-detailed visuals with Nano Banana Lite, 2 & Pro in 5 aspect ratios.",
    category: "AI Studio",
    badge: "Nano Banana",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/20",
    href: "/tools/image-generator",
    icon: Wand2,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "pdf-compress",
    name: "Compress PDF Files",
    desc: "Reduce PDF document size for email sharing without compromising font readability.",
    category: "PDF Suite",
    badge: "Up to 80%",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/20",
    href: "/tools/pdf-compress",
    icon: Minimize2,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "video-to-mp3",
    name: "Extract MP3 Audio",
    desc: "Rip crystal clear high-bitrate MP3 audio from any MP4, MOV, or MKV video file.",
    category: "Audio Suite",
    badge: "Lossless Audio",
    badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/20",
    href: "/tools/video-to-mp3",
    icon: Music,
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];

const FEATURED_GUIDE = {
  id: "complete-guide-to-botock-video-editor",
  title: "The Complete Guide to Botock Video Editor: Timeline, Motion Animation, Visual FX & WebAssembly Export",
  excerpt:
    "The definitive creator guide to Botock Video Editor. Discover why it was built, full feature breakdown (multi-track power hierarchy, resizable FX blocks, continuous zooms, directional motion animations, typewriter text), and zero-server client-side MP4 export.",
  category: "Creator Guides",
  badgeColor: "bg-pink-500/10 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/20 dark:border-pink-500/30",
  readTime: "15 min read",
  date: "October 11, 2026",
  views: "34.2k reads",
};

const CURATED_BLOGS = [
  {
    id: "complete-guide-to-ai-video-tools-creators",
    title: "The Ultimate AI Video Creator Toolkit: Auto-Reframe, Background Remover & Reaction Studio",
    excerpt: "Learn how to repurpose horizontal clips to 9:16 Shorts, strip backgrounds without green screens, straighten orientation, and build stacked reaction videos.",
    category: "Creator Guides",
    badgeColor: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/20 dark:border-sky-500/30",
    readTime: "14 min read",
    date: "October 11, 2026",
  },
  {
    id: "complete-guide-to-ai-image-tools-upscale-rotate",
    title: "AI Image Editing Mastery: Batch Auto-Rotate, 4K/8K Upscaler & Background Removal",
    excerpt: "Scale your visual workflows. Batch straighten up to 100+ photos via folder upload with ZIP download, upscale low-res images to 4K/8K, and generate transparent cutouts.",
    category: "AI & Tech",
    badgeColor: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-500/30",
    readTime: "13 min read",
    date: "October 11, 2026",
  },
  {
    id: "complete-guide-to-ai-audio-voice-tools",
    title: "Mastering AI Audio & Voice Production: Noise Removal, Voice Changer & Subtitles",
    excerpt: "Transform noisy smartphone recordings into acoustic studio masters. Comprehensive guide on noise removal, neural character voices, automated subtitles, and MP3 extraction.",
    category: "AI & Tech",
    badgeColor: "bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/20 dark:border-violet-500/30",
    readTime: "11 min read",
    date: "October 11, 2026",
  },
  {
    id: "complete-guide-to-pdf-tools-workflows",
    title: "The Complete Guide to Modern PDF Tools: AI Summarizer, 3D Flipbook & AcroForms",
    excerpt: "Everything you need to know about modern digital documents. What each PDF tool does, step-by-step instructions, benefits, and productivity workflows.",
    category: "Productivity",
    badgeColor: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/20 dark:border-rose-500/30",
    readTime: "12 min read",
    date: "October 11, 2026",
  },
  {
    id: "how-to-create-reaction-videos-trends-guide",
    title: "Why Reaction Videos Dominate Social Media in 2026: Trends, Data & Complete Guide",
    excerpt: "Discover why top-and-bottom stacked reaction videos dominate TikTok, Shorts, and Reels with 82% retention rates. Full trends data and creation tutorial.",
    category: "Showbiz & Media",
    badgeColor: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/20 dark:border-amber-500/30",
    readTime: "8 min read",
    date: "October 10, 2026",
  },
  {
    id: "ai-agents-creative-workflows",
    title: "How AI Agents are Revolutionizing Creative Workflows in 2026",
    excerpt: "Explore how autonomous AI agents are taking over repetitive coding, designing, and video editing tasks, allowing creators to focus on imagination.",
    category: "AI & Tech",
    badgeColor: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/20 dark:border-blue-500/30",
    readTime: "6 min read",
    date: "October 10, 2026",
  },
];

export default function HomeClient() {
  const router = useRouter();

  // If Supabase OAuth redirected back to root '/' with ?code=...,
  // immediately exchange the code via /auth/callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        window.location.href = `/auth/callback?code=${encodeURIComponent(code)}&next=/`;
      }
    }
  }, []);

  const [cms, setCms] = useState({
    heroHeadline: "Every Online Tool You Need.",
    heroGradient: "PDFs, Media & Generative AI.",
    heroSubtitle: "Convert, edit, compress, and process PDFs, images, and videos in seconds — plus generate cinematic AI videos and photorealistic artwork powered by Cinematic AI & Nano Banana.",
    topBannerText: "All-in-One Creative Studio & 100+ Online Utilities",
  });

  useEffect(() => {
    const loadCms = () => {
      try {
        const stored = localStorage.getItem("botock_cms_content");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCms((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    };
    loadCms();
    window.addEventListener("botock_cms_updated", loadCms);
    return () => window.removeEventListener("botock_cms_updated", loadCms);
  }, []);

  return (
    <div className="flex-1 flex flex-col transition-colors">
      {/* 1. Hero Section: Expansive Container & Multi-Tool Focus */}
      <section className="relative overflow-hidden py-16 sm:py-24 text-center border-b border-slate-200 dark:border-white/[0.06]">
        {/* Subtle glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-500/10 dark:bg-blue-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          {/* Platform Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{cms.topBannerText}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 text-slate-900 dark:text-white leading-[1.15]">
            {cms.heroHeadline} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 dark:from-blue-400 dark:via-indigo-300 dark:to-amber-300">
              {cms.heroGradient}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            {cms.heroSubtitle}
          </p>

          {/* Direct Category Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-2xl mx-auto">
            <Link
              href="/tools"
              className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-400 dark:text-blue-600" />
              Explore All Tools
            </Link>
            <Link
              href="/tools/video-generator"
              className="px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-violet-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              AI Video Generator
            </Link>
            <Link
              href="/tools/image-generator"
              className="px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-white border border-slate-300 dark:border-white/[0.1] font-semibold text-xs sm:text-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              AI Image Studio
            </Link>
          </div>

          {/* Core Categories Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 max-w-4xl mx-auto gap-4 pt-8 border-t border-slate-200 dark:border-white/[0.06] text-center">
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <div className="text-2xl font-black text-slate-900 dark:text-white">Complete Suite</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">PDF Suite (Merge, OCR, Encrypt)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <div className="text-2xl font-black text-slate-900 dark:text-white">Essential Suite</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Image Suite (Remove BG, WebP)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <div className="text-2xl font-black text-slate-900 dark:text-white">Studio Suite</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Video Suite (Editor, Cutter, MP3)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400">Daily Quota</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">3 AI Videos + 5 AI Images</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Continuous Gliding Multi-Tool Ticker (Infinite Marquee) */}
      <section className="bg-slate-100/50 dark:bg-[#0b0b0f] border-b border-slate-200 dark:border-white/[0.06] py-3 transition-colors">
        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12 mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Our Tools</span>
          </span>
          <Link href="/tools" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
            <span>View All Tools →</span>
          </Link>
        </div>
        <ToolGlideTicker />
      </section>

      {/* 3. Platform Architecture Pillars (Replacing all mock/fake numbers) */}
      <section className="py-12 bg-white dark:bg-[#09090b] border-b border-slate-200 dark:border-white/[0.06] transition-colors">
        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Privacy-First Creative Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Engineered for instantaneous processing, complete client-side data privacy, and zero long-term retention.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Pillar 1: In-Browser Privacy */}
            <div className="rounded-2xl bg-slate-50 dark:bg-[#111114] p-6 border border-slate-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Client-Side Privacy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard PDF, image, and video utilities process locally in your browser. Files never leave your machine for routine operations.
              </p>
            </div>

            {/* Pillar 2: 0ms Studio Bridge */}
            <div className="rounded-2xl bg-slate-50 dark:bg-[#111114] p-6 border border-slate-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                0ms Studio Bridge
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                AI generated videos instantly transfer into the In-Browser Video Studio via memory buffer without re-downloading or waiting.
              </p>
            </div>

            {/* Pillar 3: Zero Data Retention */}
            <div className="rounded-2xl bg-slate-50 dark:bg-[#111114] p-6 border border-slate-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                24h Auto-Purge Policy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Intermediate files and AI generations are permanently deleted from temporary storage after 24 hours. Zero long-term retention.
              </p>
            </div>

            {/* Pillar 4: Daily Free Allocations */}
            <div className="rounded-2xl bg-slate-50 dark:bg-[#111114] p-6 border border-slate-200 dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Daily Quotas
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every registered user receives 3 video clips (Botock Engine) and 5 images (Nano Banana) refreshed automatically every 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Top Used Tools (Replaces the Real AI Output Gallery as requested) */}
      <section className="py-16 bg-slate-50/50 dark:bg-[#0a0a0e] border-b border-slate-200 dark:border-white/[0.06] transition-colors">
        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Highest Demand Utilities</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Top Used Everyday Tools
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                The most popular multimedia, document, and AI tools launched daily by creators and professionals.
              </p>
            </div>

            <Link
              href="/tools"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore All 100+ Directory →</span>
            </Link>
          </div>

          {/* Top Tools 8-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOP_USED_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 p-6 flex flex-col justify-between transition-all group hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {tool.desc}
                    </p>
                  </div>

                  <Link
                    href={tool.href}
                    className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-white/[0.06] group/btn cursor-pointer"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Interactive Tools Showcase Slider */}
      <section className="py-16 bg-white dark:bg-[#09090b] border-b border-slate-200 dark:border-white/[0.06] transition-colors">
        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggested For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Personalized Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select a category to filter, or scroll horizontally to launch any online utility immediately.
            </p>
          </div>

          <ToolsSlider />
        </div>
      </section>

      {/* Ad Space */}
      <AdBanner slot="home-leaderboard" />

      {/* 6. Creator Guides & Knowledge Hub (Rich Blog Showcase) */}
      <section className="py-20 bg-slate-50/50 dark:bg-[#0a0a0e] border-t border-slate-200 dark:border-white/[0.06] transition-colors">
        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge Hub & Tutorials</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Featured Guides & Creator Tutorials
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Step-by-step masterclasses, workflow blueprints, and production techniques covering video editing, AI generation, audio engineering, and document automation.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto py-2"
            >
              <span>Explore All 15+ Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Featured Hero Guide */}
          <Link
            href={`/blog/${FEATURED_GUIDE.id}`}
            className="block mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/50 transition-all hover:shadow-xl group relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-4xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${FEATURED_GUIDE.badgeColor}`}>
                    {FEATURED_GUIDE.category}
                  </span>
                  <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Spotlight Guide
                  </span>
                  <span className="text-slate-300 dark:text-white/20">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {FEATURED_GUIDE.readTime}
                  </span>
                  <span className="text-slate-300 dark:text-white/20">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {FEATURED_GUIDE.date}
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors leading-snug">
                  {FEATURED_GUIDE.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {FEATURED_GUIDE.excerpt}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <div className="px-5 py-3 rounded-xl bg-violet-600 group-hover:bg-violet-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md group-hover:translate-x-0.5">
                  <span>Read Creator Manual</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* 6-Card Grid of Curated Tutorials */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CURATED_BLOGS.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.id}`}
                className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 p-6 flex flex-col justify-between transition-all group hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${blog.badgeColor}`}>
                      {blog.category}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readTime}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-white transition-colors">
                  <span>Read Tutorial</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Catalog Discovery Strip */}
          <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Looking for specific tools, prompting formulas, or technical FAQs?
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visit the Botock Creative Intelligence blog for our complete collection of 15+ guides.
              </div>
            </div>
            <Link
              href="/blog"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-zinc-950 font-bold text-xs transition-all shrink-0 cursor-pointer shadow-sm"
            >
              Browse Full Catalog →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
