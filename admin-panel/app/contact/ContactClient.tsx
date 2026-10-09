"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    requirements: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.whatsapp || !formData.requirements) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      // Typically goes to an endpoint handling custom inquiries
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("We could not process your request at this time. Please try again later.");
    }
  };

  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4">
            <Film className="w-3.5 h-3.5" />
            <span>Custom Video Generation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Request Custom Video Services
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Need high-volume, highly specific, or enterprise-grade video generation? Provide your requirements below and our team will get back to you with custom rates and a tailored timeline.
          </p>
        </div>

        {/* 3 Step Process */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center mb-4">
              <span className="font-black text-lg">1</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tell us your idea</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Share your vision and exact technical requirements.</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <span className="font-black text-lg">2</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Receive custom rates</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">We provide a timeline and custom quote based on scope.</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <span className="font-black text-lg">3</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">We deliver your video</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Our enterprise nodes render your high-quality assets.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl">
          {status === "success" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Thank you! Our creative team will review your requirements and reach out via Email or WhatsApp shortly.
              </p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setFormData({ name: "", email: "", whatsapp: "", requirements: "" });
                }}
                className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {status === "error" && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-slate-900 dark:text-white transition-colors"
                    placeholder="Your name"
                    disabled={status === "sending"}
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-slate-900 dark:text-white transition-colors"
                    placeholder="you@company.com"
                    disabled={status === "sending"}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="whatsapp" className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="whatsapp"
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-slate-900 dark:text-white transition-colors"
                  placeholder="+1 (555) 000-0000"
                  disabled={status === "sending"}
                />
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="requirements" className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Video Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="requirements"
                  required
                  rows={6}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-slate-900 dark:text-white transition-colors resize-y"
                  placeholder="Describe your project: duration, style, references, aspect ratio, timeline..."
                  disabled={status === "sending"}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
              >
                {status === "sending" ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Request Custom Quote</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
