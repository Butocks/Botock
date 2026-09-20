"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import FFmpegManager from "@/lib/ffmpeg/ffmpegManager";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VideoToMp3Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Video to MP3 Tool crashed:", error);
  }, [error]);

  const handleReset = async () => {
    try {
      await FFmpegManager.terminate();
    } catch {
      // Ignore termination error
    }
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        Audio Extraction Failed
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        An unexpected error occurred while extracting audio from your video. This may happen if the input video
        does not contain an audio track, uses an incompatible audio codec, or encountered memory limitations.
        Thanks to Botock&apos;s isolated architecture, the rest of the application remains fully functional.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
