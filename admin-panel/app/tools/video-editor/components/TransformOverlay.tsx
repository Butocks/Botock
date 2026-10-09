import React, { useState, useEffect, useRef } from "react";
import { TimelineClip, EditorProject, MediaBinItem } from "@/lib/editor/types";

interface Props {
  clip: TimelineClip;
  project: EditorProject;
  mediaItem?: MediaBinItem;
  onUpdateLive: (patch: Partial<TimelineClip>) => void;
  onCommitLive: () => void;
}

export default function TransformOverlay({ clip, project, mediaItem, onUpdateLive, onCommitLive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startTransform, setStartTransform] = useState(clip.transform);

  const t = clip.transform || { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };

  // Calculate base dimensions
  const intrinsicW = mediaItem?.width || 1280;
  const intrinsicH = mediaItem?.height || 720;
  const scaleFit = Math.min(project.width / intrinsicW, project.height / intrinsicH);
  const baseW = intrinsicW * scaleFit;
  const baseH = intrinsicH * scaleFit;

  const finalW = baseW * (t.width / 100) * t.scaleX;
  const finalH = baseH * (t.height / 100) * t.scaleY;

  const widthPct = (finalW / project.width) * 100;
  const heightPct = (finalH / project.height) * 100;

  // Handle Drag (Move)
  const handlePointerDownMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartTransform({ ...t });
  };

  // Handle Scale
  const handlePointerDownScale = (e: React.PointerEvent, corner: string) => {
    e.stopPropagation();
    setIsScaling(corner);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartTransform({ ...t });
  };

  // Handle Rotate
  const handlePointerDownRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartTransform({ ...t });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging && !isScaling && !isRotating) return;
      if (!containerRef.current || !startTransform) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      if (isDragging) {
        const dxPct = (dx / rect.width) * 100;
        const dyPct = (dy / rect.height) * 100;
        onUpdateLive({
          transform: {
            ...startTransform,
            x: startTransform.x + dxPct,
            y: startTransform.y + dyPct,
          },
        });
      } else if (isScaling) {
        // Uniform scaling via scaleX/scaleY based on drag distance
        // A simple approach: drag right/down = increase scale
        // Depending on corner, the direction flips, but let's just use diagonal distance
        const distance = (isScaling === 'tl' || isScaling === 'bl') ? -dx : dx;
        const scaleDelta = distance / (rect.width / 2);
        const newScale = Math.max(0.1, startTransform.scaleX + scaleDelta);
        
        onUpdateLive({
          transform: {
            ...startTransform,
            scaleX: newScale,
            scaleY: newScale,
          },
        });
      } else if (isRotating) {
        // Simple rotation calculation based on X movement
        // Alternatively, calculate angle from center. Let's do simple X-drag for rotation
        const angleDelta = (dx / rect.width) * 360;
        onUpdateLive({
          transform: {
            ...startTransform,
            rotation: startTransform.rotation + angleDelta,
          },
        });
      }
    };

    const handlePointerUp = () => {
      if (isDragging || isScaling || isRotating) {
        setIsDragging(false);
        setIsScaling(null);
        setIsRotating(false);
        onCommitLive();
      }
    };

    if (isDragging || isScaling || isRotating) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, isScaling, isRotating, startPos, startTransform, onUpdateLive, onCommitLive]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" ref={containerRef}>
      {/* Bounding Box wrapper positioned at center */}
      <div
        className="absolute pointer-events-auto group"
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
           className="w-full h-full border-2 border-emerald-400 border-dashed bg-emerald-400/10 cursor-move relative transition-opacity opacity-0 hover:opacity-100"
           style={{ opacity: (isDragging || isScaling || isRotating) ? 1 : undefined }}
           onPointerDown={handlePointerDownMove}
        >
           {/* Center Pivot / Rotate Handle */}
           <div 
             className="absolute -top-10 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border border-gray-300 shadow-lg cursor-grab flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
             onPointerDown={handlePointerDownRotate}
           >
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
           </div>
           
           {/* Connecting Line for Rotate Handle */}
           <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-emerald-400 opacity-0 group-hover:opacity-100" />

           {/* Corners */}
           <div onPointerDown={(e) => handlePointerDownScale(e, 'tl')} className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-500 cursor-nwse-resize rounded-full opacity-0 group-hover:opacity-100" />
           <div onPointerDown={(e) => handlePointerDownScale(e, 'tr')} className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-500 cursor-nesw-resize rounded-full opacity-0 group-hover:opacity-100" />
           <div onPointerDown={(e) => handlePointerDownScale(e, 'bl')} className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-500 cursor-nesw-resize rounded-full opacity-0 group-hover:opacity-100" />
           <div onPointerDown={(e) => handlePointerDownScale(e, 'br')} className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-500 cursor-nwse-resize rounded-full opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
