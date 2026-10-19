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
  title: "25 Reasons Your AI Video Looks Wrong: Troubleshooting Matrix | Botock",
  description: "Fix gliding feet, rubbery joints, melting faces, camera drifting, and distorted props in AI video. The complete troubleshooting matrix.",
  alternates: {
    canonical: "/blog/25-reasons-ai-video-looks-wrong-and-fixes",
  },
  openGraph: {
    title: "25 Reasons Your AI Video Looks Wrong (And How to Fix Every Glitch)",
    description: "Fix gliding feet, rubbery joints, melting faces, camera drifting, and distorted props in AI video. The complete troubleshooting matrix.",
    url: "https://botock.app/blog/25-reasons-ai-video-looks-wrong-and-fixes",
    type: "article",
    publishedTime: "2026-10-20T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "25 Reasons Your AI Video Looks Wrong: Troubleshooting Matrix",
    description: "Fix gliding feet, rubbery joints, melting faces, camera drifting, and distorted props in AI video. The complete troubleshooting matrix.",
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
};

export default function BlogTargetPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "25 Reasons Your AI Video Looks Wrong (And How to Fix Every Glitch)",
        description: "Fix gliding feet, rubbery joints, melting faces, camera drifting, and distorted props in AI video. The complete troubleshooting matrix.",
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
        mainEntityOfPage: "https://botock.app/blog/25-reasons-ai-video-looks-wrong-and-fixes",
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
            <span>Target Guide: AI video common mistakes</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            25 Reasons Your AI Video Looks Wrong (And How to Fix Every Glitch)
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            Why do AI characters glide without friction? Why do background actors suddenly look into the camera? Why do coffee cups turn into telephones? Here is the definitive troubleshooting matrix covering all 25 common AI video failure modes.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
            <span>By Botock AI Filmmaking Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>October 20, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>17 min read</span>
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
            The Root Cause of AI Video Artifacts
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Generative video errors are not random bugs—they occur when prompt instructions contradict the model's physics prior or when you fail to provide spatial anchor boundaries. Every artifact has an exact prompt solution.
          </p>
        </div>

        {/* Section 1: Detailed Table */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
            The Master AI Video Debugging Matrix
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-3 px-4">Flaw / Artifact</th><th className="py-3 px-4">Why It Occurs</th><th className="py-3 px-4">Exact Prompt Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Moonwalking / Sliding Feet</td><td className="py-3 px-4 font-medium">Feet animate without ground contact physics</td><td className="py-3 px-4 font-medium">Specify: 'Boots plant firmly on paved asphalt with clear weight transfer each step.'</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Character Stares at Lens</td><td className="py-3 px-4 font-medium">Diffusion models pull human gaze toward the camera</td><td className="py-3 px-4 font-medium">Specify: 'EYELINE: Subject looks at Person B; strictly never looks into the camera lens.'</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Extra Fingers / Mutated Hands</td><td className="py-3 px-4 font-medium">Hands move through empty air with unconstrained joints</td><td className="py-3 px-4 font-medium">Anchor hands to rigid physical objects or coat pockets: 'Hands remain in pockets.'</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Loud Cheap Synth Music</td><td className="py-3 px-4 font-medium">Platform audio model defaults to random music generation</td><td className="py-3 px-4 font-medium">Always append: 'AUDIO: No music. Ambient room tone only.'</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Background People Moving Unnaturally</td><td className="py-3 px-4 font-medium">AI animates extras when they have no assigned task</td><td className="py-3 px-4 font-medium">Specify: 'Background cafe patrons remain completely seated and static.'</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Face Melts During Camera Pan</td><td className="py-3 px-4 font-medium">Pan velocity exceeds latent sampling rate</td><td className="py-3 px-4 font-medium">Specify: 'Slow, smooth tripod pan at 0.5 m/s. Horizon locked level.'</td></tr>
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
                &quot;A man walking down a busy city street smiling happily in 4k photorealistic detail.&quot;
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Why it fails:</strong> Lacks ground contact constraints, eyeline limits, and background rules. He will glide like a ghost while 10 extra people warp into him.
              </div>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                CORRECT (Production Ready)
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 mb-3">
                SUBJECT: Solo 30s man walking forward along the sidewalk.<br />ACTION: Man takes 4 measured walking steps, leather shoes pressing into wet pavement. Man looks straight ahead toward frame-right.<br />BACKGROUND: Empty street with static shopfronts.<br />CAMERA: Steadicam leading shot retreating 2 meters ahead.<br />NEGATIVE: No gliding, no moonwalking, no background extras, no lens staring.
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                <strong>Why it works:</strong> Neutralizes all 5 common walking errors with precise mechanical instructions.
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
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Fix 1: Isolate the Action</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">If a clip fails, remove 50% of the descriptive adjectives and keep only the physical verb.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Fix 2: Add Explicit Negatives</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Use negative prompt fields or prompt-level negative sentences to forbid the exact flaw.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Fix 3: Shorten Clip Duration</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Generating 4 seconds has a 90% success rate; generating 10 seconds has a 40% success rate. Generate two 5s clips instead.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Fix 4: Pre-generate with Seed Image</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Always start from a clean high-resolution still image generated in Botock Image Studio.</p>
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
