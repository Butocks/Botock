"use client";

import { ReactNode } from "react";
import { useDropzone, Accept, DropzoneOptions } from "react-dropzone";

export interface UploadDropzoneProps {
  /** File types accepted by this dropzone — maps to react-dropzone's accept format */
  accept: Accept;
  /** Icon to display in the center circle */
  icon: ReactNode;
  /** Main heading text */
  title: string;
  /** Subtext description */
  subtitle: string;
  /** Called when files are dropped */
  onDrop: DropzoneOptions["onDrop"];
  /** Allow multiple file selection (default: false) */
  multiple?: boolean;
  /** Tailwind border/bg accent colour class for drag-active state (default: emerald) */
  accentClass?: string;
  /** Optional slot below the subtitle (e.g. feature badges) */
  footer?: ReactNode;
}

/**
 * Shared UploadDropzone — BOTOCK-106
 * One implementation of the dashed-border drop zone used by every tool.
 * Per-tool accept maps and copy are passed as props; visual pattern is shared.
 */
export default function UploadDropzone({
  accept,
  icon,
  title,
  subtitle,
  onDrop,
  multiple = false,
  accentClass = "emerald",
  footer,
}: UploadDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? undefined : 1,
    multiple,
  });

  const activeClasses =
    accentClass === "violet"
      ? "border-violet-500 bg-violet-500/5"
      : accentClass === "rose"
      ? "border-rose-500 bg-rose-500/5"
      : accentClass === "blue"
      ? "border-blue-500 bg-blue-500/5"
      : "border-emerald-500 bg-emerald-500/5";

  const hoverClasses =
    accentClass === "violet"
      ? "hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
      : accentClass === "rose"
      ? "hover:border-rose-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
      : accentClass === "blue"
      ? "hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
      : "hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]";

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
        isDragActive
          ? activeClasses
          : `border-slate-300 dark:border-white/[0.1] ${hoverClasses}`
      }`}
    >
      <input {...getInputProps()} />

      {/* Icon circle */}
      <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>

      {/* Heading */}
      <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </p>

      {/* Subtitle */}
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        {subtitle}
      </p>

      {/* Optional footer slot */}
      {footer && <div className="mt-5">{footer}</div>}

      {/* Click hint */}
      {!footer && (
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>{multiple ? "Click or drag files here" : "Click or drag file here"}</span>
        </div>
      )}
    </div>
  );
}
