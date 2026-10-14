"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBackendUrl } from "../../utils/runtime-urls";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
  Terminal,
  Sliders,
  FileText,
  Trash2,
  Save,
  Globe,
  Zap,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Plus,
  RefreshCw,
  FileCheck,
  Briefcase,
  Layers,
  Crown,
  Mail,
} from "lucide-react";
import BlogCMS from "./BlogCMS";

interface BlockItem {
  type: "paragraph" | "attachment";
  content?: string;
  url?: string;
  caption?: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  readTime: string;
  author: string;
  date?: string;
  blocks: BlockItem[];
}

interface ComplaintItem {
  id: string;
  email: string;
  category: string;
  severity: string;
  referenceId?: string;
  description: string;
  status: string;
  stage: string;
  createdAt: string;
}

interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  desc: string;
  requirements: string[];
}

interface ToolRule {
  id: string;
  name: string;
  isProOnly: boolean;
  isInDevelopment: boolean;
  statusMessage: string;
}

interface PlanItem {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  badge: string;
  highlight: boolean;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

interface AdminConsoleProps {
  token?: string | null;
  email?: string | null;
}

export default function AdminConsole({ token, email }: AdminConsoleProps = {}) {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState<string | null>(token || null);
  const [adminEmail, setAdminEmail] = useState<string>(email || "");
  const [activeTab, setActiveTab] = useState<
    "analytics" | "quotas" | "users" | "tool-usage" | "promotions" | "complaints" | "jobs" | "blogs" | "tools" | "policies" | "email"
  >("analytics");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [newVipEmail, setNewVipEmail] = useState("");
  const [subRequests, setSubRequests] = useState<any[]>([]);

  // Zoho SMTP Diagnostics & Update State
  const [smtpTestEmail, setSmtpTestEmail] = useState("");
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [updateToEmail, setUpdateToEmail] = useState("");
  const [updateSubject, setUpdateSubject] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [sendingUpdate, setSendingUpdate] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------
  // 2-Step Verification State
  // ----------------------------------------------------
  const [showTwoStepModal, setShowTwoStepModal] = useState(false);
  const [twoStepCode, setTwoStepCode] = useState("");
  const [twoStepError, setTwoStepError] = useState("");
  const [pendingAction, setPendingAction] = useState<((code: string) => Promise<void>) | null>(null);

  
  // ----------------------------------------------------
  // Module 10: Tool Usage Analytics
  // ----------------------------------------------------
  const [toolUsage, setToolUsage] = useState<{ summary: any[], errors: any[] }>({ summary: [], errors: [] });

  // ----------------------------------------------------
  // Module 1: Analytics & Demographics
  // ----------------------------------------------------
  const [analytics, setAnalytics] = useState({
    visitors: { live: 0, daily: 0, weekly: 0, monthly: 0 },
    countries: [] as { country: string; code: string; percentage: number; users: number }[],
    subscribers_total: 0,
    mrr: "$0",
  });
  
  const [videoStats, setVideoStats] = useState({
    today: 0,
    this_month: 0,
    all_time: 0,
    today_flow_credits: 0,
    this_month_flow_credits: 0,
    all_time_flow_credits: 0,
  });

  // ----------------------------------------------------
  // Module 2: Flow Credits & Generation Limits
  // ----------------------------------------------------
  const [quotas, setQuotas] = useState<any>({
    flow_monthly_credit_pool: 5000,
    global_daily_video_limit: 30,
    global_monthly_video_limit: 500,
    user_daily_video_limit: 2,
    guest_daily_video_limit: 1,
    guest_video_cost_credits: 4,
    user_video_cost_credits: 6,
    guest_video_locked: false,
    special_unlimited_users: [],
    restricted_users: [],
    free_daily_credits: 50,
    free_daily_photos: 5,
    subscribers_unlimited_photos: true,
    video_tokens: 1500,
    video_model_costs: {
      "omni-1.1-flash-360p": 14,
      "omni-1.1-flash-720p": 30,
      "veo-3.1-lite": 20,
      "veo-3.1-fast": 40,
      "veo-3.1-quality": 120
    },
    video_duration_costs: {
      "omni-1.1-flash-360p": { "4": 8, "6": 10, "8": 12, "10": 14 },
      "omni-1.1-flash-720p": { "4": 14, "6": 20, "8": 24, "10": 30 },
      "veo-3.1-lite": { "8": 20 },
      "veo-3.1-fast": { "8": 40 },
      "veo-3.1-quality": { "8": 120 }
    }
  });

  // Module 2b: Tool Rewards Configuration (24h Expiry)
  const [toolRewards, setToolRewards] = useState<Record<string, { name: string; enabled: boolean; credits: number }>>({
    "pdf-merge": { name: "Merge PDF", enabled: true, credits: 5 },
    "pdf-split": { name: "Split PDF", enabled: true, credits: 5 },
    "image-compress": { name: "Compress Image", enabled: true, credits: 3 },
    "image-remove-bg": { name: "Remove Background", enabled: true, credits: 5 },
    "pdf-to-word": { name: "PDF to Word", enabled: true, credits: 5 },
    "image-convert": { name: "Convert Image", enabled: true, credits: 2 },
    "video-compress": { name: "Compress Video", enabled: true, credits: 5 },
    "video-to-gif": { name: "Video to GIF", enabled: true, credits: 3 },
    "audio-converter": { name: "Audio Converter", enabled: true, credits: 3 },
    "word-counter": { name: "Word Counter", enabled: true, credits: 1 },
  });
  const [newToolSlug, setNewToolSlug] = useState("");
  const [newToolName, setNewToolName] = useState("");
  const [newToolCredits, setNewToolCredits] = useState(5);

  // ----------------------------------------------------
  // Module 3: Gift & Discount Promotion
  // ----------------------------------------------------
  const [promotions, setPromotions] = useState({
    active: true,
    title: "⚡ Special Launch Offer: Unlimited Access",
    badge: "25% OFF",
    discount_percentage: 25,
    code: "BOTOCK25",
    banner_text: "🎁 Limited Time Gift: Get 25% OFF all Pro plans + 1,500 High-Speed Video Tokens!",
  });

  // ----------------------------------------------------
  // Module 4: Plans & Pricing
  // ----------------------------------------------------
  const [plans, setPlans] = useState<PlanItem[]>([]);

  // ----------------------------------------------------
  // Module 5: Complaints
  // ----------------------------------------------------
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [complaintSearch, setComplaintSearch] = useState("");

  // ----------------------------------------------------
  // Module 6: Dynamic Jobs (Join Us)
  // ----------------------------------------------------
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [newJob, setNewJob] = useState({
    title: "",
    department: "Engineering",
    location: "Global Remote",
    type: "Full-Time",
    desc: "",
    requirementsStr: "",
  });

  // ----------------------------------------------------
  // Module 7: Multi-Block Blog Studio
  // ----------------------------------------------------
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogCategory, setBlogCategory] = useState("ai");
  const [blogCategoryLabel, setBlogCategoryLabel] = useState("Generative AI");
  const [blogAuthor, setBlogAuthor] = useState("Botock Editorial");
  const [blogReadTime, setBlogReadTime] = useState("5 min read");
  const [blogBlocks, setBlogBlocks] = useState<BlockItem[]>([
    { type: "paragraph", content: "" },
    { type: "attachment", url: "", caption: "" },
    { type: "paragraph", content: "" },
  ]);

