import { Metadata } from "next";
import CronGeneratorClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Cron Expression Generator & Explainer Online | Botock",
  description:
    "Visually build 5-part cron schedules with real-time human readable descriptions, common frequency presets, and one-click clipboard copying.",
  keywords: [
    "cron generator",
    "cron expression builder",
    "crontab generator",
    "cron schedule explainer",
    "cron job timer",
  ],
  openGraph: {
    title: "Cron Expression Generator & Explainer Online | Botock",
    description:
      "Visually build 5-part cron schedules with real-time plain English explanations.",
    type: "website",
  },
};

export default function CronGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Cron Expression Generator",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side visual cron expression generator and schedule explainer.",
  };

  return (
    <ToolErrorBoundary toolName="Cron Generator">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CronGeneratorClient />
    </ToolErrorBoundary>
  );
}
