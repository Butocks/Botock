"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ImageRemoveBgError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AI Background Remover crashed:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-rose-500/10 dark:bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        AI Background Removal Failed
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-sm">
        We encountered an error while processing your image through the neural network. This might be due to memory limits, WebGL capability, or an unsupported image format. Thanks to Botock&apos;s isolated architecture, the rest of the platform remains unaffected.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto text-sm shadow-md hover:bg-slate-800 dark:hover:bg-slate-200"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}
