import type { Metadata } from "next";
import Link from "next/link";
import { Scissors, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const AudioTrimClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Loading Audio Cutter Engine...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Trim MP3 Online Free – Audio Cutter & Ringtone Maker | Botock",
  description:
    "Cut and trim MP3, WAV, and audio files online for free. Extract audio clips, make custom phone ringtones, and trim songs with millisecond precision and zero server uploads.",
  keywords: [
    "trim mp3 online",
    "trim audio online free",
    "mp3 cutter online",
    "audio trimmer free",
    "cut song online",
    "make ringtone from mp3",
    "audio splitter free",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/audio-trim",
  },
  openGraph: {
    title: "Trim MP3 Online Free – Audio Cutter & Ringtone Maker",
    description:
      "Cut audio clips with millisecond precision directly in your browser. 100% Free, zero server uploads.",
    url: "https://botock.app/tools/audio-trim",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trim MP3 Online Free | Botock",
    description: "Lossless audio cutter and ringtone maker right in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function AudioTrimPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Audio Cutter & MP3 Trimmer",
        url: "https://botock.app/tools/audio-trim",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        description: "Trim, split, and cut MP3 and audio tracks locally with millisecond stream copy precision.",
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
          { "@type": "ListItem", position: 3, name: "Trim Audio", item: "https://botock.app/tools/audio-trim" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How fast is audio trimming on Botock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock uses FFmpeg WebAssembly stream copy (-c copy). It cuts the audio track without re-encoding, completing the operation in under 1 second.",
            },
          },
          {
            "@type": "Question",
            name: "Can I create custom phone ringtones with this tool?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Simply choose your favorite chorus or 20-30 second segment from any MP3 or WAV song, trim it, and download your ringtone instantly.",
            },
          },
          {
            "@type": "Question",
            name: "Is there any cost or limit on file cuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock Audio Cutter is 100% free with unlimited cuts and zero watermarks.",
            },
          },
          {
            "@type": "Question",
            name: "Does Botock keep a copy of my songs or recordings?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Never. Audio processing takes place entirely within your browser sandboxed WebAssembly memory on your device.",
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
            <span className="text-foreground font-semibold">Trim MP3 Audio</span>
          </nav>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Millisecond Stream Copy</span>
            </span>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-bold mb-4">
          <Scissors className="w-4 h-4" />
          <span>Instant Stream Copy • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          Trim MP3 Online Free
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Cut audio clips, trim songs, and extract ringtones from MP3, WAV, and M4A files in 1 second. Zero re-encoding, millisecond accuracy, and 100% privacy.
        </p>
      </div>

      {/* Interactive Tool Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="Audio Cutter">
            <AudioTrimClient />
          </ToolErrorBoundary>
        </div>

        {/* Structured SEO & Internal Link Footer Section */}
        <ToolSeoSection
          toolName="Trim MP3 Online"
          category="Audio Utility"
          description="Botock Free Online Audio Cutter and MP3 Trimmer lets you extract precise audio segments from music tracks, voice notes, and podcast interviews. Powered by WebAssembly FFmpeg technology, our tool cuts files using direct bitstream stream copy so that original audio quality is never compressed or degraded."
          steps={[
            {
              title: "Upload Audio File",
              description: "Select or drop any MP3, WAV, M4A, or AAC file into the interactive player.",
            },
            {
              title: "Set Start and End Time",
              description: "Use the sliders or type exact second timestamps to highlight your desired audio segment.",
            },
            {
              title: "Preview & Download",
              description: "Play your trimmed audio clip and download the clean MP3 file with zero waiting.",
            },
          ]}
          features={[
            {
              title: "Zero Quality Loss",
              description: "Direct stream copy drops unwanted bits without re-encoding, preserving 100% original fidelity.",
            },
            {
              title: "Millisecond Precision",
              description: "Fine-tune cut boundaries down to 0.1-second accuracy for seamless loops and ringtones.",
            },
            {
              title: "Absolute Browser Privacy",
              description: "Audio processing is done client-side. Your files never touch a remote server.",
            },
          ]}
          faqs={[
            {
              question: "What audio formats can I trim?",
              answer: "You can trim MP3, WAV, M4A, AAC, OGG, and FLAC audio files directly in your web browser.",
            },
            {
              question: "Can I cut multiple segments from the same song?",
              answer: "Yes, you can trim one segment, download it, and immediately adjust the time markers to extract another clip.",
            },
            {
              question: "Will this work on iPhone, iPad, and Android?",
              answer: "Yes, Botock is fully responsive and functions directly on mobile browsers without installing any app.",
            },
          ]}
          relatedTools={[
            { name: "Amplify MP3", href: "/tools/audio-volume" },
            { name: "Audio Enhancer", href: "/tools/audio-enhance" },
            { name: "Video Trim", href: "/tools/video-trim" },
            { name: "Video to MP3", href: "/tools/video-to-mp3" },
          ]}
        />
      </main>
    </div>
  );
}
