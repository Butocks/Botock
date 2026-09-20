"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  Globe,
  Zap,
  Laptop,
  Heart,
  ArrowRight,
  Send,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  desc: string;
  requirements: string[];
}

const JOBS: Job[] = [
  {
    id: "sr-ai-engineer",
    title: "Senior Generative AI Engineer",
    department: "AI Research & Pipelines",
    location: "Global Remote",
    type: "Full-Time",
    desc: "Scale our video diffusion pipeline integration with Google Flow, Veo, and Nano Banana. Optimize generation throughput and stealth session orchestrators.",
    requirements: ["4+ years Python & FastAPI", "Experience with diffusion models & WebCodecs", "Strong background in distributed task queues (Celery/Redis)"],
  },
  {
    id: "staff-fullstack",
    title: "Staff Fullstack Engineer (Next.js & WebGL)",
    department: "Frontend Experience",
    location: "Global Remote",
    type: "Full-Time",
    desc: "Build next-generation in-browser media editors with 0ms latency using Next.js 15, WebAssembly FFmpeg, and canvas color grading engines.",
    requirements: ["Deep mastery of TypeScript & Next.js App Router", "Proficiency in WebCodecs or in-browser video manipulation", "Strong eye for high-end SaaS UX"],
  },
  {
    id: "automation-lead",
    title: "Head of Automation & Stealth Scraping",
    department: "Infrastructure",
    location: "Global Remote",
    type: "Full-Time",
    desc: "Architect enterprise browser automation clusters using Playwright Stealth, dynamic DOM recovery algorithms, and distributed headless instances.",
    requirements: ["Expertise in Playwright & anti-bot evasion techniques", "Experience managing headless Chrome clusters at scale", "Python async & Docker container orchestration"],
  },
  {
    id: "product-designer",
    title: "Lead Product Designer (UI/UX)",
    department: "Design Systems",
    location: "Global Remote",
    type: "Full-Time",
    desc: "Define the visual identity of Botock across obsidian dark studio themes, orbital loading states, and multi-tool creative dashboards.",
    requirements: ["Portfolio featuring world-class dark mode SaaS designs", "Mastery of Figma, micro-interactions, and design tokens", "Experience with AI creative tools (Runway, Midjourney, Figma)"],
  },
];

export default function JoinUsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [applicant, setApplicant] = useState({ name: "", email: "", portfolio: "" });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>We Are Actively Hiring Worldwide</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white mb-4">
            Shape the Future of Generative Media
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Join Botock to build the all-in-one creative platform relied on by over 148,000 creators worldwide. Distributed team, high ownership, and groundbreaking AI technology.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">100% Global Remote</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Work from wherever you are happiest and most productive. Asynchronous culture with zero useless meetings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 mx-auto flex items-center justify-center mb-3">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Top-Tier Tech & Stipends</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Brand new M-series MacBooks, $3,000 home office setup allowance, and full AI compute credits.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Competitive Equity</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Meaningful equity packages and market-leading compensation so you share in Botock's long-term success.
            </p>
          </div>
        </div>

        {/* Open Positions List */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span>Open Positions</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {JOBS.length} Openings
            </span>
          </h2>

          <div className="space-y-4">
            {JOBS.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="max-w-xl">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                      {job.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {job.desc}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>📍 {job.location}</span>
                    <span>•</span>
                    <span>⏱ {job.type}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setApplied(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Application Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#121216] border border-slate-300 dark:border-white/[0.1] p-6 sm:p-8 relative animate-fade-in">
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-white"
              >
                ✕
              </button>

              {applied ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Application Received!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Thank you for applying for the <span className="text-white font-semibold">{selectedJob.title}</span> role. Our hiring team will review your credentials within 48 hours.
                  </p>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="mt-4 px-5 py-2 rounded-xl bg-white/[0.08] text-xs font-bold text-slate-900 dark:text-white"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <div className="text-[11px] text-violet-400 font-bold uppercase tracking-wider">
                      Applying for
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedJob.title}</h3>
                  </div>

                  <form onSubmit={handleApply} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={applicant.name}
                        onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={applicant.email}
                        onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn / GitHub / Portfolio URL *</label>
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/yourhandle"
                        value={applicant.portfolio}
                        onChange={(e) => setApplicant({ ...applicant, portfolio: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
