import { Metadata } from "next";
import WordCounterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Online Word Counter & Text Statistics Analyzer | Botock",
  description:
    "Free online word and character counter. Calculate words, characters, sentences, paragraphs, reading time, speaking time, and keyword density directly in your browser.",
  keywords: [
    "word counter",
    "character counter",
    "word count tool",
    "reading time calculator",
    "text analyzer",
    "keyword density checker",
  ],
  openGraph: {
    title: "Online Word Counter & Text Statistics Analyzer | Botock",
    description:
      "Free online word and character counter. Calculate words, characters, sentences, paragraphs, reading time, speaking time, and keyword density.",
    type: "website",
  },
};

export default function WordCounterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Word Counter & Text Statistics Analyzer",
    operatingSystem: "All",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Count words, characters, reading time, speaking time, and check keyword density in your browser with zero latency.",
  };

  return (
    <ToolErrorBoundary toolName="Word Counter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WordCounterClient />
    </ToolErrorBoundary>
  );
}
