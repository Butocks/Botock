"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ImageUpscaleErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AI Image Upscaler encountered an isolated error:", error);
  }, [error]);

  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Image Upscaler Encountered an Error
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
        {error?.message ||
          "An error occurred during canvas processing. Because Botock tools are strictly isolated, this issue is contained and the rest of the application remains fully operational."}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
