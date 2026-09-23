"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import useFFmpeg from "@/lib/ffmpeg/useFFmpeg";
import { formatBytes, formatTime } from "@/lib/utils/formatters";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  Film,
  Loader2,
  Pause,
  Play,
  Redo2,
  RotateCcw,
  Scissors,
  Trash2,
  Undo2,
  Upload,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type Segment = {
  id: string;
  start: number;
  end: number;
};

type HistoryState = Segment[];

const MIN_SEGMENT_DURATION = 0.05;
const THUMBNAIL_COUNT = 48;

function createSegmentId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneSegments(segments: Segment[]): Segment[] {
  return segments.map((segment) => ({ ...segment }));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeSegments(
  segments: Segment[],
  duration: number
): Segment[] {
  if (!duration || duration <= 0) return [];

  return segments
    .map((segment) => ({
      ...segment,
      start: clamp(segment.start, 0, duration),
      end: clamp(segment.end, 0, duration),
    }))
    .filter(
      (segment) =>
        segment.end - segment.start >= MIN_SEGMENT_DURATION
    )
    .sort((a, b) => a.start - b.start);
}

function mergeSegments(segments: Segment[]): Segment[] {
  if (segments.length <= 1) return segments;

  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const merged: Segment[] = [];

  for (const segment of sorted) {
    const previous = merged[merged.length - 1];

    if (!previous) {
      merged.push({ ...segment });
      continue;
    }

    if (segment.start <= previous.end + 0.001) {
      previous.end = Math.max(previous.end, segment.end);
    } else {
      merged.push({ ...segment });
    }
  }

  return merged;
}

function formatTimelineTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function VideoTrimClient() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null
  );

  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSegmentIndex, setPreviewSegmentIndex] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const [dragHandle, setDragHandle] = useState<
    { segmentId: string; side: "start" | "end" } | null
  >(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resultVideoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const objectUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const {
    load,
    writeFile,
    readFile,
    deleteFile,
    exec,
    cancel,
    isProcessing,
    progress,
    statusMessage,
    error,
  } = useFFmpeg();

  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.id === selectedSegmentId) || null,
    [segments, selectedSegmentId]
  );

  const keptDuration = useMemo(
    () =>
      segments.reduce(
        (total, segment) => total + Math.max(0, segment.end - segment.start),
        0
      ),
    [segments]
  );

  const removedDuration = Math.max(0, duration - keptDuration);

  const isLargeFile = Boolean(
    originalFile && originalFile.size > 100 * 1024 * 1024
  );

  const pushHistory = useCallback((nextSegments: Segment[]) => {
    setUndoStack((previous) => [
      ...previous,
      cloneSegments(nextSegments),
    ]);
    setRedoStack([]);
  }, []);

  const updateSegments = useCallback(
    (
      updater:
        | Segment[]
        | ((previous: Segment[]) => Segment[])
    ) => {
      setSegments((previous) => {
        const next =
          typeof updater === "function"
            ? updater(previous)
            : updater;

        const normalized = mergeSegments(
          normalizeSegments(next, duration)
        );

        pushHistory(previous);
        return normalized;
      });
    },
    [duration, pushHistory]
  );

  const undo = useCallback(() => {
    setUndoStack((previous) => {
      if (previous.length === 0) return previous;

      const previousState = previous[previous.length - 1];

      setSegments((current) => {
        setRedoStack((redo) => [
          ...redo,
          cloneSegments(current),
        ]);
        return cloneSegments(previousState);
      });

      return previous.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((previous) => {
      if (previous.length === 0) return previous;

      const nextState = previous[previous.length - 1];

      setSegments((current) => {
        setUndoStack((undoHistory) => [
          ...undoHistory,
          cloneSegments(current),
        ]);
        return cloneSegments(nextState);
      });

      return previous.slice(0, -1);
    });
  }, []);

  const revokeVideoUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const revokeResultUrl = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      revokeVideoUrl();
      revokeResultUrl();
    };
  }, [revokeVideoUrl, revokeResultUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      if (!file.type.startsWith("video/")) {
        setErrorMsg("Please select a valid video file.");
        return;
      }

      if (file.size === 0) {
        setErrorMsg("The selected video file is empty.");
        return;
      }

      revokeVideoUrl();
      revokeResultUrl();

      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;

      setOriginalFile(file);
      setVideoUrl(url);
      setResultUrl(null);
      setResultSize(null);

      setDuration(0);
      setCurrentTime(0);

      setSegments([]);
      setSelectedSegmentId(null);

      setUndoStack([]);
      setRedoStack([]);

      setThumbnails([]);
      setPreviewMode(false);
      setPreviewSegmentIndex(0);

      setErrorMsg(null);
    },
    [revokeResultUrl, revokeVideoUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [
        ".mp4",
        ".webm",
        ".mov",
        ".mkv",
        ".m4v",
        ".avi",
      ],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    const videoDuration = video.duration;

    if (
      !Number.isFinite(videoDuration) ||
      videoDuration <= 0
    ) {
      setErrorMsg("Could not read the video duration.");
      return;
    }

    setDuration(videoDuration);

    const initialSegment: Segment = {
      id: createSegmentId(),
      start: 0,
      end: videoDuration,
    };

    setSegments([initialSegment]);
    setSelectedSegmentId(initialSegment.id);
    setUndoStack([]);
    setRedoStack([]);
    setCurrentTime(0);
    setErrorMsg(null);
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;

    if (!video) return;

    const safeTime = clamp(
      time,
      0,
      Number.isFinite(video.duration) ? video.duration : time
    );

    video.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, []);

  const getTimelineTimeFromPointer = useCallback(
    (clientX: number) => {
      const timeline = timelineRef.current;

      if (!timeline || duration <= 0) return null;

      const rect = timeline.getBoundingClientRect();

      const relativeX = clamp(
        clientX - rect.left,
        0,
        rect.width
      );

      return (relativeX / rect.width) * duration;
    },
    [duration]
  );

  const handleTimelinePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isDraggingHandle) return;

      const time = getTimelineTimeFromPointer(event.clientX);

      if (time === null) return;

      seekTo(time);

      const containingSegment = segments.find(
        (segment) =>
          time >= segment.start &&
          time <= segment.end
      );

      if (containingSegment) {
        setSelectedSegmentId(containingSegment.id);
      }
    },
    [
      getTimelineTimeFromPointer,
      isDraggingHandle,
      seekTo,
      segments,
    ]
  );

  const startHandleDrag = useCallback(
    (
      event: React.PointerEvent<HTMLButtonElement>,
      segmentId: string,
      side: "start" | "end"
    ) => {
      event.preventDefault();
      event.stopPropagation();

      setIsDraggingHandle(true);
      setDragHandle({ segmentId, side });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    []
  );

  useEffect(() => {
    if (!isDraggingHandle || !dragHandle) return;

    const handlePointerMove = (event: PointerEvent) => {
      const time = getTimelineTimeFromPointer(event.clientX);

      if (time === null) return;

      setSegments((previous) =>
        previous.map((segment) => {
          if (segment.id !== dragHandle.segmentId) {
            return segment;
          }

          if (dragHandle.side === "start") {
            const nextStart = clamp(
              time,
              0,
              segment.end - MIN_SEGMENT_DURATION
            );

            return {
              ...segment,
              start: nextStart,
            };
          }

          const nextEnd = clamp(
            time,
            segment.start + MIN_SEGMENT_DURATION,
            duration
          );

          return {
            ...segment,
            end: nextEnd,
          };
        })
      );

      seekTo(time);
    };

    const handlePointerUp = () => {
      setIsDraggingHandle(false);
      setDragHandle(null);

      setSegments((previous) =>
        mergeSegments(
          normalizeSegments(previous, duration)
        )
      );
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    dragHandle,
    duration,
    getTimelineTimeFromPointer,
    isDraggingHandle,
    seekTo,
  ]);

  const cutAtPlayhead = useCallback(() => {
    if (!duration || segments.length === 0) return;

    const time = clamp(currentTime, 0, duration);

    const segment = segments.find(
      (item) =>
        time > item.start + MIN_SEGMENT_DURATION &&
        time < item.end - MIN_SEGMENT_DURATION
    );

    if (!segment) {
      setErrorMsg(
        "Place the playhead inside a kept section before cutting."
      );
      return;
    }

    const first: Segment = {
      id: createSegmentId(),
      start: segment.start,
      end: time,
    };

    const second: Segment = {
      id: createSegmentId(),
      start: time,
      end: segment.end,
    };

    const next = segments.flatMap((item) =>
      item.id === segment.id ? [first, second] : [item]
    );

    pushHistory(segments);
    setSegments(next);
    setSelectedSegmentId(second.id);
    setErrorMsg(null);
  }, [
    currentTime,
    duration,
    pushHistory,
    segments,
  ]);

  const deleteSelectedSegment = useCallback(() => {
    if (!selectedSegmentId) {
      setErrorMsg("Select a section on the timeline first.");
      return;
    }

    if (segments.length <= 1) {
      setErrorMsg(
        "You cannot delete the only remaining section. Use Cut Here first."
      );
      return;
    }

    pushHistory(segments);

    const next = segments.filter(
      (segment) => segment.id !== selectedSegmentId
    );

    setSegments(next);
    setSelectedSegmentId(next[0]?.id ?? null);
    setErrorMsg(null);
  }, [
    pushHistory,
    segments,
    selectedSegmentId,
  ]);

  const keepOnlySelected = useCallback(() => {
    if (!selectedSegment) {
      setErrorMsg("Select a section first.");
      return;
    }

    if (segments.length === 1) return;

    pushHistory(segments);

    setSegments([selectedSegment]);
    setSelectedSegmentId(selectedSegment.id);
    setErrorMsg(null);
  }, [
    pushHistory,
    segments,
    selectedSegment,
  ]);

  const resetEdits = useCallback(() => {
    if (!duration) return;

    pushHistory(segments);

    const resetSegment: Segment = {
      id: createSegmentId(),
      start: 0,
      end: duration,
    };

    setSegments([resetSegment]);
    setSelectedSegmentId(resetSegment.id);
    setCurrentTime(0);
    seekTo(0);
    setErrorMsg(null);
  }, [
    duration,
    pushHistory,
    segments,
    seekTo,
  ]);

  const togglePlayback = useCallback(async () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setErrorMsg(
          "Browser blocked video playback. Click the video player to start it."
        );
      }
    } else {
      video.pause();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    const time = video.currentTime;
    setCurrentTime(time);

    if (!previewMode) return;

    const currentSegment = segments[previewSegmentIndex];

    if (!currentSegment) {
      setPreviewMode(false);
      video.pause();
      return;
    }

    if (time >= currentSegment.end - 0.02) {
      const nextIndex = previewSegmentIndex + 1;

      if (nextIndex < segments.length) {
        setPreviewSegmentIndex(nextIndex);
        video.currentTime = segments[nextIndex].start;
      } else {
        setPreviewMode(false);
        video.pause();
        setIsPlaying(false);
      }
    }
  }, [
    previewMode,
    previewSegmentIndex,
    segments,
  ]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const previewEditedVideo = useCallback(() => {
    if (!videoRef.current || segments.length === 0) {
      return;
    }

    const firstSegment = segments[0];

    setPreviewMode(true);
    setPreviewSegmentIndex(0);

    videoRef.current.currentTime = firstSegment.start;

    videoRef.current
      .play()
      .catch(() => {
        setPreviewMode(false);
        setErrorMsg(
          "Unable to start preview. Please click Play manually."
        );
      });
  }, [segments]);

  const generateThumbnails = useCallback(
    async (url: string, videoDuration: number) => {
      if (!url || !videoDuration) return;

      setIsGeneratingThumbnails(true);

      const sourceVideo = document.createElement("video");

      sourceVideo.preload = "metadata";
      sourceVideo.muted = true;
      sourceVideo.playsInline = true;
      sourceVideo.src = url;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        setIsGeneratingThumbnails(false);
        return;
      }

      canvas.width = 160;
      canvas.height = 90;

      try {
        await new Promise<void>((resolve, reject) => {
          sourceVideo.onloadedmetadata = () => resolve();
          sourceVideo.onerror = () =>
            reject(new Error("Could not load video for thumbnails."));
        });

        const count = Math.min(
          THUMBNAIL_COUNT,
          Math.max(8, Math.ceil(videoDuration / 2))
        );

        const generated: string[] = [];

        for (let index = 0; index < count; index++) {
          const time =
            count === 1
              ? 0
              : (index / (count - 1)) *
                Math.max(0, videoDuration - 0.01);

          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              sourceVideo.removeEventListener(
                "seeked",
                onSeeked
              );
              resolve();
            };

            sourceVideo.addEventListener(
              "seeked",
              onSeeked
            );

            sourceVideo.currentTime = time;
          });

          context.fillStyle = "#000";
          context.fillRect(0, 0, canvas.width, canvas.height);

          try {
            context.drawImage(
              sourceVideo,
              0,
              0,
              canvas.width,
              canvas.height
            );

            generated.push(
              canvas.toDataURL("image/jpeg", 0.65)
            );
          } catch {
            generated.push("");
          }
        }

        setThumbnails(generated);
      } catch {
        setThumbnails([]);
      } finally {
        sourceVideo.pause();
        sourceVideo.removeAttribute("src");
        sourceVideo.load();

        setIsGeneratingThumbnails(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!videoUrl || !duration) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await generateThumbnails(videoUrl, duration);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [duration, generateThumbnails, videoUrl]);
