"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Server,
  EyeOff,
  Trash2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Zap,
} from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="flex-1 flex flex-col py-12">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Security & Trust Center</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white mb-4">
            Security & Privacy by Design
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Botock is engineered with a strict privacy-first foundation. Discover how we protect your media files, customer data, and generative assets with client-side isolation and automated purging.
          </p>
        </div>

        {/* 4 Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">In-Browser Client Isolation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard PDF, image, and video utilities process locally using WebAssembly and HTML5 Canvas. Your source documents are never uploaded to any remote server.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] text-[11px] text-emerald-400 font-semibold">
              ✓ 100% Zero-Cloud Footprint
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">24h Automated Purging</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When you generate AI videos or images, media is retained for strictly 24 hours to give you time to download or bridge into the Video Studio. After 24h, it is irreversibly wiped.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] text-[11px] text-violet-400 font-semibold">
              ✓ Automated Daily Cron Purge
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AES-256 & TLS 1.3</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All communications between client and server are encrypted using modern TLS 1.3 with Perfect Forward Secrecy. Database records are secured with AES-256 encryption.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] text-[11px] text-blue-400 font-semibold">
              ✓ Enterprise Encryption Standard
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Supabase JWT & RLS</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Supabase Row-Level Security (RLS) policies enforce cryptographic isolation between user accounts. Even internal backend queries cannot read another user's generation tokens.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] text-[11px] text-amber-400 font-semibold">
              ✓ Row-Level Cryptographic Isolation
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Sections */}
        <div className="max-w-4xl mx-auto space-y-8 mb-16">
          <div className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Zero-Training Guarantee</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Botock has a strict binding policy: <strong className="text-white">We never use your uploaded documents, photos, or prompts to train public AI models</strong>. Your creative prompts and proprietary documents remain exclusively your intellectual property.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                No training on confidential user PDFs, spreadsheets, or images.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Ephemeral API sessions isolated per user request.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Immediate unlinking upon manual deletion from "My Library".
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-violet-400" />
              <span>Responsible Vulnerability Disclosure</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              We welcome reports from independent cybersecurity researchers. If you discover a potential security flaw or vulnerability in any of our web services, please notify our security team directly:
            </p>
            <div className="p-4 rounded-xl bg-black/40 border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Security Contact</div>
                <div className="text-xs text-violet-400 font-mono">security@botock.ai</div>
              </div>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-xs font-bold text-slate-900 dark:text-white transition-colors"
              >
                Submit PGP Encrypted Report →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
