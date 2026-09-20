"use client";

import Link from "next/link";
import { Check, Zap, Sparkles, Shield, Crown } from "lucide-react";
import AdBanner from "../components/AdBanner";

export default function PricingPage() {
  const plans = [
    {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      desc: "Perfect for testing and casual daily content creation.",
      badge: "Get Started",
      highlight: false,
      features: [
        "3 AI Videos / Day (Omni 1.1 Flash 360p)",
        "5 AI Photos / Day",
        "24-Hour Media Storage (with Google Drive Export)",
        "Access to in-browser Video & Photo Studio",
        "Standard generation queue",
        "Supported by non-intrusive ads",
      ],
      ctaText: "Start Creating Free",
      ctaHref: "/tools/video-generator",
    },
    {
      name: "Tools Unlimited",
      price: "$5",
      period: "per month",
      desc: "For professionals who need fast, ad-free utility tools every day.",
      badge: "Popular for Utilities",
      highlight: false,
      features: [
        "100% Ad-Free Experience across entire site",
        "Unlimited PDF Tools (Merge, Split, OCR, Convert)",
        "Unlimited Image & Video Studio usage",
        "Fast server-side processing",
        "Standard AI Video quota (3 videos/day)",
        "Email support",
      ],
      ctaText: "Upgrade to Tools Pro",
      ctaHref: "/login?plan=tools",
    },
    {
      name: "AI Creator Pro",
      price: "$15",
      period: "per month",
      desc: "Maximum power for content creators, agencies, and marketers.",
      badge: "Most Popular",
      highlight: true,
      features: [
        "1,000 AI Generation Credits / month",
        "Unlock Veo Lite, Veo Fast & Veo Quality models",
        "720p & 1080p Full HD video generations",
        "Multi-scene Project Continuation",
        "Photo-to-Video & Image Reference inputs",
        "30-Day Video Retention in Library",
        "VIP Priority Queue (Zero waiting time)",
        "100% Ad-Free on all tools & generators",
      ],
      ctaText: "Get Pro ($15/mo)",
      ctaHref: "/login?plan=pro",
    },
    {
      name: "Annual VIP",
      price: "$100",
      period: "per year",
      desc: "Best value for serious creators. Save $80/year with 12,000 credits.",
      badge: "Best Value (Save 45%)",
      highlight: false,
      features: [
        "12,000 AI Credits / year",
        "Everything in AI Creator Pro",
        "Full commercial usage rights",
        "Direct Google Drive cloud auto-sync",
        "Highest priority GPU queue",
        "24/7 dedicated support",
      ],
      ctaText: "Get Annual VIP ($100/yr)",
      ctaHref: "/login?plan=annual",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          Flexible Pricing
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-4 mb-4">
          Choose the Perfect Plan for Your Creative Workflow
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Start for free with 3 daily videos and 100+ creative utilities. Upgrade anytime for higher resolution, advanced Veo models, and ad-free speed.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
              p.highlight
                ? "glass-card border-2 border-primary shadow-[0_0_30px_rgba(139,92,246,0.3)] scale-105 z-10"
                : "border border-border/50 bg-card/40 hover:border-border transition-colors"
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Crown className="w-3 h-3" />
                {p.badge}
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{p.desc}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-xs text-muted-foreground">/{p.period}</span>
                </div>
              </div>

              <div className="space-y-2.5 mb-8 border-t border-border/40 pt-6">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={p.ctaHref}
              className={`w-full py-2.5 rounded-xl font-medium text-xs text-center transition-all ${
                p.highlight
                  ? "bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/30"
                  : "border border-border/60 bg-background/80 hover:bg-background text-foreground"
              }`}
            >
              {p.ctaText}
            </Link>
          </div>
        ))}
      </div>

      {/* Credit Matrix Table */}
      <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 sm:p-8 border border-border/50 mb-12">
        <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Transparent Credit Consumption Table
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          Credits are only deducted on successful video generations. No hidden surprises.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="py-2.5 font-semibold">AI Model</th>
                <th className="py-2.5 font-semibold">Resolution</th>
                <th className="py-2.5 font-semibold">Duration</th>
                <th className="py-2.5 font-semibold">Cost (Credits)</th>
                <th className="py-2.5 font-semibold">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-foreground">
              <tr>
                <td className="py-2.5 font-medium">Omni 1.1 Flash (Recommended)</td>
                <td className="py-2.5 text-muted-foreground">360p</td>
                <td className="py-2.5 text-muted-foreground">4 - 6s</td>
                <td className="py-2.5 font-bold text-emerald-400">4 - 5 Credits</td>
                <td className="py-2.5">Free & Pro</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Omni 1.1 Flash</td>
                <td className="py-2.5 text-muted-foreground">360p</td>
                <td className="py-2.5 text-muted-foreground">8 - 10s</td>
                <td className="py-2.5 font-bold text-emerald-400">6 - 7 Credits</td>
                <td className="py-2.5">Free & Pro</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Omni 1.1 Flash HD</td>
                <td className="py-2.5 text-muted-foreground">720p</td>
                <td className="py-2.5 text-muted-foreground">6 - 10s</td>
                <td className="py-2.5 font-bold text-primary">10 - 15 Credits</td>
                <td className="py-2.5">Pro ($15/mo)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Veo Lite</td>
                <td className="py-2.5 text-muted-foreground">720p</td>
                <td className="py-2.5 text-muted-foreground">8s</td>
                <td className="py-2.5 font-bold text-primary">10 Credits</td>
                <td className="py-2.5">Pro ($15/mo)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Veo Fast</td>
                <td className="py-2.5 text-muted-foreground">720p</td>
                <td className="py-2.5 text-muted-foreground">8s</td>
                <td className="py-2.5 font-bold text-primary">20 Credits</td>
                <td className="py-2.5">Pro ($15/mo)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Veo Quality Studio</td>
                <td className="py-2.5 text-muted-foreground">720p / 1080p</td>
                <td className="py-2.5 text-muted-foreground">8s</td>
                <td className="py-2.5 font-bold text-secondary">50 - 100 Credits</td>
                <td className="py-2.5">Pro ($15/mo)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AdBanner slotId="pricing-bottom-ad" format="horizontal" />
    </div>
  );
}
