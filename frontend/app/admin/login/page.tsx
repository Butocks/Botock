"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBackendUrl } from "../../../utils/runtime-urls";
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  Clock,
  RefreshCw,
  Terminal,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp" | "locked">("credentials");

  // Step 1: Credentials
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // Step 2: OTP
  const [otp, setOtp] = useState("");
  const [otpTtl, setOtpTtl] = useState(600); // 10 minutes (600s)
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Locked out
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Feedback & Loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && otpTtl > 0) {
      timer = setInterval(() => {
        setOtpTtl((prev) => {
          if (prev <= 1) {
            setError("Verification code expired after 10 minutes. Please request a new code.");
            setStep("credentials");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTtl]);

  // Countdown timer for Lockout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "locked" && lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            setStep("credentials");
            setError("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, lockoutSeconds]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/auth/verify-secret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), secret: secret.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 423) {
          setStep("locked");
          setLockoutSeconds(24 * 3600);
          setError(data.detail || "Account restricted for 24 hours.");
          return;
        }
        throw new Error(data.detail || "Authentication failed. Check your admin email and secret code.");
      }

      setStep("otp");
      setOtpTtl(600);
      setAttemptsLeft(3);
      setSuccessMsg(data.message || "6-digit OTP code dispatched to your admin email.");
    } catch (err: any) {
      setError(err.message || "Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 423) {
          setStep("locked");
          setLockoutSeconds(24 * 3600);
          setError("Account restricted for 24 hours due to 3 failed OTP cycles.");
          return;
        }
        setAttemptsLeft((prev) => Math.max(0, prev - 1));
        throw new Error(data.detail || "Invalid verification code.");
      }

      // Store authenticated session token
      if (typeof window !== "undefined") {
        sessionStorage.setItem("botock_admin_token", data.admin_token);
        sessionStorage.setItem("botock_admin_email", email.trim().toLowerCase());
      }

      setSuccessMsg("Authorization verified. Redirecting to Command Center...");
      setTimeout(() => {
        router.push("/admin");
      }, 600);
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none transition-colors">
      {/* Background Cyber Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/10 dark:from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Terminal Frame */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f0f14]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/10 dark:from-indigo-600/20 to-purple-600/10 dark:to-purple-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
            <Terminal className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Botock Command Terminal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Restricted Interface • Administrative Authorization Required
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-600 dark:text-red-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-emerald-600 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <div className="leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Admin Email (.env Whitelist)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@botock.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Secret Authorization Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type={showSecret ? "text" : "password"}
                  required
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret code from .env"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Request Login OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 10-MINUTE OTP SCREEN */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Code Expiry Window:</span>
              </div>
              <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                {formatTimer(otpTtl)}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                  {attemptsLeft} attempt(s) remaining
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[12px] font-mono text-2xl py-3 bg-slate-50 dark:bg-black/60 border border-indigo-500/40 rounded-xl text-indigo-700 dark:text-indigo-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authorizing Session...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP & Access Console</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setOtp("");
                setError("");
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              ← Re-enter Credentials / Cancel
            </button>
          </form>
        )}

        {/* STEP 3: 24-HOUR SECURITY LOCKOUT SCREEN */}
        {step === "locked" && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-300">
              Access Restricted for 24 Hours
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed px-2">
              Maximum allowable OTP failure cycles exceeded. For cybersecurity defense, this admin interface is temporarily frozen.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-500/20 rounded-xl font-mono text-sm text-red-600 dark:text-red-400">
              Lockout Timer: {formatHours(lockoutSeconds)}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-900 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 transition-colors inline-flex items-center gap-1"
          >
            ← Return to Botock Public Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
