"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { getSiteUrl, getBackendUrl } from "../../utils/runtime-urls";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import GoogleAuthButton from "../../components/GoogleAuthButton";


function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
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
        // Check if this account is actually a Google account without a password
        try {
          const backendUrl = await getBackendUrl();
          const checkRes = await fetch(`${backendUrl}/api/auth/check-account-type`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase() }),
          });
          const checkData = await checkRes.json().catch(() => ({}));
          if (checkData.status === "google_only") {
            setMessage({
              type: "error",
              text: "This account was registered using Google Sign-In and has no application password. Please click 'Continue with Google' above to sign in.",
            });
            setLoading(false);
            return;
          }
        } catch {
          // Ignore network errors in check
        }

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
          const params = new URLSearchParams(window.location.search);
          const nextUrl = params.get("next") || "/";
          window.location.href = `${getSiteUrl()}${nextUrl === "/" ? "" : nextUrl}`;
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
            Sign In to Botock
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Sign in securely with your Google account. Quick access, no password or registration needed.
          </p>
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

        {/* Primary Direct Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#1a1a22] hover:bg-slate-50 dark:hover:bg-[#22222c] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group mb-3"
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

        {/* Native Google One-Tap / Identity Services Button */}
        <div className="flex justify-center">
          <GoogleAuthButton
            text="continue_with"
            onError={(err) => setMessage({ type: "error", text: err })}
          />
        </div>

        {/* Optional Collapsed Password Sign In for Existing Admins */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.08] text-center">
          <button
            type="button"
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            {showEmailForm ? "Hide email sign in" : "Sign in with password"}
          </button>

          {showEmailForm && (
            <form onSubmit={handleEmailAuth} className="space-y-3 mt-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    rel="nofollow"
                    className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Authenticating..." : "Sign In with Email →"}
              </button>
            </form>
          )}
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

