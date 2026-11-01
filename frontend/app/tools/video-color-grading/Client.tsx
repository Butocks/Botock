"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  Loader2,
  Palette,
  RefreshCw,
  Trash2,
  Video,
} from "lucide-react";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { fetchFile } from "@ffmpeg/util";

type Grade = {
  brightness: number; // -30..30  (0 = unchanged)
  contrast: number; // 50..150  (100 = unchanged)
  saturation: number; // 0..200   (100 = unchanged)
  gamma: number; // 50..200  (100 = unchanged)
};

const DEFAULT_GRADE: Grade = { brightness: 0, contrast: 100, saturation: 100, gamma: 100 };

const PRESETS: { name: string; grade: Grade }[] = [
  { name: "Original", grade: DEFAULT_GRADE },
  { name: "Cinematic", grade: { brightness: -4, contrast: 118, saturation: 110, gamma: 95 } },
  { name: "Vibrant", grade: { brightness: 3, contrast: 108, saturation: 150, gamma: 100 } },
  { name: "Warm Fade", grade: { brightness: 6, contrast: 92, saturation: 90, gamma: 105 } },
  { name: "Black & White", grade: { brightness: 0, contrast: 115, saturation: 0, gamma: 100 } },
];

export default function VideoColorGradingClient() {
  const { load, writeFile, readFile, deleteFile, exec, progress } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [grade, setGrade] = useState<Grade>(DEFAULT_GRADE);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [error, setError] = useState("");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live preview uses CSS filters (instant); export uses FFmpeg "eq".
  const previewFilter = useMemo(() => {
    const b = 100 + grade.brightness * 1.0;
    return `brightness(${b}%) contrast(${grade.contrast}%) saturate(${grade.saturation}%)`;
  }, [grade]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (src) URL.revokeObjectURL(src);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setFile(f);
    setSrc(URL.createObjectURL(f));
    setOutUrl(null);
    setStatus("idle");
    setError("");
  };

  const reset = () => {
    if (src) URL.revokeObjectURL(src);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setFile(null);
    setSrc(null);
    setOutUrl(null);
    setGrade(DEFAULT_GRADE);
    setStatus("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const exportVideo = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    const stamp = Date.now();
    const inputName = `input_${stamp}.mp4`;
    const outputName = `graded_${stamp}.mp4`;
    try {
      await load();
      await writeFile(inputName, await fetchFile(file));
      const eq =
        `eq=brightness=${(grade.brightness / 100).toFixed(3)}` +
        `:contrast=${(grade.contrast / 100).toFixed(3)}` +
        `:saturation=${(grade.saturation / 100).toFixed(3)}` +
        `:gamma=${(grade.gamma / 100).toFixed(3)}`;
      const code = await exec([
        "-i", inputName,
        "-vf", eq,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "22",
        "-c:a", "copy",
        outputName,
      ]);
      if (code !== 0) throw new Error("Could not apply the color grade. Try an MP4 or MOV file.");
      const data = await readFile(outputName);
      const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
      setOutUrl(URL.createObjectURL(blob));
      setStatus("completed");
    } catch (err: any) {
      setError(err?.message || "Color grading failed. Please try a different video.");
      setStatus("error");
    } finally {
      try {
        await deleteFile(inputName);
        await deleteFile(outputName);
      } catch {
        /* virtual files may already be gone */
      }
    }
  };

  const slider = (label: string, key: keyof Grade, min: number, max: number, unit = "") => (
    <label className="block space-y-1">
      <span className="flex justify-between text-xs font-semibold text-muted-foreground">
        <span>{label}</span>
        <span>{grade[key]}{unit}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={grade[key]}
        onChange={(e) => setGrade({ ...grade, [key]: Number(e.target.value) })}
        className="w-full accent-primary"
      />
    </label>
  );

  if (!file) {
    return (
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border/80 hover:border-primary/80 bg-card/40 rounded-3xl p-10 sm:p-14 text-center cursor-pointer flex flex-col items-center gap-4"
      >
        <input ref={inputRef} type="file" accept="video/*" onChange={onPick} className="hidden" />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Palette className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Select a video to color grade</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            MP4, MOV, WebM supported • Processed in your browser • No upload
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <Video className="w-5 h-5 text-violet-500 shrink-0" />
          <span className="text-sm font-semibold truncate">{file.name}</span>
        </div>
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-destructive">
          <Trash2 className="w-4 h-4" /> Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live preview
          </span>
          <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-border/60">
            {src && (
              <video
                src={src}
                controls
                className="w-full h-full object-contain"
                style={{ filter: previewFilter }}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setGrade(p.grade)}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold"
              >
                {p.name}
              </button>
            ))}
          </div>
          {slider("Brightness", "brightness", -30, 30)}
          {slider("Contrast", "contrast", 50, 150, "%")}
          {slider("Saturation", "saturation", 0, 200, "%")}
          {slider("Gamma", "gamma", 50, 200, "%")}
        </div>
      </div>

      {status === "processing" && (
        <div className="p-4 rounded-2xl bg-card border border-border/60 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Applying color grade…
          </span>
          <span>{progress.percent ? `${Math.round(progress.percent)}%` : "Processing"}</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {outUrl ? (
          <>
            <a
              href={outUrl}
              download={`graded_${file.name.replace(/\.[^/.]+$/, "")}.mp4`}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download graded video
            </a>
            <button
              onClick={reset}
              className="px-4 py-3.5 rounded-xl bg-secondary text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Grade another
            </button>
          </>
        ) : (
          <button
            onClick={exportVideo}
            disabled={status === "processing"}
            className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Palette className="w-4 h-4" /> Apply & export video
          </button>
        )}
      </div>
    </div>
  );
}
