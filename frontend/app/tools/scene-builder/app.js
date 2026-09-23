/* ============================================================
   BOTOCK 3D SCENE BUILDER
   APPLICATION CONTROLLER
============================================================ */

import {
  CHARACTERS,
  BACKGROUNDS,
  PROPS,
  SINGLE_ACTIONS,
  DUO_ACTIONS,
  CAMERAS,
  EFFECTS,
  getCharacter,
  getBackground,
  getProp
} from "./asset-registry.js";

import {
  SceneEngine
} from "./scene-engine.js";

/* ============================================================
   ROOT
============================================================ */

const root =
  document.getElementById(
    "botock-scene-builder"
  );

if (!root) {

  throw new Error(
    "Scene Builder root not found."
  );
}

/* ============================================================
   GLOBAL STATE
============================================================ */

const state = {

  scenes: [],

  activeSceneId: null,

  projectName:
    "Botock 3D Project",

  dirty: false,

  exporting: false
};

/* ============================================================
   HELPERS
============================================================ */

function uid(
  prefix = "scene"
) {

  return (
    prefix +
    "_" +
    Math.random()
      .toString(36)
      .slice(2) +
    "_" +
    Date.now()
  );
}

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function el(
  selector
) {

  return document.querySelector(
    selector
  );
}

function all(
  selector
) {

  return [
    ...document.querySelectorAll(
      selector
    )
  ];
}

function downloadBlob(
  blob,
  filename
) {

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    5000
  );
}

/* ============================================================
   BUILD UI
============================================================ */

