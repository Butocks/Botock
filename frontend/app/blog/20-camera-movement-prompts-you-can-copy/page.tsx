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
  title: "20 Camera Movement Prompts for AI Video (Copy & Paste 2026) | Botock",
  description: "Copy and paste 20 proven camera movement prompts for AI video: slow push-in dollies, tracking steadicam, 360-degree arcs, vertigo zooms, and whip pans.",
  alternates: {
    canonical: "/blog/20-camera-movement-prompts-you-can-copy",
  },
  openGraph: {
    title: "20 Camera Movement Prompts You Can Copy for AI Video (Pans, Dollies & Zooms)",
    description: "Copy and paste 20 proven camera movement prompts for AI video: slow push-in dollies, tracking steadicam, 360-degree arcs, vertigo zooms, and whip pans.",
    url: "https://botock.app/blog/20-camera-movement-prompts-you-can-copy",
    type: "article",
    publishedTime: "2026-10-20T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "20 Camera Movement Prompts for AI Video (Copy & Paste 2026)",
    description: "Copy and paste 20 proven camera movement prompts for AI video: slow push-in dollies, tracking steadicam, 360-degree arcs, vertigo zooms, and whip pans.",
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
};

export default function BlogTargetPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "20 Camera Movement Prompts You Can Copy for AI Video (Pans, Dollies & Zooms)",
        description: "Copy and paste 20 proven camera movement prompts for AI video: slow push-in dollies, tracking steadicam, 360-degree arcs, vertigo zooms, and whip pans.",
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
        mainEntityOfPage: "https://botock.app/blog/20-camera-movement-prompts-you-can-copy",
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
            <span>Target Guide: camera movement prompts AI video</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            20 Camera Movement Prompts You Can Copy for AI Video (Pans, Dollies & Zooms)
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            Camera movement transforms boring still-looking clips into dynamic Hollywood cinematography. Here are 20 ready-to-use, tested camera movement prompts you can copy directly into Botock Video Generator.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
            <span>By Botock AI Filmmaking Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>October 20, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>13 min read</span>
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
            Kinematic Rules for Camera Prompts
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            A good camera prompt specifies: 1) Camera mount (tripod, track, steadicam, crane), 2) Spatial axis (forward, vertical, rotational), and 3) Speed (slow, measured, brisk). Avoid vague words like 'cinematic motion'.
          </p>
        </div>

        {/* Section 1: Detailed Table */}
        <section className="mb-14">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
            Camera Movement Catalog (Sample Selection)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-3 px-4">Movement</th><th className="py-3 px-4">Kinematic Axis</th><th className="py-3 px-4">Camera Speed</th><th className="py-3 px-4">Prompt Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Dolly In</td><td className="py-3 px-4 font-medium">Linear Z-Axis forward</td><td className="py-3 px-4 font-medium">Slow (0.5 m/s)</td><td className="py-3 px-4 font-medium">Slow physical dolly push-in of 1 meter toward subject's face over 4 seconds.</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Lateral Truck</td><td className="py-3 px-4 font-medium">Linear X-Axis sideways</td><td className="py-3 px-4 font-medium">Walking pace (1.2 m/s)</td><td className="py-3 px-4 font-medium">Camera trucks smoothly frame-left to frame-right parallel to the walking character.</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">360° Orbit Arc</td><td className="py-3 px-4 font-medium">Circular Y-Axis orbit</td><td className="py-3 px-4 font-medium">Smooth rotational</td><td className="py-3 px-4 font-medium">90-degree counter-clockwise arc orbiting the standing subject while keeping them centered.</td></tr><tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"><td className="py-3 px-4 font-medium">Vertigo Dolly Zoom</td><td className="py-3 px-4 font-medium">Forward dolly + optical zoom out</td><td className="py-3 px-4 font-medium">Balanced counter-speed</td><td className="py-3 px-4 font-medium">Dolly-in while simultaneously zooming out, background warps while subject size stays locked.</td></tr>
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
                &quot;Cinematic epic camera flythrough showing the city in stunning 8K drone motion.&quot;
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Why it fails:</strong> 'Flythrough' and 'drone motion' cause massive perspective warping and dissolved buildings.
              </div>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                CORRECT (Production Ready)
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 mb-3">
                CAMERA: Low-altitude forward tracking shot at 2 meters height. Camera moves forward along the street center line at 15 km/h. Horizon strictly level. 24mm wide angle lens.
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                <strong>Why it works:</strong> Specifies height, velocity, linear path, and focal length for crisp spatial stability.
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
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Prompt #1: The Suspense Push-In</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">CAMERA: Static tripod framing medium shot. Creeping dolly push-in of 50 cm toward the detective's eyes over 5 seconds.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Prompt #2: Steadicam Alley Follow</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">CAMERA: Steadicam tracking shot following 2 meters behind the running protagonist through the rainy neon alleyway.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Prompt #3: Majestic Crane Up</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">CAMERA: Crane shot starting at ground level boots, rising smoothly 4 meters upward to reveal the expansive castle valley.</p>
            </div>
        
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Prompt #4: High-Speed Whip Pan</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">CAMERA: Instant whip pan from frame-left window to frame-right entrance door with heavy motion blur during rotation.</p>
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
