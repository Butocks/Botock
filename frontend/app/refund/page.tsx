import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, RefreshCw, AlertCircle, Clock, FileCheck2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Official Refund and Cancellation Policy for Botock platform credits, automated AI generative tools, and bespoke software development services.",
  alternates: {
    canonical: "/refund",
  },
  openGraph: {
    title: "Refund & Cancellation Policy | Botock",
    description:
      "Transparent refund guidelines for Botock AI tools, token quotas, and custom client services.",
    url: "https://botock.app/refund",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="flex-1 flex flex-col py-12 bg-white dark:bg-[#0a0a0c] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/[0.08] pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Customer Protection & Fair Billing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Last Updated: October 5, 2026 • Effective for all Botock.app accounts and services.
          </p>
        </div>

        {/* Overview Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] mb-10 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            At <strong>Botock.app</strong>, we are committed to providing transparent, fair, and reliable generative AI tools and bespoke digital services. Because our platform provides both immediate digital compute resources (GPU generation tokens, image synthesis, video rendering) and tailored client-facing custom engineering, our refund framework is divided into two distinct sections below.
          </p>
        </div>

        <div className="space-y-10 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1: Automated Platform & AI Tools */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.08] pb-2">
              <ShieldCheck className="w-5 h-5 text-violet-500" />
              <h2>1. Platform Subscriptions & Automated AI Credits</h2>
            </div>
            <p>
              Botock provides instant access to computational clusters for AI Video Generation, AI Photo Generation, and cloud utilities. The following rules govern credit packs and subscription tiers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Eligible for Refund</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Accidental Purchases (Zero Usage)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If an order was made by mistake or an unauthorized transaction occurred, and <strong>zero percent (0%) of the credits</strong> have been consumed, you are eligible for a 100% full refund if reported within our time limit.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Non-Refundable Condition</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Consumed Credits / Rendered Media
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Because cloud GPU hours and model inference costs cannot be reclaimed once executed, any credits already spent on video or image generation cannot be refunded.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 text-xs">
              <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Critical Usage & Time Boundaries</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 font-medium leading-relaxed">
                <li>
                  <strong>20% Usage Threshold:</strong> If you have utilized <strong>20% or more</strong> of your package or plan benefits, your account is strictly non-refundable.
                </li>
                <li>
                  <strong>1-Week (7 Days) Limit:</strong> All refund requests for platform purchases must be submitted within <strong>7 days (1 week)</strong> of the transaction date. Requests made after 7 days are automatically ineligible for consideration.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Bespoke Client Services & Custom Engineering */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.08] pb-2">
              <RefreshCw className="w-5 h-5 text-indigo-500" />
              <h2>2. Custom Development & Tailored AI Engineering Services</h2>
            </div>
            <p>
              For clients engaging with Botock for bespoke development, custom model pipelines, enterprise integrations, or tailored web utilities, our project delivery operates with direct consultation:
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  A. Discovery & Planning Phase (Refund Available)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  During initial requirement discovery and architectural planning (amna-samna discussion), we formulate detailed project specifications and deliverables. If at the end of this planning stage you are not satisfied with the proposed plan and choose not to move forward, a <strong>full refund of the advance project deposit</strong> will be granted.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  B. Post-Planning / Active Execution Phase (Strictly Non-Refundable)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Once you formally approve the project plan and active engineering commences (including infrastructure provisioning, developer hours, and pipeline implementation), payments become <strong>strictly non-refundable</strong>. Dedicated developer resources committed to your project cannot be reversed.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How to Submit a Refund Claim */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.08] pb-2">
              <Mail className="w-5 h-5 text-violet-500" />
              <h2>3. How to Submit a Refund Claim</h2>
            </div>
            <p>
              To file a formal refund inquiry, please email our support and accounting desk with the following details:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Your registered Botock account email address.</li>
              <li>Transaction ID or payment invoice reference.</li>
              <li>Date of purchase and package/service name.</li>
              <li>Clear description of the reason for the refund request.</li>
            </ul>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Customer Billing & Grievance Desk
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Reviewed and processed within 3 to 5 business days.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="mailto:services@botock.app?subject=Refund%20Request"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors shadow-md"
                >
                  Email services@botock.app
                </a>
                <Link
                  href="/complaint"
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  File Formal Ticket
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