root.innerHTML = `

<div class="sb-shell">

  <header class="sb-header">

    <div>

      <div class="sb-eyebrow">
        BOTOCK 3D CREATOR
      </div>

      <h1 class="sb-title">
        3D Scene Studio
      </h1>

      <p class="sb-subtitle">
        Build characters, actions, fights, cameras and multiple scenes.
      </p>

    </div>

    <div class="sb-header-actions">

      <button
        id="sb-save-project"
        class="sb-button"
      >
        Save Project
      </button>

      <button
        id="sb-load-project"
        class="sb-button"
      >
        Load Project
      </button>

      <button
        id="sb-export"
        class="sb-button sb-primary"
      >
        Export Video
      </button>

      <input
        id="sb-project-file"
        type="file"
        accept=".json,application/json"
        hidden
      />

    </div>

  </header>


  <div class="sb-layout">

    <!-- LEFT CONTROLS -->

    <aside class="sb-sidebar">

      <section class="sb-panel">

        <div class="sb-panel-title">
          Characters
        </div>

        <label>
          Character A

          <select
            id="sb-character-a"
            class="sb-select"
          ></select>

        </label>

        <label>
          Character B

          <select
            id="sb-character-b"
            class="sb-select"
          ></select>

        </label>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Environment
        </div>

        <label>
          Background

          <select
            id="sb-background"
            class="sb-select"
          ></select>

        </label>

        <label>
          Prop / Accessory

          <select
            id="sb-prop"
            class="sb-select"
          ></select>

        </label>

      </section>

"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
  Eye,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/formatters";
import { useImageDocument } from "@/lib/image/useImageDocument";
import { useObjectUrlDownload } from "@/lib/download/useObjectUrlDownload";

type ModelQuality = "isnet_fp16" | "isnet_quint8" | "isnet";

const MODEL_OPTIONS = [
  {
    id: "isnet_fp16" as ModelQuality,
    name: "Balanced (FP16)",
    badge: "Default",
    badgeColor: "bg-emerald-500",
    desc: "Optimal speed & fine boundary edge quality",
  },
  {
    id: "isnet_quint8" as ModelQuality,
    name: "Fast (Quantized)",
    badge: "Fastest",
    badgeColor: "bg-blue-500",
    desc: "Fastest for mobile & low-spec devices",
  },
  {
    id: "isnet" as ModelQuality,
    name: "High Precision",
    badge: "Max Detail",
    badgeColor: "bg-violet-500",
    desc: "Maximum detail for complex subjects",
  },
];

export default function ImageRemoveBgClient() {
  // ─── Shared hooks ─────────────────────────────────────────────────────────
  const {
    file: imageFile,
    previewUrl: imageSrc,
    dimensions: imageDimensions,
    error: docError,
    loadImage,
    reset: resetImage,
  } = useImageDocument();

  const {
    url: resultUrl,
    setBlob: setResultBlob,
    reset: resetDownload,
  } = useObjectUrlDownload();

  // ─── Processing state ────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [modelQuality, setModelQuality] = useState<ModelQuality>("isnet_fp16");

  const error = actionError || docError;

  // ─── Drop handler ─────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setActionError(null);
      setProgress(0);
      setStatusMessage("");
      resetDownload();
      await loadImage(acceptedFiles[0]);
    },
    [loadImage, resetDownload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
  });

  // ─── AI processing ────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (!imageFile && !imageSrc) return;

    setIsProcessing(true);
    setActionError(null);
    setProgress(0);
    setStatusMessage("Loading neural network model...");

    try {
      const imgly = await import("@imgly/background-removal");
      const removeBackground = imgly.removeBackground || imgly.default;

      if (typeof removeBackground !== "function") {
        throw new Error("Failed to initialize background removal engine.");
      }

      // Prefer the File object directly (most reliable input for @imgly/background-removal)
      // imageSrc (object URL) is also valid as a fallback
      const inputSource: File | string = imageFile || imageSrc!;

      const blob = await removeBackground(inputSource, {
        model: modelQuality,
        progress: (key: string, current: number, total: number) => {
          let pct = 0;
          if (total > 0) {
            pct = Math.min(100, Math.round((current / total) * 100));
          } else if (current > 0) {
            pct = Math.min(99, Math.round(current * 100));
          }
          setProgress(pct);

          const lowerKey = key.toLowerCase();
          if (lowerKey.includes("fetch") || lowerKey.includes("download") || lowerKey.includes("model")) {
            setStatusMessage(`Loading neural network model (${pct}%)...`);
          } else if (lowerKey.includes("init") || lowerKey.includes("session")) {
            setStatusMessage("Initializing WebAssembly runtime...");
          } else if (
            lowerKey.includes("compute") ||
            lowerKey.includes("inference") ||
            lowerKey.includes("segment")
          ) {
            setStatusMessage(`Processing image segmentation (${pct}%)...`);
          } else {
            setStatusMessage(`Processing: ${key} (${pct}%)`);
          }
        },
        output: {
          format: "image/png",
          quality: 1.0,
        },
      });

      // Shared hook handles revoke of previous URL automatically
      setResultBlob(blob, "image/png");
      setProgress(100);
      setStatusMessage("Background removed successfully!");
    } catch (err: unknown) {
      console.error("AI Background Removal Error:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to remove background from image."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    resetImage();
    resetDownload();
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage("");
    setActionError(null);
  };

  const downloadFileName = imageFile
    ? `${imageFile.name.replace(/\.[^/.]+$/, "")}-no-bg.png`
    : "Botock-No-Background.png";

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!imageSrc ? (
        /* ─── Drop Zone ────────────────────────────────────────────────── */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Drop an Image to Remove Background
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Supports JPG, PNG, WEBP — Instant client-side AI processing
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] px-5 py-3 rounded-2xl">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Privacy
            </span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-500" /> In-Browser AI
            </span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <span>Zero Server Uploads</span>
          </div>
        </div>
      ) : (
        /* ─── Main Layout ──────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Source + Model ───────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  Source Image
                </span>
                {imageDimensions && (
                  <span className="text-xs bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md font-mono">
                    {imageDimensions.width} × {imageDimensions.height} px
                  </span>
                )}
                {imageFile && (
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md font-medium">
                    {formatBytes(imageFile.size)}
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Start Over
              </button>
            </div>

            {/* Input Preview */}
            <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-4 flex items-center justify-center min-h-[300px] max-h-[400px]">
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-w-full max-h-[360px] object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Model & AI Settings */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  AI Segmentation Model
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MODEL_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setModelQuality(item.id)}
                    disabled={isProcessing}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      modelQuality === item.id
                        ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                        : "border-slate-200 dark:border-white/[0.06] bg-white dark:bg-transparent hover:border-slate-300 dark:hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Actions + Output ────────────────────────────────── */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8 gap-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> AI Background Removal
            </h3>

            {/* Main Action Button */}
            {!resultUrl ? (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isProcessing
                    ? "bg-emerald-600/70 text-white cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Remove Background
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> Re-processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Re-run with {MODEL_OPTIONS.find(m => m.id === modelQuality)?.name}
                  </>
                )}
              </button>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-1">Processing Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Loading / Progress State */}
            {isProcessing && (
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    {statusMessage || "Processing image..."}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  First run downloads model weights (~40MB) into browser cache. Subsequent runs are near-instant.
                </p>
              </div>
            )}

            {/* Result Preview with Checkerboard Grid */}
            {resultUrl ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Result Preview
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Transparent PNG
                  </span>
                </div>

                {/* Checkerboard background container */}
                <div
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1] flex items-center justify-center p-6 min-h-[220px]"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(rgba(148, 163, 184, 0.2) 0% 25%, transparent 0% 50%)",
                    backgroundSize: "20px 20px",
                    backgroundColor: "rgb(241 245 249)",
                  }}
                >
                  <img
                    src={resultUrl}
                    alt="Subject with background removed"
                    className="max-w-full max-h-[220px] object-contain drop-shadow-md select-none"
                  />
                </div>

                {/* Download CTA */}
                <a
                  href={resultUrl}
                  download={downloadFileName}
                  className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Result
                </a>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  Ready to use with clean alpha transparency in designs &amp; websites.
                </p>
              </div>
            ) : !isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-2xl text-slate-400">
                <Sparkles className="w-10 h-10 mb-3 opacity-40 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ready to Extract Subject
                </p>
                <p className="text-xs max-w-[200px]">
                  Click &ldquo;Remove Background&rdquo; to process directly in your browser.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

      <section class="sb-panel">

        <div class="sb-panel-title">
          Action
        </div>

        <label>
          Action / Sequence

          <select
            id="sb-action"
            class="sb-select"
          ></select>

        </label>

        <div
          id="sb-action-description"
          class="sb-description"
        ></div>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Camera
        </div>

        <label>
          Camera Angle

          <select
            id="sb-camera"
            class="sb-select"
          ></select>

        </label>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Effects
        </div>

        <label>
          Scene Effect

          <select
            id="sb-effect"
            class="sb-select"
          ></select>

        </label>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Timing
        </div>

        <div class="sb-two">

          <label>
            Duration

            <input
              id="sb-duration"
              class="sb-input"
              type="number"
              min="0.5"
              max="60"
              step="0.5"
              value="5"
            />

          </label>

          <label>
            Speed

            <select
              id="sb-speed"
              class="sb-select"
            >

              <option value="0.25">
                0.25x
              </option>

              <option value="0.5">
                0.5x
              </option>

              <option value="0.75">
                0.75x
              </option>

              <option value="1" selected>
                1x
              </option>

              <option value="1.25">
                1.25x
              </option>

              <option value="1.5">
                1.5x
              </option>

              <option value="2">
                2x
              </option>

            </select>

          </label>

        </div>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Scene
        </div>

        <div class="sb-button-row">

          <button
            id="sb-new"
            class="sb-button"
          >
            New
          </button>

          <button
            id="sb-add"
            class="sb-button sb-primary"
          >
            Add Scene
          </button>

        </div>

        <div class="sb-button-row">

          <button
            id="sb-duplicate"
            class="sb-button"
          >
            Duplicate
          </button>

          <button
            id="sb-delete"
            class="sb-button sb-danger"
          >
            Delete
          </button>

        </div>

      </section>

    </aside>


    <!-- CENTER -->

    <main class="sb-main">

      <section class="sb-stage">

        <div class="sb-stage-toolbar">

          <div>

            <strong
              id="sb-current-scene"
            >
              New Scene
            </strong>

            <span
              id="sb-time"
              class="sb-time"
            >
              0.00 / 5.00
            </span>

          </div>

          <div class="sb-stage-actions">

            <button
              id="sb-restart"
              class="sb-icon-button"
              title="Restart"
            >
              ↺
            </button>

            <button
              id="sb-play"
              class="sb-icon-button sb-play"
              title="Play"
            >
              ▶
            </button>

            <button
              id="sb-pause"
              class="sb-icon-button"
              title="Pause"
            >
              ❚❚
            </button>

          </div>

        </div>

        <div
          id="sb-canvas"
          class="sb-canvas"
        ></div>

      </section>


      <!-- TIMELINE -->

      <section class="sb-timeline">

        <div class="sb-timeline-header">

          <div>

            <strong>
              Scene Timeline
            </strong>

            <span>
              Multiple scenes can be exported together.
            </span>

          </div>

          <div
            id="sb-export-status"
            class="sb-export-status"
          ></div>

        </div>

        <div
          id="sb-timeline-list"
          class="sb-timeline-list"
        ></div>

      </section>


      <!-- ACTION LIBRARY -->

      <section class="sb-action-library">

        <div class="sb-panel-title">
          Pre-Authored Actions
        </div>

        <div
          id="sb-action-cards"
          class="sb-action-cards"
        ></div>

      </section>

    </main>

  </div>

</div>

`;

