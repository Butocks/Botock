import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Video,
  Sparkles,
  Scissors,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Move,
  Type,
  Maximize2,
  Volume2,
  Compass,
  Play,
  RotateCw,
  Cpu,
  Lock,
  Flame,
  TrendingUp,
  FileVideo,
  Download,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Complete Guide to Botock Video Editor: Timeline, Motion Animation, Visual FX & WebAssembly Export | Botock Hub",
  description:
    "The definitive creator guide to Botock Video Editor. Discover why it was built, full feature breakdown (multi-track power hierarchy, resizable FX blocks, continuous zoom in/out, directional motion animations, typewriter text), step-by-step workflow, and zero-server client-side MP4 export.",
  alternates: {
    canonical: "/blog/complete-guide-to-botock-video-editor",
  },
  openGraph: {
    title: "The Complete Guide to Botock Video Editor: Timeline, Motion Animation & Visual FX",
    description:
      "Master private, browser-based video editing. In-depth manual covering multi-track timelines, visual effects blocks, directional motion paths, typewriter subtitles, and local WebAssembly rendering.",
    url: "https://botock.app/blog/complete-guide-to-botock-video-editor",
    type: "article",
    publishedTime: "2026-10-11T00:00:00Z",
    authors: ["Boto"],
    images: ["https://botock.app/images/blog/botock-video-editor.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Complete Guide to Botock Video Editor | Botock Hub",
    description:
      "Full creator manual for Botock Video Editor: Multi-track timeline, visual FX blocks, continuous zoom, directional motion paths, and private local export.",
    images: ["https://botock.app/images/blog/botock-video-editor.png"],
  },
};

export default function CompleteBotockVideoEditorGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "The Complete Guide to Botock Video Editor: Timeline, Motion Animation, Visual FX & WebAssembly Export",
        description:
          "The definitive creator guide to Botock Video Editor. Discover why it was built, full feature breakdown, step-by-step workflow, and zero-server client-side MP4 export.",
        image: "https://botock.app/images/blog/botock-video-editor.png",
        datePublished: "2026-10-11T00:00:00Z",
        dateModified: "2026-10-11T00:00:00Z",
        author: {
          "@type": "Person",
          name: "Boto",
        },
        publisher: {
          "@type": "Organization",
          name: "Botock AI",
          logo: {
            "@type": "ImageObject",
            url: "https://botock.app/logo.png",
          },
        },
      },
      {
        "@type": "HowTo",
        name: "How to Edit Videos in the Browser Using Botock Video Editor",
        description: "Step-by-step guide to assembling footage, applying visual FX blocks, adding directional motion paths, and exporting MP4 locally.",
        step: [
          {
            "@type": "HowToStep",
            name: "Upload Footage to Media Bin",
            text: "Drag and drop your video clips, photos, music, and GIFs into the Botock Media Bin.",
          },
          {
            "@type": "HowToStep",
            name: "Arrange Multi-Track Timeline",
            text: "Place your primary video on V1, secondary overlays on V2, and text on the Sub track.",
          },
          {
            "@type": "HowToStep",
            name: "Apply Visual FX and Drag Duration Handles",
            text: "Add an effect block to the FX track and drag its timeline handles to extend or shrink its duration.",
          },
          {
            "@type": "HowToStep",
            name: "Configure Directional Motion Animation",
            text: "Use the Motion tab to select movement directions (left, right, up, down, diagonal) with timer controls.",
          },
          {
            "@type": "HowToStep",
            name: "Add Subtitles and Typewriter Effects",
            text: "Type your captions and enable character-by-character typewriter animations with customizable speed.",
          },
          {
            "@type": "HowToStep",
            name: "Export to MP4 via WebAssembly",
            text: "Click Export Video to render crisp 1080p MP4 directly in your browser without server uploads.",
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog Hub
      </Link>

      {/* Header */}
      <header className="mb-12 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
          <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/30">
            Creator Guides &amp; Video Production
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            #VideoEditor
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            #TimelineFX
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            #MotionAnimation
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            #WebAssembly
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-auto">
            <Clock className="w-4 h-4" /> 15 min read
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            • October 11, 2026
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            • By Boto
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
          The Complete Guide to Botock Video Editor: Timeline, Motion Animation, Visual FX &amp; WebAssembly Export
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          High-performance video editing no longer requires multi-gigabyte software installs or sacrificing footage privacy to cloud servers. Meet the Botock Video Editor—a zero-install, privacy-first web studio engineered with multi-track power hierarchy, timeline FX blocks, continuous zooms, directional motion animations, and local WebAssembly rendering.
        </p>
      </header>

      {/* Hero Visual - Authentic Screenshot of the Actual Video Editor Page */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-6 border border-slate-200 dark:border-white/10 shadow-2xl bg-[#0d0d12]">
        <Image
          src="/images/blog/botock-video-editor.png"
          alt="Botock Video Editor timeline interface showing multi-track compositing, visual FX blocks, and motion path inspector"
          width={1440}
          height={900}
          priority
          className="w-full h-auto object-cover"
        />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-16 italic">
        Figure 1: Authentic interface of Botock Video Editor featuring multi-track power hierarchy (Sub, FX, V2, V1, Audio), timeline effect handles, directional motion paths, and real-time canvas rendering.
      </p>

      {/* Quick Launch CTA Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#ff6b4a]/15 via-pink-500/10 to-purple-500/15 border border-[#ff6b4a]/30 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-[#ff6b4a] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-4 h-4" /> Free Online Video Editor
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            Ready to Edit Videos Right in Your Browser?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Zero sign-up required. No watermarks. 100% private local processing with instant timeline feedback.
          </p>
        </div>
        <Link
          href="/tools/video-editor"
          className="px-6 py-3.5 rounded-2xl bg-[#ff6b4a] hover:bg-[#ff856b] text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#ff6b4a]/25 hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <span>Launch Video Editor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Content Body */}
      <article className="prose prose-slate dark:prose-invert max-w-none space-y-16">
        {/* SECTION 1: WHY BOTOCK VIDEO EDITOR WAS BUILT */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">The Vision</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                Why Was Botock Video Editor Built?
              </h2>
            </div>
          </div>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Content creation moves fast. Creators editing daily TikToks, YouTube Shorts, product promos, reaction clips, or educational walkthroughs are caught between two frustrating extremes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                <span>⚠️ Problem 1: Desktop Software Bloat</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Traditional non-linear editors (NLEs) like Adobe Premiere or DaVinci Resolve require 10GB+ downloads, complex installations, high-end dedicated GPUs, and steep subscription paywalls just to trim clips, add zooms, and animate stickers.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                <span>⚠️ Problem 2: Cloud Privacy &amp; Upload Lags</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cloud-based video editors force creators to upload confidential, raw 4K footage over slow internet connections to unknown cloud servers, locking final exports behind surprise subscription paywalls and watermarks.
              </p>
            </div>
          </div>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Botock Video Editor was built to eliminate both bottlenecks.</strong> It delivers desktop-grade editing features—including a multi-track power hierarchy timeline, dedicated FX tracks, 8-directional motion path animations, typewriter text, and continuous camera zooms—all inside your web browser. Powered by <strong>WebAssembly (WASM)</strong>, all media stays 100% on your local machine with zero server uploads and zero privacy risks.
          </p>
        </section>

        {/* SECTION 2: WHAT CAN YOU DO WITH IT? FEATURE BREAKDOWN */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">Capabilities</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                What Can You Do With It? Complete Feature Breakdown
              </h2>
            </div>
          </div>

          {/* Feature 1: Multi-Track Power Hierarchy Timeline */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
                1. Multi-Track Power Hierarchy Timeline
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Botock implements a strict <strong>power hierarchy compositing order</strong>. Every visual element renders in its correct natural stacking order so titles never get buried behind videos and effects apply where intended:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 not-prose">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
                <span className="text-[10px] font-mono text-purple-400 font-bold block">1. Top Priority</span>
                <span className="text-xs font-extrabold text-white">Sub / Text</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">Captions, Stickers</span>
              </div>
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center">
                <span className="text-[10px] font-mono text-pink-400 font-bold block">2. FX Layer</span>
                <span className="text-xs font-extrabold text-white">FX Track</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">Zooms, Glitch, Blur</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                <span className="text-[10px] font-mono text-blue-400 font-bold block">3. Overlays</span>
                <span className="text-xs font-extrabold text-white">V2 / PIP</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">GIFs, Memes, Reaction</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">4. Base Layer</span>
                <span className="text-xs font-extrabold text-white">V1 Footage</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">Main Video Media</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">5. Audio</span>
                <span className="text-xs font-extrabold text-white">A1 / A2</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">Music &amp; Voiceover</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Visual Effects Track & Resizable Duration Handles */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
                2. Visual Effects Track with Interactive Duration Handles
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike basic web editors where effects are applied blindly to whole clips, Botock features a <strong>dedicated FX track</strong> directly on the timeline. When you click any visual effect, an adjustable 2.0-second block is inserted at your current playhead position.
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
              <li>
                <strong>Draggable Duration Handles:</strong> Grab the pink handles on either side of the effect block directly on the timeline to extend or shrink its duration (&ldquo;kam ya zyada kerna&rdquo;).
              </li>
              <li>
                <strong>Effect Inspector:</strong> Clicking any effect block opens the <em>Effect Block Settings</em> to adjust intensity from 0% to 250%, switch effect presets on the fly, or test-play the range.
              </li>
              <li>
                <strong>Instant Keyboard Deletion:</strong> Tap <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-mono">Delete</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-mono">Backspace</kbd> to remove an effect block without touching the underlying video.
              </li>
            </ul>
          </div>

          {/* Feature 3: Continuous Zoom vs Smooth Zoom */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
                3. Continuous Zoom vs. Smooth Zoom (Deep Dive)
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Camera zooms are critical for engaging content, but different scenes require different zoom kinetics. Botock offers two distinct zoom modes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  🔍 Continuous Zoom In &amp; Out
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Steady linear push/pull:</strong> Keeps zooming deeper and deeper constantly for as long as the effect block lasts on the timeline without slowing down or flattening out. Perfect for building suspense, dramatic reveals, and documentary pushes.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-2">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  🔎 Smooth Zoom In &amp; Out
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Cinematic S-Curve Ease:</strong> Accelerates gracefully at the start and gently decelerates into a settled zoom position. Ideal for vlog transitions, punchy punch-ins on punchlines, and focal point shifts.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4: Directional Motion Studio */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
                4. Dedicated Directional Motion Studio
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Completely separated from transitions, the <strong>Motion</strong> tab gives you PowerPoint-style kinetic motion paths for any element—videos, images, meme GIFs, stickers, and subtitles:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose">
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#2b2b36] space-y-1">
                <span className="text-xs font-bold text-amber-400 block">🧭 8-Directional Presets</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Select Left, Right, Up, Down, Up-Left, Up-Right, Down-Left, Down-Right from the dropdown or 3x3 compass pad.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#2b2b36] space-y-1">
                <span className="text-xs font-bold text-amber-400 block">⏱️ Motion Timer Controls</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Set exact motion duration (e.g., 1.5s) and start delay offset. The timeline clip renders a visual amber motion progress strip.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#2b2b36] space-y-1">
                <span className="text-xs font-bold text-amber-400 block">⚡ Trajectory Curves</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Choose Straight Line, Arc Curve ↷, or Zigzag ⚡ with optional &ldquo;Rotate in flight direction&rdquo; alignment.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 5: Typewriter Subtitles & Kinetic Text */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
                5. Typewriter Subtitles &amp; Kinetic Text Animations
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Viewers retain 80% more information when subtitles animate dynamically. Botock includes a native <strong>Typewriter effect</strong> with an adjustable speed slider (characters per second), alongside kinetic slide entrances (Left-to-Right, Bottom-to-Top, Pop In, Fade In). Emoji stickers render in full native color without distorted borders.
            </p>
          </div>

          {/* Feature 6: Scene Transitions & Cuts */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
                6. Scene Transitions Studio (In &amp; Out Cuts)
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Scene transitions strictly manage cuts between footage. Configure independent <strong>In</strong> (entrance) and <strong>Out</strong> (exit) transitions with customizable durations: Crossfade, Dip to Black/White, Directional Slides, Zoom In/Out, <strong>Curtain Wipe</strong>, <strong>Mirror Flip</strong>, and <strong>Bouncing Pop</strong>.
            </p>
          </div>

          {/* Feature 7: WebAssembly 100% Private Export */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
                7. 100% Private Client-Side WebAssembly Export
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every pixel is rendered locally by your browser&apos;s WebAssembly engine. No watermarks are applied, no queue lines exist, and your private videos never touch a remote server. You get clean, high-bitrate 1080p MP4 exports ready for instant publishing.
            </p>
          </div>
        </section>

        {/* SECTION 3: STEP-BY-STEP USER WORKFLOW */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Tutorial</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                How to Use Botock Video Editor (Step-by-Step)
              </h2>
            </div>
          </div>

          <div className="space-y-4 not-prose">
            {[
              {
                step: "01",
                title: "Import Your Media",
                desc: "Open the Media Bin on the left and upload your videos, photos, voice recordings, or GIFs. You can also paste YouTube or external video links.",
              },
              {
                step: "02",
                title: "Add Media to Timeline Tracks",
                desc: "Click (+) on V1 to place your base video. Add secondary footage, GIFs, or reaction overlays to the V2 track for picture-in-picture compositing.",
              },
              {
                step: "03",
                title: "Trim and Split Clips",
                desc: "Scrub the playhead to any timestamp and click the Scissors (Split) icon. Drag the clip edges to trim in/out points with magnetic snapping.",
              },
              {
                step: "04",
                title: "Place Visual FX on the FX Track",
                desc: "Click any effect in the Effects tab (such as Continuous Zoom In or Glitch). It places a 2.0s block on the FX track. Drag its handles to adjust duration.",
              },
              {
                step: "05",
                title: "Animate Movement with the Motion Tab",
                desc: "Select any sticker, GIF, text, or overlay. Open the Motion tab, choose Move, pick your direction (e.g., Left to Right), and configure the timer.",
              },
              {
                step: "06",
                title: "Add Animated Subtitles & Audio",
                desc: "Add text to the Sub track, enable Typewriter speed, and add background music or record a voiceover on audio track A1.",
              },
              {
                step: "07",
                title: "Export High-Quality MP4",
                desc: "Select your desired canvas aspect ratio (16:9 for YouTube or 9:16 for TikTok/Shorts) and click Export Video. Download your final MP4 instantly.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10"
              >
                <span className="text-lg font-black font-mono text-[#ff6b4a] shrink-0 pt-0.5">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: REAL-WORLD USE CASES */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">Target Audience</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                Who Is It For &amp; Real-World Use Cases
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📱 Short-Form Creators (TikTok, Shorts, Reels)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Quickly assemble 9:16 vertical videos, add punchy continuous camera zooms during key moments, animate floating reaction stickers, and generate typewriter captions without firing up a heavy desktop editor.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎙️ Commentary &amp; Reaction Channels</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Layer your webcam reaction on V2 above the source gameplay or podcast on V1. Add impact shakes, anime speed lines, and directional motion paths to meme pop-ups.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🛍️ E-Commerce &amp; Product Marketers</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Create engaging product showcases by slowly continuous-zooming on product features, sliding discount callout badges across the screen, and adding clean audio tracks.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎓 Educators &amp; Tutorial Creators</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Record voiceovers directly in the editor, slide pointers or arrows across diagrams using the Motion compass, and guide students with typewriter code or text annotations.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: COMPARISON TABLE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Comparison</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                Botock Video Editor vs. Alternatives
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto not-prose my-6">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold">
                <tr>
                  <th className="p-3.5">Feature</th>
                  <th className="p-3.5 text-[#ff6b4a]">Botock Video Editor</th>
                  <th className="p-3.5">Heavy Desktop NLEs</th>
                  <th className="p-3.5">Cloud Web Editors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="p-3.5 font-semibold">Installation Required</td>
                  <td className="p-3.5 text-emerald-500 font-bold">None (Runs in Browser)</td>
                  <td className="p-3.5 text-rose-400">10GB+ Download</td>
                  <td className="p-3.5 text-emerald-500">None</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Footage Privacy</td>
                  <td className="p-3.5 text-emerald-500 font-bold">100% Local (WASM)</td>
                  <td className="p-3.5 text-emerald-500 font-bold">100% Local</td>
                  <td className="p-3.5 text-rose-400">Uploaded to Cloud Servers</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Timeline FX Handles</td>
                  <td className="p-3.5 text-emerald-500 font-bold">Yes (Dedicated FX Track)</td>
                  <td className="p-3.5">Complex Keyframe Graphs</td>
                  <td className="p-3.5 text-rose-400">Rarely / Clip-wide only</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Continuous Linear Zoom</td>
                  <td className="p-3.5 text-emerald-500 font-bold">Yes (1-Click Preset)</td>
                  <td className="p-3.5">Manual Curves Required</td>
                  <td className="p-3.5 text-rose-400">No</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">8-Way Motion Compass</td>
                  <td className="p-3.5 text-emerald-500 font-bold">Yes (Directional Compass)</td>
                  <td className="p-3.5">Manual X/Y Keyframing</td>
                  <td className="p-3.5 text-rose-400">Basic Presets Only</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Cost &amp; Watermarks</td>
                  <td className="p-3.5 text-emerald-500 font-bold">Free &amp; No Watermarks</td>
                  <td className="p-3.5 text-rose-400">$20 - $50/mo Subscription</td>
                  <td className="p-3.5 text-rose-400">Export Paywall / Watermark</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6: CONCLUSION & CALL TO ACTION */}
        <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#161622] via-[#14141c] to-[#0a0a0e] border border-white/10 text-center space-y-6 not-prose shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#ff6b4a]/20 text-[#ff6b4a] flex items-center justify-center mx-auto border border-[#ff6b4a]/30">
            <Video className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Create Your Next Video in Seconds
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience the power of multi-track editing, continuous zooms, timeline FX handles, and directional motion paths right from your browser.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tools/video-editor"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#ff6b4a] hover:bg-[#ff856b] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#ff6b4a]/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Open Botock Video Editor</span>
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-colors"
            >
              Browse All 30+ Tools
            </Link>
          </div>
        </section>
      </article>

      {/* Footer Navigation */}
      <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/blog"
          className="hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          ← Back to All Articles
        </Link>
        <span>Botock Hub • Created by Boto • Private Client-Side Tools</span>
      </footer>
    </div>
  );
}
