import { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolLoader } from "@/components/ui/ToolLoader";
import { ToolJsonLd } from "@/components/seo/ToolJsonLd";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const Client = dynamic(() => import("./Client"), {
  loading: () => <ToolLoader message="Loading AI Video BG Remover..." />,
});

export const metadata: Metadata = {
  title: "AI Video Background Remover & Smart Cutout | Botock AI",
  description:
    "Instantly remove video backgrounds with AI. Use Smart Cutout, Background Matting, and AI Green Screen without manual masking. 100% Free and Automatic.",
  alternates: {
    canonical: "/tools/video-remove-bg",
  },
  openGraph: {
    title: "AI Video Background Remover | Botock AI",
    description:
      "Instantly remove video backgrounds with AI. Use Smart Cutout, Background Matting, and AI Green Screen without manual masking. 100% Free and Automatic.",
    url: "https://botock.app/tools/video-remove-bg",
    siteName: "Botock AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Background Remover | Botock AI",
    description: "Remove video backgrounds instantly using AI. Free Smart Cutout.",
  },
};

const VIDEO_REMOVE_BG_FAQS = [
  {
    question: "Do I need a green screen to remove video backgrounds?",
    answer: "No green screen is needed! Our AI neural networks detect human subjects, clothing, and hair in any background and separate them cleanly in real time.",
  },
  {
    question: "Can I replace the background with my own image or video?",
    answer: "Yes, you can export transparent alpha-channel video, replace backgrounds with solid chroma green, or composite custom images and video loops behind the subject.",
  },
  {
    question: "What is the maximum video length supported?",
    answer: "We support short-form videos up to 60 seconds and 100MB for fast browser-assisted processing.",
  },
  {
    question: "Is there any watermark on exported videos?",
    answer: "Never. All videos are exported clean without any watermarks or branding.",
  },
];

export default function VideoRemoveBgPage() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <ToolJsonLd
        name="AI Video Background Remover"
        description="Remove video backgrounds instantly using AI. Smart Cutout, neural edge matting, and AI Green Screen."
        url="/tools/video-remove-bg"
        applicationCategory="MultimediaApplication"
        faqs={VIDEO_REMOVE_BG_FAQS}
        featureList={[
          "Neural Smart Cutout without green screen",
          "Hair and edge matting refinement",
          "Alpha channel transparent export",
          "Virtual background replacement",
        ]}
      />

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
        <ToolErrorBoundary toolName="AI Video BG Remover">
          <Client />
        </ToolErrorBoundary>
      </div>

      <ToolSeoSection
        toolName="AI Video Background Remover"
        headline="Instant Video Cutout & AI Green Screen"
        tagline="Say goodbye to manual rotoscoping. Isolate subjects with pixel-perfect accuracy and replace backgrounds in seconds."
        faqs={VIDEO_REMOVE_BG_FAQS}
        relatedTools={[
          { name: "Image Background Remover", href: "/tools/image-remove-bg" },
          { name: "Video Editor", href: "/tools/video-editor" },
          { name: "Video Auto-Reframe", href: "/tools/video-auto-reframe" },
        ]}
      />
    </div>
  );
}
