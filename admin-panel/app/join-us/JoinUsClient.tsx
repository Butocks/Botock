"use client";

import { Building, Briefcase } from "lucide-react";

export default function JoinUsClient() {
  return (
    <div className="flex-1 flex flex-col py-12 transition-colors">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Careers Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Join the Botock Team
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            We are building the next-generation creative operating suite.
          </p>
        </div>

        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Not Currently Hiring
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Our team is currently at full capacity. We are not actively hiring for any roles right now. Please check back later for future opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
