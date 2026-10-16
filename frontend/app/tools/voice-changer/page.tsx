import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Mic } from "lucide-react";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolLoader } from "@/components/ui/ToolLoader";

const VoiceChangerClient = dynamic(() => import("./VoiceChangerClient"), {
  loading: () => <ToolLoader message="Loading AI Voice Studio..." />,
});

export const metadata: Metadata = {
  title: "AI Voice Changer & Text to Speech Studio | Deep Podcast & Narrator Voices Free",
  description:
    "Generate ultra-realistic AI voiceovers (Deep Podcast Narrator, Clean Child, International Voices) or modify existing audio pitch with Botock AI Voice Studio.",
  alternates: {
    canonical: "/tools/voice-changer",
  },
  openGraph: {
    title: "AI Voice Changer & Text to Speech Studio | Free Neural AI Voices",
    description:
      "Generate ultra-realistic deep podcast voices, documentary narrators, clean child voices, or transform voice recordings for free with Botock AI.",
    url: "https://botock.app/tools/voice-changer",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Voice Changer & Text to Speech Studio | Botock AI",
    description:
      "Generate ultra-realistic deep podcast voices, documentary narrators, clean child voices, or transform voice recordings for free with Botock AI.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function VoiceChangerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "AI Voice Changer - Botock AI",
        "url": "https://botock.app/tools/voice-changer",
        "description": "Transform audio files with AI. Instantly modify voices to sound like kids, old men, deep villains, and more for free.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://botock.app" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://botock.app/tools" },
          { "@type": "ListItem", "position": 3, "name": "AI Voice Changer", "item": "https://botock.app/tools/voice-changer" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is AI Voice Changer & Pitch Shifter really free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Our AI Voice Changer & Pitch Shifter is completely free of cost with no hidden charges, trial periods, or watermarks."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to create an account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No sign-up is required. You can start using the AI Voice Changer & Pitch Shifter immediately without logging in."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


      <div className="flex-1 bg-background">
        <ToolErrorBoundary toolName="Voice Changer">
          <VoiceChangerClient />
        </ToolErrorBoundary>
      </div>

      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            AI Voice Changer & Text-to-Speech Studio
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Generate ultra-realistic, human-quality neural voiceovers (Deep Podcast Narrators, British & US Studio Voices, Movie Villains, and Global Multilingual Accents) using advanced AI synthesis, or transform existing recordings with pitch & tone modulation.
          </p>
        </div>
      </section>
    
      {/* --- Enterprise SEO Content --- */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free AI Voice Changer & Pitch Shifter Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>AI Voice Changer & Pitch Shifter</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all audio conversions are processed ephemerally with immediate automated purging, ensuring your files are never stored or retained on remote servers. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Free of Cost</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enjoy unlimited usage without ever pulling out your credit card. We believe premium tools should be accessible to everyone, completely free of charge.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Sign-Up Required</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Skip the tedious registration process. You don't need to create an account or provide your email address to access our full suite of features.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Absolute Privacy</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We use secure ephemeral processing pipelines. Files uploaded for conversion are streamed in memory or temporary isolated directories and immediately deleted upon completion, guaranteeing zero data retention.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Is AI Voice Changer & Pitch Shifter really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our AI Voice Changer & Pitch Shifter is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the AI Voice Changer & Pitch Shifter immediately without logging in or providing any personal information.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

</div>
  );
}