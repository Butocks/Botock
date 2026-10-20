"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Wand2, Zap, LayoutTemplate } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { getSiteUrl } from "../../utils/runtime-urls";

interface GuestCTAProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestCTA({ isOpen, onClose }: GuestCTAProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const origin = getSiteUrl();
      const currentNext = pathname || "/";
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(currentNext)}`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
    } catch (err) {
      console.error("Google sign in error in GuestCTA:", err);
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Hero Header */}
        <div className="relative pt-12 pb-8 px-6 text-center bg-gradient-to-br from-violet-600/10 via-amber-500/10 to-emerald-500/10">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
          
          <div className="relative mx-auto w-16 h-16 bg-gradient-to-tr from-violet-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6 rotate-3">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Unlock AI Magic ✨
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Create stunning AI videos, images, and edit multimedia in seconds.
          </p>
        </div>

        {/* Features List */}
        <div className="px-8 py-6 space-y-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Claim 5 Free Generations Daily
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Priority GPU Processing
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Access to 50+ Premium Tools
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-6 pb-8 space-y-3 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1a1a22] hover:bg-slate-50 dark:hover:bg-[#22222c] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            Instant 1-click access with your Google account.
          </p>
        </div>
      </div>
    </div>
  );
}
