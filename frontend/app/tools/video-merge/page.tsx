import type { Metadata } from "next";
import Link from "next/link";
import { Film, CheckCircle2, Music, Layers, ArrowUpDown, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const VideoMergeClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Loading Video Merger Engine...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Merge Videos Online Free – Combine Clips & Add Audio | Botock",
  description:
    "Merge multiple video clips into one seamless video for free. Reorder clips, preview scenes, inject custom background music or audio, and download MP4 with zero watermarks.",
  keywords: [
    "merge videos online",
    "video merger free",
    "combine videos into one",
    "video joiner online",
    "add audio to merged video",
    "join mp4 clips",
    "merge video with music",
    "reorder video clips",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/video-merge",
  },
  openGraph: {
    title: "Merge Videos Online Free – Combine Clips & Add Audio | Botock",
    description:
      "Combine MP4, MOV, and WebM video clips into one continuous video. Reorder clips, add custom soundtrack, and download without watermarks.",
    url: "https://botock.app/tools/video-merge",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge Videos Online Free | Botock",
    description: "Combine multiple video clips, reorder scenes, add background audio, and export.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoMergePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Online Video Merger",
        url: "https://botock.app/tools/video-merge",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        description:
          "Combine multiple video files into one video, rearrange clip sequences, and inject or mix custom background audio tracks.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://botock.app" },
          { "@type": "ListItem", position: 2, name: "Tools", item: "https://botock.app/tools" },
          { "@type": "ListItem", position: 3, name: "Merge Videos", item: "https://botock.app/tools/video-merge" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I merge multiple video clips together?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Upload your video clips into Botock Video Merger, preview each clip, sort them in your preferred sequence using the up/down buttons, optionally add background music, and click Merge Videos.",
            },
          },
          {
            "@type": "Question",
            name: "Can I add my own background music or audio to the merged video?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! In Step 2, you can upload any MP3, WAV, AAC, or M4A audio file. You can choose whether to replace the original video sounds or mix your music together with the original audio.",
            },
          },
          {
            "@type": "Question",
            name: "Can I merge videos with different sizes or resolutions?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Botock automatically normalizes different aspect ratios, dimensions, and frame rates so your clips merge into a consistent 16:9, 9:16 vertical, 1:1 square, or original layout without distortion.",
            },
          },
          {
            "@type": "Question",
            name: "Is this video merger free and without watermarks?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Botock Video Merger is 100% free with no watermarks, no registration required, and fast direct downloads.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold mb-4">
          <Film className="w-4 h-4" />
          <span>Multi-Clip Joiner • Custom Audio • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          Merge Videos Online Free
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Combine multiple MP4, MOV, and WebM video clips into a single video. Check and rearrange clip order, inject your own background music or voiceover, and download without watermarks.
        </p>
      </div>

      {/* Interactive Tool Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="Video Merger">
            <VideoMergeClient />
          </ToolErrorBoundary>
        </div>

        {/* Structured SEO & Internal Link Footer Section */}
        <ToolSeoSection
          toolName="Merge Videos Online"
          category="Video Utility"
          description="Botock Video Merger enables creators, editors, and social media influencers to stitch multiple video clips into one cohesive presentation. Equipped with multi-video sorting, aspect ratio standardization, and dual-track audio mixing, you can easily produce YouTube compilations, TikTok montages, and Instagram Reels in seconds."
          steps={[
            {
              title: "1. Upload & Inspect Videos",
              description: "Drag and drop your video files into the upload box. Watch previews of each clip and review duration and resolution.",
            },
            {
              title: "2. Reorder & Add Audio",
              description: "Use the Up/Down buttons to sort your clips in the exact order you want. Optionally upload background music or a voiceover track.",
            },
            {
              title: "3. Merge & Download MP4",
              description: "Select your preferred aspect ratio (16:9, 9:16, 1:1, or Original) and click Merge to download your finalized video.",
            },
          ]}
          features={[
            {
              title: "Intuitive Clip Reordering",
              description: "Move clips earlier or later with 1-click controls, check thumbnail previews, and ensure your story flows logically.",
            },
            {
              title: "Custom Audio & Music Blending",
              description: "Inject background songs or voiceovers. Replace original camera noise or mix audio tracks with custom volume sliders.",
            },
            {
              title: "Aspect Ratio Normalization",
              description: "Seamlessly joins videos of differing dimensions and framerates into a clean, uniform output format.",
            },
            {
              title: "100% Free & No Watermarks",
              description: "Export high-definition MP4 videos without brand overlays, file count penalties, or subscription fees.",
            },
          ]}
          faqs={[
            {
              question: "How do I check which video is which before merging?",
              answer: "Each uploaded video clip features an inline preview player. Click Play on any clip to inspect its content, duration, and file size before finalizing your merge order.",
            },
            {
              question: "Can I add music and keep original video sound at the same time?",
              answer: "Yes! Choose the 'Mix with Video Audio' option in Step 2. You can then adjust the volume slider for your music and the video sound to achieve the perfect balance.",
            },
            {
              question: "What happens if my clips have different sizes?",
              answer: "Botock automatically scales and pads all clips to match your selected aspect ratio (16:9 landscape, 9:16 vertical, or first video match), ensuring smooth playback without stretched or distorted footage.",
            },
            {
              question: "Is there any watermark on the output video?",
              answer: "No. Botock never places watermarks or logos on your exported videos. You retain 100% ownership of your content.",
            },
          ]}
          relatedTools={[
            { name: "Video Cutter & Trimmer", href: "/tools/video-trim" },
            { name: "Mute Video Online", href: "/tools/video-mute" },
            { name: "Compress Video", href: "/tools/video-compress" },
            { name: "AI Reaction Video Maker", href: "/tools/reaction-video-maker" },
            { name: "Video Converter", href: "/tools/video-convert" },
          ]}
        />
      </main>
    </div>
  );
}
