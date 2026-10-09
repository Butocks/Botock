import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-slate-400 mb-6 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/[0.1] pb-6 mb-6">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
          404
        </h1>
        <div className="h-10 w-px bg-slate-300 dark:bg-white/[0.15]" />
        <span className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
          This page could not be found.
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
