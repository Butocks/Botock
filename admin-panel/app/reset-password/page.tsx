"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { getBackendUrl } from "../../utils/runtime-urls";
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
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpTtl, setOtpTtl] = useState(600);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTtl > 0) {
      timer = setInterval(() => {
        setOtpTtl((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTtl]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (otp.trim().length !== 6) {
      setMessage({ type: "error", text: "Please enter the 6-digit OTP recovery code." });
      return;
    }

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
          email: email.trim(),
          otp: otp.trim(),
          new_password: newPassword,
        }),
      });

      const resetData = await resetRes.json().catch(() => ({}));
      if (!resetRes.ok) {
        throw new Error(resetData.detail || "Failed to update password. Please check your OTP code.");
      }

      // Also sync password with active Supabase session if present
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch {
        // Active session optional since backend already securely updated password in DB
      }

      setMessage({
        type: "success",
        text: "Password updated successfully! Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reset password." });
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
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter the 6-digit code received on your email to confirm identity.
          </p>
        </div>

        {/* Expiry Bar */}
        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-violet-500" />
            <span>OTP Code Expiry:</span>
          </div>
          <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{formatTimer(otpTtl)}</span>
        </div>

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

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              6-Digit Recovery OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full text-center tracking-[10px] font-mono text-xl py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-violet-500/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

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
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white"
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
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify OTP & Save Password</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/login"
            className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
