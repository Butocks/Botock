import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Activity,
  Hand,
  User,
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Flame,
  Film,
  Camera,
  Layers,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Video Actions & Body Gestures: The Prompt Engineering Anatomy Guide (2026)",
  description:
    "Master character blocking, hand gestures, facial micro-expressions, walking physics, and fight choreography in AI video generation. Stop 6-finger glitches and body melting.",
  alternates: {
    canonical: "/blog/ai-video-actions-body-gestures-prompt-guide",
  },
  openGraph: {
    title: "AI Video Actions & Body Gestures: The Prompt Engineering Anatomy Guide",
    description:
      "Choreograph realistic human movements, precise finger interactions, and action beats in Botock, Sora, Kling, and Runway Gen-3.",
    url: "https://botock.app/blog/ai-video-actions-body-gestures-prompt-guide",
    type: "article",
    publishedTime: "2026-10-19T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-character-action-blocking.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Actions & Body Gestures Guide",
    description: "Master character blocking, hand actions, and fight beats in AI video.",
    images: ["https://botock.app/images/blog/ai-character-action-blocking.jpg"],
  },
};

export default function ActionGesturesBlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "AI Video Actions & Body Gestures: The Prompt Engineering Anatomy Guide",
        description:
          "Comprehensive guide to character blocking, anatomical integrity, hand actions, and fight choreography in AI video models.",
        image: "https://botock.app/images/blog/ai-character-action-blocking.jpg",
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
        mainEntityOfPage: "https://botock.app/blog/ai-video-actions-body-gestures-prompt-guide",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="w-full bg-white dark:bg-[#111114] border-b border-slate-200 dark:border-white/10 px-6 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-600" />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-purple-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Blog Catalog
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href="/blog/ai-video-prompt-engineering-master-handbook"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Master Prompt Engineering Handbook
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-4">
            <Activity className="w-3.5 h-3.5" />
            <span>Character Blocking & Anatomical Precision Guide</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            AI Video Actions, Hand Gestures & Body Mechanics: Complete Prompt Engineering Guide
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            Eliminate distorted hands, rubbery joints, gliding feet, and unnatural movements. Learn how to write physical action beats that AI video models execute with biological realism.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
            <span>By Botock AI Filmmaking Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>October 19, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>19 Min Read</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Based on 100-Page Video Prompt Handbook</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Real Visual Image Showcase */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-slate-900">
          <div className="relative aspect-video w-full">
            <Image
              src="/images/blog/ai-character-action-blocking.jpg"
              alt="Ultra-realistic AI Video Hand and Mechanical Object Interaction"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="p-4 bg-slate-900/90 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-400" />
              <strong>Production Visual:</strong> Tactile finger interaction with antique chronometer, macro depth-of-field prompt
            </span>
            <span className="text-slate-500 font-mono">Model: 8K Macro Precision Simulation</span>
          </div>
        </div>

        {/* Core Principle Callout */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900/50 mb-12">
          <h3 className="text-base font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            The Single Event Rule for AI Motion
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            A 5-second video clip can only reliably compute <strong>one single physical transition</strong>. If you ask a character to <em>&quot;stand up, walk to the cabinet, open the drawer, and grab a gun&quot;</em>, the model will fuse these frames together into a horrific morphing nightmare. Instead, plan separate clips: <strong>Clip 1:</strong> The character stands up. <strong>Clip 2:</strong> Hand insert opens the drawer.
          </p>
        </div>

        {/* Section 1: Hand & Finger Dexterity */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Hand className="w-7 h-7 text-purple-500" />
            1. Hand & Finger Actions: Solving the 6-Finger Nightmare
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Hands fail in AI video when they move through empty air without contact points. When a hand interacts with a rigid physical object, the physics engine anchors the finger joints to the geometry of that object.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Physical Anchor Technique</th>
                  <th className="py-3 px-4">Production Prompt Syntax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">Picking Up an Object</td>
                  <td className="py-3 px-4">Name thumb and opposing fingers clamping the rim</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    &quot;Person A&apos;s right hand closes thumb and index finger firmly around the ceramic mug handle and lifts it vertically 5 cm.&quot;
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">Pointing Direction</td>
                  <td className="py-3 px-4">Specify single extended index finger, curled thumb and remaining fingers</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    &quot;Right hand raises to shoulder level, extending only the right index finger toward frame-left while other fingers curl tightly into the palm.&quot;
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">Open Palm / Revealing</td>
                  <td className="py-3 px-4">Flat palm turned upward, object stationary in center</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    &quot;Right palm turns upward smoothly, fingers naturally relaxed and flat, revealing a brass key resting motionless on the palm.&quot;
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">Resting / Inaction</td>
                  <td className="py-3 px-4">Hands anchored in pockets or clasped to prevent random twitching</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    &quot;Both hands remain buried deeply inside coat pockets throughout the entire clip. No finger movement.&quot;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Head, Eyes & Gaze Direction */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <User className="w-7 h-7 text-indigo-500" />
            2. Head, Eyes & Neck Mechanics
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            In cinematic acting, <strong>the eyes always lead the head</strong>. A character who moves their head and eyes simultaneously looks robotic. Split the action into eye shift first, followed by head turn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">Eyes Shift First</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Eyeline Movement</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                Directing the pupil without moving the skull creates intense emotional presence.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-purple-400 font-mono text-xs">
                ACTION: The woman&apos;s head remains motionless. Her eyes shift slowly from looking down at the letter to looking up toward frame-right. She holds her gaze without blinking.
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-1">Preventing 4th Wall Break</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Off-Camera Eyeline</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                By default, AI models pull human eyes toward the lens. You must explicitly forbid lens eye-contact.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-purple-400 font-mono text-xs">
                EYELINE: The subject looks strictly at Person B at frame-left. The subject never looks directly into the camera lens.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Whole-Body Mechanics & Walking Physics */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-500" />
            3. Walking Physics & Torso Motion
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            The most common AI walking flaw is <strong>&quot;moonwalking in place&quot;</strong> (feet moving while the character glides without friction). Fix this by anchoring the camera coordinate system to the character&apos;s displacement:
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Walking Forward Through Space</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                Explicitly dictate that the distance between the subject and the background changes linearly with each step.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-amber-400 font-mono text-xs">
                ACTION: Person A takes four deliberate walking steps forward along the paved sidewalk, advancing 3 meters toward the camera. Boots plant firmly on the asphalt with zero sliding.
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">The Stand-to-Sit Transition</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                Specify weight transfer to the knees and thighs to prevent instant height dropping.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-amber-400 font-mono text-xs">
                ACTION: Standing character bends their knees and lowers their torso smoothly into the wooden armchair over 3 seconds, hands resting on the armrests as weight settles.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Fight Beats & Action Choreography */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Flame className="w-7 h-7 text-rose-500" />
            4. Fight Beats & Kinetic Choreography
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Never prompt an entire fight scene in one prompt (e.g., <em>&quot;Two martial artists fight furiously&quot;</em>). A fight is choreographed in individual <strong>Action Beats</strong>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold text-rose-500 uppercase mb-1">Beat 1: The Strike</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">Attack Vector</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                &quot;Person A steps forward with right foot and throws a straight right punch toward frame-left.&quot;
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold text-blue-500 uppercase mb-1">Beat 2: The Evasion</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">Dodge / Duck</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                &quot;Person B ducks their head down and shifts their weight to the right, slipping under the punch.&quot;
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold text-emerald-500 uppercase mb-1">Beat 3: Counter</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">Impact / Recoil</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                &quot;Person B delivers a palm strike to the chest; Person A stumbles backward two steps and recovers.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog/ai-video-camera-movements-angles-guide"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous: Camera Movements & Angles</span>
          </Link>
          <Link
            href="/blog/ai-video-cinematic-lighting-optics-guide"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20"
          >
            <span>Next Guide: Cinematic Lighting & Optics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
