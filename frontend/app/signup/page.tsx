"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../utils/supabase/client";
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
} from "lucide-react";

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
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "male",
    country: "Pakistan",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const supabase = createClient();

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
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
      setMessage({ type: "error", text: err.message || "Google sign up error." });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
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
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/tools/video-generator`,
          data: {
            full_name: formData.name,
            dob: formData.dob,
            gender: formData.gender,
            country: formData.country,
          },
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage({ type: "error", text: "An account with this email already exists. Please sign in." });
      } else {
        setMessage({
          type: "success",
          text: "Registration successful! Welcome to Botock. Redirecting to creative tools...",
        });
        setTimeout(() => {
          window.location.href = "/tools/video-generator";
        }, 1000);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Registration failed." });
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
                className="object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Botock
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join thousands of creators using in-browser AI and multimedia tools.
          </p>
        </div>

        {/* 1-Click Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer mb-6 shadow-sm"
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
          <span>Sign Up with Google</span>
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            or fill registration details
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-5 flex items-start gap-2.5 ${
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

        {/* Detailed Registration Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Country / Region
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
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
            {loading ? "Creating Account..." : "Create Free Account →"}
          </button>
        </form>

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
