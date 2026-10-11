"use client";

import { Plus, Upload, Music, Image as ImageIcon, Video, X } from "lucide-react";
import React, { useRef } from "react";
import { MediaBinItem } from "@/lib/editor/types";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MediaBinProps {
  items: MediaBinItem[];
  onUpload: (file: File) => void;
  onAddToTimeline: (item: MediaBinItem) => void;
  onRemoveItem?: (id: string) => void;
}

export default React.memo(function MediaBin({ items, onUpload, onAddToTimeline, onRemoveItem }: MediaBinProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#111118]">
      {/* Action Button: Import Media */}
      <div className="p-2.5 border-b border-[#2b2b36] shrink-0">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#ff6b4a] hover:bg-[#ff856b] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import Media</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*,audio/*,image/*,.gif"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              Array.from(files).forEach((file) => onUpload(file));
            }
            e.target.value = "";
          }}
        />
      </div>

      {/* Media Items */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {items.length === 0 ? (
          /* Empty State */
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center h-full min-h-[140px] border border-dashed border-[#2b2b36] hover:border-[#ff6b4a]/60 rounded-xl cursor-pointer bg-white/[0.01] hover:bg-[#ff6b4a]/5 transition-all p-4 text-center group"
          >
            <div className="w-9 h-9 rounded-full bg-[#1c1c24] group-hover:bg-[#ff6b4a]/20 flex items-center justify-center mb-2.5 transition-colors">
              <Upload className="w-4 h-4 text-gray-500 group-hover:text-[#ff6b4a] transition-colors" />
            </div>
            <p className="text-xs font-semibold text-gray-300">
              No media yet
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Click to browse video, audio, or images
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onAddToTimeline={onAddToTimeline}
                onRemoveItem={onRemoveItem}
              />
            ))}
            {/* Add More button */}
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-video flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2b2b36] hover:border-[#ff6b4a]/50 hover:bg-[#ff6b4a]/5 transition-colors cursor-pointer gap-1"
            >
              <Plus className="w-4 h-4 text-gray-500" />
              <span className="text-[9px] text-gray-500 font-medium">Add more</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

function MediaCard({
  item,
  onAddToTimeline,
  onRemoveItem,
}: {
  item: MediaBinItem;
  onAddToTimeline: (item: MediaBinItem) => void;
  onRemoveItem?: (id: string) => void;
}) {
  const isAudio = item.file.type.startsWith("audio/");
  const isImage = item.file.type.startsWith("image/");

  return (
    <div
      onClick={() => onAddToTimeline(item)}
      className="group relative rounded-xl overflow-hidden border border-[#2b2b36] bg-[#0d0d12] aspect-video flex items-center justify-center hover:border-[#ff6b4a] hover:shadow-lg hover:shadow-[#ff6b4a]/10 transition-all cursor-pointer text-left"
      title={`Add "${item.name}" to timeline`}
    >
      {isAudio ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950/40 to-blue-900/10 p-2">
          <Music className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-[9px] text-blue-300 font-mono">{fmt(item.duration)}</span>
        </div>
      ) : isImage ? (
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-60 transition-opacity"
          draggable={false}
        />
      ) : (
        <video
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          src={item.url}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-50 transition-opacity"
          muted
          playsInline
        />
      )}

      {/* Delete / Remove button */}
      {onRemoveItem && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveItem(item.id);
          }}
          title="Remove from Media Bin"
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-black/80 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-all z-20 shadow-md"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Hover overlay with + */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
        <div className="w-7 h-7 rounded-full bg-[#ff6b4a] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
          <Plus className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Name + duration badge */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-1.5 py-1 pointer-events-none">
        <p className="text-[9px] font-semibold text-white truncate">{item.name}</p>
        {!isAudio && (
          <p className="text-[8px] text-gray-400 font-mono">{fmt(item.duration)}</p>
        )}
      </div>
    </div>
  );
}
