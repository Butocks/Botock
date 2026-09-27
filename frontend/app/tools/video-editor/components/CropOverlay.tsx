"use client";

import { useEffect, useRef } from "react";
import { CropRect } from "@/lib/editor/types";

type HandleId = "move" | "nw" | "ne" | "sw" | "se";

interface CropOverlayProps {
  rect: CropRect;
  onChange: (rect: CropRect) => void;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function CropOverlay({ rect, onChange }: CropOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ handle: HandleId; startX: number; startY: number; startRect: CropRect } | null>(null);

  const startDrag = (e: React.PointerEvent, handle: HandleId) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startRect: { ...rect } };
  };


  useEffect(() => {
    const move = (e: PointerEvent) => {
      const drag = dragRef.current;
      const container = containerRef.current;
      if (!drag || !container) return;

      const bounds = container.getBoundingClientRect();
      const dx = (e.clientX - drag.startX) / bounds.width;
      const dy = (e.clientY - drag.startY) / bounds.height;
      const { startRect } = drag;
      const next: CropRect = { ...startRect };

      if (drag.handle === "move") {
        next.x = clamp01(startRect.x + dx);
        next.y = clamp01(startRect.y + dy);
        next.x = Math.min(next.x, 1 - startRect.width);
        next.y = Math.min(next.y, 1 - startRect.height);
      } else {
        if (drag.handle.includes("w")) {
          const newX = clamp01(startRect.x + dx);
          next.width = startRect.width + (startRect.x - newX);
          next.x = newX;
        }
        if (drag.handle.includes("e")) {
          next.width = clamp01(startRect.x + startRect.width + dx) - startRect.x;
        }
        if (drag.handle.includes("n")) {
          const newY = clamp01(startRect.y + dy);
          next.height = startRect.height + (startRect.y - newY);
          next.y = newY;
        }
        if (drag.handle.includes("s")) {
          next.height = clamp01(startRect.y + startRect.height + dy) - startRect.y;
        }
        next.width = Math.max(0.1, next.width);
        next.height = Math.max(0.1, next.height);
      }

      onChange(next);
    };

    const up = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onChange]);

  const handles: { id: HandleId; className: string }[] = [
    { id: "nw", className: "-top-1.5 -left-1.5 cursor-nwse-resize" },
    { id: "ne", className: "-top-1.5 -right-1.5 cursor-nesw-resize" },
    { id: "sw", className: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
    { id: "se", className: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Draggable Crop Rectangle */}
      <div
        onPointerDown={(e) => startDrag(e, "move")}
        className="absolute border-2 border-emerald-400 bg-transparent pointer-events-auto cursor-move select-none"
        style={{
          left: `${rect.x * 100}%`,
          top: `${rect.y * 100}%`,
          width: `${rect.width * 100}%`,
          height: `${rect.height * 100}%`,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
        }}
      >
        {/* Rule of thirds grid lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-white/50" />
          <div className="border-r border-white/50" />
          <div />
        </div>

        {handles.map((h) => (
          <div
            key={h.id}
            onPointerDown={(e) => startDrag(e, h.id)}
            className={`absolute w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow pointer-events-auto ${h.className}`}
          />
        ))}
      </div>
    </div>
  );
}
