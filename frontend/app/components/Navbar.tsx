"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { createClient } from "../../utils/supabase/client";
import {
  ChevronDown,
  Film,
  Sparkles,
  Scissors,
  FileText,
  Image as ImageIcon,
  Video,
  Grid,
  Zap,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ArrowRight,
  Camera,
  Layers,
  FileSpreadsheet,
  FileArchive,
  Music,
  Maximize2,
  Wand2,
  ShieldCheck,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "butoameerali@gmail.com,creator@botock.ai,owner@botock.com,admin@botock.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const isUserAdmin = user && envAdmins.includes(user?.email?.toLowerCase() || "");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleMouseEnter = (menu: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] transition-colors select-none">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Botock Logo"
                  width={48}
                  height={48}
                  className="object-contain drop-shadow-[0_0_16px_rgba(59,130,246,0.4)] group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white flex items-center">
                  Botock
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold -mt-0.5">
                  AI & Creative Tools
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              Home
            </Link>

            {/* Mega Menu 1: AI Studios ▾ */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("studios")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => toggleDropdown("studios")}
                className={`text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  activeDropdown === "studios"
                    ? "bg-violet-600/20 text-violet-600 dark:text-violet-300 border border-violet-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                }`}
              >
                <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span>AI Studios</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "studios" ? "rotate-180 text-violet-500" : "text-slate-400"}`} />
              </button>

              {activeDropdown === "studios" && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-[740px] rounded-2xl bg-white dark:bg-[#0f0f13] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-5 z-50 animate-fade-in"
                  onMouseEnter={() => handleMouseEnter("studios")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-12 gap-4">
                    {/* Video Studio */}
                    <div className="col-span-5 space-y-2">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-violet-600 dark:text-violet-400 px-2 flex items-center gap-1.5">
                        <Film className="w-3 h-3" />
                        <span>Generative Video</span>
                      </div>

                      <Link
                        href="/tools/video-generator"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                          <Film className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                            AI Video Generator
                            <span className="text-[9px] px-1.5 py-0.2 bg-violet-500/15 text-violet-600 dark:text-violet-300 rounded font-semibold border border-violet-500/30">Flow</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Text & Photo to realistic 4–10s video with camera motion hints
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/tools/video-editor"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                            Video Studio Editor
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Trim, speed, aspect crop & filters with 0ms memory bridge
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Image Studio */}
                    <div className="col-span-4 space-y-2 border-l border-slate-200 dark:border-white/[0.08] pl-4">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 px-2 flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3" />
                        <span>Generative Image</span>
                      </div>

                      <Link
                        href="/tools/image-generator"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                            AI Image Generator
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded font-semibold border border-emerald-500/30">Free</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Nano Banana Lite, 2 & Pro in 5 aspect ratios
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Free Quota Card */}
                    <div className="col-span-3 rounded-xl bg-slate-50 dark:bg-[#15151a] p-3 border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-300 mb-1 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Daily Allowance
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                          Free AI Video & Image generation quota refreshed every 24 hours.
                        </p>
                      </div>
                      <Link
                        href="/pricing"
                        onClick={() => setActiveDropdown(null)}
                        className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 mt-3"
                      >
                        <span>Upgrade to Pro →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mega Menu 2: 100+ Tools ▾ */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("tools")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => toggleDropdown("tools")}
                className={`text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  activeDropdown === "tools"
                    ? "bg-violet-600/20 text-violet-600 dark:text-violet-300 border border-violet-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                }`}
              >
                <Grid className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span>100+ Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "tools" ? "rotate-180 text-sky-500" : "text-slate-400"}`} />
              </button>

              {activeDropdown === "tools" && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-[1120px] max-w-[95vw] rounded-2xl bg-white dark:bg-[#0f0f13] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-6 z-50 animate-fade-in"
                  onMouseEnter={() => handleMouseEnter("tools")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-4 gap-5">
                    {/* PDF Suite */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-red-500 dark:text-red-400 px-1 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF Suite (34 Tools)</span>
                      </div>
                      <Link href="/tools/pdf-merge" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Merge PDF</Link>
                      <Link href="/tools/pdf-split" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Split PDF</Link>
                      <Link href="/tools/pdf-compress" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Compress PDF (Reduce MB)</Link>
                      <Link href="/tools/pdf-to-word" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">PDF to Word / Excel</Link>
                      <Link href="/tools/pdf-protect" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Protect & Unlock PDF</Link>
                      <Link href="/tools/pdf-watermark" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Rotate & Watermark</Link>
                    </div>

                    {/* Image Suite */}
                    <div className="space-y-1.5 border-l border-slate-200 dark:border-white/[0.08] pl-5">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 px-1 mb-2 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Image Suite (30 Tools)</span>
                      </div>
                      <Link href="/tools/image-remove-bg" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Remove Background (AI)</Link>
                      <Link href="/tools/image-convert" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Convert to WebP / PNG</Link>
                      <Link href="/tools/image-compress" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Compress JPG / PNG</Link>
                      <Link href="/tools/image-crop" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Crop & Resize Canvas</Link>
                      <Link href="/tools/image-to-svg" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">SVG Vector Converter</Link>
                      <Link href="/tools/image-upscale" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Upscale Image Resolution</Link>
                    </div>

                    {/* Video Suite */}
                    <div className="space-y-1.5 border-l border-slate-200 dark:border-white/[0.08] pl-5">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-600 dark:text-purple-400 px-1 mb-2 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        <span>Video Suite (25 Tools)</span>
                      </div>
                      <Link href="/tools/video-trim" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Video Cutter & Trimmer</Link>
                      <Link href="/tools/video-to-mp3" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Extract Audio to MP3</Link>
                      <Link href="/tools/video-compress" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Compress Video File</Link>
                      <Link href="/tools/video-speed" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Speed Controller (0.5x - 2x)</Link>
                      <Link href="/tools/video-to-gif" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Convert Video to GIF</Link>
                      <Link href="/tools/video-mute" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Mute & Reverse Video</Link>
                    </div>

                    {/* Converters Suite */}
                    <div className="space-y-1.5 border-l border-slate-200 dark:border-white/[0.08] pl-5">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-sky-600 dark:text-sky-400 px-1 mb-2 flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Converters & More</span>
                      </div>
                      <Link href="/tools/convert-document" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Document Format Converter</Link>
                      <Link href="/tools/convert-audio" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Audio Format Converter</Link>
                      <Link href="/tools/extract-archive" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Archive (ZIP/RAR) Extractor</Link>
                      <Link href="/tools/generate-qr" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">QR Code Generator</Link>
                      <Link href="/tools/subtitles" onClick={() => setActiveDropdown(null)} className="block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">Subtitle / Caption Tool</Link>
                    </div>
                  </div>

                  {/* Bottom Directory Link */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Over 100 browser-based multimedia tools available for free.</span>
                    <Link
                      href="/tools"
                      onClick={() => setActiveDropdown(null)}
                      className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Browse Complete 100+ Creative Directory with Live Search →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* My Library: ONLY SHOW TO LOGGED-IN USERS! */}
            {user && (
              <Link
                href="/tools/library"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer flex items-center gap-1"
              >
                <span>My Library</span>
              </Link>
            )}

            <Link
              href="/pricing"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              Pricing
            </Link>
          </nav>

          {/* Right Action: Theme Switcher & Single Clean Auth Button */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-600/15 border border-violet-500/30 text-violet-600 dark:text-violet-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-violet-500 text-violet-500" />
                  Free Quota
                </span>

                <div className="flex items-center gap-2.5 pl-1">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.email ? user.email[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[120px] font-medium">
                    {user.email?.split("@")[0]}
                  </span>
                </div>

                {isUserAdmin && (
                  <Link
                    href="/admin"
                    title="Admin Operations Console"
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-full transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {!user && (
              <Link
                href="/login"
                className="text-xs font-bold bg-violet-600 text-white px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer"
              >
                Sign In
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] focus:outline-none transition-colors cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#0e0e12] border-b border-slate-200 dark:border-white/[0.1] px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 px-2 pt-1">
            AI Studios
          </div>
          <div className="grid grid-cols-1 gap-1">
            <Link
              href="/tools/video-generator"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <Film className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span>AI Video Generator (Flow)</span>
            </Link>
            <Link
              href="/tools/image-generator"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>AI Image Generator (Nano Banana)</span>
            </Link>
            <Link
              href="/tools/video-editor"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Video Studio Editor</span>
            </Link>
          </div>

          <div className="border-t border-slate-200 dark:border-white/[0.08] my-2" />
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 px-2">
            Creative Utilities
          </div>
          <div className="grid grid-cols-1 gap-1">
            <Link
              href="/tools"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <Grid className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>All 100+ Utilities</span>
            </Link>
            {user && (
              <Link
                href="/tools/library"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span>My Generation Library</span>
              </Link>
            )}
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Pricing Plans</span>
            </Link>
          </div>

          {user && (
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">{user.email}</span>
                {isUserAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="px-2 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-bold"
                  >
                    Admin Console
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-600 dark:text-red-400 font-semibold px-3 py-1 rounded bg-red-500/10 border border-red-500/20 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
