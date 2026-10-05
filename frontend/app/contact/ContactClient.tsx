"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    description: "",
    attachment: null as File | null,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Attachment must be less than 5MB");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, attachment: file });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.subject || !formData.description) {
      alert("Please complete all required fields.");
      return;
    }

    setStatus("sending");
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>24/7 Global Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
            Have a question about our tools or services? We're here to help. You can also email us directly at:
          </p>
          <a href="mailto:services@botock.app" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors">
            <Mail className="w-4 h-4" />
            services@botock.app
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8">
            {status === "success" ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. We will review your message and get back to you at {formData.email} as soon as possible.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setFormData({ email: "", subject: "", description: "", attachment: null });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-bold text-slate-900 dark:text-white transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-300 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-300 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Reason of contacting us *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Provide details about your question, request, or inquiry..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-300 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Attachment (Optional, max 5MB)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-300 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-white/[0.05] dark:file:text-white dark:hover:file:bg-white/[0.1]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {status === "sending" ? (
                    <span className="animate-pulse">Sending Message...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & Social Links */}
          <div className="lg:col-span-5 space-y-6">
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
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Email Services</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">services@botock.app</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">File a Complaint</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">complaint@botock.app</div>
                    <Link href="/complaint" className="text-[11px] text-red-500 hover:underline block mt-1">Open Complaint Form →</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Official Social Communities
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Follow our official channels for the latest updates:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <a href="https://facebook.com/botock" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-50 dark:hover:bg-blue-600/15 border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Facebook</span>
                </a>
                <a href="https://instagram.com/botock_ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-pink-50 dark:hover:bg-pink-600/15 border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>Instagram</span>
                </a>
                <a href="https://linkedin.com/company/botock" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-sky-50 dark:hover:bg-sky-600/15 border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>LinkedIn</span>
                </a>
                <a href="https://tiktok.com/@botock_ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-teal-50 dark:hover:bg-teal-600/15 border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>TikTok</span>
                </a>
                <a href="https://x.com/botock_ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-white" />
                  <span>X (Twitter)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
