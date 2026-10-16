import React from "react";
import Link from "next/link";
import { CheckCircle2, HelpCircle, ShieldCheck, Zap, Lock, ArrowRight } from "lucide-react";
import { FaqItem } from "./ToolJsonLd";

export interface ToolStep {
  title: string;
  description: string;
}

export interface RelatedTool {
  name: string;
  href: string;
}

export interface ToolSeoSectionProps {
  toolName: string;
  headline?: string;
  tagline?: string;
  category?: string;
  description?: string;
  steps?: ToolStep[];
  features?: { title: string; description: string }[];
  faqs?: FaqItem[];
  relatedTools?: RelatedTool[];
}

export function ToolSeoSection({
  toolName,
  headline,
  tagline,
  category,
  description,
  steps,
  features,
  faqs,
  relatedTools,
}: ToolSeoSectionProps) {
  const defaultSteps: ToolStep[] = [
    {
      title: "1. Upload or Select File",
      description: "Drop your files directly into the browser or click the upload zone to browse from your device.",
    },
    {
      title: "2. Adjust Settings & Options",
      description: "Customize properties, preview changes live, or let our AI auto-tune the optimal configuration.",
    },
    {
      title: "3. Export & Download Instantly",
      description: "Download your processed file instantly with zero watermarks and complete client-side data privacy.",
    },
  ];

  const defaultFeatures = [
    {
      title: "100% Free & Unlimited",
      description: "Process your media without restrictive quotas, paywalls, or hidden subscription costs.",
      icon: Zap,
    },
    {
      title: "Zero Server Uploads",
      description: "All conversions happen locally in your browser with WebAssembly for complete privacy.",
      icon: ShieldCheck,
    },
    {
      title: "High-Quality Lossless Output",
      description: "Retain crystal clear audio, pixel-perfect visuals, and lossless document structure.",
      icon: Lock,
    },
  ];

  const effectiveSteps = steps && steps.length > 0 ? steps : defaultSteps;
  const effectiveFaqs =
    faqs && faqs.length > 0
      ? faqs
      : [
          {
            question: `Is ${toolName} free to use?`,
            answer: `Yes, ${toolName} on Botock is completely free to use with no subscription required and no hidden watermarks.`,
          },
          {
            question: `Do I need to install any software or plugins?`,
            answer: `No installation is needed. ${toolName} runs directly in your modern web browser using client-side WebAssembly technology.`,
          },
          {
            question: `Are my files stored on your servers?`,
            answer: `No. We prioritize your privacy. All processing takes place locally in your browser memory and files never touch remote storage.`,
          },
        ];

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.08] max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-14">
      {/* Overview Headline */}
      <div className="space-y-3 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {headline || `How to Use ${toolName} Online`}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {tagline ||
            description ||
            `Experience seamless, privacy-first processing with ${toolName}. Enjoy unlimited free access with fast in-browser execution.`}
        </p>
      </div>

      {/* 3 Step Visual Workflow */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick 3-Step Walkthrough
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {effectiveSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-extrabold text-sm flex items-center justify-center">
                  {idx + 1}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {step.title.replace(/^\d+\.\s*/, "")}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Feature Highlights */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Why Choose Botock {toolName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {feat.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-500" />
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="space-y-3">
          {effectiveFaqs.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-slate-200 dark:border-white/[0.08] rounded-2xl bg-white dark:bg-[#121215] overflow-hidden transition-all [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-2 p-5 text-slate-900 dark:text-white font-bold text-sm sm:text-base select-none">
                <span>{faq.question}</span>
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ↓
                </span>
              </summary>
              <p className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Companion Tools */}
      {relatedTools && relatedTools.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.08] space-y-3">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Explore Related Workflows
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {relatedTools.map((rel, idx) => (
              <Link
                key={idx}
                href={rel.href}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
              >
                <span>{rel.name}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
