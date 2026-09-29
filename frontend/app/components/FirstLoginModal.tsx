"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { getBackendUrl } from "../../utils/runtime-urls";
import { Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";

const COUNTRIES = [
  "Pakistan", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "United Arab Emirates", "Saudi Arabia", "India", "Turkey",
  "France", "Singapore", "Malaysia", "Netherlands", "Brazil", "Spain", "Other"
];

interface FirstLoginModalProps {
  user: any;
  onCompleted?: () => void;
}

export default function FirstLoginModal({ user, onCompleted }: FirstLoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [country, setCountry] = useState("Pakistan");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const isGoogle =
      user.app_metadata?.provider === "google" ||
      user.identities?.some((i: any) => i.provider === "google");
    const isCompleted = Boolean(user.user_metadata?.profile_completed);

    if (isGoogle && !isCompleted) {
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "");
      setUsername(user.email ? user.email.split("@")[0] : "");
      setIsOpen(true);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dob) {
      setError("Please select your date of birth.");
      return;
    }

    if (password.length < 6) {
      setError("Please set a password of at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName.trim(),
          username: username.trim() || user.email?.split("@")[0],
          dob: dob,
          gender: gender,
          country: country,
          is_verified: true,
          profile_completed: true,
        },
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Sync verified status with backend
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("No active session");
        await fetch(`${await getBackendUrl()}/api/auth/sync-user-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email: user.email, status: "verified" }),
        });
      } catch (_) {}

      setIsOpen(false);
      if (onCompleted) onCompleted();
    } catch (err: any) {
      setError(err.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#121217] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Complete Your Registration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome to Botock! Since you signed in via Google, please provide your profile info and set a website password for account security.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Set Website Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Saving Profile..." : "Complete Setup & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
