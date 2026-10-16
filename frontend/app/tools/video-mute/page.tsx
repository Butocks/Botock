import type { Metadata } from "next";
import Link from "next/link";
import { VolumeX, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const VideoMuteClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Loading Video Audio Stripper...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Mute Video Online Free (No Upload Limit) – Remove Audio | Botock",
  description:
    "Remove audio and mute video clips online for free. Lossless stream copy removes sound in 1 second with no quality loss and zero server uploads.",
  keywords: [
    "mute video online",
    "mute video online free",
    "remove audio from video",
    "strip audio from mp4",
    "mute mp4 online",
    "silent video maker",
    "turn off sound in video",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/video-mute",
  },
  openGraph: {
    title: "Mute Video Online Free (No Upload Limit) – Remove Audio",
    description:
      "Remove audio and sound tracks from any video in 1 second. 100% Free, no file limit, lossless stream copy.",
    url: "https://botock.app/tools/video-mute",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mute Video Online Free | Botock",
    description: "Remove audio and sound tracks from any video with zero quality loss.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VideoMutePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Free Online Video Muter",
        url: "https://botock.app/tools/video-mute",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        description: "Remove sound from video files directly inside your browser with lossless stream copy.",
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
          { "@type": "ListItem", position: 3, name: "Mute Video", item: "https://botock.app/tools/video-mute" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does Botock mute video in under 1 second without quality loss?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock uses client-side FFmpeg WebAssembly stream copy technology (-c:v copy -an). It strips the audio stream while keeping the original video stream untouched, resulting in 100% identical video clarity with zero compression artifacts.",
            },
          },
          {
            "@type": "Question",
            name: "Is there any video file size or duration limit?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No! Because processing happens entirely inside your browser memory, you can mute large 4K or 1080p video files without waiting for slow server uploads or hitting upload limits.",
            },
          },
          {
            "@type": "Question",
            name: "Are my personal video clips uploaded to any cloud server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Never. Your files never leave your local device. All media processing happens locally in your browser sandbox, ensuring absolute privacy for sensitive, corporate, and family videos.",
            },
          },
          {
            "@type": "Question",
            name: "What video formats are supported?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock supports all popular video formats including MP4, MOV, WebM, MKV, AVI, and FLV.",
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
            <span className="text-foreground font-semibold">Mute Video Online</span>
          </nav>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lossless Stream Copy</span>
            </span>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold mb-4">
          <VolumeX className="w-4 h-4" />
          <span>Sub-Second Audio Removal • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          Mute Video Online Free
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Remove audio tracks, background noise, or copyrighted music from any MP4, MOV, or WebM video in 1 second. Zero quality loss and zero server uploads.
        </p>
      </div>

      {/* Interactive Tool Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="Video Muter">
            <VideoMuteClient />
          </ToolErrorBoundary>
        </div>

        {/* Structured SEO & Internal Link Footer Section */}
        <ToolSeoSection
          toolName="Mute Video Online"
          category="Video Utility"
          description="Botock Free Online Video Muter lets creators, marketers, and students strip unwanted audio, ambient background sound, or music tracks from video files with zero loss of visual quality. By utilizing high-speed WebAssembly FFmpeg stream copying, the audio stream is instantly dropped while retaining the original H.264, HEVC, or VP9 video bitstream."
          steps={[
            {
              title: "Upload Your Video",
              description: "Drag and drop any MP4, MOV, WebM, or MKV file into the secure in-browser player box.",
            },
            {
              title: "Mute Audio Instantly",
              description: "Click Mute Video to trigger lossless stream copy (-an -c:v copy). No waiting for re-encoding.",
            },
            {
              title: "Preview & Download",
              description: "Check the soundless video preview and click Download to save your clean video file.",
            },
          ]}
          features={[
            {
              title: "Zero Video Re-Encoding",
              description: "Preserves your exact frame resolution, bitrate, color grading, and fps with lossless stream copy.",
            },
            {
              title: "No Server Uploads",
              description: "All operations execute in your browser RAM sandbox. Your video never travels across the internet.",
            },
            {
              title: "No File Size Limit",
              description: "Mute short social reels or multi-gigabyte 4K clips without restrictions, paywalls, or watermarks.",
            },
          ]}
          faqs={[
            {
              question: "Will muting my video decrease its visual quality?",
              answer: "Not at all. Unlike online converters that re-compress video, Botock performs direct stream copying. The video stream is copied bit-for-bit without touching a single pixel.",
            },
            {
              question: "How long does muting take?",
              answer: "Because no re-encoding takes place, the process takes less than 1 to 2 seconds even for high-definition 1080p and 4K videos.",
            },
            {
              question: "Can I use the muted video for commercial projects?",
              answer: "Yes, you own 100% of the rights to all video files processed through Botock AI tools.",
            },
          ]}
          relatedTools={[
            { name: "Trim Video", href: "/tools/video-trim" },
            { name: "Compress Video", href: "/tools/video-compress" },
            { name: "Convert Video", href: "/tools/video-convert" },
            { name: "Rotate Video", href: "/tools/video-rotate" },
          ]}
        />
      </main>
    </div>
  );
}
