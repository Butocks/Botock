import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mic } from "lucide-react";
import VoiceChangerClient from "./VoiceChangerClient";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "AI Voice Changer | Modify Audio Pitch & Tone Free",
  description:
    "Transform audio files with Botock's AI Voice Changer. Instantly convert voices to kids, old men, deep villains, and more for free.",
  alternates: {
    canonical: "/tools/voice-changer",
  },
  openGraph: {
    title: "AI Voice Changer | Modify Audio Pitch & Tone Free",
    description:
      "Transform audio files with Botock AI Voice Changer. Instantly convert voices to kids, old men, deep villains, and more for free.",
    url: "https://botock.app/tools/voice-changer",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Voice Changer | Botock AI",
    description:
      "Transform audio files with Botock AI Voice Changer. Instantly convert voices to kids, old men, deep villains, and more for free.",
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
      }
    ]
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-slate-900/50 border-b border-border/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Voice Changer</span>
          </nav>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Free Forever</span>
            </span>
          </div>
        </div>
      </section>

      <div className="flex-1 bg-background">
        <ToolErrorBoundary toolName="Voice Changer">
          <VoiceChangerClient />
        </ToolErrorBoundary>
      </div>

      <section className="border-t border-border/40 bg-card/30 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            AI Voice Changer & Pitch Shifter
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Easily modify your audio recordings using our high-performance cloud audio processing engine. Change the pitch and speed of voices to sound like a child, an older person, or a movie villain. Supports MP3 and WAV files up to 20MB.
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
              Experience the fastest and most secure way to use our <strong>AI Voice Changer & Pitch Shifter</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
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
                We use cutting-edge client-side rendering technology. This means your files stay on your device and are processed locally, guaranteeing zero data retention.
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