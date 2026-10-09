"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function PDFMergeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PDF Merge Tool crashed:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        PDF Processing Failed
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        We encountered an error while processing your PDFs. This usually happens if the PDFs are encrypted, password-protected, or corrupted. Because Botock uses isolated architecture, the rest of the platform is fully unaffected.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-transform active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
