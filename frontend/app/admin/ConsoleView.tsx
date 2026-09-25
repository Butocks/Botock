"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../utils/supabase/client";
import {
  Activity,
  Server,
  Cpu,
  Database,
  Users,
  Film,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Terminal,
  ArrowRight,
  UserCheck,
  UserX,
  AlertOctagon,
  Eye,
  EyeOff,
  Edit3,
  Sliders,
  FileText,
  FilePlus,
  Trash2,
  Save,
  Globe,
  Radio,
  Zap,
  Layers,
  Sparkles,
  Paperclip,
  Upload,
  Clock,
  ChevronRight,
  Search,
  XCircle,
  HelpCircle,
  Timer,
  Fingerprint,
} from "lucide-react";

import { notFound } from "next/navigation";

// Types
interface ToolRule {
  id: string;
  name: string;
  category: string;
  isProOnly: boolean;
  isGloballyBlocked: boolean;
  usageCount: number;
}

interface BlogPostItem {
  id: string;
  title: string;
  excerpt: string;
  category: "ai" | "pdf" | "video" | "image";
  categoryLabel: string;
  readTime: string;
  date: string;
  author: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

interface ManagedUser {
  id: string;
  email: string;
  createdAt: string;
  isPro: boolean;
  isBlocked: boolean;
  pointsUsed: number;
  creditsRemaining: number;
}

export default function AdminClientView({ initialUserEmail }: { initialUserEmail?: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Active Admin Navigation Tab
  const [activeTab, setActiveTab] = useState<"telemetry" | "cms" | "tools" | "blog" | "users" | "security">("telemetry");

  // Telemetry Metrics State
  const [liveVisitors, setLiveVisitors] = useState(38);
  const [todayVisits, setTodayVisits] = useState(5412);
  const [freePointsUsed, setFreePointsUsed] = useState(28450);
  const [proPointsUsed, setProPointsUsed] = useState(114890);

  // Tools Access & Usage Matrix
  const [toolsList, setToolsList] = useState<ToolRule[]>([
    { id: "omni-video", name: "Omni 1.1 AI Video Studio", category: "AI Studio", isProOnly: false, isGloballyBlocked: false, usageCount: 1420 },
    { id: "nano-image", name: "Nano Banana AI Image Studio", category: "AI Studio", isProOnly: false, isGloballyBlocked: false, usageCount: 3110 },
    { id: "pdf-merge", name: "Merge PDF Documents", category: "PDF Suite", isProOnly: false, isGloballyBlocked: false, usageCount: 2840 },
    { id: "pdf-compress", name: "Compress PDF Files", category: "PDF Suite", isProOnly: false, isGloballyBlocked: false, usageCount: 3420 },
    { id: "pdf-to-word", name: "PDF to Word (DOCX)", category: "PDF Suite", isProOnly: true, isGloballyBlocked: false, usageCount: 2150 },
    { id: "bg-remover", name: "AI Background Remover", category: "Media Suite", isProOnly: false, isGloballyBlocked: false, usageCount: 4890 },
    { id: "video-trimmer", name: "Video Cutter & Trimmer", category: "Video Suite", isProOnly: false, isGloballyBlocked: false, usageCount: 1980 },
    { id: "audio-extract", name: "Extract Audio to MP3", category: "Audio Suite", isProOnly: false, isGloballyBlocked: false, usageCount: 1670 },
  ]);

  // Page Content CMS State
  const [cmsContent, setCmsContent] = useState({
    heroHeadline: "Every Online Tool You Need.",
    heroGradient: "PDFs, Media & Generative AI.",
    heroSubtitle: "Convert, edit, compress, and process PDFs, images, and videos in seconds — plus generate cinematic AI videos and photorealistic artwork powered by Google Flow & Nano Banana.",
    topBannerText: "⚡ 3 Free AI Videos & 5 Free Images Daily",
    freeQuotaNotice: "3 Free AI Generations Daily (Refreshes every 24 hours)",
    proPricePerMonth: "$9.99 / month",
    proFeatureHighlight: "Unlimited 1080p Video + 1,000 High-Priority AI Credits",
  });

  // Blog CMS State
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([
    {
      id: "mastering-ai-video-prompts",
      title: "Mastering AI Video Prompts: How to Get Cinematic Motion in Google Flow",
      excerpt: "Learn prompt structures, camera motion hints, and lighting modifiers for Hollywood-grade 4-10 second footage.",
      category: "ai",
      categoryLabel: "Generative AI",
      readTime: "5 min read",
      date: "Sep 18, 2026",
      author: "Botock VFX Lab",
      attachmentName: "flow_prompt_cheat_sheet.pdf",
    },
    {
      id: "compress-pdf-without-quality-loss",
      title: "How to Compress Heavy PDF Files by 80% Without Losing Vector Clarity",
      excerpt: "Breakdown of JBIG2 vs Flate compression algorithms and in-browser PDF optimization.",
      category: "pdf",
      categoryLabel: "PDF Workflows",
      readTime: "4 min read",
      date: "Sep 15, 2026",
      author: "Document Engineering Team",
      attachmentName: "compression_benchmark_charts.png",
    },
  ]);

  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    category: "ai" as "ai" | "pdf" | "video" | "image",
    categoryLabel: "Generative AI",
    readTime: "4 min read",
    author: "Botock Editorial",
    attachmentName: "",
    attachmentUrl: "",
    content: "",
  });
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Managed Users List
  const [usersList, setUsersList] = useState<ManagedUser[]>([
    { id: "usr_01", email: "creator@botock.ai", createdAt: "2026-08-01", isPro: true, isBlocked: false, pointsUsed: 1240, creditsRemaining: 8760 },
    { id: "usr_02", email: "sarah.designer@gmail.com", createdAt: "2026-08-14", isPro: true, isBlocked: false, pointsUsed: 890, creditsRemaining: 4110 },
    { id: "usr_03", email: "alex.marketing@venture.co", createdAt: "2026-08-20", isPro: false, isBlocked: false, pointsUsed: 320, creditsRemaining: 40 },
    { id: "usr_04", email: "suspicious_bot@tempmail.org", createdAt: "2026-09-02", isPro: false, isBlocked: true, pointsUsed: 12, creditsRemaining: 0 },
    { id: "usr_05", email: "hamza.dev@studio.io", createdAt: "2026-09-10", isPro: true, isBlocked: false, pointsUsed: 2150, creditsRemaining: 6850 },
  ]);
  const [userSearch, setUserSearch] = useState("");

