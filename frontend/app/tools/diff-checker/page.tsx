import { Metadata } from "next";
import DiffCheckerClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Online Text & Code Diff Checker - Side by Side Comparison | Botock",
  description:
    "Compare two texts or source code snippets side-by-side. Highlight line additions, deletions, unified diff patches with zero server lag.",
  keywords: [
    "diff checker",
    "text compare",
    "code diff tool",
    "side by side diff",
    "unified diff viewer",
    "file difference",
  ],
  openGraph: {
    title: "Online Text & Code Diff Checker - Side by Side Comparison | Botock",
    description:
      "Compare two texts or source code snippets side-by-side. Highlight line additions, deletions, unified diff patches.",
    type: "website",
  },
};

export default function DiffCheckerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Text & Code Diff Checker",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side visual difference comparison engine for code and text.",
  };

  return (
    <ToolErrorBoundary toolName="Diff Checker">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DiffCheckerClient />
    </ToolErrorBoundary>
  );
}
