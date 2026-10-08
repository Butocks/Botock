import { Metadata } from "next";
import Link from "next/link";
import { Music, Volume2, Mic, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Audio Editing & Conversion | Botock",
  description: "Trim, compress, and convert audio files directly in your browser.",
};

export default function AudioToolsFeaturePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pt-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
          Advanced <span className="text-amber-600 dark:text-amber-500">Audio Tools</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Perfect your sound. Trim long recordings, convert between MP3 and WAV, and compress audio files without losing quality.
        </p>
        <Link href="/tools?cat=audio" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-amber-600/20 transition-all active:scale-95">
          <Music className="w-5 h-5" /> Open Audio Tools
        </Link>
      </div>

      {/* How to Use */}
      <div className="bg-white dark:bg-[#111114] border-y border-slate-200 dark:border-white/[0.05] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How to Use Audio Tools</h2>
            <p className="text-slate-500 mt-4">Edit your tracks seamlessly.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload Audio", desc: "Drag and drop your MP3, WAV, or OGG file into the tool." },
              { step: "02", title: "Adjust Settings", desc: "Select the start and end times to trim, or choose your target format and bitrate." },
              { step: "03", title: "Process Locally", desc: "Click process and your browser will handle the encoding securely." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-[#1a1a1f] border border-slate-100 dark:border-white/[0.05]">
                <div className="text-4xl font-black text-amber-500/20 mb-4">{item.step}</div>
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
          <div className="relative">
            <div className="aspect-square md:aspect-video rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent"></div>
               <Volume2 className="w-24 h-24 text-amber-500/50" />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Botock Audio Tools?</h2>
            
            {[
              "High-fidelity encoding and decoding",
              "Precise millisecond trimming",
              "Convert voicenotes to standard MP3s",
              "Compress heavy podcasts for web streaming",
              "Works offline once loaded"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</p>
              </div>
            ))}
            
            <div className="pt-6">
              <Link href="/tools?cat=audio" className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold hover:gap-4 transition-all">
                Try Audio Tools <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
