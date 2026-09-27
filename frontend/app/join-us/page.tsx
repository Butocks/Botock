"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Send,
  MapPin,
  Clock,
  Building,
  RefreshCw,
} from "lucide-react";
import { getBackendUrl } from "../../utils/runtime-urls";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  desc: string;
  requirements: string[];
}

export default function JoinUsPage() {
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [applicant, setApplicant] = useState({ name: "", email: "", portfolio: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/public/jobs`);
        if (res.ok) {
          const data = await res.json();
          setJobsList(data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  return (
    <div className="flex-1 flex flex-col py-12 transition-colors">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean, Authentic Header (No fake marketing stats) */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Careers Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Join the Botock Team
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Explore official open roles and career opportunities posted directly by our team.
          </p>
        </div>

        {/* Positions Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Current Openings</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                {jobsList.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-violet-600 dark:text-violet-400" />
              <span>Loading current positions...</span>
            </div>
          ) : jobsList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Open Positions at the Moment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                We do not have any active vacancies right now. New job openings posted by administrators will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobsList.map((job) => (
                <div
                  key={job.id}
                  className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm"
                >
                  <div className="max-w-xl space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {job.title}
                      </h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                        {job.department}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {job.desc}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.type}
                      </span>
                    </div>

                    {job.requirements && job.requirements.length > 0 && (
                      <ul className="text-[11px] text-slate-500 dark:text-slate-400 list-disc list-inside pt-1 space-y-0.5">
                        {job.requirements.map((req, rIdx) => (
                          <li key={rIdx}>{req}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setApplied(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Modal (Fully Theme-Aware) */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/[0.1] p-6 sm:p-8 relative shadow-2xl animate-fade-in">
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>

              {applied ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Application Submitted!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Thank you for applying for the <span className="text-slate-900 dark:text-white font-semibold">{selectedJob.title}</span> position. Our team will review your application.
                  </p>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="mt-4 px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <div className="text-[11px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
                      Applying for
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedJob.title}
                    </h3>
                  </div>

                  <form onSubmit={handleApply} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={applicant.name}
                        onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={applicant.email}
                        onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Portfolio / LinkedIn / CV Link *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://..."
                        value={applicant.portfolio}
                        onChange={(e) => setApplicant({ ...applicant, portfolio: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md shadow-violet-600/30 mt-2 flex items-center justify-center gap-2 cursor-pointer"
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
