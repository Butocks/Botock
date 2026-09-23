"use client";

import { useEffect, useRef } from "react";

export default function SceneBuilderPage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    let cleanup = false;

    async function start() {
      if (cleanup) return;

      await import("./app.js");
    }

    start();

    return () => {
      cleanup = true;

      const studio =
        (window as any).BotockSceneStudio;

      if (studio?.engine) {
        studio.engine.dispose();
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#04060b]">
      <div id="botock-scene-builder" />
    </main>
  );
}