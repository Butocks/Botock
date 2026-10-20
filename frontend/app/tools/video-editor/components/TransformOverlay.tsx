import React, { useState, useEffect, useRef } from "react";
import { TimelineClip, EditorProject, MediaBinItem, MotionPath } from "@/lib/editor/types";
import { RotateCw, Check, Undo2, Move, Zap, Play, Maximize2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

interface Props {
  clip: TimelineClip;
  project: EditorProject;
  mediaItem?: MediaBinItem;
  onBeginLive?: () => void;
  onUpdateLive: (patch: Partial<TimelineClip>) => void;
  onCommitLive: () => void;
  onDeselect?: () => void;
  onDone?: () => void;
  onSeek?: (time: number) => void;
  onPreview?: (time: number, duration?: number) => void;
}

export default function TransformOverlay({
  clip,
  project,
  mediaItem,
  onBeginLive,
  onUpdateLive,
  onCommitLive,
  onDeselect,
  onDone,
  onSeek,
  onPreview,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  // Motion arrow drag states
  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startTransform, setStartTransform] = useState(clip.transform);
  const startMotionRef = useRef<MotionPath | null>(null);

  const scaleInitialDistRef = useRef(1);
  const rotateStartAngleRef = useRef(0);

  const t = {
    x: Number.isFinite(clip.transform?.x) ? clip.transform!.x : 50,
    y: Number.isFinite(clip.transform?.y) ? clip.transform!.y : 50,
    width: Number.isFinite(clip.transform?.width) ? clip.transform!.width : 100,
    height: Number.isFinite(clip.transform?.height) ? clip.transform!.height : 100,
    rotation: Number.isFinite(clip.transform?.rotation) ? clip.transform!.rotation : 0,
    scaleX: Number.isFinite(clip.transform?.scaleX) ? clip.transform!.scaleX : 1,
    scaleY: Number.isFinite(clip.transform?.scaleY) ? clip.transform!.scaleY : 1,
    opacity: Number.isFinite(clip.transform?.opacity) ? clip.transform!.opacity : 100,
  };

  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });

  // Smart initial position: place opposite to element to avoid covering it
  const defaultPosition = t.y > 45 ? "top" : "bottom";
  const [toolbarPosition, setToolbarPosition] = useState<"top" | "bottom">(defaultPosition);
  const [isMinimized, setIsMinimized] = useState(false);

  const motion = clip.motionPath;
  const hasMotion = !!motion?.enabled;

  const motionStartX = Number.isFinite(motion?.startX) ? motion!.startX : t.x;
  const motionStartY = Number.isFinite(motion?.startY) ? motion!.startY : t.y;
  const motionEndX = Number.isFinite(motion?.endX) ? motion!.endX : Math.min(95, t.x + 30);
  const motionEndY = Number.isFinite(motion?.endY) ? motion!.endY : t.y;
  const pathType = motion?.pathType || "line";

  // Calculate base dimensions matching PreviewCanvas logic
  const isText = clip.type === "text";
  const intrinsicW = mediaItem?.width || 1280;
  const intrinsicH = mediaItem?.height || 720;
  const scaleFit = Math.min(project.width / intrinsicW, project.height / intrinsicH);
  const baseW = intrinsicW * scaleFit;
  const baseH = intrinsicH * scaleFit;

  const textLen = (clip.text || "Subtitle").length;
  const fontSize = clip.fontSizePercent || 48;
  const textW = Math.max(140, Math.min(project.width * 0.9, textLen * (fontSize * 0.65) + 40));
  const textH = Math.max(50, fontSize * 1.5 + 20);

  const finalW = isText ? textW * (t.scaleX || 1) : baseW * (t.width / 100) * t.scaleX;
  const finalH = isText ? textH * (t.scaleY || 1) : baseH * (t.height / 100) * t.scaleY;

  const widthPct = (finalW / project.width) * 100;
  const heightPct = (finalH / project.height) * 100;

  // 1. Mouse / Pointer Move Dragging for Main Bounding Box
  const handlePointerDownMove = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
    onBeginLive?.();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartTransform({ ...t });
  };

  // 2. Corner Scaling (radial from center)
  const handlePointerDownScale = (e: React.PointerEvent, corner: string) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    if (!containerRef.current) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
    onBeginLive?.();
    setIsScaling(corner);

    const rect = containerRef.current.getBoundingClientRect();
    const clipCenterX = rect.left + (t.x / 100) * rect.width;
    const clipCenterY = rect.top + (t.y / 100) * rect.height;
    const initialDist = Math.hypot(e.clientX - clipCenterX, e.clientY - clipCenterY);

    scaleInitialDistRef.current = Math.max(15, initialDist);
    setStartTransform({ ...t });
  };

  // 3. Rotation Handle (angle around center)
  const handlePointerDownRotate = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    if (!containerRef.current) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
    onBeginLive?.();
    setIsRotating(true);

    const rect = containerRef.current.getBoundingClientRect();
    const clipCenterX = rect.left + (t.x / 100) * rect.width;
    const clipCenterY = rect.top + (t.y / 100) * rect.height;
    const startAngle = Math.atan2(e.clientY - clipCenterY, e.clientX - clipCenterX) * (180 / Math.PI);

    rotateStartAngleRef.current = startAngle;
    setStartTransform({ ...t });
  };

  // 4. Motion Handle A (Start point / Person 1)
  const handlePointerDownA = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
    onBeginLive?.();
    setIsDraggingA(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    startMotionRef.current = {
      enabled: true,
      startX: motionStartX,
      startY: motionStartY,
      endX: motionEndX,
      endY: motionEndY,
      pathType: pathType,
      rotateWithMotion: !!motion?.rotateWithMotion,
    };
  };

  // 5. Motion Handle B (End point / Person 2)
  const handlePointerDownB = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
    onBeginLive?.();
    setIsDraggingB(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    startMotionRef.current = {
      enabled: true,
      startX: motionStartX,
      startY: motionStartY,
      endX: motionEndX,
      endY: motionEndY,
      pathType: pathType,
      rotateWithMotion: !!motion?.rotateWithMotion,
    };
  };

  // 6. Unified Pointer Move & Up listeners for Drag, Scale, Rotate, and Motion Handles
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging && !isScaling && !isRotating && !isDraggingA && !isDraggingB) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      if (isDragging && startTransform) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        const dxPct = (dx / rect.width) * 100;
        const dyPct = (dy / rect.height) * 100;
        onUpdateLive({
          transform: {
            ...startTransform,
            x: Math.round((startTransform.x + dxPct) * 10) / 10,
            y: Math.round((startTransform.y + dyPct) * 10) / 10,
          },
        });
      } else if (isScaling && startTransform) {
        const clipCenterX = rect.left + (startTransform.x / 100) * rect.width;
        const clipCenterY = rect.top + (startTransform.y / 100) * rect.height;
        const currentDist = Math.hypot(e.clientX - clipCenterX, e.clientY - clipCenterY);
        const ratio = currentDist / scaleInitialDistRef.current;
        const newScale = Math.max(0.05, Math.min(10, Math.round(startTransform.scaleX * ratio * 100) / 100));

        onUpdateLive({
          transform: {
            ...startTransform,
            scaleX: newScale,
            scaleY: newScale,
          },
        });
      } else if (isRotating && startTransform) {
        const clipCenterX = rect.left + (startTransform.x / 100) * rect.width;
        const clipCenterY = rect.top + (startTransform.y / 100) * rect.height;
        const currentAngle = Math.atan2(e.clientY - clipCenterY, e.clientX - clipCenterX) * (180 / Math.PI);
        const angleDelta = currentAngle - rotateStartAngleRef.current;
        let newRotation = Math.round((startTransform.rotation + angleDelta) % 360);
        if (newRotation > 180) newRotation -= 360;
        if (newRotation < -180) newRotation += 360;

        onUpdateLive({
          transform: {
            ...startTransform,
            rotation: newRotation,
          },
        });
      } else if (isDraggingA && startMotionRef.current) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        const dxPct = (dx / rect.width) * 100;
        const dyPct = (dy / rect.height) * 100;
        const newStartX = Math.max(3, Math.min(97, Math.round((startMotionRef.current.startX + dxPct) * 10) / 10));
        const newStartY = Math.max(4, Math.min(96, Math.round((startMotionRef.current.startY + dyPct) * 10) / 10));

        onUpdateLive({
          motionPath: {
            ...startMotionRef.current,
            startX: newStartX,
            startY: newStartY,
          },
        });
      } else if (isDraggingB && startMotionRef.current) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        const dxPct = (dx / rect.width) * 100;
        const dyPct = (dy / rect.height) * 100;
        const newEndX = Math.max(3, Math.min(97, Math.round((startMotionRef.current.endX + dxPct) * 10) / 10));
        const newEndY = Math.max(4, Math.min(96, Math.round((startMotionRef.current.endY + dyPct) * 10) / 10));

        onUpdateLive({
          motionPath: {
            ...startMotionRef.current,
            endX: newEndX,
            endY: newEndY,
          },
        });
      }
    };

    const handlePointerUp = () => {
      if (isDragging || isScaling || isRotating || isDraggingA || isDraggingB) {
        setIsDragging(false);
        setIsScaling(null);
        setIsRotating(false);
        setIsDraggingA(false);
        setIsDraggingB(false);
        onCommitLive();
      }
    };

    if (isDragging || isScaling || isRotating || isDraggingA || isDraggingB) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    isDragging,
    isScaling,
    isRotating,
    isDraggingA,
    isDraggingB,
    startPos,
    startTransform,
    onUpdateLive,
    onCommitLive,
  ]);

  // 7. Native Two-Finger Touch Pinch-To-Zoom & Two-Finger Rotate
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    let pinchData: {
      startDist: number;
      startAngle: number;
      startMid: { x: number; y: number };
      startT: typeof t;
    } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        onBeginLive?.();
        setIsPinching(true);

        const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        pinchData = {
          startDist: Math.max(10, dist),
          startAngle: angle,
          startMid: mid,
          startT: { ...tRef.current },
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchData) {
        e.preventDefault();
        e.stopPropagation();

        const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        const distRatio = dist / pinchData.startDist;
        const newScale = Math.max(0.05, Math.min(10, Math.round(pinchData.startT.scaleX * distRatio * 100) / 100));

        const angleDelta = angle - pinchData.startAngle;
        let newRotation = Math.round((pinchData.startT.rotation + angleDelta) % 360);
        if (newRotation > 180) newRotation -= 360;
        if (newRotation < -180) newRotation += 360;

        const rect = containerRef.current?.getBoundingClientRect();
        let newX = pinchData.startT.x;
        let newY = pinchData.startT.y;
        if (rect) {
          const dxPct = ((mid.x - pinchData.startMid.x) / rect.width) * 100;
          const dyPct = ((mid.y - pinchData.startMid.y) / rect.height) * 100;
          newX = Math.round((pinchData.startT.x + dxPct) * 10) / 10;
          newY = Math.round((pinchData.startT.y + dyPct) * 10) / 10;
        }

        onUpdateLive({
          transform: {
            ...pinchData.startT,
            scaleX: newScale,
            scaleY: newScale,
            rotation: newRotation,
            x: newX,
            y: newY,
          },
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (pinchData && e.touches.length < 2) {
        pinchData = null;
        setIsPinching(false);
        onCommitLive();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onBeginLive, onUpdateLive, onCommitLive]);

  // Quick action helpers
  const handleResetTransform = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBeginLive?.();
    onUpdateLive({
      transform: {
        ...t,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        x: 50,
        y: 50,
      },
    });
    onCommitLive();
  };

  const handleCenterTransform = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBeginLive?.();
    onUpdateLive({
      transform: {
        ...t,
        x: 50,
        y: 50,
      },
    });
    onCommitLive();
  };

  // Toggle Fit / Fill cover width
  const handleToggleFitFill = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBeginLive?.();
    const isCurrentlyCovering = t.scaleX > 1.08;
    if (isCurrentlyCovering) {
      onUpdateLive({
        transform: {
          ...t,
          scaleX: 1,
          scaleY: 1,
          x: 50,
          y: 50,
        },
      });
    } else {
      const coverRatio = Math.max(project.width / Math.max(1, baseW), project.height / Math.max(1, baseH));
      const fillScale = Math.max(1.15, Math.round(coverRatio * 100) / 100);
      onUpdateLive({
        transform: {
          ...t,
          scaleX: fillScale,
          scaleY: fillScale,
          x: 50,
          y: 50,
        },
      });
    }
    onCommitLive();
  };

  // Toggle Motion Arrow / Animation On / Off
  const handleToggleMotionArrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBeginLive?.();
    if (hasMotion) {
      onUpdateLive({
        motionPath: {
          ...motion,
          enabled: !motion.enabled,
        },
      });
    } else {
      onUpdateLive({
        motionPath: {
          enabled: true,
          startX: Math.max(10, t.x - 20),
          startY: t.y,
          endX: Math.min(90, t.x + 20),
          endY: t.y,
          pathType: "line",
          rotateWithMotion: false,
        },
      });
    }
    onCommitLive();
  };

  const handleChangePathType = (type: "line" | "arc" | "zigzag") => {
    onBeginLive?.();
    onUpdateLive({
      motionPath: {
        enabled: true,
        startX: motionStartX,
        startY: motionStartY,
        endX: motionEndX,
        endY: motionEndY,
        pathType: type,
        rotateWithMotion: motion?.rotateWithMotion,
      },
    });
    onCommitLive();
  };

  const isTransforming = isDragging || isScaling !== null || isRotating || isPinching || isDraggingA || isDraggingB;

  // Calculate arrival angle for the arrow marker
  let arrivalAngle = 0;
  if (pathType === "arc") {
    const mx = (motionStartX + motionEndX) / 2;
    const my = (motionStartY + motionEndY) / 2 - 36;
    arrivalAngle = Math.atan2(motionEndY - my, motionEndX - mx) * (180 / Math.PI);
  } else {
    arrivalAngle = Math.atan2(motionEndY - motionStartY, motionEndX - motionStartX) * (180 / Math.PI);
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-visible select-none" ref={containerRef}>
      {/* SVG Motion Arrow Path connecting Point A to Point B */}
      {hasMotion && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="motionGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.8" />
            </filter>
          </defs>

          {pathType === "line" && (
            <line
              x1={motionStartX}
              y1={motionStartY}
              x2={motionEndX}
              y2={motionEndY}
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              vectorEffect="non-scaling-stroke"
              filter="url(#motionGlow)"
            />
          )}

          {pathType === "arc" && (() => {
            const mx = (motionStartX + motionEndX) / 2;
            const my = (motionStartY + motionEndY) / 2 - 36;
            return (
              <path
                d={`M ${motionStartX} ${motionStartY} Q ${mx} ${my} ${motionEndX} ${motionEndY}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
                filter="url(#motionGlow)"
              />
            );
          })()}

          {pathType === "zigzag" && (() => {
            const dx = motionEndX - motionStartX;
            const dy = motionEndY - motionStartY;
            const len = Math.hypot(dx, dy) || 1;
            const normX = -dy / len;
            const normY = dx / len;
            let d = `M ${motionStartX} ${motionStartY}`;
            const steps = 6;
            for (let i = 1; i < steps; i++) {
              const p = i / steps;
              const wave = (i % 2 === 1 ? 1 : -1) * 5;
              const px = motionStartX + dx * p + normX * wave;
              const py = motionStartY + dy * p + normY * wave;
              d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
            }
            d += ` L ${motionEndX} ${motionEndY}`;
            return (
              <path
                d={d}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
                filter="url(#motionGlow)"
              />
            );
          })()}
        </svg>
      )}

      {/* Motion Arrowhead pointing at Point B */}
      {hasMotion && (
        <div
          className="absolute pointer-events-none z-30"
          style={{
            left: `${motionEndX}%`,
            top: `${motionEndY}%`,
            transform: `translate(-50%, -50%) rotate(${arrivalAngle}deg)`,
          }}
        >
          <div
            className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[14px] border-l-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            style={{ marginLeft: "-22px" }}
          />
        </div>
      )}

      {/* Motion Handle A (Start - Person 1) with edge-safe anchored label */}
      {hasMotion && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none group"
          style={{ left: `${motionStartX}%`, top: `${motionStartY}%` }}
          onPointerDown={handlePointerDownA}
          title="Drag Point A (Start Position / Person 1)"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_16px_rgba(16,185,129,0.9)] flex items-center justify-center font-black text-xs text-white group-hover:scale-125 transition-transform">
            A
          </div>
          <div
            className={`absolute -top-6 ${
              motionStartX < 25 ? "left-0" : motionStartX > 75 ? "right-0" : "left-1/2 -translate-x-1/2"
            } bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md pointer-events-none whitespace-nowrap`}
          >
            Start
          </div>
        </div>
      )}

      {/* Motion Handle B (End - Person 2) with edge-safe anchored label */}
      {hasMotion && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none group"
          style={{ left: `${motionEndX}%`, top: `${motionEndY}%` }}
          onPointerDown={handlePointerDownB}
          title="Drag Point B (Target Position / Person 2)"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_16px_rgba(244,63,94,0.9)] flex items-center justify-center font-black text-xs text-white group-hover:scale-125 transition-transform">
            B
          </div>
          <div
            className={`absolute -top-6 ${
              motionEndX < 25 ? "left-0" : motionEndX > 75 ? "right-0" : "left-1/2 -translate-x-1/2"
            } bg-rose-950/90 border border-rose-500/70 text-rose-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md pointer-events-none whitespace-nowrap`}
          >
            End
          </div>
        </div>
      )}

      {/* Bounding Box wrapper positioned at center */}
      <div
        ref={boxRef}
        className="absolute pointer-events-auto touch-none"
        style={{
          left: `${t.x}%`,
          top: `${t.y}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          transform: `translate(-50%, -50%) rotate(${t.rotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        {/* The Box itself */}
        <div
          className={`w-full h-full border-2 border-dashed ${
            isTransforming
              ? "border-[#ff6b4a] bg-[#ff6b4a]/10 shadow-[0_0_20px_rgba(255,107,74,0.4)]"
              : "border-[#ff6b4a] bg-[#ff6b4a]/5 shadow-[0_0_12px_rgba(255,107,74,0.25)]"
          } cursor-move relative touch-none transition-colors`}
          onPointerDown={handlePointerDownMove}
          title="Drag to Move, Pinch with 2 fingers to scale & rotate"
        >
          {/* Top Rotation Stalk & Handle */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full border-2 border-[#ff6b4a] shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center touch-none z-40 transition-transform hover:scale-125 active:scale-95"
            title="Drag to Rotate"
            onPointerDown={handlePointerDownRotate}
          >
            <RotateCw className="w-3.5 h-3.5 text-[#ff6b4a] pointer-events-none" />
          </div>

          {/* Stalk connecting top border to rotation handle */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-0.5 h-7 bg-[#ff6b4a] pointer-events-none" />

          {/* 4 Corner Scale Handles */}
          <div
            onPointerDown={(e) => handlePointerDownScale(e, "tl")}
            title="Drag to Resize"
            className="absolute -top-3 -left-3 w-6 h-6 bg-white border-2 border-[#ff6b4a] cursor-nwse-resize rounded-full shadow-lg touch-none z-40 transition-transform hover:scale-125"
          />
          <div
            onPointerDown={(e) => handlePointerDownScale(e, "tr")}
            title="Drag to Resize"
            className="absolute -top-3 -right-3 w-6 h-6 bg-white border-2 border-[#ff6b4a] cursor-nesw-resize rounded-full shadow-lg touch-none z-40 transition-transform hover:scale-125"
          />
          <div
            onPointerDown={(e) => handlePointerDownScale(e, "bl")}
            title="Drag to Resize"
            className="absolute -bottom-3 -left-3 w-6 h-6 bg-white border-2 border-[#ff6b4a] cursor-nesw-resize rounded-full shadow-lg touch-none z-40 transition-transform hover:scale-125"
          />
          <div
            onPointerDown={(e) => handlePointerDownScale(e, "br")}
            title="Drag to Resize"
            className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-[#ff6b4a] cursor-nwse-resize rounded-full shadow-lg touch-none z-40 transition-transform hover:scale-125"
          />

          {/* Center Crosshair Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-2.5 h-2.5 rounded-full border border-[#ff6b4a]" />
          </div>
        </div>
      </div>

      {/* Live Transformation Metric Badge */}
      {isTransforming && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#0c0c12]/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#ff6b4a]/70 text-[10px] font-mono font-bold text-white shadow-2xl whitespace-nowrap z-50 pointer-events-none">
          {isRotating && `Rotate: ${t.rotation}°`}
          {isScaling && `Scale: ${Math.round(t.scaleX * 100)}%`}
          {isDragging && `Pos: (${Math.round(t.x)}%, ${Math.round(t.y)}%)`}
          {isPinching && `Scale: ${Math.round(t.scaleX * 100)}% | Rot: ${t.rotation}°`}
          {isDraggingA && `Start A: (${Math.round(motionStartX)}%, ${Math.round(motionStartY)}%)`}
          {isDraggingB && `Target B: (${Math.round(motionEndX)}%, ${Math.round(motionEndY)}%)`}
        </div>
      )}

      {/* Quick Actions Floating Pill Toolbar - Fully Responsive, Non-wrapping, Collapsible & Fades on Drag */}
      {isMinimized ? (
        <div className={`absolute ${toolbarPosition === "top" ? "top-2" : "bottom-2"} right-2 z-50 pointer-events-auto transition-all`}>
          <button
            onClick={() => setIsMinimized(false)}
            title="Expand Animation Toolbar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12121a]/95 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[11px] font-bold shadow-2xl hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Animation</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div 
          className={`absolute ${toolbarPosition === "top" ? "top-2" : "bottom-2"} left-1/2 -translate-x-1/2 max-w-[calc(100%-16px)] z-50 pointer-events-auto transition-all duration-150 ${
            isTransforming ? "opacity-15 hover:opacity-100 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex items-center flex-nowrap gap-1 bg-[#12121a]/95 backdrop-blur-md px-2 py-1 rounded-xl border border-[#2b2b36] shadow-2xl overflow-x-auto scrollbar-none whitespace-nowrap">
            {/* Minimize Toggle */}
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize Toolbar (Clear Screen for animating)"
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {toolbarPosition === "top" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Position Flip Button (Top ↔ Bottom) */}
            <button
              onClick={() => setToolbarPosition((prev) => (prev === "top" ? "bottom" : "top"))}
              title={toolbarPosition === "top" ? "Move Toolbar to Bottom" : "Move Toolbar to Top"}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-gray-700 mx-0.5 shrink-0" />

            {/* Toggle Animation / Motion Arrow */}
            <button
              onClick={handleToggleMotionArrow}
              title="Toggle PowerPoint-style Motion Arrow Animation (Person 1 ➔ Person 2)"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                hasMotion
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/60 shadow-sm"
                  : "text-gray-200 hover:text-white hover:bg-white/10"
              }`}
            >
              <Zap className={`w-3 h-3 ${hasMotion ? "text-amber-400 fill-current" : "text-gray-400"}`} />
              <span>Animation</span>
            </button>

            {/* Path Type Selectors (when Animation is enabled) */}
            {hasMotion && (
              <>
                <div className="w-px h-3.5 bg-gray-700 mx-0.5 shrink-0" />
                <div className="flex items-center bg-black/50 rounded-lg p-0.5 border border-[#2b2b36] shrink-0">
                  <button
                    onClick={() => handleChangePathType("line")}
                    title="Straight Line motion"
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      pathType === "line"
                        ? "bg-amber-500 text-black font-extrabold shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => handleChangePathType("arc")}
                    title="Curved Arc (parabolic throw) motion"
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      pathType === "arc"
                        ? "bg-amber-500 text-black font-extrabold shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Arc ↷
                  </button>
                  <button
                    onClick={() => handleChangePathType("zigzag")}
                    title="Zigzag lightning motion"
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      pathType === "zigzag"
                        ? "bg-amber-500 text-black font-extrabold shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Zigzag ⚡
                  </button>
                </div>
                {onPreview && (
                  <button
                    onClick={() => onPreview(clip.timelineStart, clip.duration)}
                    title="Test Play Motion Animation"
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Play</span>
                  </button>
                )}
              </>
            )}

            <div className="w-px h-3.5 bg-gray-700 mx-0.5 shrink-0" />
            <button
              onClick={handleToggleFitFill}
              title="Fill Screen / Fit Screen (Cover canvas width/height)"
              className="px-1.5 py-1 rounded-lg text-[10px] font-semibold text-gray-200 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Maximize2 className="w-3 h-3 text-cyan-400" />
              <span>{t.scaleX > 1.05 ? "Fit" : "Fill"}</span>
            </button>
            <button
              onClick={handleCenterTransform}
              title="Center on Screen"
              className="px-1.5 py-1 rounded-lg text-[10px] font-semibold text-gray-200 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Move className="w-3 h-3 text-[#ff6b4a]" />
              <span>Center</span>
            </button>
            <button
              onClick={handleResetTransform}
              title="Reset Scale & Rotation to 100%"
              className="px-1.5 py-1 rounded-lg text-[10px] font-semibold text-gray-200 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Undo2 className="w-3 h-3 text-yellow-400" />
              <span>Reset</span>
            </button>
            <div className="w-px h-3.5 bg-gray-700 mx-0.5 shrink-0" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDone) onDone();
                else if (onDeselect) onDeselect();
              }}
              title="Done Transforming"
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#ff6b4a] hover:bg-[#ff856b] text-white flex items-center gap-1 transition-colors shadow-md cursor-pointer shrink-0"
            >
              <Check className="w-3 h-3" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
