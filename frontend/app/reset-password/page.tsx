"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { getBackendUrl, getSiteUrl } from "../../utils/runtime-urls";
import {
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  // Flow steps: "checking" | "google_notice" | "otp_step" | "ask_password" | "set_password" | "success"
  const [step, setStep] = useState<
    "checking" | "google_notice" | "otp_step" | "ask_password" | "set_password" | "success"
  >(emailParam ? "checking" : "otp_step");

  // OTP state
  const [otp, setOtp] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [otpTtl, setOtpTtl] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Simple Human Verification / Captcha for Resend / Brute-force protection
  const [captchaNum1, setCaptchaNum1] = useState(4);
  const [captchaNum2, setCaptchaNum2] = useState(7);
  const [captchaInput, setCaptchaInput] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Password state (only used in set_password step)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const supabase = createClient();

  const generateNewCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaInput("");
  };

  // 1. Initial Check on mount: Is this a Google OAuth account?
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      checkAccountType(emailParam);
    }
  }, [emailParam]);

  const checkAccountType = async (targetEmail: string) => {
    try {
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/check-account-type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.status === "google_only") {
        setStep("google_notice");
        return;
      }

      // If email/password account, go directly to OTP step
      setStep("otp_step");
    } catch {
      // In case check endpoint is slow, fallback to OTP step
      setStep("otp_step");
    }
  };

  // OTP Expiry Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp_step" && otpTtl > 0) {
      timer = setInterval(() => {
        setOtpTtl((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTtl]);

  // Resend Cooldown Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Google OAuth Login
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
        throw new Error(error.message);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to initiate Google sign in." });
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Verify OTP and Automatically Sign In User
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (otp.trim().length !== 6) {
      setMessage({ type: "error", text: "Please enter the complete 6-digit OTP code." });
      return;
    }

    if (attemptsLeft <= 0) {
      setMessage({
        type: "error",
        text: "This code has expired due to 3 failed attempts. Please request a new code below.",
      });
      return;
    }

    setLoading(true);

    try {
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/verify-forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorDetail = String(data.detail || "Failed to verify OTP code.");
        // Check if attempts are returned in error message
        const match = errorDetail.match(/(\d+)\s+attempt/i);
        if (match && match[1]) {
          const rem = parseInt(match[1], 10);
          setAttemptsLeft(rem);
        } else if (errorDetail.toLowerCase().includes("invalidated") || errorDetail.toLowerCase().includes("expired")) {
          setAttemptsLeft(0);
        }
        throw new Error(errorDetail);
      }

      // Save reset token for Step 3 if user wishes to set password
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }

      // Automatically log the user into Supabase session!
      if (data.token_hash) {
        try {
          await supabase.auth.verifyOtp({
            token_hash: data.token_hash,
            type: (data.verification_type as any) || "magiclink",
          });
        } catch (authErr) {
          console.warn("Supabase automatic session exchange:", authErr);
        }
      }

      // Move directly to Step 2: Account is Logged In, ask if they want to set password!
      setStep("ask_password");
      setMessage(null);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to verify code." });
    } finally {
      setLoading(false);
    }
  };

  // Re-request / Resend OTP with Captcha Check
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setMessage(null);

    // If captcha is active, verify captcha
    if (showCaptcha) {
      const expected = captchaNum1 + captchaNum2;
      if (parseInt(captchaInput.trim(), 10) !== expected) {
        setMessage({ type: "error", text: "Incorrect verification answer. Please try again." });
        generateNewCaptcha();
        return;
      }
    }

    setLoading(true);
    try {
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Failed to dispatch new OTP code.");
      }

      setOtp("");
      setAttemptsLeft(3);
      setOtpTtl(600);
      setResendCooldown(60);
      setShowCaptcha(false);
      setMessage({
        type: "success",
        text: `A fresh 6-digit verification code has been dispatched to ${email}.`,
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to resend code." });
      // Show captcha on error to stop rapid retry loops
      setShowCaptcha(true);
      generateNewCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Save New Password (Only if user opted "Yes")
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match. Please verify." });
      return;
    }

    setLoading(true);

    try {
      const backendUrl = await getBackendUrl();
      const resetRes = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });

      const resetData = await resetRes.json().catch(() => ({}));
      if (!resetRes.ok) {
        throw new Error(resetData.detail || "Failed to save password.");
      }

      // Also update active Supabase session password
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch {
        // Handled securely on backend
      }

      setStep("success");
      setMessage({
        type: "success",
        text: "Password updated successfully! Redirecting to your workspace...",
      });

      setTimeout(() => {
        router.push("/tools/video-generator");
      }, 1400);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#121215] p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl relative overflow-hidden">
        {/* Top Logo */}
        <div className="text-center mb-6">
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
        </div>

        {/* Global Notification Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs mb-5 flex items-start gap-2.5 transition-all ${
              message.type === "error"
                ? "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
            )}
            <span className="leading-relaxed font-medium">{message.text}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* CASE 0: Loading Account Check                        */}
        {/* ---------------------------------------------------- */}
        {step === "checking" && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Verifying account credentials...
            </p>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* CASE 1: Google OAuth-Only Account Detected           */}
        {/* ---------------------------------------------------- */}
        {step === "google_notice" && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
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
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Google Account Detected
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                The account for <span className="font-bold text-slate-900 dark:text-white">{email}</span> was created using Google Sign-In. You do not have an application password and do not need an OTP recovery code.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-3"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                )}
                <span>Continue with Google Sign-In</span>
              </button>

              <Link
                href="/"
                className="inline-block text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline pt-2 cursor-pointer"
              >
                ← Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* WINDOW 1: OTP Code Verification (NO PASSWORD FIELDS) */}
        {/* ---------------------------------------------------- */}
        {step === "otp_step" && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Verify 6-Digit OTP Code
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the verification code sent to your email to authenticate.
              </p>
            </div>

            {/* OTP Status & Expiry Bar */}
            <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-violet-500" />
                <span>Code Expiry:</span>
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                  {formatTimer(otpTtl)}
                </span>
              </div>

              {/* Attempts Left Badge */}
              <div
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  attemptsLeft === 3
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                    : attemptsLeft === 2
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : attemptsLeft === 1
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse"
                    : "bg-rose-500 text-white"
                }`}
              >
                {attemptsLeft > 0 ? `${attemptsLeft} Attempt${attemptsLeft > 1 ? "s" : ""} Left` : "Code Expired"}
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  6-Digit Recovery OTP Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={attemptsLeft <= 0}
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center tracking-[12px] font-mono text-2xl font-bold py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border-2 border-violet-500/60 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* Bot-Spam Protection / Captcha Challenge if Re-requesting or Locked */}
              {showCaptcha && (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                      Security Check
                    </span>
                    <button
                      type="button"
                      onClick={generateNewCaptcha}
                      className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Refresh
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    What is <span className="font-bold font-mono text-slate-900 dark:text-white">{captchaNum1} + {captchaNum2}</span>?
                  </p>
                  <input
                    type="number"
                    placeholder="Enter answer"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl bg-white dark:bg-[#121215] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || attemptsLeft <= 0 || otp.trim().length !== 6}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP & Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend OTP Bar */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Didn't get the code?
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend New Code"}
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              <Link
                href="/"
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* WINDOW 2: Login Success & Prompt to Set Password     */}
        {/* ---------------------------------------------------- */}
        {step === "ask_password" && (
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Account Verified & Signed In! 🎉
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                You are now securely authenticated as <span className="font-bold text-slate-900 dark:text-white">{email}</span>.
              </p>
            </div>

            {/* Prompt Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-left space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                  Would you like to set a password?
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Setting a password allows you to sign in with your email and password next time without needing an OTP code.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("set_password")}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Yes, Set a Password</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/tools/video-generator")}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Skip & Continue to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* WINDOW 3: Set Password Form (Only shown if Yes)      */}
        {/* ---------------------------------------------------- */}
        {step === "set_password" && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-600 dark:text-violet-400 mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Set Your Password
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a strong password with at least 6 characters.
              </p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Password & Continue</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/tools/video-generator")}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  Skip setting password for now →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUCCESS STATE                                        */}
        {/* ---------------------------------------------------- */}
        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Password Saved!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Redirecting to your workspace...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
