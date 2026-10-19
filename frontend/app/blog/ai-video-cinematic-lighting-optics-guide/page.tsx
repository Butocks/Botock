import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sun,
  Flame,
  CloudRain,
  Camera,
  Sparkles,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Palette,
  Film,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Video Cinematic Lighting, Lenses & Optics: Prompt Engineering Guide (2026)",
  description:
    "Master cinematic lighting, anamorphic lenses, bokeh, shallow depth-of-field, volumetric fog, and golden hour in AI video models. Complete prompt recipes.",
  alternates: {
    canonical: "/blog/ai-video-cinematic-lighting-optics-guide",
  },
  openGraph: {
    title: "AI Video Cinematic Lighting, Lenses & Optics: Prompt Engineering Guide",
    description:
      "Transform flat, sterile AI video renders into rich Hollywood-grade cinematography using focal lengths, rim lighting, and atmospheric volumetric particles.",
    url: "https://botock.app/blog/ai-video-cinematic-lighting-optics-guide",
    type: "article",
    publishedTime: "2026-10-19T00:00:00Z",
    authors: ["Botock AI Filmmaking Lab"],
    images: ["https://botock.app/images/blog/ai-cinematic-lighting-optics.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Cinematic Lighting & Optics Guide",
    description: "Master lighting, focal lengths, bokeh, and atmospheric optics.",
    images: ["https://botock.app/images/blog/ai-cinematic-lighting-optics.jpg"],
  },
};