/* ============================================================
   ENGINE
============================================================ */

const engine =
  new SceneEngine(
    el("#sb-canvas")
  );

/* ============================================================
   UI STYLES
============================================================ */

const style =
  document.createElement(
    "style"
  );

style.textContent = `

* {
  box-sizing: border-box;
}

.sb-shell {
  min-height: 100vh;
  padding: 24px;
  color: #e5e7eb;
  background:
    radial-gradient(
      circle at 50% 0%,
      #18213a 0%,
      #070b14 48%,
      #04060b 100%
    );
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

.sb-header {
  max-width: 1700px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.sb-eyebrow {
  color: #a78bfa;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .2em;
}

.sb-title {
  margin: 4px 0 0;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -.03em;
}

.sb-subtitle {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.sb-header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sb-layout {
  max-width: 1700px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
}

.sb-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sb-panel {
  padding: 14px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  background: rgba(12,18,32,.9);
  box-shadow:
    0 10px 40px rgba(0,0,0,.2);
}

.sb-panel-title {
  margin-bottom: 12px;
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .12em;
}

.sb-panel label {
  display: block;
  margin-bottom: 10px;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
}

.sb-panel label:last-child {
  margin-bottom: 0;
}

.sb-select,
.sb-input {
  width: 100%;
  margin-top: 6px;
  padding: 10px 11px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 9px;
  outline: none;
  color: #f8fafc;
  background: #070b14;
  font-size: 12px;
}

.sb-select:focus,
.sb-input:focus {
  border-color: #8b5cf6;
}

.sb-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.sb-button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 7px;
}

.sb-button {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 9px;
  padding: 9px 12px;
  color: #e2e8f0;
  background: #111827;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: .15s ease;
}

.sb-button:hover {
  border-color: rgba(139,92,246,.55);
  background: #182235;
  transform: translateY(-1px);
}

.sb-primary {
  border-color: #8b5cf6;
  color: white;
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #4f46e5
    );
}

.sb-danger {
  color: #fca5a5;
}

.sb-main {
  min-width: 0;
}

.sb-stage {
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px;
  background: #000;
  box-shadow:
    0 20px 70px rgba(0,0,0,.4);
}

.sb-stage-toolbar {
  min-height: 54px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0c1220;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.sb-time {
  margin-left: 12px;
  color: #64748b;
  font-size: 11px;
}

.sb-stage-actions {
  display: flex;
  gap: 7px;
}

.sb-icon-button {
  width: 38px;
  height: 34px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 9px;
  color: #cbd5e1;
  background: #111827;
  cursor: pointer;
}

.sb-icon-button:hover {
  background: #1e293b;
}

.sb-play {
  border-color: #8b5cf6;
  color: white;
  background: #6d28d9;
}

.sb-canvas {
  height: min(66vh, 680px);
  min-height: 500px;
  width: 100%;
  background: #000;
}

.sb-canvas canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.sb-timeline {
  margin-top: 14px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  background: #0c1220;
}

.sb-timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sb-timeline-header strong {
  display: block;
  font-size: 13px;
}

.sb-timeline-header span {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 10px;
}

.sb-export-status {
  color: #34d399;
  font-size: 11px;
}

.sb-timeline-list {
  display: flex;
  gap: 9px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.sb-scene-card {
  min-width: 170px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 11px;
  background: #111827;
  color: #cbd5e1;
  cursor: pointer;
  text-align: left;
}

.sb-scene-card:hover {
  border-color: rgba(139,92,246,.5);
}

.sb-scene-card.active {
  border-color: #8b5cf6;
  background: #1b1235;
}

.sb-scene-number {
  color: #64748b;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.sb-scene-name {
  margin-top: 5px;
  color: white;
  font-size: 12px;
  font-weight: 800;
}

.sb-scene-meta {
  margin-top: 5px;
  color: #64748b;
  font-size: 10px;
}

.sb-action-library {
  margin-top: 14px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  background: #0c1220;
}

.sb-action-cards {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(130px, 1fr)
    );
  gap: 8px;
}

.sb-action-card {
  padding: 11px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  color: #cbd5e1;
  background: #111827;
  cursor: pointer;
}

.sb-action-card:hover {
  border-color: #8b5cf6;
  background: #17132a;
}

.sb-action-card strong {
  display: block;
  color: white;
  font-size: 11px;
}

.sb-action-card small {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 9px;
}

.sb-description {
  margin-top: 8px;
  padding: 9px;
  border-radius: 8px;
  color: #94a3b8;
  background: rgba(255,255,255,.03);
  font-size: 10px;
  line-height: 1.5;
}

@media(max-width: 950px) {

  .sb-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .sb-layout {
    grid-template-columns: 1fr;
  }

  .sb-sidebar {
    display: grid;
    grid-template-columns:
      repeat(
        auto-fit,
        minmax(240px,1fr)
      );
  }

  .sb-canvas {
    min-height: 420px;
  }
}

@media(max-width: 600px) {

  .sb-shell {
    padding: 10px;
  }

  .sb-title {
    font-size: 24px;
  }

  .sb-sidebar {
    display: flex;
  }

  .sb-canvas {
    min-height: 350px;
  }
}

`;

