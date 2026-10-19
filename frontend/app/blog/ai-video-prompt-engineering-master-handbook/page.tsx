import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Film,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Move,
  Compass,
  Sun,
  Hand,
  User,
  Activity,
  Volume2,
  VolumeX,
  Palette,
  Sliders,
  Maximize2,
  FileText,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The AI Video Prompt Engineering Master Handbook: 25-Chapter Production Guide (2026)",
  description:
    "The definitive reference handbook for AI video prompt engineering. Master the 9 prompt blocks, camera motion, lens optics, anatomical blocking, dialogue, and multi-clip continuity for Botock, Kling, Sora, and Runway.",
  alternates: {
    canonical: "/blog/ai-video-prompt-engineering-master-handbook",
  },
  openGraph: {
    title: "The AI Video Prompt Engineering Master Handbook (2026 Edition)",
    description:
      "A platform-neutral 25-chapter reference handbook for image-to-video and text-to-video. Master camera moves, lighting, body mechanics, and continuity.",
    url: "https://botock.app/blog/ai-video-prompt-engineering-master-handbook",
    type: "article",
    publishedTime: "2026-10-19T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The AI Video Prompt Engineering Master Handbook",
    description: "25 chapters, prompt formulas, parameter tables, and production templates.",
    images: ["https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"],
  },
};

