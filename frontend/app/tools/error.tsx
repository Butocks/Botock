"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Tool crashed:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Tool Encountered an Error
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        We apologize, but this specific tool encountered an unexpected error.
        Because of our isolated architecture, the rest of the platform remains fully operational.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
