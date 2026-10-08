import { Metadata } from "next";
import Link from "next/link";
import { Image as ImageIcon, Crop, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Image Editing & Enhancement | Botock",
  description: "Remove backgrounds, crop, resize, and convert images online for free.",
};

export default function ImageToolsFeaturePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pt-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
          Powerful <span className="text-sky-600 dark:text-sky-500">Image Tools</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Everything you need to perfect your photos. From AI background removal to simple cropping and format conversion.
        </p>
        <Link href="/tools?cat=image" className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-sky-600/20 transition-all active:scale-95">
          <ImageIcon className="w-5 h-5" /> Start Editing Images
        </Link>
      </div>

      {/* How to Use */}
      <div className="bg-white dark:bg-[#111114] border-y border-slate-200 dark:border-white/[0.05] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How to Use Image Tools</h2>
            <p className="text-slate-500 mt-4">Professional results in seconds.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Pick a Tool", desc: "Select Background Remover, Image Cropper, or Format Converter from the dashboard." },
              { step: "02", title: "Upload Photo", desc: "Drop your image into the workspace. We support JPG, PNG, WebP, and more." },
              { step: "03", title: "Edit & Download", desc: "Adjust your crop borders or let AI remove the background, then download the high-res result." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-[#1a1a1f] border border-slate-100 dark:border-white/[0.05]">
                <div className="text-4xl font-black text-sky-500/20 mb-4">{item.step}</div>
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
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Use Botock Image Tools?</h2>
            
            {[
              "AI-Powered Background Removal",
              "Batch processing capabilities",
              "Preserves original image quality and metadata",
              "Modern WebP and AVIF conversion support",
              "Completely free with no watermarks"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</p>
              </div>
            ))}
            
            <div className="pt-6">
              <Link href="/tools?cat=image" className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold hover:gap-4 transition-all">
                Explore Image Tools <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square md:aspect-video rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-tl from-sky-500/20 to-transparent"></div>
               <Crop className="w-24 h-24 text-sky-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