document.head.appendChild(
  style
);

/* ============================================================
   ELEMENT REFERENCES
============================================================ */

const characterA =
  el("#sb-character-a");

const characterB =
  el("#sb-character-b");

const background =
  el("#sb-background");

const prop =
  el("#sb-prop");

const action =
  el("#sb-action");

const camera =
  el("#sb-camera");

const effect =
  el("#sb-effect");

const duration =
  el("#sb-duration");

const speed =
  el("#sb-speed");

const timeline =
  el("#sb-timeline-list");

const actionDescription =
  el("#sb-action-description");

const currentScene =
  el("#sb-current-scene");

const timeDisplay =
  el("#sb-time");

const exportStatus =
  el("#sb-export-status");

/* ============================================================
   OPTION BUILDERS
============================================================ */

function fillSelect(
  select,
  items
) {

  select.innerHTML =
    items
      .map(
        item => {

          const value =
            item.id;

          const label =
            item.name;

          return `
            <option value="${escapeHTML(value)}">
              ${escapeHTML(label)}
            </option>
          `;
        }
      )
      .join("");
}

function fillCamera() {

  camera.innerHTML =
    CAMERAS
      .map(
        item => `
          <option value="${item.id}">
            ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");
}

function fillEffects() {

  effect.innerHTML =
    EFFECTS
      .map(
        item => `
          <option value="${item.id}">
            ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");
}

function fillActions() {

  const basic =
    SINGLE_ACTIONS
      .map(
        item => `
          <option value="${item.id}">
            Basic: ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");

  const duo =
    DUO_ACTIONS
      .map(
        item => `
          <option value="${item.id}">
            Sequence: ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");

  action.innerHTML =
    `
      <optgroup label="Basic Actions">
        ${basic}
      </optgroup>

      <optgroup label="Two Character Choreography">
        ${duo}
      </optgroup>
    `;
}

/* ============================================================
   INITIAL OPTIONS
============================================================ */

fillSelect(
  characterA,
  CHARACTERS
);

fillSelect(
  characterB,
  CHARACTERS
);

fillSelect(
  background,
  BACKGROUNDS
);

fillSelect(
  prop,
  PROPS
);

fillActions();

fillCamera();

fillEffects();

characterA.value =
  "hero";

characterB.value =
  "rival";

background.value =
  "studio";

prop.value =
  "chair";

action.value =
  "idle";

camera.value =
  "medium";

effect.value =
  "none";

/* ============================================================
   CURRENT SCENE
============================================================ */

function createSceneFromUI() {

  const selectedAction =
    action.value;

  const duo =
    DUO_ACTIONS.find(
      item =>
        item.id ===
        selectedAction
    );

  const basic =
    SINGLE_ACTIONS.find(
      item =>
        item.id ===
        selectedAction
    );

  return {

    id:
      uid(),

    characterA:
      characterA.value,

    characterB:
      characterB.value,

    background:
      background.value,

    prop:
      prop.value,

    action:
      selectedAction,

    actionLabel:
      duo?.name ||
      basic?.name ||
      selectedAction,

    camera:
      camera.value,

    effect:
      effect.value,

    duration:
      Number(
        duration.value
      ) || 5,

    speed:
      Number(
        speed.value
      ) || 1,

    choreography:
      duo?.choreography ||
      [],

    createdAt:
      new Date().toISOString()
  };
}

/* ============================================================
   APPLY SCENE
============================================================ */

async function applyScene(
  sceneData
) {

  if (!sceneData) {
    return;
  }

  const charA =
    getCharacter(
      sceneData.characterA
    );

  const charB =
    getCharacter(
      sceneData.characterB
    );

  const bg =
    getBackground(
      sceneData.background
    );

  const selectedProp =
    getProp(
      sceneData.prop
    );

  await engine.configureCharacters(
    charA,
    charB
  );

  await engine.setBackground(
    bg
  );

  await engine.setProp(
    selectedProp
  );

  engine.cameraMode =
    sceneData.camera ||
    "medium";

  engine.effect =
    sceneData.effect ||
    "none";

  engine.setSpeed(
    sceneData.speed ||
    1
  );

  engine.setAction(
    sceneData.action,
    sceneData.choreography,
    sceneData.duration
  );

  currentScene.textContent =
    sceneData.actionLabel ||
    "Scene";

  duration.value =
    sceneData.duration;

  speed.value =
    String(
      sceneData.speed ||
      1
    );

  camera.value =
    sceneData.camera ||
    "medium";

  effect.value =
    sceneData.effect ||
    "none";

  characterA.value =
    sceneData.characterA;

  characterB.value =
    sceneData.characterB;

  background.value =
    sceneData.background;

  prop.value =
    sceneData.prop;

  action.value =
    sceneData.action;

  updateActionDescription();

  state.dirty =
    true;
}

/* ============================================================
   PREVIEW CURRENT UI
============================================================ */

async function previewCurrent() {

  const draft =
    createSceneFromUI();

  if (
    state.activeSceneId
  ) {

    const index =
      state.scenes.findIndex(
        scene =>
          scene.id ===
          state.activeSceneId
      );

    if (
      index >= 0
    ) {

      state.scenes[index] =
        {
          ...state.scenes[index],
          ...draft,
          id:
            state.scenes[index].id
        };
    }

  } else {

    state.activeSceneId =
      draft.id;

    state.scenes.push(
      draft
    );
  }

  await applyScene(
    draft
  );

  renderTimeline();
}

/* ============================================================
   ADD SCENE
============================================================ */

async function addScene() {

  const sceneData =
    createSceneFromUI();

  state.scenes.push(
    sceneData
  );

  state.activeSceneId =
    sceneData.id;

  await applyScene(
    sceneData
  );

  renderTimeline();

  state.dirty =
    true;
}

/* ============================================================
   NEW SCENE
============================================================ */

function newScene() {

  state.activeSceneId =
    null;

  currentScene.textContent =
    "New Scene";

  action.value =
    "idle";

  camera.value =
    "medium";

  effect.value =
    "none";

  duration.value =
    "5";

  speed.value =
    "1";

  engine.setAction(
    "idle",
    [],
    5
  );

  engine.pause();

  engine.seek(
    0
  );

  updateActionDescription();

  renderTimeline();
}

/* ============================================================
   DUPLICATE
============================================================ */

async function duplicateScene() {

  if (
    !state.activeSceneId
  ) {

    return;
  }

  const original =
    state.scenes.find(
      scene =>
        scene.id ===
        state.activeSceneId
    );

  if (!original) {
    return;
  }

  const copy =
    JSON.parse(
      JSON.stringify(
        original
      )
    );

  copy.id =
    uid();

  copy.createdAt =
    new Date().toISOString();

  state.scenes.push(
    copy
  );

  state.activeSceneId =
    copy.id;

  await applyScene(
    copy
  );

  renderTimeline();
}

/* ============================================================
   DELETE
============================================================ */

function deleteScene() {

  if (
    !state.activeSceneId
  ) {

    return;
  }

  state.scenes =
    state.scenes.filter(
      scene =>
        scene.id !==
        state.activeSceneId
    );

  state.activeSceneId =
    state.scenes.at(-1)?.id ||
    null;

  if (
    state.activeSceneId
  ) {

    const scene =
      state.scenes.find(
        item =>
          item.id ===
          state.activeSceneId
      );

    applyScene(
      scene
    );

  } else {

    newScene();
  }

  renderTimeline();
}

/* ============================================================
   LOAD SCENE
============================================================ */

async function loadScene(
  id
) {

  const sceneData =
    state.scenes.find(
      scene =>
        scene.id ===
        id
    );

  if (!sceneData) {
    return;
  }

  state.activeSceneId =
    id;

  await applyScene(
    sceneData
  );

  renderTimeline();
}

/* ============================================================
   TIMELINE
============================================================ */

function renderTimeline() {

  if (
    !state.scenes.length
  ) {

    timeline.innerHTML = `
      <div
        style="
          color:#64748b;
          font-size:11px;
          padding:12px;
        "
      >
        No scenes yet.
        Configure a scene and click Add Scene.
      </div>
    `;

    return;
  }

  timeline.innerHTML =
    state.scenes
      .map(
        (scene, index) => {

          const active =
            scene.id ===
            state.activeSceneId
              ? "active"
              : "";

          return `
            <button
              class="sb-scene-card ${active}"
              data-scene-id="${escapeHTML(scene.id)}"
            >

              <div
                class="sb-scene-number"
              >
                Scene ${index + 1}
              </div>

              <div
                class="sb-scene-name"
              >
                ${escapeHTML(scene.actionLabel)}
              </div>

              <div
                class="sb-scene-meta"
              >
                ${scene.duration.toFixed(1)}s
                ·
                ${escapeHTML(scene.camera)}
              </div>

            </button>
          `;
        }
      )
      .join("");

  all(
    "[data-scene-id]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () =>
          loadScene(
            button.dataset.sceneId
          )
      );
    }
  );
}

