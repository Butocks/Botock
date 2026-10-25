import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Music, RefreshCw } from "lucide-react";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const AudioConverterClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      <RefreshCw className="w-5 h-5 mr-2 animate-spin text-amber-500" />
      Loading Audio Converter Engine...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Audio Converter Free Online – Convert MP3, WAV, AAC, FLAC | Botock",
  description:
    "Convert audio files online between MP3, WAV, AAC, M4A, OGG, and FLAC for free. Studio-grade sound quality, customizable bitrates up to 320kbps, and 100% private in-browser conversion.",
  keywords: [
    "audio converter",
    "convert audio online free",
    "mp3 to wav",
    "wav to mp3 converter",
    "m4a to mp3 converter",
    "convert flac to mp3",
    "audio format converter",
    "online mp3 converter",
    "free sound converter",
    "botock audio tools",
  ],
  alternates: {
    canonical: "/tools/audio-converter",
  },
  openGraph: {
    title: "Audio Converter Free Online – Convert MP3, WAV, AAC, FLAC | Botock",
    description:
      "Convert audio files between MP3, WAV, AAC, M4A, OGG, and FLAC directly in your browser. 100% Free, unlimited file sizes, zero quality loss.",
    url: "https://botock.app/tools/audio-converter",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Audio Converter Online | Botock",
    description:
      "Convert any audio or extract sound from video directly in your browser with studio quality.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function AudioConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Audio Format Converter",
        url: "https://botock.app/tools/audio-converter",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        description:
          "Convert audio files between MP3, WAV, AAC, M4A, OGG, and FLAC formats with custom bitrates and studio sound fidelity.",
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
          {
            "@type": "ListItem",
            position: 3,
            name: "Audio Converter",
            item: "https://botock.app/tools/audio-converter",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What audio formats can I convert with Botock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can convert between all major audio formats including MP3, WAV (lossless PCM), AAC, M4A, OGG (Vorbis), and FLAC (lossless). You can also extract sound tracks from video files like MP4 and WebM.",
            },
          },
          {
            "@type": "Question",
            name: "Is this audio converter free with no file limits?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Botock Audio Converter is 100% free with no file size limitations, no daily caps, no signup requirement, and no audio watermarks.",
            },
          },
          {
            "@type": "Question",
            name: "Are my audio files uploaded to your servers?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No! All audio conversion operates locally inside your browser using WebAssembly and Web Audio API technologies. Your sensitive recordings, music tracks, and voice notes never leave your computer or phone.",
            },
          },
          {
            "@type": "Question",
            name: "How can I get the highest audio quality when converting?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "For lossless sound fidelity, choose WAV or FLAC. For MP3 and AAC, select the 320 kbps (Studio Quality) bitrate setting to ensure pristine high-frequency preservation and wide stereo imaging.",
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold mb-4">
          <Music className="w-4 h-4" />
          <span>Convert MP3, WAV, AAC, M4A, FLAC • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          Free Online Audio Converter
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Convert music, voice memos, podcasts, and recordings between all popular audio formats in seconds.
          Customize bitrate, preserve stereo channels, and enjoy 100% private in-browser processing.
        </p>
      </div>

      {/* Interactive Tool Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="Audio Format Converter">
            <AudioConverterClient />
          </ToolErrorBoundary>
        </div>

        {/* Structured SEO & Internal Link Footer Section */}
        <ToolSeoSection
          toolName="Audio Converter"
          category="Audio Utility"
          description="Botock Free Online Audio Converter is an ultrafast multimedia converter that allows you to transform audio tracks between MP3, WAV, AAC, M4A, OGG, and FLAC without installing bulky software or registering an account. Leveraging client-side WebAssembly, conversions process directly on your device CPU for instantaneous performance and complete data confidentiality."
          steps={[
            {
              title: "Upload Audio or Video",
              description: "Drag and drop any audio file (MP3, WAV, AAC, M4A, OGG, FLAC) or video file to extract sound.",
            },
            {
              title: "Select Target Format & Bitrate",
              description: "Choose your destination format (e.g. MP3 or WAV) and pick your preferred quality (up to 320 kbps).",
            },
            {
              title: "Convert & Download Instantly",
              description: "Preview your converted track and download the final file immediately with zero watermark.",
            },
          ]}
          features={[
            {
              title: "Multi-Format Support",
              description: "Seamlessly convert between MP3, WAV, AAC, M4A, OGG, and FLAC with universal compatibility.",
            },
            {
              title: "Studio-Grade 320kbps Bitrate",
              description: "Select from 128k, 192k, 256k, or studio 320k bitrates for crystal-clear acoustics.",
            },
            {
              title: "Zero Cloud Uploads",
              description: "Your recordings stay strictly on your device. Converted locally with cutting-edge WebAssembly.",
            },
          ]}
          faqs={[
            {
              question: "Can I convert voice memos (M4A) to MP3?",
              answer: "Yes! Botock converts iPhone voice memos (.m4a) and Android voice recordings into universally playable MP3 files in a split second.",
            },
            {
              question: "Can I extract audio from an MP4 or WebM video?",
              answer: "Yes, simply upload your video file and select your desired audio format (like MP3 or WAV). Botock extracts the sound track automatically.",
            },
            {
              question: "Will converting to MP3 reduce the sound quality?",
              answer: "Converting from lossless formats (like WAV or FLAC) to MP3 at 320kbps delivers virtually indistinguishable high fidelity while cutting file size by 80%.",
            },
          ]}
          relatedTools={[
            { name: "Amplify Audio Volume", href: "/tools/audio-volume" },
            { name: "Trim Audio Track", href: "/tools/audio-trim" },
            { name: "AI Audio Enhancer", href: "/tools/audio-enhance" },
            { name: "Video to MP3 Converter", href: "/tools/video-to-mp3" },
          ]}
        />
      </main>
    </div>
  );
}
