"use client";

import { Loader2 } from "lucide-react";

interface ToolLoaderProps {
  message?: string;
  progress?: number;
  visible?: boolean;
}

/**
 * Unified skeleton-style loader for all Botock tools.
 * Matches the modern "Facebook pulse" loading pattern.
 * Drop-in: just set visible=true during processing.
 */
export function ToolLoader({ message = "Processing...", progress = 0, visible = true }: ToolLoaderProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/[0.05] animate-in fade-in duration-300 bg-white dark:bg-transparent">
      {/* Skeleton shimmer lines */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 animate-pulse" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2 animate-pulse" />
        </div>
      </div>

      {/* Labeled progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            {message}
          </span>
          {progress > 0 && (
            <span className="text-emerald-500 font-mono">{Math.round(progress)}%</span>
          )}
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.max(8, progress || 15)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        <p className="text-[10px] text-slate-500 font-medium text-center mt-0.5">
          Please wait, ensuring the best quality result...
        </p>
      </div>
    </div>
  );
}

export default ToolLoader;