/* ============================================================
   ACTION DESCRIPTION
============================================================ */

function updateActionDescription() {

  const duo =
    DUO_ACTIONS.find(
      item =>
        item.id ===
        action.value
    );

  if (duo) {

    actionDescription.innerHTML =
      `
        <strong>
          Pre-authored choreography
        </strong>

        <br />

        ${duo.choreography
          .map(
            item =>
              `${item[0].toUpperCase()}
               ${item[1]}
               ${item[2]}s-${item[3]}s`
          )
          .join(" → ")}
      `;

    return;
  }

  const basic =
    SINGLE_ACTIONS.find(
      item =>
        item.id ===
        action.value
    );

  actionDescription.innerHTML =
    basic
      ? `
        <strong>
          ${escapeHTML(
            basic.name
          )}
        </strong>

        <br />

        Single-character
        pre-authored action.
      `
      : "";
}

/* ============================================================
   ACTION CARDS
============================================================ */

function renderActionCards() {

  const container =
    el(
      "#sb-action-cards"
    );

  const allActions = [
    ...SINGLE_ACTIONS,
    ...DUO_ACTIONS
  ];

  container.innerHTML =
    allActions
      .map(
        item => {

          const isDuo =
            DUO_ACTIONS.some(
              duo =>
                duo.id ===
                item.id
            );

          return `
            <button
              class="sb-action-card"
              data-action-card="${escapeHTML(item.id)}"
            >

              <strong>
                ${isDuo ? "⚔ " : "🎬 "}
                ${escapeHTML(item.name)}
              </strong>

              <small>
                ${item.duration}s
                ${isDuo
                  ? " · choreography"
                  : " · action"}
              </small>

            </button>
          `;
        }
      )
      .join("");

  all(
    "[data-action-card]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          action.value =
            button.dataset.actionCard;

          const selected =
            DUO_ACTIONS.find(
              item =>
                item.id ===
                action.value
            ) ||
            SINGLE_ACTIONS.find(
              item =>
                item.id ===
                action.value
            );

          if (selected) {

            duration.value =
              selected.duration;
          }

          updateActionDescription();

          await previewCurrent();
        }
      );
    }
  );
}

