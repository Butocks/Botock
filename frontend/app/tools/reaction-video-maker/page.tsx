import { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Smartphone,
  Sparkles,
  Zap,
  Volume2,
  Share2,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolLoader } from "@/components/ui/ToolLoader";

const ReactionVideoClient = dynamic(() => import("./Client"), {
  loading: () => <ToolLoader message="Loading Reaction Video Maker..." />,
});

export const metadata: Metadata = {
  title: "AI Reaction Video Maker (Top & Bottom Split Video) | Botock AI",
  description:
    "Free online reaction video maker. Combine two videos into a stacked top/bottom or side-by-side format for TikTok, Instagram Reels, and YouTube Shorts. Customize aspect ratios (9:16, 16:9), adjust audio volumes, and export in HD.",
  keywords: [
    "reaction video maker",
    "split screen video creator",
    "stacked video editor",
    "top bottom video maker",
    "tiktok reaction video",
    "youtube shorts reaction maker",
    "dual video editor online",
    "combine two videos split screen",
    "free reaction video maker",
  ],
  alternates: {
    canonical: "https://botock.app/tools/reaction-video-maker",
  },
  openGraph: {
    title: "AI Reaction Video Maker (Split & Stacked Video) | Botock AI",
    description:
      "Stack facecam over gameplay or memes in 9:16 vertical video format. Create viral Shorts & Reels with zero watermark.",
    url: "https://botock.app/tools/reaction-video-maker",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Reaction Video Maker - Botock AI",
    description:
      "Combine two videos into top-bottom stacked or split-screen format for viral social content.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ReactionVideoMakerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Botock AI Reaction Video Maker",
        operatingSystem: "All",
        applicationCategory: "MultimediaApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Free online tool to combine two videos into stacked top-bottom or side-by-side split screen videos for TikTok, Reels, and YouTube Shorts.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I make a reaction video with two videos stacked?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Upload your main video (gameplay, podcast, or meme) into the Top slot and your reaction facecam into the Bottom slot. Select the 9:16 aspect ratio for vertical Shorts/Reels, choose your audio mixing preference, and click Create Reaction Video.",
            },
          },
          {
            "@type": "Question",
            name: "Can I adjust individual audio volume for both videos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Botock allows you to mix both audio tracks with independent volume sliders, choose top-only audio, reaction-only audio, or mute both completely.",
            },
          },
          {
            "@type": "Question",
            name: "What aspect ratios are supported?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can create videos in 9:16 (TikTok, Reels, Shorts), 16:9 (YouTube Landscape), 1:1 (Square), and 4:5 (Portrait Feed).",
            },
          },
          {
            "@type": "Question",
            name: "Can I add subtitles or further edit the reaction video after export?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Once exported, Botock offers instant 1-click continuation into AI Subtitles, Audio Enhancer, Voice Changer, or the Multi-Track Video Studio without re-uploading.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool Client wrapped in Crash Boundary */}
      <div className="flex-1 bg-background">
        <ToolErrorBoundary toolName="Reaction Video Maker">
          <ReactionVideoClient />
        </ToolErrorBoundary>
      </div>

      {/* Informational / SEO Value Sections */}
      <section className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Feature Highlights */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Why Creators Choose Botock Reaction Video Maker
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to produce viral, high-retention split-screen and stacked videos in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Built for Shorts, TikTok &amp; Reels</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Native 9:16 vertical resolution with smart automatic scaling and center crop. Stack gameplay above your webcam for unmatched mobile viewer engagement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Flexible Layout &amp; Split Ratios</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose 50/50 equal splits, 60/40, or 70/30 dominant view. Switch between vertical stack, side-by-side, or corner picture-in-picture with one click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Dual Audio Balance &amp; Next Actions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Mix commentary and gameplay audio with fine-grained volume controls. Jump directly into AI Subtitles or Voice Changer after exporting.
              </p>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">
              How to Make a Stacked Reaction Video in 3 Easy Steps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="text-sm font-extrabold text-pink-500">STEP 1</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Upload Your Two Clips</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Drop your main clip (gameplay, podcast snippet, or meme) into the Top box, and your face reaction video into the Bottom box.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-extrabold text-pink-500">STEP 2</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Configure Layout &amp; Sound</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select your aspect ratio (9:16 vertical or 16:9 wide), choose split percentages, and balance the volume sliders so your voice is crisp.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-extrabold text-pink-500">STEP 3</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Export &amp; Continue Editing</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Click Create Reaction Video. Download your final MP4 or continue directly to add auto subtitles and voice effects with one click.
                </p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-pink-500 shrink-0" />
                  Is the Botock Reaction Video Maker free?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Yes, 100% free with no forced watermarks. You can combine and export high-definition videos anytime.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-pink-500 shrink-0" />
                  What happens if my videos are different lengths?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  By default, the exported video aligns smoothly to the shortest video duration to ensure both videos are always visible and synchronized.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-pink-500 shrink-0" />
                  Can I generate automatic subtitles for the exported video?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Yes! Right after exporting, simply click the &quot;Add Subtitles&quot; suggestion card to open our AI Whisper speech-to-text tool with your reaction video already loaded.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-pink-500 shrink-0" />
                  Which formats can I upload?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  MP4, MOV, WebM, MKV, and AVI are fully supported up to 100MB per file.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
