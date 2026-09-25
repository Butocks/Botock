"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  ssr: false,
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-16 flex flex-col items-center justify-center min-h-[360px]">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading PDF to JPG Rendering Engine...
      </p>
    </div>
  ),
});

export default function ClientWrapper() {
  return <Client />;
}
