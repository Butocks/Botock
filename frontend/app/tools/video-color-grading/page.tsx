import type { Metadata } from "next";
import { Palette } from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const VideoColorGradingClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Loading color grading tool...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Video Color Grading Online Free | Botock",
  description:
    "Color grade video online for free. Adjust brightness, contrast, saturation and gamma, or apply cinematic filter presets to MP4 and MOV clips right in your browser.",
  keywords: [
    "video color grading online",
    "free online video color grading",
    "video color filter",
    "color filter for video",
    "video colour filter",
    "filter video online",
    "botock tools",
  ],
  alternates: { canonical: "/tools/video-color-grading" },
  openGraph: {
    title: "Video Color Grading Online Free",
    description:
      "Grade and filter your videos with live preview. Brightness, contrast, saturation, gamma and cinematic presets. No upload, no watermark.",
    url: "https://botock.app/tools/video-color-grading",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Color Grading Online Free | Botock",
    description: "Color grade and filter videos in your browser with live preview.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

const FAQS = [
  {
    question: "How do I color grade a video online for free?",
    answer:
      "Upload your clip, pick a preset such as Cinematic or Vibrant (or move the brightness, contrast, saturation and gamma sliders), check the live preview, then click Apply & export to download the graded MP4.",
  },
  {
    question: "Is there a watermark or file upload?",
    answer:
      "No. The video is processed in your browser using FFmpeg WebAssembly, so it is not uploaded to a server and the export has no watermark.",
  },
  {
    question: "What is the difference between a video color filter and color grading?",
    answer:
      "A filter applies one fixed look in a single click. Color grading lets you control individual values such as contrast, saturation and gamma to build the look yourself. This tool offers both: presets as a starting point and sliders for fine control.",
  },
  {
    question: "Which video formats work?",
    answer:
      "MP4, MOV and WebM work best. Very large or unusual codecs may take longer because the video is re-encoded in your browser.",
  },
];

export default function VideoColorGradingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Video Color Grading",
        url: "https://botock.app/tools/video-color-grading",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        description:
          "Adjust brightness, contrast, saturation and gamma of a video, or apply filter presets, in your browser.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://botock.app" },
          { "@type": "ListItem", position: 2, name: "Tools", item: "https://botock.app/tools" },
          {
            "@type": "ListItem",
            position: 3,
            name: "Video Color Grading",
            item: "https://botock.app/tools/video-color-grading",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold mb-4">
          <Palette className="w-4 h-4" />
          <span>Live Preview • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          Video Color Grading Online
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Color grade and filter your video for free. Pick a cinematic preset or fine-tune brightness,
          contrast, saturation and gamma with a live preview, then export without a watermark.
        </p>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="Video Color Grading">
            <VideoColorGradingClient />
          </ToolErrorBoundary>
        </div>

        <ToolSeoSection
          toolName="Video Color Grading"
          category="Video Utility"
          description="Botock Video Color Grading lets you change the look of a video without installing software. Use presets for a quick filter, or adjust brightness, contrast, saturation and gamma yourself to fix dull footage, warm up a clip, or create a cinematic or black-and-white style. The preview updates instantly, and the final export is rendered in your browser so your file never leaves your device."
          steps={[
            { title: "Upload your video", description: "Choose an MP4, MOV or WebM clip. It stays on your device." },
            { title: "Pick a preset or adjust sliders", description: "Try Cinematic, Vibrant, Warm Fade or Black & White, then fine-tune brightness, contrast, saturation and gamma while watching the live preview." },
            { title: "Export and download", description: "Click Apply & export. The graded MP4 is rendered in your browser and ready to download." },
          ]}
          features={[
            { title: "Live preview", description: "See every change on the video before you export." },
            { title: "Presets plus manual control", description: "Start from a filter look, then adjust the four core color values yourself." },
            { title: "Private and watermark-free", description: "Processing happens in your browser with FFmpeg WebAssembly. No upload, no watermark." },
          ]}
          faqs={FAQS}
          relatedTools={[
            { name: "Video Editor", href: "/tools/video-editor" },
            { name: "Image Filters", href: "/tools/image-filters" },
            { name: "Compress Video", href: "/tools/video-compress" },
            { name: "Trim Video", href: "/tools/video-trim" },
          ]}
        />
      </main>
    </div>
  );
}
