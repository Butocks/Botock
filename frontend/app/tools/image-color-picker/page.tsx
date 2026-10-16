import type { Metadata } from "next";
import Link from "next/link";
import { Pipette, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

const ImageColorPickerClient = dynamic(() => import("./Client"), {
  loading: () => (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Loading Color Picker Tool...
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Color Picker Online from Image – Extract HEX & RGB | Botock",
  description:
    "Pick colors from any image or photo online for free. Use the interactive pixel eyedropper to get exact HEX, RGB, and HSL values with custom palette generation and zero server uploads.",
  keywords: [
    "color picker online from image",
    "image color picker",
    "extract color from image",
    "hex color picker from picture",
    "rgb code from image online free",
    "eyedropper tool online",
    "photo color palette generator",
    "botock tools",
  ],
  alternates: {
    canonical: "/tools/image-color-picker",
  },
  openGraph: {
    title: "Color Picker Online from Image – Extract HEX & RGB | Botock",
    description:
      "Interactive pixel eyedropper extracts exact HEX, RGB, and HSL codes from any photo. 100% Free, zero server uploads.",
    url: "https://botock.app/tools/image-color-picker",
    siteName: "Botock AI",
    type: "website",
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Picker Online from Image | Botock",
    description: "Extract exact HEX and RGB color values from any photo right in your browser.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function ImageColorPickerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Botock Free Image Color Picker & Eyedropper",
        url: "https://botock.app/tools/image-color-picker",
        applicationCategory: "DesignApplication",
        operatingSystem: "All",
        description: "Extract HEX, RGB, and HSL color values and generate color palettes from images.",
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
          { "@type": "ListItem", position: 3, name: "Color Picker", item: "https://botock.app/tools/image-color-picker" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I extract a color from my image?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Upload your image and hover over any pixel to see its real-time color swatch. Click directly on the pixel to lock the color and copy its HEX, RGB, or HSL code to your clipboard.",
            },
          },
          {
            "@type": "Question",
            name: "Does this color picker support transparent PNG or WebP images?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Botock accurately renders PNG, WebP, JPG, SVG, and AVIF formats with full alpha transparency support.",
            },
          },
          {
            "@type": "Question",
            name: "Can I generate a full color palette from a photo?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Every color you click is automatically appended to your personal session palette history. You can click on previous swatches to retrieve their color values at any time.",
            },
          },
          {
            "@type": "Question",
            name: "Are my photos uploaded to a cloud server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No! All image rendering and pixel inspection runs client-side on an HTML5 canvas in your browser. Your images are never stored or transferred to any remote servers.",
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 text-fuchsia-500 text-xs font-bold mb-4">
          <Pipette className="w-4 h-4" />
          <span>Interactive Eyedropper & Palette • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
          Color Picker Online from Image
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Hover and click on any photo to inspect pixel colors. Get instant HEX, RGB, and HSL color values and generate harmonious palettes in your browser.
        </p>
      </div>

      {/* Interactive Tool Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-8 shadow-xl">
          <ToolErrorBoundary toolName="Image Color Picker">
            <ImageColorPickerClient />
          </ToolErrorBoundary>
        </div>

        {/* Structured SEO & Internal Link Footer Section */}
        <ToolSeoSection
          toolName="Image Color Picker"
          category="Design Utility"
          description="Botock Free Online Image Color Picker and Eyedropper tool empowers graphic designers, web developers, and UI/UX artists to extract precise color palettes from artwork, logos, and photographs. By loading images into local HTML5 canvas context, pixel values are computed client-side with zero network latency and maximum privacy."
          steps={[
            {
              title: "Upload Any Photo",
              description: "Drop your JPG, PNG, WebP, or SVG graphics file into the color inspector.",
            },
            {
              title: "Hover & Pick Pixels",
              description: "Move your cursor across the image canvas. Click to lock any color into your palette.",
            },
            {
              title: "Copy HEX & RGB Codes",
              description: "Click any color code card to copy formatted HEX (#FFFFFF), RGB, or HSL to your clipboard.",
            },
          ]}
          features={[
            {
              title: "Precision Pixel Eyedropper",
              description: "Inspect individual pixels with sub-pixel sampling accuracy for UI and CSS design.",
            },
            {
              title: "HEX, RGB & HSL Formats",
              description: "Copy standard CSS color formats ready to paste directly into Figma, Photoshop, or Tailwind.",
            },
            {
              title: "Local Canvas Privacy",
              description: "Your brand assets and client mockups remain in your browser memory and are never uploaded.",
            },
          ]}
          faqs={[
            {
              question: "Can I use this eyedropper tool on mobile?",
              answer: "Yes, you can tap anywhere on the image preview on your smartphone or tablet to sample colors effortlessly.",
            },
            {
              question: "How many colors can I save in my palette?",
              answer: "You can click and collect up to 10 distinct color swatches per session and revisit them whenever needed.",
            },
            {
              question: "Does the tool support color picking from desktop screen?",
              answer: "On supported modern browsers (Chrome, Edge, Opera), click the Eyedropper Tool button to pick colors from anywhere on your computer display.",
            },
          ]}
          relatedTools={[
            { name: "Image Filters", href: "/tools/image-filters" },
            { name: "Image Resize", href: "/tools/image-resize" },
            { name: "Crop Image", href: "/tools/image-crop" },
            { name: "Remove Background", href: "/tools/image-remove-bg" },
          ]}
        />
      </main>
    </div>
  );
}