  // ----------------------------------------------------
  // Module 8: Tool Access Rules
  // ----------------------------------------------------
  const [toolRules, setToolRules] = useState<ToolRule[]>([]);

  // ----------------------------------------------------
  // Module 9: Policies
  // ----------------------------------------------------
  const [policies, setPolicies] = useState({
    privacy_policy: "",
    terms_of_service: "",
  });

  // Check Session on mount
  useEffect(() => {
    const activeToken = token || "";
    setAdminToken(activeToken);
    if (email) setAdminEmail(email);
    if (activeToken) {
      loadAllData(activeToken);
    }
  }, [token, email]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async (token: string) => {
    const backendUrl = await getBackendUrl();
    try {
      // 1. Platform Config (Quotas, Promotions, Plans, Tool Rules, Policies)
      const resConfig = await fetch(`${backendUrl}/api/public/platform-config`);
      if (resConfig.ok) {
        const data = await resConfig.json();
        if (data.quotas) setQuotas(data.quotas);
        if (data.promotions) setPromotions(data.promotions);
        if (data.plans) setPlans(data.plans);
        if (data.tool_rules) setToolRules(data.tool_rules);
        if (data.policies) setPolicies(data.policies);
        if (data.tool_rewards) setToolRewards(data.tool_rewards);
      }

      // 2. Complaints
      const resComplaints = await fetch(`${backendUrl}/api/admin/complaints`, {
        headers: { "x-admin-token": token },
      });
      if (resComplaints.ok) {
        setComplaints(await resComplaints.json());
      }

      // 3. Jobs
      const resJobs = await fetch(`${backendUrl}/api/public/jobs`);
      if (resJobs.ok) {
        setJobs(await resJobs.json());
      }

      // 4. Blogs
      const resBlogs = await fetch(`${backendUrl}/api/public/blogs`);
      if (resBlogs.ok) {
        setBlogs(await resBlogs.json());
      }

      // 5. Analytics
      try {
        const resToolUsage = await fetch(`/api/analytics/tool-usage`);
        if (resToolUsage.ok) {
          setToolUsage(await resToolUsage.json());
        }
      } catch (e) {
        console.warn("Failed to load tool usage analytics:", e);
      }

      const resAnalytics = await fetch(`${backendUrl}/api/admin/analytics`, {
        headers: { "x-admin-token": token },
      });
      if (resAnalytics.ok) {
        setAnalytics(await resAnalytics.json());
      }
      
      const resStats = await fetch(`${backendUrl}/api/admin/stats`, {
        headers: { "x-admin-token": token },
      });
      if (resStats.ok) {
        const statsData = await resStats.json();
        if (statsData.video_stats) setVideoStats(statsData.video_stats);
      }

      // 6. Subscription Requests
      const resSubs = await fetch(`${backendUrl}/api/admin/subscription-requests`, {
        headers: { "x-admin-token": token },
      });
      if (resSubs.ok) {
        setSubRequests(await resSubs.json());
      }

      // 7. Users with VIP / Limit status
      const resUsers = await fetch(`${backendUrl}/api/admin/users`, {
        headers: { "x-admin-token": token },
      });
      if (resUsers.ok) {
        const uData = await resUsers.json();
        if (uData.users) setUsersList(uData.users);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleLockAndExit = () => {
    try {
      localStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_token");
      document.cookie = "admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const handleToggleVip = async (userEmail: string) => {
    try {
      setLoading(true);
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/users/toggle-vip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to toggle VIP status.");
      const data = await res.json();
      setUsersList((prev) =>
        prev.map((u) => (u.email.toLowerCase() === userEmail.toLowerCase() ? { ...u, is_vip: data.is_vip } : u))
      );
      showToast(`${userEmail} VIP Unlimited: ${data.is_vip ? "Granted ⭐" : "Revoked"}`);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRestrict = async (userEmail: string) => {
    try {
      setLoading(true);
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/users/toggle-restrict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to toggle restriction.");
      const data = await res.json();
      setUsersList((prev) =>
        prev.map((u) => (u.email.toLowerCase() === userEmail.toLowerCase() ? { ...u, is_restricted: data.is_restricted } : u))
      );
      showToast(`${userEmail} ${data.is_restricted ? "Restricted 🚫" : "Activated"}`);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVipManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVipEmail.trim() || !newVipEmail.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    await handleToggleVip(newVipEmail.trim());
    setNewVipEmail("");
    loadAllData(adminToken || "");
  };

  // ----------------------------------------------------
  // Trigger 2-Step Protected Action
  // ----------------------------------------------------
  const executeWithTwoStep = (actionFn: (code: string) => Promise<void>) => {
    setPendingAction(() => actionFn);
    setTwoStepCode("");
    setTwoStepError("");
    setShowTwoStepModal(true);
  };

  const handleConfirmTwoStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoStepCode.trim()) {
      setTwoStepError("Please enter the 2-step verification code or admin secret.");
      return;
    }
    setLoading(true);
    setTwoStepError("");

    try {
      if (pendingAction) {
        await pendingAction(twoStepCode.trim());
      }
      setShowTwoStepModal(false);
      setPendingAction(null);
      setTwoStepCode("");
    } catch (err: any) {
      setTwoStepError(err.message || "2-Step authorization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuotas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${await getBackendUrl()}/api/admin/quotas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify(quotas),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update quotas.");
      showToast("Quota & Token allocation updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update quotas.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToolRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${await getBackendUrl()}/api/admin/tool-rewards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify(toolRewards),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update tool rewards.");
      showToast("Tool usage rewards updated live! (24h expiration rule active)");
    } catch (err: any) {
      showToast(err.message || "Failed to update tool rewards.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${await getBackendUrl()}/api/admin/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify(promotions),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update promotion.");
      showToast("Gift & Discount promotion saved live!");
    } catch (err: any) {
      showToast(err.message || "Failed to update promotion.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${await getBackendUrl()}/api/admin/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify(plans),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update subscription plans.");
      showToast("Subscription plans and features updated live!");
    } catch (err: any) {
      showToast(err.message || "Failed to update subscription plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToolRules = () => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${await getBackendUrl()}/api/admin/tool-rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify(toolRules),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update tool matrix.");
      showToast("Tool access rules and 'In Development' states saved!");
    });
  };

  const handleSavePolicies = () => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${await getBackendUrl()}/api/admin/policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify(policies),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update policies.");
      showToast("Privacy policy & terms updated live!");
    });
  };

  const handleComplaintStatus = (ticketId: string, newStatus: string) => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${await getBackendUrl()}/api/admin/complaints/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify({ ticket_id: ticketId, status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update complaint.");
      setComplaints((prev) =>
        prev.map((c) => (c.id === ticketId ? { ...c, status: newStatus } : c))
      );
      showToast(`Complaint ${ticketId} status changed to ${newStatus}`);
    });
  };

  const handleCreateJob = () => {
    if (!newJob.title.trim() || !newJob.desc.trim()) {
      showToast("Please provide job title and description.", "error");
      return;
    }
    executeWithTwoStep(async (code) => {
      const reqs = newJob.requirementsStr
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const res = await fetch(`${await getBackendUrl()}/api/admin/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify({
          title: newJob.title.trim(),
          department: newJob.department.trim(),
          location: newJob.location.trim(),
          type: newJob.type.trim(),
          desc: newJob.desc.trim(),
          requirements: reqs.length > 0 ? reqs : ["Demonstrated expertise in field"],
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to post job.");
      const data = await res.json();
      setJobs(data.jobs);
      setNewJob({ title: "", department: "Engineering", location: "Global Remote", type: "Full-Time", desc: "", requirementsStr: "" });
      showToast("New career posting published to /join-us live!");
    });
  };

  const handleDeleteJob = (jobId: string) => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${await getBackendUrl()}/api/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to delete job.");
      const data = await res.json();
      setJobs(data.jobs);
      showToast("Job posting removed from /join-us.");
    });
  };

  const handlePublishBlog = () => {
    if (!blogTitle.trim() || !blogExcerpt.trim()) {
      showToast("Please provide blog title and summary excerpt.", "error");
      return;
    }
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${await getBackendUrl()}/api/admin/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify({
          title: blogTitle.trim(),
          excerpt: blogExcerpt.trim(),
          category: blogCategory,
          categoryLabel: blogCategoryLabel,
          readTime: blogReadTime,
          author: blogAuthor,
          blocks: blogBlocks.filter((b) => (b.type === "paragraph" ? b.content?.trim() : b.url?.trim())),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to publish blog.");
      const data = await res.json();
      setBlogs(data.blogs);
      setBlogTitle("");
      setBlogExcerpt("");
      showToast("Multi-block blog article published live!");
    });
  };

  const handleDeleteBlog = (blogId: string) => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${await getBackendUrl()}/api/admin/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to delete blog.");
      const data = await res.json();
      setBlogs(data.blogs);
      showToast("Blog article deleted.");
    });
  };

  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch(`${await getBackendUrl()}/api/admin/test-smtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify({ test_email: smtpTestEmail || undefined }),
      });
      const data = await res.json();
      setSmtpTestResult(data);
      if (data.success) {
        showToast(data.message, "success");
      } else {
        showToast(data.message || "Zoho SMTP connection test failed.", "error");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to reach backend SMTP test service.";
      setSmtpTestResult({ success: false, message: msg });
      showToast(msg, "error");
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleSendUpdate = async () => {
    if (!updateToEmail || !updateSubject || !updateBody) {
      showToast("Please fill in recipient email, subject, and message content.", "error");
      return;
    }
    setSendingUpdate(true);
    try {
      const res = await fetch(`${await getBackendUrl()}/api/admin/send-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken || "",
        },
        body: JSON.stringify({
          to_email: updateToEmail,
          subject: updateSubject,
          body_text: updateBody,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        setUpdateSubject("");
        setUpdateBody("");
      } else {
        showToast(data.detail || "Failed to send update email via Zoho SMTP.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to send update email.", "error");
    } finally {
      setSendingUpdate(false);
    }
  };

  return (
    <div className="min-h-[800px] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-50 dark:bg-[#09090c] text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border flex items-center gap-3 text-sm shadow-2xl backdrop-blur-md transition-all ${
            toast.type === "error"
              ? "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-200"
              : "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-200"
          }`}
        >
          {toast.type === "error" ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 2-Step Verification Modal */}
      {showTwoStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111116] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">2-Step Security Challenge</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Critical modification requires confirmation</p>
              </div>
            </div>

            {twoStepError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-300">
                {twoStepError}
              </div>
            )}

            <form onSubmit={handleConfirmTwoStep} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Enter 2-Step Verification Code or Admin Secret
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    autoFocus
                    required
                    value={twoStepCode}
                    onChange={(e) => setTwoStepCode(e.target.value)}
                    placeholder="Enter code to commit changes"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTwoStepModal(false);
                    setPendingAction(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Authorize & Commit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Admin Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d0d12]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Botock Master Command Center
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                Live Engine
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{adminEmail}</div>
            <div className="text-[10px] text-slate-500 font-mono">Master Administrator (.env)</div>
          </div>
          <button
            onClick={handleLockAndExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock & Exit</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0b0f] p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "analytics" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Visitors & Countries</span>
          </button>

          <button
            onClick={() => setActiveTab("quotas")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "quotas" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Flow Credits & Limits</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "users" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Users & VIP Access</span>
            </div>
            {usersList.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                {usersList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("complaints")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "complaints" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Complaints ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "jobs" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Join Us Careers</span>
          </button>

          <button
            onClick={() => setActiveTab("blogs")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "blogs" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Knowledge Hub CMS</span>
          </button>

          <button
            onClick={() => setActiveTab("tools")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "tools" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tool Restrictions</span>
          </button>

          <button
            onClick={() => setActiveTab("policies")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "policies" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy & Policies</span>
          </button>

          <button
            onClick={() => setActiveTab("email")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "email" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Zoho Mail & Updates</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-y-auto">
          {/* TAB 1: ANALYTICS & VISITORS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Visitors & Demographics Intelligence</h2>
                <p className="text-xs text-slate-400 mt-1">Live metrics across daily, weekly, and monthly active timeframes</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Live Visitors</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">{analytics.visitors.live}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Active within last 5 mins</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800">
                  <div className="text-slate-400 text-xs mb-2">Daily Visitors</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{analytics.visitors.daily.toLocaleString()}</div>
                  <div className="text-[11px] text-indigo-400 mt-1">+14.2% vs yesterday</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800">
                  <div className="text-slate-400 text-xs mb-2">Weekly Visitors</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{analytics.visitors.weekly.toLocaleString()}</div>
                  <div className="text-[11px] text-indigo-400 mt-1">Active this week</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800">
                  <div className="text-slate-400 text-xs mb-2">Monthly Visitors</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{analytics.visitors.monthly.toLocaleString()}</div>
                  <div className="text-[11px] text-purple-400 mt-1">MRR: {analytics.mrr}</div>
                </div>
              </div>

              {/* Countries Breakdown Table */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Geographic Distribution (Users Kis Country Se Zyada Hain)</span>
                </h3>
                <div className="space-y-3">
                  {analytics.countries.map((c) => (
                    <div key={c.country} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{c.country} ({c.code})</span>
                        <span className="text-slate-400 font-mono">{c.percentage}% ({c.users.toLocaleString()} users)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLOW CREDITS & GENERATION QUOTA */}
          {activeTab === "quotas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Google Flow Pool & Video Generation Quotas</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Set your Google Flow monthly credit pool and daily/monthly video limits. Generation stops automatically when quota is reached.
                  </p>
                </div>
                <button
                  onClick={handleSaveQuotas}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Quotas & Pool</span>
                </button>
              </div>

              {/* Calculation Rules Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-indigo-950/20 to-purple-950/20 border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                    4cr
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">Guest Video (4s Duration)</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Costs exactly <strong>4 Flow Credits</strong> per generation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                    6cr
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-200">Logged-In User (8s Duration)</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Costs exactly <strong>6 Flow Credits</strong> (360p standard).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    ⭐
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-200">VIP Unlimited Users</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Exempt from all limits; never blocked by daily or monthly caps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Monthly Flow Pool Gauge & Live Usage */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Google Flow Monthly Credit Pool Budget
                    </span>
                    <div className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                      <span>{videoStats.this_month_flow_credits || 0}</span>
                      <span className="text-slate-500 text-sm font-normal">
                        / {(quotas.flow_monthly_credit_pool || 5000).toLocaleString()} Flow Credits Used This Month
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 whitespace-nowrap">Monthly Pool Size:</label>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={quotas.flow_monthly_credit_pool || 5000}
                      onChange={(e) => setQuotas({ ...quotas, flow_monthly_credit_pool: parseInt(e.target.value) || 5000 })}
                      className="w-32 px-3 py-1.5 bg-black/60 border border-slate-700 rounded-xl text-sm font-mono text-white text-right"
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ((videoStats.this_month_flow_credits || 0) / (quotas.flow_monthly_credit_pool || 5000)) > 0.9
                        ? "bg-rose-500"
                        : "bg-gradient-to-r from-indigo-500 to-amber-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round(((videoStats.this_month_flow_credits || 0) / (quotas.flow_monthly_credit_pool || 5000)) * 100))}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Today Consumed: {videoStats.today_flow_credits || 0} credits</span>
                  <span>
                    Remaining: {Math.max(0, (quotas.flow_monthly_credit_pool || 5000) - (videoStats.this_month_flow_credits || 0))} credits
                  </span>
                </div>
              </div>

              {/* Global Quotas & Limits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Platform Daily Video Cap */}
                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Platform Daily Video Cap
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quotas.global_daily_video_limit || 30}
                    onChange={(e) => setQuotas({ ...quotas, global_daily_video_limit: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-base font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-500">Combined max videos generated per day across all users.</p>
                </div>

                {/* Platform Monthly Video Cap */}
                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Platform Monthly Video Cap
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quotas.global_monthly_video_limit || 500}
                    onChange={(e) => setQuotas({ ...quotas, global_monthly_video_limit: parseInt(e.target.value) || 500 })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-base font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-500">Combined max videos per calendar month.</p>
                </div>

                {/* Per-User Daily Limit */}
                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Per-User Daily Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quotas.user_daily_video_limit || 2}
                    onChange={(e) => setQuotas({ ...quotas, user_daily_video_limit: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-base font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-500">Daily video limit for standard logged-in accounts.</p>
                </div>

                {/* Guest Daily Limit & Lock */}
                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Guest Daily Limit (Per IP)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quotas.guest_daily_video_limit || 1}
                      onChange={(e) => setQuotas({ ...quotas, guest_daily_video_limit: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-base font-mono text-white mt-1"
                    />
                  </div>
                  
                  <button
                    onClick={() => setQuotas({ ...quotas, guest_video_locked: !quotas.guest_video_locked })}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      quotas.guest_video_locked 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {quotas.guest_video_locked ? 'Guests Locked (No Gen)' : 'Guests Allowed'}
                  </button>
                </div>

              </div>

              {/* End-User Privacy Protection Banner */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <span className="font-bold text-slate-300">User Experience Guarantee: </span>
                  When daily or monthly quota is reached, visitors only see: 
                  <span className="italic text-amber-300"> "Service temporarily unavailable. Quota full for today. Please try again tomorrow." </span>
                  Your Google Flow backend credits pool is never revealed to public visitors.
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-sm font-bold text-slate-200">Video Generation Models & Base Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Omni Flash 360p (10s Base)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={quotas.video_model_costs?.["omni-1.1-flash-360p"] || 14}
                      onChange={(e) => setQuotas({ 
                        ...quotas, 
                        video_model_costs: { ...quotas.video_model_costs, "omni-1.1-flash-360p": parseInt(e.target.value) || 14 }
                      })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-slate-500">Flow: 4-7 cr | Us: 8-14 cr (4s, 6s, 8s, 10s)</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Omni Flash 720p (10s Base)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={quotas.video_model_costs?.["omni-1.1-flash-720p"] || 30}
                      onChange={(e) => setQuotas({ 
                        ...quotas, 
                        video_model_costs: { ...quotas.video_model_costs, "omni-1.1-flash-720p": parseInt(e.target.value) || 30 }
                      })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-slate-500">Flow: 7-15 cr | Us: 14-30 cr (4s, 6s, 8s, 10s)</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Veo 3.1 Lite (720p 8s)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={quotas.video_model_costs?.["veo-3.1-lite"] || 20}
                      onChange={(e) => setQuotas({ 
                        ...quotas, 
                        video_model_costs: { ...quotas.video_model_costs, "veo-3.1-lite": parseInt(e.target.value) || 20 }
                      })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-slate-500">Flow: 10 cr | Our Charge: 20 cr (8s 720p)</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Veo 3.1 Fast (720p 8s)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={quotas.video_model_costs?.["veo-3.1-fast"] || 40}
                      onChange={(e) => setQuotas({ 
                        ...quotas, 
                        video_model_costs: { ...quotas.video_model_costs, "veo-3.1-fast": parseInt(e.target.value) || 40 }
                      })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-slate-500">Flow: 20 cr | Our Charge: 40 cr (8s 720p)</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Veo 3.1 Quality (720p 8s)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={quotas.video_model_costs?.["veo-3.1-quality"] || 120}
                      onChange={(e) => setQuotas({ 
                        ...quotas, 
                        video_model_costs: { ...quotas.video_model_costs, "veo-3.1-quality": parseInt(e.target.value) || 120 }
                      })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-slate-500">Flow: 100 cr | Our Charge: 120 cr (8s 720p)</p>
                  </div>
                </div>
              </div>

              {/* MODULE: Tool Usage Reward Credits (24h Expiry) */}
              <div className="pt-6 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Gift className="w-5 h-5 text-amber-400" />
                      <span>Tool Usage Reward Credits (24h Expiration)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Award credit points to users whenever they use a creative tool. Credits automatically expire 24 hours after being earned.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveToolRewards}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/20 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Tool Rewards</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>How it works:</strong> When a user finishes processing in an enabled tool (e.g. Merge PDF, Compress Image), the system grants them these credit points with a 24-hour expiration countdown. A 5-minute cooldown prevents automated spamming.
                  </span>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(toolRewards).map(([slug, cfg]) => (
                    <div
                      key={slug}
                      className="p-3.5 rounded-xl bg-[#111116] border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            setToolRewards({
                              ...toolRewards,
                              [slug]: { ...cfg, enabled: !cfg.enabled },
                            });
                          }}
                          className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                            cfg.enabled ? "bg-amber-500" : "bg-slate-800"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                              cfg.enabled ? "left-5" : "left-0.5"
                            }`}
                          />
                        </button>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{cfg.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">/tools/{slug}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400">Reward:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={cfg.credits}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setToolRewards({
                                ...toolRewards,
                                [slug]: { ...cfg, credits: val },
                              });
                            }}
                            className="w-14 px-2 py-1 bg-black/60 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400 text-center"
                          />
                          <span className="text-[10px] font-bold text-slate-500">pts (24h)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...toolRewards };
                            delete updated[slug];
                            setToolRewards(updated);
                          }}
                          className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                          title="Remove Tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Tool Form */}
                <div className="p-4 rounded-xl bg-black/40 border border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="Tool slug (e.g. image-upscale)"
                    value={newToolSlug}
                    onChange={(e) => setNewToolSlug(e.target.value.toLowerCase().trim())}
                    className="w-full sm:flex-1 px-3 py-1.5 bg-black border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Display Name (e.g. Image Upscaler)"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-1.5 bg-black border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newToolCredits}
                      onChange={(e) => setNewToolCredits(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1.5 bg-black border border-slate-700 rounded-lg text-xs font-mono text-amber-400 text-center"
                    />
                    <span className="text-[10px] text-slate-400">pts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newToolSlug || !newToolName) {
                        showToast("Please enter tool slug and name.", "error");
                        return;
                      }
                      setToolRewards({
                        ...toolRewards,
                        [newToolSlug]: {
                          name: newToolName,
                          enabled: true,
                          credits: newToolCredits,
                        },
                      });
                      setNewToolSlug("");
                      setNewToolName("");
                      setNewToolCredits(5);
                      showToast(`Added ${newToolName} to reward list.`);
                    }}
                    className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    + Add Tool
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GIFT & DISCOUNT PROMOTION */}
          {activeTab === "promotions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Gift Offer & Discount Campaign</h2>
                  <p className="text-xs text-slate-400 mt-1">Show a promotional discount banner across pricing and header</p>
                </div>
                <button
                  onClick={handleSavePromotions}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Discount</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="text-sm font-bold text-white">Enable Discount Banner on Platform</div>
                    <div className="text-xs text-slate-400">Toggles visibility on live /services and announcement bar</div>
                  </div>
                  <button
                    onClick={() => setPromotions({ ...promotions, active: !promotions.active })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      promotions.active ? "bg-indigo-600" : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        promotions.active ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Title</label>
                    <input
                      type="text"
                      value={promotions.title}
                      onChange={(e) => setPromotions({ ...promotions, title: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Badge Label</label>
                    <input
                      type="text"
                      value={promotions.badge}
                      onChange={(e) => setPromotions({ ...promotions, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Value (% or $ off)</label>
                    <input
                      type="number"
                      value={promotions.discount_percentage}
                      onChange={(e) => setPromotions({ ...promotions, discount_percentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon / Gift Code</label>
                    <input
                      type="text"
                      value={promotions.code}
                      onChange={(e) => setPromotions({ ...promotions, code: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notification Banner Text</label>
                  <textarea
                    rows={2}
                    value={promotions.banner_text}
                    onChange={(e) => setPromotions({ ...promotions, banner_text: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT & VIP UNLIMITED ACCESS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    <span>User Management & VIP Unlimited Engine</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Track generations per user, grant special VIP access (bypass all limits), or restrict abusive accounts.
                  </p>
                </div>
                <button
                  onClick={() => loadAllData(adminToken || "")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Users</span>
                </button>
              </div>

              {/* Add VIP Form & Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Bar */}
                <div className="p-4 rounded-2xl bg-[#111116] border border-slate-800 flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by user email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch("")}
                      className="text-slate-500 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Add VIP Fast */}
                <form
                  onSubmit={handleAddVipManual}
                  className="p-4 rounded-2xl bg-[#111116] border border-slate-800 flex items-center gap-3"
                >
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <input
                    type="email"
                    placeholder="Enter email to make VIP Unlimited..."
                    value={newVipEmail}
                    onChange={(e) => setNewVipEmail(e.target.value)}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Add VIP
                  </button>
                </form>
              </div>

              {/* Users Table */}
              <div className="bg-[#111116] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Registered User Accounts ({usersList.length})
                  </h3>
                </div>

                {usersList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No registered user accounts found yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800 font-semibold">
                        <tr>
                          <th className="p-3">User Email</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-center">Videos Today</th>
                          <th className="p-3 text-center">Videos This Month</th>
                          <th className="p-3 text-center">All-Time Total</th>
                          <th className="p-3 text-center">Quota Rule</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {usersList
                          .filter((u) => !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                          .map((u) => (
                            <tr key={u.email} className="hover:bg-white/[0.02]">
                              <td className="p-3 font-semibold text-white">
                                <div className="flex items-center gap-2">
                                  <span>{u.email}</span>
                                  {u.is_vip && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                                      ⭐ VIP Unlimited
                                    </span>
                                  )}
                                  {u.is_restricted && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                      Banned
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-slate-400 capitalize">{u.status || "active"}</td>
                              <td className="p-3 text-center font-mono font-bold text-indigo-400">{u.videos_today || 0}</td>
                              <td className="p-3 text-center font-mono font-bold text-indigo-300">{u.videos_month || 0}</td>
                              <td className="p-3 text-center font-mono text-slate-400">{u.total_videos || 0}</td>
                              <td className="p-3 text-center">
                                {u.is_vip ? (
                                  <span className="text-[11px] font-bold text-amber-400">Unlimited (Bypasses Limits)</span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Standard Daily Quota</span>
                                )}
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={() => handleToggleVip(u.email)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                    u.is_vip
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  }`}
                                >
                                  {u.is_vip ? "⭐ VIP Active" : "Make VIP"}
                                </button>
                                <button
                                  onClick={() => handleToggleRestrict(u.email)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                    u.is_restricted
                                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
                                      : "bg-slate-800 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40"
                                  }`}
                                >
                                  {u.is_restricted ? "Restricted" : "Restrict"}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}



          
        {activeTab === "tool-usage" && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-violet-500" /> Tool Usage Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 rounded-2xl bg-[#111115] border border-white/[0.05]">
                 <h3 className="text-sm font-bold text-white mb-4">Most Used Tools</h3>
                 <div className="space-y-3">
                   {toolUsage.summary.slice(0, 10).map((tool, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                        <div>
                          <p className="text-sm font-bold">{tool.tool_name}</p>
                          <p className="text-xs text-emerald-500">{tool.success} Success | <span className="text-rose-500">{tool.error} Failed</span></p>
                        </div>
                        <div className="text-xl font-black text-slate-700">#{i + 1}</div>
                      </div>
                   ))}
                   {toolUsage.summary.length === 0 && <p className="text-xs text-slate-500">No usage data yet.</p>}
                 </div>
               </div>
               <div className="p-6 rounded-2xl bg-[#111115] border border-white/[0.05] overflow-auto max-h-[400px]">
                 <h3 className="text-sm font-bold text-rose-500 mb-4">Recent Errors & Failures</h3>
                 <div className="space-y-3">
                   {toolUsage.errors.map((err, i) => (
                      <div key={i} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                         <div className="font-bold text-rose-400 mb-1">{err.tool_name} <span className="text-slate-500 font-normal">({new Date(err.used_at).toLocaleString()})</span></div>
                         <div className="text-rose-300">{err.error_message}</div>
                      </div>
                   ))}
                   {toolUsage.errors.length === 0 && <p className="text-xs text-slate-500">No errors recorded.</p>}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Complaints & Grievance Tickets</h2>
                  <p className="text-xs text-slate-400 mt-1">Live customer dispute resolution under 24h SLA</p>
                </div>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ticket ID or email..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {complaints.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-[#111116] border border-slate-800 rounded-2xl">
                    No active complaint tickets filed.
                  </div>
                ) : (
                  complaints
                    .filter(
                      (c) =>
                        c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                        c.email.toLowerCase().includes(complaintSearch.toLowerCase())
                    )
                    .map((c) => (
                      <div key={c.id} className="p-5 rounded-2xl bg-[#111116] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-400">{c.id}</span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {c.category}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                                c.status === "Resolved"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : c.status === "Under Review"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 font-medium">{c.email}</div>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{c.description}</p>
                          <div className="text-[10px] text-slate-500">{c.createdAt}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleComplaintStatus(c.id, "Under Review")}
                            className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium cursor-pointer"
                          >
                            Mark Review
                          </button>
                          <button
                            onClick={() => handleComplaintStatus(c.id, "Resolved")}
                            className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: JOIN US CAREERS */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Join Us Careers Portal Manager</h2>
                <p className="text-xs text-slate-400 mt-1">Live vacancies posted here will directly render on /join-us</p>
              </div>

              {/* Add Job Form */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>Post New Career Opening</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Backend Engineer (FastAPI)"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="AI Research / Engineering"
                      value={newJob.department}
                      onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="Global Remote / Hybrid"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Job Type</label>
                    <input
                      type="text"
                      placeholder="Full-Time / Contract"
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe role mission and responsibilities..."
                    value={newJob.desc}
                    onChange={(e) => setNewJob({ ...newJob, desc: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Requirements (1 per line)</label>
                  <textarea
                    rows={3}
                    placeholder="4+ years experience with Next.js&#10;Deep understanding of Playwright&#10;Proficiency in Python"
                    value={newJob.requirementsStr}
                    onChange={(e) => setNewJob({ ...newJob, requirementsStr: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <button
                  onClick={handleCreateJob}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Job (2-Step)</span>
                </button>
              </div>

              {/* Current Jobs List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Openings ({jobs.length})</h3>
                {jobs.map((j) => (
                  <div key={j.id} className="p-5 rounded-2xl bg-[#111116] border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">{j.title}</div>
                      <div className="text-xs text-indigo-400 mt-0.5">{j.department} • {j.location} • {j.type}</div>
                      <p className="text-xs text-slate-400 mt-2 max-w-2xl">{j.desc}</p>
                      <ul className="mt-2 text-[11px] text-slate-500 list-disc list-inside">
                        {j.requirements?.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BLOG CMS */}
          {activeTab === "blogs" && <BlogCMS />}

          {/* TAB 8: TOOL ACCESS RULES */}
          {activeTab === "tools" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Tool Access & In-Development Controls</h2>
                  <p className="text-xs text-slate-400 mt-1">Lock tools for free users or restrict completely with "In Development" notice</p>
                </div>
                <button
                  onClick={handleSaveToolRules}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Tool Matrix (2-Step)</span>
                </button>
              </div>

              <div className="space-y-3">
                {toolRules.map((t, idx) => (
                  <div key={t.id} className="p-5 rounded-2xl bg-[#111116] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">ID: {t.id}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Pro Only Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...toolRules];
                          updated[idx].isProOnly = !updated[idx].isProOnly;
                          setToolRules(updated);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          t.isProOnly
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-black/40 border-slate-700 text-slate-400"
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t.isProOnly ? "Pro Tier Only" : "Free Access"}</span>
                      </button>

                      {/* In Development Complete Lock */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...toolRules];
                          updated[idx].isInDevelopment = !updated[idx].isInDevelopment;
                          setToolRules(updated);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          t.isInDevelopment
                            ? "bg-red-500/20 border-red-500/40 text-red-300"
                            : "bg-black/40 border-slate-700 text-slate-400"
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t.isInDevelopment ? "In Development (Locked)" : "Operational"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: POLICIES */}
          {activeTab === "policies" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Privacy Policy & Terms Editor</h2>
                  <p className="text-xs text-slate-400 mt-1">Live platform agreements and compliance text</p>
                </div>
                <button
                  onClick={handleSavePolicies}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Policies (2-Step)</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Privacy Policy</label>
                  <textarea
                    rows={8}
                    value={policies.privacy_policy}
                    onChange={(e) => setPolicies({ ...policies, privacy_policy: e.target.value })}
                    className="w-full px-4 py-3 bg-black/60 border border-slate-700 rounded-xl text-xs text-slate-200 leading-relaxed font-mono"
                  />
                </div>

                <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Terms of Service</label>
                  <textarea
                    rows={8}
                    value={policies.terms_of_service}
                    onChange={(e) => setPolicies({ ...policies, terms_of_service: e.target.value })}
                    className="w-full px-4 py-3 bg-black/60 border border-slate-700 rounded-xl text-xs text-slate-200 leading-relaxed font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ZOHO MAIL & UPDATES */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <span>Zoho Mail (info@botock.app) & Updates</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Connected domain email service for OTPs, Password Resets, Admin Alerts & User Announcements
                  </p>
                </div>
              </div>

              {/* Status & Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Connected Sender</div>
                  <div className="text-base font-semibold text-emerald-400 font-mono">info@botock.app</div>
                  <div className="text-xs text-slate-400">Zoho Mail Pro SMTP (smtppro.zoho.com:587)</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credential Security</div>
                  <div className="text-base font-semibold text-amber-400 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>App Password Protected</span>
                  </div>
                  <div className="text-xs text-slate-400">Strictly stored in backend/.env (Never exposed)</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Anti-Spam Shield</div>
                  <div className="text-base font-semibold text-indigo-400">60s Cooldown Active</div>
                  <div className="text-xs text-slate-400">Max 4 OTP/hr per email • Max 8/15m per IP</div>
                </div>
              </div>

              {/* Manual SMTP Diagnostic Card */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>Manual SMTP Diagnostic Test</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Send a live test ping to ensure your Zoho 12-digit App Password is connected and sending emails smoothly.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="email"
                    value={smtpTestEmail}
                    onChange={(e) => setSmtpTestEmail(e.target.value)}
                    placeholder="Enter recipient email (defaults to info@botock.app)"
                    className="flex-1 px-4 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleTestSmtp}
                    disabled={smtpTesting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    {smtpTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>{smtpTesting ? "Testing Connection..." : "Send Test Email"}</span>
                  </button>
                </div>

                {smtpTestResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                      smtpTestResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                    }`}
                  >
                    {smtpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold">{smtpTestResult.success ? "Success" : "Connection Failure"}</div>
                      <div className="mt-0.5">{smtpTestResult.message}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct User Announcement / Update Dispatcher */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Send Announcement / Update to User</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Send branded notifications or feature update announcements from info@botock.app to any user.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={updateToEmail}
                      onChange={(e) => setUpdateToEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-4 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={updateSubject}
                      onChange={(e) => setUpdateSubject(e.target.value)}
                      placeholder="Exciting Update: New AI Features Available on Botock!"
                      className="w-full px-4 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Message Content</label>
                    <textarea
                      rows={5}
                      value={updateBody}
                      onChange={(e) => setUpdateBody(e.target.value)}
                      placeholder="Type the message to be delivered to the user..."
                      className="w-full px-4 py-3 bg-black/60 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500 leading-relaxed font-mono"
                    />
                  </div>

                  <button
                    onClick={handleSendUpdate}
                    disabled={sendingUpdate}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    {sendingUpdate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{sendingUpdate ? "Dispatching..." : "Dispatch Announcement Email"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