/* ============================================================
   UI CHANGE EVENTS
============================================================ */

[
  characterA,
  characterB,
  background,
  prop,
  action,
  camera,
  effect,
  duration,
  speed
].forEach(
  control => {

    control.addEventListener(
      "change",
      async () => {

        updateActionDescription();

        await previewCurrent();
      }
    );
  }
);

/* ============================================================
   PLAYBACK BUTTONS
============================================================ */

el("#sb-play")
  .addEventListener(
    "click",
    () => {

      engine.play();
    }
  );

el("#sb-pause")
  .addEventListener(
    "click",
    () => {

      engine.pause();
    }
  );

el("#sb-restart")
  .addEventListener(
    "click",
    () => {

      engine.restart();
    }
  );

/* ============================================================
   SCENE BUTTONS
============================================================ */

el("#sb-new")
  .addEventListener(
    "click",
    newScene
  );

el("#sb-add")
  .addEventListener(
    "click",
    addScene
  );

el("#sb-duplicate")
  .addEventListener(
    "click",
    duplicateScene
  );

el("#sb-delete")
  .addEventListener(
    "click",
    deleteScene
);

/* ============================================================
   TIME DISPLAY
============================================================ */

engine.onTimeChange =
  (
    current,
    total
  ) => {

    timeDisplay.textContent =
      `${current.toFixed(2)}
       /
       ${total.toFixed(2)}`;
  };

