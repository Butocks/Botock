"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function PdfToExcelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PDF to Excel tool crash caught by boundary:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        Conversion Engine Error
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
        An unexpected error occurred while running the PDF to Excel converter.
        This could be due to a malformed document or an unexpected runtime exception.
        Thanks to Botock&apos;s isolated architecture, the rest of the application remains unaffected.
      </p>

      {error?.message && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono text-left break-all max-h-32 overflow-y-auto">
          <span className="font-bold">Error:</span> {error.message}
          {error.digest && (
            <div className="mt-1 text-[11px] text-slate-400">
              Digest: {error.digest}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-transform active:scale-95 shadow-md cursor-pointer hover:opacity-90"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
