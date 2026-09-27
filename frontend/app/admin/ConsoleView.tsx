"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBackendUrl } from "../../utils/runtime-urls";
import {
  Activity,
  Server,
  Users,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Terminal,
  ArrowRight,
  Eye,
  Sliders,
  FileText,
  Trash2,
  Save,
  Globe,
  Zap,
  Sparkles,
  Paperclip,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Plus,
  RefreshCw,
  FileCheck,
  Briefcase,
  Layers,
  ChevronDown,
} from "lucide-react";

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

export default function ConsoleView() {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "analytics" | "quotas" | "promotions" | "plans" | "complaints" | "jobs" | "blogs" | "tools" | "policies"
  >("analytics");

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
  // Module 1: Analytics & Demographics
  // ----------------------------------------------------
  const [analytics, setAnalytics] = useState({
    visitors: { live: 42, daily: 5840, weekly: 38920, monthly: 164500 },
    countries: [
      { country: "Pakistan", code: "PK", percentage: 34, users: 1985 },
      { country: "United States", code: "US", percentage: 28, users: 1635 },
      { country: "United Kingdom", code: "GB", percentage: 14, users: 817 },
      { country: "United Arab Emirates", code: "AE", percentage: 11, users: 642 },
      { country: "India", code: "IN", percentage: 8, users: 467 },
      { country: "Others", code: "GL", percentage: 5, users: 294 },
    ],
    subscribers_total: 482,
    mrr: "$6,840",
  });

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState([
    { email: "spammer_bot99@tempmail.org", ip: "194.26.29.11", reason: "Automated API flood", date: "2026-09-24" },
    { email: "test_scraping@disposable.com", ip: "45.133.1.80", reason: "Rate limit evasion", date: "2026-09-21" },
  ]);

  // ----------------------------------------------------
  // Module 2: Quotas & Tokens
  // ----------------------------------------------------
  const [quotas, setQuotas] = useState({
    free_daily_credits: 50,
    free_daily_photos: 5,
    subscribers_unlimited_photos: true,
    video_tokens: 1500,
  });

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
    const token = sessionStorage.getItem("botock_admin_token");
    const email = sessionStorage.getItem("botock_admin_email");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setAdminToken(token);
    setAdminEmail(email || "admin@botock.ai");
    loadAllData(token);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async (token: string) => {
    const backendUrl = getBackendUrl();
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
      }

      // 2. Complaints
      const resComplaints = await fetch(`${backendUrl}/api/admin/complaints`, {
        headers: { "X-Admin-Token": token },
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
      const resAnalytics = await fetch(`${backendUrl}/api/admin/analytics`, {
        headers: { "X-Admin-Token": token },
      });
      if (resAnalytics.ok) {
        setAnalytics(await resAnalytics.json());
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
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

  // Handlers with 2-Step
  const handleSaveQuotas = () => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${getBackendUrl()}/api/admin/quotas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify(quotas),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update quotas.");
      showToast("Quota & Token allocation updated successfully!");
    });
  };

  const handleSavePromotions = () => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${getBackendUrl()}/api/admin/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify(promotions),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update promotion.");
      showToast("Gift & Discount promotion saved live!");
    });
  };

  const handleSavePlans = () => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${getBackendUrl()}/api/admin/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
        body: JSON.stringify(plans),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update subscription plans.");
      showToast("Subscription plans and features updated live!");
    });
  };

  const handleSaveToolRules = () => {
    executeWithTwoStep(async (code) => {
      const res = await fetch(`${getBackendUrl()}/api/admin/tool-rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
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
      const res = await fetch(`${getBackendUrl()}/api/admin/policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
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
      const res = await fetch(`${getBackendUrl()}/api/admin/complaints/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
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
      const res = await fetch(`${getBackendUrl()}/api/admin/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
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
      const res = await fetch(`${getBackendUrl()}/api/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "X-Admin-Token": adminToken || "",
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
      const res = await fetch(`${getBackendUrl()}/api/admin/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken || "",
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
      const res = await fetch(`${getBackendUrl()}/api/admin/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          "X-Admin-Token": adminToken || "",
          "X-Admin-2Step-Code": code,
        },
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to delete blog.");
      const data = await res.json();
      setBlogs(data.blogs);
      showToast("Blog article deleted.");
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("botock_admin_token");
    sessionStorage.removeItem("botock_admin_email");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090c] text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none transition-colors">
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
            onClick={handleLogout}
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
            <Zap className="w-4 h-4" />
            <span>Credits & Photo Quota</span>
          </button>

          <button
            onClick={() => setActiveTab("promotions")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "promotions" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Gift & Discount Offer</span>
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "plans" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pricing & Subscribers</span>
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
            <span>Multi-Block Blog</span>
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

              {/* Security & Blocked Users Monitoring */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Security & Blocked Users Monitoring</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 font-semibold">User Email</th>
                        <th className="py-2.5 font-semibold">Client IP</th>
                        <th className="py-2.5 font-semibold">Incident Reason</th>
                        <th className="py-2.5 font-semibold">Date Blocked</th>
                        <th className="py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {blockedUsers.map((u) => (
                        <tr key={u.email} className="hover:bg-slate-900/30">
                          <td className="py-3 font-mono text-slate-300">{u.email}</td>
                          <td className="py-3 font-mono text-slate-400">{u.ip}</td>
                          <td className="py-3 text-red-300">{u.reason}</td>
                          <td className="py-3 text-slate-500">{u.date}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-[10px]">
                              RESTRICTED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDITS & PHOTO QUOTA */}
          {activeTab === "quotas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Credits, Tokens & Photo Quota Engine</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure limits for free visitors and token allocations</p>
                </div>
                <button
                  onClick={handleSaveQuotas}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Quotas (2-Step)</span>
                </button>
              </div>

              {/* Subscribers Unlimited Rule Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-200">Subscribers Rule: Unlimited Photos Active</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Subscribers are exempt from all image generation quotas. They can generate <strong>unlimited photos</strong> with Nano Banana 2. This rule is hardwired and guaranteed for all active subscribers.
                  </p>
                </div>
              </div>

              {/* Free Quotas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Free Users Daily Photo Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quotas.free_daily_photos}
                    onChange={(e) => setQuotas({ ...quotas, free_daily_photos: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-base font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-500">How many photos free users can generate each day.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Free Users Daily Credits Balance
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={quotas.free_daily_credits}
                    onChange={(e) => setQuotas({ ...quotas, free_daily_credits: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-base font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-500">Refreshed every 24 hours for non-subscribers.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Video Generation Tokens (Default 1,500)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={quotas.video_tokens}
                    onChange={(e) => setQuotas({ ...quotas, video_tokens: parseInt(e.target.value) || 1500 })}
                    className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-base font-mono text-white"
                  />
                  <p className="text-[11px] text-slate-500">Tokens granted for Google Flow AI video pipelines.</p>
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
                  <span>Save Discount (2-Step)</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="text-sm font-bold text-white">Enable Discount Banner on Platform</div>
                    <div className="text-xs text-slate-400">Toggles visibility on live /pricing and announcement bar</div>
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

          {/* TAB 4: PRICING & SUBSCRIBERS */}
          {activeTab === "plans" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Subscription Plans & Feature Bundles</h2>
                  <p className="text-xs text-slate-400 mt-1">Edit plan pricing and features displayed on /pricing</p>
                </div>
                <button
                  onClick={handleSavePlans}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Plans (2-Step)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p, pIdx) => (
                  <div key={p.id} className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">{p.name}</span>
                      <input
                        type="text"
                        value={p.badge}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[pIdx].badge = e.target.value;
                          setPlans(updated);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 text-right"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Plan Price</label>
                      <input
                        type="text"
                        value={p.price}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[pIdx].price = e.target.value;
                          setPlans(updated);
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-lg font-bold text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Billing Period</label>
                      <input
                        type="text"
                        value={p.period}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[pIdx].period = e.target.value;
                          setPlans(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-xl text-xs text-slate-300"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] text-slate-400 font-semibold">Feature List (1 per line)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...plans];
                            updated[pIdx].features.push("New Feature Benefit");
                            setPlans(updated);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300"
                        >
                          + Add Item
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {p.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => {
                                const updated = [...plans];
                                updated[pIdx].features[fIdx] = e.target.value;
                                setPlans(updated);
                              }}
                              className="flex-1 px-2.5 py-1 bg-black/40 border border-slate-800 rounded-lg text-xs text-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...plans];
                                updated[pIdx].features.splice(fIdx, 1);
                                setPlans(updated);
                              }}
                              className="text-slate-600 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMPLAINTS PORTAL */}
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

          {/* TAB 7: MULTI-BLOCK BLOG STUDIO */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Multi-Block Rich Blog Studio</h2>
                <p className="text-xs text-slate-400 mt-1">Publish structured articles: Title + Attachment + Paragraph + Attachment + Paragraph</p>
              </div>

              {/* Blog Editor */}
              <div className="p-6 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Article Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Mastering Google Flow Video AI: Step-by-Step"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Short Excerpt / Summary</label>
                    <input
                      type="text"
                      placeholder="Brief teaser for blog card..."
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Blocks Builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Article Content Blocks ({blogBlocks.length})
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBlogBlocks([...blogBlocks, { type: "paragraph", content: "" }])}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-indigo-400 hover:text-white"
                      >
                        + Add Paragraph (p)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlogBlocks([...blogBlocks, { type: "attachment", url: "", caption: "" }])}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-purple-400 hover:text-white"
                      >
                        + Add Attachment (Img)
                      </button>
                    </div>
                  </div>

                  {blogBlocks.map((b, bIdx) => (
                    <div key={bIdx} className="p-4 rounded-xl bg-black/40 border border-slate-800 flex items-start gap-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 uppercase mt-2">
                        {b.type}
                      </span>
                      <div className="flex-1 space-y-2">
                        {b.type === "paragraph" ? (
                          <textarea
                            rows={3}
                            placeholder="Write paragraph content..."
                            value={b.content}
                            onChange={(e) => {
                              const updated = [...blogBlocks];
                              updated[bIdx].content = e.target.value;
                              setBlogBlocks(updated);
                            }}
                            className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white leading-relaxed"
                          />
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Image / Attachment URL (https://...)"
                              value={b.url}
                              onChange={(e) => {
                                const updated = [...blogBlocks];
                                updated[bIdx].url = e.target.value;
                                setBlogBlocks(updated);
                              }}
                              className="px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white font-mono"
                            />
                            <input
                              type="text"
                              placeholder="Caption / Description..."
                              value={b.caption}
                              onChange={(e) => {
                                const updated = [...blogBlocks];
                                updated[bIdx].caption = e.target.value;
                                setBlogBlocks(updated);
                              }}
                              className="px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-xs text-white"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...blogBlocks];
                          updated.splice(bIdx, 1);
                          setBlogBlocks(updated);
                        }}
                        className="text-slate-600 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePublishBlog}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Publish Blog Article (2-Step)</span>
                </button>
              </div>

              {/* Published Blogs List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Articles ({blogs.length})</h3>
                {blogs.map((b) => (
                  <div key={b.id} className="p-5 rounded-2xl bg-[#111116] border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">{b.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{b.author} • {b.date || "Recent"} • {b.blocks?.length || 0} blocks</div>
                      <p className="text-xs text-slate-400 mt-2 max-w-2xl">{b.excerpt}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBlog(b.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        </main>
      </div>
    </div>
  );
}
