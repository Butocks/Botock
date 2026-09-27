"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import FFmpegManager from "@/lib/ffmpeg/ffmpegManager";

export type EditorInputFile = {
  name: string;
  data: Blob | File;
};

export type EditorFFmpegRunOptions = {
  inputFiles: EditorInputFile[];
  outputFileName: string;
  outputMimeType: string;
  args: string[];
};

// ✅ CONSOLIDATED: Editor now uses the shared FFmpegManager singleton
// instead of maintaining its own separate FFmpeg instance.
// This prevents two separate FFmpeg engines from being loaded simultaneously
// when a user uses both general tools and the editor in the same session.

function sanitizeName(name: string, fallback: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned || fallback;
}

export function useEditorFFmpeg() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const runMulti = useCallback(async ({ inputFiles, outputFileName, outputMimeType, args }: EditorFFmpegRunOptions) => {
    if (!inputFiles.length) throw new Error("No input media was supplied to FFmpeg.");

    // Use the shared singleton — no cold start if already loaded by another tool
    await FFmpegManager.load();

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setStatusMessage("Preparing local render...");

    const createdFiles: string[] = [];
    const output = sanitizeName(outputFileName, "output.mp4");

    const progressHandler = ({ progress: value }: { progress: number }) => {
      if (!mountedRef.current) return;
      setProgress(Math.max(0, Math.min(1, value)));
    };

    const unsubscribeProgress = FFmpegManager.onProgress(progressHandler);

    try {
      for (let index = 0; index < inputFiles.length; index += 1) {
        const item = inputFiles[index];
        const name = sanitizeName(item.name, `input_${index}.bin`);
        await FFmpegManager.writeFile(name, await fetchFile(item.data));
        createdFiles.push(name);
        if (mountedRef.current) {
          setStatusMessage(`Loaded source ${index + 1} of ${inputFiles.length}...`);
        }
      }

      if (mountedRef.current) setStatusMessage("Rendering timeline locally...");
      await FFmpegManager.exec(args);

      const data = await FFmpegManager.readFile(output);
      const blob = new Blob([data as unknown as BlobPart], { type: outputMimeType });
      return blob;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (mountedRef.current) setError(message);
      throw new Error(message || "FFmpeg render failed.");
    } finally {
      for (const file of createdFiles) {
        try { await FFmpegManager.deleteFile(file); } catch { /* best effort */ }
      }
      try { await FFmpegManager.deleteFile(output); } catch { /* best effort */ }
      unsubscribeProgress();
      if (mountedRef.current) {
        setIsProcessing(false);
        setStatusMessage("");
      }
    }
  }, []);

  const cancel = useCallback(async () => {
    await FFmpegManager.terminate();
    if (mountedRef.current) {
      setIsProcessing(false);
      setStatusMessage("Render cancelled.");
    }
  }, []);

  return { runMulti, cancel, isProcessing, progress, statusMessage, error };
}
