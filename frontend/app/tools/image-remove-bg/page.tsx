import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading AI Engine...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Remove Background from Image (Batch) - Botock",
  description:
    "Remove backgrounds from multiple images instantly using advanced AI. 100% free and fast.",
};

export default function ImageRemoveBGPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 relative">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>AI Powered & Batch Supported</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          AI Background Remover
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium">
          Upload one or multiple images and our AI will magically remove the backgrounds in seconds. Perfect for products, portraits, and graphics.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1a22] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-4 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none relative z-10">
        <Client />
      </div>
    </main>
  );
}
