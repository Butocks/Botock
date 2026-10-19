"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 1. Ensure unique guest ID cookie for daily usage limit tracking
    if (typeof document !== "undefined" && !document.cookie.includes("botock_guest_id=")) {
      const guestId = `gst_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
      document.cookie = `botock_guest_id=${guestId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }

    // 2. Check if user already gave consent
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("botock_cookie_consent");
      if (!consent) {
        // Small delay so page loads smoothly first
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const handleConsent = (level: "all" | "essential") => {
    try {
      localStorage.setItem("botock_cookie_consent", level);
      document.cookie = `botock_consent=${level}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900/95 dark:bg-[#121216]/95 backdrop-blur-md border border-slate-700/80 dark:border-slate-800 p-5 rounded-2xl shadow-2xl shadow-black/40 text-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cookie className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-white text-sm">Cookies & Privacy Preferences</h4>
        </div>
        <button
          onClick={() => handleConsent("essential")}
          className="text-slate-400 hover:text-white transition p-1"
          aria-label="Dismiss cookie notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed mb-4">
        We use essential cookies to manage your free daily tool quotas, maintain security, and optimize processing speed. We never sell your personal data. Read our{" "}
        <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={() => handleConsent("essential")}
          className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
        >
          Essential Only
        </button>
        <button
          onClick={() => handleConsent("all")}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Accept All</span>
        </button>
      </div>
    </div>
  );
}
