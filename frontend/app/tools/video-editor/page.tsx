"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled to protect Core Web Vitals & prevent heavy canvas on initial chunk
const VideoEditorComponent = dynamic(
  () => import("./VideoEditorComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-muted-foreground">Initializing Botock Video Studio...</p>
      </div>
    ),
  }
);

export default function VideoEditorPage() {
  return <VideoEditorComponent />;
}
