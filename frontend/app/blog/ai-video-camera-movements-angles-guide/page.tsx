import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Video,
  Camera,
  Compass,
  Move,
  Maximize2,
  Film,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  PlayCircle,
  HelpCircle,
  Copy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Video Camera Movements & Angles: The Definitive Cinematography Guide (2026)",
  description:
    "Master AI video camera motion: Pan, Tilt, Dolly, Truck, Arc, Crane, Pedestal, Whip Pan, Steadicam, and Vertigo Dolly Zoom. Complete prompt templates and physics guide.",
  alternates: {
    canonical: "/blog/ai-video-camera-movements-angles-guide",
  },
  openGraph: {
    title: "AI Video Camera Movements & Angles: The Definitive Cinematography Guide",
    description:
      "Stop camera glitching and subject morphing. Direct high-end cinematic camera motion in Botock, Sora, Kling, and Runway Gen-3.",
    url: "https://botock.app/blog/ai-video-camera-movements-angles-guide",
    type: "article",
    publishedTime: "2026-10-19T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-camera-movements-angles.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Camera Movements & Angles Guide",
    description:
      "Master pan, tilt, dolly, arc, and crane movements in AI video prompts.",
    images: ["https://botock.app/images/blog/ai-camera-movements-angles.jpg"],
  },
};

