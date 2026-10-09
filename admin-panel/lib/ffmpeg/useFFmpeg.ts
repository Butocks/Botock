"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { fetchFile } from "@ffmpeg/util";
import FFmpegManager, { FFmpegProgressCallback } from "./ffmpegManager";

export interface FFmpegProgress {
  ratio: number; // 0 to 1
  percent: number; // 0 to 100
  time?: number;
}

export interface RunFFmpegOptions {
  inputFile: File | Blob;
  inputFileName?: string;
  outputFileName: string;
  outputMimeType: string;
  args: string[];
}

export interface UseFFmpegReturn {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  writeFile: (path: string, data: Uint8Array | string) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  deleteFile: (path: string) => Promise<void>;
  progress: FFmpegProgress;
  terminate: () => Promise<void>;
  // Additional high-level convenience helpers
  isProcessing: boolean;
  statusMessage: string;
  cancel: () => Promise<void>;
  run: (options: RunFFmpegOptions) => Promise<Blob>;
}

/**
 * Custom React hook for controlling the FFmpeg WebAssembly engine.
 * Provides reactive state tracking for loading status, progress percentage, error messages,
 * and standard virtual filesystem operations.
 */
export function useFFmpeg(): UseFFmpegReturn {
  const [loaded, setLoaded] = useState<boolean>(() => FFmpegManager.isLoaded());
  const [loading, setLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<FFmpegProgress>({
    ratio: 0,
    percent: 0,
  });

  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    // Check if singleton is already loaded from another component
    if (FFmpegManager.isLoaded()) {
      setLoaded(true);
    }

    // Subscribe to progress events
    const handleProgress: FFmpegProgressCallback = (event) => {
      if (!mountedRef.current) return;
      const ratio = Math.min(1, Math.max(0, event.progress));
      const percent = Math.round(ratio * 100);
      setProgress({
        ratio,
        percent,
        time: event.time,
      });
    };

    const unsubscribe = FFmpegManager.onProgress(handleProgress);

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  /**
   * Initializes and loads the WebAssembly FFmpeg core binary.
   */
  const load = useCallback(async (): Promise<void> => {
    if (FFmpegManager.isLoaded()) {
      setLoaded(true);
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage("Loading WebAssembly Video Engine...");

    try {
      await FFmpegManager.load();
      if (mountedRef.current) {
        setLoaded(true);
        setStatusMessage("Engine ready.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load FFmpeg engine.";
      if (mountedRef.current) {
        setError(message);
        setStatusMessage("Initialization failed.");
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Executes an FFmpeg CLI command with an array of arguments.
   */
  const exec = useCallback(
    async (args: string[]): Promise<number> => {
      setError(null);
      setIsProcessing(true);
      try {
        if (!FFmpegManager.isLoaded()) {
          await load();
        }
        return await FFmpegManager.exec(args);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "FFmpeg execution failed.";
        if (mountedRef.current) {
          setError(message);
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [load]
  );

  /**
   * Ingests data into FFmpeg's virtual filesystem.
   */
  const writeFile = useCallback(
    async (path: string, data: Uint8Array | string): Promise<void> => {
      if (!FFmpegManager.isLoaded()) {
        await load();
      }
      await FFmpegManager.writeFile(path, data);
    },
    [load]
  );

  /**
   * Reads raw bytes of an output file from FFmpeg's virtual filesystem.
   */
  const readFile = useCallback(
    async (path: string): Promise<Uint8Array> => {
      if (!FFmpegManager.isLoaded()) {
        await load();
      }
      return await FFmpegManager.readFile(path);
    },
    [load]
  );

  /**
   * Removes a file from FFmpeg's virtual filesystem to free memory.
   */
  const deleteFile = useCallback(async (path: string): Promise<void> => {
    await FFmpegManager.deleteFile(path);
  }, []);

  /**
   * Terminates the underlying WebAssembly worker and resets state.
   */
  const terminate = useCallback(async (): Promise<void> => {
    await FFmpegManager.terminate();
    if (mountedRef.current) {
      setLoaded(false);
      setLoading(false);
      setIsProcessing(false);
      setProgress({ ratio: 0, percent: 0 });
      setStatusMessage("Engine terminated.");
    }
  }, []);

  /**
   * High-level convenience helper: writes input file, runs command, reads output blob, and cleans up MEMFS.
   */
  const run = useCallback(
    async (options: RunFFmpegOptions): Promise<Blob> => {
      const {
        inputFile,
        inputFileName = "input.mp4",
        outputFileName,
        outputMimeType,
        args,
      } = options;

      setIsProcessing(true);
      setError(null);
      setProgress({ ratio: 0, percent: 0 });
      setStatusMessage("Preparing video data...");

      try {
        if (!FFmpegManager.isLoaded()) {
          await load();
        }

        setStatusMessage("Ingesting media into virtual memory...");
        const inputBytes = await fetchFile(inputFile);
        await FFmpegManager.writeFile(inputFileName, inputBytes);

        setStatusMessage("Processing media...");
        const exitCode = await FFmpegManager.exec(args);

        if (exitCode !== 0) {
          throw new Error(`FFmpeg processing failed with exit code ${exitCode}.`);
        }

        setStatusMessage("Reading processed media...");
        const outputBytes = await FFmpegManager.readFile(outputFileName);
        const resultBlob = new Blob([outputBytes as unknown as BlobPart], { type: outputMimeType });

        setProgress({ ratio: 1, percent: 100 });
        setStatusMessage("Processing complete.");
        return resultBlob;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Media processing failed.";
        if (mountedRef.current) {
          setError(message);
        }
        throw err;
      } finally {
        try {
          await FFmpegManager.deleteFile(inputFileName);
          await FFmpegManager.deleteFile(outputFileName);
        } catch {
          // Cleanup best effort
        }
        if (mountedRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [load]
  );

  return {
    loaded,
    loading,
    error,
    load,
    exec,
    writeFile,
    readFile,
    deleteFile,
    progress,
    terminate,
    isProcessing,
    statusMessage,
    cancel: terminate,
    run,
  };
}

export default useFFmpeg;
