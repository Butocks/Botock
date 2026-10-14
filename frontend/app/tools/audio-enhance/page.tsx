import { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolLoader } from "@/components/ui/ToolLoader";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const Client = dynamic(() => import("./Client"), {
  loading: () => <ToolLoader message="Loading AI Audio Enhancer..." />,
});

export const metadata: Metadata = {
  title: "AI Audio Enhancer & Background Noise Remover | Studio Vocal Clarity Free",
  description:
    "Enhance audio quality with AI. Remove background noise, room echo, wind, and hiss instantly to make your voice sound professional, like it was recorded in a studio.",
  keywords: [
    "ai audio enhancer",
    "remove background noise online",
    "voice cleaner online",
    "podcast audio enhancer",
    "denoise audio free",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/audio-enhance",
  },
  openGraph: {
    title: "AI Audio Enhancer & Background Noise Remover | Studio Sound Free",
    description: "Enhance vocal presence and eliminate room noise, fan hiss, and echo in your browser with AI DSP.",
    url: "https://botock.app/tools/audio-enhance",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Audio Enhancer & Background Noise Remover",
    description: "Remove background noise and enhance audio clarity online for free.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

const AUDIO_FAQS = [
  {
    question: "How does the AI Audio Enhancer remove background noise?",
    answer: "Our AI DSP engine uses neural spectral gating to isolate human voice frequencies from ambient background noise like fans, traffic, AC rumble, and room reverb without making voices sound muffled.",
  },
  {
    question: "Is AI Audio Enhancer free with no limits?",
    answer: "Yes, it is 100% free with no subscription required. You can enhance voice recordings, podcast clips, and voiceovers without hidden charges.",
  },
  {
    question: "What audio formats are supported?",
    answer: "We support MP3, WAV, AAC, M4A, OGG, and FLAC files up to 50MB.",
  },
  {
    question: "Are my audio recordings kept private?",
    answer: "Yes. All audio processing is handled privately and temporarily in memory during your session, and files are never stored or used to train models.",
  },
];

export default function AudioEnhancePage() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <ToolJsonLd
        name="AI Audio Enhancer"
        description="Studio-grade vocal noise removal, dynamic compression, and voice presence enhancer online for free."
        url="/tools/audio-enhance"
        applicationCategory="AudioApplication"
        faqs={AUDIO_FAQS}
        featureList={[
          "Neural background noise removal",
          "Voice presence & resonance booster",
          "Automatic level balancing",
          "Lossless audio export",
        ]}
      />

      <section className="bg-slate-100/60 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.08] py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-slate-900 dark:text-white transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Audio Enhancer</span>
          </nav>
        </div>
      </section>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
        <ToolErrorBoundary toolName="Audio Enhancer">
          <Client />
        </ToolErrorBoundary>
      </div>

      <ToolSeoSection
        toolName="AI Audio Enhancer"
        headline="Studio-Grade Vocal Clarity & Denoise with AI"
        tagline="Instantly transform quiet, noisy, or echoey recordings into studio-quality voice tracks for podcasts, videos, and meetings."
        faqs={AUDIO_FAQS}
        relatedTools={[
          { name: "Voice Changer", href: "/tools/voice-changer" },
          { name: "Video to MP3", href: "/tools/video-to-mp3" },
          { name: "Subtitles Generator", href: "/tools/subtitles" },
        ]}
      />
    </div>
  );
}
