import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://botock.com"),
  title: {
    default: "Botock — All-in-One AI Video, Image Generator & Creative Tools",
    template: "%s | Botock",
  },
  description:
    "Generate cinematic AI videos, photorealistic images, edit media in browser, and access 100+ free PDF, video, and image utilities with Botock.",
  keywords: [
    "AI Video Generator",
    "Free Text to Video AI",
    "Photo to Video AI",
    "AI Image Generator",
    "Online Video Editor",
    "Free PDF Tools",
    "Image Converter",
    "Video Cutter",
    "Botock AI",
  ],
  authors: [{ name: "Botock Team" }],
  creator: "Botock",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://botock.com",
    title: "Botock — Next-Gen AI Video & Creative Utilities SaaS",
    description:
      "Turn prompts and photos into cinematic videos and stunning AI photos. 100+ free creative tools included.",
    siteName: "Botock",
  },
  twitter: {
    card: "summary_large_image",
    title: "Botock — All-in-One AI Creative Suite",
    description: "Generate cinematic AI videos and photos in seconds with Botock.",
    creator: "@botock_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Botock",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "All-in-one platform for AI Video Generation, Photo Generation, in-browser Video Studio, and 100+ multimedia tools.",
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('botock-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
