"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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

let sharedFFmpeg: FFmpeg | null = null;
let sharedLoadPromise: Promise<FFmpeg> | null = null;

const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

async function getFFmpeg(): Promise<FFmpeg> {
  if (sharedFFmpeg) return sharedFFmpeg;
  if (sharedLoadPromise) return sharedLoadPromise;

  sharedLoadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    const coreURL = await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm");
    await ffmpeg.load({ coreURL, wasmURL });
    sharedFFmpeg = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await sharedLoadPromise;
  } finally {
    sharedLoadPromise = null;
  }
}

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

    const ffmpeg = await getFFmpeg();
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

    ffmpeg.on("progress", progressHandler);

    try {
      for (let index = 0; index < inputFiles.length; index += 1) {
        const item = inputFiles[index];
        const name = sanitizeName(item.name, `input_${index}.bin`);
        await ffmpeg.writeFile(name, await fetchFile(item.data));
        createdFiles.push(name);
        setStatusMessage(`Loaded source ${index + 1} of ${inputFiles.length}...`);
      }

      setStatusMessage("Rendering timeline locally...");
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(output);
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
      const blob = new Blob([bytes as unknown as BlobPart], { type: outputMimeType });
      return blob;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (mountedRef.current) setError(message);
      throw new Error(message || "FFmpeg render failed.");
    } finally {
      for (const file of createdFiles) {
        try { await ffmpeg.deleteFile(file); } catch { /* best effort */ }
      }
      try { await ffmpeg.deleteFile(output); } catch { /* best effort */ }
      ffmpeg.off("progress", progressHandler);
      if (mountedRef.current) {
        setIsProcessing(false);
        setStatusMessage("");
      }
    }
  }, []);

  const cancel = useCallback(async () => {
    if (!sharedFFmpeg) return;
    try { await sharedFFmpeg.terminate(); } catch { /* ignore */ }
    sharedFFmpeg = null;
    if (mountedRef.current) {
      setIsProcessing(false);
      setStatusMessage("Render cancelled.");
    }
  }, []);

  return { runMulti, cancel, isProcessing, progress, statusMessage, error };
}
