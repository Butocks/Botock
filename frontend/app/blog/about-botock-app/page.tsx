import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Image as ImageIcon,
  FileText,
  Volume2,
  Code2,
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Botock: Built by a Web Developer, Vibe Coding & The Doc Ock Story | Botock Hub",
  description:
    "The story behind Botock: created by a web developer while vibe coding, completely costless tools with or without login, and the Doc Ock Spider-Man origin of our name.",
  alternates: {
    canonical: "/blog/about-botock-app",
  },
  openGraph: {
    title: "About Botock: Built by a Web Developer, Vibe Coding & The Doc Ock Story",
    description:
      "Learn the honest story behind Botock: built by a solo web developer while vibe coding, 100% costless tools, and the Spider-Man Doc Ock name origin.",
    url: "https://botock.app/blog/about-botock-app",
    type: "article",
    publishedTime: "2026-10-04T00:00:00Z",
    authors: ["Boto"],
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Botock: Built by a Web Developer | Botock Hub",
    description:
      "The story behind Botock: created while vibe coding, costless tools with or without login, and the Doc Ock name origin.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function AboutBotockApp() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: "About Botock: Built by a Web Developer, Vibe Coding & The Doc Ock Story",
        description:
          "The genuine developer story behind Botock: vibe coding, costless in-browser tools, and the Doc Ock name origin.",
        author: {
          "@type": "Person",
          name: "Boto",
        },
        datePublished: "2026-10-04",
        publisher: {
          "@type": "Organization",
          name: "Botock",
          logo: {
            "@type": "ImageObject",
            url: "https://botock.app/logo.png",
          },
        },
        mainEntityOfPage: "https://botock.app/blog/about-botock-app",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://botock.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://botock.app/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "About Botock",
            item: "https://botock.app/blog/about-botock-app",
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="w-full bg-white dark:bg-[#111114] border-b border-slate-200 dark:border-white/10 px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-amber-500 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blog Hub
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
              News &amp; Trends
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              #FounderStory
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              #WebDevelopment
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              #VibeCoding
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            About Us: The Story Behind Botock
          </h1>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span>By Boto</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>October 4, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 6 min read
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert prose-slate prose-headings:font-black prose-a:text-amber-500 hover:prose-a:text-amber-400">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 lead">
          Hi, I am a web developer. Botock was created during late-night &quot;vibe coding&quot; sessions, and I ended up publishing it live for the world to use.
        </p>

        <p>
          I love exploring modern web technologies, WebAssembly, browser audio/video manipulation, and AI models. One day while coding in the zone, I started piecing together practical media utilities that solve real digital headaches: converting horizontal videos to vertical shorts, removing video backgrounds without green screens, straightening batch photo dumps, and filling PDF forms directly in the browser.
        </p>

        <p>
          Before I knew it, those individual experiments grew into an entire cohesive creative platform. I decided to put it online so that anyone on the web can take advantage of it.
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        {/* Section: The Name */}
        <h2>What Does the Name &quot;Botock&quot; Mean?</h2>
        <p>
          You might wonder why on earth I picked such an unusual name like <strong>&quot;Botock&quot;</strong>. At first glance, you might think: <em>&quot;What a strange, quirky name! Where did that come from?&quot;</em>
        </p>
        <p>
          Here is the honest backstory: The name is inspired by Spider-Man&apos;s legendary villain, <strong>Doc Ock</strong> (Doctor Octopus).
        </p>
        <div className="not-prose my-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-3 mb-2 font-black text-lg text-amber-600 dark:text-amber-400">
            <Bot className="w-6 h-6" />
            The Formula: AI Bot + Doc Ock = Botock
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            All the heavy lifting on this platform—from background segmentation and acoustic noise filtering to text summarization and 4K upscaling—is executed by intelligent <strong>AI bots</strong> and background algorithmic agents. Combining <strong>&quot;Bot&quot;</strong> with the punchy cadence of <strong>&quot;Ock&quot;</strong> gave birth to <strong>Botock</strong>.
          </p>
        </div>
        <p>
          I really liked how memorable and distinct it sounded. It was catchy, original, and true to the technology behind it—so the name stuck!
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        {/* Section: Costless & Login Freedom */}
        <h2>100% Costless — Use With or Without Login</h2>
        <p>
          The services and tools on Botock are completely <strong>costless</strong>. There are no credit cards required, no trial expiration countdowns, and no hidden subscriptions.
        </p>
        <p>
          Even better: <strong>You can use these tools whether you choose to log in or use them completely without logging in.</strong>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 not-prose">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <UserCheck className="w-6 h-6 text-emerald-500 mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Zero Login Barrier
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Need to rotate 50 photos or crop a quick video? Drop your files and get your download instantly without creating an account.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <ShieldCheck className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Client-Side Privacy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Most tools process directly inside your browser via WebAssembly and Canvas. Your private media stays on your device.
            </p>
          </div>
        </div>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        {/* Section: Maintained Daily */}
        <h2>Actively Maintained Daily</h2>
        <p>
          Because I built this platform myself, <strong>I actively keep an eye on it every single day</strong>.
        </p>
        <p>
          I watch the error telemetry, test video encoding filters, fine-tune audio algorithms, verify PDF compatibility, and continually push speed improvements. If a browser update changes how Web Audio API works or if a user discovers an orientation bug on newer smartphone videos, I am right there debugging and fixing it.
        </p>
        <p>
          This is an active, living platform crafted with care.
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        {/* Section: What's Available */}
        <h2>What Can You Do on Botock?</h2>
        <p>
          Here is a quick look at the core tool suites ready for you right now:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 not-prose">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <Video className="w-7 h-7 text-sky-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">
              AI Video Studio
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Auto-reframe horizontal clips to 9:16 Shorts, remove backgrounds without green screens, straighten crooked videos, and build stacked reaction videos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <Volume2 className="w-7 h-7 text-violet-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">
              Audio &amp; Voice Studio
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Remove background noise and fan hiss, generate deep narrator character voices with Neural Text-to-Speech, auto-transcribe subtitles, and extract 320kbps MP3s.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <ImageIcon className="w-7 h-7 text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">
              AI Image Suite
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Batch auto-straighten entire photo folders with 1-click ZIP export, upscale low-res graphics to 4K/8K with 200% Pixel Inspect, and remove image backgrounds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <FileText className="w-7 h-7 text-rose-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">
              Document &amp; PDF Suite
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extract executive briefs with PDF AI Summarizer (Beta), read in 3D flipbook mode, design interactive fillable AcroForms, and auto-align rotated scanned documents.
            </p>
          </div>
        </div>

        <div className="text-center p-8 mt-12 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <p className="text-2xl font-black text-slate-900 dark:text-white mb-3">
            Built for Creators, Powered by Code.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6">
            Everything here is open, fast, and costless. Use it, enjoy it, and make great things.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md"
          >
            Explore All Free Tools
            <Zap className="w-4 h-4" />
          </Link>
          <p className="text-xs text-slate-400 mt-4">— Built by Boto</p>
        </div>
      </div>
    </div>
  );
}
