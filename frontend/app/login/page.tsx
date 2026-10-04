"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { getSiteUrl } from "../../utils/runtime-urls";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import GoogleAuthButton from "../../components/GoogleAuthButton";


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
      // 1. Check if user is already locked
      const { data: lockStatus } = await supabase.rpc('check_login_status', { p_email: email });
      if (lockStatus && lockStatus.status === 'locked') {
        const lockTime = new Date(lockStatus.lock_until);
        setMessage({ type: "error", text: `Your account is temporarily locked due to multiple failed login attempts. Please try again after ${lockTime.toLocaleTimeString()}.` });
        setLoading(false);
        return;
      }

      // 2. Try login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 3. Record failed attempt
        const { data: failStatus } = await supabase.rpc('record_failed_login', { p_email: email });
        
        let errorMsg = error.message;
        if (failStatus) {
          if (failStatus.status === 'warn') {
            errorMsg += ` (Attempt ${failStatus.failed_attempts}. After 3 failed attempts, your account will be locked.)`;
          } else if (failStatus.status === 'locked_15m') {
            errorMsg = "Account locked for 15 minutes due to 3 failed attempts.";
          } else if (failStatus.status === 'locked_24h') {
            errorMsg = "Account locked for 24 hours due to 6 failed attempts.";
          }
        }
        setMessage({ type: "error", text: errorMsg });
      } else {
        // Clear login attempts on success
        await supabase.rpc('clear_login_attempts', { p_email: email });
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

        {/* Native Google One-Tap / Identity Services Button */}
        <div className="mb-5 flex justify-center">
          <GoogleAuthButton
            text="continue_with"
            onError={(err) => setMessage({ type: "error", text: err })}
          />
        </div>

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>
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