export default function CameraMovementsBlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "AI Video Camera Movements & Angles: The Definitive Cinematography Guide",
        description:
          "Comprehensive prompt engineering handbook for AI video camera motion, shot sizes, camera angles, and optical physics.",
        image: "https://botock.app/images/blog/ai-camera-movements-angles.jpg",
        datePublished: "2026-10-19T00:00:00Z",
        dateModified: "2026-10-19T00:00:00Z",
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
        mainEntityOfPage: "https://botock.app/blog/ai-video-camera-movements-angles-guide",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Banner Header */}
      <div className="w-full bg-white dark:bg-[#111114] border-b border-slate-200 dark:border-white/10 px-6 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />
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
              Master Prompt Engineering Handbook
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-4">
            <Video className="w-3.5 h-3.5" />
            <span>Cinematography & Camera Motion Masterclass</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            AI Video Camera Movements, Angles & Shot Sizes: Complete Prompt Engineering Guide
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            Master spatial camera vocabulary for AI video models. Learn how to prompt pans, tilts, dollies, tracking moves, Dutch angles, and vertigo zooms without subject distortion or perspective tearing.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
            <span>By Botock AI Filmmaking Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>October 19, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>18 Min Read</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Based on 100-Page Video Prompt Handbook</span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Real Visual Image Showcase */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-slate-900">
          <div className="relative aspect-video w-full">
            <Image
              src="/images/blog/ai-camera-movements-angles.jpg"
              alt="Professional AI Video Steadicam and Camera Motion Setup"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="p-4 bg-slate-900/90 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <strong>Production Visual:</strong> Steadicam tracking setup with 2.39:1 framing & kinetic camera velocity prompt
            </span>
            <span className="text-slate-500 font-mono">Model: 8K IMAX ARRI 65 Simulation</span>
          </div>
        </div>

        {/* Quick Summary Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/50 mb-12">
          <h3 className="text-base font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            The Golden Rule of AI Camera Prompting
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            AI video models do not possess physical camera lenses or motors. They generate pixels over time based on statistical associations. When you say <em>&quot;The camera swoops dynamically&quot;</em>, the model blurs the background and morphs the subject. To get rock-solid motion, you must declare: <strong>1) Camera starting position</strong>, <strong>2) Movement axis & speed</strong>, and <strong>3) What remains completely stationary</strong>.
          </p>
        </div>

        {/* Section 1: Shot Sizes Table */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Maximize2 className="w-7 h-7 text-blue-500" />
            1. Shot Sizes: Framing the Scene
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Shot size establishes scale and emotional distance. If you fail to specify shot size, the model default is almost always a bland chest-up medium shot. Use the standard film scale below:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Shot Size</th>
                  <th className="py-3 px-4">Frame Shows</th>
                  <th className="py-3 px-4">Best Used For</th>
                  <th className="py-3 px-4">Prompt Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">Extreme Wide Shot (EWS)</td>
                  <td className="py-3 px-4">Massive landscape, character is a tiny speck</td>
                  <td className="py-3 px-4">World building, solitude, scale</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">Extreme wide landscape shot, tiny figure</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">Wide Shot (WS)</td>
                  <td className="py-3 px-4">Full body with abundant environmental context</td>
                  <td className="py-3 px-4">Spatial relationships, entrances</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">Wide shot, full figure with room above head</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">Full Shot (FS)</td>
                  <td className="py-3 px-4">Character head to toe, ground to top of frame</td>
                  <td className="py-3 px-4">Wardrobe, walking mechanics, body posture</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">Full shot from head to boots</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">Medium Shot (MS)</td>
                  <td className="py-3 px-4">Waist up to head</td>
                  <td className="py-3 px-4">Dialogue, casual conversation</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">Medium shot, framed from waist up</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">Close-Up (CU)</td>
                  <td className="py-3 px-4">Head and shoulders only</td>
                  <td className="py-3 px-4">Subtle acting, micro-expressions</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">Close-up shot of face and collarbone</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">Extreme Close-Up (ECU)</td>
                  <td className="py-3 px-4">Only eyes, lips, or a single prop mechanism</td>
                  <td className="py-3 px-4">High tension, panic, fine detail reveal</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">Extreme macro close-up of iris and pupil</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Camera Angles Table */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Compass className="w-7 h-7 text-indigo-500" />
            2. Camera Angles: Emotional Perspective
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            The angle of the lens immediately dictates who holds psychological power in the shot.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Neutral & Grounded</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Eye-Level Shot</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                Positions the lens at the subject&apos;s exact eye plane. Establishes parity and documentary authenticity.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-black/30 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300">
                &quot;Camera at straight eye-level, lens level with subject&apos;s gaze.&quot;
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">Dominance & Authority</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Low-Angle Shot</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                Camera looks upward from knee or waist height. The subject towers over the frame, projecting power or intimidation.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-black/30 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300">
                &quot;Low-angle shot looking upward from knee height at the character.&quot;
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1">Vulnerability & Isolation</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">High-Angle & Bird&apos;s-Eye</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                Camera looks down at the character. Makes the character appear small, trapped, or observed by an omniscient presence.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-black/30 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300">
                &quot;High-angle shot looking down at a 45-degree angle upon the seated figure.&quot;
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">Disorientation & Dread</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dutch Angle (Canted)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                The horizon line is deliberately tilted 15 to 25 degrees. Signals psychological distress or paranormal unbalance.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-black/30 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300">
                &quot;Dutch angle shot, horizon tilted 20 degrees counterclockwise.&quot;
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Camera Movements Dictionary */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Move className="w-7 h-7 text-emerald-500" />
            3. Camera Movements: Kinetic Direction
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            The handbook defines 22 precise movement mechanics. Here are the 8 foundational moves with exact prompt syntax:
          </p>

          <div className="space-y-4 mb-8">
            {/* Pan & Tilt */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 dark:text-white">Pan (Horizontal Rotation) & Tilt (Vertical Rotation)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Rotational Axis</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                The tripod head stays stationary while the lens sweeps left-to-right (Pan) or up-and-down (Tilt).
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-xs">
                CAMERA: Slow, smooth pan from frame-left to frame-right, tracking the distant car headlights across the dark highway. The tripod remains anchored.
              </div>
            </div>

            {/* Dolly In / Push-In */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 dark:text-white">Dolly In (Push-In) vs. Optical Zoom</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">Physical vs. Optical</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                <strong>Dolly:</strong> The physical camera moves physically forward on tracks, causing background parallax. <strong>Zoom:</strong> Focal length changes without perspective change.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-xs">
                CAMERA: Slow physical dolly-in toward the detective&apos;s face over 5 seconds. Background reveals natural perspective parallax. No optical zoom.
              </div>
            </div>

            {/* Steadicam / Tracking Shot */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 dark:text-white">Steadicam Leading & Tracking Shot</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">Dynamic Kinetic</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                Smooth mechanical stabilization following a moving subject through dynamic environments.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-xs">
                CAMERA: Steadicam leading shot, retreating backwards at steady walking pace 2 meters ahead of Person A as they walk through the bustling market alley.
              </div>
            </div>

            {/* Arc / Orbit */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 dark:text-white">360° Arc / Orbit Movement</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">Rotational Orbit</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                Camera orbits in a circular curve around a central character, rotating the background scenery around them.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-xs">
                CAMERA: Smooth 90-degree counter-clockwise arc around the standing knight, keeping the character dead-center while the castle background rotates smoothly behind him.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Bad vs Good Prompts (Comparison Matrix) */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Sliders className="w-7 h-7 text-rose-500" />
            4. Avoiding the Deadly Mistakes: Avoid vs. Correct
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-3 text-sm">
                <XCircle className="w-5 h-5" />
                AVOID (Vague & Glitch-Prone)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-red-200/60 dark:border-red-900/40 mb-3">
                &quot;The camera moves really fast and dramatically swoops around the room showing everything in crazy cinematic 8k detail.&quot;
              </p>
              <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Why it fails:</strong> &quot;Swoops&quot; and &quot;crazy&quot; cause violent latent noise shifts. The AI distorts walls, stretches limbs, and morphs furniture.
              </div>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 text-sm">
                <CheckCircle2 className="w-5 h-5" />
                CORRECT (Physical & Production-Ready)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 mb-3">
                &quot;CAMERA: Medium shot. Slow, linear dolly push-in of 1 meter toward the desk over 4 seconds. Horizon remains locked level. No panning or tilting.&quot;
              </p>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                <strong>Why it succeeds:</strong> Constrains the movement vector to a single linear axis, eliminating 95% of hallucinated artifacts.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: The Speed Control Vocabulary */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            5. Camera Speed Calibration Vocabulary
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed">
            AI models interpret adjectives differently. Here is the exact scale tested across Botock, Kling 1.5, and Sora:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-8">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs text-slate-400 mb-1">0.1 - 0.3 m/s</div>
              <div className="font-bold text-sm text-blue-500">Creeping / Barely Perceptible</div>
              <p className="text-[11px] text-slate-500 mt-1">Suspense, psychological tension</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs text-slate-400 mb-1">0.5 - 1.0 m/s</div>
              <div className="font-bold text-sm text-emerald-500">Slow & Measured</div>
              <p className="text-[11px] text-slate-500 mt-1">Dialogue scenes, establishing shots</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs text-slate-400 mb-1">1.5 - 2.5 m/s</div>
              <div className="font-bold text-sm text-amber-500">Brisk Walking Pace</div>
              <p className="text-[11px] text-slate-500 mt-1">Tracking a walking character</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs text-slate-400 mb-1">Instant</div>
              <div className="font-bold text-sm text-purple-500">Whip Pan</div>
              <p className="text-[11px] text-slate-500 mt-1">High-speed transition between subjects</p>
            </div>
          </div>
        </section>

        {/* Navigation to Master and Sister Blogs */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog/ai-video-prompt-engineering-master-handbook"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            <Film className="w-4 h-4" />
            Explore Complete 25-Chapter Master Handbook
          </Link>
          <Link
            href="/blog/ai-video-actions-body-gestures-prompt-guide"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm transition-all"
          >
            <span>Next Guide: Actions & Body Gestures</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
