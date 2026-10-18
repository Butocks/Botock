import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Heading2,
  Heading3,
  List,
  ShieldCheck,
  ShieldAlert,
  Mail,
  LogOut,
  Bot,
  Activity,
  XCircle,
  Video,
  Users,
  UserX,
  Upload,
  Copy,
  Flame,
  AlertTriangle,
  Power,
  Image as ImageIcon,
  Share2,
  ExternalLink,
  Layers,
} from "lucide-react";

export type AccessLevel = "all" | "login_only" | "off";

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
  category?: string;
  enabled: boolean;
  access_mode?: AccessLevel; // 'all' (Guest + Login) | 'login_only' (Registered Only) | 'off' (Not Allowed / Off)
  pro_only: boolean;
  maintenance: boolean;
  uses: number;
  errors: number;
  daily_quota?: number;
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
  stack_trace?: string;
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
  // Video Generation Specific Controls (Only Video Gen has daily generation quotas)
  video_gen_access: AccessLevel; // "all" (Guest + Login) | "login_only" | "off"
  video_daily_quota: number; // Single unified daily video quota for Guest or Logged-in user
  // Global Platform Controls
  max_file_size_mb: number;
  forced_model: string;
  global_maintenance: boolean;
  announcement_banner: string;
}

const DEFAULT_WEBSITE_TOOLS: Record<string, ToolConfig> = {
  "video-generator": {
    name: "AI Video Generator Studio",
    category: "AI Video",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
    daily_quota: 5,
  },
  "voice-changer": {
    name: "AI Voice Changer & Cloner",
    category: "AI Audio",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
  "audio-enhance": {
    name: "AI Studio Audio Enhancer",
    category: "AI Audio",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
  "bg-remover": {
    name: "AI Background Remover",
    category: "AI Image",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
  "image-upscaler": {
    name: "4K AI Image Upscaler",
    category: "AI Image",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
  "pdf-to-docx": {
    name: "PDF to Word Converter",
    category: "Document Tools",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
  "pdf-to-excel": {
    name: "PDF to Excel Converter",
    category: "Document Tools",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
  "docx-to-pdf": {
    name: "Word to PDF Converter",
    category: "Document Tools",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
  "pdf-protect": {
    name: "PDF Password Protector",
    category: "Document Tools",
    enabled: true,
    access_mode: "all",
    pro_only: false,
    maintenance: false,
    uses: 0,
    errors: 0,
  },
};

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
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
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
  const [tools, setTools] = useState<Record<string, ToolConfig>>(DEFAULT_WEBSITE_TOOLS);
  const [toolFunnel, setToolFunnel] = useState<ToolFunnelMetric[]>([]);
  const [recentErrors, setRecentErrors] = useState<ToolErrorLog[]>([]);
  const [quotas, setQuotas] = useState<QuotasConfig>({
    video_gen_access: "all",
    video_daily_quota: 5,
    max_file_size_mb: 60,
    forced_model: "auto",
    global_maintenance: false,
    announcement_banner: "",
  });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Trackable Campaign Link Generator States
  const [linkTool, setLinkTool] = useState("video-generator");
  const [linkSource, setLinkSource] = useState("facebook");
  const [linkMedium, setLinkMedium] = useState("social_post");
  const [linkCampaign, setLinkCampaign] = useState("promo_2026");
  const [linkCopied, setLinkCopied] = useState(false);

  // Search, Filter & Modal States
  const [journeyFilter, setJourneyFilter] = useState("all");
  const [errorSearch, setErrorSearch] = useState("");
  const [errorToolFilter, setErrorToolFilter] = useState("all");
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [newToolSlug, setNewToolSlug] = useState("");
  const [newToolName, setNewToolName] = useState("");
  const [newToolCategory, setNewToolCategory] = useState("AI Tools");
  const [toolTestResults, setToolTestResults] = useState<Record<string, string>>({});

  // SEO Blog CMS Form State
  const [editingBlog, setEditingBlog] = useState<BlogPost>({
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
    author: "Ameer Ali",
    reading_time: "4 min read",
    status: "published",
    featured: false,
    views: 0,
  });
  const [isBlogNew, setIsBlogNew] = useState(true);
  const [blogPreviewMode, setBlogPreviewMode] = useState<"edit" | "preview">("edit");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [blogSearch, setBlogSearch] = useState("");

  // Trackable Link Computation
  const generatedTrackingUrl = useMemo(() => {
    const base = "https://botock.app";
    const toolSlug = linkTool === "home" ? "" : `/tools/${linkTool}`;
    const cleanSource = linkSource.trim().toLowerCase();
    const cleanMedium = linkMedium.trim().toLowerCase();
    const cleanCampaign = linkCampaign.trim().toLowerCase().replace(/\s+/g, "_");
    return `${base}${toolSlug}?utm_source=${cleanSource}&utm_medium=${cleanMedium}&utm_campaign=${cleanCampaign}`;
  }, [linkTool, linkSource, linkMedium, linkCampaign]);

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
    setStatusMessage({ type: "info", text: "Syncing live telemetry & configurations..." });
    const cleanHost = resolveHost(targetHost);

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

    if (!sessionToken.trim()) {
      setLoading(false);
      return;
    }

    const client = getClient();
    try {
      const res = await client.get("/api/admin/overview");
      if (res.data?.ok || res.data?.tool_flags) {
        setConnected(true);
        setStatusMessage({ type: "success", text: "Connected! Live metrics synced." });
        setServerStats(res.data.server || {});
        setTelemetry(res.data.user_journeys || []);
        setSourceBreakdown(res.data.source_breakdown || {});

        // Merge default website tools with backend saved flags
        const mergedTools: Record<string, ToolConfig> = { ...DEFAULT_WEBSITE_TOOLS };
        if (res.data.tool_flags) {
          Object.entries(res.data.tool_flags).forEach(([k, v]: [string, any]) => {
            // Filter out old legacy mock tools
            if (k === "image-compress" || k === "ai-video") return;
            const normalizedKey = k === "ai-video-generator" ? "video-generator" : k;
            mergedTools[normalizedKey] = {
              ...(mergedTools[normalizedKey] || {}),
              ...v,
              access_mode:
                v.access_mode || (!v.enabled ? "off" : v.pro_only ? "login_only" : "all"),
            };
          });
        }
        setTools(mergedTools);

        setToolFunnel(res.data.tool_funnel || []);
        setRecentErrors(res.data.recent_errors || []);
        setQuotas((prev) => ({
          ...prev,
          ...(res.data.quotas || {}),
        }));
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

  useEffect(() => {
    if (sessionToken) {
      fetchOverview();
    }
  }, [fetchOverview, sessionToken]);

  // Real-time Traffic Attribution Totals & Ranked Top Sources
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

    const ranked = [
      { name: "Facebook Ads & Shares", key: "facebook", count: fb, color: "bg-blue-500" },
      { name: "Instagram Reels & Bio", key: "instagram", count: insta, color: "bg-pink-500" },
      { name: "AI Engines (ChatGPT/Perplexity)", key: "ai", count: ai, color: "bg-emerald-500" },
      { name: "Google Search & Ads", key: "google", count: google, color: "bg-amber-500" },
      { name: "TikTok & X (Twitter)", key: "social", count: twitter + tiktok, color: "bg-sky-500" },
      { name: "Direct & Bookmarks", key: "direct", count: direct, color: "bg-indigo-500" },
    ].sort((a, b) => b.count - a.count);

    return {
      fb,
      insta,
      ai,
      google,
      twitter,
      tiktok,
      direct,
      referral,
      total: Math.max(total, 1),
      ranked,
    };
  }, [sourceBreakdown]);

  // Top Most Used Tools & Highest Error Tools Ranking (Strictly Real Numbers, No Doubling)
  const toolRankings = useMemo(() => {
    const list = Object.entries(tools).map(([id, cfg]) => {
      const funnelMatch = toolFunnel.find(
        (f) => f.tool_id === id || (id === "video-generator" && (f.tool_id === "ai-video" || f.tool_id === "ai-video-generator"))
      );
      // Strictly real executions, zero artificial addition
      const uses = funnelMatch ? funnelMatch.success : (cfg.uses || 0);
      const errors = funnelMatch ? funnelMatch.errors : (cfg.errors || 0);
      return {
        id,
        name: cfg.name || id,
        uses,
        errors,
        errorRate: uses + errors > 0 ? Math.round((errors / (uses + errors)) * 100) : 0,
      };
    });

    const mostUsed = [...list].sort((a, b) => b.uses - a.uses);
    const mostErrors = [...list].sort((a, b) => b.errors - a.errors);
    const maxUses = Math.max(...mostUsed.map((t) => t.uses), 1);
    const maxErrors = Math.max(...mostErrors.map((t) => t.errors), 1);

    return { mostUsed, mostErrors, maxUses, maxErrors };
  }, [tools, toolFunnel]);

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
    return {
      totalViews,
      totalStarted,
      totalSuccess,
      totalErrors,
      totalAbandoned,
      overallSuccessRate,
    };
  }, [toolFunnel]);

  // Filtered Journeys
  const filteredJourneys = useMemo(() => {
    if (journeyFilter === "all") return telemetry;
    return telemetry.filter((j) => {
      if (journeyFilter === "facebook") return j.utm_source === "facebook";
      if (journeyFilter === "instagram") return j.utm_source === "instagram";
      if (journeyFilter === "ai") return j.utm_source.startsWith("ai_");
      if (journeyFilter === "google") return j.utm_source.includes("google");
      if (journeyFilter === "direct")
        return j.utm_source === "direct" || j.utm_source === "organic";
      return true;
    });
  }, [telemetry, journeyFilter]);

  // Filtered Error Logs
  const filteredErrors = useMemo(() => {
    return recentErrors.filter((e) => {
      if (errorToolFilter !== "all" && e.tool_id !== errorToolFilter) return false;
      if (!errorSearch.trim()) return true;
      const q = errorSearch.toLowerCase();
      return (
        e.tool_name.toLowerCase().includes(q) ||
        e.tool_id.toLowerCase().includes(q) ||
        e.error_message.toLowerCase().includes(q) ||
        (e.ip && e.ip.includes(q))
      );
    });
  }, [recentErrors, errorSearch, errorToolFilter]);

  // SEO Score Auditor
  const seoScore = useMemo(() => {
    let score = 0;
    const kw = editingBlog.target_keyword.trim().toLowerCase();
    if (!kw) return 20;
    score += 10;
    if (editingBlog.title.toLowerCase().includes(kw)) score += 15;
    if (editingBlog.meta_title.toLowerCase().includes(kw)) score += 15;
    if (editingBlog.meta_description.toLowerCase().includes(kw)) score += 15;
    if (editingBlog.content.toLowerCase().includes(kw)) score += 15;
    const words = editingBlog.content.trim().split(/\s+/).filter(Boolean).length;
    if (words > 250) score += 10;
    if (words > 600) score += 10;
    if (editingBlog.content.includes("## ")) score += 5;
    if (editingBlog.content.includes("](/tools/")) score += 5;
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
        setLoginStep("otp");
        setOtpCode("");
        setStatusMessage({
          type: "info",
          text:
            res.data?.message ||
            `6-digit verification code dispatched to ${adminEmail.trim()} via Zoho Mail.`,
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
        await axios
          .post(
            `${cleanHost}/api/admin/auth/logout`,
            {},
            { headers: { "x-admin-token": sessionToken }, timeout: 4000 }
          )
          .catch(() => {});
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

  // Update Any Tool Configuration (Access Level, Enabled, Maintenance)
  const handleUpdateToolConfig = async (toolId: string, updates: Partial<ToolConfig>) => {
    const currentTool = tools[toolId] || {
      name: toolId,
      enabled: true,
      access_mode: "all",
      pro_only: false,
      maintenance: false,
      uses: 0,
      errors: 0,
    };

    // Synchronize enabled & pro_only flags with access_mode for backward compatibility
    const syncedUpdates: Partial<ToolConfig> = { ...updates };
    if (updates.access_mode) {
      syncedUpdates.enabled = updates.access_mode !== "off";
      syncedUpdates.pro_only = updates.access_mode === "login_only";
    } else if (updates.enabled !== undefined) {
      syncedUpdates.access_mode = updates.enabled ? "all" : "off";
    }

    const updatedLocal = {
      ...tools,
      [toolId]: { ...currentTool, ...syncedUpdates },
    };
    setTools(updatedLocal);

    const client = getClient();
    try {
      const res = await client.post("/api/admin/tool-flags", {
        tool_id: toolId,
        updates: { ...currentTool, ...syncedUpdates },
      });
      if (toolId === "video-generator") {
        client.post("/api/admin/tool-flags", {
          tool_id: "ai-video-generator",
          updates: { ...currentTool, ...syncedUpdates },
        }).catch(() => {});
      }
      if (res.data?.ok) {
        setStatusMessage({ type: "success", text: `Updated ${currentTool.name} configuration on server.` });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to update tool on server.",
      });
    }
  };

  // Live Test Tool Access / Block on Backend
  const handleTestToolAccess = async (toolId: string) => {
    const cleanHost = resolveHost(targetHost);
    setToolTestResults((prev) => ({ ...prev, [toolId]: "Testing block..." }));

    let testEndpoint = `${cleanHost}/api/convert/text-to-speech`;
    if (toolId === "video-generator") testEndpoint = `${cleanHost}/api/video/generate`;
    else if (toolId === "bg-remover") testEndpoint = `${cleanHost}/api/remove-bg`;
    else if (toolId === "image-upscaler") testEndpoint = `${cleanHost}/api/image/generate`;
    else if (toolId.startsWith("pdf-")) testEndpoint = `${cleanHost}/api/convert/${toolId}`;

    try {
      const res = await axios.post(testEndpoint, {}, { timeout: 4000 });
      if (res.status === 200) {
        setToolTestResults((prev) => ({
          ...prev,
          [toolId]: "🟢 Tool is LIVE & Accessible.",
        }));
      }
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message;
      if (status === 403) {
        setToolTestResults((prev) => ({
          ...prev,
          [toolId]: `🔴 Verified BLOCKED (403): ${detail}`,
        }));
      } else if (status === 503) {
        setToolTestResults((prev) => ({
          ...prev,
          [toolId]: `🚧 Verified MAINTENANCE (503): ${detail}`,
        }));
      } else if (status === 401) {
        setToolTestResults((prev) => ({
          ...prev,
          [toolId]: `🔐 Verified LOGIN REQUIRED (401): ${detail}`,
        }));
      } else {
        setToolTestResults((prev) => ({
          ...prev,
          [toolId]: `⚡ Server Response (${status}): ${detail}`,
        }));
      }
    }
  };

  // Bulk Turn All Tools ON or OFF
  const handleBulkToggleAllTools = async (enableAll: boolean) => {
    const mode: AccessLevel = enableAll ? "all" : "off";
    const client = getClient();
    const nextTools: Record<string, ToolConfig> = {};
    for (const [id, cfg] of Object.entries(tools)) {
      nextTools[id] = { ...cfg, enabled: enableAll, access_mode: mode, pro_only: false };
      client
        .post("/api/admin/tool-flags", {
          tool_id: id,
          updates: nextTools[id],
        })
        .catch(() => {});
    }
    setTools(nextTools);
    setStatusMessage({
      type: "success",
      text: enableAll ? "All website tools switched ON!" : "All website tools switched OFF!",
    });
  };

  // Register a New Website Tool into Admin Control
  const handleAddNewTool = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = newToolSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!cleanSlug || !newToolName.trim()) return;

    await handleUpdateToolConfig(cleanSlug, {
      name: newToolName.trim(),
      category: newToolCategory,
      enabled: true,
      access_mode: "all",
      pro_only: false,
      maintenance: false,
      uses: 0,
      errors: 0,
    });
    setNewToolSlug("");
    setNewToolName("");
  };

  // Save Quotas Configuration (Video Gen Access & Single Video Quota)
  const handleSaveQuotas = async (overrideQuotas?: QuotasConfig) => {
    const payload = overrideQuotas || quotas;
    const client = getClient();
    try {
      const res = await client.post("/api/admin/quotas", payload);
      await handleUpdateToolConfig("video-generator", {
        access_mode: payload.video_gen_access,
        enabled: payload.video_gen_access !== "off",
        pro_only: payload.video_gen_access === "login_only",
        daily_quota: payload.video_daily_quota,
      });
      if (res.data?.ok) {
        setStatusMessage({
          type: "success",
          text: "Video Generation Access, Single Daily Video Quota & Limits saved!",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to save quotas.",
      });
    }
  };

  // Clear Error Logs
  const handleClearErrors = async () => {
    const client = getClient();
    try {
      await client.post("/api/admin/errors/clear", {});
      setRecentErrors([]);
      setStatusMessage({ type: "success", text: "Cleared error inspector logs permanently." });
    } catch {
      setRecentErrors([]);
      setStatusMessage({ type: "info", text: "Error logs cleared locally." });
    }
  };

  // SEO Blog CMS Handlers
  const handleSelectBlog = (blog: BlogPost) => {
    setEditingBlog({ ...blog });
    setIsBlogNew(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      author: "Ameer Ali",
      reading_time: "4 min read",
      status: "published",
      featured: false,
      views: 0,
    });
    setIsBlogNew(true);
  };

  // Local Cover Image Upload to Base64 Data URL
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Cover image must be under 2MB for optimal performance." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditingBlog((prev) => ({ ...prev, cover_image: reader.result as string }));
        setStatusMessage({ type: "success", text: "Cover image loaded into article!" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBlog = async () => {
    if (!editingBlog.title.trim() || !editingBlog.slug.trim()) {
      setStatusMessage({ type: "error", text: "Blog title and URL slug are required." });
      return;
    }

    const words = editingBlog.content.trim().split(/\s+/).filter(Boolean).length;
    const computedReadingTime = `${Math.max(1, Math.round(words / 200))} min read`;
    const payload = { ...editingBlog, reading_time: computedReadingTime };

    const client = getClient();
    try {
      const res = await client.post("/api/admin/blogs/save", payload);
      if (res.data?.ok) {
        setBlogs(res.data.blogs || []);
        setIsBlogNew(false);
        setStatusMessage({
          type: "success",
          text: `Article "${editingBlog.title}" (${editingBlog.status}) saved to botock.app/blog/${editingBlog.slug}!`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to save blog post.",
      });
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to permanently delete this article from your website?")) return;
    const client = getClient();
    try {
      const res = await client.post("/api/admin/blogs/delete", { id: blogId });
      if (res.data?.ok) {
        setBlogs(res.data.blogs || []);
        if (editingBlog.id === blogId) handleNewBlog();
        setStatusMessage({ type: "success", text: "Article deleted from publication." });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to delete article.",
      });
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("blog-content-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    const newText = before + prefix + (selected || "") + suffix + after;
    setEditingBlog({ ...editingBlog, content: newText });
    setTimeout(() => {
      textarea.focus();
    }, 50);
  };

  // ===========================================================================
  // 🔐 GATE SCREEN (WHEN NOT AUTHENTICATED)
  // ===========================================================================
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
            <p className="text-xs text-slate-400">RESTRICTED GATE • ZERO-BACKDOOR ACCESS</p>
          </div>

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
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Admin Email</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter Admin Email"
                    required
                    className="w-full bg-transparent border-none outline-none text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Admin Password / Secret
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                  <Lock className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                  <input
                    type={showSecret ? "text" : "password"}
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Enter Password"
                    required
                    className="w-full bg-transparent border-none outline-none text-slate-100 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-slate-400 hover:text-slate-200 ml-2 cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center space-x-2">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-400">Device Status:</span>
                </div>
                <span
                  className={
                    isTrustedDevice
                      ? "text-emerald-400 font-semibold"
                      : "text-amber-400 font-semibold"
                  }
                >
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
            <form onSubmit={handleOtpSubmit} autoComplete="off" className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-slate-300 leading-relaxed text-[11px]">
                <strong className="text-indigo-400 block mb-0.5">🔐 New Device Detected!</strong>A
                6-digit one-time code has been dispatched via Zoho Mail to{" "}
                <strong>{adminEmail}</strong>.
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.trim())}
                  placeholder="• • • • • •"
                  required
                  autoFocus
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
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={authLoading || otpCode.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{authLoading ? "Verifying..." : "Verify & Unlock"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 🖥️ AUTHENTICATED COMMAND CENTER INTERFACE
  // ===========================================================================
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
                  V4.2 LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Trackable Links • Video Quota & Tool Enforcement • Error Inspector • Flexible Blog CMS
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
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

            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold text-[11px]">
                {adminEmail || "Master Admin"}
              </span>
            </div>

            <button
              onClick={() => fetchOverview()}
              disabled={loading}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow cursor-pointer ${
                connected
                  ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{connected ? "Sync Live" : "Connect"}</span>
            </button>

            <button
              onClick={() => handleLogout()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition shadow cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
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
              <span className="hidden lg:inline text-slate-400 font-mono text-[10px]">
                ⚡ CPU: {serverStats.cpu_percent}% | RAM: {serverStats.memory_percent}%
              </span>
            )}

            <span className="hidden sm:inline text-indigo-400 font-semibold">
              🎬 Video Quota:{" "}
              {quotas.video_gen_access === "all"
                ? `Guests + Login (${quotas.video_daily_quota}/day)`
                : quotas.video_gen_access === "login_only"
                ? `Login Users Only (${quotas.video_daily_quota}/day)`
                : "🔴 Video Tool OFF"}
            </span>
          </div>

          {statusMessage && (
            <div
              className={`flex items-center space-x-1 text-[11px] font-medium ${
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

        {/* 📑 TAB NAVIGATION BAR */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar border-t border-slate-800 text-xs">
          {[
            { id: "journeys", label: "Live Traffic & Link Generator", icon: Compass, count: telemetry.length },
            { id: "funnel", label: "Most Used Tools & Error Inspector", icon: Activity, count: recentErrors.length },
            { id: "tools", label: "Website Tools ON/OFF Switches", icon: Sliders, count: Object.keys(tools).length },
            { id: "quotas", label: "Video Quota & Global Limits", icon: Gauge },
            { id: "cms", label: "SEO Blog CMS & Builder", icon: FileText, count: blogs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
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
        {/* TAB 1: LIVE TRAFFIC SOURCES, LINK GENERATOR & USER JOURNEYS           */}
        {/* ==================================================================== */}
        {activeTab === "journeys" && (
          <div className="space-y-6">
            {/* 🔗 FEATURED: TRACKABLE CAMPAIGN LINK GENERATOR */}
            <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-sky-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Trackable Campaign Link Generator</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                      Real-time Attribution
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300">
                    Generate custom tracking links for Facebook Ads, Instagram Bio/Reels, TikTok, or WhatsApp. When users click this link, their visits and tool runs will automatically show under that platform in the live cards below!
                  </p>
                </div>
              </div>

              {/* Link Builder Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Target Page / Tool</label>
                  <select
                    value={linkTool}
                    onChange={(e) => setLinkTool(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="video-generator">🎬 AI Video Generator</option>
                    <option value="voice-changer">🎙️ AI Voice Studio & Cloner</option>
                    <option value="audio-enhance">🎧 AI Audio Enhancer</option>
                    <option value="bg-remover">🪄 AI Background Remover</option>
                    <option value="image-upscaler">🖼️ 4K AI Image Upscaler</option>
                    <option value="pdf-to-docx">📄 PDF to Word Converter</option>
                    <option value="pdf-to-excel">📊 PDF to Excel Converter</option>
                    <option value="docx-to-pdf">📝 Word to PDF Converter</option>
                    <option value="pdf-protect">🔒 PDF Password Protector</option>
                    <option value="home">🏠 Botock Home Page</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Source Platform</label>
                  <select
                    value={linkSource}
                    onChange={(e) => setLinkSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="facebook">Facebook (Ads / Post / Groups)</option>
                    <option value="instagram">Instagram (Reels / Bio Link / Stories)</option>
                    <option value="tiktok">TikTok (Bio / Comments / Ads)</option>
                    <option value="whatsapp">WhatsApp (Direct / Groups / Channel)</option>
                    <option value="youtube">YouTube (Video Description / Short)</option>
                    <option value="google_ads">Google Ads (Search / Display)</option>
                    <option value="twitter_x">Twitter / X</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Placement / Medium</label>
                  <select
                    value={linkMedium}
                    onChange={(e) => setLinkMedium(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="social_post">Social Post / Reel</option>
                    <option value="bio_link">Bio Profile Link</option>
                    <option value="paid_ad">Paid Sponsored Ad</option>
                    <option value="dm_share">Direct Message / WhatsApp</option>
                    <option value="comment_reply">Comment Reply</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Campaign Identifier</label>
                  <input
                    type="text"
                    value={linkCampaign}
                    onChange={(e) => setLinkCampaign(e.target.value)}
                    placeholder="e.g. promo_march, reel_1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* Generated URL Display & Copy */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-indigo-500/30">
                <input
                  type="text"
                  readOnly
                  value={generatedTrackingUrl}
                  className="flex-1 bg-transparent border-none text-indigo-300 font-mono text-xs outline-none select-all px-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedTrackingUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{linkCopied ? "Copied!" : "Copy Trackable Link"}</span>
                </button>
              </div>
            </div>

            {/* Top 6 Channel Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span>Where Are Users Coming From? (Live Traffic Attribution)</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  Total Tracked Visits: {trafficTotals.total}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 shadow bg-gradient-to-b from-emerald-500/5 to-transparent">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
                    <span>AI Search</span>
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300">{trafficTotals.ai}</div>
                  <div className="text-[10px] text-slate-400 mt-1">ChatGPT / Perplexity</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                    <span>Google</span>
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black text-white">{trafficTotals.google}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Organic & Ads</div>
                </div>

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

            {/* Quick Intelligence Grid: Top Sources + Top Used Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Traffic Sources Bar Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Highest Traffic Acquisition Ranking
                </h3>
                <div className="space-y-2.5">
                  {trafficTotals.ranked.map((ch) => {
                    const pct = Math.round((ch.count / trafficTotals.total) * 100);
                    return (
                      <div key={ch.key} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-200">{ch.name}</span>
                          <span className="font-mono text-slate-400">
                            {ch.count} visits ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${ch.color}`}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Most Used Tools & Hotspots */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Tool Execution Ranking
                </h3>
                <div className="space-y-2.5">
                  {toolRankings.mostUsed.slice(0, 6).map((t) => {
                    const widthPct = Math.round((t.uses / toolRankings.maxUses) * 100);
                    return (
                      <div key={t.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{t.name}</span>
                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className="text-emerald-400 font-bold">{t.uses} uses</span>
                            <span
                              className={
                                t.errors > 0 ? "text-rose-400 font-bold" : "text-slate-500"
                              }
                            >
                              {t.errors} errors
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                            style={{ width: `${Math.max(widthPct, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
                    Exact step-by-step page path of each user from entry to tool execution
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 text-xs">
                  {["all", "facebook", "instagram", "ai", "google", "direct"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setJourneyFilter(f)}
                      className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition cursor-pointer ${
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
                      <th className="py-3 px-4">Campaign Tag</th>
                      <th className="py-3 px-4">Navigation Flow Path</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredJourneys.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                          No clickstream visits recorded yet. Share your trackable links to see live visitors!
                        </td>
                      </tr>
                    ) : (
                      filteredJourneys.map((j, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200 font-sans">
                              {j.user_email}
                            </div>
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
                          <td className="py-3 px-4 text-indigo-300 text-[11px]">
                            {j.utm_campaign && j.utm_campaign !== "none" ? j.utm_campaign : "—"}
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
                                <span className="text-slate-500">/</span>
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
        {/* TAB 2: MOST USED TOOLS, FUNNEL & REAL-TIME ERROR INSPECTOR            */}
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
                <div className="text-2xl font-extrabold text-indigo-300">
                  {funnelSummary.totalStarted}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Typed prompt or uploaded</div>
              </div>

              <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-4 shadow">
                <div className="text-xs text-emerald-400 font-medium mb-1">Completed (Success)</div>
                <div className="text-2xl font-extrabold text-emerald-300">
                  {funnelSummary.totalSuccess}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Overall Success: {funnelSummary.overallSuccessRate}%
                </div>
              </div>

              <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4 shadow">
                <div className="text-xs text-amber-400 font-medium mb-1">Abandoned (Drop-offs)</div>
                <div className="text-2xl font-extrabold text-amber-300">
                  {funnelSummary.totalAbandoned}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Left without generating</div>
              </div>

              <div className="bg-slate-900 border border-rose-500/20 rounded-xl p-4 shadow">
                <div className="text-xs text-rose-400 font-medium mb-1">Failed (Errors)</div>
                <div className="text-2xl font-extrabold text-rose-300">
                  {funnelSummary.totalErrors}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Logged in Error Console</div>
              </div>
            </div>

            {/* Dual Leaderboards: Most Used Tools vs Most Failing Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Most Used Tools Leaderboard
                </h3>
                <div className="space-y-2">
                  {toolRankings.mostUsed.map((t, i) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center">
                          #{i + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{t.name}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">{t.uses} runs</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Tools With Highest Errors (Needs Attention)
                </h3>
                <div className="space-y-2">
                  {toolRankings.mostErrors.map((t, i) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold flex items-center justify-center">
                          #{i + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-500 text-[11px]">
                          Fail Rate: {t.errorRate}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            t.errors > 0
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {t.errors} errors
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Error Inspector Console */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Real-Time Tool Error Inspector & Stack Trace Console</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Exact reason, endpoint, and stack message whenever any user hits an error
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={errorToolFilter}
                    onChange={(e) => setErrorToolFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="all">All Tools ({recentErrors.length})</option>
                    {Object.entries(tools).map(([id, cfg]) => (
                      <option key={id} value={id}>
                        {cfg.name}
                      </option>
                    ))}
                  </select>

                  <div className="relative w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={errorSearch}
                      onChange={(e) => setErrorSearch(e.target.value)}
                      placeholder="Search error, tool, IP..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  {recentErrors.length > 0 && (
                    <button
                      onClick={handleClearErrors}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-[420px] overflow-y-auto font-mono text-xs">
                {filteredErrors.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-sans">
                    ✨ Zero errors matching filter! All tools operating smoothly.
                  </div>
                ) : (
                  filteredErrors.map((err) => (
                    <div key={err.id} className="p-4 hover:bg-slate-800/30 transition space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 font-sans font-semibold">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                            {err.tool_name}
                          </span>
                          <span className="text-slate-400 text-[11px]">(/tools/{err.tool_id})</span>
                          {err.user_email && (
                            <span className="text-indigo-300 text-[11px]">
                              User: {err.user_email}
                            </span>
                          )}
                          {err.ip && (
                            <span className="text-slate-500 text-[10px]">IP: {err.ip}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-sans">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${err.tool_name}: ${err.error_message}\n${err.stack_trace || ""}`
                              );
                              setStatusMessage({
                                type: "info",
                                text: "Copied error details to clipboard.",
                              });
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(err.timestamp).toLocaleTimeString()} •{" "}
                            {new Date(err.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div
                        onClick={() =>
                          setExpandedErrorId(expandedErrorId === err.id ? null : err.id)
                        }
                        className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/20 text-rose-300 text-xs font-mono leading-relaxed break-all cursor-pointer"
                      >
                        {err.error_message}
                        {err.stack_trace && (
                          <div className="text-[10px] text-slate-400 mt-1 underline">
                            {expandedErrorId === err.id
                              ? "Hide Stack Trace ▲"
                              : "Click to view full stack trace ▼"}
                          </div>
                        )}
                        {expandedErrorId === err.id && err.stack_trace && (
                          <pre className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap">
                            {err.stack_trace}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: WEBSITE TOOLS ON/OFF SWITCHES & VIDEO GEN ACCESS CONTROL       */}
        {/* ==================================================================== */}
        {activeTab === "tools" && (
          <div className="space-y-6">
            {/* 🎬 FEATURED MASTER CARD: AI VIDEO GENERATION ACCESS & SINGLE QUOTA */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-white">
                        AI Video Generation Master Controller
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Priority Control
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Choose who is allowed to generate AI videos (Guest + Login, Login Only, or Off) and set the single daily video quota.
                    </p>
                  </div>
                </div>

                {/* Unified Single Daily Video Quota Input */}
                <div className="flex items-center gap-3 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Daily Video Quota (Per User)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Single daily limit for Guest or Logged-in user
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={quotas.video_daily_quota}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setQuotas({ ...quotas, video_daily_quota: val });
                    }}
                    className="w-20 bg-slate-900 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white text-center outline-none"
                  />
                  <button
                    onClick={() => handleSaveQuotas()}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* 3-Way Access Selector for Video Generation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    id: "all" as AccessLevel,
                    title: "🟢 Allowed: Guests + Login Users",
                    desc: "Everyone can generate AI videos up to the daily video quota",
                    icon: Globe,
                    activeClass:
                      "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10",
                  },
                  {
                    id: "login_only" as AccessLevel,
                    title: "🔐 Allowed: Login Users Only",
                    desc: "Guests are prompted to sign in; logged-in users get the daily quota",
                    icon: Users,
                    activeClass:
                      "border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-lg shadow-indigo-500/10",
                  },
                  {
                    id: "off" as AccessLevel,
                    title: "🔴 Not Allowed (Video Tool OFF)",
                    desc: "Completely disables AI Video Generation across the website",
                    icon: UserX,
                    activeClass:
                      "border-rose-500 bg-rose-500/15 text-rose-300 shadow-lg shadow-rose-500/10",
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = quotas.video_gen_access === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const updated = { ...quotas, video_gen_access: opt.id };
                        setQuotas(updated);
                        handleSaveQuotas(updated);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? opt.activeClass
                          : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{opt.title}</span>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <p className="text-[11px] opacity-80 leading-relaxed">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Website All Tools Header + Bulk Switches + Add Tool Form */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <span>All Website Tools Master Switchboard ({Object.keys(tools).length} Tools)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Turn any tool ON/OFF, restrict to Logged-in Users only, or enable Maintenance mode
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleBulkToggleAllTools(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" /> Turn All Tools ON
                </button>
                <button
                  onClick={() => handleBulkToggleAllTools(false)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" /> Turn All Tools OFF
                </button>
              </div>
            </div>

            {/* Add New Website Tool Bar */}
            <form
              onSubmit={handleAddNewTool}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center gap-3 text-xs"
            >
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-400" /> Register New Website Tool:
              </span>
              <input
                type="text"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                placeholder="Tool Name (e.g. AI Music Generator)"
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none"
              />
              <input
                type="text"
                value={newToolSlug}
                onChange={(e) => setNewToolSlug(e.target.value)}
                placeholder="Slug (e.g. ai-music)"
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-indigo-300 font-mono outline-none"
              />
              <select
                value={newToolCategory}
                onChange={(e) => setNewToolCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none"
              >
                <option value="AI Video">AI Video</option>
                <option value="AI Audio">AI Audio</option>
                <option value="AI Image">AI Image</option>
                <option value="Document Tools">Document Tools</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
              >
                + Add Tool to Switchboard
              </button>
            </form>

            {/* All Website Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tools).map(([id, t]) => {
                const accessMode: AccessLevel =
                  t.access_mode || (!t.enabled ? "off" : t.pro_only ? "login_only" : "all");

                return (
                  <div
                    key={id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                      t.maintenance
                        ? "bg-amber-950/20 border-amber-500/40"
                        : accessMode === "off"
                        ? "bg-slate-900/40 border-rose-500/30 opacity-75"
                        : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {t.category || "Website Tool"}
                        </span>
                        <h3 className="font-bold text-sm text-slate-100">{t.name}</h3>
                        <div className="text-[11px] text-slate-500 font-mono">/tools/{id}</div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          t.maintenance
                            ? "bg-amber-500/20 text-amber-300"
                            : accessMode === "all"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : accessMode === "login_only"
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {t.maintenance
                          ? "🚧 Maintenance"
                          : accessMode === "all"
                          ? "🟢 Guests + Login"
                          : accessMode === "login_only"
                          ? "🔐 Login Only"
                          : "🔴 Tool OFF"}
                      </span>
                    </div>

                    {/* 3-Button Access Mode Switcher per Tool */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Allowed Access Level:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleUpdateToolConfig(id, { access_mode: "all" })}
                          className={`py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                            accessMode === "all"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          Guest+Login
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateToolConfig(id, { access_mode: "login_only" })}
                          className={`py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                            accessMode === "login_only"
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          Login Only
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateToolConfig(id, { access_mode: "off" })}
                          className={`py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                            accessMode === "off"
                              ? "bg-rose-600 text-white"
                              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          Turn OFF
                        </button>
                      </div>
                    </div>

                    {/* Live Test Block Button & Result */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestToolAccess(id)}
                        className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-800 transition cursor-pointer flex items-center gap-1"
                      >
                        <span>⚡ Test Block on Server</span>
                      </button>
                      {toolTestResults[id] && (
                        <span className="text-[10px] font-mono truncate max-w-[170px]" title={toolTestResults[id]}>
                          {toolTestResults[id]}
                        </span>
                      )}
                    </div>

                    {/* Footer Stats & Maintenance Toggle */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="font-mono text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-bold">{t.uses || 0}</span> uses •{" "}
                        <span className="text-rose-400 font-bold">{t.errors || 0}</span> err
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateToolConfig(id, { maintenance: !t.maintenance })
                        }
                        className={`py-1 px-2.5 rounded-lg font-semibold flex items-center space-x-1 transition text-[11px] cursor-pointer ${
                          t.maintenance
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{t.maintenance ? "Maintenance ON" : "Maintenance OFF"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: VIDEO QUOTA & GLOBAL PLATFORM SETTINGS                         */}
        {/* ==================================================================== */}
        {activeTab === "quotas" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-1">
                  <Gauge className="w-5 h-5 text-indigo-400" />
                  <span>AI Video Generation Quota & Platform Settings</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage AI Video Generation permissions and unified daily video quota (Other tools are controlled via ON/OFF switchboard)
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Video Generation Access Mode */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <div>
                    <div className="font-bold text-indigo-300">
                      🎬 AI Video Generation Allowed To
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Control whether Guests, Logged-in users, or No One can generate AI videos
                    </div>
                  </div>
                  <select
                    value={quotas.video_gen_access}
                    onChange={(e) =>
                      setQuotas({
                        ...quotas,
                        video_gen_access: e.target.value as AccessLevel,
                      })
                    }
                    className="bg-slate-950 border border-indigo-500/40 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    <option value="all">🟢 Guests + Logged-in Users (Allowed)</option>
                    <option value="login_only">🔐 Logged-in Users Only</option>
                    <option value="off">🔴 Not Allowed (Video Tool OFF)</option>
                  </select>
                </div>

                {/* Single Unified Daily Video Quota */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <div>
                    <div className="font-bold text-indigo-300">
                      🎬 Single Daily Video Generation Quota
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Unified daily video limit applied per user (Guest or Logged-in)
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={quotas.video_daily_quota}
                    onChange={(e) =>
                      setQuotas({
                        ...quotas,
                        video_daily_quota: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-24 bg-slate-950 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-white font-mono font-bold text-right"
                  />
                </div>

                {/* Max File Size */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Maximum Upload Size (MB)</div>
                    <div className="text-slate-500 text-[11px]">
                      Enforced on audio, video and document uploads
                    </div>
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
                    placeholder="e.g. 🚀 Welcome to Botock Creative Suite! Enjoy free AI tools."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Global Maintenance Switch */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Emergency Global Maintenance Mode</div>
                    <div className="text-slate-500 text-[11px]">
                      Lock entire website and display maintenance notice on all tools
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setQuotas({ ...quotas, global_maintenance: !quotas.global_maintenance })
                    }
                    className={`px-4 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      quotas.global_maintenance
                        ? "bg-rose-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {quotas.global_maintenance ? "Active (Locked)" : "Off (Live)"}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleSaveQuotas()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-2 text-xs shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Video Rules & Limits</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: FLEXIBLE SEO BLOG STUDIO & PUBLISHER                          */}
        {/* ==================================================================== */}
        {activeTab === "cms" && (
          <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Enterprise SEO Blog Studio & Live Publisher</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Create, design sections, upload pictures, audit Google SERP rankings, and publish directly to botock.app/blog
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleNewBlog}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Write New Article</span>
                </button>
              </div>
            </div>

            {/* Main CMS Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Columns: Dynamic Blog Section Builder */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
                  {/* Active Edit Mode Banner */}
                  {!isBlogNew && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-indigo-300 font-bold">
                          Editing Article: &ldquo;{editingBlog.title}&rdquo;
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleNewBlog()}
                          className="text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
                        >
                          Cancel / New
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(editingBlog.id)}
                          className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Article</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Article Main Headline (H1) *
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
                          meta_title: isBlogNew
                            ? `${newTitle} | Botock AI`
                            : editingBlog.meta_title,
                        });
                      }}
                      placeholder="e.g. Complete Guide to Creating AI Voiceovers & Video in 2026"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Slug, Category & Author */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        URL Slug (/blog/...)
                      </label>
                      <input
                        type="text"
                        value={editingBlog.slug}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, slug: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={editingBlog.category}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, category: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="AI Audio Tutorials">AI Audio Tutorials</option>
                        <option value="AI Video & Animation">AI Video & Animation</option>
                        <option value="PDF & Document Guides">PDF & Document Guides</option>
                        <option value="AI Image & Design">AI Image & Design</option>
                        <option value="Product Updates">Product Updates</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={editingBlog.author}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, author: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Featured Cover Image File Upload or URL */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                        Featured Main Cover Image (File Upload or URL)
                      </label>
                      <label className="cursor-pointer px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1.5 transition">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Cover Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editingBlog.cover_image}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, cover_image: e.target.value })
                        }
                        placeholder="https://botock.app/og-image.jpg"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                      />
                      {editingBlog.cover_image && (
                        <img
                          src={editingBlog.cover_image}
                          alt="Cover preview"
                          className="w-16 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  {/* Short Card Excerpt */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Article Summary / Excerpt (Shown on /blog listing)
                    </label>
                    <textarea
                      rows={2}
                      value={editingBlog.excerpt}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          excerpt: e.target.value,
                          meta_description:
                            editingBlog.meta_description || e.target.value,
                        })
                      }
                      placeholder="Engaging 2-sentence summary that hooks Google and website visitors..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  {/* Dynamic Visual Section & Block Builder Toolbar */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Flexible Content Builder (Click to Insert Sections)
                      </span>

                      <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setBlogPreviewMode("edit")}
                          className={`px-2.5 py-1 rounded cursor-pointer ${
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
                          className={`px-2.5 py-1 rounded cursor-pointer ${
                            blogPreviewMode === "preview"
                              ? "bg-indigo-600 text-white font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          Live Preview
                        </button>
                      </div>
                    </div>

                    {/* Section Builder Quick Insert Palette */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n\n## Section Title Here\n\nWrite your section explanation...")}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Heading2 className="w-3.5 h-3.5 text-indigo-400" /> + H2 Header
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n\n### Sub-heading Here\n\n")}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Heading3 className="w-3.5 h-3.5 text-sky-400" /> + H3 Subhead
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt("Enter Image URL (or paste image link):", "https://botock.app/og-image.jpg");
                          if (url) {
                            const caption = prompt("Enter Image Caption / Description:", "Step illustration") || "Image";
                            insertMarkdown(`\n\n![${caption}](${url})\n*Caption: ${caption}*\n\n`);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> + Insert Picture
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n\n> 💡 **Key Pro-Tip:** Write an important tip or highlight for your readers here.\n\n")}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> + Callout Tip
                      </button>

                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n\n1. **Step 1:** Upload your reference file\n2. **Step 2:** Select your preferred AI settings\n3. **Step 3:** Click generate to download your result\n\n")}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <List className="w-3.5 h-3.5 text-indigo-400" /> + Step Guide
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertMarkdown(
                            "\n\n### 🎙️ Try Botock AI Voice Studio Free\n[Launch AI Voice Changer & Cloner →](/tools/voice-changer)\n\n"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/30 cursor-pointer"
                      >
                        + Voice CTA Box
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertMarkdown(
                            "\n\n### 🎬 Create Cinematic AI Videos Free\n[Launch Botock AI Video Studio →](/tools/video-generator)\n\n"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 cursor-pointer"
                      >
                        + Video CTA Box
                      </button>
                    </div>

                    {/* Editor / Live Preview Display */}
                    {blogPreviewMode === "edit" ? (
                      <textarea
                        id="blog-content-editor"
                        rows={16}
                        value={editingBlog.content}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, content: e.target.value })
                        }
                        placeholder="Design your article using the buttons above or write in Markdown..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-xs font-mono text-slate-200 outline-none leading-relaxed focus:border-indigo-500"
                      />
                    ) : (
                      <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-5 min-h-[380px] space-y-4">
                        {editingBlog.cover_image && (
                          <img
                            src={editingBlog.cover_image}
                            alt=""
                            className="w-full h-48 object-cover rounded-xl border border-slate-800 shadow-md"
                          />
                        )}
                        <h1 className="text-xl font-extrabold text-white">{editingBlog.title || "Your Headline Will Appear Here"}</h1>
                        <div className="text-xs text-slate-400 pb-3 border-b border-slate-800 flex items-center justify-between">
                          <span>By {editingBlog.author} • {editingBlog.category}</span>
                          <span className="text-indigo-400 font-mono">{editingBlog.reading_time || "4 min read"}</span>
                        </div>
                        <div className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed space-y-2">
                          {editingBlog.content || "Write some content or click the section buttons above to preview."}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Publish Status & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <select
                        value={editingBlog.status}
                        onChange={(e) =>
                          setEditingBlog({
                            ...editingBlog,
                            status: e.target.value as "published" | "draft",
                          })
                        }
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white cursor-pointer"
                      >
                        <option value="published">🟢 Status: Published (Live on Site)</option>
                        <option value="draft">📝 Status: Draft (Hidden)</option>
                      </select>

                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-semibold">
                        <input
                          type="checkbox"
                          checked={editingBlog.featured}
                          onChange={(e) =>
                            setEditingBlog({ ...editingBlog, featured: e.target.checked })
                          }
                          className="accent-indigo-500 w-4 h-4 rounded"
                        />
                        Pin as Featured Post
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveBlog}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {isBlogNew ? "Publish Article Live" : "Update Live Article"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: SEO Readiness, SERP Preview & Articles Manager */}
              <div className="lg:col-span-5 space-y-4">
                {/* Real-time SEO Readiness Score */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>SEO Audit Score</span>
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
                      {seoScore}/100
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Target Focus Keyword
                    </label>
                    <input
                      type="text"
                      value={editingBlog.target_keyword}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, target_keyword: e.target.value })
                      }
                      placeholder="e.g. free ai voice changer"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Google SERP Snippet Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Google SERP Preview</span>
                    </h3>
                    <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSerpDevice("desktop")}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          serpDevice === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400"
                        }`}
                      >
                        Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setSerpDevice("mobile")}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          serpDevice === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400"
                        }`}
                      >
                        Mobile
                      </button>
                    </div>
                  </div>

                  <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-left font-sans text-xs transition-all ${serpDevice === "mobile" ? "max-w-xs mx-auto" : "w-full"}`}>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-800 mb-1">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                        B
                      </div>
                      <span className="font-semibold text-slate-900">Botock AI</span>
                      <span className="text-slate-400 truncate">
                        https://botock.app › blog › {editingBlog.slug || "slug"}
                      </span>
                    </div>
                    <div className="text-base text-blue-800 font-medium line-clamp-1 mb-1">
                      {editingBlog.meta_title || editingBlog.title || "Article Title | Botock AI"}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {editingBlog.meta_description ||
                        editingBlog.excerpt ||
                        "Write a compelling meta description for Google Search..."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                        <span>Meta Title</span>
                        <span>{editingBlog.meta_title.length}/60</span>
                      </div>
                      <input
                        type="text"
                        value={editingBlog.meta_title}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, meta_title: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                        <span>Meta Description</span>
                        <span>{editingBlog.meta_description.length}/160</span>
                      </div>
                      <textarea
                        rows={2}
                        value={editingBlog.meta_description}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, meta_description: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Published & Draft Articles Manager List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-200">
                      Published Articles ({blogs.length})
                    </h3>
                    <input
                      type="text"
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      placeholder="Search articles..."
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 outline-none"
                    />
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {blogs.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        No articles published yet. Click &ldquo;+ Write New Article&rdquo; above to create your first post!
                      </div>
                    ) : (
                      blogs
                        .filter((b) =>
                          b.title.toLowerCase().includes(blogSearch.toLowerCase())
                        )
                        .map((b) => (
                          <div
                            key={b.id}
                            onClick={() => handleSelectBlog(b)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                              editingBlog.id === b.id
                                ? "bg-indigo-500/10 border-indigo-500/40"
                                : "bg-slate-950 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                    b.status === "published"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-amber-500/20 text-amber-300"
                                  }`}
                                >
                                  {b.status}
                                </span>
                                {b.featured && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300">
                                    ★ Featured
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-mono">
                                  👁️ {b.views || 0}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-slate-200 truncate">
                                {b.title}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                /blog/{b.slug}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <a
                                href={`https://botock.app/blog/${b.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400"
                                title="View Live on Website"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBlog(b.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                                title="Delete Article"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
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
