"use client";

import dynamic from "next/dynamic";

const TranslatePdfClient = dynamic(() => import("./Client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-64px)] bg-[#080b0f] flex flex-col items-center justify-center text-slate-400 gap-4">
      <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium tracking-wide">Loading PDF Translator...</p>
    </div>
  ),
});

export default function ClientWrapper() {
  return <TranslatePdfClient />;
}