export default function LightingOpticsBlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: "AI Video Cinematic Lighting, Lenses & Optics: Prompt Engineering Guide",
        description:
          "Comprehensive guide to optical physics, focal length selection, 3-point lighting setups, and atmospheric textures in generative video.",
        image: "https://botock.app/images/blog/ai-cinematic-lighting-optics.jpg",
        datePublished: "2026-10-19T00:00:00Z",
        dateModified: "2026-10-19T00:00:00Z",
        author: {
          "@type": "Organization",
          name: "Botock AI Filmmaking Lab",
        },
        publisher: {
          "@type": "Organization",
          name: "Botock",
          logo: {
            "@type": "ImageObject",
            url: "https://botock.app/logo.png",
          },
        },
        mainEntityOfPage: "https://botock.app/blog/ai-video-cinematic-lighting-optics-guide",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="w-full bg-white dark:bg-[#111114] border-b border-slate-200 dark:border-white/10 px-6 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Blog Catalog
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href="/blog/ai-video-prompt-engineering-master-handbook"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Master Prompt Engineering Handbook
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-4">
            <Sun className="w-3.5 h-3.5" />
            <span>Cinematic Lighting & Optical Physics Masterclass</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            AI Video Lighting, Optics & Color: How to Command Cinematic Depth and Atmosphere
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
            Stop producing plastic, flat, sterile AI video renders. Learn how to direct camera lenses (24mm vs 85mm anamorphic), rim lighting, volumetric fog, color grading, and organic 35mm film grain.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
            <span>By Botock AI Filmmaking Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>October 19, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>16 Min Read</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Based on 100-Page Video Prompt Handbook</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Real Visual Image Showcase */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-slate-900">
          <div className="relative aspect-video w-full">
            <Image
              src="/images/blog/ai-cinematic-lighting-optics.jpg"
              alt="Golden hour rim lighting and volumetric rays in cinematic ruined temple"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="p-4 bg-slate-900/90 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <strong>Production Visual:</strong> Dramatic low-sun golden hour rim light with volumetric dust motes, 85mm anamorphic prime
            </span>
            <span className="text-slate-500 font-mono">Model: 8K Panavision Simulation</span>
          </div>
        </div>

        {/* Core Lighting Principles */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50 mb-12">
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Why Lighting Dictates Photorealism in AI Models
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            AI diffusion and transformer video models do not compute ray-traced photon bounces. They look for <strong>tonal contrast gradients</strong>. If a scene is lit evenly with flat ambient light, human skin turns into rubbery CGI wax. By specifying directional side light, rim light, and specular highlights, you force the latent diffusion engine to generate sharp occlusion shadows and realistic microscopic skin pores.
          </p>
        </div>

        {/* Section 1: The Focal Length & Optics Table */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Camera className="w-7 h-7 text-amber-500" />
            1. Lens Selection & Depth of Field (Optics Table)
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Specifying lens millimeters changes both the spatial compression and the background blur (bokeh):
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Lens Millimeter</th>
                  <th className="py-3 px-4">Optical Characteristics</th>
                  <th className="py-3 px-4">Depth of Field</th>
                  <th className="py-3 px-4">Ideal Cinematography Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">21mm / 24mm Wide Angle</td>
                  <td className="py-3 px-4">Expands spatial distance; exaggerated perspective parallax</td>
                  <td className="py-3 px-4">Deep focus (foreground to background sharp)</td>
                  <td className="py-3 px-4">Epic landscapes, architectural interiors, dynamic action rush</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">35mm & 50mm Standard</td>
                  <td className="py-3 px-4">Natural human eye perspective; zero barrel distortion</td>
                  <td className="py-3 px-4">Balanced natural falloff</td>
                  <td className="py-3 px-4">Dialogue coverage, street documentary, cinematic narrative</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">85mm & 105mm Portrait Prime</td>
                  <td className="py-3 px-4">Flattering facial compression; tight background framing</td>
                  <td className="py-3 px-4">Shallow DOF, creamy buttery circular bokeh</td>
                  <td className="py-3 px-4">Emotional close-ups, high fashion, character isolation</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">200mm Telephoto</td>
                  <td className="py-3 px-4">Extreme compression; distant backgrounds appear right behind subject</td>
                  <td className="py-3 px-4">Razor-thin plane of focus</td>
                  <td className="py-3 px-4">Surveillance shots, crowded city streets, sports tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Lighting Setups & Prompt Syntax */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Sun className="w-7 h-7 text-orange-500" />
            2. Professional Lighting Archetypes
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Replace generic words like <em>&quot;beautiful lighting&quot;</em> with explicit lighting directions:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">Warmth & Silhouettes</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Golden Hour & Rim Light</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                Low-angle sun behind the subject creates a glowing outline around hair and shoulders, detaching them from dark backgrounds.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-amber-400 font-mono text-xs">
                LIGHTING: Golden hour backlight from low sun at frame-right. Warm amber rim light outlining subject&apos;s shoulders and hair. Deep soft fill on face.
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Film Noir & Drama</div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chiaroscuro & Low-Key Light</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                High contrast ratio where one side of the face is illuminated and the other falls into shadow.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-amber-400 font-mono text-xs">
                LIGHTING: Low-key chiaroscuro lighting. Single hard directional beam illuminating the left cheek and eye. Deep shadow on right side of face.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Atmosphere, Smoke & Environmental Physics */}
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <CloudRain className="w-7 h-7 text-cyan-500" />
            3. Volumetric Fog, Rain & Environmental Texture
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            In generative video, pure air looks digital. Adding microscopic environmental particles breaks up pixel rendering artifacts and adds believable 3D volume:
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Volumetric Sunbeams & Dust Motes</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-2">
                Creates visible shafts of light (God rays) piercing dark chambers.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-cyan-400 font-mono text-xs">
                ENVIRONMENT: Faint airborne dust particles drifting through visible diagonal volumetric shafts of warm sunlight streaming from high cathedral windows.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121216]">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Wet Surfaces & Rain Reflections</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-2">
                Forces the model to calculate realistic specular reflections on asphalt, clothing, and skin.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-cyan-400 font-mono text-xs">
                ENVIRONMENT: Steady light rain with delicate water droplets streaking on car windows. Wet asphalt reflecting red neon signs and street lamps.
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog/ai-video-actions-body-gestures-prompt-guide"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous: Actions & Body Gestures</span>
          </Link>
          <Link
            href="/blog/ai-video-prompt-engineering-master-handbook"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Film className="w-4 h-4" />
            <span>Return to Master 25-Chapter Handbook</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
