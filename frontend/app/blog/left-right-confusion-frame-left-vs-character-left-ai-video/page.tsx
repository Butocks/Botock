import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sparkles,
  Video,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  PlayCircle,
  Layers,
  Film,
  Camera,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Left/Right Confusion in AI Video: Frame-Left vs Character Left | Botock",
  description: "Stop AI video models from flipping directions. Learn the absolute difference between frame-left and character-left to lock character positions.",
  alternates: {
    canonical: "/blog/left-right-confusion-frame-left-vs-character-left-ai-video",
  },
  openGraph: {
    title: "Left/Right Confusion in AI Video: Frame-Left vs. Character's Left Solved",
    description: "Stop AI video models from flipping directions. Learn the absolute difference between frame-left and character-left to lock character positions.",
    url: "https://botock.app/blog/left-right-confusion-frame-left-vs-character-left-ai-video",
    type: "article",
    publishedTime: "2026-10-20T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Left/Right Confusion in AI Video: Frame-Left vs Character Left",
    description: "Stop AI video models from flipping directions. Learn the absolute difference between frame-left and character-left to lock character positions.",
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
};

export default function BlogTargetPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "Left/Right Confusion in AI Video: Frame-Left vs. Character's Left Solved",
        description: "Stop AI video models from flipping directions. Learn the absolute difference between frame-left and character-left to lock character positions.",
        image: "https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg",
        datePublished: "2026-10-20T00:00:00Z",
        dateModified: "2026-10-20T00:00:00Z",
        author: {
          "@type": "Organization",
          name: "Botock AI Filmmaking Lab",
        },
        publisher: {
          "@type": "Organization",
          name: "Botock",
          logo: {
            "@type": "ImageObject",
            url: "https://botock.app/logo.png",
          },
        },
        mainEntityOfPage: "https://botock.app/blog/left-right-confusion-frame-left-vs-character-left-ai-video",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <div className="w-full bg-white dark:bg-[#111114] border-b border-slate-200 dark:border-white/10 px-6 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Blog Catalog
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href="/blog/ai-video-prompt-engineering-master-handbook"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Master Handbook
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-4">
            <Video className="w-3.5 h-3.5" />
            <span>Target Guide: AI video left right</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            Left/Right Confusion in AI Video: Frame-Left vs. Character's Left Solved
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            You prompt 'The man walks right', but the model generates him walking left. Why? Because the model confused audience perspective with the character's stage perspective. Here is the permanent fix.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
            <span>By Botock AI Filmmaking Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>October 20, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>10 min read</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Tested on Botock AI Video Generator</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Core Principle Callout */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/50 mb-12 shadow-sm">
          <h3 className="text-base font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Audience Frame vs. Character Stage Coordinates
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            A character facing the camera has their physical right hand on the audience's left side of the screen. When you write 'right', AI video models guess randomly with a 50% coin-flip error rate. You must standardize your vocabulary.
          </p>
        </div>

        {/* Section 1: Detailed Table */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
            Spatial Coordinate Mapping Table
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-3 px-4">You Want</th><th className="py-3 px-4">Never Write This</th><th className="py-3 px-4">Always Write This</th><th className="py-3 px-4">Exact Coordinate Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Subject on screen's left</td><td className="py-3 px-4 font-medium">on the left</td><td className="py-3 px-4 font-medium">at frame-left</td><td className="py-3 px-4 font-medium">Audience's left third of the display screen</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Subject on screen's right</td><td className="py-3 px-4 font-medium">on the right</td><td className="py-3 px-4 font-medium">at frame-right</td><td className="py-3 px-4 font-medium">Audience's right third of the display screen</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Character's biological right arm</td><td className="py-3 px-4 font-medium">right arm</td><td className="py-3 px-4 font-medium">the character's own right arm</td><td className="py-3 px-4 font-medium">Anatomical right side of the character's torso</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Movement toward screen's right</td><td className="py-3 px-4 font-medium">walks right</td><td className="py-3 px-4 font-medium">moves toward frame-right</td><td className="py-3 px-4 font-medium">Linear trajectory across screen toward audience right</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Avoid vs Correct Prompts */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            Avoid vs. Correct: Production Prompt Comparison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-3 text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                AVOID (Glitches & Morphing)
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-red-200/60 dark:border-red-900/40 mb-3">
                &quot;Person A is on the right and Person B is on the left. Person A looks left at Person B.&quot;
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Why it fails:</strong> Fails because 'looks left' is ambiguous: does Person A look toward frame-left, or toward their own anatomical left (which would be frame-right)?
              </div>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                CORRECT (Production Ready)
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 mb-3">
                BLOCKING: Person A stands at frame-right, facing frame-left. Person B sits at frame-left, facing frame-right.<br />ACTION: Person A turns head 15 degrees toward frame-left, making direct eyeline contact with Person B.<br />CAMERA: Eye-level wide two-shot.
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                <strong>Why it works:</strong> Defines both character positions and eyelines using unambiguous audience frame coordinates.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Actionable Implementation Steps */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
            Production Step-by-Step Implementation
          </h2>
          <div className="space-y-3 mb-8">
            
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Rule 1: Adopt 'Frame-Left' & 'Frame-Right'</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Banish bare 'left' and 'right' from your prompt dictionary completely.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Rule 2: Label Characters Person A and Person B</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Never use pronouns ('he', 'she') when two characters share a frame. Use explicit semantic labels.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Rule 3: Establish Screen Direction First</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Before describing motion, state starting positions: 'Subject begins centered at frame-left...'</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Rule 4: Lock the 180° Axis</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Keep Person A looking frame-left and Person B looking frame-right across all consecutive reverse shots.</p>
            </div>
        
          </div>
        </section>

        {/* High-Intent Tool CTA: Try in Botock AI Video Generator */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white mb-14 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-200">Interactive Studio</span>
              <h3 className="text-2xl font-black mt-1 mb-2">Test This Prompt in Botock Video Generator</h3>
              <p className="text-sm text-blue-100 max-w-xl">
                Ready to generate your clip? Launch the Botock AI Video Generator right now with zero software installation and test these exact physical constraints.
              </p>
            </div>
            <Link
              href="/tools/video-generator"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-600 font-black text-sm hover:bg-blue-50 transition-all shadow-lg"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Video Generator</span>
            </Link>
          </div>
        </div>

        {/* Navigation to Sister Guides & Master */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog/ai-video-prompt-engineering-master-handbook"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Master 25-Chapter Handbook</span>
          </Link>
          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-sm transition-all"
          >
            <span>Explore All 14 Guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
