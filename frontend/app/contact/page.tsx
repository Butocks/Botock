"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  ShieldCheck,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "support",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [ticketId, setTicketId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please complete all required fields.");
      return;
    }

    setStatus("sending");
    setTimeout(() => {
      const generatedId = `BTK-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedId);
      setStatus("success");
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold mb-4">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>24/7 Global Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Contact the Botock Team
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Have a question about Google Flow AI generation, API integrations, custom enterprise plans, or technical support? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Contact Form (Takes 7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8">
            {status === "success" ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. A support engineer will respond to your registered email within <span className="text-white font-semibold">2–4 business hours</span>.
                </p>
                <div className="inline-block p-3 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.08]">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Your Support Ticket ID: </span>
                  <span className="text-xs font-mono font-bold text-violet-400">{ticketId}</span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setFormData({ name: "", email: "", category: "support", subject: "", message: "" });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-white/[0.1] transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      <option value="support">Technical Support</option>
                      <option value="ai-generation">AI Video / Image Generation Help</option>
                      <option value="billing">Billing & Subscriptions</option>
                      <option value="enterprise">Enterprise & Custom API</option>
                      <option value="feedback">Product Feedback & Suggestions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Brief summary of your inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide details about your question, error logs, or request..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{status === "sending" ? "Transmitting Message..." : "Submit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & Social Links (Takes 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Channels Card */}
            <div className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Direct Contact Channels
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Email Support</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">support@botock.ai</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Enterprise: enterprise@botock.ai</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Response Guarantee</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Average response time: 2–4 hours</div>
                    <div className="text-[11px] text-emerald-400 font-medium">Priority queue for Pro creators</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Global Headquarters</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Botock Cloud Systems Inc.</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">San Francisco, CA & Distributed Global Team</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Social Media Communities */}
            <div className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Official Social Communities
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Follow our official channels for the latest AI model rollouts, feature updates, community prompt contests, and tutorials:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="https://facebook.com/botock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-blue-600/15 border border-slate-200 dark:border-white/[0.06] hover:border-blue-500/30 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-400 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Facebook</span>
                </a>

                <a
                  href="https://instagram.com/botock_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-pink-600/15 border border-slate-200 dark:border-white/[0.06] hover:border-pink-500/30 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-pink-400 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://linkedin.com/company/botock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-sky-600/15 border border-slate-200 dark:border-white/[0.06] hover:border-sky-500/30 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-sky-400 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://tiktok.com/@botock_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-teal-600/15 border border-slate-200 dark:border-white/[0.06] hover:border-teal-500/30 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-teal-300 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>TikTok</span>
                </a>

                <a
                  href="https://x.com/botock_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.06] hover:border-white/20 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>X (Twitter)</span>
                </a>

                <Link
                  href="/complaint"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-red-600/15 border border-slate-200 dark:border-white/[0.06] hover:border-red-500/30 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-red-400 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>File Complaint →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
