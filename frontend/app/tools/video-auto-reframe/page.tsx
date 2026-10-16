import { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolLoader } from "@/components/ui/ToolLoader";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const Client = dynamic(() => import("./Client"), {
  loading: () => <ToolLoader message="Loading AI Video Auto-Reframe..." />,
});

export const metadata: Metadata = {
  title: "AI Video Auto-Reframe (Vertical 9:16 Crop) | Botock AI",
  description:
    "Automatically convert horizontal (16:9) videos into vertical (9:16) Reels, Shorts, or TikToks. AI detects the main subject and keeps them centered in frame.",
  keywords: [
    "video auto reframe",
    "convert horizontal to vertical video",
    "16:9 to 9:16 video",
    "ai video cropper",
    "reels video converter",
    "tiktok video auto crop",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/video-auto-reframe",
  },
  openGraph: {
    title: "AI Video Auto-Reframe (Vertical 9:16 Crop) | Botock AI",
    description: "Automatically convert horizontal (16:9) videos into vertical (9:16) Reels, Shorts, or TikToks. 100% free and automatic.",
    url: "https://botock.app/tools/video-auto-reframe",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Auto-Reframe (Vertical 9:16 Crop) | Botock AI",
    description: "Automatically convert horizontal (16:9) videos into vertical (9:16) Reels, Shorts, or TikToks.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

const REFRAME_FAQS = [
  {
    question: "What does Video Auto-Reframe do?",
    answer: "It automatically converts landscape 16:9 widescreen videos into vertical 9:16 format suitable for TikTok, Instagram Reels, and YouTube Shorts by tracking moving subjects and keeping them in center view.",
  },
  {
    question: "How does subject tracking work?",
    answer: "Our computer vision model identifies primary focal points (faces, people, sports action) and pans the vertical crop window smoothly across frames without sudden jumps.",
  },
  {
    question: "Does it reduce video resolution or clarity?",
    answer: "No. The output retains high definition (1080x1920) matching the original source resolution with clean H.264 video compression.",
  },
  {
    question: "Can I use it on mobile phones?",
    answer: "Yes, Botock Video Auto-Reframe is optimized for mobile browsers, tablets, and desktop computers.",
  },
];

export default function VideoAutoReframePage() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <ToolJsonLd
        name="AI Video Auto-Reframe"
        description="Convert widescreen 16:9 videos into vertical 9:16 videos for TikTok, Shorts, and Reels with intelligent subject tracking."
        url="/tools/video-auto-reframe"
        applicationCategory="MultimediaApplication"
        faqs={REFRAME_FAQS}
        featureList={[
          "Intelligent subject tracking",
          "One-click 16:9 to 9:16 vertical conversion",
          "Smooth camera panning algorithm",
          "Export directly to Reels and Shorts format",
        ]}
      />

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
        <ToolErrorBoundary toolName="Auto-Reframe">
          <Client />
        </ToolErrorBoundary>
      </div>

      <ToolSeoSection
        toolName="AI Video Auto-Reframe"
        headline="Turn Horizontal Videos into Viral Shorts & Reels"
        tagline="Bypass manual keyframing. Let AI auto-detect focal subjects and reframe horizontal footage into polished 9:16 vertical video."
        faqs={REFRAME_FAQS}
        relatedTools={[
          { name: "Video Editor", href: "/tools/video-editor" },
          { name: "Reaction Video Maker", href: "/tools/reaction-video-maker" },
          { name: "Video Trim", href: "/tools/video-trim" },
        ]}
      />
    </div>
  );
}
