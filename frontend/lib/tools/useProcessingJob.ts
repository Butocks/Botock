"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  processVideoOrAudioTool,
  processPdfTool,
  processImageTool,
} from "@/app/tools/ToolEngine";

export type ProcessingStatus = "idle" | "processing" | "done" | "error";
export type JobStage = "idle" | "uploading" | "loading_engine" | "queued" | "processing" | "finalizing" | "done";

export interface TelemetryPayload {
  session_id: string;
  tool_slug: string;
  status: "started" | "completed" | "failed" | "abandoned_midway";
  stage_reached: JobStage;
  elapsed_ms: number;
  abandon_reason?: string;
  error_code?: string;
  error_message?: string;
  file_size_bytes?: number;
}

export function getTelemetrySessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let sid = sessionStorage.getItem("botock_sid");
    if (!sid) {
      sid = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      sessionStorage.setItem("botock_sid", sid);
    }
    return sid;
  } catch {
    return "guest_session";
  }
}

export function sendToolTelemetry(data: Partial<TelemetryPayload> & { tool_slug: string }, useBeacon = false) {
  const payload: TelemetryPayload = {
    session_id: getTelemetrySessionId(),
    tool_slug: data.tool_slug,
    status: data.status || "started",
    stage_reached: data.stage_reached || "idle",
    elapsed_ms: data.elapsed_ms || 0,
    abandon_reason: data.abandon_reason,
    error_code: data.error_code,
    error_message: data.error_message,
    file_size_bytes: data.file_size_bytes,
  };

  const url = "/api/analytics/tool-usage";

  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    } catch {
      // Fallback to fetch
    }
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export interface UseProcessingJobReturn<TResult> {
  status: ProcessingStatus;
  progress: number; // 0–100
  error: string | null;
  result: TResult | null;
  run: (fn: (reportProgress: (n: number) => void) => Promise<TResult>, toolSlug?: string) => Promise<void>;
  reset: () => void;
}

/**
 * BOTOCK-107: Shared processing status machine hook.
 * Backwards-compatible with all existing components, now upgraded with deep telemetry.
 */
export function useProcessingJob<TResult>(): UseProcessingJobReturn<TResult> {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const activeToolSlugRef = useRef<string | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const handleUnload = () => {
      if (isRunningRef.current && activeToolSlugRef.current) {
        const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        sendToolTelemetry(
          {
            tool_slug: activeToolSlugRef.current,
            status: "abandoned_midway",
            stage_reached: "processing",
            elapsed_ms: elapsed,
            abandon_reason: elapsed > 15000 ? "took_too_long_exit (>15s)" : "tab_closed_mid_job",
          },
          true
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const run = useCallback(
    async (fn: (reportProgress: (n: number) => void) => Promise<TResult>, toolSlug?: string): Promise<void> => {
      setStatus("processing");
      setProgress(0);
      setError(null);
      setResult(null);

      startTimeRef.current = Date.now();
      isRunningRef.current = true;
      activeToolSlugRef.current = toolSlug || "generic-processing";

      sendToolTelemetry({
        tool_slug: activeToolSlugRef.current,
        status: "started",
        stage_reached: "uploading",
      });

      const reportProgress = (n: number) => {
        setProgress(Math.max(0, Math.min(100, Math.round(n))));
      };

      try {
        const output = await fn(reportProgress);
        const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        isRunningRef.current = false;
        setResult(output);
        setProgress(100);
        setStatus("done");

        if (activeToolSlugRef.current) {
          sendToolTelemetry({
            tool_slug: activeToolSlugRef.current,
            status: "completed",
            stage_reached: "done",
            elapsed_ms: elapsed,
          });
        }
      } catch (err: unknown) {
        isRunningRef.current = false;
        const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        console.error("[useProcessingJob] Error:", err);
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.";
        setError(message);
        setStatus("error");

        if (activeToolSlugRef.current) {
          sendToolTelemetry({
            tool_slug: activeToolSlugRef.current,
            status: "failed",
            stage_reached: "processing",
            elapsed_ms: elapsed,
            error_message: message,
          });
        }
      }
    },
    []
  );

  const reset = useCallback(() => {
    isRunningRef.current = false;
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

/**
 * Hybrid Tool Job with built-in drop-off and error beacon telemetry.
 */
export function useHybridToolJob() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [executionMode, setExecutionMode] = useState<"backend" | "local" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const activeToolSlugRef = useRef<string | null>(null);
  const currentStageRef = useRef<JobStage>("idle");
  const isProcessingRef = useRef(false);
  const fileSizeBytesRef = useRef<number | undefined>(undefined);

  // Detect mid-way tab closes and beacon backend
  useEffect(() => {
    const handleUnload = () => {
      if (isProcessingRef.current && activeToolSlugRef.current) {
        const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        const reason =
          elapsed > 20000
            ? "slow_processing_user_closed_after_20s"
            : currentStageRef.current === "loading_engine"
            ? "wasm_engine_loading_timeout_exit"
            : "user_closed_tab_during_job";

        sendToolTelemetry(
          {
            tool_slug: activeToolSlugRef.current,
            status: "abandoned_midway",
            stage_reached: currentStageRef.current,
            elapsed_ms: elapsed,
            abandon_reason: reason,
            file_size_bytes: fileSizeBytesRef.current,
          },
          true
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const execute = useCallback(
    async (
      category: "video" | "pdf" | "image",
      toolSlug: string,
      file: File,
      options: Record<string, any> = {}
    ): Promise<Blob | null> => {
      setIsProcessing(true);
      isProcessingRef.current = true;
      activeToolSlugRef.current = toolSlug;
      startTimeRef.current = Date.now();
      fileSizeBytesRef.current = file.size;
      currentStageRef.current = "uploading";

      setProgress(5);
      setError(null);

      sendToolTelemetry({
        tool_slug: toolSlug,
        status: "started",
        stage_reached: "uploading",
        file_size_bytes: file.size,
      });

      try {
        const onProgress = (p: number, mode: "backend" | "local") => {
          setProgress(p);
          setExecutionMode(mode);
          if (p > 10 && p < 80) currentStageRef.current = "processing";
          else if (p >= 80 && p < 100) currentStageRef.current = "finalizing";
        };

        let res;
        if (category === "video") {
          res = await processVideoOrAudioTool(toolSlug as any, file, options, onProgress);
        } else if (category === "pdf") {
          res = await processPdfTool(toolSlug as any, file, options, onProgress);
        } else {
          res = await processImageTool(toolSlug as any, file, options, onProgress);
        }

        const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        isProcessingRef.current = false;
        currentStageRef.current = "done";
        setProgress(100);

        sendToolTelemetry({
          tool_slug: toolSlug,
          status: "completed",
          stage_reached: "done",
          elapsed_ms: elapsed,
          file_size_bytes: file.size,
        });

        return res.result;
      } catch (err: any) {
        const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        isProcessingRef.current = false;
        const msg = err?.message || "Processing failed";
        setError(msg);

        sendToolTelemetry({
          tool_slug: toolSlug,
          status: "failed",
          stage_reached: currentStageRef.current,
          elapsed_ms: elapsed,
          error_code: "EXEC_FAIL",
          error_message: msg,
          file_size_bytes: file.size,
        });

        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return { execute, isProcessing, progress, executionMode, error };
}

export default useProcessingJob;