const exportVideo = useCallback(async () => {
    if (!originalFile || duration <= 0) {
      setErrorMsg("Please load a valid video first.");
      return;
    }

    const finalSegments = mergeSegments(normalizeSegments(segments, duration));

    if (finalSegments.length === 0) {
      setErrorMsg("There is no video section left to export.");
      return;
    }

    const totalDuration = finalSegments.reduce(
      (sum, segment) => sum + (segment.end - segment.start),
      0
    );

    if (totalDuration < MIN_SEGMENT_DURATION) {
      setErrorMsg("The selected video is too short.");
      return;
    }

    setErrorMsg(null);
    revokeResultUrl();
    setResultUrl(null);
    setResultSize(null);

    const inputName = "botock_input.mp4";
    const outputName = "botock_trimmed_output.mp4";
    const audioProbeName = "botock_audio_probe.m4a";

    try {
      await load();

      if (!writeFile || !exec || !readFile || !deleteFile) {
        throw new Error("The FFmpeg processing engine is unavailable.");
      }

      const inputBytes = new Uint8Array(await originalFile.arrayBuffer());
      await writeFile(inputName, inputBytes);

      // FIX 2: Fast Audio Probe (Sirf 0.1 second extract karega freeze hone se bachne ke liye)
      let hasAudio = false;
      try {
        const audioProbeExitCode = await exec([
          "-y",
          "-i", inputName,
          "-t", "0.1", // <-- YEH TIME LIMIT ADD KI HAI
          "-map", "0:a:0",
          "-c", "copy",
          audioProbeName,
        ]);
        hasAudio = audioProbeExitCode === 0;
      } catch {
        hasAudio = false;
      }

      try {
        await deleteFile(audioProbeName);
      } catch {
        // Best-effort cleanup
      }

      let args: string[] = [];

      // FIX 1: Handle Single Clip vs Multiple Clips Safely
      if (finalSegments.length === 1) {
        // Agar 1 clip hai toh direct fast cut (No concat crash)
        const seg = finalSegments[0];
        args = [
          "-y",
          "-i", inputName,
          "-ss", seg.start.toFixed(3),
          "-to", seg.end.toFixed(3),
          ...(hasAudio ? ["-c:a", "aac", "-b:a", "128k"] : ["-an"]),
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-crf", "20",
          "-movflags", "+faststart",
          outputName
        ];
      } else {
        // Agar 2+ clips hain toh filter_complex (Concat) use karein
        const filterParts: string[] = [];
        const concatInputs: string[] = [];

        finalSegments.forEach((segment, index) => {
          const start = segment.start.toFixed(3);
          const end = segment.end.toFixed(3);

          filterParts.push(`[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${index}]`);

          if (hasAudio) {
            filterParts.push(`[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${index}]`);
            concatInputs.push(`[v${index}][a${index}]`);
          } else {
            concatInputs.push(`[v${index}]`);
          }
        });

        if (hasAudio) {
          filterParts.push(`${concatInputs.join("")}concat=n=${finalSegments.length}:v=1:a=1[outv][outa]`);
        } else {
          filterParts.push(`${concatInputs.join("")}concat=n=${finalSegments.length}:v=1:a=0[outv]`);
        }

        const filterComplex = filterParts.join(";");

        args = [
          "-y",
          "-i", inputName,
          "-filter_complex", filterComplex,
          "-map", "[outv]",
          ...(hasAudio ? ["-map", "[outa]", "-c:a", "aac", "-b:a", "128k"] : ["-an"]),
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-crf", "20",
          "-movflags", "+faststart",
          outputName
        ];
      }

      const exitCode = await exec(args);

      if (exitCode !== 0) {
        throw new Error(`FFmpeg could not export the edited video. Exit code: ${exitCode}`);
      }

      const outputBytes = await readFile(outputName);
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;

      setResultUrl(url);
      setResultSize(blob.size);
      setPreviewMode(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to export the edited video.";
      setErrorMsg(message);
    } finally {
      try { await deleteFile(inputName); } catch {}
      try { await deleteFile(outputName); } catch {}
      try { await deleteFile(audioProbeName); } catch {}
    }
  }, [
    deleteFile,
    duration,
    exec,
    segments, // Yahan finalSegments hata kar segments kiya gaya taake dependencies sahi rahein
    load,
    originalFile,
    readFile,
    revokeResultUrl,
    writeFile,
  ]);

  const resetAll = useCallback(() => {
    if (isProcessing) {
      void cancel?.();
    }

    revokeVideoUrl();
    revokeResultUrl();

    setOriginalFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setResultSize(null);

    setDuration(0);
    setCurrentTime(0);

    setSegments([]);
    setSelectedSegmentId(null);

    setUndoStack([]);
    setRedoStack([]);

    setThumbnails([]);
    setPreviewMode(false);
    setPreviewSegmentIndex(0);

    setIsPlaying(false);
    setZoom(1);

    setErrorMsg(null);
  }, [
    cancel,
    isProcessing,
    revokeResultUrl,
    revokeVideoUrl,
  ]);

  const timelineMinWidth = Math.max(
    720,
    720 * zoom
  );

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#121215] sm:p-6">
      {!originalFile ? (
        <div
          {...getRootProps()}
          className={`flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all sm:p-16 ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50 dark:border-white/[0.1] dark:hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10">
            <Upload className="h-9 w-9 text-emerald-500" />
          </div>

          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Drop your video here
          </h2>

          <p className="mb-5 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Cut multiple sections, remove unwanted parts and
            export one final video.
          </p>

          <span className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
            Choose Video
          </span>

          <p className="mt-5 text-xs text-slate-400">
            MP4, WebM, MOV, MKV, M4V, AVI • Processing happens
            locally in your browser
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Top bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <Film className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {originalFile.name}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(originalFile.size)} •{" "}
                  {duration
                    ? formatTimelineTime(duration)
                    : "Reading duration..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={undoStack.length === 0 || isProcessing}
                title="Undo"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
              >
                <Undo2 className="h-4 w-4" />
              </button>

              <button
                onClick={redo}
                disabled={redoStack.length === 0 || isProcessing}
                title="Redo"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
              >
                <Redo2 className="h-4 w-4" />
              </button>

              <button
                onClick={resetEdits}
                disabled={isProcessing || !duration}
                title="Reset edits"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={resetAll}
                disabled={isProcessing}
                className="ml-1 flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-500/20 disabled:opacity-40 dark:text-rose-400"
              >
                <X className="h-4 w-4" />
                Start Over
              </button>
            </div>
          </div>

          {/* Large file notice */}
          {isLargeFile && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <p>
                <span className="font-bold">
                  Large video:
                </span>{" "}
                browser-based FFmpeg uses local WebAssembly
                memory. Large videos may take longer to export.
              </p>
            </div>
          )}

          {/* Editor */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 dark:border-white/[0.08]">
            {/* Preview */}
            <div className="relative flex aspect-video max-h-[600px] items-center justify-center bg-black">
              <video
                ref={videoRef}
                src={videoUrl || undefined}
                className="h-full w-full object-contain"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={() => {
                  setIsPlaying(false);

                  if (previewMode) {
                    setPreviewMode(false);
                  }
                }}
                playsInline
              />

              {!isPlaying && (
                <button
                  onClick={togglePlayback}
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-2xl transition hover:scale-105"
                  aria-label="Play video"
                >
                  <Play className="ml-1 h-7 w-7 fill-current" />
                </button>
              )}

              <div className="absolute bottom-4 left-4 rounded-lg bg-black/70 px-3 py-1.5 font-mono text-xs text-white backdrop-blur">
                {formatTimelineTime(currentTime)} /{" "}
                {formatTimelineTime(duration)}
              </div>

              {previewMode && (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  <Check className="h-3.5 w-3.5" />
                  Previewing Edit
                </div>
              )}
            </div>

            {/* Main editor controls */}
            <div className="border-t border-white/[0.08] bg-[#18181c]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-bold text-white transition hover:bg-white/[0.13]"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                    {isPlaying ? "Pause" : "Play"}
                  </button>

                  <button
                    onClick={cutAtPlayhead}
                    disabled={isProcessing}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:opacity-40"
                  >
                    <Scissors className="h-4 w-4" />
                    Cut Here
                  </button>

                  <button
                    onClick={deleteSelectedSegment}
                    disabled={
                      isProcessing ||
                      !selectedSegmentId ||
                      segments.length <= 1
                    }
                    className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Section
                  </button>

                  <button
                    onClick={keepOnlySelected}
                    disabled={
                      isProcessing ||
                      !selectedSegment ||
                      segments.length <= 1
                    }
                    className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.1] disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                    Keep Only
                  </button>
                </div>

                <button
                  onClick={previewEditedVideo}
                  disabled={
                    isProcessing || segments.length === 0
                  }
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-200 disabled:opacity-40"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Preview Edit
                </button>
              </div>

              {/* Timeline */}
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      Keep{" "}
                      <strong className="text-emerald-400">
                        {formatTimelineTime(keptDuration)}
                      </strong>
                    </span>

                    {removedDuration > 0 && (
                      <span>
                        Removed{" "}
                        <strong className="text-rose-400">
                          {formatTimelineTime(removedDuration)}
                        </strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setZoom((value) =>
                          Math.max(1, value - 0.5)
                        )
                      }
                      disabled={zoom <= 1}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/[0.06] disabled:opacity-30"
                      title="Zoom out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>

                    <span className="min-w-10 text-center text-[10px] text-slate-500">
                      {zoom.toFixed(1)}x
                    </span>

                    <button
                      onClick={() =>
                        setZoom((value) =>
                          Math.min(4, value + 0.5)
                        )
                      }
                      disabled={zoom >= 4}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/[0.06] disabled:opacity-30"
                      title="Zoom in"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div
                    ref={timelineRef}
                    onPointerDown={handleTimelinePointerDown}
                    className="relative h-[128px] min-w-[720px] select-none cursor-crosshair"
                    style={{
                      minWidth: `${timelineMinWidth}px`,
                    }}
                  >
                    {/* Thumbnail strip */}
                    <div className="absolute inset-x-0 top-5 h-[82px] overflow-hidden rounded-xl border border-white/[0.1] bg-slate-900">
                      {thumbnails.length > 0 ? (
                        <div className="flex h-full w-full">
                          {thumbnails.map((thumbnail, index) => (
                            <div
                              key={`${thumbnail}-${index}`}
                              className="h-full min-w-0 flex-1 border-r border-black/20 last:border-r-0"
                            >
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt=""
                                  draggable={false}
                                  className="h-full w-full object-cover opacity-80"
                                />
                              ) : (
                                <div className="h-full w-full bg-slate-800" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">
                          {isGeneratingThumbnails
                            ? "Generating video timeline..."
                            : "Timeline"}
                        </div>
                      )}
                    </div>

                    {/* Removed areas */}
                    {segments.length > 0 &&
                      Array.from(
                        { length: Math.max(0, segments.length - 1) },
                        (_, index) => {
                          const leftSegment = segments[index];
                          const rightSegment =
                            segments[index + 1];

                          const left =
                            (leftSegment.end / duration) * 100;

                          const width =
                            ((rightSegment.start -
                              leftSegment.end) /
                              duration) *
                            100;

                          if (width <= 0) return null;

                          return (
                            <div
                              key={`removed-${leftSegment.id}-${rightSegment.id}`}
                              className="absolute top-5 h-[82px] bg-rose-950/70"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                              }}
                            >
                              <div className="flex h-full items-center justify-center">
                                <div className="rotate-[-90deg] whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-rose-300/70">
                                  Removed
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}

                    {/* Segment borders and handles */}
                    {segments.map((segment, index) => {
                      const left =
                        (segment.start / duration) * 100;

                      const width =
                        ((segment.end - segment.start) /
                          duration) *
                        100;

                      const selected =
                        selectedSegmentId === segment.id;

                      return (
                        <div
                          key={segment.id}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            setSelectedSegmentId(segment.id);
                          }}
                          className={`absolute top-5 h-[82px] rounded-lg border-2 transition ${
                            selected
                              ? "border-emerald-400"
                              : "border-white/30"
                          }`}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            minWidth: "8px",
                          }}
                        >
                          {selected && (
                            <>
                              <button
                                onPointerDown={(event) =>
                                  startHandleDrag(
                                    event,
                                    segment.id,
                                    "start"
                                  )
                                }
                                className="absolute left-[-5px] top-[-2px] z-20 flex h-[86px] w-3 cursor-ew-resize items-center justify-center rounded-l-md bg-emerald-400"
                                aria-label="Drag segment start"
                              >
                                <span className="h-7 w-1 rounded-full bg-white/90" />
                              </button>

                              <button
                                onPointerDown={(event) =>
                                  startHandleDrag(
                                    event,
                                    segment.id,
                                    "end"
                                  )
                                }
                                className="absolute right-[-5px] top-[-2px] z-20 flex h-[86px] w-3 cursor-ew-resize items-center justify-center rounded-r-md bg-emerald-400"
                                aria-label="Drag segment end"
                              >
                                <span className="h-7 w-1 rounded-full bg-white/90" />
                              </button>
                            </>
                          )}

                          {selected && width > 8 && (
                            <div className="absolute left-2 top-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                              {formatTimelineTime(
                                segment.start
                              )}{" "}
                              -{" "}
                              {formatTimelineTime(segment.end)}
                            </div>
                          )}

                          {index > 0 && (
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                              {index + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Playhead */}
                    {duration > 0 && (
                      <div
                        className="pointer-events-none absolute bottom-0 top-0 z-30 w-px bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        style={{
                          left: `${clamp(
                            (currentTime / duration) * 100,
                            0,
                            100
                          )}%`,
                        }}
                      >
                        <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-b-sm bg-white" />
                      </div>
                    )}

                    {/* Time ruler */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] font-mono text-slate-500">
                      <span>00:00</span>
                      <span>
                        {formatTimelineTime(duration / 2)}
                      </span>
                      <span>
                        {formatTimelineTime(duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline hint */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] px-4 py-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                  Kept section
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-900" />
                  Removed section
                </span>

                <span>
                  Click timeline to move playhead
                </span>

                <span>
                  Drag green edges to adjust a cut
                </span>
              </div>
            </div>
          </div>

          {/* Selection info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                Kept Sections
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {segments.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                Final Duration
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatTime(keptDuration, true)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                Removed
              </p>
              <p className="text-xl font-bold text-rose-500">
                {formatTime(removedDuration, true)}
              </p>
            </div>
          </div>

          {/* Selected segment details */}
          {selectedSegment && (
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Selected Section
                </p>

                <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-200">
                  {formatTimelineTime(
                    selectedSegment.start
                  )}{" "}
                  →{" "}
                  {formatTimelineTime(selectedSegment.end)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    seekTo(selectedSegment.start)
                  }
                  className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.12]"
                >
                  Jump to Start
                </button>

                <button
                  onClick={() =>
                    seekTo(selectedSegment.end)
                  }
                  className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.12]"
                >
                  Jump to End
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {(errorMsg || error) && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <span className="font-bold">Error:</span>{" "}
                {errorMsg || error}
              </div>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  {statusMessage || "Exporting video..."}
                </div>

                <span className="font-mono text-xs font-bold text-emerald-500">
                  {progress.percent}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-200"
                  style={{
                    width: `${progress.percent}%`,
                  }}
                />
              </div>

              <button
                onClick={() => void cancel?.()}
                className="mt-4 w-full rounded-xl bg-rose-500/10 py-2.5 text-xs font-bold text-rose-500 transition hover:bg-rose-500/20"
              >
                Cancel Export
              </button>
            </div>
          )}

          {/* Export */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.06] dark:bg-white/[0.03]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-emerald-500" />

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ready to Export
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {segments.length} kept{" "}
                  {segments.length === 1
                    ? "section"
                    : "sections"}{" "}
                  • {formatTime(keptDuration, true)} final
                  duration
                </p>
              </div>

              <button
                onClick={() => void exportVideo()}
                disabled={
                  isProcessing ||
                  segments.length === 0 ||
                  keptDuration < MIN_SEGMENT_DURATION
                }
                className="flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Edited Video
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          {resultUrl && (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Video exported successfully
                </div>

                {resultSize !== null && (
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(resultSize)}
                  </span>
                )}
              </div>

              <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-black">
                <video
                  ref={resultVideoRef}
                  src={resultUrl}
                  controls
                  playsInline
                  className="aspect-video w-full object-contain"
                />
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a
                  href={resultUrl}
                  download={`trimmed_${originalFile.name.replace(
                    /\.[^/.]+$/,
                    ""
                  )}.mp4`}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Download className="h-4 w-4" />
                  Download Video
                </a>

                <button
                  onClick={() => {
                    revokeResultUrl();
                    setResultUrl(null);
                    setResultSize(null);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Result
                </button>
              </div>
            </div>
          )}

          {/* Audio/local processing info */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-emerald-500" />
              Original audio is preserved when the source contains
              an audio track.
            </div>

            <div className="hidden h-4 w-px bg-slate-300 dark:bg-white/[0.1] sm:block" />

            <div className="flex items-center gap-2">
              <VolumeX className="h-4 w-4 text-slate-400" />
              Silent videos are exported without adding fake audio.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