/* ============================================================
   SAVE PROJECT
============================================================ */

function saveProject() {

  const project = {

    version:
      1,

    application:
      "Botock 3D Scene Studio",

    projectName:
      state.projectName,

    createdAt:
      new Date().toISOString(),

    scenes:
      state.scenes
  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          project,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  downloadBlob(
    blob,
    "botock-3d-project.json"
  );

  state.dirty =
    false;
}

/* ============================================================
   LOAD PROJECT
============================================================ */

el("#sb-save-project")
  .addEventListener(
    "click",
    saveProject
  );

el("#sb-load-project")
  .addEventListener(
    "click",
    () => {

      el(
        "#sb-project-file"
      ).click();
    }
  );

el("#sb-project-file")
  .addEventListener(
    "change",
    async event => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      try {

        const text =
          await file.text();

        const project =
          JSON.parse(
            text
          );

        if (
          !Array.isArray(
            project.scenes
          )
        ) {

          throw new Error(
            "Invalid Botock project."
          );
        }

        state.scenes =
          project.scenes;

        state.projectName =
          project.projectName ||
          "Botock 3D Project";

        state.activeSceneId =
          state.scenes[0]?.id ||
          null;

        if (
          state.activeSceneId
        ) {

          await loadScene(
            state.activeSceneId
          );

        } else {

          newScene();
        }

        renderTimeline();

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Could not load this project."
        );
      }

      event.target.value =
        "";
    }
  );

