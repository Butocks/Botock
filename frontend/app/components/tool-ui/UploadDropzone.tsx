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
  multiple = true,
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
      className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 md:p-14 text-center cursor-pointer transition-all select-none ${
        isDragActive
          ? activeClasses
          : `border-slate-300 dark:border-white/[0.1] ${hoverClasses}`
      }`}
    >
      <input {...getInputProps()} />

      {/* Icon circle */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105">
        {icon}
      </div>

      {/* Heading */}
      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </p>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
        {subtitle}
      </p>

      {/* Action CTA / 48px+ Mobile Touch Target */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <div
          role="button"
          tabIndex={0}
          className={`w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 ${
            accentClass === "violet"
              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20"
              : accentClass === "rose"
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20"
              : accentClass === "blue"
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
          }`}
        >
          <span>{multiple ? "Tap to Select Files" : "Tap to Select File"}</span>
        </div>
        <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 font-medium">
          or drag {multiple ? "files" : "file"} here
        </span>
      </div>

      {/* Optional footer slot */}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
