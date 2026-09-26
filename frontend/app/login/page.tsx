"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { getSiteUrl } from "../../utils/runtime-urls";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";


function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setMessage({ type: "error", text: decodeURIComponent(errorParam) });
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const origin = getSiteUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/tools/video-generator`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        let errorText = error.message;
        if (error.message?.includes("provider is not enabled") || error.message?.includes("Unsupported provider")) {
          errorText = "Google Login Supabase dashboard mein abhi enable nahi hai. Baraye meherbani Supabase Dashboard > Authentication > Providers > Google ko toggle ON karein aur Google Client ID / Secret dalein.";
        }
        setMessage({
          type: "error",
          text: errorText,
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to connect to Google sign in." });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        setTimeout(() => {
          window.location.href = `${getSiteUrl()}/tools/video-generator`;
        }, 400);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Authentication failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#121215] p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Botock Logo"
                width={40}
                height={40}
                style={{ width: "auto", height: "auto" }}
                className="object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Botock
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your credentials to access your creative workspace.
          </p>
        </div>

        {/* 1-Click Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer mb-5 shadow-sm"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            or with email
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2 ${
              message.type === "error"
                ? "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In with Email →"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

