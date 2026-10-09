"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBackendUrl } from "../utils/runtime-urls";
import { Lock, KeyRound, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";
import Cookies from "js-cookie";

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"passkey" | "otp">("passkey");
  const [email, setEmail] = useState("");
  const [passkey, setPasskey] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${await getBackendUrl()}/api/admin/auth/verify-secret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), secret: passkey.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Invalid passkey or email.");
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to authorize admin passkey.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${await getBackendUrl()}/api/admin/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Invalid or expired OTP.");
      
      // Store token and device verification cookie
      localStorage.setItem("admin_token", data.admin_token);
      localStorage.setItem("admin_email", email.trim());
      Cookies.set("admin_device_verified", "true", { expires: 30 }); // Trust device for 30 days
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Admin OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {step === "passkey" ? <Lock className="w-8 h-8 text-amber-500" /> : <KeyRound className="w-8 h-8 text-amber-500" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
            <p className="text-sm text-slate-400 mt-2">
              {step === "passkey" ? "Enter your master credentials to access the Botock Admin Panel." : "Enter the 6-digit verification code sent to your email."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {step === "passkey" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@botock.app"
                className="w-full px-4 py-3 rounded-xl bg-[#111116] border border-slate-800 text-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Master Passkey</label>
              <input
                type="password"
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter your master passkey"
                className="w-full px-4 py-3 rounded-xl bg-[#111116] border border-slate-800 text-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              <span>Verify & Continue</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-xl bg-[#111116] border border-slate-800 text-white font-mono text-center tracking-[0.5em] text-xl outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              <span>Unlock Admin Panel</span>
            </button>
            <button
              type="button"
              onClick={() => setStep("passkey")}
              className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-white transition-colors"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
