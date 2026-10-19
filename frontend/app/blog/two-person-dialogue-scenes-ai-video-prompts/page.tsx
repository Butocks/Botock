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
  title: "Two-Person Dialogue Scenes in AI Video: Shot-Reverse-Shot Guide | Botock",
  description: "Direct realistic dialogue between two people in AI video. Master two-shots, over-the-shoulder framing, and listener reaction prompts.",
  alternates: {
    canonical: "/blog/two-person-dialogue-scenes-ai-video-prompts",
  },
  openGraph: {
    title: "Two-Person Dialogue Scenes in AI Video: The Shot-Reverse-Shot Prompt Guide",
    description: "Direct realistic dialogue between two people in AI video. Master two-shots, over-the-shoulder framing, and listener reaction prompts.",
    url: "https://botock.app/blog/two-person-dialogue-scenes-ai-video-prompts",
    type: "article",
    publishedTime: "2026-10-20T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Two-Person Dialogue Scenes in AI Video: Shot-Reverse-Shot Guide",
    description: "Direct realistic dialogue between two people in AI video. Master two-shots, over-the-shoulder framing, and listener reaction prompts.",
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
};

export default function BlogTargetPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "Two-Person Dialogue Scenes in AI Video: The Shot-Reverse-Shot Prompt Guide",
        description: "Direct realistic dialogue between two people in AI video. Master two-shots, over-the-shoulder framing, and listener reaction prompts.",
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
        mainEntityOfPage: "https://botock.app/blog/two-person-dialogue-scenes-ai-video-prompts",
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
            <span>Target Guide: AI video dialogue prompt</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            Two-Person Dialogue Scenes in AI Video: The Shot-Reverse-Shot Prompt Guide
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            Prompting two people having a conversation in a single video prompt is a recipe for disaster: characters talk at the same time or swap faces. Here is the Hollywood Shot-Reverse-Shot method tailored for AI models.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
            <span>By Botock AI Filmmaking Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>October 20, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>11 min read</span>
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
            The Golden Rule of AI Dialogue
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Never prompt both people speaking in the same clip. Hollywood films don't do this, and AI models can't handle it. Break dialogue into three distinct clips: 1) Speaker A delivers their line, 2) Speaker B reacts silently, 3) Speaker B replies.
          </p>
        </div>

        {/* Section 1: Detailed Table */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
            The 3-Clip Dialogue Pipeline
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-3 px-4">Clip Number</th><th className="py-3 px-4">Shot Type</th><th className="py-3 px-4">Who Speaks</th><th className="py-3 px-4">Who Listens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Clip 01: Speaker Delivery</td><td className="py-3 px-4 font-medium">Over-the-shoulder on Person A</td><td className="py-3 px-4 font-medium">Person A speaks exact line</td><td className="py-3 px-4 font-medium">Person B seen only from back of head/shoulder</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Clip 02: Listener Reaction</td><td className="py-3 px-4 font-medium">Close-up on Person B</td><td className="py-3 px-4 font-medium">Silence (no speech)</td><td className="py-3 px-4 font-medium">Person B reacts subtly with eyebrow raise or nod</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Clip 03: The Response</td><td className="py-3 px-4 font-medium">Over-the-shoulder on Person B</td><td className="py-3 px-4 font-medium">Person B speaks exact line</td><td className="py-3 px-4 font-medium">Person A seen only as foreground shoulder silhouette</td></tr>
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
                &quot;Two friends sitting at a diner talking to each other about their weekend plans and laughing.&quot;
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Why it fails:</strong> Both characters will start murmuring simultaneously, faces will merge, and eyes will cross.
              </div>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                CORRECT (Production Ready)
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 mb-3">
                CAMERA: Over-the-shoulder shot looking past Person B's blurred dark jacket at Person A.<br />SUBJECT: Person A (30s man, grey sweater) sits at frame-left facing frame-right.<br />ACTION: Person A speaks one line: 'I saw him yesterday.' He finishes speaking at 3 seconds and looks down.<br />AUDIO: Person A natural speaking voice. No background music.
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                <strong>Why it works:</strong> Anchors only one speaking face, uses classic cinema OTS framing, and specifies exact dialogue timing.
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
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Step 1: Establishing Two-Shot</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Start with a 3-second wide shot establishing both characters at the table without any dialogue.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Step 2: Shot-Reverse-Shot</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Cut to over-the-shoulder for each spoken line.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Step 3: Capture the Silent Beat</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">A 2-second clip of pure facial reaction sells dramatic realism more than 10 seconds of talking.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Step 4: Edit in Botock Video Editor</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Line up audio dialogue and reaction cuts on the multi-track timeline.</p>
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
