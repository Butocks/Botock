import type { Metadata } from "next";
import Link from "next/link";
import { Volume2, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const AudioVolumeClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Loading Audio Amplifier Engine...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Amplify MP3 Online Free – Boost Audio Volume up to 500% | Botock",
  description:
    "Increase audio volume and amplify quiet MP3 or WAV files up to 500% online for free. Boost sound levels with clear speech normalization and zero server uploads.",
  keywords: [
    "amplify mp3",
    "increase mp3 volume",
    "boost audio volume online",
    "make audio louder online free",
    "audio volume booster",
    "amplify wav online",
    "loud mp3 converter",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/audio-volume",
  },
  openGraph: {
    title: "Amplify MP3 Online Free – Boost Audio Volume up to 500%",
    description:
      "Boost quiet MP3 and audio tracks up to 5x louder in your browser. 100% Free, no signup, in-browser privacy.",
    url: "https://botock.app/tools/audio-volume",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amplify MP3 Online Free | Botock",
    description: "Make quiet audio tracks up to 500% louder directly in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function AudioVolumePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock MP3 Volume Booster & Amplifier",
        url: "https://botock.app/tools/audio-volume",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        description: "Boost audio levels of MP3, WAV, and M4A files up to 500% directly in your browser.",
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
          { "@type": "ListItem", position: 3, name: "Amplify MP3", item: "https://botock.app/tools/audio-volume" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How much louder can I make my audio file?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can increase volume by up to 500% (5x gain). Common presets include +50% for quiet podcasts, 200% (double volume) for mobile recordings, and 300% to 500% for whisper-quiet tracks.",
            },
          },
          {
            "@type": "Question",
            name: "Does boosting audio distort the sound quality?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock utilizes FFmpeg audio normalization and gain filters to smoothly raise waveform amplitudes while maintaining 192kbps high-fidelity bitrate to minimize clipping and distortion.",
            },
          },
          {
            "@type": "Question",
            name: "Is this audio volume booster free with no limits?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Botock Audio Booster is 100% free with no file size limitations, no subscription, and no watermarks.",
            },
          },
          {
            "@type": "Question",
            name: "Are my audio files uploaded to remote servers?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No! All audio processing runs locally inside your browser using WebAssembly. Your confidential recordings, interviews, and voice memos remain strictly private on your device.",
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

      {/* Semantic Top Navigation Breadcrumb */}
      <section className="bg-slate-900/50 border-b border-border/40 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Amplify MP3 Volume</span>
          </nav>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-amber-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Up to 500% Volume Boost</span>
            </span>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold mb-4">
          <Volume2 className="w-4 h-4" />
          <span>Boost Volume up to 5x • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          Amplify MP3 Online Free
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Boost low volume, quiet vocal takes, voice notes, and podcast episodes up to 500% louder in seconds. Works directly in your browser with zero quality degradation.
        </p>
      </div>

      {/* Interactive Tool Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="Audio Volume Booster">
            <AudioVolumeClient />
          </ToolErrorBoundary>
        </div>

        {/* Structured SEO & Internal Link Footer Section */}
        <ToolSeoSection
          toolName="Amplify MP3 Volume"
          category="Audio Utility"
          description="Botock Online Audio Volume Booster gives you the freedom to increase the sound level of quiet audio files, webinars, lecture recordings, and music tracks without installing heavy software. Using WebAssembly audio synthesis, our engine recalculates decibel gain directly on your CPU without ever uploading your private files."
          steps={[
            {
              title: "Upload Audio Track",
              description: "Drop your MP3, WAV, M4A, or AAC file into the audio upload area.",
            },
            {
              title: "Choose Boost Percentage",
              description: "Select from quick presets (150%, 200%, 300%) or adjust the slider anywhere from 0% to 500%.",
            },
            {
              title: "Listen & Download",
              description: "Play the amplified preview and download your high-fidelity MP3 file immediately.",
            },
          ]}
          features={[
            {
              title: "Up to 500% Volume Gain",
              description: "Rescue barely audible speech recordings and make them clear, loud, and intelligible.",
            },
            {
              title: "192kbps High-Bitrate Export",
              description: "Preserves audio fidelity and stereo imaging with studio-grade MP3 encoding.",
            },
            {
              title: "Full Privacy Guaranteed",
              description: "Files are handled inside browser memory. Zero cloud data storage or tracking.",
            },
          ]}
          faqs={[
            {
              question: "Can I amplify audio from video files too?",
              answer: "Yes, you can upload MP4 or MOV files and Botock will extract and amplify the audio track into a clear MP3.",
            },
            {
              question: "Will the amplified audio work on iPhone and Android?",
              answer: "Yes, the exported MP3 format is universally compatible with all smartphones, car stereos, laptops, and media players.",
            },
            {
              question: "Is there a limit on how many tracks I can boost?",
              answer: "There are no limits. You can amplify as many audio files as you need, completely free of charge.",
            },
          ]}
          relatedTools={[
            { name: "Audio Enhancer", href: "/tools/audio-enhance" },
            { name: "Video to MP3", href: "/tools/video-to-mp3" },
            { name: "Voice Changer", href: "/tools/voice-changer" },
            { name: "Trim Video", href: "/tools/video-trim" },
          ]}
        />
      </main>
    </div>
  );
}
