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
  metadataBase: new URL("https://botock.app"),
  title: {
    default: "Botock | AI Video, Image & Productivity Tools",
    template: "%s | Botock",
  },
  description:
    "Turn prompts and photos into cinematic AI videos, synthesize photorealistic images, edit media in-browser, and process PDF documents locally with Botock.",
  keywords: [
    "AI Video Generator",
    "Text to Video AI",
    "Photo to Video AI",
    "AI Image Generator",
    "Online Video Editor",
    "Client-Side PDF Tools",
    "Image Converter",
    "Video Cutter",
    "Botock",
  ],
  authors: [{ name: "Botock Team", url: "https://botock.app" }],
  creator: "Botock",
  publisher: "Botock",
  alternates: {
    canonical: "https://botock.app",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://botock.app",
    title: "Botock | AI Video, Image & Productivity Tools",
    description:
      "Turn prompts and photos into cinematic AI videos, synthesize photorealistic images, edit media in-browser, and process PDF documents locally with Botock.",
    siteName: "Botock",
    images: [
      {
        url: "https://botock.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Botock AI & Creative Tools Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Botock | AI Video, Image & Productivity Tools",
    description:
      "Turn prompts and photos into cinematic AI videos, synthesize photorealistic images, and process documents with Botock.",
    creator: "@botock_ai",
    images: ["https://botock.app/og-image.jpg"],
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
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://botock.app/#organization",
        name: "Botock",
        url: "https://botock.app",
        logo: {
          "@type": "ImageObject",
          url: "https://botock.app/logo.png",
        },
        sameAs: ["https://www.facebook.com/botockapp/"],
      },
      {
        "@type": "WebSite",
        "@id": "https://botock.app/#website",
        name: "Botock",
        url: "https://botock.app",
        publisher: {
          "@id": "https://botock.app/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://botock.app/tools?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Botock",
        url: "https://botock.app",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Unified platform for AI Video Generation, Photo Generation, In-Browser Video Studio, and client-side multimedia utilities.",
      },
    ],
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