/* ============================================================
   EXPORT ALL SCENES
============================================================ */

el("#sb-export")
  .addEventListener(
    "click",
    exportProject
  );

async function exportProject() {

  if (
    state.exporting
  ) {

    return;
  }

  if (
    !state.scenes.length
  ) {

    alert(
      "Pehle kam az kam 1 scene Add Scene se add karo."
    );

    return;
  }

  state.exporting =
    true;

  try {

    const originalScene =
      state.activeSceneId;

    const recordings =
      [];

    for (
      let index = 0;
      index <
      state.scenes.length;
      index++
    ) {

      const sceneData =
        state.scenes[index];

      exportStatus.textContent =
        `Recording Scene ${
          index + 1
        } / ${
          state.scenes.length
        }...`;

      await applyScene(
        sceneData
      );

      const blob =
        await engine.record(
          sceneData.duration,
          30
        );

      recordings.push({
        scene:
          sceneData,
        blob
      });
    }

    /* --------------------------------------------------------
       CURRENT BROWSER IMPLEMENTATION:

       Download every scene separately.

       Later Botock backend/FFmpeg can concatenate these
       WebM/MP4 segments into one final movie.

       This avoids fake "combined video" behaviour.
    -------------------------------------------------------- */

    for (
      let index = 0;
      index <
      recordings.length;
      index++
    ) {

      const item =
        recordings[index];

      downloadBlob(
        item.blob,
        `botock-scene-${index + 1}.webm`
      );
    }

    exportStatus.textContent =
      `${recordings.length} scene(s) exported.`;

    if (
      originalScene
    ) {

      await loadScene(
        originalScene
      );
    }

  } catch (error) {

    console.error(
      "Export failed:",
      error
    );

    exportStatus.textContent =
      "Export failed.";

    alert(
      error.message ||
      "Video export failed."
    );

  } finally {

    state.exporting =
      false;
  }
}

/* ============================================================
   INITIAL PROJECT
============================================================ */

const firstScene =
  createSceneFromUI();

state.scenes.push(
  firstScene
);

state.activeSceneId =
  firstScene.id;

applyScene(
  firstScene
);

renderTimeline();

renderActionCards();

updateActionDescription();

/* ============================================================
   PUBLIC DEBUG API

   Useful later for Botock development.
============================================================ */

window.BotockSceneStudio = {

  engine,

  state,

  addScene,

  deleteScene,

  duplicateScene,

  exportProject,

  saveProject,

  loadScene
};