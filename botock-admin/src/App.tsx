import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Compass,
  TrendingUp,
  Sliders,
  Gauge,
  FileText,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Search,
  Plus,
  Trash2,
  Save,
  Globe,
  Smartphone,
  Laptop,
  Sparkles,
  ArrowRight,
  Check,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link2,
  List,
  Quote,
  Code,
  ShieldCheck,
  ShieldAlert,
  Mail,
  LogOut,
  Bot,
  Activity,
  XCircle,
} from "lucide-react";

interface TelemetryEvent {
  session_id: string;
  user_email: string;
  event_type?: string;
  current_path?: string;
  previous_path?: string;
  referrer?: string;
  utm_source: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  country?: string;
  ip?: string;
  steps?: string[];
  last_seen?: string;
  timestamp?: string;
}

interface ToolConfig {
  name: string;
  enabled: boolean;
  pro_only: boolean;
  maintenance: boolean;
  uses: number;
  errors: number;
}

interface ToolFunnelMetric {
  tool_id: string;
  name: string;
  views: number;
  started: number;
  success: number;
  errors: number;
  abandoned: number;
  success_rate: number;
  enabled?: boolean;
  maintenance?: boolean;
}

interface ToolErrorLog {
  id: string;
  tool_id: string;
  tool_name: string;
  error_message: string;
  timestamp: string;
  user_email?: string;
  ip?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  target_keyword: string;
  meta_title: string;
  meta_description: string;
  cover_image: string;
  author: string;
  reading_time: string;
  status: "published" | "draft";
  featured: boolean;
  views: number;
  created_at?: string;
  updated_at?: string;
}

interface QuotasConfig {
  guest_daily_limit: number;
  free_user_daily_limit: number;
  max_file_size_mb: number;
  forced_model: string;
  global_maintenance: boolean;
  announcement_banner: string;
}

const PRESET_URLS = [
  { label: "🚀 Azure Backend (Auto Proxy)", url: "auto" },
  { label: "💻 Direct Localhost (http://localhost:8000)", url: "http://localhost:8000" },
  { label: "🌐 Production Server (https://botock.app)", url: "https://botock.app" },
];

const resolveHost = (host: string) => {
  const clean = host.replace(/\/+$/, "");
  if (!clean || clean === "auto" || clean === "http://localhost:8000" || clean === "http://127.0.0.1:8000") {
    return "";
  }
  if (clean === "https://botock.app" || clean === "http://botock.app" || clean === "/prod-proxy") {
    return "/prod-proxy";
  }
  return clean;
};

const getOrCreateDeviceId = (): string => {
  let id = localStorage.getItem("botock_admin_device_id");
  if (!id) {
    id = "dev_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now().toString(36);
    localStorage.setItem("botock_admin_device_id", id);
  }
  return id;
};

