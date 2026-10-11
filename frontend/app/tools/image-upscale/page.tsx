import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, ShieldCheck, Zap, Layers, Image as ImageIcon, HelpCircle } from "lucide-react";

const Client = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[460px]">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
        Loading AI Image Upscaling Studio...
      </p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "AI Image Upscaler 4K & 8K Online Free | Enhance Image & Video Resolution",
  description:
    "Enlarge and enhance your images and video frames up to 4x & 8x Ultra HD directly in your browser. Powered by multi-pass interpolation, noise reduction, and AI edge sharpness recovery. 100% private, free, and instant.",
  alternates: {
    canonical: "/tools/image-upscale",
  },
  openGraph: {
    title: "AI Image Upscaler 4K & 8K Online Free - Botock AI",
    description:
      "Enlarge photos and video frames up to 8K resolution in your browser with zero server uploads. 100% private and free.",
    url: "https://botock.app/tools/image-upscale",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Upscaler 4K & 8K Online Free",
    description:
      "Enlarge photos and video frames up to 8K resolution directly in your browser without quality loss.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageUpscalePage() {
  const jsonLdString = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Botock Image Upscaler",
        "url": "https://botock.app/tools/image-upscale",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web Browser",
        "description":
          "Enlarge and enhance images and video frames up to 4K & 8K resolution with multi-pass bicubic step scaling, unsharp mask sharpening, and noise reduction.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
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
            name: "AI Image Upscaler",
            item: "https://botock.app/tools/image-upscale",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does the AI Image Upscaler work without uploading to a server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Botock uses client-side HTML5 Canvas 2D multi-pass step scaling combined with Gaussian unsharp mask convolution filtering. The computation runs entirely on your device's hardware, ensuring your media remains 100% private.",
            },
          },
          {
            "@type": "Question",
            name: "Can I upscale video files or extract 4K frames?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! You can drop an MP4 or WebM video file, scrub to any moment, extract the frame, and upscale it up to 8K Ultra HD. For full video clip generation and upscaling, use our AI Video Studio.",
            },
          },
          {
            "@type": "Question",
            name: "Can I edit the image using AI text prompts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! In our AI Image Generator tool, you can upload your existing photo as an attachment/reference file and provide text prompts to edit details, replace backgrounds, or transform elements.",
            },
          },
        ],
      },
    ],
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" /> High-Fidelity 4K & 8K Resolution Enhancer
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Image & Video Upscaler
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Enlarge pictures and video frames up to 8x resolution instantly without quality loss. All processing happens locally on your device for absolute speed, zero limits, and 100% privacy.
        </p>
      </div>

      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      {/* Interactive Tool Client */}
      <Client />

      {/* Feature Value Props */}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.06] space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multi-Pass Step Scaling
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard 4x magnification causes severe blur. Our progressive multi-step bicubic scaling interpolates in smooth stages to preserve natural gradients and micro-details.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Unsharp Mask Convolution
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Restores lost edge frequencies using high-precision Gaussian convolution math, giving your final image crisp contours, sharper text, and enhanced clarity.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              100% Private & Unlimited
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your sensitive photos and video files never leave your computer or browser. There are no queue times, no file size charges, and no daily upload quotas.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            <details className="group border border-slate-200 dark:border-white/[0.06] rounded-2xl bg-white dark:bg-[#121215] [&_summary::-webkit-details-marker]:hidden p-5 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                How does AI image upscaling improve low-resolution photos?
                <span className="text-emerald-500 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                When an image is magnified directly, pixels become pixelated and blurry. Botock&apos;s upscaler applies progressive step interpolation (1x → 2x → 4x) combined with edge-detection unsharp masking to amplify high-contrast boundaries, creating a crisp result suitable for retina displays and print.
              </p>
            </details>

            <details className="group border border-slate-200 dark:border-white/[0.06] rounded-2xl bg-white dark:bg-[#121215] [&_summary::-webkit-details-marker]:hidden p-5 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                Can I edit my image using text prompts after upscaling?
                <span className="text-emerald-500 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes! Head over to our{" "}
                <Link href="/tools/image-generator" className="text-emerald-500 font-semibold underline">
                  AI Image Generator
                </Link>
                , upload your image as a reference attachment file, and describe your desired modifications (e.g. changing the background, altering clothes, or switching artistic styles).
              </p>
            </details>

            <details className="group border border-slate-200 dark:border-white/[0.06] rounded-2xl bg-white dark:bg-[#121215] [&_summary::-webkit-details-marker]:hidden p-5 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                Can I upscale videos as well?
                <span className="text-emerald-500 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes! You can drop an MP4 or WebM video right into this tool to seek and extract individual frames and upscale them to 4K or 8K. For generating and upscaling entire animated video scenes, check out our{" "}
                <Link href="/tools/video-generator" className="text-violet-500 font-semibold underline">
                  AI Video Studio
                </Link>
                .
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
