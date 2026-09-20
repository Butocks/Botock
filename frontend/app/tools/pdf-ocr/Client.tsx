"use client";

import dynamic from "next/dynamic";

const PDFOCRView = dynamic(() => import("./PDFOCRView"), {
  ssr: false,
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading PDF OCR Engine...
      </p>
    </div>
  ),
});

export default function Client() {
  return <PDFOCRView />;
}
