"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { getBackendUrl } from "../../utils/runtime-urls";
import {
  User as UserIcon,
  Mail,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Activity,
  Users,
  Image as ImageIcon,
  KeyRound,
  MessageSquare,
  Trash2,
  AlertTriangle
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // In-line Email Verification Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Admin Panel State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminUnlockStep, setAdminUnlockStep] = useState<"passkey" | "otp">("passkey");
  const [adminUnlockPasskey, setAdminUnlockPasskey] = useState("");
  const [adminOtpCode, setAdminOtpCode] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminVerifiedToken, setAdminVerifiedToken] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);



  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) {
        router.push("/");
        return;
      }
      const u = data.user;
      setUser(u);
      
      const userEmail = u.email?.toLowerCase() || "";
      setEmail(userEmail);
      
      // Auto-assign full name from metadata or derive friendly formatted name from email prefix
      const meta = u.user_metadata || {};
      let resolvedName = meta.full_name || meta.name || "";
      if (!resolvedName && userEmail) {
        const prefix = userEmail.split("@")[0].replace(/[._-]+/g, " ").trim();
        resolvedName = prefix.replace(/\b\w/g, (c: string) => c.toUpperCase());
      }
      setFullName(resolvedName);

      setIsVerified(Boolean(u.app_metadata?.is_verified ?? (u.email_confirmed_at != null || u.app_metadata?.provider === "google")));
      
      // Professional Admin Role Check (Rely strictly on server-set app_metadata)
      const userRole = u.app_metadata?.role;
      if (userRole === "admin") {
        setIsAdmin(true);
      } else {
        try {
          const backendUrl = await getBackendUrl();
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) {
            const checkRes = await fetch(`${backendUrl}/api/admin/auth/check-status`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.is_admin) setIsAdmin(true);
            }
          }
        } catch {
          // ignore
        }
      }

      setLoading(false);


    });
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Please enter your name.", "error");
      return;
    }

    setSaving(true);
    try {
      const backendUrl = await getBackendUrl();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // 1. Update profile in backend
      const res = await fetch(`${backendUrl}/api/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
        }),
      });

      const backendData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(backendData.detail || "Failed to update profile details.");
      }

      // 2. Sync to Supabase client auth user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          name: fullName.trim(),
        },
      });
      if (error) throw error;

      setUser(data.user);
      showToast("Profile details updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.trim() !== "DELETE") {
      showToast("Please type DELETE to confirm account deletion.", "error");
      return;
    }

    setDeletingAccount(true);
    try {
      const backendUrl = await getBackendUrl();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(`${backendUrl}/api/auth/delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Failed to delete account.");
      }

      await supabase.auth.signOut();
      showToast("Your account has been permanently deleted.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err: any) {
      showToast(err.message || "Failed to delete account.", "error");
      setDeletingAccount(false);
    }
  };

  const handleSendVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch(`${await getBackendUrl()}/api/auth/send-profile-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to send verification code.");

      setOtpSent(true);
      showToast(`Verification code sent to ${email}`);
    } catch (err: any) {
      showToast(err.message || "Failed to send verification code.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleConfirmVerifyOtp = async () => {
    if (verifyOtp.trim().length !== 6) {
      showToast("Please enter the complete 6-digit code.", "error");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(`${await getBackendUrl()}/api/auth/verify-profile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: verifyOtp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Invalid or expired verification code.");

      // Update Supabase metadata
      await supabase.auth.updateUser({
        data: { is_verified: true },
      });

      setIsVerified(true);
      setShowVerifyModal(false);
      setVerifyOtp("");
      showToast("Congratulations! Your account is now fully Verified.");
    } catch (err: any) {
      showToast(err.message || "Verification failed.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090c]">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-slate-50 dark:bg-[#09090c] py-12 px-4 sm:px-6 lg:px-8 transition-colors select-none">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border flex items-center gap-3 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all ${
            toast.type === "error"
              ? "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-200"
              : "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-200"
          }`}
        >
          {toast.type === "error" ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Verify Email Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#121217] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Verify Your Email</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                We will dispatch a 6-digit verification code to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>.
              </p>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleSendVerifyOtp}
                  disabled={otpLoading}
                  className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {otpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>{otpLoading ? "Sending Code..." : "Send Verification Code"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={verifyOtp}
                    onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-[10px] font-mono text-xl py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-violet-500/50 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmVerifyOtp}
                  disabled={otpLoading}
                  className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {otpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{otpLoading ? "Verifying..." : "Confirm & Verify Account"}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleSendVerifyOtp}
                    disabled={otpLoading}
                    className="text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerifyModal(false);
                      setOtpSent(false);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#121217] rounded-3xl border border-red-500/30 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete Account Permanently</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will permanently delete your account, saved preferences, generated media, and all allocated credits. This action is immediate and <strong>irreversible</strong>.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 text-center">
                  To confirm, type <span className="text-red-600 font-mono font-black">DELETE</span> below:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full text-center tracking-[4px] font-mono font-bold text-base py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-red-500/40 text-red-600 dark:text-red-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmationInput("");
                  }}
                  disabled={deletingAccount}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationInput.trim() !== "DELETE" || deletingAccount}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deletingAccount ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{deletingAccount ? "Deleting..." : "Permanently Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-violet-600/20">
              {fullName ? fullName[0].toUpperCase() : email ? email[0].toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {fullName || "User Profile"}
                </h1>
                {/* Verification Status Badge */}
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Unverified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {email}
              </p>
            </div>
          </div>

          {!isVerified && (
            <button
              type="button"
              onClick={() => {
                setShowVerifyModal(true);
                handleSendVerifyOtp();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verify Email Now</span>
            </button>
          )}
        </div>

        {/* Unverified Warning Banner if applicable */}
        {!isVerified && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                Your account is currently <strong>Unverified</strong>. Verify your email address to establish verified trust and protect your account.
              </span>
            </div>
            <button
              onClick={() => {
                setShowVerifyModal(true);
                handleSendVerifyOtp();
              }}
              className="underline font-bold text-amber-700 dark:text-amber-300 hover:opacity-80 shrink-0 cursor-pointer"
            >
              Verify Code &rarr;
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Account Information Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-violet-500" />
                <span>Account Information</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your personal name and details on Botock
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Full Name <span className="text-[10px] text-slate-400 font-normal">(Editable)</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Email Address (Primary)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || !fullName.trim()}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Danger Zone Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-500/[0.02] dark:bg-red-500/[0.03] border border-red-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Permanently delete your Botock account, creative generation history, and credit balance. Once deleted, your account cannot be recovered.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmationInput("");
              setShowDeleteModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

    </div>
  );
}