export default function MasterHandbookBlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "The AI Video Prompt Engineering Master Handbook: 25-Chapter Production Guide",
        description:
          "Complete authoritative guide to AI video prompt engineering covering image analysis, camera kinematics, optics, lighting, body mechanics, audio, and multi-clip continuity.",
        image: "https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg",
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
        mainEntityOfPage: "https://botock.app/blog/ai-video-prompt-engineering-master-handbook",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What are the 9 core building blocks of an AI video prompt?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The nine blocks are: 1) Shot size & camera angle, 2) Subject identity & spatial anchor, 3) Starting pose & orientation, 4) The single primary action beat, 5) Movement direction & velocity, 6) Camera move & lens optics, 7) Lighting, atmosphere & color, 8) Audio/dialogue/silence, and 9) Negative exclusion constraints.",
            },
          },
          {
            "@type": "Question",
            name: "How do you stop characters from morphing or growing extra limbs in AI video?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Adhere to the Single Event Rule: assign only one clear physical action per 4-to-8 second clip. Anchor hands to rigid physical objects or coat pockets rather than letting them float in empty space, and specify camera starting positions with exact frame-left/frame-right coordinates.",
            },
          },
        ],
      },
    ],
  };

  const CHAPTERS = [
    { num: 1, title: "How Video Models Read Your Prompt", tag: "Foundations" },
    { num: 2, title: "Describing the Picture (Image Analysis)", tag: "Image-to-Video" },
    { num: 3, title: "The Subject Map & Left/Right Rules", tag: "Spatial Logic" },
    { num: 4, title: "Giving Motion to a Picture", tag: "Kinematics" },
    { num: 5, title: "Shot Sizes", tag: "Framing", link: "/blog/ai-video-camera-movements-angles-guide" },
    { num: 6, title: "Camera Angles", tag: "Perspective", link: "/blog/ai-video-camera-movements-angles-guide" },
    { num: 7, title: "Camera Movements (22 Core Moves)", tag: "Motion", link: "/blog/ai-video-camera-movements-angles-guide" },
    { num: 8, title: "Lens, Focus & Depth of Field", tag: "Optics", link: "/blog/ai-video-cinematic-lighting-optics-guide" },
    { num: 9, title: "Lighting, Colour & Visual Style", tag: "Atmosphere", link: "/blog/ai-video-cinematic-lighting-optics-guide" },
    { num: 10, title: "Head, Eyes & Neck Actions", tag: "Facial", link: "/blog/ai-video-actions-body-gestures-prompt-guide" },
    { num: 11, title: "Hand & Arm Actions (Which Finger)", tag: "Anatomy", link: "/blog/ai-video-actions-body-gestures-prompt-guide" },
    { num: 12, title: "Torso, Legs & Whole-Body Actions", tag: "Physics", link: "/blog/ai-video-actions-body-gestures-prompt-guide" },
    { num: 13, title: "Facial Expression & Micro-Emotions", tag: "Acting" },
    { num: 14, title: "Dialogue, Voice & Lip-Sync", tag: "Audio" },
    { num: 15, title: "Sound Design & Ambience", tag: "Audio" },
    { num: 16, title: "One-Person, Two-Person & Group Scenes", tag: "Choreography" },
    { num: 17, title: "Props & Object Interaction", tag: "Objects" },
    { num: 18, title: "Environment, Weather & Background", tag: "Atmosphere", link: "/blog/ai-video-cinematic-lighting-optics-guide" },
    { num: 19, title: "Action, Fights, Magic & Creatures", tag: "Stunts", link: "/blog/ai-video-actions-body-gestures-prompt-guide" },
    { num: 20, title: "Continuity & Multi-Clip Workflow", tag: "Editing" },
    { num: 21, title: "Genre Recipes (Ads, Shorts, Cinema)", tag: "Use Cases" },
    { num: 22, title: "Troubleshooting Guide (25 Common Flaws)", tag: "Debugging" },
    { num: 23, title: "Template Library (T1 - T25)", tag: "Formulas" },
    { num: 24, title: "Worked Examples (Image to Final Prompt)", tag: "Case Studies" },
    { num: 25, title: "Glossary, Checklists & Golden Rules", tag: "Reference" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <div className="w-full bg-white dark:bg-[#111114] border-b border-slate-200 dark:border-white/10 px-6 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Blog Catalog
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Flagship Reference Handbook
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 Complete Reference Guide • 25 Chapters • 100-Page Translation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            The AI Video Prompt Engineering Master Handbook
          </h1>

          <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 max-w-4xl">
            A platform-neutral production guide for Text-to-Video and Image-to-Video. Stop AI glitches, master camera kinematics, control hand anatomy, and direct cinema-grade multi-clip sequences in Botock, Sora, Kling, and Runway Gen-3.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-6">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <Award className="w-4 h-4" /> Official Botock Research Publication
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>25 Complete Chapters</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>9 Core Architectural Blocks</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>25 Ready-to-Use Templates</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>35 Min Read</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Photorealistic Master Hero Image */}
        <div className="mb-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-950">
          <div className="relative aspect-video w-full">
            <Image
              src="/images/blog/ai-video-prompt-handbook-hero.jpg"
              alt="High-end cinema camera with prompt engineering data matrices and optical tracking grids"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="p-4 bg-slate-950/90 border-t border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400 shrink-0" />
              <span><strong>Production Blueprint:</strong> Full-spectrum cinematography optics, depth tracking, and prompt parameter injection</span>
            </span>
            <span className="font-mono text-slate-500 text-[11px]">Format: 2.39:1 Anamorphic • Latent Physics Engine</span>
          </div>
        </div>

        {/* Dedicated Deep Dive Cluster Callouts (The Broken Down Sub-Blogs) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-500" />
              Specialized Deep-Dive Hubs (Cluster Guides)
            </h2>
            <span className="text-xs font-semibold text-slate-500">3 Modular Guides</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            For granular prompt lists, specialized physics tables, and direct copy-paste syntax, explore each dedicated deep-dive guide:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cluster 1 */}
            <Link
              href="/blog/ai-video-camera-movements-angles-guide"
              className="group p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216] hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-white/5">
                  <Image
                    src="/images/blog/ai-camera-movements-angles.jpg"
                    alt="Camera movements"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                  Kinematics & Lens Framing
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2 group-hover:text-blue-500 transition-colors">
                  Camera Movements & Angles Guide
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  Pans, tilts, dollies, tracking shots, vertigo zoom, Dutch angles, and speed calibration tables.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Read Full Camera Guide</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Cluster 2 */}
            <Link
              href="/blog/ai-video-actions-body-gestures-prompt-guide"
              className="group p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216] hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-white/5">
                  <Image
                    src="/images/blog/ai-character-action-blocking.jpg"
                    alt="Character Action Blocking"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                  Anatomy & Choreography
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2 group-hover:text-purple-500 transition-colors">
                  Actions & Body Gestures Guide
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  Fix 6-finger flaws, anchor hand grips, eyeline shifts, posture transitions, and fight scene action beats.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>Read Full Gestures Guide</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Cluster 3 */}
            <Link
              href="/blog/ai-video-cinematic-lighting-optics-guide"
              className="group p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216] hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-white/5">
                  <Image
                    src="/images/blog/ai-cinematic-lighting-optics.jpg"
                    alt="Cinematic Lighting"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  Optics & Atmosphere
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2 group-hover:text-amber-500 transition-colors">
                  Cinematic Lighting & Optics Guide
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  Anamorphic bokeh, focal length selection (24mm vs 85mm), golden hour rim lighting, and volumetric fog.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Read Full Lighting Guide</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Section: The 9 Blocks Architecture */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              9
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              The 9 Core Blocks of an AI Video Prompt
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Every high-fidelity prompt in modern generative models (Botock, Kling 1.5, Sora, Luma Dream Machine, Runway Gen-3) is constructed from nine distinct semantic building blocks. Leaving any block undefined forces the model to hallucinate random values.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-blue-500">BLOCK 01</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Shot Size & Framing</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Wide shot, full shot, medium close-up, macro.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-blue-500">BLOCK 02</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Subject Identity & Anchor</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Exact age, gender, clothing texture, hair color.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-blue-500">BLOCK 03</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Starting Coordinate Pose</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seated at frame-left, facing frame-right.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-purple-500">BLOCK 04</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">The Single Action Beat</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Only ONE atomic physical change during clip.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-purple-500">BLOCK 05</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Movement Vector & Speed</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direction, displacement, velocity (e.g. slow, 1 m/s).</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-purple-500">BLOCK 06</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Camera Kinematics & Lens</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tripod static, dolly in, tracking shot, 50mm lens.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-amber-500">BLOCK 07</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Lighting & Environment</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Golden hour rim light, volumetric fog, rainy reflections.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-amber-500">BLOCK 08</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Audio / Dialogue / Silence</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Exact line in quotes, room tone, &quot;No music&quot;.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="text-xs font-mono font-bold text-rose-500">BLOCK 09</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">Exclusion Constraints</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No camera motion, no talking, no smiling.</p>
            </div>
          </div>
        </section>

        {/* Section: The Subject Map & Left/Right Table */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-500" />
            The Subject Map: Audience Perspective vs. Character Perspective
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            The #1 reason AI models place characters or actions on the wrong side is ambiguous directional language. Use the standard spatial conventions below:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-3 px-4">Directive Term</th>
                  <th className="py-3 px-4">Precise Spatial Meaning</th>
                  <th className="py-3 px-4">Handbook Writing Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">frame-left / frame-right</td>
                  <td className="py-3 px-4">Left and right as the AUDIENCE views the display screen.</td>
                  <td className="py-3 px-4 text-xs">Always use &quot;frame-left&quot; to anchor positions on screen.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">character&apos;s right hand</td>
                  <td className="py-3 px-4">The character&apos;s biological anatomical hand. (Appears on frame-left if facing camera).</td>
                  <td className="py-3 px-4 text-xs">Write &quot;the character&apos;s right hand&quot; for body mechanics.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">moves toward frame-right</td>
                  <td className="py-3 px-4">Linear motion vector across the screen.</td>
                  <td className="py-3 px-4 text-xs">Never say &quot;moves right&quot;. Always qualify with &quot;frame-right&quot;.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">Person A, Person B</td>
                  <td className="py-3 px-4">Neutral semantic identifiers to prevent role blending.</td>
                  <td className="py-3 px-4 text-xs">Give each character a distinct identifier and unique wardrobe color.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Motion Intensity Words Table */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-500" />
            Motion Intensity Calibration Table
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            AI video generators tend to over-animate emotions and gestures. To control subtle acting, calibrate with exact intensity vocabulary:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-3 px-4">Intensity Keyword</th>
                  <th className="py-3 px-4">Target Motion Scope</th>
                  <th className="py-3 px-4">Cinematic Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Imperceptible</td>
                  <td className="py-3 px-4">A tiny shift restricted only to the iris and pupil.</td>
                  <td className="py-3 px-4 text-xs">Subconscious tension, suppressed panic, deep concentration.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Subtle</td>
                  <td className="py-3 px-4">Quiet, realistic human acting; slight corner-of-mouth lift.</td>
                  <td className="py-3 px-4 text-xs">Photorealistic natural drama; avoids cartoonish grins.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Moderate</td>
                  <td className="py-3 px-4">Clear to any viewer; deliberate nodding or head turn.</td>
                  <td className="py-3 px-4 text-xs">Standard conversational action and reaction shots.</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Restrained</td>
                  <td className="py-3 px-4">High emotional intensity held under strict muscular control.</td>
                  <td className="py-3 px-4 text-xs">Grief, jaw clenching, anger held back.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Audio, Dialogue & Sound Design */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-pink-500" />
            Dialogue, Voice & Sound Design Syntax
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Modern video generation platforms integrate audio generation directly. Without strict sound constraints, models generate generic synth music and unintelligible gibberish chatter:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center gap-2 text-pink-500 font-bold text-xs uppercase mb-2">
                <Volume2 className="w-4 h-4" /> Dialogue Constraints
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li>• <strong>One speaker only:</strong> Never request two people talking in a 5-second clip.</li>
                <li>• <strong>Exact quoted lines:</strong> Place spoken dialogue in exact quotes: <code>&quot;We have to leave now.&quot;</code></li>
                <li>• <strong>Vocal delivery:</strong> Specify pitch, speed, and timbre: <code>whispered in a low husky voice</code>.</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase mb-2">
                <VolumeX className="w-4 h-4" /> Sound Exclusion Directives
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li>• <strong>No music:</strong> Always state <code>AUDIO: No music. Ambient room tone only.</code> to stop cheap synth loops.</li>
                <li>• <strong>No dialogue:</strong> Prevents silent characters from moving their lips like fish.</li>
                <li>• <strong>Foley precision:</strong> Name exact physical impacts: <code>heavy leather boots crunching on wet gravel</code>.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: 25 Ready-to-Use Production Templates */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              Production Template Library (T1 - T25)
            </h2>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 font-bold">25 Templates</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Plug-and-play prompt structures taken straight from Chapter 23 of the handbook. Replace the bracketed variables with your narrative details:
          </p>

          <div className="space-y-4">
            {/* Template 1 */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">T2. Basic Image-to-Video Motion Anchor</span>
                <span className="text-[11px] font-mono text-blue-500">Image-to-Video</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-xs leading-relaxed">
                BASE IMAGE: [Describe starting image].<br />
                CAMERA: Locked-off tripod, zero movement, zero tilt, zero pan.<br />
                ACTION: [Character] shifts eyes from [Position A] to [Position B] over 3 seconds and stops. Nothing else changes.<br />
                NEGATIVE: No mouth movement. No blinking. No body posture shift.
              </div>
            </div>

            {/* Template 2 */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">T4. Solo Speaking Close-Up Shot</span>
                <span className="text-[11px] font-mono text-purple-500">Dialogue</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-xs leading-relaxed">
                CAMERA: Close-up on Person A. 50mm lens, eye-level, static tripod.<br />
                ACTION: Person A looks toward frame-left (never looking into lens) and delivers one line: &quot;[Exact spoken sentence]&quot;.<br />
                EXPRESSION: Subtle, restrained determination. Lips finish speaking at 4 seconds and remain closed.<br />
                AUDIO: Natural human voice, crisp room ambience. No soundtrack, no background music.
              </div>
            </div>

            {/* Template 3 */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">T13. Hand Action Insert (Anti-Glitch)</span>
                <span className="text-[11px] font-mono text-emerald-500">Macro Insert</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-xs leading-relaxed">
                CAMERA: Extreme close-up on the wooden tabletop. Macro 85mm lens, shallow depth of field.<br />
                ACTION: Person A&apos;s right hand enters from frame-right, index finger and thumb grip the brass fountain pen, and lift it 3 cm vertically.<br />
                ANATOMY: Exactly 5 fingers visible. Clean knuckles, firm grip around the pen shaft.<br />
                NEGATIVE: No morphing fingers, no floating pen, no camera motion.
              </div>
            </div>

            {/* Template 4 */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">T14. Cinematic Walking Tracking Shot</span>
                <span className="text-[11px] font-mono text-amber-500">Tracking</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-xs leading-relaxed">
                CAMERA: Steadicam leading shot, retreating backwards at steady walking speed 2 meters ahead of the character.<br />
                ACTION: Person A walks forward in a straight line through the wet street. Boots plant firmly on asphalt with physical weight transfer.<br />
                ENVIRONMENT: Steady light rain, asphalt reflecting street lamps, volumetric haze.<br />
                NEGATIVE: No moonwalking, no sliding feet, no camera wobble.
              </div>
            </div>
          </div>
        </section>

        {/* Section: The Complete 25-Chapter Directory */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Complete 25-Chapter Handbook Index
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Browse all 25 chapters from the official handbook. Click on chapters linked to our specialized cluster deep-dive guides:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHAPTERS.map((ch) => (
              <div
                key={ch.num}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 font-mono text-xs font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {ch.num}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {ch.title}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{ch.tag}</span>
                  </div>
                </div>
                {ch.link ? (
                  <Link
                    href={ch.link}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Deep Dive</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">In Master Guide</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: The 10 Golden Rules */}
        <section className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-400" />
            <h2 className="text-2xl font-black">The Ten Golden Rules of AI Video Prompting</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">1. One Clip, One Action Beat</span>
              Never ask for two major changes in 5 seconds. Split multi-action sequences into separate clips.
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">2. Anchor Hands to Rigid Physics</span>
              Never let hands hover in empty air. Anchor fingers to cups, handles, coats, or steering wheels.
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">3. Respect Audience Frame Orientation</span>
              Always specify &quot;frame-left&quot; and &quot;frame-right&quot; instead of vague &quot;left/right&quot;.
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">4. Eyes Lead the Head</span>
              In realistic human acting, the pupils shift first; the head turns second. Prompt them sequentially.
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">5. Enforce Camera Anchors</span>
              If the camera shouldn&apos;t move, explicitly state: &quot;Tripod locked-off, zero tilt, zero pan.&quot;
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">6. State What Does NOT Change</span>
              Tell the model what must stay static: &quot;Background remains still. Wardrobe remains unchanged.&quot;
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">7. Kill Default AI Music</span>
              Always specify &quot;AUDIO: No music&quot; to prevent loud generic synth audio generation.
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">8. Prevent The 4th-Wall Glitch</span>
              Explicitly instruct: &quot;Subject looks at Person B; never looks into the camera lens.&quot;
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">9. Use Real Film Optic Millimeters</span>
              Replace &quot;blurry background&quot; with &quot;85mm lens at f/1.8 with shallow depth of field and circular bokeh&quot;.
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">10. Stitch Using Last Frames</span>
              For perfect multi-clip video continuity, feed the exact last frame of Clip 1 as the starting seed for Clip 2.
            </div>
          </div>
        </section>

        {/* Footer CTAs */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Articles</span>
          </Link>
          <Link
            href="/blog/ai-video-camera-movements-angles-guide"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            <span>Dive Into Camera Movements Guide</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
