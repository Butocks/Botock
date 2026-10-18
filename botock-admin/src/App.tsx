import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Compass,
  TrendingUp,
  Sliders,
  Users,
  Gauge,
  Ticket,
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
  Copy,
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
  Flame,
  Mail,
  LogOut,
} from "lucide-react";

interface TelemetryEvent {
  session_id: string;
  user_email: string;
  event_type: string;
  current_path: string;
  previous_path: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  device_type: string;
  country: string;
  timestamp: string;
}

interface ToolConfig {
  name: string;
  enabled: boolean;
  pro_only: boolean;
  maintenance: boolean;
  uses: number;
  errors: number;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  vip: boolean;
  banned: boolean;
  generations: number;
  source: string;
  joined: string;
}

interface Coupon {
  code: string;
  discount_percent: number;
  bonus_credits: number;
  max_uses: number;
  used_count: number;
  active: boolean;
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
  { label: "💻 Local Machine (http://localhost:8000)", url: "http://localhost:8000" },
  { label: "🌐 Production Server (https://botock.app)", url: "https://botock.app" },
];

const resolveHost = (host: string) => {
  const clean = host.replace(/\/+$/, "");
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
    return localStorage.getItem("botock_admin_host") || "http://localhost:8000";
  });
  const [adminSecret, setAdminSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "journeys" | "campaigns" | "tools" | "users" | "quotas" | "coupons" | "cms"
  >("journeys");

  // Enterprise Security & Device Recognition States (Never pre-fill or cache credentials)
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
  const [campaignBreakdown, setCampaignBreakdown] = useState<Record<string, number>>({});
  const [tools, setTools] = useState<Record<string, ToolConfig>>({});
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [quotas, setQuotas] = useState<QuotasConfig>({
    guest_daily_limit: 10,
    free_user_daily_limit: 30,
    max_file_size_mb: 60,
    forced_model: "auto",
    global_maintenance: false,
    announcement_banner: "",
  });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [journeyFilter, setJourneyFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(20);
  const [newCouponCredits, setNewCouponCredits] = useState(100);
  const [newCouponMax, setNewCouponMax] = useState(100);

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
        setCampaignBreakdown(res.data.campaign_breakdown || {});
        setTools(res.data.tool_flags || {});
        setUsers(res.data.users || []);
        setQuotas(res.data.quotas || {});
        setCoupons(res.data.coupons || []);
        setBlogs(res.data.blogs || []);

        localStorage.setItem("botock_admin_host", targetHost);
      } else {
        setStatusMessage({ type: "error", text: "Session invalid or expired. Please re-login." });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to fetch overview.";
      setStatusMessage({ type: "error", text: `Auth Error: ${detail}` });
      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem("botock_admin_session_token");
        setSessionToken("");
      }
    } finally {
      setLoading(false);
    }
  }, [getClient, targetHost, adminSecret, sessionToken]);

  // Initial Load
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Helper for Auto-Slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Live Real-Time SEO Score Calculation (0 - 100)
  const seoAudit = useMemo(() => {
    const checks: { label: string; passed: boolean; score: number }[] = [];
    const kw = editingBlog.target_keyword.toLowerCase().trim();
    const title = editingBlog.title.toLowerCase();
    const metaTitle = (editingBlog.meta_title || editingBlog.title).toLowerCase();
    const metaDesc = (editingBlog.meta_description || editingBlog.excerpt).toLowerCase();
    const content = editingBlog.content.toLowerCase();
    const wordCount = editingBlog.content.trim() ? editingBlog.content.trim().split(/\s+/).length : 0;

    // 1. Keyword defined
    checks.push({
      label: "Target Keyword specified",
      passed: kw.length > 2,
      score: 10,
    });

    // 2. Keyword in Title
    checks.push({
      label: "Keyword appears in Main Title",
      passed: kw.length > 2 && title.includes(kw),
      score: 15,
    });

    // 3. Keyword in Meta Title / Slug
    checks.push({
      label: "Keyword in Meta Title or URL Slug",
      passed: kw.length > 2 && (metaTitle.includes(kw) || editingBlog.slug.includes(generateSlug(kw))),
      score: 15,
    });

    // 4. Keyword in Meta Description
    checks.push({
      label: "Keyword appears in Meta Description",
      passed: kw.length > 2 && metaDesc.includes(kw),
      score: 15,
    });

    // 5. Keyword in Body Content
    checks.push({
      label: "Keyword appears in Article Body",
      passed: kw.length > 2 && content.includes(kw),
      score: 15,
    });

    // 6. Meta description optimal length (100-165 chars)
    const descLen = editingBlog.meta_description.length;
    checks.push({
      label: `Meta Description optimal length (${descLen}/160 chars)`,
      passed: descLen >= 100 && descLen <= 165,
      score: 10,
    });

    // 7. Subheading structure (H2 or H3 present)
    const hasHeadings = /#{2,3}\s+.+/i.test(editingBlog.content);
    checks.push({
      label: "Includes H2/H3 subheadings",
      passed: hasHeadings,
      score: 10,
    });

    // 8. Comprehensive Word Count (>= 250 words)
    checks.push({
      label: `Article word count depth (${wordCount} words)`,
      passed: wordCount >= 250,
      score: 10,
    });

    const totalScore = checks.reduce((acc, c) => (c.passed ? acc + c.score : acc), 0);
    return { score: totalScore, checks, wordCount };
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
        // 🚀 Trusted Device Recognized -> Direct 1-Click Entry!
        const token = res.data.token || res.data.admin_token;
        sessionStorage.setItem("botock_admin_session_token", token);
        localStorage.setItem("botock_device_trusted", "true");
        setSessionToken(token);
        setIsTrustedDevice(true);
        setStatusMessage({
          type: "success",
          text: res.data?.message || "Trusted device recognized! Welcome back.",
        });
        setTimeout(() => fetchOverview(), 150);
      } else if (res.data?.otp_required) {
        // 🔒 New Device -> Proceed to 6-digit Zoho OTP verification
        setLoginStep("otp");
        if (res.data?.dev_otp) {
          setOtpCode(res.data.dev_otp);
        }
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
    if (!otpCode.trim()) {
      setStatusMessage({ type: "error", text: "Please enter the 6-digit OTP code." });
      return;
    }

    setAuthLoading(true);
    setStatusMessage({ type: "info", text: "Verifying 6-digit OTP code..." });
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
        if (rememberDevice) {
          localStorage.setItem("botock_device_trusted", "true");
          setIsTrustedDevice(true);
        }
        setSessionToken(token);
        setLoginStep("credentials");
        setOtpCode("");
        setStatusMessage({
          type: "success",
          text: res.data?.message || "Verification successful! Device recognized as trusted.",
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

  // Tab Action Handlers
  const handleSaveQuotas = async () => {
    setLoading(true);
    const client = getClient();
    try {
      await client.post("/api/admin/quotas", quotas);
      setStatusMessage({ type: "success", text: "Global Quotas & Maintenance saved successfully!" });
    } catch (e: any) {
      setStatusMessage({ type: "error", text: "Failed to update quotas: " + (e.message || "") });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTool = async (
    toolId: string,
    field: "enabled" | "pro_only" | "maintenance",
    currentVal: boolean
  ) => {
    const updated = { ...tools[toolId], [field]: !currentVal };
    setTools((prev) => ({ ...prev, [toolId]: updated }));
    const client = getClient();
    try {
      await client.post("/api/admin/tool-flags", {
        tool_id: toolId,
        updates: { [field]: !currentVal },
      });
      setStatusMessage({ type: "success", text: `Updated ${tools[toolId]?.name || toolId} flag.` });
    } catch (e: any) {
      setStatusMessage({ type: "error", text: `Failed to update tool: ${e.message}` });
    }
  };

  const handleUserAction = async (userId: string, action: "toggle_vip" | "toggle_ban") => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newVip = action === "toggle_vip" ? !target.vip : target.vip;
    const newBanned = action === "toggle_ban" ? !target.banned : target.banned;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, vip: newVip, banned: newBanned } : u))
    );

    const client = getClient();
    try {
      await client.post("/api/admin/users/update", {
        id: userId,
        vip: newVip,
        banned: newBanned,
      });
      setStatusMessage({ type: "success", text: `User ${target.email} updated.` });
    } catch (e: any) {
      setStatusMessage({ type: "error", text: `Failed to update user: ${e.message}` });
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    setLoading(true);
    const client = getClient();
    try {
      const res = await client.post("/api/admin/coupons/create", {
        code: newCouponCode,
        discount_percent: newCouponDiscount,
        bonus_credits: newCouponCredits,
        max_uses: newCouponMax,
      });
      if (res.data?.coupons) {
        setCoupons(res.data.coupons);
        setNewCouponCode("");
        setStatusMessage({ type: "success", text: `Coupon ${newCouponCode.toUpperCase()} created!` });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: "Failed to create coupon: " + (e.message || "") });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlog = async (status: "published" | "draft") => {
    if (!editingBlog.title.trim()) {
      setStatusMessage({ type: "error", text: "Post title is required." });
      return;
    }
    const slug = editingBlog.slug.trim() || generateSlug(editingBlog.title);
    const payload = {
      ...editingBlog,
      slug,
      status,
      meta_title: editingBlog.meta_title.trim() || editingBlog.title.trim(),
      meta_description: editingBlog.meta_description.trim() || editingBlog.excerpt.trim(),
    };

    setLoading(true);
    const client = getClient();
    try {
      const res = await client.post("/api/admin/blogs/save", payload);
      if (res.data?.ok) {
        setBlogs(res.data.blogs || []);
        setEditingBlog(res.data.saved || payload);
        setIsBlogNew(false);
        setStatusMessage({
          type: "success",
          text: `Blog post ${status === "published" ? "Published to SERP" : "Saved as Draft"} successfully!`,
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: "Failed to save blog: " + (e.message || "") });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this blog post?")) return;
    setLoading(true);
    const client = getClient();
    try {
      const res = await client.post("/api/admin/blogs/delete", { id });
      if (res.data?.ok) {
        setBlogs(res.data.blogs || []);
        if (editingBlog.id === id) {
          handleNewBlog();
        }
        setStatusMessage({ type: "success", text: "Blog post deleted." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: "Failed to delete blog: " + (e.message || "") });
    } finally {
      setLoading(false);
    }
  };

  const handleNewBlog = () => {
    setEditingBlog({
      id: `blog_${Date.now()}`,
      title: "",
      slug: "",
      excerpt: "",
      content: "## Overview\n\nExplain the tool or topic clearly here.\n\n### Key Features\n- Point 1\n- Point 2\n\n### How to Use\n1. Step one\n2. Step two",
      category: "AI Tutorials",
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
    setIsBlogNew(true);
    setBlogPreviewMode("edit");
  };

  const insertMarkdown = (syntax: string, placeholder = "text") => {
    const cur = editingBlog.content;
    let snippet = "";
    if (syntax === "b") snippet = `**${placeholder}**`;
    else if (syntax === "i") snippet = `*${placeholder}*`;
    else if (syntax === "h2") snippet = `\n## Section Heading\n`;
    else if (syntax === "h3") snippet = `\n### Sub-Section Heading\n`;
    else if (syntax === "link") snippet = `[link text](https://botock.app)`;
    else if (syntax === "list") snippet = `\n- Item 1\n- Item 2\n- Item 3\n`;
    else if (syntax === "quote") snippet = `\n> Key takeaway or important quote\n`;
    else if (syntax === "code") snippet = `\n\`\`\`javascript\nconsole.log("code");\n\`\`\`\n`;

    setEditingBlog((prev) => ({ ...prev, content: cur + snippet }));
  };

  // Filtered Telemetry
  const filteredTelemetry = useMemo(() => {
    if (journeyFilter === "all") return telemetry;
    return telemetry.filter((t) => t.utm_source === journeyFilter || t.device_type === journeyFilter);
  }, [telemetry, journeyFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.source.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // 🔐 DEDICATED FULL-PAGE AUTHENTICATION PORTAL (When not signed in)
  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-500 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Botock Command Center</h1>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Restricted Gate • Zero-Backdoor</span>
            </div>
          </div>

          {/* Environment Switcher */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Backend Environment</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
              <Server className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
              <select
                value={targetHost}
                onChange={(e) => {
                  setTargetHost(e.target.value);
                  localStorage.setItem("botock_admin_host", e.target.value);
                }}
                className="bg-transparent border-none outline-none text-slate-200 text-xs w-full cursor-pointer"
              >
                {PRESET_URLS.map((p) => (
                  <option key={p.url} value={p.url} className="bg-slate-900 text-slate-200">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Alert Message */}
          {statusMessage && (
            <div
              className={`text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center space-x-2.5 ${
                statusMessage.type === "success"
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : statusMessage.type === "error"
                  ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                  : "text-sky-400 bg-sky-500/10 border border-sky-500/20"
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
            <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs">
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
                  placeholder="123456"
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
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={authLoading || otpCode.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className={`w-4 h-4 ${authLoading ? "animate-spin" : ""}`} />
                  <span>{authLoading ? "Verifying..." : "Verify & Unlock"}</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1 border-t border-slate-800/80">
            <Lock className="w-3 h-3 text-slate-600" />
            <span>3 Failed Attempts = 24-Hour IP Security Lockout</span>
          </div>
        </div>
      </div>
    );
  }

  // 🚀 AUTHENTICATED COMMAND CENTER DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 🚀 TOP MASTER HEADER & CONNECTION CONTROL BAR */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Platform Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Botock Command Center
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Headless v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Azure VM + Vercel + Supabase Unified Orchestration</p>
            </div>
          </div>

          {/* Connection Controls & Session Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Target Host Dropdown & Input */}
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs">
              <Server className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                placeholder="http://localhost:8000"
                className="bg-transparent border-none outline-none text-slate-200 w-44 font-mono text-xs"
              />
              <select
                onChange={(e) => {
                  if (e.target.value) setTargetHost(e.target.value);
                }}
                className="bg-slate-900 text-slate-400 border-none outline-none text-xs ml-1 cursor-pointer"
                value={targetHost}
              >
                {PRESET_URLS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

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
              onClick={fetchOverview}
              disabled={loading}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition ${
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
        <div className="bg-slate-950/60 border-t border-slate-800/80 px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    connected ? "bg-emerald-400 animate-pulse shadow-md shadow-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className={connected ? "text-emerald-400 font-medium" : "text-rose-400"}>
                  {connected ? "Azure Backend Online" : "Disconnected"}
                </span>
              </div>
              {connected && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    CPU: <strong className="text-slate-200">{serverStats.cpu_percent ?? 0}%</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    RAM: <strong className="text-slate-200">{serverStats.memory_percent ?? 0}%</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">
                    24h Sessions:{" "}
                    <strong className="text-indigo-400">{serverStats.active_sessions_24h ?? 0}</strong>
                  </span>
                </>
              )}
            </div>

            {statusMessage && (
              <div
                className={`text-xs px-2 py-0.5 rounded font-medium flex items-center space-x-1 ${
                  statusMessage.type === "success"
                    ? "text-emerald-400 bg-emerald-500/10"
                    : statusMessage.type === "error"
                    ? "text-rose-400 bg-rose-500/10"
                    : "text-sky-400 bg-sky-500/10"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* 📑 TAB NAVIGATION BAR */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar border-t border-slate-800 text-xs">
          {[
            { id: "journeys", label: "User Journeys (Clickstream)", icon: Compass, count: telemetry.length },
            { id: "campaigns", label: "Ad Campaigns & UTM", icon: TrendingUp, count: Object.keys(sourceBreakdown).length },
            { id: "tools", label: "Tool Feature Flags", icon: Sliders, count: Object.keys(tools).length },
            { id: "users", label: "VIP & Ban Manager", icon: Users, count: users.length },
            { id: "quotas", label: "Quotas & Maintenance", icon: Gauge },
            { id: "coupons", label: "Promo Coupons", icon: Ticket, count: coupons.length },
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
        {/* TAB 1: LIVE USER JOURNEYS (CLICKSTREAM TRACKING)                      */}
        {/* ==================================================================== */}
        {activeTab === "journeys" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  <span>Real-Time Visitor Clickstream & Progression</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Tracks visitor paths from Facebook / Google Ads entry to conversion tools (Fired via &lt;BotockTelemetry /&gt;)
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Filter by Source:</span>
                <select
                  value={journeyFilter}
                  onChange={(e) => setJourneyFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 outline-none"
                >
                  <option value="all">All Sources ({telemetry.length})</option>
                  <option value="facebook">Facebook Ads / Referral</option>
                  <option value="instagram">Instagram</option>
                  <option value="google_search">Google Search</option>
                  <option value="tiktok">TikTok</option>
                  <option value="direct">Direct / None</option>
                  <option value="Mobile">Mobile Only</option>
                  <option value="Desktop">Desktop Only</option>
                </select>
              </div>
            </div>

            {/* Journey Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Visitor Session</th>
                      <th className="py-3 px-4">User Email</th>
                      <th className="py-3 px-4">Step / Path Flow</th>
                      <th className="py-3 px-4">Source & Campaign</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredTelemetry.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                          No visitor telemetry logged yet. Open botock.app to see real-time sessions fire!
                        </td>
                      </tr>
                    ) : (
                      filteredTelemetry.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <span className="text-indigo-400 font-semibold">
                              {t.session_id.substring(0, 14)}...
                            </span>
                          </td>
                          <td className="py-3 px-4 font-sans">
                            {t.user_email === "Guest" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                                Guest
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-medium">{t.user_email}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <div className="flex items-center space-x-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400">
                                {t.previous_path || "Entry"}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                                {t.current_path}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200 capitalize">
                                {t.utm_source || "Direct"}
                              </span>
                              {t.utm_campaign && t.utm_campaign !== "none" && (
                                <span className="text-[10px] text-amber-400">
                                  Camp: {t.utm_campaign}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <span className="flex items-center space-x-1 text-slate-400 text-xs">
                              {t.device_type === "Mobile" ? (
                                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                              ) : (
                                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                              )}
                              <span>{t.device_type}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(t.timestamp).toLocaleTimeString()}
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
        {/* TAB 2: FACEBOOK & CAMPAIGN ATTRIBUTION                                */}
        {/* ==================================================================== */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-pink-400" />
                <span>Ad Attribution & Referral Performance</span>
              </h2>
              <p className="text-xs text-slate-400">
                Live attribution breakdown calculated from UTM tags and HTTP Referrers
              </p>
            </div>

            {/* Platform Attribution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Facebook Ads", count: sourceBreakdown["facebook"] || 0, color: "from-blue-600 to-indigo-600" },
                { name: "Google Organic", count: sourceBreakdown["google_search"] || 0, color: "from-emerald-600 to-teal-600" },
                { name: "Instagram / TikTok", count: (sourceBreakdown["instagram"] || 0) + (sourceBreakdown["tiktok"] || 0), color: "from-pink-600 to-rose-600" },
                { name: "Direct / Organic", count: sourceBreakdown["direct"] || sourceBreakdown["organic"] || 0, color: "from-purple-600 to-slate-700" },
              ].map((card, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
                  <div className="text-xs text-slate-400 font-medium mb-1">{card.name}</div>
                  <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                    <span>{card.count}</span>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${card.color}`} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">Visits logged</div>
                </div>
              ))}
            </div>

            {/* Active Campaigns Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <h3 className="text-sm font-bold text-slate-200 mb-3">Tracked Ad Campaigns</h3>
              <div className="space-y-2">
                {Object.entries(campaignBreakdown).length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No active campaign parameters detected yet. Append ?utm_campaign=my_ad to any link to test.
                  </p>
                ) : (
                  Object.entries(campaignBreakdown).map(([camp, count], idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-slate-200">{camp}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                        {count} hits
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: TOOL FEATURE FLAGS & INSTANT SWITCHES                          */}
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
                  Instantly toggle tools offline, lock behind Pro subscription, or put into maintenance mode
                </p>
              </div>
              <button
                onClick={fetchOverview}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Sync with Backend
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(tools).map(([id, t]) => (
                <div
                  key={id}
                  className={`p-4 rounded-xl border transition ${
                    t.maintenance
                      ? "bg-amber-950/20 border-amber-600/40"
                      : !t.enabled
                      ? "bg-rose-950/20 border-rose-600/40 opacity-70"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{t.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">id: {id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Uses: <strong className="text-emerald-400">{t.uses}</strong>
                      </span>
                      {t.errors > 0 && (
                        <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded">
                          Err: {t.errors}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
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

                    {/* Switch: Pro Only */}
                    <button
                      onClick={() => handleToggleTool(id, "pro_only", t.pro_only)}
                      className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
                        t.pro_only
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.pro_only ? "Pro Only" : "Free/All"}</span>
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
                      <span>{t.maintenance ? "Maintenance" : "Normal"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: USER VIP & BAN MANAGER                                         */}
        {/* ==================================================================== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Registered Users & VIP / Ban Moderation</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Instantly ban fraudulent users or upgrade power creators to lifetime VIP Pro access
                </p>
              </div>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search email, name or source..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Acquisition Source</th>
                    <th className="py-3 px-4">Generations</th>
                    <th className="py-3 px-4">VIP Status</th>
                    <th className="py-3 px-4">Account Health</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No users match query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 capitalize">
                          {u.source || "organic"}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-300 font-mono">
                          {u.generations}
                        </td>
                        <td className="py-3 px-4">
                          {u.vip ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              ⭐ VIP Pro
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                              Standard Free
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {u.banned ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                              ⛔ Banned (403)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              ✓ Good Standing
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleUserAction(u.id, "toggle_vip")}
                            className={`px-2.5 py-1 rounded text-xs font-semibold ${
                              u.vip
                                ? "bg-slate-800 text-amber-400 hover:bg-slate-700"
                                : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                            }`}
                          >
                            {u.vip ? "Revoke VIP" : "Make VIP"}
                          </button>
                          <button
                            onClick={() => handleUserAction(u.id, "toggle_ban")}
                            className={`px-2.5 py-1 rounded text-xs font-semibold ${
                              u.banned
                                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                            }`}
                          >
                            {u.banned ? "Unban" : "Ban User"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: GLOBAL QUOTAS & MAINTENANCE                                    */}
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
                    <div className="font-semibold text-slate-200">Registered Free User Daily Limit</div>
                    <div className="text-slate-500 text-[11px]">Daily cap for signed-in free accounts</div>
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
                    <div className="font-semibold text-slate-200">Max File Size (MB)</div>
                    <div className="text-slate-500 text-[11px]">Enforced on PDF, Audio & Video uploads</div>
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

                {/* Forced Model Selection */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Forced AI Video/Audio Model</div>
                    <div className="text-slate-500 text-[11px]">Override auto-dispatch engine</div>
                  </div>
                  <select
                    value={quotas.forced_model}
                    onChange={(e) => setQuotas({ ...quotas, forced_model: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="auto">Auto Dynamic Route</option>
                    <option value="veo-2-flash">Google Veo 2 Flash</option>
                    <option value="omni-1.1">Omni Flow 1.1</option>
                    <option value="f5-tts-fast">F5-TTS Neural Voice</option>
                  </select>
                </div>

                {/* Global Maintenance Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-950/20 border border-rose-500/30">
                  <div>
                    <div className="font-semibold text-rose-300">Global Platform Emergency Freeze</div>
                    <div className="text-rose-400/80 text-[11px]">
                      Displays maintenance mode across all public tools
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQuotas({ ...quotas, global_maintenance: !quotas.global_maintenance })
                    }
                    className={`px-3 py-1 rounded font-bold transition ${
                      quotas.global_maintenance
                        ? "bg-rose-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {quotas.global_maintenance ? "FREEZE ACTIVE" : "Normal"}
                  </button>
                </div>

                {/* Announcement Banner */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-slate-200">Global Announcement Banner</div>
                  <input
                    type="text"
                    value={quotas.announcement_banner}
                    onChange={(e) => setQuotas({ ...quotas, announcement_banner: e.target.value })}
                    placeholder="e.g., 🚀 Ramadan Special: Unlimited Voice Cloner unlocked for 48 hours!"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveQuotas}
                    disabled={loading}
                    className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Platform Quotas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: PROMO & DISCOUNT COUPONS                                       */}
        {/* ==================================================================== */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-indigo-400" />
                  <span>Promo Codes & Creator Discounts</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Generate promotional discount vouchers and credit gifts for influencers
                </p>
              </div>
            </div>

            {/* Create Coupon Card */}
            <form
              onSubmit={handleCreateCoupon}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-end"
            >
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Coupon Code</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. YOUTUBE50"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Discount %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Bonus Credits</label>
                <input
                  type="number"
                  value={newCouponCredits}
                  onChange={(e) => setNewCouponCredits(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Max Redemptions</label>
                <input
                  type="number"
                  value={newCouponMax}
                  onChange={(e) => setNewCouponMax(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Create Code</span>
              </button>
            </form>

            {/* Coupons Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Gift Credits</th>
                    <th className="py-3 px-4">Redemptions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        No active coupons found.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-indigo-400 font-mono flex items-center space-x-2">
                          <span>{c.code}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(c.code);
                              setCopiedCode(c.code);
                              setTimeout(() => setCopiedCode(null), 1500);
                            }}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{c.discount_percent}% OFF</td>
                        <td className="py-3 px-4 text-amber-300">+{c.bonus_credits} cr</td>
                        <td className="py-3 px-4 text-slate-400">
                          {c.used_count} / {c.max_uses}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          {c.active ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-500">
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => {
                              setCoupons(
                                coupons.map((item) =>
                                  item.code === c.code ? { ...item, active: !item.active } : item
                                )
                              );
                            }}
                            className="text-xs text-slate-400 hover:text-rose-400"
                          >
                            {c.active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 7: ENTERPRISE SEO BLOG CMS & LIVE SERP PUBLISHER                  */}
        {/* ==================================================================== */}
        {activeTab === "cms" && (
          <div className="space-y-6">
            {/* Header with New Blog button and Post Selector */}
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Article</span>
                </button>

                {blogs.length > 0 && (
                  <select
                    value={editingBlog.id}
                    onChange={(e) => {
                      const sel = blogs.find((b) => b.id === e.target.value);
                      if (sel) {
                        setEditingBlog(sel);
                        setIsBlogNew(false);
                      }
                    }}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none max-w-xs truncate"
                  >
                    <option value="" disabled>
                      Select an existing article ({blogs.length})...
                    </option>
                    {blogs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.status === "published" ? "🟢" : "⚪"} {b.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* CMS Two-Column Grid: Metadata & Score / Content & Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Metadata, Target Keyword, SERP Preview & SEO Score (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. REAL-TIME SEO AUDIT METER */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-slate-200">Real-Time SEO Audit</span>
                    </div>
                    <div
                      className={`text-sm font-extrabold px-2.5 py-0.5 rounded-full ${
                        seoAudit.score >= 80
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : seoAudit.score >= 50
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {seoAudit.score}% Score
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        seoAudit.score >= 80
                          ? "bg-emerald-400"
                          : seoAudit.score >= 50
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${seoAudit.score}%` }}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="space-y-1.5 text-xs">
                    {seoAudit.checks.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center space-x-1.5">
                          {c.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span className={c.passed ? "text-slate-200 font-medium" : "text-slate-500"}>
                            {c.label}
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">+{c.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. LIVE GOOGLE SERP SNIPPET PREVIEW */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span>Google Search Result Snippet</span>
                    </span>
                    <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                      <button
                        onClick={() => setSerpDevice("desktop")}
                        className={`px-1.5 py-0.5 rounded ${
                          serpDevice === "desktop" ? "bg-slate-800 text-white font-bold" : "text-slate-500"
                        }`}
                      >
                        Desktop
                      </button>
                      <button
                        onClick={() => setSerpDevice("mobile")}
                        className={`px-1.5 py-0.5 rounded ${
                          serpDevice === "mobile" ? "bg-slate-800 text-white font-bold" : "text-slate-500"
                        }`}
                      >
                        Mobile
                      </button>
                    </div>
                  </div>

                  {/* Google Card Simulation */}
                  <div className="bg-white text-slate-900 p-3.5 rounded-lg border border-slate-200 font-sans shadow-sm">
                    <div className="flex items-center space-x-2 text-[11px] text-slate-700 truncate mb-1">
                      <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px]">
                        B
                      </div>
                      <span className="font-medium text-slate-900">Botock AI</span>
                      <span className="text-slate-400">›</span>
                      <span className="text-slate-600 truncate">
                        https://botock.app/blog/{editingBlog.slug || "guide-slug"}
                      </span>
                    </div>

                    <h4 className="text-[15px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug line-clamp-2">
                      {editingBlog.meta_title || editingBlog.title || "Your Engaging Article Title Goes Here"}
                    </h4>

                    <p className="text-[12px] text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
                      {editingBlog.meta_description ||
                        editingBlog.excerpt ||
                        "Write an actionable 150-character meta description targeting high search CTR..."}
                    </p>
                  </div>
                </div>

                {/* 3. METADATA INPUTS */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Primary Target Keyword</label>
                    <input
                      type="text"
                      value={editingBlog.target_keyword}
                      onChange={(e) => setEditingBlog({ ...editingBlog, target_keyword: e.target.value })}
                      placeholder="e.g., free ai voice cloner"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Category</label>
                      <select
                        value={editingBlog.category}
                        onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="AI Audio & Voice">AI Audio & Voice</option>
                        <option value="Video Creation">Video Creation</option>
                        <option value="Image Tools">Image Tools</option>
                        <option value="PDF Productivity">PDF Productivity</option>
                        <option value="AI Tutorials">AI Tutorials</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Author Name</label>
                      <input
                        type="text"
                        value={editingBlog.author}
                        onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">SEO Meta Title</label>
                      <span
                        className={`text-[10px] font-mono ${
                          editingBlog.meta_title.length > 60 ? "text-rose-400 font-bold" : "text-slate-400"
                        }`}
                      >
                        {editingBlog.meta_title.length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingBlog.meta_title}
                      onChange={(e) => setEditingBlog({ ...editingBlog, meta_title: e.target.value })}
                      placeholder="Title tag for search engines..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">SEO Meta Description</label>
                      <span
                        className={`text-[10px] font-mono ${
                          editingBlog.meta_description.length > 160
                            ? "text-rose-400 font-bold"
                            : editingBlog.meta_description.length < 100
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {editingBlog.meta_description.length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={editingBlog.meta_description}
                      onChange={(e) => setEditingBlog({ ...editingBlog, meta_description: e.target.value })}
                      placeholder="Snippet shown under title in Google..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Full Editor, Markdown Toolbar & Live Preview (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-4">
                  {/* Article Title & Auto-Generated Slug */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingBlog.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingBlog({
                          ...editingBlog,
                          title: val,
                          slug: isBlogNew ? generateSlug(val) : editingBlog.slug,
                        });
                      }}
                      placeholder="Enter a Compelling Article Title..."
                      className="w-full bg-transparent border-b border-slate-700 pb-2 text-xl font-extrabold text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                    />

                    <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                      <span>URL Slug:</span>
                      <span className="text-indigo-400">botock.app/blog/</span>
                      <input
                        type="text"
                        value={editingBlog.slug}
                        onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                        placeholder="article-slug"
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Markdown Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("b", "bold text")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("i", "italic text")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("h2")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Heading 2"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("h3")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Heading 3"
                      >
                        <Heading3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("link")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Hyperlink"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("list")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("quote")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Blockquote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("code")}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Code block"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit vs Preview Toggle */}
                    <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setBlogPreviewMode("edit")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          blogPreviewMode === "edit"
                            ? "bg-indigo-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlogPreviewMode("preview")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          blogPreviewMode === "preview"
                            ? "bg-indigo-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Live Reader View
                      </button>
                    </div>
                  </div>

                  {/* Main Editor Textarea or Live Preview */}
                  {blogPreviewMode === "edit" ? (
                    <div className="space-y-2">
                      <textarea
                        rows={16}
                        value={editingBlog.content}
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        placeholder="Write your in-depth Markdown guide here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed outline-none focus:border-indigo-500 transition resize-y"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Words: {seoAudit.wordCount}</span>
                        <span>Estimated: {Math.max(1, Math.round(seoAudit.wordCount / 200))} min read</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl min-h-[380px] prose prose-invert prose-sm max-w-none">
                      <h1 className="text-2xl font-bold text-white mb-2">{editingBlog.title || "Untitled Article"}</h1>
                      <div className="text-xs text-slate-400 mb-6 flex items-center space-x-4">
                        <span>By {editingBlog.author}</span>
                        <span>•</span>
                        <span>{editingBlog.category}</span>
                      </div>
                      <div className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">
                        {editingBlog.content}
                      </div>
                    </div>
                  )}

                  {/* Publish & Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 text-xs">
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={editingBlog.featured}
                          onChange={(e) => setEditingBlog({ ...editingBlog, featured: e.target.checked })}
                          className="rounded bg-slate-950 border-slate-700 text-indigo-600"
                        />
                        <span>Feature on Homepage</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isBlogNew && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(editingBlog.id)}
                          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveBlog("draft")}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveBlog("published")}
                        disabled={loading}
                        className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Publish to Live SERP</span>
                      </button>
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
