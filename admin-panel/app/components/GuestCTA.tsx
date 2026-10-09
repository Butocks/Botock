"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X, Wand2, Zap, LayoutTemplate } from "lucide-react";

interface GuestCTAProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestCTA({ isOpen, onClose }: GuestCTAProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors z-10"
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
            Join thousands of creators making stunning AI videos and images in seconds.
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
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
          >
            Sign up / Log in to Continue
          </Link>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            It takes less than 10 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