export default function App() {
  // Target Backend & Auth
  const [targetHost, setTargetHost] = useState<string>(() => {
    return localStorage.getItem("botock_admin_host") || "auto";
  });
  const [adminSecret, setAdminSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "journeys" | "funnel" | "tools" | "quotas" | "cms"
  >("journeys");

  // Enterprise Security & Device Recognition States
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>(() => {
    return sessionStorage.getItem("botock_admin_session_token") || "";
  });
  const [loginStep, setLoginStep] = useState<"credentials" | "otp">("credentials");
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [isTrustedDevice, setIsTrustedDevice] = useState<boolean>(() => {
    return localStorage.getItem("botock_device_trusted") === "true";
  });
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");

  // Clean any previously cached sensitive credentials from browser localStorage
  useEffect(() => {
    localStorage.removeItem("botock_admin_secret");
    localStorage.removeItem("botock_admin_email");
    localStorage.removeItem("botock_admin_api_key");
    localStorage.removeItem("admin_secret");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_api_key");
  }, []);

  // Connection & Server Health
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [serverStats, setServerStats] = useState<{
    cpu_percent?: number;
    memory_percent?: number;
    uptime_seconds?: number;
    total_telemetry_events?: number;
    active_sessions_24h?: number;
  }>({});

  // Tab Data States
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
  const [tools, setTools] = useState<Record<string, ToolConfig>>({});
  const [toolFunnel, setToolFunnel] = useState<ToolFunnelMetric[]>([]);
  const [recentErrors, setRecentErrors] = useState<ToolErrorLog[]>([]);
  const [quotas, setQuotas] = useState<QuotasConfig>({
    guest_daily_limit: 10,
    free_user_daily_limit: 30,
    max_file_size_mb: 60,
    forced_model: "auto",
    global_maintenance: false,
    announcement_banner: "",
  });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Search & Filter States
  const [journeyFilter, setJourneyFilter] = useState("all");
  const [errorSearch, setErrorSearch] = useState("");

  // SEO Blog CMS Form State
  const [editingBlog, setEditingBlog] = useState<BlogPost>({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "AI Audio & Voice",
    target_keyword: "",
    meta_title: "",
    meta_description: "",
    cover_image: "https://botock.app/og-image.jpg",
    author: "Botock Editorial Team",
    reading_time: "3 min read",
    status: "published",
    featured: false,
    views: 0,
  });
  const [isBlogNew, setIsBlogNew] = useState(true);
  const [blogPreviewMode, setBlogPreviewMode] = useState<"edit" | "preview" | "serp">("edit");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");

  // Axios Client Generator
  const getClient = useCallback(() => {
    const cleanHost = resolveHost(targetHost);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionToken.trim()) {
      headers["x-admin-token"] = sessionToken.trim();
    }
    if (adminSecret.trim()) {
      headers["X-Admin-Secret"] = adminSecret.trim();
      headers["admin-api-key"] = adminSecret.trim();
    }
    return axios.create({
      baseURL: cleanHost,
      headers,
      timeout: 15000,
    });
  }, [targetHost, adminSecret, sessionToken]);

  // Fetch Entire Overview from Backend
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setStatusMessage({ type: "info", text: "Connecting to backend..." });
    const cleanHost = resolveHost(targetHost);

    // 1. Probe readiness & health check
    try {
      const healthRes = await axios.get(`${cleanHost}/health`, { timeout: 6000 });
      if (healthRes.data?.status === "ok") {
        setConnected(true);
      }
    } catch {
      setConnected(false);
      setStatusMessage({
        type: "error",
        text: `Cannot reach backend at ${targetHost}. Ensure backend is running.`,
      });
      setLoading(false);
      return;
    }

    // 2. If session token is not yet established, return
    if (!sessionToken.trim()) {
      setLoading(false);
      return;
    }

    // 3. Authenticated overview request
    const client = getClient();
    try {
      const res = await client.get("/api/admin/overview");
      if (res.data?.ok || res.data?.tool_flags) {
        setConnected(true);
        setStatusMessage({ type: "success", text: "Connected! All systems operational." });
        setServerStats(res.data.server || {});
        setTelemetry(res.data.user_journeys || []);
        setSourceBreakdown(res.data.source_breakdown || {});
        setTools(res.data.tool_flags || {});
        setToolFunnel(res.data.tool_funnel || []);
        setRecentErrors(res.data.recent_errors || []);
        setQuotas(res.data.quotas || {});
        setBlogs(res.data.blogs || []);

        localStorage.setItem("botock_admin_host", targetHost);
      } else {
        setStatusMessage({ type: "error", text: "Session invalid or expired. Please re-login." });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to fetch overview.";
      setStatusMessage({ type: "error", text: detail });
      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem("botock_admin_session_token");
        setSessionToken("");
      }
    } finally {
      setLoading(false);
    }
  }, [targetHost, sessionToken, getClient]);

  // Initial load on mount or host change
  useEffect(() => {
    if (sessionToken) {
      fetchOverview();
    }
  }, [fetchOverview, sessionToken]);

  // Real-time Traffic Attribution Totals
  const trafficTotals = useMemo(() => {
    const fb = sourceBreakdown["facebook"] || 0;
    const insta = sourceBreakdown["instagram"] || 0;
    const ai =
      (sourceBreakdown["ai_chatgpt"] || 0) +
      (sourceBreakdown["ai_perplexity"] || 0) +
      (sourceBreakdown["ai_claude"] || 0) +
      (sourceBreakdown["ai_gemini"] || 0) +
      (sourceBreakdown["ai_copilot"] || 0);
    const google = (sourceBreakdown["google_search"] || 0) + (sourceBreakdown["google_ads"] || 0);
    const twitter = sourceBreakdown["twitter_x"] || 0;
    const tiktok = sourceBreakdown["tiktok"] || 0;
    const direct = (sourceBreakdown["direct"] || 0) + (sourceBreakdown["organic"] || 0);
    const referral = sourceBreakdown["referral"] || 0;
    const total = fb + insta + ai + google + twitter + tiktok + direct + referral;
    return { fb, insta, ai, google, twitter, tiktok, direct, referral, total: Math.max(total, 1) };
  }, [sourceBreakdown]);

  // Tool Funnel Summary Calculations
  const funnelSummary = useMemo(() => {
    const totalViews = toolFunnel.reduce((acc, t) => acc + t.views, 0);
    const totalStarted = toolFunnel.reduce((acc, t) => acc + t.started, 0);
    const totalSuccess = toolFunnel.reduce((acc, t) => acc + t.success, 0);
    const totalErrors = toolFunnel.reduce((acc, t) => acc + t.errors, 0);
    const totalAbandoned = toolFunnel.reduce((acc, t) => acc + t.abandoned, 0);
    const overallSuccessRate =
      totalSuccess + totalErrors > 0
        ? Math.round((totalSuccess / (totalSuccess + totalErrors)) * 100)
        : 100;
    return { totalViews, totalStarted, totalSuccess, totalErrors, totalAbandoned, overallSuccessRate };
  }, [toolFunnel]);

  // Filtered Journeys
  const filteredJourneys = useMemo(() => {
    if (journeyFilter === "all") return telemetry;
    return telemetry.filter((j) => {
      if (journeyFilter === "facebook") return j.utm_source === "facebook";
      if (journeyFilter === "instagram") return j.utm_source === "instagram";
      if (journeyFilter === "ai") return j.utm_source.startsWith("ai_");
      if (journeyFilter === "google") return j.utm_source.includes("google");
      if (journeyFilter === "direct") return j.utm_source === "direct" || j.utm_source === "organic";
      return true;
    });
  }, [telemetry, journeyFilter]);

  // Filtered Error Logs
  const filteredErrors = useMemo(() => {
    if (!errorSearch.trim()) return recentErrors;
    const q = errorSearch.toLowerCase();
    return recentErrors.filter(
      (e) =>
        e.tool_name.toLowerCase().includes(q) ||
        e.error_message.toLowerCase().includes(q) ||
        (e.ip && e.ip.includes(q))
    );
  }, [recentErrors, errorSearch]);

  // SEO Score Auditor
  const seoScore = useMemo(() => {
    let score = 0;
    const kw = editingBlog.target_keyword.trim().toLowerCase();
    if (!kw) return 0;
    score += 10;
    if (editingBlog.title.toLowerCase().includes(kw)) score += 15;
    if (editingBlog.meta_title.toLowerCase().includes(kw)) score += 15;
    if (editingBlog.meta_description.toLowerCase().includes(kw)) score += 15;
    if (editingBlog.content.toLowerCase().includes(kw)) score += 15;
    const words = editingBlog.content.trim().split(/\s+/).filter(Boolean).length;
    if (words > 300) score += 10;
    if (words > 800) score += 10;
    if (editingBlog.content.includes("## ")) score += 5;
    if (editingBlog.content.includes("### ")) score += 5;
    return Math.min(score, 100);
  }, [editingBlog]);

  // Enterprise Authentication Handlers
  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminEmail.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your registered Admin Email." });
      return;
    }
    if (!adminSecret.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your Admin Login Secret password." });
      return;
    }

    setAuthLoading(true);
    setStatusMessage({ type: "info", text: "Authenticating with Botock Secure Gate..." });
    const cleanHost = resolveHost(targetHost);
    const deviceId = getOrCreateDeviceId();

    try {
      const res = await axios.post(`${cleanHost}/api/admin/auth/verify-secret`, {
        email: adminEmail.trim(),
        secret: adminSecret.trim(),
        device_id: deviceId,
        device_name: "Admin Workstation (" + (navigator.platform || "PC") + ")",
      });

      localStorage.setItem("botock_admin_host", targetHost);

      if (res.data?.trusted_device && (res.data?.token || res.data?.admin_token)) {
        // Trusted Device Recognized -> Direct 1-Click Entry!
        const token = res.data.token || res.data.admin_token;
        sessionStorage.setItem("botock_admin_session_token", token);
        setSessionToken(token);
        setIsTrustedDevice(true);
        localStorage.setItem("botock_device_trusted", "true");
        setStatusMessage({
          type: "success",
          text: `🛡️ Recognized Trusted Device! Direct session granted for ${adminEmail.trim()}.`,
        });
        setTimeout(() => fetchOverview(), 150);
      } else if (res.data?.otp_required) {
        // New Device -> Proceed to 6-digit Zoho OTP verification
        setLoginStep("otp");
        setOtpCode("");
        setStatusMessage({
          type: "info",
          text: res.data?.message || `6-digit verification code dispatched to ${adminEmail.trim()} via Zoho Mail.`,
        });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Authentication failed.";
      setStatusMessage({ type: "error", text: detail });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length !== 6) {
      setStatusMessage({ type: "error", text: "Please enter the complete 6-digit OTP code." });
      return;
    }

    setAuthLoading(true);
    setStatusMessage({ type: "info", text: "Verifying 2FA One-Time Passcode..." });
    const cleanHost = resolveHost(targetHost);
    const deviceId = getOrCreateDeviceId();

    try {
      const res = await axios.post(`${cleanHost}/api/admin/auth/verify-otp`, {
        email: adminEmail.trim(),
        otp: otpCode.trim(),
        device_id: deviceId,
        device_name: "Admin Workstation (" + (navigator.platform || "PC") + ")",
        remember_device: rememberDevice,
      });

      const token = res.data?.token || res.data?.admin_token;
      if (token) {
        sessionStorage.setItem("botock_admin_session_token", token);
        setSessionToken(token);

        if (rememberDevice && res.data?.trusted_device) {
          setIsTrustedDevice(true);
          localStorage.setItem("botock_device_trusted", "true");
        }

        setStatusMessage({
          type: "success",
          text: `2FA Verified! Device registered. Session initialized for ${adminEmail.trim()}.`,
        });
        setTimeout(() => fetchOverview(), 150);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Invalid or expired OTP.";
      setStatusMessage({ type: "error", text: detail });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async (customMsg?: string) => {
    const cleanHost = resolveHost(targetHost);
    try {
      if (sessionToken) {
        await axios.post(
          `${cleanHost}/api/admin/auth/logout`,
          {},
          { headers: { "x-admin-token": sessionToken }, timeout: 4000 }
        ).catch(() => {});
      }
    } finally {
      sessionStorage.removeItem("botock_admin_session_token");
      setSessionToken("");
      setAdminEmail("");
      setAdminSecret("");
      setOtpCode("");
      setConnected(false);
      setLoginStep("credentials");
      setStatusMessage({
        type: customMsg ? "error" : "info",
        text: customMsg || "Logged out successfully. Session terminated.",
      });
    }
  };

  // Inactivity auto-lock listener (15 minutes idle timeout)
  useEffect(() => {
    if (!sessionToken) return;

    let idleTimer: any;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        handleLogout("Session expired automatically due to 15 minutes of inactivity.");
      }, 15 * 60 * 1000);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetIdle));
    };
  }, [sessionToken]);

  // Toggle Tool Feature Flag
  const handleToggleTool = async (
    toolId: string,
    field: "enabled" | "pro_only" | "maintenance",
    currentVal: boolean
  ) => {
    const client = getClient();
    try {
      const res = await client.post("/api/admin/tool-flags", {
        tool_id: toolId,
        updates: { [field]: !currentVal },
      });
      if (res.data?.ok) {
        setTools(res.data.tool_flags);
        setStatusMessage({ type: "success", text: `Updated ${toolId} successfully.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.response?.data?.detail || "Update failed." });
    }
  };

  // Save Quotas Configuration
  const handleSaveQuotas = async () => {
    const client = getClient();
    try {
      const res = await client.post("/api/admin/quotas", quotas);
      if (res.data?.ok) {
        setStatusMessage({ type: "success", text: "Global quotas & limits saved." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.response?.data?.detail || "Failed to save quotas." });
    }
  };

  // SEO Blog CMS Handlers
  const handleSelectBlog = (blog: BlogPost) => {
    setEditingBlog({ ...blog });
    setIsBlogNew(false);
  };

  const handleNewBlog = () => {
    setEditingBlog({
      id: "",
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "AI Audio Tutorials",
      target_keyword: "",
      meta_title: "",
      meta_description: "",
      cover_image: "https://botock.app/og-image.jpg",
      author: "Botock Editorial Team",
      reading_time: "4 min read",
      status: "published",
      featured: false,
      views: 0,
    });
    setIsBlogNew(true);
  };

  const handleSaveBlog = async () => {
    if (!editingBlog.title.trim() || !editingBlog.slug.trim()) {
      setStatusMessage({ type: "error", text: "Blog title and URL slug are required." });
      return;
    }

    const client = getClient();
    try {
      const res = await client.post("/api/admin/blogs/save", editingBlog);
      if (res.data?.ok) {
        setBlogs(res.data.blogs || []);
        setIsBlogNew(false);
        setStatusMessage({
          type: "success",
          text: `Article "${editingBlog.title}" successfully published directly to botock.app/blog/${editingBlog.slug}!`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.response?.data?.detail || "Failed to save blog post." });
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to permanently delete this article?")) return;
    const client = getClient();
    try {
      const res = await client.post("/api/admin/blogs/delete", { id: blogId });
      if (res.data?.ok) {
        setBlogs(res.data.blogs || []);
        if (editingBlog.id === blogId) handleNewBlog();
        setStatusMessage({ type: "success", text: "Article deleted from publication." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.response?.data?.detail || "Failed to delete article." });
    }
  };

  // Helper Markdown Inserter
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("blog-content-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    const newText = before + prefix + (selected || "text") + suffix + after;
    setEditingBlog({ ...editingBlog, content: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || "text").length);
    }, 50);
  };

  // If Not Authenticated, Render Command Gate Screen
  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Botock Command Center
            </h1>
            <p className="text-xs text-slate-400">
              RESTRICTED GATE • ZERO-BACKDOOR ACCESS
            </p>
          </div>

          {/* Backend Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Target Backend Environment
            </label>
            <div className="relative">
              <select
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer appearance-none pr-8"
              >
                {PRESET_URLS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
              <Server className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Status / Alert Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2.5 border ${
                statusMessage.type === "success"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : statusMessage.type === "error"
                  ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                  : "text-sky-400 bg-sky-500/10 border-sky-500/20"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="leading-snug">{statusMessage.text}</span>
            </div>
          )}

          {loginStep === "credentials" ? (
            /* STEP 1: EMAIL & SECRET CREDENTIALS */
            <form onSubmit={handleLoginSubmit} autoComplete="off" data-lpignore="true" className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Admin Email</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    name="botock_admin_user_id"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter Admin Email"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    className="w-full bg-transparent border-none outline-none text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Admin Password / Secret</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                  <Lock className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                  <input
                    type={showSecret ? "text" : "password"}
                    name="botock_admin_auth_key"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Enter Password"
                    required
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    className="w-full bg-transparent border-none outline-none text-slate-100 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-slate-400 hover:text-slate-200 ml-2"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Device Recognition Badge */}
              <div className="flex items-center justify-between text-[11px] bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center space-x-2">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-400">Device Status:</span>
                </div>
                <span className={isTrustedDevice ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {isTrustedDevice ? "🛡️ Trusted Device (1-Click)" : "🔒 Unverified (OTP Required)"}
                </span>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 disabled:opacity-60 cursor-pointer text-xs"
              >
                <RefreshCw className={`w-4 h-4 ${authLoading ? "animate-spin" : ""}`} />
                <span>{authLoading ? "Authenticating..." : "Sign In to Command Center"}</span>
              </button>
            </form>
          ) : (
            /* STEP 2: 2FA OTP VERIFICATION (NEW DEVICE) */
            <form onSubmit={handleOtpSubmit} autoComplete="off" className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-slate-300 leading-relaxed text-[11px]">
                <strong className="text-indigo-400 block mb-0.5">🔐 New Device Detected!</strong>
                A 6-digit one-time code has been dispatched via Zoho Mail to <strong>{adminEmail}</strong>. Valid for 10 minutes.
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.trim())}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-emerald-300 outline-none focus:border-emerald-400 transition"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 text-xs">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Trust this device (Next time sign in without OTP)</span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep("credentials");
                    setStatusMessage(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={authLoading || otpCode.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{authLoading ? "Verifying..." : "Verify & Unlock"}</span>
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1">
            <Lock className="w-3 h-3 text-slate-600" />
            <span>3 Failed Attempts = 24-Hour IP Security Lockout</span>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED COMMAND CENTER INTERFACE
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 🧭 TOP COMMAND BAR */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Botock Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AZURE CLOUD
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live Traffic Attribution, Funnel & Error Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Target Environment Dropdown */}
            <select
              value={targetHost}
              onChange={(e) => {
                setTargetHost(e.target.value);
                localStorage.setItem("botock_admin_host", e.target.value);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              {PRESET_URLS.map((p) => (
                <option key={p.url} value={p.url}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Trusted Device Badge */}
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold text-[11px]">
                {adminEmail}
              </span>
            </div>

            {/* Inactivity Auto-Lock Badge */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-400">
              <span>⏳ 15m Idle Lock</span>
            </div>

            {/* Sync Live Button */}
            <button
              onClick={() => fetchOverview()}
              disabled={loading}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow ${
                connected
                  ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{connected ? "Sync Live" : "Connect"}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => handleLogout()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition shadow"
              title="Logout session and clear access"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Real-Time Live Status Bar */}
        <div className="bg-slate-950/80 border-t border-slate-800/60 px-4 py-1.5 text-[11px] flex flex-wrap items-center justify-between text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              <span className="font-semibold text-slate-300">
                {connected ? "Azure Backend Online" : "Backend Disconnected"}
              </span>
            </span>

            {serverStats.cpu_percent !== undefined && (
              <span className="hidden md:inline font-mono">
                CPU: {serverStats.cpu_percent.toFixed(1)}% | RAM: {serverStats.memory_percent?.toFixed(1)}%
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {statusMessage && (
              <div
                className={`flex items-center space-x-1 text-[11px] ${
                  statusMessage.type === "success"
                    ? "text-emerald-400"
                    : statusMessage.type === "error"
                    ? "text-rose-400"
                    : "text-sky-400"
                }`}
              >
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* 📑 TAB NAVIGATION BAR */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar border-t border-slate-800 text-xs">
          {[
            { id: "journeys", label: "Live Traffic & Sources", icon: Compass, count: telemetry.length },
            { id: "funnel", label: "Tool Funnel & Error Inspector", icon: Activity, count: recentErrors.length },
            { id: "tools", label: "Tool Feature Flags", icon: Sliders, count: Object.keys(tools).length },
            { id: "quotas", label: "Quotas & Maintenance", icon: Gauge },
            { id: "cms", label: "SEO Blog CMS & SERP", icon: FileText, count: blogs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-all whitespace-nowrap ${
                  active
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* 💻 MAIN CONTENT VIEWS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* ==================================================================== */}
        {/* TAB 1: LIVE TRAFFIC SOURCES & USER JOURNEYS                          */}
        {/* ==================================================================== */}
        {activeTab === "journeys" && (
          <div className="space-y-6">
            {/* Top Traffic Attribution Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span>Real-Time Traffic Sources Attribution</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  Total Tracked: {trafficTotals.total}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Facebook Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
                  <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1">
                    <span>Facebook</span>
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-white">{trafficTotals.fb}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {Math.round((trafficTotals.fb / trafficTotals.total) * 100)}% of traffic
                  </div>
                </div>

                {/* Instagram Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
                  <div className="flex items-center justify-between text-xs text-pink-400 font-semibold mb-1">
                    <span>Instagram</span>
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-white">{trafficTotals.insta}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {Math.round((trafficTotals.insta / trafficTotals.total) * 100)}% of traffic
                  </div>
                </div>

                {/* AI Engines Card */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 shadow bg-gradient-to-b from-emerald-500/5 to-transparent">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
                    <span>AI Search</span>
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300">{trafficTotals.ai}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    ChatGPT / Perplexity
                  </div>
                </div>

                {/* Google Search Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                    <span>Google</span>
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-white">{trafficTotals.google}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Organic & Ads</div>
                </div>

                {/* TikTok & Twitter */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
                  <div className="flex items-center justify-between text-xs text-sky-400 font-semibold mb-1">
                    <span>X & TikTok</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {trafficTotals.twitter + trafficTotals.tiktok}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Social Viral</div>
                </div>

                {/* Direct & Organic */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                    <span>Direct</span>
                    <Laptop className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-white">{trafficTotals.direct}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Direct URL Visits</div>
                </div>
              </div>
            </div>

            {/* Clickstream User Journeys Table */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>Real-Time Visitor Clickstream Flows</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live page-by-page paths taken by visitors after clicking your shared links
                  </p>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center space-x-1.5 text-xs">
                  {["all", "facebook", "instagram", "ai", "google", "direct"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setJourneyFilter(f)}
                      className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                        journeyFilter === f
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {f === "ai" ? "🤖 AI Search" : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Visitor / Device</th>
                      <th className="py-3 px-4">Acquisition Source</th>
                      <th className="py-3 px-4">HTTP Referrer</th>
                      <th className="py-3 px-4">Navigation Flow Path</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredJourneys.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                          No clickstream visits recorded yet. Share a link on Facebook, Instagram, or AI to start logging.
                        </td>
                      </tr>
                    ) : (
                      filteredJourneys.map((j, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200 font-sans">{j.user_email}</div>
                            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                              <span>{j.device_type}</span>
                              {j.ip && <span>• {j.ip}</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                j.utm_source === "facebook"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : j.utm_source === "instagram"
                                  ? "bg-pink-500/20 text-pink-300"
                                  : j.utm_source.startsWith("ai_")
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : j.utm_source.includes("google")
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {j.utm_source}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 truncate max-w-xs text-[11px]" title={j.referrer}>
                            {j.referrer || "Direct Entry"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              {j.steps && j.steps.length > 0 ? (
                                j.steps.map((step, sIdx) => (
                                  <span key={sIdx} className="flex items-center space-x-1 text-[11px]">
                                    <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                      {step}
                                    </span>
                                    {j.steps && sIdx < j.steps.length - 1 && (
                                      <ArrowRight className="w-3 h-3 text-slate-600" />
                                    )}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500">/</span >
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500 text-[11px] whitespace-nowrap font-sans">
                            {j.timestamp ? new Date(j.timestamp).toLocaleTimeString() : "Just now"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: TOOL FUNNEL & ERROR INSPECTOR                                  */}
        {/* ==================================================================== */}
        {activeTab === "funnel" && (
          <div className="space-y-6">
            {/* Top Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
                <div className="text-xs text-slate-400 font-medium mb-1">Total Tool Visitors</div>
                <div className="text-2xl font-extrabold text-white">{funnelSummary.totalViews}</div>
                <div className="text-[11px] text-slate-500 mt-1">Landed on tool page</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
                <div className="text-xs text-indigo-400 font-medium mb-1">Input / Started</div>
                <div className="text-2xl font-extrabold text-indigo-300">{funnelSummary.totalStarted}</div>
                <div className="text-[11px] text-slate-500 mt-1">Typed prompt or uploaded</div>
              </div>

              <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-4 shadow">
                <div className="text-xs text-emerald-400 font-medium mb-1">Completed (Success)</div>
                <div className="text-2xl font-extrabold text-emerald-300">{funnelSummary.totalSuccess}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Overall Success: {funnelSummary.overallSuccessRate}%
                </div>
              </div>

              <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 shadow">
                <div className="text-xs text-amber-400 font-medium mb-1">Abandoned (Drop-offs)</div>
                <div className="text-2xl font-extrabold text-amber-300">{funnelSummary.totalAbandoned}</div>
                <div className="text-[11px] text-slate-500 mt-1">Left without generating</div>
              </div>

              <div className="bg-slate-900 border border-rose-500/20 rounded-xl p-4 shadow">
                <div className="text-xs text-rose-400 font-medium mb-1">Failed (Errors)</div>
                <div className="text-2xl font-extrabold text-rose-300">{funnelSummary.totalErrors}</div>
                <div className="text-[11px] text-slate-500 mt-1">Encountered an issue</div>
              </div>
            </div>

            {/* Tool Funnel Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Tool Conversion & Drop-off Ranking</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    See exactly which tools are performing best and where visitors drop off
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tool Name</th>
                    <th className="py-3 px-4">Visitors (Views)</th>
                    <th className="py-3 px-4">Inputs Started</th>
                    <th className="py-3 px-4">Completed</th>
                    <th className="py-3 px-4">Abandoned</th>
                    <th className="py-3 px-4">Errors</th>
                    <th className="py-3 px-4">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {toolFunnel.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No tool funnel events logged yet.
                      </td>
                    </tr>
                  ) : (
                    toolFunnel.map((t) => (
                      <tr key={t.tool_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          <div className="flex items-center space-x-2">
                            <span>{t.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">({t.tool_id})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-300">{t.views}</td>
                        <td className="py-3 px-4 font-mono text-indigo-300">{t.started}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{t.success}</td>
                        <td className="py-3 px-4 font-mono text-amber-400">{t.abandoned}</td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-400">{t.errors}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  t.success_rate >= 95
                                    ? "bg-emerald-500"
                                    : t.success_rate >= 80
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${t.success_rate}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-slate-300">
                              {t.success_rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Live Error Inspector Console */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Real-Time Error Inspector Console</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Exact error messages and stack traces whenever a generation or tool fails
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={errorSearch}
                    onChange={(e) => setErrorSearch(e.target.value)}
                    placeholder="Search error message, tool, or IP..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto font-mono text-xs">
                {filteredErrors.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-sans">
                    ✨ No recent errors detected! All systems operating smoothly.
                  </div>
                ) : (
                  filteredErrors.map((err) => (
                    <div key={err.id} className="p-4 hover:bg-slate-850 transition space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 font-sans font-semibold">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                            {err.tool_name}
                          </span>
                          <span className="text-slate-400 text-[11px]">({err.tool_id})</span>
                          {err.ip && <span className="text-slate-500 text-[10px]">IP: {err.ip}</span>}
                        </div>
                        <span className="text-slate-500 text-[10px] font-sans">
                          {new Date(err.timestamp).toLocaleTimeString()} • {new Date(err.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/20 text-rose-300 text-xs font-mono leading-relaxed break-all">
                        {err.error_message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: TOOL FEATURE FLAGS                                            */}
        {/* ==================================================================== */}
        {activeTab === "tools" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <span>Feature Flags & Maintenance Kill-Switches</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Instantly toggle tools online, enable maintenance banners, or restrict access
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tools).map(([id, t]) => (
                <div
                  key={id}
                  className={`p-4 rounded-xl border transition-all ${
                    t.maintenance
                      ? "bg-amber-950/20 border-amber-500/40"
                      : !t.enabled
                      ? "bg-slate-900/40 border-slate-800 opacity-60"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{t.name}</h3>
                      <div className="text-[11px] text-slate-500 font-mono">/tools/{id}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.maintenance
                          ? "bg-amber-500/20 text-amber-300"
                          : t.enabled
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {t.maintenance ? "Maintenance" : t.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    {/* Switch: Active */}
                    <button
                      onClick={() => handleToggleTool(id, "enabled", t.enabled)}
                      className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
                        t.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.enabled ? "Active" : "Disabled"}</span>
                    </button>

                    {/* Switch: Maintenance */}
                    <button
                      onClick={() => handleToggleTool(id, "maintenance", t.maintenance)}
                      className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
                        t.maintenance
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{t.maintenance ? "Under Maintenance" : "Normal"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: PLATFORM QUOTAS & MAINTENANCE                                  */}
        {/* ==================================================================== */}
        {activeTab === "quotas" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-1">
                <Gauge className="w-5 h-5 text-indigo-400" />
                <span>Global Quotas, File Limits & Platform Maintenance</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Applies globally across all public tools and user session verifications
              </p>

              <div className="space-y-4 text-xs">
                {/* Guest Daily Limit */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Guest Daily Generations</div>
                    <div className="text-slate-500 text-[11px]">Free operations allowed without login</div>
                  </div>
                  <input
                    type="number"
                    value={quotas.guest_daily_limit}
                    onChange={(e) =>
                      setQuotas({ ...quotas, guest_daily_limit: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-right"
                  />
                </div>

                {/* Free User Daily Limit */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Registered User Daily Limit</div>
                    <div className="text-slate-500 text-[11px]">Free daily operations for logged-in users</div>
                  </div>
                  <input
                    type="number"
                    value={quotas.free_user_daily_limit}
                    onChange={(e) =>
                      setQuotas({ ...quotas, free_user_daily_limit: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-right"
                  />
                </div>

                {/* Max File Size */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Maximum Upload Size (MB)</div>
                    <div className="text-slate-500 text-[11px]">Enforced on audio, video and document uploads</div>
                  </div>
                  <input
                    type="number"
                    value={quotas.max_file_size_mb}
                    onChange={(e) =>
                      setQuotas({ ...quotas, max_file_size_mb: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-right"
                  />
                </div>

                {/* Announcement Banner */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Global Announcement Banner</div>
                  <input
                    type="text"
                    value={quotas.announcement_banner}
                    onChange={(e) =>
                      setQuotas({ ...quotas, announcement_banner: e.target.value })
                    }
                    placeholder="e.g. 🚀 Welcome to Botock Creative Suite! Enjoy unlimited access."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Global Maintenance Switch */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Emergency Maintenance Mode</div>
                    <div className="text-slate-500 text-[11px]">Lock platform and show maintenance screen</div>
                  </div>
                  <button
                    onClick={() => setQuotas({ ...quotas, global_maintenance: !quotas.global_maintenance })}
                    className={`px-4 py-1.5 rounded-lg font-bold transition ${
                      quotas.global_maintenance
                        ? "bg-rose-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {quotas.global_maintenance ? "Active (Locked)" : "Off (Live)"}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveQuotas}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-2 text-xs shadow-lg shadow-indigo-600/25"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Quotas & Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: SEO BLOG CMS & GOOGLE SERP PUBLISHER                           */}
        {/* ==================================================================== */}
        {activeTab === "cms" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Enterprise SEO Blog CMS & Google SERP Publisher</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Publish programmatic, SEO-optimized guides directly to botock.app/blog with Live Snippet previews
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleNewBlog}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Article</span>
                </button>

                {blogs.length > 0 && (
                  <select
                    value={editingBlog.id || ""}
                    onChange={(e) => {
                      const found = blogs.find((b) => b.id === e.target.value);
                      if (found) handleSelectBlog(found);
                    }}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none max-w-xs truncate"
                  >
                    <option value="" disabled>
                      Select an existing article ({blogs.length})...
                    </option>
                    {blogs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Main CMS Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form & Editor */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
                  {/* Article Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Article Main Title
                    </label>
                    <input
                      type="text"
                      value={editingBlog.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const slug = newTitle
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/[\s_-]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        setEditingBlog({
                          ...editingBlog,
                          title: newTitle,
                          slug: isBlogNew ? slug : editingBlog.slug,
                          meta_title: isBlogNew ? `${newTitle} | Botock AI` : editingBlog.meta_title,
                        });
                      }}
                      placeholder="e.g. How to Clone Any Voice for Free with Zero-Shot AI in 2026"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Slug & Target Keyword */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        URL Slug (botock.app/blog/...)
                      </label>
                      <input
                        type="text"
                        value={editingBlog.slug}
                        onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Target SEO Keyword
                      </label>
                      <input
                        type="text"
                        value={editingBlog.target_keyword}
                        onChange={(e) => setEditingBlog({ ...editingBlog, target_keyword: e.target.value })}
                        placeholder="e.g. free ai voice cloner"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Markdown Toolbar */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => insertMarkdown("**", "**")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("*", "*")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Italic"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("## ")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Heading 2"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("### ")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Heading 3"
                        >
                          <Heading3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("[Link Text](", ")")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Link"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("- ")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Bullet List"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("> ")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Quote"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("```\n", "\n```")}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Code Block"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setBlogPreviewMode("edit")}
                          className={`px-2 py-0.5 rounded ${
                            blogPreviewMode === "edit"
                              ? "bg-indigo-600 text-white font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogPreviewMode("preview")}
                          className={`px-2 py-0.5 rounded ${
                            blogPreviewMode === "preview"
                              ? "bg-indigo-600 text-white font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          Live Reader View
                        </button>
                      </div>
                    </div>

                    {blogPreviewMode === "edit" ? (
                      <textarea
                        id="blog-content-editor"
                        rows={16}
                        value={editingBlog.content}
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        placeholder="Write your in-depth Markdown guide here..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 outline-none leading-relaxed focus:border-indigo-500"
                      />
                    ) : (
                      <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-5 min-h-[380px] prose prose-invert prose-xs max-w-none">
                        <div className="text-xl font-bold text-white mb-2">{editingBlog.title}</div>
                        <div className="text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
                          By {editingBlog.author} • {editingBlog.reading_time}
                        </div>
                        <div className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed">
                          {editingBlog.content}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    {!isBlogNew && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(editingBlog.id)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Article</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveBlog}
                      className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isBlogNew ? "Publish Article Live" : "Update Live Publication"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: SEO Audit & Google SERP Snippet Preview */}
              <div className="lg:col-span-5 space-y-4">
                {/* Real-time SEO Score Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Real-Time SEO Audit</span>
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        seoScore >= 80
                          ? "bg-emerald-500/20 text-emerald-300"
                          : seoScore >= 50
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {seoScore}% Score
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all duration-300 ${
                        seoScore >= 80
                          ? "bg-emerald-500"
                          : seoScore >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${seoScore}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {[
                      { label: "Target Keyword specified", pass: Boolean(editingBlog.target_keyword.trim()) },
                      {
                        label: "Keyword appears in Main Title",
                        pass: Boolean(
                          editingBlog.target_keyword &&
                            editingBlog.title.toLowerCase().includes(editingBlog.target_keyword.toLowerCase())
                        ),
                      },
                      {
                        label: "Keyword in Meta Title or URL Slug",
                        pass: Boolean(
                          editingBlog.target_keyword &&
                            (editingBlog.meta_title
                              .toLowerCase()
                              .includes(editingBlog.target_keyword.toLowerCase()) ||
                              editingBlog.slug.includes(editingBlog.target_keyword.toLowerCase().replace(/\s+/g, "-")))
                        ),
                      },
                      {
                        label: "Keyword in Meta Description",
                        pass: Boolean(
                          editingBlog.target_keyword &&
                            editingBlog.meta_description
                              .toLowerCase()
                              .includes(editingBlog.target_keyword.toLowerCase())
                        ),
                      },
                      {
                        label: "Article word count depth (>300 words)",
                        pass: editingBlog.content.trim().split(/\s+/).filter(Boolean).length > 300,
                      },
                      {
                        label: "Includes H2 / H3 subheadings",
                        pass: editingBlog.content.includes("## "),
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        {item.pass ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span className={item.pass ? "text-slate-300" : "text-slate-500"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google SERP Live Snippet */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Google SERP Live Snippet</span>
                    </h3>
                    <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSerpDevice("desktop")}
                        className={`px-2 py-0.5 rounded ${
                          serpDevice === "desktop" ? "bg-slate-800 text-white font-bold" : "text-slate-500"
                        }`}
                      >
                        Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setSerpDevice("mobile")}
                        className={`px-2 py-0.5 rounded ${
                          serpDevice === "mobile" ? "bg-slate-800 text-white font-bold" : "text-slate-500"
                        }`}
                      >
                        Mobile
                      </button>
                    </div>
                  </div>

                  {/* Rendered Google SERP Result Card */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-left font-sans text-xs">
                    <div className="flex items-center space-x-2 text-[11px] text-slate-800 mb-1">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                        B
                      </div>
                      <span className="font-semibold text-slate-900">Botock AI</span>
                      <span className="text-slate-400">https://botock.app › blog › {editingBlog.slug || "slug"}</span>
                    </div>

                    <div className="text-base text-blue-800 hover:underline font-medium cursor-pointer line-clamp-1 mb-1">
                      {editingBlog.meta_title || editingBlog.title || "Untitled Guide | Botock AI"}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {editingBlog.meta_description ||
                        editingBlog.excerpt ||
                        "Explore Botock AI free in-browser creative tools..."}
                    </p>
                  </div>

                  {/* Meta Title & Description Inputs */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                        <span>Meta Title</span>
                        <span>{editingBlog.meta_title.length}/60</span>
                      </div>
                      <input
                        type="text"
                        value={editingBlog.meta_title}
                        onChange={(e) => setEditingBlog({ ...editingBlog, meta_title: e.target.value })}
                        placeholder="Google Title Tag"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                        <span>Meta Description</span>
                        <span>{editingBlog.meta_description.length}/160</span>
                      </div>
                      <textarea
                        rows={3}
                        value={editingBlog.meta_description}
                        onChange={(e) => setEditingBlog({ ...editingBlog, meta_description: e.target.value })}
                        placeholder="Snippet description displayed on Google Search..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
