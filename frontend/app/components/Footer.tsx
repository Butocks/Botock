"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Sparkles,
  Scissors,
  Image as ImageIcon,
  FileText,
  Video,
  Grid,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#07050d] text-slate-600 dark:text-slate-300 mt-auto select-none transition-colors">
      {/* 1. Status Bar */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.015]">
        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-slate-500 dark:text-slate-400">System Health:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              All AI & Creative Pipelines Operational
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs">
            <Link
              href="/pricing"
              className="text-violet-600 dark:text-violet-400 hover:underline font-bold transition-colors"
            >
              Get Pro →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links: Balanced 5-Column Grid */}
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 xl:gap-12">
          {/* Column 1: Brand & Socials */}
          <div className="space-y-4 lg:pr-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Botock Logo"
                  width={40}
                  height={40}
                  className="object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  Botock
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold -mt-1">
                  AI & Creative Platform
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The unified creative operating system. Turn text and photos into cinematic videos with Omni 1.1, synthesize art with Nano Banana, and access 100+ in-browser utilities.
            </p>

            {/* Official Social Icons */}
            <div className="pt-1">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Official Communities
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com/botock"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                <a
                  href="https://instagram.com/botock_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] hover:text-pink-600 dark:hover:text-pink-400 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com/company/botock"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] hover:text-sky-600 dark:hover:text-sky-400 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                <a
                  href="https://tiktok.com/@botock_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] hover:text-teal-600 dark:hover:text-teal-400 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>

                <a
                  href="https://x.com/botock_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] hover:text-black dark:hover:text-white text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: AI Studios */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
              AI Studios
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/tools/video-generator"
                  className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5 text-violet-500" />
                  <span>AI Video Generator</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/image-generator"
                  className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Image Studio</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/video-editor"
                  className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <Scissors className="w-3.5 h-3.5 text-sky-500" />
                  <span>Video Studio Editor</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Credit Pricing Matrix
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 100+ Utilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
              100+ Utilities
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/tools?cat=pdf"
                  className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>PDF Suite (34)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?cat=image"
                  className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Image Suite (30)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?cat=video"
                  className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5 text-sky-500" />
                  <span>Video Suite (25)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>All 100+ Creative Tools</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
              Company
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Blog & Guides</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-violet-500" />
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/join-us"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Join Us</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 rounded font-bold">Hiring</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/complaint"
                  className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>Complaint Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Security & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
              Security & Legal
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/security"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Security Trust Center</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security#compliance" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Compliance & Disclosures
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Bar: Copyright & Theme Toggle */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-slate-800 dark:text-white">Botock Inc.</span> All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Theme:</span>
              <ThemeToggle />
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-white/[0.1] hidden sm:block" />

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/blog" className="hover:text-slate-800 dark:hover:text-white transition-colors">Blog</Link>
              <Link href="/contact" className="hover:text-slate-800 dark:hover:text-white transition-colors">Contact</Link>
              <Link href="/security" className="hover:text-slate-800 dark:hover:text-white transition-colors">Security</Link>
              <Link href="/pricing" className="hover:text-slate-800 dark:hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
