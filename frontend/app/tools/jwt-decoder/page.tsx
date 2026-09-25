import { Metadata } from "next";
import JwtDecoderClient from "./Client";
import { ToolErrorBoundary } from "@/app/components/ToolErrorBoundary";

export const metadata: Metadata = {
  title: "Online JWT Decoder - Inspect JSON Web Token Safely | Botock",
  description:
    "Decode JSON Web Tokens (JWT) client-side with complete privacy. Inspect header algorithms, payload claims, expiration timestamp, and signature without server logs.",
  keywords: [
    "jwt decoder",
    "json web token decoder",
    "jwt viewer online",
    "jwt parser",
    "decode jwt token",
  ],
  openGraph: {
    title: "Online JWT Decoder - Inspect JSON Web Token Safely | Botock",
    description:
      "Decode JSON Web Tokens (JWT) client-side with complete privacy.",
    type: "website",
  },
};

export default function JwtDecoderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JSON Web Token (JWT) Decoder",
    operatingSystem: "All",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Client-side JWT decoder for inspectable header and claim tokens.",
  };

  return (
    <ToolErrorBoundary toolName="JWT Decoder">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JwtDecoderClient />
    </ToolErrorBoundary>
  );
}
