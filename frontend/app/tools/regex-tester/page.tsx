import { Metadata } from "next";
import RegexTesterClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Online Regular Expression (Regex) Tester & Debugger | Botock",
  description:
    "Test and debug JavaScript regular expressions in real-time. Live match highlighting, capture group extraction, and regex flag toggles.",
  keywords: [
    "regex tester",
    "regular expression debugger",
    "regex online",
    "javascript regex test",
    "regex capture groups",
  ],
  openGraph: {
    title: "Online Regular Expression (Regex) Tester & Debugger | Botock",
    description:
      "Test and debug JavaScript regular expressions in real-time with zero server latency.",
    type: "website",
  },
};

export default function RegexTesterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Regular Expression (Regex) Tester",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Real-time client-side regular expression tester with capture group inspection.",
  };

  return (
    <ToolErrorBoundary toolName="Regex Tester">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RegexTesterClient />
    </ToolErrorBoundary>
  );
}
