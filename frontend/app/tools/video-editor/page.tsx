import type { Metadata } from "next";
import { Suspense } from "react";
import VideoEditorComponent from "./VideoEditorComponent";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Free Online AI Video Editor - No Watermark, 4K Export | Botock",
  description:
    "Edit videos online for free with Botock's ultra-fast browser Video Editor. Multi-track magnetic timeline, AI auto-subtitles, 9:16 TikTok/Reels reframe, and instant MP4 export with zero watermark.",
  keywords: [
    "free online video editor",
    "video editor no watermark",
    "browser video editor",
    "ai video editor online",
    "tiktok video editor web",
    "capcut web alternative",
    "botock video editor",
    "4k browser video editor",
    "multi-track timeline video editor",
  ],
  alternates: {
    canonical: "/tools/video-editor",
  },
  openGraph: {
    title: "Botock Free AI Video Editor — Instant 60fps Browser Editing",
    description:
      "Trim, split, add AI subtitles, and export 1080p/4K videos directly in your browser. 100% private & no watermark.",
    url: "https://botock.app/tools/video-editor",
    siteName: "Botock",
    images: [
      {
        url: "/images/blog/botock-video-editor.png",
        width: 1200,
        height: 630,
        alt: "Botock Online Multi-Track AI Video Editor Interface",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Video Editor | In-Browser Studio",
    description:
      "In-browser multi-track video editing with 0ms lag and complete client-side privacy.",
    images: ["/images/blog/botock-video-editor.png"],
  },
};

export default function VideoEditorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Pro Online Video Editor",
        url: "https://botock.app/tools/video-editor",
        description:
          "Desktop-class non-linear video editing (NLE) directly inside your web browser. Multi-track timeline, visual effects, and WebAssembly MP4 rendering.",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web Browser (Windows, macOS, Linux, Android, iOS)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Multi-track Magnetic Timeline",
          "Client-side WebAssembly 60fps Rendering",
          "Zero Server Upload Privacy",
          "9:16, 16:9, and 1:1 Aspect Ratio Presets",
          "Split, Ripple Delete, and Speed Control",
        ],
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
            name: "Tools",
            item: "https://botock.app/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Online Video Editor",
            item: "https://botock.app/tools/video-editor",
          },
        ],
      },
      {
        "@type": "HowTo",
        name: "How to Edit Videos in the Browser Using Botock Video Editor",
        description:
          "Step-by-step guide to importing clips, arranging tracks, splitting footage, and exporting MP4 videos locally.",
        step: [
          {
            "@type": "HowToStep",
            name: "Import Media",
            text: "Drag and drop your video clips, photos, music, or GIFs into the Botock Media Bin.",
          },
          {
            "@type": "HowToStep",
            name: "Arrange Timeline Tracks",
            text: "Place your video footage on primary and secondary video tracks, and add audio to the music track.",
          },
          {
            "@type": "HowToStep",
            name: "Split and Trim",
            text: "Position the playhead and press 'S' to split clips, or drag duration handles to trim precisely.",
          },
          {
            "@type": "HowToStep",
            name: "Export Clean MP4",
            text: "Click Export to render 1080p/4K MP4 with zero watermark directly inside your browser.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does Botock Video Editor add a watermark?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Botock exports clean 1080p and 4K MP4 videos with zero watermarks for free.",
            },
          },
          {
            "@type": "Question",
            name: "Are my videos uploaded to a server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Timeline editing, trimming, and rendering happen locally inside your browser using hardware-accelerated WebAssembly, keeping your media 100% private and ultra-fast.",
            },
          },
          {
            "@type": "Question",
            name: "Can I edit vertical videos for TikTok and YouTube Shorts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Botock supports 9:16 vertical (Shorts/TikTok/Reels), 16:9 landscape (YouTube), and 1:1 square canvas formats with one click.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Editor Container - Takes exactly full viewport height */}
      <div className="w-full h-full flex-1 overflow-hidden">
        <ToolErrorBoundary toolName="Video Editor">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-slate-500">
                Loading Video Editor...
              </div>
            }
          >
            <VideoEditorComponent />
          </Suspense>
        </ToolErrorBoundary>
      </div>

      {/* --- Enterprise SEO Content (Crawlable by search engines without disrupting full-screen studio) --- */}
      <div className="sr-only">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2>The Best Free Online Video Editor — Fast, Private & No Watermark</h2>
            <p>
              Botock brings desktop-class non-linear video editing (NLE) directly to your browser.
              Powered by multi-threaded WebAssembly and hardware-accelerated canvas rendering, you can
              cut, split, reframe for YouTube Shorts or TikTok, and export MP4 files without waiting
              for slow cloud uploads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3>1. Zero-Upload Speed</h3>
              <p>
                Your 4K footage opens instantly from local disk. No waiting for gigabytes of video to
                upload to a remote server.
              </p>
            </div>
            <div>
              <h3>2. Magnetic Multi-Track Timeline</h3>
              <p>
                Frame-accurate splitting (Shortcut: S), ripple deletion, and multi-step undo/redo history
                built for fast creator workflows.
              </p>
            </div>
            <div>
              <h3>3. Multi-Aspect Export</h3>
              <p>
                Switch between 16:9 (YouTube), 9:16 (Reels/TikTok), and 1:1 (Square) with one click
                before exporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}