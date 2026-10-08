import { Metadata } from "next";
import Link from "next/link";
import { Play, Scissors, Layers, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Professional Web Video Editor | Botock",
  description: "Edit videos directly in your browser with hardware acceleration. Add chroma key, animations, and text easily.",
};

export default function VideoEditorFeaturePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pt-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
          The Ultimate <span className="text-violet-600 dark:text-violet-500">Video Editor</span> in Your Browser
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          No downloads, no installations. Edit 4K videos, remove green screens, and add dynamic animations completely free and securely on your own device.
        </p>
        <Link href="/tools/video-editor" className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-violet-600/20 transition-all active:scale-95">
          <Play className="w-5 h-5" /> Start Editing Now
        </Link>
      </div>

      {/* How to Use */}
      <div className="bg-white dark:bg-[#111114] border-y border-slate-200 dark:border-white/[0.05] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How to Use the Video Editor</h2>
            <p className="text-slate-500 mt-4">Three simple steps to professional videos.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload Media", desc: "Drag and drop your video files, images, or audio directly into the media bin. Everything stays on your device." },
              { step: "02", title: "Edit & Animate", desc: "Add clips to the timeline. Use the inspector to crop, apply Chroma Key, or add Ken Burns zoom animations." },
              { step: "03", title: "Export Instantly", desc: "Click export and our WASM engine will render your final MP4 file at lightning speed." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-[#1a1a1f] border border-slate-100 dark:border-white/[0.05]">
                <div className="text-4xl font-black text-violet-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Choose Botock Video Editor?</h2>
            
            {[
              "100% Privacy - Processing happens on your device",
              "Advanced Chroma Key (Green Screen) Removal",
              "Hardware-accelerated live preview",
              "Dynamic Pan & Zoom Animations",
              "Export without watermarks"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</p>
              </div>
            ))}
            
            <div className="pt-6">
              <Link href="/tools/video-editor" className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold hover:gap-4 transition-all">
                Try it yourself <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-video rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-transparent"></div>
               <Layers className="w-24 h-24 text-violet-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
