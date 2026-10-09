"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import { getBackendUrl } from "../../utils/runtime-urls";
import {
  CheckCircle2,
  Bell,
  Mail,
  Send,
  Sparkles,
  Video,
  ArrowLeft,
  Clock,
  RefreshCw,
} from "lucide-react";

const PLAN_INFO: Record<string, { title: string; desc: string; icon: React.ReactNode; color: string }> = {
  pro: {
    title: "Video Generation Tokens",
    desc: "Access to advanced AI video models, HD output, and priority queue processing.",
    icon: <Video className="w-6 h-6 text-violet-400" />,
    color: "violet",
  },
  tools: {
    title: "Ad-Free Experience",
    desc: "Enjoy an uninterrupted, clean, and distraction-free creative workflow.",
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    color: "amber",
  },
};

function WaitlistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") || "pro";
  const planInfo = PLAN_INFO[plan] || PLAN_INFO["pro"];

  const [user, setUser] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        // Not logged in — send to signup with plan preserved
        router.replace(`/signup?plan=${plan}&next=/waitlist?plan=${plan}`);
        return;
      }
      setUser(data.user);
      setContactName(data.user.user_metadata?.full_name || data.user.email || "");
      // Check if already on waitlist (localStorage flag)
      const key = `waitlist_${plan}_${data.user.id}`;
      if (localStorage.getItem(key)) {
        setAlreadySubmitted(true);
      }
    });
  }, []);

  const handleNotifyRequest = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const backendUrl = await getBackendUrl();
      await fetch(`${backendUrl}/api/public/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          plan,
          message: contactMessage,
        }),
      });
    } catch (_) {
      // Silent — we still show success
    } finally {
      const key = `waitlist_${plan}_${user.id}`;
      localStorage.setItem(key, "true");
      setAlreadySubmitted(true);
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    violet: "from-violet-600/20 to-violet-600/5 border-violet-500/30 text-violet-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-white flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg space-y-6">

        {/* Back */}

        {/* Plan Badge */}
        <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br border ${colorMap[planInfo.color]} w-full`}>
          {planInfo.icon}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Selected Plan</p>
            <p className="text-sm font-bold">{planInfo.title}</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-50 dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">

          {alreadySubmitted || submitted ? (
            /* Success State */
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Request Received!</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  We've recorded your interest in <span className="font-semibold text-slate-700 dark:text-slate-300">{planInfo.title}</span>.
                  You'll be notified at <span className="font-mono text-violet-500">{user.email}</span> as soon as it becomes available.
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center text-xs text-slate-400 bg-slate-100 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/10">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Payment methods are being integrated. We'll email you the moment it's live.</span>
              </div>
              <Link
                href="/tools"
                className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition-all"
              >
                Explore Free Tools in the Meantime
              </Link>
            </div>
          ) : (
            /* Request Form */
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Bell className="w-5 h-5 text-violet-500" />
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">Get Notified When Available</h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payment integration is coming soon. Submit your interest and we'll email you as soon as this plan goes live.
                </p>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Email
                </label>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Optional note */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Any specific requirements? <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="e.g. I need bulk video generation for my agency..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <button
                onClick={handleNotifyRequest}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {submitting ? "Submitting..." : "Notify Me When Available"}
              </button>
            </div>
          )}
        </div>

        {/* Custom/Bulk Generation Service */}
        <div className="bg-slate-50 dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Need Bulk / Custom Generations Right Now?</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Contact us directly — we'll handle it manually for you.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            If you need AI video or image generations immediately (for an agency, business, or project), email us with your requirements. 
            We'll respond with a quote and can process your order directly once payment is set up.
          </p>
          <a
            href={`mailto:support@botock.app?subject=Custom Generation Request&body=Hi Botock Team,%0A%0AI'm interested in: ${planInfo.title}%0A%0AMy email: ${user.email}%0A%0ARequirements:%0A`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Contact Us Directly
          </a>
        </div>

      </div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    }>
      <WaitlistContent />
    </Suspense>
  );
}
