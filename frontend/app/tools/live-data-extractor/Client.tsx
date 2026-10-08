"use client";

import React, { useState } from "react";
import { Copy, ExternalLink, Search, CheckCircle2 } from "lucide-react";

type Platform = 
  | "youtube_lasthour"
  | "facebook_latest"
  | "facebook_market"
  | "google_hour"
  | "google_day"
  | "google_week"
  | "google_clean"
  | "google_news"
  | "twitter_live";

const PLATFORMS: Record<Platform, { label: string; group: string; needsKeyword: boolean }> = {
  youtube_lasthour: { label: "YouTube (Last Hour)", group: "YouTube", needsKeyword: true },
  facebook_latest: { label: "Facebook (Latest Feed)", group: "Facebook", needsKeyword: false },
  facebook_market: { label: "Facebook Marketplace (Latest)", group: "Facebook", needsKeyword: true },
  twitter_live: { label: "Twitter / X (Live Tweets)", group: "Twitter", needsKeyword: true },
  google_hour: { label: "Google Search (Last Hour)", group: "Google", needsKeyword: true },
  google_day: { label: "Google Search (Last 24 Hours)", group: "Google", needsKeyword: true },
  google_week: { label: "Google Search (Last Week)", group: "Google", needsKeyword: true },
  google_clean: { label: "Google Search (Clean Web/No AI)", group: "Google", needsKeyword: true },
  google_news: { label: "Google News (Real-time)", group: "Google", needsKeyword: true },
};

export default function LiveDataExtractorClient() {
  const [platform, setPlatform] = useState<Platform>("youtube_lasthour");
  const [keyword, setKeyword] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateURL = () => {
    const q = encodeURIComponent(keyword.trim());
    switch (platform) {
      case "youtube_lasthour":
        return `https://www.youtube.com/results?search_query=${q}&sp=EgQIARAB`;
      case "facebook_latest":
        return `https://www.facebook.com/?sk=h_chr`;
      case "facebook_market":
        return `https://www.facebook.com/marketplace/search/?query=${q}&sort_by=creation_time_descend&days_since_listed=1`;
      case "twitter_live":
        return `https://twitter.com/search?q=${q}&f=live`;
      case "google_hour":
        return `https://www.google.com/search?q=${q}&tbs=qdr:h`;
      case "google_day":
        return `https://www.google.com/search?q=${q}&tbs=qdr:d`;
      case "google_week":
        return `https://www.google.com/search?q=${q}&tbs=qdr:w`;
      case "google_clean":
        return `https://www.google.com/search?q=${q}&udm=14`;
      case "google_news":
        return `https://www.google.com/search?q=${q}&tbm=nws`;
      default:
        return "";
    }
  };

  const finalURL = generateURL();

  const handleCopy = () => {
    navigator.clipboard.writeText(finalURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto border border-slate-200 dark:border-white/[0.05] rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#111116] shadow-xl shadow-slate-200/20 dark:shadow-black/40">
      <div className="space-y-6">
        {/* Platform Selector */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900 dark:text-white">
            Select Platform & Filter
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1A1A21] border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          >
            {Object.entries(PLATFORMS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        {/* Keyword Input */}
        {PLATFORMS[platform].needsKeyword && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 dark:text-white">
              Search Keyword / Topic
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. AI News, iPhone 16..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1A1A21] border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
            </div>
          </div>
        )}

        {/* Generated URL Display */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-900 dark:text-white mb-3 block">
            Generated Real-time URL
          </label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-slate-800 break-all">
            <span className="flex-1 text-sm font-mono text-slate-600 dark:text-slate-400 line-clamp-2">
              {(!PLATFORMS[platform].needsKeyword || keyword.trim() !== "") ? finalURL : "Enter a keyword to generate URL..."}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCopy}
            disabled={PLATFORMS[platform].needsKeyword && !keyword.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          
          <a
            href={(!PLATFORMS[platform].needsKeyword || keyword.trim() !== "") ? finalURL : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-600/20 transition-colors ${
              (PLATFORMS[platform].needsKeyword && !keyword.trim()) ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
}
