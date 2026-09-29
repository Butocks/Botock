"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../utils/supabase/client";
import { getSiteUrl, getBackendUrl } from "../../utils/runtime-urls";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const COUNTRIES = [
  "Pakistan",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "United Arab Emirates",
  "Saudi Arabia",
  "India",
  "Turkey",
  "France",
  "Singapore",
  "Malaysia",
  "Netherlands",
  "Brazil",
  "Spain",
  "Italy",
  "Japan",
  "South Korea",
  "Other",
];

export default function SignUpPage() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "male",
    country: "Pakistan",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpTtl, setOtpTtl] = useState(600);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const supabase = createClient();

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && otpTtl > 0) {
      timer = setInterval(() => {
        setOtpTtl((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTtl]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoogleSignUp = async () => {
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
          errorText = "Google Login Supabase dashboard mein abhi enable nahi hai. Baraye meherbani Supabase Dashboard > Authentication > Providers > Google ko toggle ON karein.";
        }
        setMessage({ type: "error", text: errorText });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Google sign up error." });
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Send OTP to User's Email
  const handleRequestSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match. Please verify." });
      return;
    }

    setLoading(true);

    try {
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Failed to dispatch verification code.");
      }

      setStep("otp");
      setOtpTtl(600);
      setMessage({
        type: "success",
        text: `6-digit verification code sent to ${formData.email}. Please verify below to activate your account.`,
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Registration verification failed." });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Activate Supabase Account
  const handleVerifyOtpAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (otp.trim().length !== 6) {
      setMessage({ type: "error", text: "Please enter the complete 6-digit verification code." });
      return;
    }

    setLoading(true);

    try {
      const backendUrl = await getBackendUrl();
      const verifyRes = await fetch(`${backendUrl}/api/auth/verify-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim(), otp: otp.trim() }),
      });

      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        throw new Error(verifyData.detail || "Invalid or expired verification code.");
      }

      // OTP Verified: Create user account in Supabase
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/tools/video-generator`,
          data: {
            full_name: formData.name,
            username: formData.email.split("@")[0],
            dob: formData.dob,
            gender: formData.gender,
            country: formData.country,
            is_verified: true,
            profile_completed: true,
          },
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage({ type: "error", text: "An account with this email already exists. Please sign in." });
      } else {
        // Sync verified status with backend
        try {
          await fetch(`${backendUrl}/api/auth/sync-user-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email.trim(), status: "verified" }),
          });
        } catch (_) {}

        setMessage({
          type: "success",
          text: "Registration & Email verification complete! Redirecting to creative suite...",
        });
        setTimeout(() => {
          window.location.href = `${getSiteUrl()}/tools/video-generator`;
        }, 1000);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Account creation failed." });
    } finally {
      setLoading(false);
    }
  };

  // FALLBACK: Skip OTP verification and register as Unverified
  const handleSkipVerification = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/tools/video-generator`,
          data: {
            full_name: formData.name,
            username: formData.email.split("@")[0],
            dob: formData.dob,
            gender: formData.gender,
            country: formData.country,
            is_verified: false,
            profile_completed: true,
          },
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage({ type: "error", text: "An account with this email already exists. Please sign in." });
      } else {
        // Sync unverified status with backend
        try {
          const token = data.session?.access_token;
          if (!token) throw new Error("No active session");
          await fetch(`${await getBackendUrl()}/api/auth/sync-user-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ email: formData.email.trim(), status: "unverified" }),
          });
        } catch (_) {}

        setMessage({
          type: "success",
          text: "Account registered as Unverified. You can verify anytime in Profile Settings. Redirecting...",
        });
        setTimeout(() => {
          window.location.href = `${getSiteUrl()}/tools/video-generator`;
        }, 1200);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to register account." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-xl bg-white dark:bg-[#121215] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-xl">
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
            {step === "form" ? "Create Your Account" : "Verify Your Email OTP"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === "form"
              ? "Join thousands of creators using in-browser AI and multimedia tools."
              : `Enter the 6-digit confirmation code dispatched to ${formData.email}`}
          </p>
        </div>

        {/* Native Google One-Tap / Identity Services Button */}
        {step === "form" && (
          <div className="mb-6 flex justify-center">
            <GoogleAuthButton
              text="signup_with"
              onError={(err) => setMessage({ type: "error", text: err })}
            />
          </div>
        )}

        {step === "form" && (
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200 dark:border-white/[0.08]" />
            <span className="flex-shrink mx-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Register with Email OTP
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-white/[0.08]" />
          </div>
        )}

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

        {/* STEP 1: FORM */}
        {step === "form" && (
          <form onSubmit={handleRequestSignupOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address (Google/Gmail User)
              </label>
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Verification OTP...</span>
                </>
              ) : (
                <>
                  <span>Verify Email & Create Account →</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtpAndCreateAccount} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-violet-500" />
                <span>Code Expiry:</span>
              </div>
              <div className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                {formatTimer(otpTtl)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                Enter 6-Digit Email Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[12px] font-mono text-2xl py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-violet-500/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-violet-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm OTP & Finish Registration</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleSkipVerification}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Skip Verification for now (Continue as Unverified)
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("form");
                setOtp("");
                setMessage(null);
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer pt-1"
            >
              ← Change Details / Re-enter Email
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