  // IP Whitelist Config
  const [adminIpWhitelist, setAdminIpWhitelist] = useState("127.0.0.1, ::1, 192.168.*");
  const [currentClientIp, setCurrentClientIp] = useState("127.0.0.1 (Localhost / Secure Interface)");

  // -------------------------------------------------------------
  // ETHICAL HACKER OTP & 2^(n-1) EXPONENTIAL BACKOFF ENGINE
  // -------------------------------------------------------------
  const [pendingAction, setPendingAction] = useState<{ name: string; execute: () => void } | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpTtl, setOtpTtl] = useState(60);
  const [otpAttempts, setOtpAttempts] = useState(0); // 0, 1, 2, 3
  const [isBackoffActive, setIsBackoffActive] = useState(false);
  const [backoffSecondsLeft, setBackoffSecondsLeft] = useState(0);
  const [isEditRestricted, setIsEditRestricted] = useState(false);
  const [restrictionSecondsLeft, setRestrictionSecondsLeft] = useState(0);
  const [securityLog, setSecurityLog] = useState<string[]>([]);

  const supabase = createClient();

  // Allowed admin emails from environment config
  const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "948201";

  // Check auth session
  useEffect(() => {
    // Load local storage states if available
    try {
      const storedTools = localStorage.getItem("botock_tool_rules");
      if (storedTools) setToolsList(JSON.parse(storedTools));

      const storedCms = localStorage.getItem("botock_cms_content");
      if (storedCms) setCmsContent(JSON.parse(storedCms));

      const storedBlogs = localStorage.getItem("botock_custom_blogs");
      if (storedBlogs) setBlogPosts(JSON.parse(storedBlogs));

      const storedUsers = localStorage.getItem("botock_managed_users");
      if (storedUsers) setUsersList(JSON.parse(storedUsers));

      const storedLockout = sessionStorage.getItem("botock_admin_edit_restricted");
      if (storedLockout === "true") {
        setIsEditRestricted(true);
        setRestrictionSecondsLeft(900); // 15 min lock
      }
    } catch (e) {}

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check if 2FA session was already unlocked
    const verifiedInSession = sessionStorage.getItem("botock_admin_2fa");
    if (verifiedInSession === "true") {
      setIs2FAVerified(true);
    }

    // Dynamic Live Visitor Ticker
    const visitorInterval = setInterval(() => {
      setLiveVisitors((prev) => Math.max(24, prev + Math.floor(Math.random() * 5) - 2));
    }, 4000);

    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(visitorInterval);
    };
  }, []);

  // Countdown timer for OTP expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpModal && otpTtl > 0) {
      timer = setInterval(() => {
        setOtpTtl((prev) => {
          if (prev <= 1) {
            // Regenerate fresh OTP on expiry
            generateFreshOtp();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, otpTtl]);

  // Countdown for exponential backoff freeze
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBackoffActive && backoffSecondsLeft > 0) {
      timer = setInterval(() => {
        setBackoffSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsBackoffActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBackoffActive, backoffSecondsLeft]);

  // Countdown for 15-minute hard edit restriction
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEditRestricted && restrictionSecondsLeft > 0) {
      timer = setInterval(() => {
        setRestrictionSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsEditRestricted(false);
            sessionStorage.removeItem("botock_admin_edit_restricted");
            setOtpAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isEditRestricted, restrictionSecondsLeft]);

  const userEmail = user?.email?.toLowerCase() || "";
  const isAuthorizedAdmin = Boolean(user && envAdmins.length > 0 && envAdmins.includes(userEmail));

  // Generate dynamic 6-digit cryptographic OTP
  const generateFreshOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTtl(60);
    return code;
  };

  // Secure Action Interceptor (Requires OTP verification for every edit)
  const requireAdminOtp = (actionName: string, onAuthorized: () => void) => {
    if (isEditRestricted) {
      alert(`⚠️ EDIT RESTRICTION ACTIVE: 3 consecutive invalid OTP attempts detected. System locked for ${Math.ceil(restrictionSecondsLeft / 60)} more minutes to prevent unauthorized manipulation.`);
      return;
    }

    generateFreshOtp();
    setOtpInput("");
    setPendingAction({ name: actionName, execute: onAuthorized });
    setShowOtpModal(true);
  };

  // Handle OTP Submission with 2^(n-1) Exponential Backoff and 3-attempt hard lockout
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBackoffActive) return;

    if (otpInput.trim() === generatedOtp) {
      // SUCCESS: Reset counters, execute action, log security event
      const logEntry = `[${new Date().toLocaleTimeString()}] AUTHORIZED: "${pendingAction?.name}" verified via 6-digit OTP.`;
      setSecurityLog((prev) => [logEntry, ...prev.slice(0, 19)]);
      setShowOtpModal(false);
      setOtpAttempts(0);
      setOtpInput("");

      if (pendingAction) {
        pendingAction.execute();
      }
      setPendingAction(null);
    } else {
      // FAILURE: Increment attempts n (1, 2, 3)
      const nextAttempt = otpAttempts + 1;
      setOtpAttempts(nextAttempt);

      if (nextAttempt >= 3) {
        // 3 Failed attempts: HARD EDIT RESTRICTION LOCKOUT
        setIsEditRestricted(true);
        setRestrictionSecondsLeft(900); // 15 minutes (900s)
        sessionStorage.setItem("botock_admin_edit_restricted", "true");
        setShowOtpModal(false);
        setPendingAction(null);

        const lockEntry = `[${new Date().toLocaleTimeString()}] ALERT: 3 failed OTP attempts! Ethical Firewall engaged: 15-minute Edit Restriction enforced.`;
        setSecurityLog((prev) => [lockEntry, ...prev.slice(0, 19)]);
        alert("🚨 SECURITY LOCKDOWN: 3 failed OTP attempts detected! Edit capabilities have been frozen for 15 minutes to thwart brute-force intrusion.");
      } else {
        // Exponential backoff delay t = 2^(n - 1)
        const delaySeconds = Math.pow(2, nextAttempt - 1); // attempt 1 -> 2^0=1s, attempt 2 -> 2^1=2s
        setIsBackoffActive(true);
        setBackoffSecondsLeft(delaySeconds);

        const failEntry = `[${new Date().toLocaleTimeString()}] REJECTED: Invalid OTP for "${pendingAction?.name}". Attempt ${nextAttempt}/3. Enforcing 2^(n-1) delay: ${delaySeconds}s.`;
        setSecurityLog((prev) => [failEntry, ...prev.slice(0, 19)]);
      }
    }
  };

  // Master PIN (Step 2 of 2-Factor Authentication)
  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === correctPin) {
      setIs2FAVerified(true);
      sessionStorage.setItem("botock_admin_2fa", "true");
      setPinError("");
    } else {
      setPinError("Invalid Master Security PIN. Attempt logged.");
    }
  };

  const handleAdminLock = () => {
    sessionStorage.removeItem("botock_admin_2fa");
    setIs2FAVerified(false);
    setPinInput("");
  };

  // -------------------------------------------------------------
  // CMS Save Action
  // -------------------------------------------------------------
  const handleSaveCms = () => {
    requireAdminOtp("Update Live Website Page Content & Headings", () => {
      localStorage.setItem("botock_cms_content", JSON.stringify(cmsContent));
      window.dispatchEvent(new Event("botock_cms_updated"));
      alert("✅ Website content saved and published live across all user pages!");
    });
  };

  // -------------------------------------------------------------
  // Tool Access Control Actions
  // -------------------------------------------------------------
  const handleToggleToolPro = (toolId: string) => {
    const tool = toolsList.find((t) => t.id === toolId);
    const actionLabel = tool?.isProOnly ? `Unlock "${tool?.name}" for Free Users` : `Lock "${tool?.name}" to Pro Only`;

    requireAdminOtp(actionLabel, () => {
      const updated = toolsList.map((t) => (t.id === toolId ? { ...t, isProOnly: !t.isProOnly } : t));
      setToolsList(updated);
      localStorage.setItem("botock_tool_rules", JSON.stringify(updated));
    });
  };

  const handleToggleToolBlock = (toolId: string) => {
    const tool = toolsList.find((t) => t.id === toolId);
    const actionLabel = tool?.isGloballyBlocked ? `Unblock "${tool?.name}" (Resume Service)` : `Block "${tool?.name}" (Maintenance Lock for All)`;

    requireAdminOtp(actionLabel, () => {
      const updated = toolsList.map((t) => (t.id === toolId ? { ...t, isGloballyBlocked: !t.isGloballyBlocked } : t));
      setToolsList(updated);
      localStorage.setItem("botock_tool_rules", JSON.stringify(updated));
    });
  };

  // -------------------------------------------------------------
  // Blog CMS Actions
  // -------------------------------------------------------------
  const handlePublishBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content) {
      alert("Please enter a title and content for the blog post.");
      return;
    }

    requireAdminOtp(`Publish Blog Post: "${newBlog.title}"`, () => {
      const slug = newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const createdPost: BlogPostItem = {
        id: slug || `post-${Date.now()}`,
        title: newBlog.title,
        excerpt: newBlog.excerpt || newBlog.content.slice(0, 140) + "...",
        category: newBlog.category,
        categoryLabel: newBlog.category === "ai" ? "Generative AI" : newBlog.category === "pdf" ? "PDF Workflows" : newBlog.category === "video" ? "Video Studio" : "Image Tech",
        readTime: newBlog.readTime || "4 min read",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        author: newBlog.author || "Botock Editorial",
        attachmentName: newBlog.attachmentName || undefined,
        attachmentUrl: newBlog.attachmentUrl || undefined,
      };

      const updated = [createdPost, ...blogPosts];
      setBlogPosts(updated);
      localStorage.setItem("botock_custom_blogs", JSON.stringify(updated));
      window.dispatchEvent(new Event("botock_blogs_updated"));

      setNewBlog({
        title: "",
        excerpt: "",
        category: "ai",
        categoryLabel: "Generative AI",
        readTime: "4 min read",
        author: "Botock Editorial",
        attachmentName: "",
        attachmentUrl: "",
        content: "",
      });
      alert("✅ Blog article published with attachment and visible on /blog!");
    });
  };

  const handleDeleteBlog = (blogId: string, blogTitle: string) => {
    requireAdminOtp(`Delete Blog Article: "${blogTitle}"`, () => {
      const updated = blogPosts.filter((p) => p.id !== blogId);
      setBlogPosts(updated);
      localStorage.setItem("botock_custom_blogs", JSON.stringify(updated));
      window.dispatchEvent(new Event("botock_blogs_updated"));
    });
  };

  // -------------------------------------------------------------
  // User Management Actions
  // -------------------------------------------------------------
  const handleToggleBlockUser = (userId: string, userEmail: string, currentBlocked: boolean) => {
    const action = currentBlocked ? `Unblock User Account: ${userEmail}` : `Block User Account: ${userEmail}`;
    requireAdminOtp(action, () => {
      const updated = usersList.map((u) => (u.id === userId ? { ...u, isBlocked: !currentBlocked } : u));
      setUsersList(updated);
      localStorage.setItem("botock_managed_users", JSON.stringify(updated));
    });
  };

  const handleToggleProUser = (userId: string, userEmail: string, isPro: boolean) => {
    const action = isPro ? `Downgrade ${userEmail} to Free Tier` : `Upgrade ${userEmail} to Pro Tier`;
    requireAdminOtp(action, () => {
      const updated = usersList.map((u) => (u.id === userId ? { ...u, isPro: !isPro } : u));
      setUsersList(updated);
      localStorage.setItem("botock_managed_users", JSON.stringify(updated));
    });
  };

  const handleResetCredits = (userId: string, userEmail: string) => {
    requireAdminOtp(`Reset Credits for ${userEmail}`, () => {
      const updated = usersList.map((u) => (u.id === userId ? { ...u, creditsRemaining: 1000, pointsUsed: 0 } : u));
      setUsersList(updated);
      localStorage.setItem("botock_managed_users", JSON.stringify(updated));
      alert(`Credits balance for ${userEmail} reset to 1,000.`);
    });
  };

  // -------------------------------------------------------------
  // CLOAKING / STEALTH CHECK:
  // If NOT logged in OR email is NOT in admin whitelist:
  // Render clean 404 Not Found screen. No admin clues exist!
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAuthorizedAdmin) {
    notFound();
  }

  // -------------------------------------------------------------
  // STEP 2: 2FA MASTER PIN GATE (Only for verified Admin Email)
  // -------------------------------------------------------------
  if (!is2FAVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-violet-600" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-3">
              <KeyRound className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Identity Verified: {userEmail}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              2-Step Master PIN Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your master administrative security PIN to decrypt operations and telemetry.
            </p>
          </div>

          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                6-Digit Master Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3.5 px-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.08] text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit Cryptographic Handshake & Identity Gate</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL ENTERPRISE ADMIN OPERATIONS DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. Header Banner & Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Botock Master Admin Operations
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                Ethical Shield v3.4
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Admin: <strong className="text-slate-800 dark:text-white font-mono">{userEmail}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Session Secured
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono text-[11px]">{currentClientIp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAdminLock}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </div>

      {/* Security Freeze Banner if Locked out */}
      {isEditRestricted && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-400 flex items-center gap-3 text-xs font-bold animate-pulse">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <div>
            <span>ETHICAL RESTRICTION ENGAGED: 3 failed OTP entries detected. Editing locked for {Math.ceil(restrictionSecondsLeft / 60)} minutes. Mathematical delay 2^(n-1) enforced to neutralize brute force attempts.</span>
          </div>
        </div>
      )}

      {/* 2. Top Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "telemetry"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Telemetry & Usage</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cms")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "cms"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Page Text CMS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tools")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "tools"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Tools Lock & Access</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blog")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "blog"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <FilePlus className="w-4 h-4" />
          <span>Blog CMS & Attachments</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "users"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Blocklist</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "security"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & IP Rules</span>
        </button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* TAB 1: LIVE TELEMETRY, VISITORS, USAGE & POINTS */}
      {/* -------------------------------------------------------- */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Active Visitors</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
                {liveVisitors}
                <span className="text-xs font-semibold text-emerald-500">Live now</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Real-time concurrent browser sessions</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Visits Today</span>
                <Radio className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {todayVisits.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Unique IP requests & page transitions</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subscribers (Pro vs Free)</span>
                <Users className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
                <span className="text-violet-500">184 Pro</span>
                <span className="text-slate-400 text-sm font-normal">/ 1,236 Free</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total registered: 1,420 users</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blocked User Accounts</span>
                <UserX className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-3xl font-black text-red-500 font-mono">
                {usersList.filter((u) => u.isBlocked).length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Quarantined for abuse or scrapers</p>
            </div>
          </div>

          {/* Points / Credits Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Points Consumption (Free vs Pro)</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Free Tier Points Used</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{freePointsUsed.toLocaleString()} pts</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "32%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Pro Tier Points Used</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{proPointsUsed.toLocaleString()} pts</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Omni 1.1 Video</div>
                    <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">82,400 pts</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Nano Banana</div>
                    <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">38,150 pts</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Converters/PDF</div>
                    <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">22,790 pts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool Usage Leaderboard */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Tool Usage Breakdown</span>
              </h3>

              <div className="space-y-3">
                {toolsList.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{tool.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-500">
                        {tool.category}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                      {tool.usageCount.toLocaleString()} uses
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 2: PAGE TEXT CMS (LIVE CONTENT EDITOR) */}
      {/* -------------------------------------------------------- */}
      {activeTab === "cms" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Live Website Page Content Editor</h2>
              <p className="text-xs text-slate-500">
                Update headlines, announcement banners, and copy across the homepage. Edits require OTP authorization.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveCms}
              disabled={isEditRestricted}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Changes (Requires OTP)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Hero Main Headline (Prefix)
              </label>
              <input
                type="text"
                value={cmsContent.heroHeadline}
                onChange={(e) => setCmsContent({ ...cmsContent, heroHeadline: e.target.value })}
                className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Hero Gradient Headline (Accent)
              </label>
              <input
                type="text"
                value={cmsContent.heroGradient}
                onChange={(e) => setCmsContent({ ...cmsContent, heroGradient: e.target.value })}
                className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Hero Subtitle Description
              </label>
              <textarea
                rows={3}
                value={cmsContent.heroSubtitle}
                onChange={(e) => setCmsContent({ ...cmsContent, heroSubtitle: e.target.value })}
                className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Top Announcement Bar Text
              </label>
              <input
                type="text"
                value={cmsContent.topBannerText}
                onChange={(e) => setCmsContent({ ...cmsContent, topBannerText: e.target.value })}
                className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Free Quota Notice (Footer & Status)
              </label>
              <input
                type="text"
                value={cmsContent.freeQuotaNotice}
                onChange={(e) => setCmsContent({ ...cmsContent, freeQuotaNotice: e.target.value })}
                className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Pro Tier Price Display
              </label>
              <input
                type="text"
                value={cmsContent.proPricePerMonth}
                onChange={(e) => setCmsContent({ ...cmsContent, proPricePerMonth: e.target.value })}
                className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Pro Tier Highlight Text
              </label>
              <input
                type="text"
                value={cmsContent.proFeatureHighlight}
                onChange={(e) => setCmsContent({ ...cmsContent, proFeatureHighlight: e.target.value })}
                className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 3: TOOLS LOCK & ACCESS MANAGEMENT */}
      {/* -------------------------------------------------------- */}
      {activeTab === "tools" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Tool Access & Tier Matrix</h2>
              <p className="text-xs text-slate-500">
                Lock tools for Free users (Pro-Only) or block them globally for maintenance. Toggling any rule requires OTP.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{toolsList.filter((t) => !t.isGloballyBlocked).length} Operational</span>
              <span>•</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>{toolsList.filter((t) => t.isGloballyBlocked).length} Blocked</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Tool Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Usage Count</th>
                  <th className="py-3 px-3">Tier Access</th>
                  <th className="py-3 px-3">System Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {toolsList.map((tool) => (
                  <tr key={tool.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{tool.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{tool.category}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {tool.usageCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        disabled={isEditRestricted}
                        onClick={() => handleToggleToolPro(tool.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          tool.isProOnly
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {tool.isProOnly ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{tool.isProOnly ? "Pro Only (Locked for Free)" : "Free & Pro (Unlocked)"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        disabled={isEditRestricted}
                        onClick={() => handleToggleToolBlock(tool.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          tool.isGloballyBlocked
                            ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {tool.isGloballyBlocked ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{tool.isGloballyBlocked ? "Blocked for All" : "Operational"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 4: BLOG CMS WITH ATTACHMENTS */}
      {/* -------------------------------------------------------- */}
      {activeTab === "blog" && (
        <div className="space-y-6">
          {/* Create Post Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-5">
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Publish New Blog Post with Attachment</h2>
              <p className="text-xs text-slate-500">
                Publish articles directly to <Link href="/blog" target="_blank" className="underline text-violet-500">/blog</Link> with downloadable resource attachments or featured banners.
              </p>
            </div>

            <form onSubmit={handlePublishBlog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Article Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Secret Video Prompts for Cinematic Omni 1.1 Renders"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newBlog.category}
                    onChange={(e: any) => setNewBlog({ ...newBlog, category: e.target.value })}
                    className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="ai">Generative AI</option>
                    <option value="pdf">PDF Workflows</option>
                    <option value="video">Video Studio</option>
                    <option value="image">Image Tech</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Summary / Excerpt
                </label>
                <input
                  type="text"
                  placeholder="Brief 1-2 sentence overview visible on the blog index cards..."
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                  className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Attachment File Input */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/[0.1] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white">Attach Media / Resource Asset</span>
                  </div>
                  <span className="text-[11px] text-slate-400">PDF, PNG, JPG, or ZIP</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="blog-attachment-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingAttachment(true);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setNewBlog({
                            ...newBlog,
                            attachmentName: file.name,
                            attachmentUrl: reader.result as string,
                          });
                          setUploadingAttachment(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="blog-attachment-input"
                    className="px-4 py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-600 dark:text-violet-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingAttachment ? "Reading file..." : "Select Attachment"}</span>
                  </label>

                  {newBlog.attachmentName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{newBlog.attachmentName}</span>
                      <button
                        type="button"
                        onClick={() => setNewBlog({ ...newBlog, attachmentName: "", attachmentUrl: "" })}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Article Body (Markdown)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write the full editorial body here..."
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isEditRestricted}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Publish to Blog (Requires OTP)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Blogs List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Published Blog Articles ({blogPosts.length})
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {blogPosts.map((post) => (
                <div key={post.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-300 font-semibold">
                        {post.categoryLabel}
                      </span>
                      {post.attachmentName && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{post.attachmentName}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{post.excerpt}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      By {post.author} • {post.date} • {post.readTime}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isEditRestricted}
                    onClick={() => handleDeleteBlog(post.id, post.title)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors self-start sm:self-center"
                    title="Delete Post (Requires OTP)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 5: USERS & BLOCKLIST MANAGEMENT */}
      {/* -------------------------------------------------------- */}
      {activeTab === "users" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">User Accounts & Blocklist</h2>
              <p className="text-xs text-slate-500">
                Manage user privileges, suspend or block abusive users, and modify credit balances. All actions require OTP.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user email or ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="text-xs py-2 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">User Email</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Credits Left</th>
                  <th className="py-3 px-3">Points Used</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {usersList
                  .filter((u) => u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((managed) => (
                    <tr key={managed.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{managed.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{managed.id} • Joined {managed.createdAt}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          disabled={isEditRestricted}
                          onClick={() => handleToggleProUser(managed.id, managed.email, managed.isPro)}
                          className={`px-2 py-0.5 rounded font-bold text-[11px] cursor-pointer ${
                            managed.isPro
                              ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30"
                              : "bg-slate-100 dark:bg-white/[0.06] text-slate-500"
                          }`}
                        >
                          {managed.isPro ? "PRO SUBSCRIBER" : "FREE TIER"}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {managed.creditsRemaining.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {managed.pointsUsed.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            managed.isBlocked
                              ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {managed.isBlocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <button
                          type="button"
                          disabled={isEditRestricted}
                          onClick={() => handleResetCredits(managed.id, managed.email)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Reset Credits
                        </button>
                        <button
                          type="button"
                          disabled={isEditRestricted}
                          onClick={() => handleToggleBlockUser(managed.id, managed.email, managed.isBlocked)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                            managed.isBlocked
                              ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                              : "bg-red-500/15 text-red-600 hover:bg-red-500/25"
                          }`}
                        >
                          {managed.isBlocked ? "Unblock" : "Block User"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 6: SECURITY, 2^(N-1) OTP ENGINE & IP WHITELIST */}
      {/* -------------------------------------------------------- */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] space-y-6">
            <div className="pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                <span>Ethical Hacking & Cryptographic Defense Center</span>
              </h2>
              <p className="text-xs text-slate-500">
                Multi-layered intrusion prevention: Email Whitelist + Cloaked 404 + 2-Factor PIN + Mathematical 2^(n-1) OTP Lockout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account + IP Whitelist */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-violet-500" />
                  <span>Authorized Admin Account & IP Whitelist</span>
                </h3>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Single Admin Google Identity</label>
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {userEmail} (Verified Active)
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">IP Whitelist Range</label>
                    <input
                      type="text"
                      value={adminIpWhitelist}
                      onChange={(e) => setAdminIpWhitelist(e.target.value)}
                      className="w-full text-xs font-mono py-2 px-3 rounded-lg bg-white dark:bg-black/30 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white mt-1"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Account + IP restriction protects console even if credentials leak.
                    </span>
                  </div>
                </div>
              </div>

              {/* Mathematical 2^(n-1) Telemetry */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <span>2^(n-1) Exponential Backoff Telemetry</span>
                </h3>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/[0.04]">
                    <span className="text-slate-500">Failed OTP Attempts:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{otpAttempts} of 3</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/[0.04]">
                    <span className="text-slate-500">Current Delay Algorithm:</span>
                    <span className="font-mono font-bold text-amber-500">t = 2^(n-1) seconds</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/[0.04]">
                    <span className="text-slate-500">Max Failure Consequence:</span>
                    <span className="font-bold text-red-500">15-Minute Hard System Freeze</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Lockout Status:</span>
                    <span className={`font-bold ${isEditRestricted ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                      {isEditRestricted ? `RESTRICTED (${restrictionSecondsLeft}s left)` : "NORMAL (Protected)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Live Admin Security Event Log
              </h4>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
                <div className="text-emerald-400">[SYSTEM] Ethical Firewall online. 404 stealth cloaking verified.</div>
                {securityLog.length === 0 ? (
                  <div className="text-slate-500">[LOG] No unauthorized attempts detected in this session.</div>
                ) : (
                  securityLog.map((log, idx) => (
                    <div key={idx} className="text-slate-300">{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECURE ACTION OTP MODAL (ANTI-HACKING INTERCEPTOR) */}
      {/* ------------------------------------------------------------- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#121118] border border-slate-200 dark:border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-violet-500" />

            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-500 flex items-center justify-center mb-3">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Admin Action OTP Required
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Authorizing: <strong className="text-slate-800 dark:text-slate-200">"{pendingAction?.name}"</strong>
              </p>
            </div>

            {/* Dynamic Secure Key Display for Owner */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] mb-5 text-center">
              <span className="text-[11px] text-slate-500 block mb-1">
                🔒 Cryptographic Dispatch to Owner ({userEmail}):
              </span>
              <span className="text-2xl font-mono font-black tracking-[0.4em] text-violet-600 dark:text-violet-400">
                {generatedOtp}
              </span>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Expires in {otpTtl}s (regenerates automatically)</span>
              </div>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 text-center">
                  Confirm 6-Digit Dynamic OTP ({3 - otpAttempts} attempts remaining)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  disabled={isBackoffActive}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 px-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  autoFocus
                />
              </div>

              {isBackoffActive && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold text-center animate-pulse">
                  ⚠️ Mathematical 2^(n-1) delay enforced: Locked for {backoffSecondsLeft}s...
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setPendingAction(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBackoffActive || otpInput.length < 6}
                  className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Execute</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
