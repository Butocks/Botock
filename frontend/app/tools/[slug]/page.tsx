import Link from "next/link";
import { Wrench, ArrowLeft, Clock } from "lucide-react";

export default async function ToolUnderConstructionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Format the slug to look a bit nicer for the UI (e.g. "pdf-split" -> "Pdf Split")
  const formattedName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-violet-500/20 dark:bg-violet-500/10 rounded-full animate-ping" />
        <div className="relative w-full h-full bg-white dark:bg-[#1a1a22] border border-slate-200 dark:border-white/[0.1] shadow-xl rounded-full flex items-center justify-center">
          <Wrench className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
        {formattedName} Tool
      </h1>
      
      <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-500 mb-6 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-full font-bold text-sm">
        <Clock className="w-4 h-4" />
        <span>Currently in Development (Phase 2-4)</span>
      </div>

      <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed">
        We are actively building our 100+ suite of creative tools. The{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {formattedName}
        </span>{" "}
        tool is scheduled for release soon. In the meantime, you can try our completed tools like the 
        <Link href="/tools/pdf-merge" className="text-violet-600 dark:text-violet-400 hover:underline mx-1">
          PDF Merger
        </Link>
        or the generative studios.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/tools"
          className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-900 dark:text-white font-bold transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-600/30 transition-all active:scale-95"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
