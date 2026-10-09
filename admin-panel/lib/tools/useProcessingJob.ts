"use client";

import { useState, useCallback } from "react";

export type ProcessingStatus = "idle" | "processing" | "done" | "error";

export interface UseProcessingJobReturn<TResult> {
  status: ProcessingStatus;
  progress: number;       // 0–100
  error: string | null;
  result: TResult | null;
  run: (fn: (reportProgress: (n: number) => void) => Promise<TResult>) => Promise<void>;
  reset: () => void;
}

/**
 * BOTOCK-107: Shared processing status machine hook.
 *
 * Wraps any async processing function and manages the full state machine:
 *   idle → processing → done | error → idle (via reset)
 *
 * Usage:
 *   const { status, progress, error, result, run, reset } = useProcessingJob<Blob>();
 *   await run(async (report) => {
 *     report(30);  // 30% progress
 *     const blob = await doSomethingAsync();
 *     report(100);
 *     return blob;
 *   });
 */
export function useProcessingJob<TResult>(): UseProcessingJobReturn<TResult> {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const run = useCallback(
    async (fn: (reportProgress: (n: number) => void) => Promise<TResult>): Promise<void> => {
      setStatus("processing");
      setProgress(0);
      setError(null);
      setResult(null);

      const reportProgress = (n: number) => {
        setProgress(Math.max(0, Math.min(100, Math.round(n))));
      };

      try {
        const output = await fn(reportProgress);
        setResult(output);
        setProgress(100);
        setStatus("done");
      } catch (err: unknown) {
        console.error("[useProcessingJob] Error:", err);
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.";
        setError(message);
        setStatus("error");
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    status,
    progress,
    error,
    result,
    run,
    reset,
  };
}

export default useProcessingJob;
