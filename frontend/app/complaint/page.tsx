"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ShieldCheck,
  FileCheck,
  Send,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
} from "lucide-react";

export default function ComplaintPage() {
  const [activeTab, setActiveTab] = useState<"file" | "track">("file");
  const [formData, setFormData] = useState({
    email: "",
    category: "generation",
    severity: "medium",
    referenceId: "",
    description: "",
  });
  const [ticket, setTicket] = useState<string | null>(null);
  const [searchTicket, setSearchTicket] = useState("");
  const [ticketResult, setTicketResult] = useState<any>(null);

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicket(newId);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicket) return;
    setTicketResult({
      id: searchTicket.toUpperCase(),
      status: "Under Review by Operations Lead",
      stage: "Assigned to Engineering Dispatch",
      sla: "Resolution guaranteed within 24h",
      updated: "12 minutes ago",
    });
  };

  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Official Grievance & Complaint Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            File a Formal Complaint or Dispute
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Botock guarantees fair resolution for failed generations, lost credits, billing discrepancies, and technical bugs under our 24-hour service level agreement (SLA).
          </p>

          {/* Tab Switcher */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab("file")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "file" ? "bg-red-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-white"
              }`}
            >
              Submit New Complaint
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "track" ? "bg-red-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-white"
              }`}
            >
              Track Existing Ticket
            </button>
          </div>
        </div>

        {/* Tab 1: File Form */}
        {activeTab === "file" && (
          <div className="max-w-2xl mx-auto rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8">
            {ticket ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 mx-auto flex items-center justify-center border border-red-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Registered & Escalated</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your grievance has been assigned directly to our tier-2 operations lead. You will receive an official response and credit refund determination via email.
                </p>
                <div className="inline-block p-3 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.08]">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Formal Ticket ID: </span>
                  <span className="text-xs font-mono font-bold text-red-400">{ticket}</span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setTicket(null);
                      setFormData({ email: "", category: "generation", severity: "medium", referenceId: "", description: "" });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/[0.08] text-xs font-bold text-slate-900 dark:text-white"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Account Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your-account@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Issue Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
                    >
                      <option value="generation">Failed AI Video Generation (Lost Credits)</option>
                      <option value="billing">Billing or Subscription Dispute</option>
                      <option value="tool-error">Tool Processing Failure (PDF/Video/Image)</option>
                      <option value="security">Security or Privacy Vulnerability</option>
                      <option value="dmca">Copyright / DMCA Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Severity Level
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
                    >
                      <option value="low">Low (General Feedback / Minor Glitch)</option>
                      <option value="medium">Medium (Single Failed Render / Tool Bug)</option>
                      <option value="high">High (Account Locked / Deducted Credits)</option>
                      <option value="critical">Critical (Unauthorized Charge / Security Alert)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Reference ID or Generation Prompt (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Generation Prompt or Invoice # INV-2026-981"
                    value={formData.referenceId}
                    onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Detailed Statement of Complaint *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Please explain what happened, including any error messages and what resolution you expect (e.g. credit refund, account correction)..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Formal Complaint</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Track Status */}
        {activeTab === "track" && (
          <div className="max-w-2xl mx-auto rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8">
            <form onSubmit={handleTrack} className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g. CMP-948210)"
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Ticket</span>
              </button>
            </form>

            {ticketResult && (
              <div className="p-5 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-400">{ticketResult.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    IN PROGRESS
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{ticketResult.status}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Current Phase: {ticketResult.stage}</div>
                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{ticketResult.sla}</span>
                  <span>Updated {ticketResult.updated}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
